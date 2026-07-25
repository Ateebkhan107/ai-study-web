import { supabase } from "./supabaseClient";


// =============================
// GET GLOBAL LEADERBOARD (TOP 10)
// =============================
export async function getTopLeaderboard() {
  const { data, error } = await supabase
    .from("user_xp")
    .select(`
      id,
      user_id,
      name,
      xp,
      level,
      badge
    `)
    .order("xp", { ascending: false })
    .order("updated_at", { ascending: true }) // Earliest to reach that XP wins ties
    .limit(10);

  if (error) {
    console.log("Leaderboard error", error);
    return [];
  }

  return data || [];
}

// =============================
// GET USER SPECIFIC RANK
// =============================
export async function getUserRank(userId) {
  if (!userId) return null;

  // 1. Get the user's current XP and updated_at
  const { data: userData, error: userError } = await supabase
    .from("user_xp")
    .select("xp, updated_at")
    .eq("user_id", userId)
    .single();

  if (userError || !userData) {
    if (userError?.code !== 'PGRST116') {
      console.log("Error fetching user for rank:", userError);
    }
    return null;
  }

  const { xp, updated_at } = userData;

  // 2. Count users who have more XP, OR have the same XP but reached it earlier
  const { count, error: countError } = await supabase
    .from("user_xp")
    .select("*", { count: "exact", head: true })
    .or(`xp.gt.${xp},and(xp.eq.${xp},updated_at.lt.${updated_at})`);

  if (countError) {
    console.log("Error calculating rank count:", countError);
    return null;
  }

  return {
    rank: (count || 0) + 1, // rank is people ahead of you + 1
    userData
  };
}

// =============================
// AUTO-INITIALIZE NEW USER
// =============================
export async function initUserLeaderboard(userId, name) {
  if (!userId) return;

  const { error } = await supabase
    .from("user_xp")
    .upsert(
      {
        user_id: userId,
        name: name || "Student",
        xp: 0,
        level: 1,
        badge: "Explorer",
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (error) {
    console.log("Error initializing user leaderboard:", error);
  }
}