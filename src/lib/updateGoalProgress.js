import { supabase } from "@/lib/supabaseClient";


export async function updateGoalProgress(
userId,
goalType,
amount = 1
){


if(!userId || !goalType) return;




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

.maybeSingle();




const newProgress =

(existing?.progress || 0) + amount;




const completed =

newProgress >= goal.target_value;







// 3. Save progress


await supabase

.from("user_daily_goals")

.upsert({

user_id:userId,

goal_id:goal.id,

progress:newProgress,

completed,

completed_at:

completed

?

new Date()

:

null

});








// 4. Give XP only first completion


if(

completed &&

!existing?.completed

){



await supabase.rpc(

"increment_xp",

{

uid:userId,

amount:goal.xp

}

);



}



}



}