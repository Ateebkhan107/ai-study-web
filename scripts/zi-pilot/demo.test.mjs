import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEMO, demoMaximumCost, demoAdmission, authorizeDemo } from './demo-policy.mjs';
import { digest, requestBody } from './live-policy.mjs';
import { ledger } from './accounting.mjs';
const entry = fileURLToPath(new URL('./demo.mjs', import.meta.url));
const guard = fileURLToPath(new URL('./demo-network.cjs', import.meta.url));
const env = { PATH: '/usr/bin:/bin', NODE_NO_WARNINGS: '1' };
async function command(args, extra = {}) {
  const p = spawn(process.execPath, ['--conditions=react-server', entry, ...args], { env: { ...env, ...extra } });
  let out = '', err = ''; p.stdout.on('data', c => { out += c; }); p.stderr.on('data', c => { err += c; });
  const code = await new Promise((resolve, reject) => { p.on('error', reject); p.on('close', resolve); }); return { code, out, err };
}
test('full documented input window plus output fits unchanged allowance; reservation is conservative', () => {
  assert.equal(demoMaximumCost(), 334572800);
  assert.ok(demoMaximumCost() < DEMO.reservationNanoUsd); assert.ok(DEMO.reservationNanoUsd < DEMO.allowanceNanoUsd);
  assert.equal(demoAdmission(requestBody('', {}, {}), 0, 400000000, 'demo-live'), 390000000);
  assert.throws(() => demoAdmission(requestBody('', {}, {}), 390000000, 400000000, 'demo-live'), /BUDGET/);
});
test('prepare performs no call, creates no approval and dry run renders a clearly labelled fixture', async () => {
  const prepared = await command(['--prepare']); assert.equal(prepared.code, 0, prepared.err);
  const result = JSON.parse(prepared.out); assert.equal(result.liveRequests, 0);
  assert.equal(existsSync(`${result.root}/approval.json`), false);
  assert.match(readFileSync(`${result.root}/display.html`, 'utf8'), /Waiting for separate execution approval/);
  const dry = await command(['--dry-run', result.root]); assert.equal(dry.code, 0, dry.err);
  const output = JSON.parse(dry.out); const html = readFileSync(output.display, 'utf8');
  assert.match(html, /OFFLINE FIXTURE/); assert.match(html, /Answer: A/); assert.match(html, /Explanation/);
  assert.match(html, /default-src 'none'/);
  assert.equal((await command(['--dry-run', result.root])).code, 1);
  assert.equal((await command(['--execute', result.root])).code, 1);
  assert.equal(existsSync(`${result.root}/first-real-demo`), false);
  console.log(`Retained demo test plan: ${result.root}`);
});
test('request or implementation drift invalidates preparation', async () => {
  const prepared = JSON.parse((await command(['--prepare'])).out);
  const path = `${prepared.root}/request.json`; const body = JSON.parse(readFileSync(path)); body.contents[0].parts[0].text += 'changed';
  writeFileSync(path, JSON.stringify(body));
  assert.equal((await command(['--dry-run', prepared.root])).code, 1);
});
test('demo ledger caps at one and preserves a pending receipt across retry', () => {
  const root = mkdtempSync('/private/tmp/prepzii-gemini-pilot-');
  const manifest = { profile: DEMO.profile, model: DEMO.model, allowanceNanoUsd: 400000000, mode: 'dry-run' };
  const l = ledger(root, 'single', manifest); const body = requestBody('', {}, {});
  try {
    l.dispatch('generation-demo', body); assert.throws(() => l.dispatch('retry', body), /CONCURRENT/);
    l.ack({ inputTokens: 1048576, outputTokens: 8000, thoughtTokens: 0, totalTokens: 1056576 });
    assert.throws(() => l.dispatch('second', body), /REQUEST_LIMIT/);
    l.finish(false, 'TEST');
  } finally { l.close(); }
  assert.throws(() => ledger(root, 'single', manifest), /DUPLICATE/);
});
test('authorization binds root, model, allowance, request and one-hour expiry', () => {
  const plan = { authorizationId: 'test', evidenceRoot: '/private/tmp/test', requestHash: 'body' };
  const now = Date.parse('2026-10-25T12:00:00Z');
  const approval = { action: DEMO.profile, manifestHash: digest(plan), authorizationId: 'test', model: DEMO.model, allowanceNanoUsd: 400000000, maxRequests: 1, developmentProjectConfirmed: true, standardPricingConfirmed: true, keyFingerprint: digest('offline-only'), expiresAt: new Date(now + 60000).toISOString() };
  assert.doesNotThrow(() => authorizeDemo(plan, approval, { ZI_PILOT_EXECUTION_AUTHORIZATION: 'test', GEMINI_API_KEY: 'offline-only' }, now));
  assert.throws(() => authorizeDemo(plan, approval, { ZI_PILOT_EXECUTION_AUTHORIZATION: 'test', GEMINI_API_KEY: 'different' }, now));
  assert.throws(() => authorizeDemo({ ...plan, evidenceRoot: 'different' }, approval, { ZI_PILOT_EXECUTION_AUTHORIZATION: 'test' }, now));
  assert.throws(() => authorizeDemo(plan, { ...approval, maxRequests: 2 }, { ZI_PILOT_EXECUTION_AUTHORIZATION: 'test' }, now));
  assert.throws(() => authorizeDemo(plan, approval, {}, now));
  assert.throws(() => authorizeDemo(plan, approval, { ZI_PILOT_EXECUTION_AUTHORIZATION: 'test' }, Date.parse('2026-10-27T12:00:00Z')));
});
test('demo process denies Gemini, Supabase, local sockets and arbitrary subprocess traffic by default', async () => {
  const code = `require(${JSON.stringify(guard)});const a=require('node:assert/strict');for(const fn of [()=>fetch('https://generativelanguage.googleapis.com'),()=>require('node:https').request('https://synthetic.supabase.co'),()=>require('node:net').connect({path:'/tmp/prepzii-phase5-pg17/.s.PGSQL.55436'}),()=>require('node:child_process').spawn('psql',[])])a.throws(fn,/DEMO_NETWORK_DENIED/);`;
  const p = spawn(process.execPath, ['-e', code], { env }); assert.equal(await new Promise(resolve => p.on('close', resolve)), 0);
});
test('one-shot network sender rechecks authorization and uses only the pinned endpoint; no real IO', async () => {
  const code = `const a=require('node:assert/strict'),https=require('node:https'),{EventEmitter}=require('node:events');let calls=0;
    https.request=(url,options,cb)=>{calls++;a.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');a.equal(options.agent,false);const req=new EventEmitter();req.end=()=>{const res=new EventEmitter();res.statusCode=429;cb(res);res.emit('end')};return req};
    const n=require(${JSON.stringify(guard)});(async()=>{const send=n.sender(()=>{});a.equal((await send({body:'{}',key:'fixture',signal:new AbortController().signal})).status,429);await a.rejects(()=>send({body:'{}',key:'fixture'}));a.equal(calls,1);const denied=n.sender(()=>{throw Error('NO_APPROVAL')});await a.rejects(()=>denied({body:'{}',key:'fixture'}),/NO_APPROVAL/);a.equal(calls,1)})().catch(()=>process.exitCode=1);`;
  const p = spawn(process.execPath, ['-e', code], { env }); assert.equal(await new Promise(resolve => p.on('close', resolve)), 0);
});
test('display escapes provider text; existing numerical validator rejects wrong keys and invalid proofs', async () => {
  const demo = pathToUrl(entry), fixtures = pathToUrl(fileURLToPath(new URL('./fixtures.mjs', import.meta.url)));
  const code = `const a=await import('node:assert/strict'),d=await import(${JSON.stringify(demo)}),f=await import(${JSON.stringify(fixtures)});let q=f.candidate();delete q.questionCount;
    const proof={family:'torque_acceleration',geometry:null,geometryEvidence:'',inputs:[{name:'torque',value:6,unit:'Nm',sourceText:'6 Nm'},{name:'inertia',value:2,unit:'kgm^2',sourceText:'2 kgm^2'}]};
    a.default.equal(d.validateDemo({questions:[q],calculation:proof}).numerical.computedAnswer,3);
    a.default.throws(()=>d.validateDemo({questions:[{...q,correctAnswer:1}],calculation:proof}));
    a.default.throws(()=>d.validateDemo({questions:[q,q],calculation:proof}));
    const html=d.display({question:{...q,statement:'<script>unsafe()</script>'},model:'fixture'},'dry-run');a.default.ok(!html.includes('<script>'));a.default.ok(html.includes('&lt;script&gt;'));`;
  const p = spawn(process.execPath, ['--conditions=react-server', '--input-type=module', '-e', code], { env });
  assert.equal(await new Promise(resolve => p.on('close', resolve)), 0);
});
function pathToUrl(path) { return new URL(`file://${path}`).href; }
