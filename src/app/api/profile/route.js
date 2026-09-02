import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createProfileIfNotExists } from "@/services/profile.service";
import { getLevelFromXP } from "@/utils/levelEngine";

const PROFILE_COLUMNS = "id, clerk_user_id, email, full_name, username, exam, target_year, account_type, created_at, updated_at";
const XP_COLUMNS = "xp, pyq_solved, correct_answers, accuracy, streak";

async function getGlobalRank(userId, xp) {
  if (!userId) return null;

  const { count, error } = await supabaseAdmin
    .from("user_xp")
    .select("id", { count: "exact", head: true })
    .gt("xp", xp);

  if (error) {
    throw error;
  }

  return (count || 0) + 1;
}

async function getOrCreateProfile(userId) {
  const { data: profile, error } = await supabaseAdmin
    .from("user_profiles")
    .select(PROFILE_COLUMNS)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (profile) {
    return profile;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  return createProfileIfNotExists(user);
}

async function getProfileXp(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_xp")
    .select(XP_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [profile, xpData] = await Promise.all([
      getOrCreateProfile(userId),
      getProfileXp(userId),
    ]);

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const xp = xpData?.xp || 0;
    const levelStats = getLevelFromXP(xp);
    const rank = await getGlobalRank(userId, xp);

    return NextResponse.json({
      ...profile,
      current_track: profile.exam?.toLowerCase() || "jee",
      target_year: profile.target_year || new Date().getFullYear(),
      xp,
      pyq_solved: xpData?.pyq_solved || 0,
      correct_answers: xpData?.correct_answers || 0,
      accuracy: xpData?.accuracy || 0,
      streak: xpData?.streak || 0,
      rank,
      level: levelStats.currentLevel,
      badge: levelStats.title,
      progress: levelStats.progressPercentage,
    });
  } catch (error) {
    console.error("[PROFILE_FETCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
