import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createProfileIfNotExists } from "@/services/profile.service";
import { getLevelFromXP } from "@/utils/levelEngine";
import { getEmailFromClaims, getDisplayNameFromClaims } from "@/lib/auth";

const PROFILE_COLUMNS = "id, clerk_user_id, email, full_name, username, exam, target_year, account_type, created_at, updated_at";
const XP_COLUMNS = "xp, pyq_solved, correct_answers, accuracy, streak";

async function getGlobalRank(xp) {
  const { count, error } = await supabaseAdmin
    .from("user_xp")
    .select("id", { count: "exact", head: true })
    .gt("xp", xp);

  if (error) throw error;
  return (count || 0) + 1;
}

async function createProfileFromClaims(userId, sessionClaims) {
  const emailAddress = getEmailFromClaims(sessionClaims);
  const fullName = getDisplayNameFromClaims(sessionClaims) || "Student";

  if (emailAddress || fullName) {
    return createProfileIfNotExists({
      id: userId,
      fullName,
      primaryEmailAddress: emailAddress ? { emailAddress } : null,
    });
  }

  const user = await currentUser();
  return user ? createProfileIfNotExists(user) : null;
}

async function getOrCreateProfile(userId, sessionClaims) {
  const { data: profile, error } = await supabaseAdmin
    .from("user_profiles")
    .select(PROFILE_COLUMNS)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return profile || createProfileFromClaims(userId, sessionClaims);
}

async function getProfileXp(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_xp")
    .select(XP_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function getProfilePageData(userId, sessionClaims = null) {
  const [profile, xpData] = await Promise.all([
    getOrCreateProfile(userId, sessionClaims),
    getProfileXp(userId),
  ]);

  if (!profile) return null;

  const xp = xpData?.xp || 0;
  const [levelStats, rank] = await Promise.all([
    Promise.resolve(getLevelFromXP(xp)),
    getGlobalRank(xp),
  ]);

  return {
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
  };
}
