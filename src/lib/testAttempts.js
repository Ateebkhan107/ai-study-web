import { supabase } from "@/lib/supabase";

export async function createTestAttempt({
  userId,
  testId,
  mode,
  subject,
  difficulty,
  duration,
  totalQuestions,
}) {
  const { data, error } = await supabase
    .from("test_attempts")
    .insert({
      user_id: userId,
      test_id: testId,
      mode,
      subject,
      difficulty,
      duration_minutes: duration,
      total_questions: totalQuestions,
      status: "in_progress",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}