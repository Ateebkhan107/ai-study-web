"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";


export default function DailyGoals(){


const {user}=useUser();


const [goals,setGoals]=useState([]);

const [track,setTrack]=useState(null);





// =============================
// LOAD USER EXAM
// =============================


useEffect(()=>{


if(!user) return;



async function loadUser(){



const {data}=await supabase


.from("user_profiles")


.select("exam")


.eq(

"clerk_user_id",

user.id

)


.single();





setTrack(

data?.exam || "JEE"

);



}



loadUser();



},[user]);









// =============================
// LOAD DAILY GOALS
// =============================


useEffect(()=>{


if(!track || !user) return;



async function loadGoals(){



const today = new Date()
.toISOString()
.split("T")[0];



const {data,error}=await supabase


.from("daily_goals")


.select(`

*,

user_daily_goals(

user_id,

progress,

completed,

goal_date

)

`)


.eq(

"is_active",

true

)


.in(

"target",

[

track,

"ALL"

]

)


.order(

"created_at",

{

ascending:false

}

);






if(error){



console.log(

"Daily goals error:",

error

);



return;



}






const formatted=(data || []).map(

(goal)=>{



const progressData = goal.user_daily_goals?.find(

(item)=>

item.user_id===user.id

&&

item.goal_date===today

);





return {


...goal,


progress:progressData?.progress || 0,


completed:progressData?.completed || false



};



}

);






setGoals(

formatted

);



}




loadGoals();



},[track, user?.id]);









const completed = goals.filter(

(g)=>g.completed

).length;





const percentage = goals.length

?

(completed/goals.length)*100

:

0;










return (

<div className="bg-white dark:bg-[#1a1d2e] border border-gray-200 dark:border-[#2a2d3e] rounded-2xl p-5 shadow-sm transition-colors duration-200">



<div className="flex items-center justify-between mb-4">


<div>


<h2 className="text-xs font-bold text-black dark:text-[#e8eaf6] uppercase tracking-widest">

Daily Goals

</h2>




<p className="text-xs text-gray-500 dark:text-[#9396a8] mt-0.5">


{completed} of {goals.length} completed today


</p>



</div>







<div className="flex items-center gap-2">


<div className="w-24 h-1.5 bg-gray-200 dark:bg-[#232740] rounded-full overflow-hidden">


<div

className="h-full bg-indigo-500 rounded-full transition-all duration-500"

style={{

width:`${percentage}%`

}}

/>


</div>




<span className="text-xs font-bold text-black dark:text-[#e8eaf6]">


{Math.round(percentage)}%


</span>



</div>


</div>









<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">



{


goals.map((goal)=>(



<div


key={goal.id}


className={`relative rounded-xl p-3.5 border transition-all duration-200

${

goal.completed

?

"bg-emerald-50 dark:bg-emerald-500/8 border-emerald-200 dark:border-emerald-500/20"

:

"bg-gray-50 dark:bg-[#232740] border-gray-200 dark:border-[#2a2d3e]"

}`}

>






<div className="flex items-start justify-between mb-3">




<div

className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0

${

goal.completed

?

"bg-emerald-500 border-emerald-500"

:

"border-gray-300 dark:border-[#363a52]"

}`}

>



{

goal.completed && "✓"

}



</div>








<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">


+{goal.xp} XP


</span>





</div>









<p className="text-xs font-semibold leading-snug mb-2 text-black dark:text-[#e8eaf6]">


{goal.title}


</p>







<p className="text-[10px] text-gray-500">


{goal.description}


</p>








{


!goal.completed &&


<div className="mt-3">



<div className="w-full h-1 bg-gray-200 dark:bg-[#1a1d2e] rounded-full overflow-hidden">



<div

className="h-full bg-indigo-500 rounded-full"

style={{

width:`${Math.min(

(goal.progress / goal.target_value)*100,

100

)}%`

}}

/>



</div>





<p className="text-[10px] text-gray-400 mt-1">


{goal.progress}/{goal.target_value}


</p>




</div>


}






</div>


))


}



</div>



</div>


);


}