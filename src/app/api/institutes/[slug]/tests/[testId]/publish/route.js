import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";

export async function POST(request, { params }) {
  try {
    const { slug, testId } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN", "OWNER"]);
    if (context.error) return context.error;

    // 1. Verify test exists and is DRAFT
    const { data: test, error: testError } = await supabaseAdmin
      .from("institute_tests")
      .select("id, status, total_questions")
      .eq("id", testId)
      .eq("institute_id", context.institute.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (test.status === "PUBLISHED") {
      return NextResponse.json({ error: "Test is already published" }, { status: 400 });
    }

    if (test.total_questions === 0) {
      return NextResponse.json({ error: "Cannot publish a test with 0 questions" }, { status: 400 });
    }

    // 2. Publish test
    const { error: updateError } = await supabaseAdmin
      .from("institute_tests")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
      })
      .eq("id", testId)
      .eq("institute_id", context.institute.id);

    if (updateError) {
      console.error("[TEST_PUBLISH_UPDATE_ERROR]", updateError);
      return NextResponse.json({ error: "Failed to publish test" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[INSTITUTE_TEST_PUBLISH_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
