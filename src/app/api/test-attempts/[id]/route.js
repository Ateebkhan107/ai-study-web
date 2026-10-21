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
      return NextResponse.json(await generatedResult({ userId, sessionId: id, client: supabaseAdmin }), { headers: { "Cache-Control": "no-store" } });
    }

    const { data, error } = await supabaseAdmin
      .from("test_attempts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[TEST_ATTEMPT_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
