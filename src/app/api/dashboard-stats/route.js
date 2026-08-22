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
      .select("xp, pyq_solved, correct_answers, streak, updated_at")
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
      const rankFilter = xpData.updated_at
        ? `xp.gt.${xp},and(xp.eq.${xp},updated_at.lt.${xpData.updated_at})`
        : `xp.gt.${xp}`;
      const { count, error: rankError } = await supabaseAdmin
        .from("user_xp")
        .select("id", { count: "exact", head: true })
        .or(rankFilter);

      if (rankError) {
        throw rankError;
      }
      rank = (count || 0) + 1;
    }

    return NextResponse.json({
      accuracy,
      rank,
      streak,
      xp,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
