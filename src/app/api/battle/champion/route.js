import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ isChampion: false });

    // Check for unseen awards in database
    const { data: awards, error } = await supabaseAdmin
      .from("battle_season_awards")
      .select("id, season_id, rank, badge_name, badge_key, arena_rating, wins, celebration_seen")
      .eq("user_id", userId)
      .eq("celebration_seen", false)
      .order("awarded_at", { ascending: false })
      .limit(1);

    if (error || !awards || awards.length === 0) {
      return NextResponse.json({ isChampion: false, award: null });
    }

    const award = awards[0];
    return NextResponse.json({
      isChampion: award.rank === 1,
      award,
    });
  } catch (error) {
    console.error("[BATTLE_CHAMPION_GET_ERROR]", error);
    return NextResponse.json({ isChampion: false, award: null });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { awardId } = body;

    if (awardId) {
      await supabaseAdmin
        .from("battle_season_awards")
        .update({ celebration_seen: true })
        .eq("id", awardId)
        .eq("user_id", userId);
    } else {
      await supabaseAdmin
        .from("battle_season_awards")
        .update({ celebration_seen: true })
        .eq("user_id", userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BATTLE_CHAMPION_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
