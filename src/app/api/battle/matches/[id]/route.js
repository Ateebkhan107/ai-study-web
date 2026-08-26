import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBattleForUser, hydratePlayerProgress } from "@/lib/battle";

function jsonError(error, fallback = 500) {
  return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: error.status || fallback });
}

export async function GET(_request, context) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const battle = await hydratePlayerProgress(await getBattleForUser({ battleId: id, userId }));
    return NextResponse.json({ battle });
  } catch (error) {
    console.error("[BATTLE_MATCH_GET_ERROR]", error);
    return jsonError(error);
  }
}
