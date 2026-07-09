"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { getLeaderboard } from "@/lib/leaderboard";



export default function Leaderboard() {


const [users,setUsers]=useState([]);





// =============================
// LOAD GLOBAL LEADERBOARD
// =============================


useEffect(()=>{


async function loadLeaderboard(){


try{


const data =
await getLeaderboard();



setUsers(
data || []
);



}

catch(error){


console.log(
"Leaderboard error:",
error
);


}



}



loadLeaderboard();



},[]);








return (

<div className="bg-white dark:bg-[#0b1020] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">



{/* HEADER */}


<div className="flex items-center gap-2 mb-6">


<Trophy size={24}/>


<h2 className="text-2xl font-black text-black dark:text-white">

Leaderboard

</h2>


</div>








<div className="space-y-4">



{


users.length===0 &&


<p className="text-gray-400">

No rankings yet

</p>


}








{


users.map((user,index)=>(



<div

key={user.user_id}

className="
bg-gray-50
dark:bg-gray-900
rounded-xl
p-5
flex
justify-between
items-center
"

>




{/* LEFT SIDE */}


<div className="flex gap-4 items-center">





{/* RANK */}


<div className="text-xl font-black">


{

index===0

?

"🥇"

:

index===1

?

"🥈"

:

index===2

?

"🥉"

:

`#${index+1}`

}


</div>








{/* USER INFO */}


<div>




<h3 className="font-bold text-black dark:text-white">


{user.name || "Student"}


</h3>






<p className="text-sm text-gray-400">


🔥 {user.xp} XP earned


</p>








{/* LEVEL BADGE */}


<span

className="
mt-2
inline-flex
text-xs
font-bold
bg-gray-200
dark:bg-gray-800
rounded-full
px-2
py-1
"

>


{user.badge}

{" "}

Level {user.level}



</span>




</div>



</div>









{/* XP */}


<div className="font-black text-xl text-black dark:text-white">


{user.xp}


<span className="text-sm ml-1">

XP

</span>



</div>





</div>



))


}



</div>



</div>


);



}