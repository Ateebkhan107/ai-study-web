import { supabase } from "@/lib/supabase";


// ===============================
// UPDATE DAILY GOAL PROGRESS + XP
// ===============================

export async function updateGoalProgress(
  userId,
  goalType,
  amount = 1
){


if(!userId) return;



// get active goals

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



// check user progress

const today = new Date()
.toISOString()
.split("T")[0];



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

(existing?.progress || 0)

+

amount;



const completed =

newProgress >= goal.target_value;






// save progress

await supabase

.from("user_daily_goals")

.upsert(
{

user_id:userId,

goal_id:goal.id,

goal_date:today,

progress:newProgress,

completed,

completed_at:
completed ? new Date() : null

},

{

onConflict:

"user_id,goal_id,goal_date"

}

);






// GIVE XP ONLY FIRST TIME

if(
completed &&
!existing?.completed
){


await supabase.rpc(

"add_user_xp",

{

uid:userId,

amount:goal.xp

}

);


}



}


}