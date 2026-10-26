import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { integrityCall } from "@/lib/integrity.server.mjs";
function normalize(value) {
 if(Array.isArray(value))return value.map(v=>String(v).trim().toUpperCase()).sort().join(",");
 return value===null||value===undefined?null:String(value).trim().toUpperCase();
}
export async function POST(req) {
 const {userId}=await auth();
 if(!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 try {
  const body=await req.json();
  const rows=Array.isArray(body.attempts)?body.attempts:[body];
  if(!rows.length||rows.length>200||rows.some(a=>!a?.question_id)||typeof body.request_key!=="string"||body.request_key.length<16||body.request_key.length>200)
   return NextResponse.json({error:"A stable request_key and valid attempts are required"},{status:400});
  const result=await integrityCall(supabaseAdmin,"prepzii_commit_pyq",{p_user:userId,p_key:body.request_key,
   p_answers:rows.map(a=>({question_id:a.question_id,selected_option:normalize(a.selected_option)}))});
  return NextResponse.json(result,{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){return NextResponse.json({error:error.status===409?"Saved activity conflicts with this request":"Activity persistence unavailable"},{status:error.status||503});}
}
