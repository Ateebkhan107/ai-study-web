import { supabase } from "@/lib/supabase";

export async function getQuestions({
  exam,
  subject,
  chapter,
  difficulty,
  limit,
})  {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true);

  if (exam && exam !== "ALL") {
    query = query.eq("exam", exam);
  }

  if (subject && subject !== "Mixed Subjects") {
    query = query.eq("subject", subject);
  }

  if (chapter && chapter !== "All Chapters") {
  query = query.eq("chapter", chapter);
}

  if (difficulty && difficulty !== "Mixed") {
    query = query.ilike("difficulty", difficulty);
  }

  const { data, error } = await query.limit(limit);

  if (error) throw error;

  return data.map((q) => ({
    id: q.id,
    exam: q.exam,
    subject: q.subject,
    chapter: q.chapter,
    topic: q.topic,
    difficulty: q.difficulty,
    text: q.question_text,
    options: [
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
    ],
    correct: ["A", "B", "C", "D"].indexOf(q.correct_option),
    explanation: q.explanation,
    marks: q.marks,
    negative_marks: q.negative_marks,
  }));
}