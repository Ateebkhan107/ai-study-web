import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MIN_CHAPTER_ATTEMPTS = 3;
const MAX_WEAK_CHAPTERS = 5;
const RECENT_TEST_LIMIT = 5;
const UNMAPPED_CHAPTERS = new Set([
  "unmapped",
  "unknown",
  "invalid",
  "n/a",
  "na",
  "none",
  "null",
  "-",
]);

function percent(numerator, denominator) {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator <= 0
  ) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeSubject(subject) {
  const value = cleanText(subject);
  if (!value) return "General";
  const lower = value.toLowerCase();
  if (lower === "maths" || lower === "mathematics") return "Mathematics";
  if (lower === "physics") return "Physics";
  if (lower === "chemistry") return "Chemistry";
  if (lower === "biology") return "Biology";
  return value;
}

function isValidChapter(value) {
  const chapter = cleanText(value);
  return Boolean(chapter) && !UNMAPPED_CHAPTERS.has(chapter.toLowerCase());
}

export function computeRecentPerformanceTrend(attemptsChronological) {
  if (!Array.isArray(attemptsChronological) || attemptsChronological.length < 3) {
    return "insufficient_data";
  }

  const values = attemptsChronological
    .map((attempt) => {
      if (!attempt || typeof attempt !== "object") return null;

      const attempted = Number(attempt.attempted);
      const correct = Number(attempt.correct_answers);
      if (
        Number.isFinite(attempted) &&
        attempted > 0 &&
        Number.isFinite(correct) &&
        correct >= 0
      ) {
        return percent(correct, attempted);
      }

      const totalMarks = Number(attempt.total_marks);
      const score = Number(attempt.score);
      if (
        Number.isFinite(totalMarks) &&
        totalMarks > 0 &&
        Number.isFinite(score)
      ) {
        return percent(score, totalMarks);
      }

      return null;
    })
    .filter((val) => val !== null);

  if (values.length < 3) {
    return "insufficient_data";
  }

  let earlierAvg;
  let recentAvg;

  if (values.length === 3) {
    earlierAvg = values[0];
    recentAvg = values[2];
  } else if (values.length === 4) {
    earlierAvg = (values[0] + values[1]) / 2;
    recentAvg = (values[2] + values[3]) / 2;
  } else {
    // 5 or more attempts: compare first 2 vs last 2
    earlierAvg = (values[0] + values[1]) / 2;
    recentAvg = (values[values.length - 2] + values[values.length - 1]) / 2;
  }

  const diff = recentAvg - earlierAvg;
  if (diff >= 5) return "improving";
  if (diff <= -5) return "declining";
  return "stable";
}

export const computeAccuracyTrend = computeRecentPerformanceTrend;


export async function getZiStudentContext(userId) {
  if (!userId) return null;

  try {
    const [profileResult, attemptsResult, prefsResult] = await Promise.all([
      supabaseAdmin
        .from("user_profiles")
        .select("exam, target_year")
        .eq("clerk_user_id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("test_attempts")
        .select(
          "id, created_at, score, total_marks, total_questions, correct_answers, wrong_answers, attempted, time_taken_seconds"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(RECENT_TEST_LIMIT),
      supabaseAdmin
        .from("zi_preferences")
        .select("preference_key, preference_value")
        .eq("clerk_user_id", userId)
    ]);

    if (profileResult.error) {
      console.error("[ZI_STUDENT_PROFILE_FETCH_ERROR]", profileResult.error);
    }
    if (attemptsResult.error) {
      console.error("[ZI_STUDENT_ATTEMPTS_FETCH_ERROR]", attemptsResult.error);
    }
    if (prefsResult.error) {
      console.error("[ZI_STUDENT_PREFS_FETCH_ERROR]", prefsResult.error);
    }

    const profileData = profileResult.data || null;
    const rawAttempts = attemptsResult.data || [];
    const rawPrefs = prefsResult.data || [];
    const preferences = {};
    for (const p of rawPrefs) {
      preferences[p.preference_key] = p.preference_value;
    }

    // Bounded recent completed attempts (filtered for actual completed activity)
    const recentAttempts = rawAttempts.filter(
      (attempt) =>
        attempt &&
        (Number(attempt.attempted) > 0 ||
          Number(attempt.total_questions) > 0 ||
          attempt.score !== null)
    );

    const attemptIds = recentAttempts.map((a) => a.id).filter(Boolean);
    let answerRows = [];

    if (attemptIds.length > 0) {
      const { data: answers, error: answersError } = await supabaseAdmin
        .from("user_answers")
        .select(`
          attempt_id,
          selected_option,
          is_correct,
          created_at,
          questions:question_id (
            id,
            exam,
            subject,
            chapter
          )
        `)
        .in("attempt_id", attemptIds);

      if (answersError) {
        console.error("[ZI_STUDENT_ANSWERS_FETCH_ERROR]", answersError);
      } else {
        answerRows = answers || [];
      }
    }

    // Process questions actually answered
    const answeredQuestions = answerRows
      .filter(
        (ans) =>
          ans?.selected_option !== null &&
          ans?.selected_option !== undefined &&
          String(ans.selected_option).trim() !== ""
      )
      .map((ans) => {
        const questionObj = Array.isArray(ans.questions)
          ? ans.questions[0]
          : ans.questions;
        return {
          subject: normalizeSubject(questionObj?.subject),
          chapter: cleanText(questionObj?.chapter),
          isCorrect: Boolean(ans.is_correct),
          date: ans.created_at,
        };
      });

    const totalAttempted = answeredQuestions.length;
    const totalCorrect = answeredQuestions.filter((q) => q.isCorrect).length;
    const overallAccuracy =
      totalAttempted > 0 ? percent(totalCorrect, totalAttempted) : null;

    // Subject breakdown
    const subjectMap = new Map();
    for (const q of answeredQuestions) {
      const subj = q.subject || "General";
      if (!subjectMap.has(subj)) {
        subjectMap.set(subj, {
          subject: subj,
          attempts: 0,
          correct: 0,
          incorrect: 0,
        });
      }
      const entry = subjectMap.get(subj);
      entry.attempts += 1;
      if (q.isCorrect) {
        entry.correct += 1;
      } else {
        entry.incorrect += 1;
      }
    }

    const subjects = [...subjectMap.values()]
      .map((s) => ({
        subject: s.subject,
        accuracy: percent(s.correct, s.attempts),
        attempts: s.attempts,
        correct: s.correct,
        incorrect: s.incorrect,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    // Chapter breakdown
    const chapterMap = new Map();
    for (const q of answeredQuestions) {
      if (!isValidChapter(q.chapter)) continue;
      const key = `${q.subject.toLowerCase()}::${q.chapter.toLowerCase()}`;
      if (!chapterMap.has(key)) {
        chapterMap.set(key, {
          chapter: q.chapter,
          subject: q.subject,
          attempts: 0,
          correct: 0,
          incorrect: 0,
        });
      }
      const entry = chapterMap.get(key);
      entry.attempts += 1;
      if (q.isCorrect) {
        entry.correct += 1;
      } else {
        entry.incorrect += 1;
      }
    }

    // Conservative weakness criteria:
    // 1. Minimum sample: at least MIN_CHAPTER_ATTEMPTS (3)
    // 2. Either accuracy <= 64% (critical / needs work in analytics) OR below overall baseline accuracy
    // 3. Repeated incorrect answers (incorrect >= 2)
    const weakChapters = [...chapterMap.values()]
      .map((c) => ({
        chapter: c.chapter,
        subject: c.subject,
        accuracy: percent(c.correct, c.attempts),
        attempts: c.attempts,
        correct: c.correct,
        incorrect: c.incorrect,
      }))
      .filter((c) => {
        const hasSample = c.attempts >= MIN_CHAPTER_ATTEMPTS;
        const belowBaseline =
          overallAccuracy !== null ? c.accuracy < overallAccuracy : true;
        const lowAccuracy = c.accuracy !== null && c.accuracy <= 64;
        const repeatedErrors = c.incorrect >= 2;
        return hasSample && (lowAccuracy || belowBaseline) && repeatedErrors;
      })
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        return b.attempts - a.attempts;
      })
      .slice(0, MAX_WEAK_CHAPTERS);

    // Trend calculation: order attempts chronologically (oldest to newest)
    const attemptsChronological = [...recentAttempts].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const recentAccuracyTrend =
      computeRecentPerformanceTrend(attemptsChronological);

    // Learning State (Phase 4B)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const nowMs = Date.now();
    
    // 1. Stale Chapters
    const chapterLastActivity = new Map();
    for (const q of answeredQuestions) {
      if (!isValidChapter(q.chapter) || !q.date) continue;
      const key = `${q.subject.toLowerCase()}::${q.chapter.toLowerCase()}`;
      const ts = new Date(q.date).getTime();
      if (!Number.isNaN(ts)) {
        const current = chapterLastActivity.get(key) || 0;
        if (ts > current) chapterLastActivity.set(key, ts);
      }
    }
    const staleChapters = [...chapterLastActivity.entries()]
      .filter(([, maxTs]) => nowMs - maxTs >= 14 * ONE_DAY_MS)
      .map(([key]) => {
        const entry = chapterMap.get(key);
        return entry ? { chapter: entry.chapter, subject: entry.subject } : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    // 2. Recurring Mistakes
    const recurringMistakes = [...chapterMap.values()]
      .filter(c => c.incorrect >= 3)
      .map(c => ({ chapter: c.chapter, subject: c.subject, incorrect: c.incorrect }))
      .sort((a, b) => b.incorrect - a.incorrect)
      .slice(0, 5);

    // 3. Speed vs Accuracy
    let speedVsAccuracy = "insufficient_data";
    let avgTimeSeconds = null;
    const timedAttempts = recentAttempts.filter(a => Number(a.time_taken_seconds) > 0 && Number(a.attempted) > 0);
    if (timedAttempts.length > 0) {
      const totalSec = timedAttempts.reduce((sum, a) => sum + Number(a.time_taken_seconds), 0);
      const totalAtt = timedAttempts.reduce((sum, a) => sum + Number(a.attempted), 0);
      if (totalAtt > 0) {
        avgTimeSeconds = Math.round(totalSec / totalAtt);
        if (avgTimeSeconds < 60) {
          speedVsAccuracy = (overallAccuracy !== null && overallAccuracy <= 60) ? "possible_rushing" : "fast";
        } else if (avgTimeSeconds > 120) {
          speedVsAccuracy = "slow";
        } else {
          speedVsAccuracy = "balanced";
        }
      }
    }

    // 4. Consistency
    let consistency = "insufficient_data";
    const accuracies = attemptsChronological
      .map(a => percent(Number(a.correct_answers), Number(a.attempted)) ?? percent(Number(a.score), Number(a.total_marks)))
      .filter(val => val !== null);
      
    if (accuracies.length >= 3) {
      const maxAcc = Math.max(...accuracies);
      const minAcc = Math.min(...accuracies);
      const range = maxAcc - minAcc;
      if (range >= 20) consistency = "variable";
      else if (range <= 10) consistency = "consistent";
      else consistency = "moderate";
    }

    return {
      preferences,
      profile: {
        exam: profileData?.exam ? String(profileData.exam).trim() : null,
        targetYear: profileData?.target_year
          ? Number(profileData.target_year)
          : null,
      },
      recentPerformance: {
        attemptsConsidered: recentAttempts.length,
        overallAccuracy,
        recentAccuracyTrend,
        recentScoreTrend: recentAccuracyTrend,
      },
      subjects,
      weakChapters,
      learningState: {
        staleChapters,
        recurringMistakes,
        speedVsAccuracy,
        avgTimeSeconds,
        consistency,
      },
    };
  } catch (error) {
    console.error("[GET_ZI_STUDENT_CONTEXT_ERROR]", error);
    return null;
  }
}

export function formatZiStudentContext(studentContext) {
  if (!studentContext) return "";

  const lines = [];

  if (studentContext.preferences && Object.keys(studentContext.preferences).length > 0) {
    lines.push("Saved preferences (EXPLICIT USER INSTRUCTIONS):");
    for (const [key, value] of Object.entries(studentContext.preferences)) {
      lines.push(`- ${key}: ${value}`);
    }
    lines.push("");
  }

  lines.push("Recent computed study context (Analytics):");
  const exam = studentContext.profile?.exam || "Not set";
  const targetYear = studentContext.profile?.targetYear || "Not set";
  lines.push(`Exam: ${exam}, Target year: ${targetYear}`);
  lines.push("");

  const attemptsConsidered =
    studentContext.recentPerformance?.attemptsConsidered ?? 0;
  const overallAccuracy =
    studentContext.recentPerformance?.overallAccuracy !== null &&
    studentContext.recentPerformance?.overallAccuracy !== undefined
      ? `${studentContext.recentPerformance.overallAccuracy}%`
      : "Insufficient data";
  const recentTrend =
    studentContext.recentPerformance?.recentAccuracyTrend ||
    studentContext.recentPerformance?.recentScoreTrend ||
    "insufficient_data";

  lines.push("Recent performance:");
  lines.push(`Completed tests considered: ${attemptsConsidered}`);
  lines.push(`Overall accuracy: ${overallAccuracy}`);
  lines.push(`Recent accuracy trend: ${recentTrend}`);
  lines.push("");

  lines.push("Subject performance:");
  if (studentContext.subjects && studentContext.subjects.length > 0) {
    for (const subj of studentContext.subjects) {
      const accStr =
        subj.accuracy !== null ? `${subj.accuracy}%` : "No completed data";
      lines.push(
        `${subj.subject}: ${accStr} across ${subj.attempts} attempted question${
          subj.attempts === 1 ? "" : "s"
        }`
      );
    }
  } else {
    lines.push("No recent test question data available.");
  }
  lines.push("");

  lines.push("Areas worth revisiting based on recent attempts:");
  if (studentContext.weakChapters && studentContext.weakChapters.length > 0) {
    for (const weak of studentContext.weakChapters) {
      const accStr =
        weak.accuracy !== null ? `${weak.accuracy}%` : "Low accuracy";
      lines.push(
        `- ${weak.chapter} (${weak.subject}): ${accStr} across ${weak.attempts} attempts`
      );
    }
  } else if (attemptsConsidered === 0) {
    lines.push("None identified yet (requires completed test attempts).");
  } else {
    lines.push("None identified below the threshold in recent tests.");
  }
  lines.push("");

  const ls = studentContext.learningState;
  if (ls) {
    lines.push("Learning state signals:");
    
    if (ls.recurringMistakes && ls.recurringMistakes.length > 0) {
      lines.push("Recurring mistakes (Measured):");
      for (const rm of ls.recurringMistakes) {
        lines.push(`- ${rm.chapter} (${rm.subject}): ${rm.incorrect} incorrect answers`);
      }
    }

    if (ls.staleChapters && ls.staleChapters.length > 0) {
      lines.push("Stale chapters (Measured: last practiced 14+ days ago):");
      for (const stale of ls.staleChapters) {
        lines.push(`- ${stale.chapter} (${stale.subject})`);
      }
    }

    if (ls.speedVsAccuracy !== "insufficient_data" && ls.avgTimeSeconds !== null) {
      lines.push(`Speed vs Accuracy (Measured): Avg ${ls.avgTimeSeconds}s per question.`);
      if (ls.speedVsAccuracy === "possible_rushing") {
        lines.push("Inferred: Fast response times with lower accuracy may suggest rushing, though timing alone does not prove causation.");
      } else if (ls.speedVsAccuracy === "slow") {
        lines.push("Inferred: Response time is relatively high. Timing alone does not prove causation.");
      } else if (ls.speedVsAccuracy === "fast") {
        lines.push("Inferred: Fast response times with good accuracy may suggest high confidence, though timing alone does not prove causation.");
      } else {
        lines.push("Inferred: Balanced pacing.");
      }
    }

    if (ls.consistency !== "insufficient_data") {
      lines.push(`Recent consistency (Measured): Test-to-test variation is ${ls.consistency}.`);
    }

    lines.push("");
    lines.push("Note: Revision progress and 'Again' card states are not currently tracked on the server and are intentionally omitted.");
  }

  return lines.join("\n");
}
