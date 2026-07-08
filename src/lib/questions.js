import { supabase } from "@/lib/supabase";


export async function getQuestions({
  exam,
  subject,
  chapter,
  difficulty,
  limit,
}) {


let query = supabase
.from("questions")
.select("*")
.eq("is_active", true);



// exam
if (
exam &&
exam !== "ALL"
){

query =
query.eq(
"exam",
exam
);

}



// subject
if (
subject &&
subject !== "Mixed Subjects"
){

query =
query.eq(
"subject",
subject
);

}



// chapters
if (
chapter &&
chapter !== "All Chapters"
){

const chapters =
chapter
.split(",")
.map(
(c)=>decodeURIComponent(c).trim()
)
.filter(Boolean);



if(
chapters.length === 1
){

query =
query.eq(
"chapter",
chapters[0]
);

}

else{

query =
query.in(
"chapter",
chapters
);

}


}



// difficulty
// Easy / Medium / Hard only
// Mixed = no filter

if(
difficulty &&
difficulty.toLowerCase() !== "mixed"
){

query =
query.ilike(
"difficulty",
difficulty
);

}




const {data,error}
=
await query;



if(error){

throw error;

}



// RANDOM MIXING
const shuffled =
[...data]
.sort(
()=>Math.random()-0.5
);



// LIMIT AFTER SHUFFLE
const selected =
shuffled.slice(
0,
limit
);




return selected.map((q)=>({

id:q.id,

exam:q.exam,

subject:q.subject,

chapter:q.chapter,

topic:q.topic,

difficulty:q.difficulty,


text:q.question_text,


options:[

q.option_a,

q.option_b,

q.option_c,

q.option_d

],


correct:
["A","B","C","D"]
.indexOf(
q.correct_option
),


explanation:q.explanation,


marks:q.marks,


negative_marks:q.negative_marks


}));


}