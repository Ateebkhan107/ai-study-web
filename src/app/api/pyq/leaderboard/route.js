import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDisplayNameFromClaims } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLevelFromXP } from "@/utils/levelEngine";

const LEADERBOARD_COLUMNS = [
  "user_id",
  "name",
  "xp",
  "pyq_solved",
  "correct_answers",
  "accuracy",
  "updated_at",
].join(", ");

function toLeaderboardRow(user, rank) {
  const levelData = getLevelFromXP(user.xp || 0);

  return {
    rank,
    user_id: user.user_id,
    name: user.name,
    xp: user.xp || 0,
    solved: user.pyq_solved || 0,
    correct: user.correct_answers || 0,
    accuracy: user.accuracy || 0,
    level: levelData.currentLevel,
    badge: levelData.title,
    progress: levelData.progressPercentage,
  };
}

async function getCurrentUserRankRow(userId, topRows) {
  if (!userId || topRows.some((row) => row.user_id === userId)) return null;

  const { data: userRow, error: userError } = await supabaseAdmin
    .from("user_xp")
    .select(LEADERBOARD_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (userError) throw userError;
  if (!userRow) return null;

  const xp = Number(userRow.xp) || 0;
  const rankFilter = userRow.updated_at
    ? `xp.gt.${xp},and(xp.eq.${xp},updated_at.lt.${userRow.updated_at})`
    : `xp.gt.${xp}`;

  const { count, error: countError } = await supabaseAdmin
    .from("user_xp")
    .select("user_id", { count: "exact", head: true })
    .or(rankFilter);

  if (countError) throw countError;

  return toLeaderboardRow(userRow, (count || 0) + 1);
}

export async function GET(request) {
  const { userId, sessionClaims } = await auth();
  const topOnly = new URL(request.url).searchParams.get("view") === "top";

  const [{ data, error }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from("user_xp")
      .select(LEADERBOARD_COLUMNS)
      .order("xp", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(10),
    userId
      ? supabaseAdmin
          .from("user_profiles")
          .select("full_name")
          .eq("clerk_user_id", userId)
          .maybeSingle()
      : { data: null },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leaderboard = (data || []).map((user, index) =>
    toLeaderboardRow(user, index + 1)
  );
  const displayName = profile?.full_name?.trim() || getDisplayNameFromClaims(sessionClaims).trim();
  let currentUserRow;
  let rankUnavailable = false;

  if (!topOnly) {
    try {
      currentUserRow = await getCurrentUserRankRow(userId, leaderboard);
    } catch (rankError) {
      console.error("[PYQ_LEADERBOARD_RANK_ERROR]", rankError);
      rankUnavailable = true;
    }
  }

  if (currentUserRow) {
    leaderboard.push({
      ...currentUserRow,
      isCurrentUserAppended: true,
    });
  }

  const ownRow = userId && leaderboard.find((row) => row.user_id === userId);
  if (ownRow) {
    ownRow.name = displayName || ownRow.name;
  }

  return NextResponse.json(topOnly ? { rows: leaderboard, displayName } : leaderboard, {
    headers: {
      "Cache-Control": "private, no-store",
      ...(rankUnavailable ? { "X-PrepZii-Rank-Unavailable": "1" } : {}),
    },
  });
}
