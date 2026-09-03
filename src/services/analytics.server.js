import { getSubscriptionForUser, isSubscriptionActive } from "@/lib/accessControl";
import { aggregateAnalytics } from "@/lib/analyticsAggregate";
import { normalizeTrack } from "@/lib/analyticsHelpers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getAnalyticsForUser(userId, requestedTrack = "JEE") {
  const track = normalizeTrack(requestedTrack);
  const subscription = await getSubscriptionForUser(userId, track);

  if (!isSubscriptionActive(subscription)) {
    return { allowed: false, stats: null };
  }

  const [{ data: testAttempts, error: testError }, { data: pyqAttemptsRaw, error: pyqError }] = await Promise.all([
    supabaseAdmin
      .from("test_attempts")
      .select(`
        id,
        created_at,
        score,
        total_marks,
        total_questions,
        correct_answers,
        attempted,
        time_taken_seconds,
        tests ( exam )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("pyq_attempts")
      .select(`
        id,
        question_id,
        selected_option,
        is_correct,
        attempted_at,
        pyq_questions (
          exam,
          subject,
          chapter,
          marks_positive,
          marks_negative
        )
      `)
      .eq("user_id", userId)
      .order("attempted_at", { ascending: true }),
  ]);

  if (testError) throw testError;
  if (pyqError) throw pyqError;

  const attemptIds = (testAttempts || []).map((attempt) => attempt.id).filter(Boolean);
  let answerRows = [];

  if (attemptIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("user_answers")
      .select(`
        attempt_id,
        selected_option,
        is_correct,
        created_at,
        questions (
          exam,
          subject,
          chapter
        )
      `)
      .in("attempt_id", attemptIds);

    if (error) throw error;
    answerRows = data || [];
  }

  const answersByAttempt = new Map();
  for (const answer of answerRows) {
    const attemptAnswers = answersByAttempt.get(answer.attempt_id) || [];
    attemptAnswers.push(answer);
    answersByAttempt.set(answer.attempt_id, attemptAnswers);
  }

  const testAttemptsRaw = (testAttempts || []).map((attempt) => ({
    ...attempt,
    user_answers: answersByAttempt.get(attempt.id) || [],
  }));

  const analytics = aggregateAnalytics({
    track,
    testAttemptsRaw,
    pyqAttemptsRaw,
  });

  return {
    allowed: true,
    stats: {
      ...analytics,
      generatedAt: new Date().toISOString(),
      sources: {
        questionsPracticed: ["user_answers.selected_option", "pyq_attempts.selected_option"],
        accuracy: ["user_answers.is_correct", "pyq_attempts.is_correct"],
        testsCompleted: ["test_attempts.id"],
        averageScore: ["test_attempts.score", "test_attempts.total_marks"],
        chapters: ["questions.chapter", "pyq_questions.chapter"],
        timing: ["test_attempts.time_taken_seconds", "test_attempts.attempted"],
      },
    },
  };
}
