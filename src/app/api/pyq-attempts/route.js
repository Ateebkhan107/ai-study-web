import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { integrityCall, integrityEnabled } from "@/lib/integrity.server.mjs";
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
  const args = {
   p_user: userId,
   p_key: body.request_key,
   p_answers: rows.map(a => ({ question_id: a.question_id, selected_option: normalize(a.selected_option) })),
  };
  let result;
  if (integrityEnabled()) {
   result = await integrityCall(supabaseAdmin, "prepzii_commit_pyq", args);
  } else {
   const { data, error } = await supabaseAdmin.rpc("prepzii_submit_pyq", args);
   if (error) {
    const status = { PZ409: 409, "22023": 400, "22P02": 400, "22003": 400 }[error.code] ?? 503;
    throw Object.assign(new Error("PYQ submission could not be saved"), { status });
   }
   result = data;
  }
  return NextResponse.json(result,{headers:{"Cache-Control":"private, no-store"}});
 } catch (error) {
  const message = {
   400: "The request contains an invalid answer or question",
   409: "Saved activity conflicts with this request",
  }[error.status] ?? "Activity persistence unavailable";
  return NextResponse.json({ error: message }, { status: error.status || 503 });
 }
}
