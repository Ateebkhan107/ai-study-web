import { supabase } from "@/lib/supabaseClient";

export async function updateStreak(userId) {
  if (!userId) return;

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Get current streak
  const { data: userData, error } = await supabase
    .from("user_xp")
    .select("streak, last_study_date")
    .eq("user_id", userId)
    .single();

  if (error || !userData) {
    console.error("Failed to fetch streak:", error);
    return;
  }

  const currentStreak = userData.streak || 0;
  const lastStudyDate = userData.last_study_date;

  // Already studied today
  if (lastStudyDate === todayString) {
    return;
  }

  let newStreak = 1;

  if (lastStudyDate) {
    const last = new Date(lastStudyDate);
    const diffDays = Math.floor(
      (today - last) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      newStreak = currentStreak + 1;
    }
  }

  const { error: updateError } = await supabase
    .from("user_xp")
    .update({
      streak: newStreak,
      last_study_date: todayString,
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update streak:", updateError);
  }
}