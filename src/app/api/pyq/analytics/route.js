import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  calculateStudyStreak,
  examMatchesTrack,
  normalizeTrack,
} from "@/lib/analyticsHelpers";
import { FEATURES, canUseFeature, getProfileAccessProfile, getUserAccessContext } from "@/lib/accessControl";

const MIN_CHAPTER_ATTEMPTS = 5;
const INVALID_CHAPTERS = new Set(["", "unmapped", "unknown", "invalid", "null", "undefined"]);
const SUBJECT_ORDER = {
  JEE: ["Physics", "Chemistry", "Mathematics", "Maths"],
  NEET: ["Physics", "Chemistry", "Biology", "Botany", "Zoology"],
};

function normalizeChapter(chapter) {
  const value = String(chapter || "").trim();
  return INVALID_CHAPTERS.has(value.toLowerCase()) ? "" : value;
}

function getChapterStatus(accuracy, attempted) {
  if (attempted < MIN_CHAPTER_ATTEMPTS) return "Not enough data";
  if (accuracy < 60) return "Needs Practice";
  if (accuracy < 80) return "Good";
  return "Strong";
}

function sortSubjects(subjects, track) {
  const order = SUBJECT_ORDER[track] || SUBJECT_ORDER.JEE;
  return [...subjects].sort((a, b) => {
    const indexA = order.indexOf(a.subject);
    const indexB = order.indexOf(b.subject);
    const rankA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const rankB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    if (rankA !== rankB) return rankA - rankB;
    return a.subject.localeCompare(b.subject);
  });
}

function sortChapters(chapters) {
  return [...chapters].sort((a, b) => {
    if (a.hasEnoughData !== b.hasEnoughData) return a.hasEnoughData ? -1 : 1;
    if (a.hasEnoughData && b.hasEnoughData && a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    if (a.attempted !== b.attempted) return b.attempted - a.attempted;
    return a.chapter.localeCompare(b.chapter);
  });
}

function pickStrongestChapter(chapters) {
  return chapters
    .filter((chapter) => chapter.hasEnoughData)
    .sort((a, b) => b.accuracy - a.accuracy || b.attempted - a.attempted || a.chapter.localeCompare(b.chapter))[0] || null;
}

function pickNeedsPracticeChapter(chapters) {
  return chapters
    .filter((chapter) => chapter.hasEnoughData)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted || a.chapter.localeCompare(b.chapter))[0] || null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const track = normalizeTrack(searchParams.get("track") || "JEE");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileAccessProfile(userId);
    if (track !== profile.examTrack) {
      return NextResponse.json(
        { error: "EXAM_TRACK_MISMATCH", message: `Your account has access to ${profile.examTrack} analytics only.` },
        { status: 403 }
      );
    }

    const access = await getUserAccessContext({ userId, examTrack: track });
    const permission = canUseFeature(access, FEATURES.PYQ_ANALYTICS);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: "PRO_REQUIRED",
          message: "PYQ Analytics is available with PrepZii Pro.",
          upgradeUrl: permission.upgradeUrl || "/pro",
        },
        { status: 403 }
      );
    }

    const { data: rawPyqAttempts, error: pyqError } = await supabaseAdmin
      .from("pyq_attempts")
      .select("id, question_id, selected_option, is_correct, attempted_at, pyq_questions(exam, subject, chapter)")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: true });

    if (pyqError) {
      return NextResponse.json({ error: pyqError.message }, { status: 500 });
    }

    const allPyqAttempts = rawPyqAttempts || [];
    const pyqAttempts = allPyqAttempts.filter((attempt) => examMatchesTrack(attempt.pyq_questions?.exam, track));

    const attempted = pyqAttempts.length;
    const correctAnswers = pyqAttempts.filter((attempt) => attempt.is_correct).length;
    const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : null;

    const subjectMap = {};
    const chapterMap = {};

    pyqAttempts.forEach((attempt) => {
      const subject = String(attempt.pyq_questions?.subject || "").trim();
      if (!subject) return;

      if (!subjectMap[subject]) {
        subjectMap[subject] = { subject, attempted: 0, correct: 0 };
      }

      subjectMap[subject].attempted += 1;
      if (attempt.is_correct) subjectMap[subject].correct += 1;

      const chapter = normalizeChapter(attempt.pyq_questions?.chapter);
      if (!chapter) return;

      const chapterKey = `${subject}::${chapter}`;
      if (!chapterMap[chapterKey]) {
        chapterMap[chapterKey] = { chapter, subject, attempted: 0, correct: 0 };
      }

      chapterMap[chapterKey].attempted += 1;
      if (attempt.is_correct) chapterMap[chapterKey].correct += 1;
    });

    const subjects = sortSubjects(Object.values(subjectMap).map((subject) => ({
      subject: subject.subject,
      attempted: subject.attempted,
      solved: subject.attempted,
      correct: subject.correct,
      accuracy: subject.attempted > 0 ? Math.round((subject.correct / subject.attempted) * 100) : null,
    })), track);

    const chapters = sortChapters(Object.values(chapterMap).map((chapter) => {
      const chapterAccuracy = chapter.attempted > 0 ? Math.round((chapter.correct / chapter.attempted) * 100) : null;
      const hasEnoughData = chapter.attempted >= MIN_CHAPTER_ATTEMPTS;
      return {
        chapter: chapter.chapter,
        subject: chapter.subject,
        attempted: chapter.attempted,
        correct: chapter.correct,
        incorrect: chapter.attempted - chapter.correct,
        accuracy: chapterAccuracy,
        hasEnoughData,
        status: getChapterStatus(chapterAccuracy ?? 0, chapter.attempted),
      };
    }));

    const strongestChapter = pickStrongestChapter(chapters);
    const needsPracticeChapter = pickNeedsPracticeChapter(chapters);
    const streak = calculateStudyStreak(pyqAttempts.map((attempt) => attempt.attempted_at));

    return NextResponse.json({
      attempted,
      totalAttempts: attempted,
      totalQuestions: attempted,
      correctAnswers,
      wrongAnswers: attempted - correctAnswers,
      accuracy,
      avgTimePerQuestionSeconds: null,
      avgTimePerQuestionLabel: null,
      timing: {
        available: false,
        reason: "PYQ attempts do not currently store per-question or per-session duration.",
        recommendedTable: "pyq_attempts",
        recommendedColumn: "time_spent_seconds",
      },
      subjects,
      chapters,
      strongestChapter,
      needsPracticeChapter,
      minimumChapterAttempts: MIN_CHAPTER_ATTEMPTS,
      streak,
      dataSources: {
        attempts: "pyq_attempts",
        questions: "pyq_questions",
        timestamp: "pyq_attempts.attempted_at",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
