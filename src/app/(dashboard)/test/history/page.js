"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


export default function HistoryPage(){

const {user}=useUser();

const router=useRouter();


const [tests,setTests]=useState([]);

const [loading,setLoading]=useState(true);



useEffect(()=>{

if(user){
load();
}

},[user]);





async function load(){


const {data,error}=await supabase
.from("test_attempts")
.select("*")
.eq("user_id",user.id)
.order("created_at",{
ascending:false
});


if(error){
console.log(error);
return;
}


setTests(data);

setLoading(false);

}




if(loading){

return <div className="p-10">Loading...</div>

}





return (

<div className="
max-w-5xl mx-auto
p-10
">


<h1 className="
text-4xl font-black mb-8
">
Test History
</h1>



<div className="space-y-5">


{tests.map(test=>{


const accuracy =
test.attempted>0
?
Math.round(
(test.correct_answers/test.attempted)*100
)
:
0;



return (

<div
key={test.id}

className="
border rounded-2xl
p-6
bg-white
dark:bg-gray-900
"
>


<h2 className="font-bold text-xl">

Mock Test

</h2>



<p className="text-gray-400 text-sm">

{new Date(test.created_at).toLocaleString()}

</p>




<div className="
grid grid-cols-3 gap-5
mt-5
">


<div>

<p>Score</p>

<b>

{test.score}/{test.total_marks}

</b>

</div>



<div>

<p>Accuracy</p>

<b>{accuracy}%</b>

</div>



<div>

<p>Questions</p>

<b>{test.total_questions}</b>

</div>


</div>





<button

onClick={()=>{

router.push(
`/test/review/${test.id}`
)

}}

className="
mt-5
px-5 py-3
rounded-xl
bg-black
text-white
"

>

Review Answers

</button>



</div>


)


})}


</div>


</div>


)


}