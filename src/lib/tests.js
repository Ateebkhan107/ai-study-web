import { supabase } from "@/lib/supabase";

export async function getQuestions({
  subject,
  chapter,
  difficulty,
  limit = 20,
}) {
  let query = supabase
    .from("test_questions")
    .select("*")
    .eq("subject", subject)
    .eq("chapter", chapter);

  if (difficulty !== "mixed") {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}