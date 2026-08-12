import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";

export async function POST(request, { params }) {
  try {
    const { slug, testId } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN", "OWNER"]);
    if (context.error) return context.error;

    const body = await request.json();

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
        exam: body.exam || "JEE",
        subject: body.subject || "Physics",
        chapter: body.chapter || "Mixed",
        topic: body.topic || "Mixed",
        difficulty: body.difficulty || "Medium",
        question_type: body.question_type || "MCQ",
        question_text: body.question_text || "",
        question_image: body.question_image || null,
        option_a: body.option_a || "",
        option_b: body.option_b || "",
        option_c: body.option_c || "",
        option_d: body.option_d || "",
        option_a_image: body.option_a_image || null,
        option_b_image: body.option_b_image || null,
        option_c_image: body.option_c_image || null,
        option_d_image: body.option_d_image || null,
        correct_option: body.correct_option || "A",
        marks: Number(body.marks) || 4,
        negative_marks: Number(body.negative_marks) || 1,
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
