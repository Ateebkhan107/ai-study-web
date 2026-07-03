import { supabase } from "@/lib/supabase";


export async function createTestSession({
  userId,
  exam,
  subjects,
  chapters,
  difficulty,
  questions,
  duration,
}) {


  // 1. Create session
  const { data: session, error } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      exam,
      subjects,
      chapters,
      difficulty,
      total_questions: questions.length,
      duration_minutes: duration,
      status: "in_progress",
    })
    .select()
    .single();


  if (error) throw error;



  // 2. Save questions used in test

  const rows = questions.map((q, index)=>({
    session_id: session.id,
    question_id: q.id,
    question_order:index + 1,
  }));


  const {error: questionError}=await supabase
  .from("test_questions")
  .insert(rows);


  if(questionError) throw questionError;


  return session;
}