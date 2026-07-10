import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET(req) {

  const { searchParams } = new URL(req.url);

  const exam = searchParams.get("exam");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const chapter = searchParams.get("chapter");
  const mode = searchParams.get("mode") || "full";

  // TODO:
  // replace userId query param with Clerk server auth
  const userId = searchParams.get("userId");

  // mode=full:      complete paper — filter by exam/subject/year
  // mode=random:    same filters, then shuffled
  // mode=chapter:   filter by exam/subject/chapter
  // mode=mistakes:  fetch the user's wrong pyq_attempts, then load those questions

  if (mode === "mistakes") {

    if (!userId) {
      return NextResponse.json([]);
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from("pyq_attempts")
      .select("question_id")
      .eq("user_id", userId)
      .eq("is_correct", false);

    if (attemptsError) {
      console.error("PYQ MISTAKES QUERY ERROR:", attemptsError.message);

      return NextResponse.json(
        { error: "Failed to load mistake questions" },
        { status: 500 }
      );
    }

    const questionIds = [...new Set((attempts || []).map((a) => a.question_id))];

    if (questionIds.length === 0) {
      return NextResponse.json([]);
    }

    let mistakeQuery = supabase
      .from("pyq_questions")
      .select("*")
      .in("id", questionIds);

    if (exam) {
      mistakeQuery = mistakeQuery.eq("exam", exam);
    }

    if (subject) {
      mistakeQuery = mistakeQuery.eq("subject", subject);
    }

    const { data: mistakeQuestions, error: questionsError } = await mistakeQuery;

    if (questionsError) {
      console.error("PYQ MISTAKES QUERY ERROR:", questionsError.message);

      return NextResponse.json(
        { error: "Failed to load mistake questions" },
        { status: 500 }
      );
    }

    return NextResponse.json(mistakeQuestions || []);

  }

  let query = supabase
    .from("pyq_questions")
    .select("*");

  if (exam) {
    query = query.eq("exam", exam);
  }

  if (subject) {
    query = query.eq("subject", subject);
  }

  if (year) {
    query = query.eq("year", year);
  }

  if (mode === "chapter" && chapter) {
    query = query.eq("chapter", chapter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("PYQ QUERY ERROR:", error.message);

    return NextResponse.json(
      { error: "Failed to load PYQ questions" },
      { status: 500 }
    );
  }

  let result = data || [];

  if (mode === "random") {
    result = [...result].sort(() => Math.random() - 0.5);
  }

  return NextResponse.json(result);
}