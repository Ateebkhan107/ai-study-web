import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createBattleForPlayers, requireBattleProfile } from "@/lib/battle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function jsonError(error, fallback = 500) {
  return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: error.status || fallback });
}

async function getActiveBattle(userId) {
  const { data: playerRows, error: playersError } = await supabaseAdmin
    .from("battle_players")
    .select("battle_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (playersError) throw playersError;

  const battleIds = (playerRows || []).map((row) => row.battle_id);
  if (battleIds.length === 0) return null;

  const { data: match, error: matchError } = await supabaseAdmin
    .from("battle_matches")
    .select("id, status, created_at")
    .in("id", battleIds)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (matchError) throw matchError;
  return match;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const activeBattle = await getActiveBattle(userId);
    if (activeBattle) {
      return NextResponse.json({ status: "matched", battleId: activeBattle.id });
    }

    const { data: queueRow, error: queueError } = await supabaseAdmin
      .from("battle_queue")
      .select("id, exam, joined_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (queueError) throw queueError;

    return NextResponse.json({
      status: queueRow ? "queued" : "idle",
      queue: queueRow || null,
    });
  } catch (error) {
    console.error("[BATTLE_QUEUE_GET_ERROR]", error);
    return jsonError(error);
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await requireBattleProfile(userId);
    const activeBattle = await getActiveBattle(userId);
    if (activeBattle) {
      return NextResponse.json({ status: "matched", battleId: activeBattle.id });
    }

    const { data: opponent, error: opponentError } = await supabaseAdmin
      .from("battle_queue")
      .select("user_id, exam, joined_at")
      .eq("exam", profile.exam)
      .neq("user_id", userId)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (opponentError) throw opponentError;

    if (opponent?.user_id) {
      const match = await createBattleForPlayers({
        exam: profile.exam,
        playerAId: opponent.user_id,
        playerBId: userId,
      });
      return NextResponse.json({ status: "matched", battleId: match.id });
    }

    const { error: queueError } = await supabaseAdmin
      .from("battle_queue")
      .upsert(
        { user_id: userId, exam: profile.exam, joined_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (queueError) throw queueError;

    return NextResponse.json({ status: "queued" });
  } catch (error) {
    console.error("[BATTLE_QUEUE_POST_ERROR]", error);
    return jsonError(error);
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabaseAdmin.from("battle_queue").delete().eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[BATTLE_QUEUE_DELETE_ERROR]", error);
    return jsonError(error);
  }
}
