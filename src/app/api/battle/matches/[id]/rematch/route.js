import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBattleForUser } from "@/lib/battle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function jsonError(error, fallback = 500) {
  return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: error.status || fallback });
}

export async function POST(_request, context) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const battle = await getBattleForUser({ battleId: id, userId });
    const opponent = battle.players.find((player) => player.user_id !== userId);
    if (!opponent) return NextResponse.json({ error: "Opponent not found." }, { status: 404 });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("battle_challenges")
      .insert({
        challenger_id: userId,
        challenged_id: opponent.user_id,
        status: "PENDING",
        expires_at: expiresAt,
      })
      .select("id, status, expires_at")
      .single();

    if (error && error.code === "23505") {
      return NextResponse.json({ error: "A rematch request is already pending." }, { status: 409 });
    }
    if (error) throw error;

    return NextResponse.json({ challenge: data });
  } catch (error) {
    console.error("[BATTLE_REMATCH_POST_ERROR]", error);
    return jsonError(error);
  }
}
