import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getFirstNameFromClaims } from "@/lib/auth";
import { initializeXp, integrityEnabled } from "@/lib/integrity.server.mjs";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingXp, error: xpError } = await supabaseAdmin
      .from("user_xp")
      .select("name, xp, pyq_solved, correct_answers, streak, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (xpError) {
      throw xpError;
    }

    // The layout schedules initialization after rendering. A first visit can
    // reach this route sooner, so recover the row here if needed.
    const xpData = !existingXp && integrityEnabled()
      ? await initializeXp(supabaseAdmin, userId, getFirstNameFromClaims(sessionClaims) || "Student")
      : existingXp;

    const xp = xpData?.xp || 0;
    const pyqSolved = xpData?.pyq_solved || 0;
    const correctAnswers = xpData?.correct_answers || 0;
    const streak = xpData?.streak || 0;

    const accuracy = pyqSolved
      ? Math.round((correctAnswers / pyqSolved) * 100)
      : 0;

    let rank = null;
    let rankUnavailable = false;

    if (xpData) {
      const rankFilter = xpData.updated_at
        ? `xp.gt.${xp},and(xp.eq.${xp},updated_at.lt.${xpData.updated_at})`
        : `xp.gt.${xp}`;
      try {
        const { count, error } = await supabaseAdmin
          .from("user_xp")
          .select("id", { count: "exact", head: true })
          .or(rankFilter);
        if (error) throw error;
        rank = (count || 0) + 1;
      } catch (rankError) {
        console.error("[DASHBOARD_RANK_FETCH_ERROR]", rankError);
        rankUnavailable = true;
      }
    }

    return NextResponse.json({
      accuracy,
      rank,
      rankUnavailable,
      streak,
      xp,
      position: xpData ? { user_id: userId, name: xpData.name, xp } : null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[DASHBOARD_STATS_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
