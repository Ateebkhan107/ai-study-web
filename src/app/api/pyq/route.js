import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PYQ_SESSION_SELECT = `
  id,
  exam_id,
  exam,
  exam_type,
  year,
  attempt,
  shift,
  paper_code,
  subject,
  chapter,
  difficulty,
  question,
  question_image,
  option_a,
  option_b,
  option_c,
  option_d,
  option_a_image,
  option_b_image,
  option_c_image,
  option_d_image,
  correct_option,
  explanation,
  explanation_image,
  question_type,
  correct_options,
  numerical_answer,
  numerical_min,
  numerical_max,
  marks_positive,
  marks_negative,
  created_at,
  status
`;

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const exam = searchParams.get("exam");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const chapter = searchParams.get("chapter");
  const mode = searchParams.get("mode") || "full";

  const examType = searchParams.get("exam_type");
  const attempt = searchParams.get("attempt");
  const shift = searchParams.get("shift");
  const paperCode = searchParams.get("paper_code");
  const examId = searchParams.get("exam_id");

  const userId = searchParams.get("userId");

  if (mode === "mistakes") {
    if (!userId) return NextResponse.json([]);

    const { data: attempts, error: attemptsError } = await supabase
      .from("pyq_attempts")
      .select("question_id")
      .eq("user_id", userId)
      .eq("is_correct", false);

    if (attemptsError) {
      console.error("PYQ MISTAKES QUERY ERROR:", attemptsError.message);
      return NextResponse.json({ error: "Failed to load mistake questions" }, { status: 500 });
    }

    const questionIds = [...new Set((attempts || []).map((a) => a.question_id))];

    if (questionIds.length === 0) return NextResponse.json([]);

    let mistakeQuery = supabase
      .from("pyq_questions")
      .select(PYQ_SESSION_SELECT)
      .eq("status", "PUBLISHED")
      .not("exam_id", "is", null)
      .in("id", questionIds);

    if (exam) mistakeQuery = mistakeQuery.eq("exam", exam);
    if (examType) mistakeQuery = mistakeQuery.eq("exam_type", examType);
    if (subject) mistakeQuery = mistakeQuery.eq("subject", subject);
    if (year) mistakeQuery = mistakeQuery.eq("year", year);
    if (attempt) mistakeQuery = mistakeQuery.eq("attempt", attempt);
    if (shift) mistakeQuery = mistakeQuery.eq("shift", shift);
    if (paperCode) mistakeQuery = mistakeQuery.eq("paper_code", paperCode);
    if (examId) mistakeQuery = mistakeQuery.eq("exam_id", examId);

    const { data: mistakeQuestions, error: questionsError } = await mistakeQuery;

    if (questionsError) {
      console.error("PYQ MISTAKES QUERY ERROR:", questionsError.message);
      return NextResponse.json({ error: "Failed to load mistake questions" }, { status: 500 });
    }

    return NextResponse.json(mistakeQuestions || []);
  }

  let query = supabase
    .from("pyq_questions")
    .select(PYQ_SESSION_SELECT)
    .eq("status", "PUBLISHED")
    .not("exam_id", "is", null);

  if (examId) query = query.eq("exam_id", examId);
  if (exam) query = query.eq("exam", exam);
  if (subject) query = query.eq("subject", subject);
  if (year) query = query.eq("year", year);

  if (mode === "chapter") {
    // Chapter Wise mode: ONLY filter by chapter (plus exam/subject/year already added above).
    // Do NOT filter by exam_type, attempt, shift, or paper_code.
    if (chapter) {
      const chaptersArray = chapter.split(",").map(c => c.trim());
      query = query.in("chapter", chaptersArray);
    }
  } else {
    // Full paper or random mode: apply all paper metadata filters
    if (examType) query = query.eq("exam_type", examType);
    if (attempt) query = query.eq("attempt", attempt);
    if (shift) query = query.eq("shift", shift);
    if (paperCode) query = query.eq("paper_code", paperCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error("PYQ QUERY ERROR:", error.message);
    return NextResponse.json({ error: "Failed to load PYQ questions" }, { status: 500 });
  }

  let result = data || [];

  if (mode === "random") {
    result = [...result].sort(() => Math.random() - 0.5);
  } else {
    // Sort sequentially by created_at to preserve import sequence
    result = [...result].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  return NextResponse.json(result);
}
