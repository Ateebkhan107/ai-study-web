import { supabase } from "@/lib/supabaseClient";
import { addXP } from "./xp";


// =================================
// UPDATE DAILY GOAL PROGRESS
// =================================

export async function updateGoalProgress(
userId,
goalType,
amount=1,
name="Student"
){


if(!userId) return;



const today =
new Date()
.toISOString()
.split("T")[0];



// get active goals

const {data:goals,error}=await supabase

.from("daily_goals")

.select("*")

.eq(
"goal_type",
goalType
)

.eq(
"is_active",
true
);




if(error){

console.log(
"Goal fetch error",
error
);

return;

}



for(const goal of goals){



// check existing progress

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




let newProgress =
(existing?.progress || 0)
+
amount;



let completed =
newProgress >= goal.target_value;




if (existing) {
  await supabase.from("user_daily_goals").update({
    progress: newProgress,
    completed
  }).eq("id", existing.id);
} else {
  await supabase.from("user_daily_goals").insert({
    user_id: userId,
    goal_id: goal.id,
    goal_date: today,
    progress: newProgress,
    completed
  });
}




// ===============================
// GIVE XP ONLY FIRST TIME
// ===============================

if(
completed &&
!existing?.completed
){


await addXP(
userId,
goal.xp,
name
);


console.log(
`Goal completed +${goal.xp} XP 🔥`
);


}



}



}