import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
let actor, calls, failure;
globalThis.__integrityFixture = {
  auth: async () => { if (actor instanceof Error) throw actor; return {userId:actor}; },
  db: { from() { throw Error("Direct table access forbidden in writer"); },
    rpc: async (name,args) => { calls.push({name,args}); return failure ? {error:failure} : {data:{saved:true}}; } },
};
const hooks=registerHooks({resolve(specifier,context,next){
  const mocks={
    "@clerk/nextjs/server":"export const auth=()=>globalThis.__integrityFixture.auth();",
    "next/server":"export const NextResponse=Response;",
    "@/lib/supabaseAdmin":"export const supabaseAdmin=globalThis.__integrityFixture.db;",
  };
  if(mocks[specifier])return {url:`data:text/javascript,${encodeURIComponent(mocks[specifier])}`,shortCircuit:true};
  if(specifier==="@/lib/integrity.server.mjs")return next(new URL("../integrity.server.mjs",import.meta.url).href,context);
  return next(specifier,context);
}});
const {POST}=await import("../../app/api/pyq-attempts/route.js");
const {initializeXP}=await import("../../utils/initializeXP.js");
const {addXP}=await import("../../utils/xp.js");
const request=(extra={})=>new Request("https://prepzii.invalid/api/pyq-attempts",{method:"POST",body:JSON.stringify({request_key:"synthetic-stable-key",attempts:[{question_id:"synthetic-question",selected_option:"a",is_correct:true,xp:99999}],...extra})});
test.beforeEach(()=>{actor="owner";calls=[];failure=null;process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED="true";});
test("PYQ identity comes from Clerk and database receives choices without client correctness or XP",async()=>{
  assert.equal((await POST(request({user_id:"victim"}))).status,200);
  assert.deepEqual(calls,[{name:"prepzii_commit_pyq",args:{p_user:"owner",p_key:"synthetic-stable-key",p_answers:[{question_id:"synthetic-question",selected_option:"A"}]}}]);
});
test("signed-out PYQ and initialization reject before database calls",async()=>{
  actor=null;assert.equal((await POST(request())).status,401);await assert.rejects(initializeXP("owner"),/Unauthorized/);assert.equal(calls.length,0);
});
test("initialization preserves Clerk authorization and cannot target another user",async()=>{
  await assert.rejects(initializeXP("victim"),/Forbidden/);assert.equal(calls.length,0);
  actor=Error("Clerk unavailable");await assert.rejects(initializeXP("owner"),/Clerk unavailable/);assert.equal(calls.length,0);
});
test("initialization requests only zero-preserving database initializer",async()=>{
  await initializeXP("owner","Synthetic");assert.deepEqual(calls,[{name:"prepzii_init_xp",args:{p_user:"owner",p_name:"Synthetic"}}]);
});
test("PYQ requires stable bounded request keys and nonempty bounded batches",async()=>{
  for(const extra of [{request_key:null},{request_key:"short"},{attempts:[]},{attempts:Array(201).fill({question_id:"q"})}])assert.equal((await POST(request(extra))).status,400);
  assert.equal(calls.length,0);
});
test("disabled or unavailable integrity contract fails closed with no fallback",async()=>{
  delete process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED;
  assert.equal((await POST(request())).status,503);assert.deepEqual(await initializeXP("owner"),{status:"pending_migration"});assert.equal(calls.length,0);
  process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED="true";failure={code:"XX000",message:"Private definition SECRET"};
  const response=await POST(request());assert.equal(response.status,503);assert.equal(JSON.stringify(await response.json()).includes("SECRET"),false);
});
test("PYQ conflicting replay is a redacted 409",async()=>{
  failure={code:"PZ409",message:"Private definition SECRET"};const response=await POST(request());assert.equal(response.status,409);assert.equal(JSON.stringify(await response.json()).includes("SECRET"),false);
});
test("numeric XP deltas cannot be used as activity proof",async()=>{
  await assert.rejects(addXP("owner",99999),/Verified reward source/);assert.equal(calls.length,0);
});
test.after(()=>{hooks.deregister();delete process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED;delete globalThis.__integrityFixture;});
