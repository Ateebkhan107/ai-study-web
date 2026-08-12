import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";

export async function GET(request, { params }) {
  try {
    const { slug, testId } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN", "OWNER"]);
    if (context.error) return context.error;

    const { data: test, error: testError } = await supabaseAdmin
      .from("institute_tests")
      .select(`
        *,
        institute_test_questions (
          question_order,
          questions (*)
        )
      `)
      .eq("id", testId)
      .eq("institute_id", context.institute.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Sort questions by order
    const questions = test.institute_test_questions
      .sort((a, b) => a.question_order - b.question_order)
      .map(tq => tq.questions);

    return NextResponse.json({ test: { ...test, questions } }, { status: 200 });
  } catch (error) {
    console.error("[INSTITUTE_TEST_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
