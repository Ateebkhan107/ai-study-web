"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


// ICONS

const CheckIcon = () => (
  <span className="text-xl">✓</span>
);

const XIcon = () => (
  <span className="text-xl">×</span>
);

const MinusIcon = () => (
  <span className="text-xl">−</span>
);

const TargetIcon = () => (
  <span className="text-xl">🎯</span>
);



export default function ResultPage(){


const {id}=useParams();

const router=useRouter();


const [attempt,setAttempt]=useState(null);

const [loading,setLoading]=useState(true);




useEffect(()=>{


loadResult();


},[]);





async function loadResult(){


try{


const {data,error}=await supabase
.from("test_attempts")
.select("*")
.eq("id",id)
.single();



if(error) throw error;


console.log("RESULT DATA 👉",data);


setAttempt(data);



}
catch(err){


console.log(err);


}


setLoading(false);


}






if(loading){


return (

<div className="p-10">

Loading Result...

</div>

)

}




if(!attempt){


return (

<div className="p-10">

Result not found

</div>

)

}




const score = attempt.score;

const totalMarks = attempt.total_marks;


const correct = attempt.correct_answers;


const wrong = attempt.wrong_answers;


const skipped =
attempt.total_questions - attempt.attempted;



const accuracy =
attempt.attempted > 0
?
Math.round(
(correct / attempt.attempted)*100
)
:
0;




let feedbackMessage="Needs Improvement 📚";


let feedbackColor=
"text-amber-600 border-amber-200 bg-amber-50";



if(accuracy>=90){

feedbackMessage="Excellent Work 🎉";

feedbackColor=
"text-emerald-600 border-emerald-200 bg-emerald-50";


}

else if(accuracy>=70){


feedbackMessage="Good Attempt 🚀";


feedbackColor=
"text-indigo-600 border-indigo-200 bg-indigo-50";


}





const themeMaps={

emerald:
"bg-emerald-50 border-emerald-100 text-emerald-600",

rose:
"bg-rose-50 border-rose-100 text-rose-600",

slate:
"bg-slate-50 border-slate-200 text-slate-600",

indigo:
"bg-indigo-50 border-indigo-100 text-indigo-600"

};






return (


<div className="
min-h-screen
bg-[#f9f9f9]
flex items-center justify-center
p-6
">


<div className="
w-full max-w-2xl
bg-white
rounded-[2rem]
p-10
shadow-xl
text-center
">


<div className="
w-16 h-16
mx-auto
rounded-2xl
bg-gray-100
flex items-center justify-center
text-3xl
mb-5
">

🎯

</div>



<h1 className="
text-4xl font-black mb-4
">

Test Submitted!

</h1>



<div className={`
inline-flex
px-5 py-2
rounded-full
border mb-8
${feedbackColor}
`}>

{feedbackMessage}

</div>






<div className="
mb-8
p-5
rounded-2xl
bg-gray-50
">


<p className="
text-xs
font-black
text-gray-400
uppercase
mb-4
">

Session Summary

</p>



<div className="flex justify-center gap-3 flex-wrap">


<span className="px-4 py-2 bg-white rounded-lg">

Questions: {attempt.total_questions}

</span>


<span className="px-4 py-2 bg-white rounded-lg">

Attempted: {attempt.attempted}

</span>


</div>


</div>








<div className="
grid grid-cols-2
gap-4 mb-10
">


{[


{
label:"Score",
val:`${score}/${totalMarks}`,
theme:"indigo",
icon:<TargetIcon/>
},


{
label:"Correct",
val:correct,
theme:"emerald",
icon:<CheckIcon/>
},


{
label:"Wrong",
val:wrong,
theme:"rose",
icon:<XIcon/>
},


{
label:"Skipped",
val:skipped,
theme:"slate",
icon:<MinusIcon/>
},


{
label:"Accuracy",
val:`${accuracy}%`,
theme:"indigo",
icon:<TargetIcon/>
}



].map((item,index)=>(


<div

key={index}

className={`
p-5
rounded-2xl
border
${themeMaps[item.theme]}
`}

>


<div>

{item.icon}

</div>


<p className="
text-3xl font-black
">

{item.val}

</p>


<p className="
text-xs uppercase font-bold
">

{item.label}

</p>


</div>


))}



</div>








<div className="flex flex-col gap-3">


<button

onClick={()=>
router.push(`/test/review/${id}`)
}


className="
py-4
rounded-xl
bg-black
text-white
font-bold
"

>

Review Answers

</button>





<button

onClick={()=>
router.push("/test/history")
}


className="
py-4
rounded-xl
border
font-bold
"

>

View Test History

</button>





<button

onClick={()=>
router.push("/dashboard")
}

className="
py-3
text-gray-500
font-semibold
"

>

Back To Dashboard

</button>




</div>



</div>


</div>


)



}