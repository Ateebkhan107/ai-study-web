import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { battleDatabaseError } from "@/lib/battle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request, context) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    if (typeof body?.questionId !== "string" || !body.questionId) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }
    if (body.selectedAnswer !== null && !/^[A-D]$/.test(
      typeof body.selectedAnswer === "string" ? body.selectedAnswer : ""
    )) {
      return NextResponse.json({ error: "Choose a valid answer." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.rpc("battle_save_answer", {
      p_battle_id: id,
      p_user_id: userId,
      p_question_id: body.questionId,
      p_answer: body.selectedAnswer,
    });
    if (error) throw battleDatabaseError(error);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[BATTLE_ANSWER_POST_ERROR]", error);
    return NextResponse.json({ error: error.status ? error.message : "Unable to save your answer." }, {
      status: error.status || 500,
    });
  }
}
