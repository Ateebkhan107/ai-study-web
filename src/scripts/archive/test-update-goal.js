import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const userId = "test_user";
  const today = new Date().toISOString().split("T")[0];

  const { data: goals, error: goalsError } = await supabase
    .from("daily_goals")
    .select("*")
    .limit(1);

//   console.log("Goals error:", goalsError);
  if (!goals || goals.length === 0) {
//     console.log("No goals found.");
    return;
  }
  const goal = goals[0];
//   console.log("Found goal:", goal.id);

  const { error: upsertError } = await supabase
    .from("user_daily_goals")
    .upsert({
      user_id: userId,
      goal_id: goal.id,
      goal_date: today,
      progress: 1,
      completed: false
    }, { onConflict: "user_id,goal_id,goal_date" });

//   console.log("Upsert Error:", upsertError);

  const { data: existing, error: existError } = await supabase
    .from("user_daily_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("goal_id", goal.id);
  
//   console.log("Select exist Error:", existError);
//   console.log("Existing:", existing);
}

run();
