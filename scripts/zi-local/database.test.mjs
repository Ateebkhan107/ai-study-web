// Synthetic core integration tests, not a substitute for real Clerk/browser acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { assertLaunch, origin } from './policy.mjs';

const dir = process.env.ZI_LOCAL_TEST_WORKSPACE;
assertLaunch(process.env, dir);
if (!dir) throw Error('Set ZI_LOCAL_TEST_WORKSPACE to an isolated prepared workspace');
const manifest = JSON.parse(readFileSync(`${dir}/local-manifest.json`, 'utf8'));
assert.equal(manifest.origin, origin);
assert.deepEqual(manifest.actors, [], 'This suite is restricted to an empty-allowlist test workspace');
registerHooks({ resolve(specifier, context, next) {
  let filename;
  if (specifier.startsWith('@/')) filename = `${dir}/src/${specifier.slice(2)}`;
  else if (specifier.startsWith('.') && context.parentURL?.startsWith(`file://${dir}/`)) filename = path.resolve(path.dirname(new URL(context.parentURL).pathname), specifier);
  if (filename && !existsSync(filename) && existsSync(`${filename}.js`)) filename += '.js';
  if (filename && existsSync(filename)) return next(pathToFileURL(filename).href, context);
  return next(specifier, context);
} });
Object.assign(process.env, { NODE_ENV: 'development', ZI_LOCAL_MOCK_RUNTIME: '1', ZI_LOCAL_ORIGIN: origin, SUPABASE_SERVICE_ROLE_KEY: 'synthetic-local-only',
  ZI_TEST_BUILDER_SECRET: manifest.secret, ZI_GENERATION_PILOT_ENABLED: 'true', ZI_GENERATED_TEST_ENGINE_ENABLED: 'true', ZI_GENERATION_PROVIDER_APPROVED: 'true' });
if (process.env.GEMINI_API_KEY) throw Error('No provider key may be present in this suite');
process.chdir(dir);
const { sql, literal, database } = await import(pathToFileURL(`${dir}/src/lib/tests/phase61Lab.mjs`));
assert.equal(database, manifest.database);
const { supabaseAdmin: client } = await import(pathToFileURL(`${dir}/src/lib/supabaseAdmin.js`));
const { handleBuilder } = await import(pathToFileURL(`${dir}/src/lib/zi/testGenerator/builder.server.js`));
const { reserveGenerationJob, executeGenerationJob, readGenerationJob, jobRepository } = await import(pathToFileURL(`${dir}/src/lib/zi/testGenerator/jobs.server.js`));
const { completeZiQuestionTask } = await import(pathToFileURL(`${dir}/src/lib/zi/provider.js`));
const { startGeneratedTest, saveGeneratedAnswers, submitGeneratedTest, generatedResult } = await import(pathToFileURL(`${dir}/src/lib/tests/generatedTests.server.js`));

test('local SQL adapter and real generation/session modules with synthetic core callers', async t => {
  await sql('SELECT 1;');
  const results = [], suffix = Date.now(), owner = `user_core_${suffix}`, other = `user_other_${suffix}`;
  process.env.ZI_GENERATION_PILOT_USERS = `${owner},${other}`;
  const access = { userId: owner, examTrack: 'JEE', proTracks: [], isAiMode: true };
  const repo = jobRepository(client);
  const balances = await sql('SELECT jsonb_agg(to_jsonb(x) ORDER BY user_id) FROM public.user_xp x;');
  const receiptCount = await sql('SELECT count(*) FROM prepzii_integrity.receipts;');
  const check = async (name, fn) => t.test(name, async () => {
    try { await fn(); results.push({name,result:'PASS'}); }
    catch(e) { results.push({name,result:'FAIL',error:e.message}); throw e; }
  });
  let confirmed, job, session, testId, calls = 0;
  try {
    await check('natural-language configuration and confirmed encrypted draft', async () => {
      const initial = handleBuilder({ userId: owner, access, text: '10 Rotational Motion questions ka test generate kro' });
      assert.ok(initial);
      const summary = handleBuilder({ userId: owner, access, token: initial.token, operation: 'update', patch: { exam:'JEE Main',subject:'Physics',chapter:'Rotational Motion',difficulty:'Medium',questionCount:10,mode:'timed',durationMinutes:15 } });
      confirmed = handleBuilder({ userId: owner, access, token: summary.token, operation: 'confirm' });
      assert.equal(confirmed.confirmed,true); assert.equal(confirmed.availability.orchestrationEnabled,true);
    });
    await check('concurrent duplicate confirmation reserves one immutable job', async () => {
      const jobs = await Promise.all([1,2].map(() => reserveGenerationJob({userId:owner,access,token:confirmed.token},{repo})));
      assert.equal(jobs[0].id,jobs[1].id); job=jobs[0];
      assert.equal(await sql(`SELECT count(*) FROM zi_generation.jobs WHERE owner_id=${literal(owner)};`),'1');
    });
    await check('concurrent execution uses only deterministic mock through full validation and private storage', async () => {
      const complete = async r => { calls++; return completeZiQuestionTask(r); };
      await Promise.all([1,2].map(() => executeGenerationJob({userId:owner,access,id:job.id},{repo,client,complete})));
      const ready=await readGenerationJob({userId:owner,id:job.id},{repo});assert.equal(ready.state,'ready');assert.equal(ready.acceptedCount,10);
      assert.doesNotMatch(JSON.stringify(ready),/correctAnswer|execution_token|draft_key/);
      testId=new URL(ready.startRoute,origin).searchParams.get('generatedTestId');assert.equal(calls,7);
    });
    await check('start delivers ten student-safe questions', async () => {
      session=await startGeneratedTest({userId:owner,testId,client});
      assert.equal(session.questions.length,10);assert.doesNotMatch(JSON.stringify(session.questions),/correctAnswer|explanation|blindSolution|validation/);
      await assert.rejects(generatedResult({userId:owner,sessionId:session.sessionId,client}),{status:409});
    });
    await check('cross-user draft, job, session, answers and results are rejected', async () => {
      await assert.rejects(reserveGenerationJob({userId:other,access:{...access,userId:other},token:confirmed.token},{repo}),{status:403});
      await assert.rejects(readGenerationJob({userId:other,id:job.id},{repo}),{status:404});
      await assert.rejects(startGeneratedTest({userId:other,testId,client}),{status:404});
      await assert.rejects(saveGeneratedAnswers({userId:other,request:{sourceType:'AI_GENERATED',sessionId:session.sessionId,revision:0,answers:{}},client}),{status:404});
      await assert.rejects(generatedResult({userId:other,sessionId:session.sessionId,client}),{status:404});
    });
    const answers=()=>({[session.questions[0].id]:0,[session.questions[1].id]:1});
    const request=()=>({sourceType:'AI_GENERATED',sessionId:session.sessionId,revision:session.revision,answers:answers()});
    await check('failed persistence and stale revision cannot claim saved progress', async () => {
      await assert.rejects(saveGeneratedAnswers({userId:owner,request:request(),client:{rpc:async()=>({error:{code:'08006'}})}}),{status:503});
      await assert.rejects(saveGeneratedAnswers({userId:owner,request:{...request(),revision:999},client}),{status:409});
      const fresh=await startGeneratedTest({userId:owner,testId,client});assert.deepEqual(fresh.answers,{});assert.equal(fresh.revision,0);
    });
    await check('save and refresh retain answers, revision, start time and deadline', async () => {
      await saveGeneratedAnswers({userId:owner,request:request(),client});
      const fresh=await startGeneratedTest({userId:owner,testId,client});
      assert.deepEqual(fresh.answers,answers());assert.ok(fresh.revision>session.revision);assert.equal(fresh.startedAt,session.startedAt);assert.equal(fresh.deadlineAt,session.deadlineAt);session=fresh;
    });
    await check('transaction rollback leaves saved answers unchanged', async () => {
      const before=await sql(`SELECT to_jsonb(s) FROM public.zi_generated_sessions s WHERE session_id=${literal(session.sessionId)};`);
      await sql(`BEGIN;SELECT public.zi_save_generated_answers(${literal(owner)},${literal(session.sessionId)},${session.revision},'{}'::jsonb);ROLLBACK;`,'service_role');
      assert.equal(await sql(`SELECT to_jsonb(s) FROM public.zi_generated_sessions s WHERE session_id=${literal(session.sessionId)};`),before);
    });
    await check('lost submission acknowledgement recovers through duplicate concurrent retries', async () => {
      const lost={rpc:async(name,args)=>{const result=await client.rpc(name,args);assert.equal(result.error,null);return {error:{code:'08006'}}}};
      await assert.rejects(submitGeneratedTest({userId:owner,request:request(),client:lost}),{status:503});
      const replies=await Promise.all([1,2].map(()=>submitGeneratedTest({userId:owner,request:request(),client})));
      assert.equal(replies[0].attemptId,session.sessionId);assert.deepEqual(replies[0],replies[1]);
      const result=await generatedResult({userId:owner,sessionId:session.sessionId,client});assert.ok(result);
      const review=await generatedResult({userId:owner,sessionId:session.sessionId,client,review:true});assert.equal(review.answers.length,10);
    });
    await check('unsupported mock scope fails before reserving a job', async () => {
      const accessOther={...access,userId:other};
      const draft=handleBuilder({userId:other,access:accessOther,operation:'update',patch:{exam:'JEE Main',subject:'Physics',chapter:'Laws of Motion',difficulty:'Easy',questionCount:10,mode:'practice'}});
      const c=handleBuilder({userId:other,access:accessOther,token:draft.token,operation:'confirm'});
      await assert.rejects(reserveGenerationJob({userId:other,access:accessOther,token:c.token},{repo}),{status:400});
      assert.equal(await sql(`SELECT count(*) FROM zi_generation.jobs WHERE owner_id=${literal(other)};`),'0');
    });
    await check('Phase 5 balances, receipts and protected XP permissions are unchanged', async () => {
      assert.equal(await sql('SELECT jsonb_agg(to_jsonb(x) ORDER BY user_id) FROM public.user_xp x;'),balances);
      assert.equal(await sql('SELECT count(*) FROM prepzii_integrity.receipts;'),receiptCount);
      assert.equal(await sql("SELECT has_table_privilege('service_role','public.user_xp','UPDATE');"),'f');
    });
  } finally { writeFileSync(`${dir}/evidence/core-${suffix}.json`,JSON.stringify({database,results,provider:'deterministic mock',clerkBrowserTested:false,realCalls:0}),{flag:'wx',mode:0o600}); }
});
