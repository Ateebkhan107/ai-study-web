import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentSeasonId, getRatingTier, ensureSeason } from "@/lib/battle";

export async function GET(request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const requestedSeason = searchParams.get("season") || getCurrentSeasonId();

    // Ensure current season is in database
    if (requestedSeason !== "all-time") {
      await ensureSeason(requestedSeason).catch(() => {});
    }

    // Fetch active seasons list for selector
    const { data: seasonsList } = await supabaseAdmin
      .from("battle_seasons")
      .select("id, name, started_at, ends_at, is_active, champion_user_id")
      .order("id", { ascending: false })
      .limit(12);

    let leaderboardRows = [];
    let myRankData = null;

    if (requestedSeason === "all-time") {
      // Query all-time stats
      let { data: allTimeStats, error: statsError } = await supabaseAdmin
        .from("battle_stats")
        .select("user_id, arena_rating, peak_rating, wins, losses, draws, win_streak, best_streak, total_battles")
        .order("arena_rating", { ascending: false })
        .order("wins", { ascending: false })
        .limit(50);

      if (statsError) {
        const fallback = await supabaseAdmin
          .from("battle_stats")
          .select("user_id, wins, losses, draws, total_battles")
          .order("wins", { ascending: false })
          .limit(50);
        allTimeStats = fallback.data || [];
        statsError = null;
      }

      const userIds = (allTimeStats || []).map((s) => s.user_id);
      if (userId && !userIds.includes(userId)) {
        userIds.push(userId);
      }

      const { data: profiles } = userIds.length
        ? await supabaseAdmin
            .from("user_profiles")
            .select("clerk_user_id, username, full_name, exam")
            .in("clerk_user_id", userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map((p) => [p.clerk_user_id, p]));

      leaderboardRows = (allTimeStats || []).map((row, idx) => {
        const p = profileMap.get(row.user_id);
        const rating = row.arena_rating || 1000;
        return {
          rank: idx + 1,
          userId: row.user_id,
          username: p?.username || "anonymous",
          displayName: p?.full_name || "PrepZii Student",
          exam: p?.exam || "JEE",
          arenaRating: rating,
          tier: getRatingTier(rating),
          wins: row.wins || 0,
          losses: row.losses || 0,
          draws: row.draws || 0,
          winStreak: row.win_streak || 0,
          totalBattles: row.total_battles || 0,
          isMe: Boolean(userId && row.user_id === userId),
        };
      });

      // Calculate myRank if user not in top 50
      if (userId) {
        const foundInTop = leaderboardRows.find((r) => r.isMe);
        if (foundInTop) {
          myRankData = foundInTop;
        } else {
          const { data: myStats } = await supabaseAdmin
            .from("battle_stats")
            .select("user_id, arena_rating, wins, losses, win_streak, total_battles")
            .eq("user_id", userId)
            .maybeSingle();

          if (myStats) {
            const { count: higherCount } = await supabaseAdmin
              .from("battle_stats")
              .select("user_id", { count: "exact", head: true })
              .gt("arena_rating", myStats.arena_rating || 1000);

            const p = profileMap.get(userId);
            const rating = myStats.arena_rating || 1000;
            myRankData = {
              rank: (higherCount || 0) + 1,
              userId,
              username: p?.username || "You",
              displayName: p?.full_name || "You",
              exam: p?.exam || "JEE",
              arenaRating: rating,
              tier: getRatingTier(rating),
              wins: myStats.wins || 0,
              losses: myStats.losses || 0,
              winStreak: myStats.win_streak || 0,
              totalBattles: myStats.total_battles || 0,
              isMe: true,
            };
          }
        }
      }
    } else {
      // Query seasonal stats
      const { data: seasonStats, error: seasonError } = await supabaseAdmin
        .from("battle_season_stats")
        .select("user_id, arena_rating, peak_rating, wins, losses, draws, win_streak, best_streak, total_battles")
        .eq("season_id", requestedSeason)
        .order("arena_rating", { ascending: false })
        .order("wins", { ascending: false })
        .limit(50);

      if (!seasonError && seasonStats && seasonStats.length > 0) {
        const userIds = seasonStats.map((s) => s.user_id);
        if (userId && !userIds.includes(userId)) {
          userIds.push(userId);
        }

        const { data: profiles } = await supabaseAdmin
          .from("user_profiles")
          .select("clerk_user_id, username, full_name, exam")
          .in("clerk_user_id", userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.clerk_user_id, p]));

        leaderboardRows = seasonStats.map((row, idx) => {
          const p = profileMap.get(row.user_id);
          const rating = row.arena_rating || 1000;
          return {
            rank: idx + 1,
            userId: row.user_id,
            username: p?.username || "anonymous",
            displayName: p?.full_name || "PrepZii Student",
            exam: p?.exam || "JEE",
            arenaRating: rating,
            tier: getRatingTier(rating),
            wins: row.wins || 0,
            losses: row.losses || 0,
            draws: row.draws || 0,
            winStreak: row.win_streak || 0,
            totalBattles: row.total_battles || 0,
            isMe: Boolean(userId && row.user_id === userId),
          };
        });

        if (userId) {
          const foundInTop = leaderboardRows.find((r) => r.isMe);
          if (foundInTop) {
            myRankData = foundInTop;
          } else {
            const { data: myStats } = await supabaseAdmin
              .from("battle_season_stats")
              .select("user_id, arena_rating, wins, losses, win_streak, total_battles")
              .eq("season_id", requestedSeason)
              .eq("user_id", userId)
              .maybeSingle();

            if (myStats) {
              const { count: higherCount } = await supabaseAdmin
                .from("battle_season_stats")
                .select("user_id", { count: "exact", head: true })
                .eq("season_id", requestedSeason)
                .gt("arena_rating", myStats.arena_rating || 1000);

              const p = profileMap.get(userId);
              const rating = myStats.arena_rating || 1000;
              myRankData = {
                rank: (higherCount || 0) + 1,
                userId,
                username: p?.username || "You",
                displayName: p?.full_name || "You",
                exam: p?.exam || "JEE",
                arenaRating: rating,
                tier: getRatingTier(rating),
                wins: myStats.wins || 0,
                losses: myStats.losses || 0,
                winStreak: myStats.win_streak || 0,
                totalBattles: myStats.total_battles || 0,
                isMe: true,
              };
            }
          }
        }
      } else {
        let { data: fallbackStats } = await supabaseAdmin
          .from("battle_stats")
          .select("user_id, arena_rating, wins, losses, win_streak, total_battles")
          .order("arena_rating", { ascending: false })
          .limit(50);

        if (!fallbackStats) {
          const fb = await supabaseAdmin
            .from("battle_stats")
            .select("user_id, wins, losses, total_battles")
            .order("wins", { ascending: false })
            .limit(50);
          fallbackStats = fb.data || [];
        }

        const userIds = (fallbackStats || []).map((s) => s.user_id);
        if (userId && !userIds.includes(userId)) userIds.push(userId);

        const { data: profiles } = userIds.length
          ? await supabaseAdmin
              .from("user_profiles")
              .select("clerk_user_id, username, full_name, exam")
              .in("clerk_user_id", userIds)
          : { data: [] };

        const profileMap = new Map((profiles || []).map((p) => [p.clerk_user_id, p]));

        leaderboardRows = (fallbackStats || []).map((row, idx) => {
          const p = profileMap.get(row.user_id);
          const rating = row.arena_rating || 1000;
          return {
            rank: idx + 1,
            userId: row.user_id,
            username: p?.username || "anonymous",
            displayName: p?.full_name || "PrepZii Student",
            exam: p?.exam || "JEE",
            arenaRating: rating,
            tier: getRatingTier(rating),
            wins: row.wins || 0,
            losses: row.losses || 0,
            draws: 0,
            winStreak: row.win_streak || 0,
            totalBattles: row.total_battles || 0,
            isMe: Boolean(userId && row.user_id === userId),
          };
        });

        if (userId) {
          const foundInTop = leaderboardRows.find((r) => r.isMe);
          if (foundInTop) {
            myRankData = foundInTop;
          }
        }
      }
    }

    return NextResponse.json({
      season: requestedSeason,
      seasons: (seasonsList || []).map((s) => ({ id: s.id, name: s.name, is_active: s.is_active })),
      leaderboard: leaderboardRows,
      myRank: myRankData,
    });
  } catch (error) {
    console.error("[BATTLE_LEADERBOARD_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
