"use server";

import { supabase } from "@/lib/supabaseClient";
import { addXP } from "./xp";


export async function updateGoalProgress(
userId,
goalType,
amount = 1
){


if(!userId || !goalType) return;


const today = new Date().toISOString().split("T")[0];

// 1. Find active goals


const {data:goals,error}=await supabase

.from("daily_goals")

.select("*")

.eq(
"is_active",
true
)

.eq(
"goal_type",
goalType
);



if(error){

console.log(
"Goal fetch error",
error
);

return;

}






for(const goal of goals){



    // 2. Check existing progress (ANY day)
    const { data: existing } = await supabase
      .from("user_daily_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("goal_id", goal.id)
      .maybeSingle();

    let newProgress = amount;
    let isNewDay = false;

    if (existing) {
      if (existing.goal_date === today) {
        newProgress = (existing.progress || 0) + amount;
      } else {
        isNewDay = true;
        newProgress = amount; // Reset for today
      }
    }

    const completed = newProgress >= goal.target_value;

    // 3. Save progress
    if (existing) {
      await supabase
        .from("user_daily_goals")
        .update({
          goal_date: today,
          progress: newProgress,
          completed,
          completed_at:
            completed && (!existing.completed || isNewDay)
              ? new Date().toISOString()
              : existing.completed_at,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_daily_goals").insert({
        user_id: userId,
        goal_id: goal.id,
        goal_date: today,
        progress: newProgress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      });
    }

    // 4. Give XP only on first completion of the day
    if (completed && (!existing?.completed || isNewDay)) {
      await addXP(userId, goal.xp, "Student");
    }



}



}