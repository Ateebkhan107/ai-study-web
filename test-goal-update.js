import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const userId = "user_2test123";
  const goalType = "FORMULA";
  const amount = 1;
  const today = new Date().toISOString().split("T")[0];

  console.log("1. Fetching active goals for", goalType);
  const { data: goals, error: fetchError } = await supabase
    .from("daily_goals")
    .select("*")
    .eq("goal_type", goalType)
    .eq("is_active", true);

  if (fetchError) {
    console.error("Fetch error:", fetchError);
    return;
  }
  console.log("Found goals:", goals);

  if (!goals || goals.length === 0) {
    console.log("No active goals found for", goalType);
    return;
  }

  for (const goal of goals) {
    console.log("2. Checking existing progress for goal", goal.id);
    const { data: existing, error: existError } = await supabase
      .from("user_daily_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("goal_id", goal.id)
      .eq("goal_date", today)
      .maybeSingle();

    if (existError) {
      console.error("Check existing error:", existError);
    }
    console.log("Existing:", existing);

    const newProgress = (existing?.progress || 0) + amount;
    const completed = newProgress >= goal.target_value;

    console.log("3. Updating with new progress:", newProgress, "completed:", completed);
    
    if (existing) {
      const { error: updateError } = await supabase.from("user_daily_goals").update({
        progress: newProgress,
        completed
      }).eq("id", existing.id);
      if (updateError) console.error("Update error:", updateError);
      else console.log("Update success");
    } else {
      const { error: insertError } = await supabase.from("user_daily_goals").insert({
        user_id: userId,
        goal_id: goal.id,
        goal_date: today,
        progress: newProgress,
        completed
      });
      if (insertError) console.error("Insert error:", insertError);
      else console.log("Insert success");
    }
  }
}
test();
