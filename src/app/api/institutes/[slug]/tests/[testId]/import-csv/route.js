import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";
import Papa from "papaparse";

export async function POST(req, { params }) {
  const { slug, testId } = await params;
  const context = await getInstituteContext(slug, ["COACHING_ADMIN", "OWNER"]);
  if (context.error) return context.error;

  try {
    // Verify test exists and is a DRAFT
    const { data: test, error: testError } = await supabaseAdmin
      .from("institute_tests")
      .select("id, status, total_questions, exam, subject")
      .eq("id", testId)
      .eq("institute_id", context.institute.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (test.status !== "DRAFT") {
      return NextResponse.json({ error: "Cannot add questions to a published test" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const csvText = await file.text();
    const { data: parsedRows, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    if (errors.length > 0) {
      console.warn("[CSV_PARSE_WARNINGS]", errors.slice(0, 5));
    }

    if (!parsedRows || parsedRows.length === 0) {
      return NextResponse.json({ error: "CSV is empty or unreadable" }, { status: 400 });
    }

    const questionsToInsert = [];

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];

      const questionText = (row.question_text || row.question || "").trim();
      const questionType = (row.question_type || "MCQ").toUpperCase();
      const difficulty = row.difficulty || "Medium";
      const subject = row.subject || test.subject || "Physics";
      const chapter = row.chapter || "General";

      if (!questionText) {
        return NextResponse.json({ error: `Row ${i + 2}: question_text is required` }, { status: 400 });
      }

      let correctOption = (row.correct_option || "").toUpperCase().trim();
      if (questionType === "MCQ" && !["A", "B", "C", "D"].includes(correctOption)) {
        return NextResponse.json({ error: `Row ${i + 2}: correct_option must be A, B, C, or D` }, { status: 400 });
      }

      questionsToInsert.push({
        institute_id: context.institute.id,
        exam: test.exam,
        subject,
        chapter,
        topic: row.topic || chapter,
        difficulty,
        question_type: questionType,
        question_text: questionText,
        question_image: row.question_image || null,
        option_a: row.option_a || null,
        option_b: row.option_b || null,
        option_c: row.option_c || null,
        option_d: row.option_d || null,
        correct_option: correctOption || null,
        marks: Number(row.marks) || 4,
        negative_marks: Number(row.negative_marks) || 1,
        status: "PUBLISHED",
        is_active: true,
      });
    }

    // Insert all questions
    const { data: insertedQuestions, error: insertError } = await supabaseAdmin
      .from("questions")
      .insert(questionsToInsert)
      .select("id");

    if (insertError) {
      console.error("[CSV_IMPORT_INSERT_ERROR]", insertError);
      return NextResponse.json({ error: "Failed to insert questions" }, { status: 500 });
    }

    // Link questions to the test
    const startOrder = test.total_questions;
    const questionLinks = insertedQuestions.map((q, idx) => ({
      institute_id: context.institute.id,
      institute_test_id: test.id,
      question_id: q.id,
      question_order: startOrder + idx + 1,
    }));

    const { error: linkError } = await supabaseAdmin
      .from("institute_test_questions")
      .insert(questionLinks);

    if (linkError) {
      console.error("[CSV_IMPORT_LINK_ERROR]", linkError);
      return NextResponse.json({ error: "Failed to link questions to test" }, { status: 500 });
    }

    // Update total_questions
    await supabaseAdmin
      .from("institute_tests")
      .update({ total_questions: startOrder + insertedQuestions.length })
      .eq("id", testId);

    return NextResponse.json({
      success: true,
      imported: insertedQuestions.length,
    }, { status: 201 });
  } catch (error) {
    console.error("[INSTITUTE_CSV_IMPORT_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
