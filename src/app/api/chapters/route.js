import { supabase } from "@/lib/supabase";


export async function GET(req){

const {searchParams}=new URL(req.url);


const subject =
searchParams.get("subject");


let query = supabase
.from("chapters")
.select("*");


if(subject){
query=query.eq(
"subject",
subject
);
}


const {data,error}=await query;


if(error){

return Response.json(
{error:error.message},
{status:500}
);

}


return Response.json(data);

}