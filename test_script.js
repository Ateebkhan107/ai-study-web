import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const userId = "user_3FgjqTcmSsYJBs8Q3KH9WFV6tPp";
  const goalType = "TEST";
  const today = new Date().toISOString().split("T")[0];

  const { data: goals, error } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("is_active", true)
        .eq("goal_type", goalType);

  console.log("Goals:", goals);

  for (const goal of goals) {
    const { data: existing } = await supabase
        .from("user_daily_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("goal_id", goal.id)
        .eq("goal_date", today)
        .maybeSingle();

    console.log("Existing:", existing);
    
    const newProgress = (existing?.progress || 0) + 1;
    const completed = newProgress >= goal.target_value;

    if (existing) {
      console.log("Updating to progress:", newProgress);
      const {error} = await supabase.from("user_daily_goals").update({
        progress: newProgress,
        completed,
        completed_at: completed && !existing.completed ? new Date().toISOString() : existing.completed_at
      }).eq("id", existing.id);
      console.log("Update error:", error);
    } else {
      console.log("Inserting new row for progress:", newProgress);
      const {error} = await supabase.from("user_daily_goals").insert({
        user_id: userId,
        goal_id: goal.id,
        goal_date: today,
        progress: newProgress,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      });
      console.log("Insert error:", error);
    }
  }
}

run();
