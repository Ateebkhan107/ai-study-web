import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { battleDatabaseError, getBattleProfile } from "@/lib/battle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function manageQueue(action) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin.rpc("battle_manage_queue", {
      p_user_id: userId,
      p_action: action,
    });
    if (error) throw battleDatabaseError(error);

    if (data.status === "matched") {
      const opponent = data.opponentId
        ? await getBattleProfile(data.opponentId).catch(() => null)
        : null;
      return NextResponse.json({ status: data.status, battleId: data.battleId, opponent });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[BATTLE_QUEUE_ERROR]", error);
    return NextResponse.json({ error: error.status ? error.message : "Matchmaking is temporarily unavailable." }, {
      status: error.status || 500,
    });
  }
}

export async function GET() {
  return manageQueue("poll");
}

export async function POST() {
  return manageQueue("join");
}

export async function DELETE() {
  return manageQueue("leave");
}
