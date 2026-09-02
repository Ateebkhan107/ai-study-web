import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Query real logged events from battle_events table
    const { data: rawEvents } = await supabaseAdmin
      .from("battle_events")
      .select("id, event_type, user_id, opponent_id, message, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    const eventList = rawEvents ? [...rawEvents] : [];

    // 2. If events are fewer than 10, query recent finished matches to synthesize real events
    if (eventList.length < 10) {
      try {
        const { data: finishedMatches } = await supabaseAdmin
          .from("battle_matches")
          .select("id, exam, status, winner_user_id, finished_at, created_at")
          .eq("status", "FINISHED")
          .order("created_at", { ascending: false })
          .limit(10);

        if (finishedMatches && finishedMatches.length > 0) {
          const battleIds = finishedMatches.map((m) => m.id);
          const { data: players } = await supabaseAdmin
            .from("battle_players")
            .select("battle_id, user_id, score")
            .in("battle_id", battleIds);

          const userIds = [...new Set((players || []).map((p) => p.user_id))];
          const { data: profiles } = userIds.length
            ? await supabaseAdmin
                .from("user_profiles")
                .select("clerk_user_id, username, full_name")
                .in("clerk_user_id", userIds)
            : { data: [] };

          const profileMap = new Map((profiles || []).map((p) => [p.clerk_user_id, p]));
          const playersByBattle = new Map();
          (players || []).forEach((p) => {
            if (!playersByBattle.has(p.battle_id)) playersByBattle.set(p.battle_id, []);
            playersByBattle.get(p.battle_id).push(p);
          });

          for (const match of finishedMatches) {
            const matchPlayers = playersByBattle.get(match.id) || [];
            if (matchPlayers.length >= 2 && match.winner_user_id) {
              const winner = matchPlayers.find((p) => p.user_id === match.winner_user_id);
              const loser = matchPlayers.find((p) => p.user_id !== match.winner_user_id);
              const winProf = winner ? profileMap.get(winner.user_id) : null;
              const loseProf = loser ? profileMap.get(loser.user_id) : null;

              const winnerName = winProf?.full_name || (winProf?.username ? `@${winProf.username}` : "Student");
              const loserName = loseProf?.full_name || (loseProf?.username ? `@${loseProf.username}` : "Opponent");
              const winScore = winner?.score ?? 0;
              const loseScore = loser?.score ?? 0;

              const synthesizedId = `match_${match.id}`;
              const alreadyExists = eventList.some(
                (e) => e.metadata?.battleId === match.id || e.id === synthesizedId
              );

              if (!alreadyExists) {
                eventList.push({
                  id: synthesizedId,
                  event_type: "match_finish",
                  user_id: match.winner_user_id,
                  opponent_id: loser?.user_id || null,
                  message: `${winnerName} defeated ${loserName} ${winScore}–${loseScore}`,
                  metadata: { battleId: match.id, score: `${winScore}-${loseScore}` },
                  created_at: match.finished_at || match.created_at || new Date().toISOString(),
                });
              }
            }
          }
        }
      } catch (synthErr) {
        console.error("[SYNTHESIZE_MATCH_EVENTS_ERROR]", synthErr);
      }
    }

    // Sort all events descending by created_at
    eventList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // If still empty, supply dynamic relative activity timestamps
    if (eventList.length === 0) {
      const now = Date.now();
      return NextResponse.json({
        events: [
          {
            id: "fallback_1",
            event_type: "match_finish",
            message: "Ateeb defeated Rahul 48–32",
            created_at: new Date(now - 1000 * 20).toISOString(),
          },
          {
            id: "fallback_2",
            event_type: "streak",
            message: "Priya reached a 5-win streak",
            created_at: new Date(now - 1000 * 75).toISOString(),
          },
          {
            id: "fallback_3",
            event_type: "tier_up",
            message: "Fatmi reached Gold tier",
            created_at: new Date(now - 1000 * 160).toISOString(),
          },
          {
            id: "fallback_4",
            event_type: "match_finish",
            message: "Ariza defeated Dev 40–35",
            created_at: new Date(now - 1000 * 320).toISOString(),
          },
        ],
      });
    }

    return NextResponse.json({ events: eventList.slice(0, 15) });
  } catch (error) {
    console.error("[BATTLE_FEED_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
