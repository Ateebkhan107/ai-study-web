import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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

  if (userError || !userRow) return null;

  const xp = Number(userRow.xp) || 0;
  const rankFilter = userRow.updated_at
    ? `xp.gt.${xp},and(xp.eq.${xp},updated_at.lt.${userRow.updated_at})`
    : `xp.gt.${xp}`;

  const { count, error: countError } = await supabaseAdmin
    .from("user_xp")
    .select("user_id", { count: "exact", head: true })
    .or(rankFilter);

  if (countError) return null;

  return toLeaderboardRow(userRow, (count || 0) + 1);
}

export async function GET() {
  const { userId } = await auth();

  const { data, error } = await supabaseAdmin
    .from("user_xp")
    .select(LEADERBOARD_COLUMNS)
    .order("xp", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leaderboard = (data || []).map((user, index) =>
    toLeaderboardRow(user, index + 1)
  );
  const currentUserRow = await getCurrentUserRankRow(userId, leaderboard);

  if (currentUserRow) {
    leaderboard.push({
      ...currentUserRow,
      isCurrentUserAppended: true,
    });
  }

  return NextResponse.json(leaderboard);
}
