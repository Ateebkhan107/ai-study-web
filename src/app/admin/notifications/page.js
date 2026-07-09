"use client";

import { useEffect, useState } from "react";


export default function AdminNotifications(){


const [mounted,setMounted] = useState(false);


// NOTIFICATION STATES

const [title,setTitle] = useState("");

const [message,setMessage] = useState("");

const [href,setHref] = useState("");

const [target,setTarget] = useState("ALL");

const [loading,setLoading] = useState(false);



// DAILY GOAL STATES

const [goalTitle,setGoalTitle]=useState("");

const [goalDescription,setGoalDescription]=useState("");

const [goalType,setGoalType]=useState("PYQ");

const [goalTarget,setGoalTarget]=useState("ALL");

const [targetValue,setTargetValue]=useState("");

const [xp,setXp]=useState("");

const [goalLoading,setGoalLoading]=useState(false);

const [allGoals,setAllGoals]=useState([]);



useEffect(()=>{


setMounted(true);


},[]);


useEffect(()=>{


loadGoals();


},[]);





async function loadGoals(){


try{


const res = await fetch(
"/api/admin/goals"
);


const data = await res.json();



if(data.success){


setAllGoals(
data.goals
);


}



}

catch(error){


console.log(
"Goal load error",
error
);


}


}


if(!mounted){

return null;

}







// ==============================
// SEND NOTIFICATION
// ==============================


async function sendNotification(){


if(!title || !message){

alert("Fill title and message");

return;

}



setLoading(true);



try{


const res = await fetch(

"/api/admin/notifications",

{

method:"POST",


headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({


title,

message,

href:href.trim() || null,

target


})


}

);



const data = await res.json();



if(res.ok){


alert("Notification sent 🔔");


setTitle("");

setMessage("");

setHref("");

setTarget("ALL");


}

else{


alert("Failed");

console.log(data);


}



}

catch(error){


console.log(error);


alert("Something went wrong");


}



setLoading(false);



}








// ==============================
// CREATE DAILY GOAL
// ==============================


async function createGoal(){



if(
!goalTitle ||
!targetValue ||
!xp
){


alert("Fill goal details");

return;


}




setGoalLoading(true);




try{


const res = await fetch(

"/api/admin/goals",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({


title:goalTitle,


description:goalDescription,


goal_type:goalType,


target:goalTarget,


target_value:targetValue,


xp


})


}


);




const data = await res.json();



if(res.ok){


alert("Daily Goal Created 🎯");

loadGoals();

setGoalTitle("");

setGoalDescription("");

setGoalType("PYQ");

setGoalTarget("ALL");

setTargetValue("");

setXp("");



}

else{


console.log(data);

alert("Goal creation failed");


}




}

catch(error){


console.log(error);


alert("Something went wrong");


}




setGoalLoading(false);



}





async function updateGoal(
id,
changes
){


await fetch(

"/api/admin/goals",

{

method:"PATCH",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

id,

...changes

})

}

);



loadGoals();



}






async function deleteGoal(id){


if(!confirm("Delete this goal?")) return;



await fetch(

"/api/admin/goals",

{

method:"DELETE",


headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

id

})


}


);



loadGoals();



}



return (

<div className="
min-h-screen
flex
justify-center
pt-20
pb-20
bg-white
dark:bg-[#050816]
">


<div className="w-[540px] space-y-14">





<h1 className="
text-3xl
font-black
">

PrepZii Admin 🚀

</h1>









{/* ================= NOTIFICATIONS ================= */}


<div className="space-y-5">


<h2 className="font-black text-xl">

Send Notification 🔔

</h2>



<input

value={title}

onChange={(e)=>setTitle(e.target.value)}

placeholder="Notification title"

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>




<textarea

value={message}

onChange={(e)=>setMessage(e.target.value)}

placeholder="Message"

className="
w-full
border
rounded-xl
p-4
h-32
bg-transparent
"

/>




<input

value={href}

onChange={(e)=>setHref(e.target.value)}

placeholder="Redirect link e.g /test"

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>




<select

value={target}

onChange={(e)=>setTarget(e.target.value)}

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

>


<option value="ALL">Everyone</option>

<option value="JEE">JEE Students</option>

<option value="NEET">NEET Students</option>


</select>





<button

onClick={sendNotification}

disabled={loading}

className="
bg-black
text-white
px-8
py-4
rounded-xl
font-bold
"

>


{

loading

?

"Sending..."

:

"Send Notification"


}


</button>


</div>










{/* ================= DAILY GOALS ================= */}


<div className="space-y-5">


<h2 className="font-black text-xl">

Create Daily Goal 🎯

</h2>

<div className="space-y-5">


<h2 className="text-xl font-black">

Active Goals 📋

</h2>



{

allGoals.map(goal=>(


<div

key={goal.id}

className="
border
rounded-xl
p-5
space-y-3
"

>



<h3 className="font-black">


{goal.title}


</h3>



<p className="text-sm text-gray-500">


{goal.goal_type}
{" "}
|
{" "}
{goal.target}


</p>





<div className="flex gap-3">



<input

type="number"

defaultValue={goal.target_value}

onBlur={(e)=>

updateGoal(
goal.id,
{
target_value:e.target.value
}
)

}


className="
border
p-2
rounded
w-24
"


/>




<input

type="number"

defaultValue={goal.xp}

onBlur={(e)=>

updateGoal(
goal.id,
{
xp:e.target.value
}
)

}

className="
border
p-2
rounded
w-24
"


/>


</div>








<button

onClick={()=>updateGoal(

goal.id,

{

is_active:!goal.is_active

}

)}

className="
bg-yellow-500
text-white
px-4
py-2
rounded-lg
"

>


{

goal.is_active

?

"Disable"

:

"Enable"

}


</button>






<button

onClick={()=>deleteGoal(goal.id)}

className="
ml-3
bg-red-500
text-white
px-4
py-2
rounded-lg
"

>

Delete

</button>



</div>


))

}


</div>


<input

value={goalTitle}

onChange={(e)=>setGoalTitle(e.target.value)}

placeholder="Goal title"

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>




<textarea

value={goalDescription}

onChange={(e)=>setGoalDescription(e.target.value)}

placeholder="Goal description"

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>





<select

value={goalType}

onChange={(e)=>setGoalType(e.target.value)}

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

>


<option value="PYQ">

PYQ

</option>


<option value="TEST">

Mock Test

</option>


<option value="FORMULA">

Formula Revision

</option>


</select>






<select

value={goalTarget}

onChange={(e)=>setGoalTarget(e.target.value)}

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

>


<option value="ALL">

Everyone

</option>


<option value="JEE">

JEE

</option>


<option value="NEET">

NEET

</option>


</select>





<input

type="number"

value={targetValue}

onChange={(e)=>setTargetValue(e.target.value)}

placeholder="Required count e.g 20"

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>





<input

type="number"

value={xp}

onChange={(e)=>setXp(e.target.value)}

placeholder="XP reward e.g 50"

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>






<button

onClick={createGoal}

disabled={goalLoading}

className="
bg-indigo-600
text-white
px-8
py-4
rounded-xl
font-bold
"

>


{

goalLoading

?

"Creating..."

:

"Create Goal 🎯"


}


</button>



</div>




</div>


</div>


);


}