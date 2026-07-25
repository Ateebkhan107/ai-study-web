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



// 2. Check existing progress


const {data:existing}=await supabase

.from("user_daily_goals")

.select("*")

.eq(
"user_id",
userId
)

.eq(
"goal_id",
goal.id
)

.eq(
"goal_date",
today
)

.maybeSingle();




const newProgress =

(existing?.progress || 0) + amount;




const completed =

newProgress >= goal.target_value;







// 3. Save progress

if (existing) {
  await supabase.from("user_daily_goals").update({
    progress: newProgress,
    completed,
    completed_at: completed && !existing.completed ? new Date().toISOString() : existing.completed_at
  }).eq("id", existing.id);
} else {
  await supabase.from("user_daily_goals").insert({
    user_id: userId,
    goal_id: goal.id,
    goal_date: today,
    progress: newProgress,
    completed,
    completed_at: completed ? new Date().toISOString() : null
  });
}

// 4. Give XP only first completion

if(
completed &&
!existing?.completed
){
  await addXP(userId, goal.xp, "Student");
}



}



}