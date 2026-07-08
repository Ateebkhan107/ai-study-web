"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ReviewPage(){


const {id}=useParams();
const router = useRouter();

const [answers,setAnswers]=useState([]);

const [loading,setLoading]=useState(true);




useEffect(()=>{

loadReview();

},[]);






async function loadReview(){


try{


const {data,error}=await supabase

.from("user_answers")

.select(`

id,

selected_option,

correct_option,

is_correct,


questions:question_id(

id,

question_text,

option_a,

option_b,

option_c,

option_d,

explanation,

subject,

chapter

)

`)

.eq("attempt_id",id);

if(error) throw error;



console.log(
"FULL REVIEW DATA 👉",
data
);



setAnswers(data);



}catch(err){


console.log(err);


}



setLoading(false);


}








if(loading){

return (

<div className="p-10">

Loading review...

</div>

)

}







return (


<div className="
max-w-5xl mx-auto
px-6 py-10
">



<h1 className="
text-4xl font-black mb-8
">

Review Answers

</h1>


<button
onClick={()=>router.push("/test/history")}
className="
mb-6
px-5 py-2
rounded-xl
bg-black
text-white
font-bold
"
>
← Back to Test History
</button>



<div className="space-y-6">



{answers.map((item,index)=>{


const q = item.questions;


const options = [

{
key:"A",
text:q.option_a
},

{
key:"B",
text:q.option_b
},

{
key:"C",
text:q.option_c
},

{
key:"D",
text:q.option_d
}

];





return (


<div

key={item.id}

className="
bg-white dark:bg-gray-900
border border-gray-100
dark:border-gray-800
rounded-2xl
p-6
"

>






<div className="
flex justify-between
mb-4
">



<p className="
text-sm font-bold
text-gray-400
">

Question {index+1}

</p>




<span className="
text-xs
bg-gray-100
dark:bg-gray-800
px-3 py-1
rounded-full
">

{q.chapter}

</span>



</div>






<h2 className="
text-xl font-semibold
mb-6
">

{q.question_text}

</h2>







<div className="space-y-3">



{options.map(opt=>{


const isCorrect =
opt.key === item.correct_option;


const selected =
opt.key === item.selected_option;



return (


<div

key={opt.key}

className={`

p-4 rounded-xl border

${

isCorrect

?

"border-green-500 bg-green-50 text-green-700"

:

selected

?

"border-red-500 bg-red-50 text-red-700"

:

"border-gray-200"

}

`}

>



<b>{opt.key}.</b>

{" "}

{opt.text}



</div>



)


})}



</div>







<div className="
mt-6
text-sm
">



<p>

Your Answer:

<span className={
item.is_correct

?

"text-green-600 font-bold ml-2"

:

"text-red-600 font-bold ml-2"

}>

{item.selected_option || "Not Attempted"}

</span>


</p>




<p className="mt-2">

Correct Answer:

<span className="
text-green-600
font-bold ml-2
">

{item.correct_option}

</span>


</p>



</div>






{q.explanation && (


<div className="
mt-5
p-4
rounded-xl
bg-gray-50
dark:bg-gray-800
text-sm
">


<p className="font-bold mb-2">

Explanation

</p>



{q.explanation}



</div>


)}






</div>



)



})}




</div>




</div>



)

}