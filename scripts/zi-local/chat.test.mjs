import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const state = { userId: 'user_local_route', accessCalls: 0, rate: true, isolated: true };
globalThis.__localChatTest = state;
const code = text => ({ url: `data:text/javascript,${encodeURIComponent(text)}`, shortCircuit: true });
registerHooks({ resolve(specifier, context, next) {
  if (specifier === '@clerk/nextjs/server') return code('export const auth=async()=>({userId:globalThis.__localChatTest.userId});');
  if (specifier === '@/lib/localGuard.server') return code('export function assertLocal(){if(!globalThis.__localChatTest.isolated)throw Error("Isolation guard failed")}');
  if (specifier === '@/lib/accessControl') return code('export async function getUserAccessContext({userId}){globalThis.__localChatTest.accessCalls++;return {userId,examTrack:"JEE",proTracks:[],plan:"AI_MODE"}}');
  if (specifier === '@/lib/zi/rateLimit') return code('export const checkZiRateLimit=()=>({allowed:globalThis.__localChatTest.rate,resetMs:2000});');
  if (specifier === '../provider.js') return code('export const getZiGenerationQuotaStatus=()=>({blocked:false});');
  if (specifier.startsWith('@/')) {
    let filename=path.join(root,'src',specifier.slice(2));
    if (!existsSync(filename) && existsSync(`${filename}.js`)) filename+='.js';
    return next(pathToFileURL(filename).href,context);
  }
  return next(specifier,context);
} });
const { POST } = await import('./chat.template.js');
const { handleBuilder } = await import('../../src/lib/zi/testGenerator/builder.server.js');
Object.assign(process.env,{ZI_TEST_BUILDER_SECRET:'synthetic-route-test-secret-no-provider',ZI_GENERATION_PILOT_ENABLED:'true',ZI_GENERATED_TEST_ENGINE_ENABLED:'true',ZI_GENERATION_PILOT_USERS:state.userId});
const request = body => new Request('http://localhost:3463/api/zi/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const body = text => ({messages:[{role:'user',content:text}]});
test('exact reported Hinglish request returns a builder without any provider/context dependency',async()=>{
  const response=await POST(request(body('10 Rotational Motion questions ka test generate kro')));
  assert.equal(response.status,200);assert.equal(response.headers.get('x-zi-prompt-charged'),'0');
  const text=await response.text();const action=JSON.parse(text.split('__ZI_VALIDATED_ACTION__=')[1]);
  assert.equal(action.type,'ai_test_builder');assert.equal(action.config.questionCount,10);assert.equal(action.config.subject,'Physics');assert.equal(action.confirmed,false);
});
test('unrelated tutoring and official PYQ requests fail explicitly without context/provider or prompt debit',async()=>{
  for(const text of ['Explain conservation of angular momentum','10 official PYQ questions ka test generate kro']) {
    const before=state.accessCalls;const response=await POST(request(body(text)));assert.equal(response.status,503);
    const payload=await response.json();assert.equal(payload.code,'LOCAL_MOCK_CHAT_UNAVAILABLE');assert.match(payload.error,/General AI chat is unavailable in local mock mode/);assert.equal(state.accessCalls,before);assert.equal(response.headers.get('x-zi-prompt-charged'),'0');
  }
});
test('real route requires auth and exact server-side pilot membership',async()=>{
  const original=state.userId;
  state.userId=null;assert.equal((await POST(request(body('make a test')))).status,401);
  state.userId='user_not_allowlisted';assert.equal((await POST(request(body('make a test')))).status,403);
  state.userId=original;
});
test('isolation guard failure cannot proceed to the builder',async()=>{
  state.isolated=false;await assert.rejects(POST(request(body('make a test'))),/Isolation guard/);state.isolated=true;
});
test('malformed payload, expired and foreign-owner drafts fail closed',async()=>{
  assert.equal((await POST(request({messages:[]}))).status,400);
  const access={userId:state.userId,examTrack:'JEE',proTracks:[]};
  const draft=handleBuilder({userId:state.userId,access,text:'make a test'}, {now:1});
  assert.equal((await POST(request({...body('medium'),testBuilderToken:draft.token}))).status,410);
  const foreign=handleBuilder({userId:'user_other',access:{...access,userId:'user_other'},text:'make a test'});
  assert.equal((await POST(request({...body('medium'),testBuilderToken:foreign.token}))).status,403);
});
test('existing chat rate limit is preserved',async()=>{
  state.rate=false;const response=await POST(request(body('make a test')));assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'2');state.rate=true;
});
