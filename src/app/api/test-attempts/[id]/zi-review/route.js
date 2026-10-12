import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ATTEMPT_SELECT = `
  id,
  user_id,
  session_id,
  score,
  total_marks,
  correct_answers,
  wrong_answers,
  attempted,
  total_questions,
  duration_minutes,
  time_taken_seconds,
  created_at
`;

const ANSWERS_SELECT = `
  id,
  selected_option,
  correct_option,
  is_correct,
  question_id,
  questions:question_id(
    id,
    exam,
    subject,
    chapter,
    topic,
    difficulty,
    question_type,
    question_text,
    question_image,
    option_a,
    option_b,
    option_c,
    option_d,
    option_a_image,
    option_b_image,
    option_c_image,
    option_d_image,
    explanation,
    marks,
    negative_marks
  )
`;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}m ${secs}s`;
}

function summarizeBySubject(answers) {
  const bySubject = new Map();

  for (const answer of answers) {
    const subject = String(answer.questions?.subject || "Unknown").trim() || "Unknown";
    const entry = bySubject.get(subject) || {
      subject,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      total: 0,
    };

    entry.total += 1;
    if (!answer.selected_option) entry.skipped += 1;
    else if (answer.is_correct) entry.correct += 1;
    else entry.incorrect += 1;

    bySubject.set(subject, entry);
  }

  return [...bySubject.values()];
}

export async function GET(_request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("test_attempts")
      .select(ATTEMPT_SELECT)
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (attemptError) {
      throw attemptError;
    }

    if (!attempt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [
      { data: session, error: sessionError },
      { data: answers, error: answersError },
      { data: questionOrderRows, error: questionOrderError },
      { data: instituteAttempt, error: instituteAttemptError },
    ] =
      await Promise.all([
        attempt.session_id
          ? supabaseAdmin
            .from("test_sessions")
            .select("id, exam, subjects, chapters, difficulty, total_questions, duration_minutes, status")
            .eq("id", attempt.session_id)
            .eq("user_id", userId)
            .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabaseAdmin
          .from("user_answers")
          .select(ANSWERS_SELECT)
          .eq("attempt_id", attempt.id),
        attempt.session_id
          ? supabaseAdmin
            .from("test_questions")
            .select("question_id, question_order")
            .eq("session_id", attempt.session_id)
            .order("question_order", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
        supabaseAdmin
          .from("institute_test_attempts")
          .select("institute_test_id")
          .eq("attempt_id", attempt.id)
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    if (sessionError) {
      throw sessionError;
    }

    if (answersError) {
      throw answersError;
    }

    if (questionOrderError) {
      throw questionOrderError;
    }

    if (instituteAttemptError) {
      throw instituteAttemptError;
    }

    let instituteTestTitle = "";
    if (instituteAttempt?.institute_test_id) {
      const { data: instituteTest, error: instituteTestError } = await supabaseAdmin
        .from("institute_tests")
        .select("title")
        .eq("id", instituteAttempt.institute_test_id)
        .maybeSingle();

      if (instituteTestError) {
        throw instituteTestError;
      }

      instituteTestTitle = instituteTest?.title || "";
    }

    const questionOrder = new Map(
      (questionOrderRows || []).map((row, index) => [
        String(row.question_id),
        Number(row.question_order) || index + 1,
      ])
    );
    const sortedAnswers = (answers || []).sort((a, b) => {
      const aOrder = questionOrder.get(String(a.question_id)) || Number.MAX_SAFE_INTEGER;
      const bOrder = questionOrder.get(String(b.question_id)) || Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder || String(a.id).localeCompare(String(b.id));
    });
    const totalQuestions = Number(attempt.total_questions) || sortedAnswers.length || 0;
    const attempted = Number(attempt.attempted) || sortedAnswers.filter((answer) => answer.selected_option).length;
    const correct = Number(attempt.correct_answers) || 0;
    const wrong = Number(attempt.wrong_answers) || 0;
    const skipped = Math.max(0, totalQuestions - attempted);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    const testName = instituteTestTitle || session?.exam || "Mock Test";

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        testName,
        score: Number(attempt.score) || 0,
        totalMarks: Number(attempt.total_marks) || 0,
        correct,
        wrong,
        skipped,
        attempted,
        totalQuestions,
        accuracy,
        timeTaken: formatTime(attempt.time_taken_seconds),
        subjects: Array.isArray(session?.subjects) ? session.subjects : [],
        chapters: Array.isArray(session?.chapters) ? session.chapters : [],
        difficulty: session?.difficulty || null,
        createdAt: attempt.created_at,
        subjectBreakdown: summarizeBySubject(sortedAnswers),
      },
      answers: sortedAnswers.map((answer, index) => ({
        ...answer,
        questionNumber: questionOrder.get(String(answer.question_id)) || index + 1,
      })),
    });
  } catch (error) {
    console.error("[TEST_ATTEMPT_ZI_REVIEW_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
