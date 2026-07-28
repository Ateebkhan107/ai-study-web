import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET(req){


const {searchParams}=new URL(req.url);


const exam =
searchParams.get("exam");


const subject =
searchParams.get("subject");



let query = supabase
.from("pyq_questions")
.select("chapter")
.eq("status", "PUBLISHED")
.not("exam_id", "is", null);



if(exam){

query=query.eq(
"exam",
exam
);

}


if(subject){
  const subjectsArray = subject.split(",").map(s => s.trim());
  query = query.in("subject", subjectsArray);
}



const {data,error}=await query;



if(error){

return NextResponse.json(
{
error:"Failed loading chapters"
},
{
status:500
}
);

}




const chapters=[
...new Set(
(data || [])
.map(
item=>item.chapter
)
.filter(Boolean)
)
];



return NextResponse.json(
chapters
);


}