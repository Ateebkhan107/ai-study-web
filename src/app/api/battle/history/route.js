import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function resultFor(match, userId) {
  if (!match.winner_user_id) return "Draw";
  return match.winner_user_id === userId ? "Won" : "Lost";
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: playerRows, error: playersError } = await supabaseAdmin
      .from("battle_players")
      .select("battle_id, score, correct_count, wrong_count, skipped_count, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (playersError) throw playersError;

    const battleIds = (playerRows || []).map((row) => row.battle_id);
    if (battleIds.length === 0) return NextResponse.json({ history: [] });

    const [{ data: matches, error: matchesError }, { data: allPlayers, error: allPlayersError }] = await Promise.all([
      supabaseAdmin
        .from("battle_matches")
        .select("id, exam, status, winner_user_id, started_at, finished_at, created_at")
        .in("id", battleIds)
        .eq("status", "FINISHED")
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("battle_players")
        .select("battle_id, user_id, score")
        .in("battle_id", battleIds),
    ]);

    if (matchesError) throw matchesError;
    if (allPlayersError) throw allPlayersError;

    const opponentIds = [
      ...new Set((allPlayers || []).filter((player) => player.user_id !== userId).map((player) => player.user_id)),
    ];
    const { data: profiles, error: profilesError } = opponentIds.length
      ? await supabaseAdmin
        .from("user_profiles")
        .select("clerk_user_id, username, full_name")
        .in("clerk_user_id", opponentIds)
      : { data: [], error: null };
    if (profilesError) throw profilesError;

    const profileById = new Map((profiles || []).map((profile) => [profile.clerk_user_id, profile]));
    const playersByBattle = new Map();
    for (const player of allPlayers || []) {
      if (!playersByBattle.has(player.battle_id)) playersByBattle.set(player.battle_id, []);
      playersByBattle.get(player.battle_id).push(player);
    }

    const history = (matches || []).map((match) => {
      const players = playersByBattle.get(match.id) || [];
      const me = players.find((player) => player.user_id === userId);
      const opponent = players.find((player) => player.user_id !== userId);
      const opponentProfile = profileById.get(opponent?.user_id);
      return {
        id: match.id,
        result: resultFor(match, userId),
        score: `${me?.score ?? 0} - ${opponent?.score ?? 0}`,
        exam: match.exam,
        date: match.finished_at || match.created_at,
        opponent: {
          username: opponentProfile?.username || null,
          displayName: opponentProfile?.full_name || "PrepZii Student",
        },
      };
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[BATTLE_HISTORY_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
