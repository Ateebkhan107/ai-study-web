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
.not("exam_id", "is", null);



if(exam){

query=query.eq(
"exam",
exam
);

}


if(subject){

query=query.eq(
"subject",
subject
);

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