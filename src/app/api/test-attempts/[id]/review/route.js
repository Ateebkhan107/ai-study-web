import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { assertGeneratedEngineEnabled, generatedResult } from "@/lib/tests/generatedTests.server";

export async function GET(_request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (new URL(_request.url).searchParams.get("sourceType") === "AI_GENERATED") {
      assertGeneratedEngineEnabled();
      return NextResponse.json(await generatedResult({ userId, sessionId: id, client: supabaseAdmin, review: true }), { headers: { "Cache-Control": "no-store" } });
    }

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("test_attempts")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (attemptError) {
      throw attemptError;
    }

    if (!attempt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("user_answers")
      .select(`
        id,
        selected_option,
        correct_option,
        is_correct,
        questions:question_id(
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          explanation,
          subject,
          chapter
        )
      `)
      .eq("attempt_id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ answers: data || [] });
  } catch (error) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[TEST_ATTEMPT_REVIEW_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
