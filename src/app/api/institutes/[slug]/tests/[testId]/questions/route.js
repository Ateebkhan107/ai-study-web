import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";
import { TestQuestionCreateSchema } from "@/lib/validations";

export async function POST(request, { params }) {
  try {
    const { slug, testId } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN", "OWNER"]);
    if (context.error) return context.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = TestQuestionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const questionData = parsed.data;

    // 1. Verify test exists and is owned by institute
    const { data: test, error: testError } = await supabaseAdmin
      .from("institute_tests")
      .select("id, total_questions, status")
      .eq("id", testId)
      .eq("institute_id", context.institute.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (test.status !== "DRAFT") {
      return NextResponse.json({ error: "Cannot add questions to a published test" }, { status: 400 });
    }

    // 2. Insert the custom question into public.questions
    const { data: question, error: questionError } = await supabaseAdmin
      .from("questions")
      .insert({
        institute_id: context.institute.id, // Custom question isolated to this institute
        exam: questionData.exam,
        subject: questionData.subject,
        chapter: questionData.chapter,
        topic: questionData.topic,
        difficulty: questionData.difficulty,
        question_type: questionData.question_type,
        question_text: questionData.question_text,
        question_image: questionData.question_image,
        option_a: questionData.option_a,
        option_b: questionData.option_b,
        option_c: questionData.option_c,
        option_d: questionData.option_d,
        option_a_image: questionData.option_a_image,
        option_b_image: questionData.option_b_image,
        option_c_image: questionData.option_c_image,
        option_d_image: questionData.option_d_image,
        correct_option: questionData.correct_option,
        marks: questionData.marks,
        negative_marks: questionData.negative_marks,
        status: "PUBLISHED", // Published within the context of the institute
        is_active: true,
      })
      .select("id")
      .single();

    if (questionError) {
      console.error("[CUSTOM_QUESTION_INSERT_ERROR]", questionError);
      return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
    }

    // 3. Link question to the test
    const nextOrder = test.total_questions + 1;
    const { error: linkError } = await supabaseAdmin
      .from("institute_test_questions")
      .insert({
        institute_id: context.institute.id,
        institute_test_id: test.id,
        question_id: question.id,
        question_order: nextOrder,
      });

    if (linkError) {
      console.error("[TEST_QUESTION_LINK_ERROR]", linkError);
      return NextResponse.json({ error: "Failed to link question to test" }, { status: 500 });
    }

    // 4. Update total_questions in the test
    await supabaseAdmin
      .from("institute_tests")
      .update({ total_questions: nextOrder })
      .eq("id", test.id);

    return NextResponse.json({ success: true, question_id: question.id }, { status: 201 });
  } catch (error) {
    console.error("[INSTITUTE_QUESTION_ADD_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
