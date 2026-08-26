import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBattleForUser, isAnswerCorrect } from "@/lib/battle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SCORING_SELECT = "id, correct_answer";

function jsonError(error, fallback = 500) {
  return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: error.status || fallback });
}

export async function POST(request, context) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json();
    const questionId = String(body.questionId || "");
    const selectedAnswer = body.selectedAnswer;

    if (!questionId) return NextResponse.json({ error: "Question is required." }, { status: 400 });

    const battle = await getBattleForUser({ battleId: id, userId });
    if (battle.status !== "ACTIVE") return NextResponse.json({ error: "Battle is already finished." }, { status: 400 });
    if (!battle.question_ids.map(String).includes(questionId)) {
      return NextResponse.json({ error: "Question is not part of this battle." }, { status: 400 });
    }

    const currentPlayer = battle.players.find((player) => player.user_id === userId);
    if (currentPlayer?.completed_at) {
      return NextResponse.json({ error: "You have already finished this battle." }, { status: 400 });
    }

    const { data: question, error: questionError } = await supabaseAdmin
      .from("battle_questions")
      .select(SCORING_SELECT)
      .eq("id", questionId)
      .maybeSingle();
    if (questionError) throw questionError;
    if (!question) return NextResponse.json({ error: "Question not found." }, { status: 404 });

    const isCorrect = isAnswerCorrect(question, selectedAnswer);
    const { error } = await supabaseAdmin
      .from("battle_answers")
      .upsert(
        {
          battle_id: id,
          user_id: userId,
          question_id: questionId,
          selected_answer: selectedAnswer ?? null,
          is_correct: isCorrect,
          answered_at: new Date().toISOString(),
        },
        { onConflict: "battle_id,user_id,question_id" }
      );
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[BATTLE_ANSWER_POST_ERROR]", error);
    return jsonError(error);
  }
}
