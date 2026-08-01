import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import {
  calculateStudyStreak,
  examMatchesTrack,
  normalizeTrack,
} from "@/lib/analyticsHelpers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const track = normalizeTrack(searchParams.get("track") || "JEE");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: rawPyqAttempts, error: pyqError }, { data: rawTestAttempts, error: testError }] = await Promise.all([
      supabase
        .from("pyq_attempts")
        .select("is_correct, attempted_at, pyq_questions(exam, subject)")
        .eq("user_id", userId),
      supabase
        .from("test_attempts")
        .select("created_at")
        .eq("user_id", userId),
    ]);

    if (pyqError) {
      return NextResponse.json({ error: pyqError.message }, { status: 500 });
    }

    if (testError) {
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }

    const allPyqAttempts = rawPyqAttempts || [];
    const pyqAttempts = allPyqAttempts.filter((attempt) => examMatchesTrack(attempt.pyq_questions?.exam, track));

    const attempted = pyqAttempts.length;
    const correctAnswers = pyqAttempts.filter((attempt) => attempt.is_correct).length;
    const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : 0;

    const subjectMap = {};
    pyqAttempts.forEach((attempt) => {
      const subject = attempt.pyq_questions?.subject;
      if (!subject) return;

      if (!subjectMap[subject]) {
        subjectMap[subject] = { subject, solved: 0, correct: 0 };
      }

      subjectMap[subject].solved += 1;
      if (attempt.is_correct) subjectMap[subject].correct += 1;
    });

    const subjects = Object.values(subjectMap).map((subject) => ({
      subject: subject.subject,
      solved: subject.solved,
      accuracy: subject.solved > 0 ? Math.round((subject.correct / subject.solved) * 100) : 0,
    }));

    const streak = calculateStudyStreak([
      ...(rawTestAttempts || []).map((attempt) => attempt.created_at),
      ...allPyqAttempts.map((attempt) => attempt.attempted_at),
    ]);

    return NextResponse.json({
      attempted,
      correctAnswers,
      wrongAnswers: attempted - correctAnswers,
      accuracy,
      subjects,
      streak,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
