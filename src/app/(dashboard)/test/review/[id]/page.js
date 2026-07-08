"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";


export default function ReviewPage(){

const {id}=useParams();

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
 *,
 test_questions(*)
`)
.eq("attempt_id",id);



if(error) throw error;

console.log("REVIEW DATA 👉", data);
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

<div className="p-10 max-w-4xl mx-auto">

<h1 className="text-3xl font-bold mb-8">
Review Answers
</h1>


<div className="space-y-6">


{answers.map((item,index)=>(

<div
key={item.id}
className="border rounded-2xl p-6 bg-white shadow"
>


<p className="text-sm text-gray-500 mb-3">
Question {index+1}
</p>


<h2 className="text-xl font-semibold mb-5">

{item.test_questions.question_text}

</h2>



<p>
Your Answer:
{" "}

<span
className={
item.is_correct
? "text-green-600 font-bold"
: "text-red-600 font-bold"
}
>

{item.selected_option || "Not Attempted"}

</span>

</p>



<p className="mt-2">

Correct Answer:

<span className="text-green-600 font-bold ml-2">

{item.test_questions.correct}

</span>

</p>


</div>


))}


</div>

</div>

)
}