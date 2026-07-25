"use client";

import { useEffect, useState } from "react";
import { Rocket, BookOpen, ImageIcon, Bell } from "lucide-react";
import BadgeManager from "@/components/admin/BadgeManager";


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

// PYQ UPLOAD STATES

const [pyqFile,setPyqFile]=useState(null);

const [pyqUploading,setPyqUploading]=useState(false);

// IMAGE UPLOAD STATES

const [imageFile,setImageFile]=useState(null);

const [imageUploading,setImageUploading]=useState(false);

const [imageUrl,setImageUrl]=useState("");

// PYQ MANAGER STATES

const [pyqQuestions,setPyqQuestions]=useState([]);

const [pyqLoading,setPyqLoading]=useState(false);

// PYQ FILTER STATES

const [filterExam,setFilterExam]=useState("");

const [filterSubject,setFilterSubject]=useState("");

const [filterYear,setFilterYear]=useState("");

const [filterSearch,setFilterSearch]=useState("");

  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  },[]);


  useEffect(()=>{
    loadGoals();
    loadPYQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

// ==============================
// UPLOAD PYQ CSV
// ==============================


async function uploadPYQ(){


if(!pyqFile){

alert("Select CSV file");

return;

}



setPyqUploading(true);



try{


const formData =
new FormData();



formData.append(
"file",
pyqFile
);




const res =
await fetch(

"/api/admin/pyq-upload",

{

method:"POST",

body:formData

}

);




const data =
await res.json();




if(res.ok){


alert(
`PYQ uploaded successfully 🚀\n${data.count} questions added`
);


setPyqFile(null);


}

else{


console.log(data);

alert(
"PYQ upload failed"
);


}



}

catch(error){


console.log(error);


alert(
"Something went wrong"
);


}




setPyqUploading(false);



}

// ==============================
// UPLOAD PYQ IMAGE
// ==============================


async function uploadImage(){


if(!imageFile){


alert("Select image");

return;


}



setImageUploading(true);



try{


const formData =
new FormData();



formData.append(
"file",
imageFile
);




const res =
await fetch(

"/api/admin/upload-image",

{

method:"POST",

body:formData

}

);





const data =
await res.json();





if(res.ok){


setImageUrl(
data.url
);


alert(
"Image uploaded 🖼️"
);


}


else{


console.log(data);


alert(
"Upload failed"
);


}



}

catch(error){


console.log(error);


alert(
"Something went wrong"
);


}



setImageUploading(false);



}


// ==============================
// LOAD PYQ QUESTIONS
// ==============================


async function loadPYQs(){


setPyqLoading(true);


try{


const params =
new URLSearchParams();


if(filterExam)
params.set(
"exam",
filterExam
);


if(filterSubject)
params.set(
"subject",
filterSubject
);


if(filterYear)
params.set(
"year",
filterYear
);


if(filterSearch)
params.set(
"search",
filterSearch
);




const res =
await fetch(
`/api/admin/pyq?${params}`
);


const data =
await res.json();



if(data.success){


setPyqQuestions(
data.questions
);


}



}

catch(error){


console.log(
"PYQ load error",
error
);


}



setPyqLoading(false);



}








// ==============================
// UPDATE PYQ
// ==============================


async function updatePYQ(
id,
changes
){


await fetch(
"/api/admin/pyq",
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



loadPYQs();



}








// ==============================
// DELETE PYQ
// ==============================


async function deletePYQ(id){



if(
!confirm("Delete this question?")
)
return;




await fetch(
"/api/admin/pyq",
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



loadPYQs();



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
flex items-center gap-2
">

PrepZii Admin <Rocket className="w-8 h-8" />

</h1>



{/* ================= PYQ UPLOAD ================= */}


<div className="space-y-5">


<h2 className="font-black text-xl flex items-center gap-2">

Upload PYQ Paper <BookOpen className="w-6 h-6" />

</h2>




<p className="text-sm text-gray-500">

Upload CSV file containing JEE / NEET questions

</p>





<input

type="file"

accept=".csv"

onChange={(e)=>

setPyqFile(
e.target.files[0]
)

}

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>






{

pyqFile && (

<p className="text-sm text-green-500">

Selected: {pyqFile.name}

</p>

)

}






<button

onClick={uploadPYQ}

disabled={pyqUploading}

className="
bg-green-600
text-white
px-8
py-4
rounded-xl
font-bold
disabled:opacity-50
"

>


{

pyqUploading

?

"Uploading..."

:

"Upload PYQ 🚀"

}


</button>




</div>


{/* ================= IMAGE UPLOAD ================= */}


<div className="space-y-5">


<h2 className="font-black text-xl flex items-center gap-2">

Upload PYQ Image <ImageIcon className="w-6 h-6" />

</h2>



<p className="text-sm text-gray-500">

Upload question / option / solution images

</p>





<input

type="file"

accept="image/*"

onChange={(e)=>

setImageFile(
e.target.files[0]
)

}

className="
w-full
border
rounded-xl
p-4
bg-transparent
"

/>







<button

onClick={uploadImage}

disabled={imageUploading}

className="
bg-purple-600
text-white
px-8
py-4
rounded-xl
font-bold
disabled:opacity-50
"

>


{

imageUploading

?

"Uploading..."

:

"Upload Image"

}


</button>






{

imageUrl && (

<div className="
border
rounded-xl
p-4
space-y-3
">


<p className="
text-sm
break-all
">

{imageUrl}

</p>



<button

onClick={()=>{

navigator.clipboard.writeText(
imageUrl
);

alert("Copied");

}}

className="
bg-black
text-white
px-5
py-2
rounded-lg
text-sm
"

>

Copy URL

</button>


</div>

)

}




</div>


{/* ================= PYQ MANAGER ================= */}


<div className="space-y-5">


<h2 className="font-black text-xl flex items-center gap-2">

Manage PYQs <BookOpen className="w-6 h-6" />

</h2>


<select

value={filterExam}

onChange={(e)=>setFilterExam(e.target.value)}

className="
border
rounded-xl
p-3
w-full
bg-transparent
"

>

<option value="">
All Exams
</option>

<option value="JEE">
JEE
</option>

<option value="NEET">
NEET
</option>

</select>




<input

value={filterSubject}

onChange={(e)=>setFilterSubject(e.target.value)}

placeholder="Subject"

className="
border
rounded-xl
p-3
w-full
bg-transparent
"

/>




<input

value={filterYear}

onChange={(e)=>setFilterYear(e.target.value)}

placeholder="Year"

className="
border
rounded-xl
p-3
w-full
bg-transparent
"

/>




<input

value={filterSearch}

onChange={(e)=>setFilterSearch(e.target.value)}

placeholder="Search question"

className="
border
rounded-xl
p-3
w-full
bg-transparent
"

/>


<button

onClick={loadPYQs}

className="
bg-black
text-white
px-5
py-2
rounded-lg
"

>

Refresh

</button>







{

pyqLoading && (

<p>

Loading...

</p>

)

}






{

pyqQuestions.map(q=>(


<div

key={q.id}

className="
border
rounded-xl
p-5
space-y-3
"

>


<p className="font-bold">

{q.question}

</p>




<p className="text-sm text-gray-500">


{q.exam}

{" | "}

{q.subject}

{" | "}

{q.chapter}


</p>





<input

defaultValue={
q.correct_option || ""
}

placeholder="Correct option"

onBlur={(e)=>

updatePYQ(
q.id,
{
correct_option:e.target.value
}
)

}


className="
border
rounded-lg
p-2
w-full
bg-transparent
"


/>







<textarea

defaultValue={
q.explanation || ""
}

placeholder="Explanation"

onBlur={(e)=>

updatePYQ(
q.id,
{
explanation:e.target.value
}
)

}


className="
border
rounded-lg
p-2
w-full
bg-transparent
"


/>







<button

onClick={()=>

deletePYQ(q.id)

}

className="
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


{/* ================= NOTIFICATIONS ================= */}


<div className="space-y-5">


<h2 className="font-black text-xl flex items-center gap-2">

Send Notification <Bell className="w-6 h-6" />

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

      {/* ================= BADGE MANAGEMENT ================= */}
      <div className="mb-12">
        <BadgeManager />
      </div>
      
    </div>
  );
}