import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: xpData, error: xpError } = await supabaseAdmin
      .from("user_xp")
      .select("xp, pyq_solved, correct_answers, streak")
      .eq("user_id", userId)
      .maybeSingle();

    if (xpError) {
      throw xpError;
    }

    const xp = xpData?.xp || 0;
    const pyqSolved = xpData?.pyq_solved || 0;
    const correctAnswers = xpData?.correct_answers || 0;
    const streak = xpData?.streak || 0;

    const accuracy = pyqSolved
      ? Math.round((correctAnswers / pyqSolved) * 100)
      : 0;

    let rank = null;

    if (xpData) {
      const { data: leaderboardData, error: rankError } = await supabaseAdmin
        .from("user_xp")
        .select("user_id, xp, updated_at")
        .order("xp", { ascending: false })
        .order("updated_at", { ascending: true });

      if (rankError) {
        throw rankError;
      }

      const usersById = new Map();

      for (const entry of leaderboardData || []) {
        const entryUserId = String(entry.user_id || "").trim();
        if (!entryUserId) continue;

        const existing = usersById.get(entryUserId);
        const entryXp = Number(entry.xp) || 0;
        const existingXp = Number(existing?.xp) || 0;
        const entryUpdatedAt = entry.updated_at
          ? new Date(entry.updated_at).getTime()
          : Number.MAX_SAFE_INTEGER;
        const existingUpdatedAt = existing?.updated_at
          ? new Date(existing.updated_at).getTime()
          : Number.MAX_SAFE_INTEGER;

        if (
          !existing ||
          entryXp > existingXp ||
          (entryXp === existingXp && entryUpdatedAt < existingUpdatedAt)
        ) {
          usersById.set(entryUserId, entry);
        }
      }

      const rankedUsers = [...usersById.values()].sort((a, b) => {
        const xpDifference = (Number(b.xp) || 0) - (Number(a.xp) || 0);
        if (xpDifference !== 0) return xpDifference;

        const aUpdatedAt = a.updated_at
          ? new Date(a.updated_at).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bUpdatedAt = b.updated_at
          ? new Date(b.updated_at).getTime()
          : Number.MAX_SAFE_INTEGER;
        return aUpdatedAt - bUpdatedAt;
      });

      const userIndex = rankedUsers.findIndex(
        (entry) => String(entry.user_id).trim() === userId
      );
      rank = userIndex >= 0 ? userIndex + 1 : null;
    }

    return NextResponse.json({
      accuracy,
      rank,
      streak,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
