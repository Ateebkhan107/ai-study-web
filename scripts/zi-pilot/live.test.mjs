import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MODEL, LIMITS, BILLING_PROOF, parseAllowance, estimatedCost, authorizeLive, requestBody } from './live-policy.mjs';
import { ledger } from './accounting.mjs';
import { requestOnce } from './gemini-once.mjs';
import { digest } from './live-policy.mjs';

const entry = fileURLToPath(new URL('./live.mjs', import.meta.url));
const guard = fileURLToPath(new URL('./deny-network.cjs', import.meta.url));
const env = { PATH: '/usr/bin:/bin', NODE_NO_WARNINGS: '1' };
const validBody = () => requestBody('Offline transport fixture', {}, {});
const root = () => mkdtempSync('/private/tmp/prepzii-gemini-pilot-');
const events = dir => readFileSync(`${dir}/first-question/journal.jsonl`, 'utf8').trim().split('\n').map(JSON.parse);
async function run(scenario = 'success', dir = root(), extra = [], override = {}) {
  const p = spawn(process.execPath, ['--conditions=react-server', entry, '--root', dir, '--mock-scenario', scenario, ...extra], { env: { ...env, ...override } });
  let out = '', err = ''; p.stdout.on('data', x => { out += x; }); p.stderr.on('data', x => { err += x; });
  const code = await new Promise((resolve, reject) => { p.on('error', reject); p.on('close', resolve); });
  return { code, out, err, dir };
}
test('integer money reserves $0.084/request and $0.336/four at conservative prices', () => {
  assert.equal(parseAllowance(), 400000000); assert.equal(estimatedCost(), 84000000);
  for (const v of ['NaN', '-1', '1e9', '0', '0.000', '2.00']) assert.throws(() => parseAllowance(v));
  assert.throws(() => estimatedCost(16001, 1)); assert.throws(() => estimatedCost(1, 8001));
});
test('default dry run reuses one-question validation and never reads an ambient Gemini key', async () => {
  const r = await run('success', root(), [], { GEMINI_API_KEY: 'PRIVATE_KEY_DO_NOT_LOG' });
  assert.equal(r.code, 0, r.err);
  assert.equal(events(r.dir).filter(e => e.type === 'dispatch').length, 4);
  assert.equal(events(r.dir).at(-1).reservedNanoUsd, 336000000);
  assert.ok(!JSON.stringify(events(r.dir)).includes('PRIVATE_KEY_DO_NOT_LOG'));
  assert.ok(!(r.out + r.err).includes('PRIVATE_KEY_DO_NOT_LOG'));
  const result = JSON.parse(readFileSync(`${r.dir}/first-question/review.json`));
  assert.equal(result.mode, 'dry-run'); assert.equal(result.provenance, 'synthetic_offline_fixture');
  assert.equal(result.validation.deterministic.computedAnswer, 3);
  console.log(`Retained Phase 6.4B evidence: ${r.dir}`);
});
test('insufficient allowance stops before the next request without refund', async () => {
  const r = await run('success', root(), ['--max-usd', '0.10']);
  assert.equal(r.code, 1); const log = events(r.dir);
  assert.equal(log.filter(e => e.type === 'dispatch').length, 1);
  assert.equal(log.at(-1).reason, 'BUDGET_EXHAUSTED'); assert.equal(log.at(-1).reservedNanoUsd, 84000000);
  assert.ok(!existsSync(`${r.dir}/first-question/review.json`));
});
for (const s of ['429', '503', 'timeout', 'missing-usage', 'invalid-usage', 'input-overflow', 'output-overflow']) {
  test(`${s} is held; no automatic retry or raw diagnostics`, async () => {
    const r = await run(s); assert.equal(r.code, 1);
    assert.equal(events(r.dir).filter(e => e.type === 'dispatch').length, 1);
    assert.equal(events(r.dir).at(-1).type, 'held');
    assert.ok(!(r.out + r.err + JSON.stringify(events(r.dir))).includes('PRIVATE_PROVIDER_ERROR_DO_NOT_LOG'));
    assert.equal((await run('success', r.dir)).code, 1);
  });
}
test('partial validation never produces an accepted artifact', async () => {
  const r = await run('partial'); assert.equal(r.code, 1);
  assert.equal(events(r.dir).filter(e => e.type === 'dispatch').length, 4);
  assert.ok(!existsSync(`${r.dir}/first-question/review.json`));
});
test('fifth request is refused and concurrent executions share a permanent identity lock', async () => {
  const r = await run('request-limit'); assert.equal(r.code, 1);
  assert.equal(events(r.dir).filter(e => e.type === 'dispatch').length, 4);
  assert.equal(events(r.dir).at(-1).reason, 'REQUEST_LIMIT');
  const dir = root(); const parallel = await Promise.all([run('success', dir), run('success', dir)]);
  assert.deepEqual(parallel.map(x => x.code).sort(), [0, 1]);
  assert.equal(events(dir).filter(e => e.type === 'dispatch').length, 4);
});
for (const s of ['crash', 'audit-crash']) test(`${s} retains charged reservation and cannot be replayed`, async () => {
  const r = await run(s); assert.equal(r.code, 86);
  const before = events(r.dir); assert.equal(before.at(-1).type, 'dispatch');
  assert.equal((await run('success', r.dir)).code, 1); assert.deepEqual(events(r.dir), before);
});
test('complete authorization still cannot override source-controlled missing billing proof', () => {
  assert.equal(BILLING_PROOF.verified, false);
  const expected = { authorizationId: 'approved-test', manifestHash: 'test-hash', allowanceNanoUsd: 400000000 };
  const now = Date.parse('2026-10-24T12:00:00Z');
  const approval = { ...expected, version: 1, model: MODEL, maxRequests: 4, action: 'one-question-four-requests', expiresAt: new Date(now + 30000).toISOString() };
  assert.throws(() => authorizeLive(approval, expected, { ZI_PILOT_EXECUTION_AUTHORIZATION: expected.authorizationId }, now), /LIVE_BILLING_BOUND_UNPROVEN/);
  assert.throws(() => authorizeLive({ ...approval, allowanceNanoUsd: 1 }, expected, {}, now), /AUTHORIZATION/);
  assert.throws(() => authorizeLive({ ...approval, expiresAt: 'invalid' }, expected, {}, now), /AUTHORIZATION/);
  assert.throws(() => authorizeLive(approval, { ...expected, manifestHash: digest({ evidenceRoot: root() }) }, {}, now), /AUTHORIZATION/);
});
test('live flag alone, production/preview and app/DB environments are rejected', async () => {
  const live = await run('success', root(), ['--live']); assert.equal(live.code, 1);
  for (const override of [{ NODE_ENV: 'production' }, { VERCEL_ENV: 'preview' }, { NEXT_RUNTIME: 'nodejs' }, { SUPABASE_URL: 'https://synthetic.invalid' }, { PGHOST: 'localhost' }, { ZI_GENERATION_PROVIDER_APPROVED: 'true' }]) {
    const r = await run('success', root(), [], override); assert.equal(r.code, 1);
    assert.ok(!existsSync(`${r.dir}/first-question`));
  }
});
test('ledger refuses overlapping calls, malformed accounting, and post-close operations', () => {
  const l = ledger(root(), 'isolated', { allowanceNanoUsd: parseAllowance() });
  try {
    l.dispatch('analysis', validBody()); assert.throws(() => l.dispatch('blind', validBody()), /CONCURRENT/);
    assert.throws(() => l.ack({ inputTokens: 1, outputTokens: 1, totalTokens: 2 }), /UNKNOWN_USAGE/);
    assert.equal(l.snapshot().pending, true);
    l.finish(false, 'UNKNOWN_USAGE');
    assert.throws(() => l.dispatch('retry', {}), /CLOSED/);
  } finally { l.close(); }
  assert.throws(() => l.event('illegal'), /CLOSED/);
});
test('already aborted transport never calls IO and oversized responses are rejected', async () => {
  let calls = 0; const c = new AbortController(); c.abort();
  await assert.rejects(() => requestOnce({ body: validBody(), key: 'PRIVATE', signal: c.signal, io: async () => { calls++; } }));
  assert.equal(calls, 0);
  await assert.rejects(() => requestOnce({ body: validBody(), key: 'PRIVATE', io: async () => ({ status: 200, body: 'x'.repeat(LIMITS.responseBytes + 1) }) }), /RESPONSE_LIMIT/);
});
test('serialized ceiling includes schema; output request is bounded to one candidate and no tools', () => {
  const body = requestBody('instructions', { questions: 1 }, {});
  assert.equal(body.generationConfig.candidateCount, 1); assert.equal(body.generationConfig.maxOutputTokens, LIMITS.outputTokens);
  assert.equal(body.tools, undefined);
  assert.throws(() => requestBody('', {}, { schemaPadding: 'x'.repeat(16001) }), /PROMPT_LIMIT/);
});
test('single-attempt transport returns safe errors for 429, 5xx, redirects and malformed JSON', async () => {
  for (const status of [429, 500, 503, 302, 307]) {
    let calls = 0;
    await assert.rejects(() => requestOnce({ body: validBody(), key: 'PRIVATE_KEY', io: async () => { calls++; return { status, body: 'PRIVATE_KEY' }; } }), error => !error.message.includes('PRIVATE_KEY'));
    assert.equal(calls, 1);
  }
  await assert.rejects(() => requestOnce({ body: validBody(), key: 'PRIVATE_KEY', io: async () => { throw Error('PRIVATE_KEY'); } }), /UNKNOWN_PROVIDER_OUTCOME/);
  await assert.rejects(() => requestOnce({ body: validBody(), key: 'PRIVATE_KEY', io: async () => ({ status: 200, body: 'PRIVATE_KEY' }) }), /INVALID_PROVIDER_JSON/);
});
test('offline subprocess cannot connect to Gemini, hosted Supabase or Unix database sockets', async () => {
  const code = `const a=require('node:assert/strict');for(const fn of [()=>fetch('https://generativelanguage.googleapis.com'),()=>require('node:https').request('https://synthetic.supabase.co'),()=>require('node:net').connect({path:'/tmp/prepzii-phase5-pg17/.s.PGSQL.55436'})])a.throws(fn,/OFFLINE_PILOT_TRANSPORT_DENIED/);`;
  const p = spawn(process.execPath, ['--require', guard, '-e', code], { env });
  assert.equal(await new Promise(resolve => p.on('close', resolve)), 0);
});
