import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, statSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./run.mjs', import.meta.url));
const guard = fileURLToPath(new URL('./deny-network.cjs', import.meta.url));
const env = { PATH: '/usr/bin:/bin', NODE_NO_WARNINGS: '1' }; // No inherited credentials, NODE_OPTIONS or env loader.
const root = () => mkdtempSync('/private/tmp/prepzii-one-question-');
const journal = (dir, id = 'first-question') => readFileSync(`${dir}/${id}/journal.jsonl`, 'utf8').trim().split('\n').map(JSON.parse);
function start(args, overrides = {}) {
  const child = spawn(process.execPath, ['--conditions=react-server', script, ...args], { env: { ...env, ...overrides } });
  let out = '', err = '';
  child.stdout.on('data', c => { out += c; }); child.stderr.on('data', c => { err += c; });
  const done = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code, signal) => resolve({ code, signal, out, err }));
  });
  return { child, done };
}
async function run(scenario = 'success', dir = root(), extra = []) {
  const result = await start(['--root', dir, '--mock-scenario', scenario, ...extra]).done;
  return { ...result, dir };
}

test('exactly one numerical question passes all reused validators in four requests', async () => {
  const r = await run(); assert.equal(r.code, 0, r.err);
  const events = journal(r.dir);
  assert.deepEqual(events.filter(e => e.type === 'dispatch').map(e => e.stage), ['analysis', 'generation', 'blind', 'audit']);
  assert.equal(events.filter(e => e.type === 'ack').length, 4);
  assert.ok(events.filter(e => e.type === 'dispatch').every(e => e.requestBytes <= 16000 && e.maxAttempts === 1));
  assert.ok(events.at(-1).reservationUnits <= 96000);
  const review = JSON.parse(readFileSync(`${r.dir}/first-question/review.json`));
  assert.equal(review.requests, 4); assert.equal(review.validation.deterministic.computedAnswer, 3);
  assert.equal(review.liveScientificQualityEstablished, false);
  assert.equal(review.provenance, 'synthetic_offline_fixture');
  assert.ok(!('correctAnswer' in JSON.parse(r.out)));
  assert.equal(statSync(`${r.dir}/first-question/review.json`).mode & 0o777, 0o600);
  console.log(`Retained success evidence: ${r.dir}`);
});
test('fifth dispatch is refused without a fifth provider request or artifact', async () => {
  const r = await run('request-limit'); const events = journal(r.dir);
  assert.equal(r.code, 1); assert.equal(events.filter(e => e.type === 'dispatch').length, 4);
  assert.equal(events.at(-1).reason, 'REQUEST_LIMIT'); assert.ok(!existsSync(`${r.dir}/first-question/review.json`));
});
test('budget exhaustion stops before any dispatch', async () => {
  const r = await run('budget-exhausted'); const events = journal(r.dir);
  assert.equal(r.code, 1); assert.equal(events.filter(e => e.type === 'dispatch').length, 0);
  assert.equal(events.at(-1).reason, 'BUDGET_EXHAUSTED');
});
test('serialized prompt limit includes schema and rejects before dispatch', async () => {
  const r = await run('oversized-prompt'); const events = journal(r.dir);
  assert.equal(r.code, 1); assert.equal(events.filter(e => e.type === 'dispatch').length, 0);
  assert.equal(events.at(-1).reason, 'PROMPT_LIMIT');
});
for (const scenario of ['provider-error', 'timeout', 'uncertain-requests', 'missing-usage', 'usage-overflow']) {
  test(`${scenario} holds the run and never retries`, async () => {
    const r = await run(scenario); const events = journal(r.dir);
    assert.equal(r.code, 1); assert.equal(events.filter(e => e.type === 'dispatch').length, 1);
    assert.equal(events.at(-1).type, 'held'); assert.equal(events.at(-1).retryAllowed, false);
    const before = readFileSync(`${r.dir}/first-question/journal.jsonl`, 'utf8');
    assert.equal((await run('success', r.dir)).code, 1);
    assert.equal(readFileSync(`${r.dir}/first-question/journal.jsonl`, 'utf8'), before);
    assert.ok(!existsSync(`${r.dir}/first-question/review.json`));
    assert.ok(!r.out.includes('private mock error'));
  });
}
for (const scenario of ['invalid-answer', 'wrong-numerical', 'incomplete-validation', 'two-questions', 'incomplete-output', 'copied-reference']) {
  test(`${scenario} fails without releasing a review artifact`, async () => {
    const r = await run(scenario); const events = journal(r.dir);
    assert.equal(r.code, 1); assert.equal(events.at(-1).type, 'failed');
    assert.ok(events.filter(e => e.type === 'dispatch').length <= 4);
    assert.ok(!existsSync(`${r.dir}/first-question/review.json`));
  });
}
test('completed run is immutable and duplicate execution makes no new dispatch', async () => {
  const r = await run(); const before = readFileSync(`${r.dir}/first-question/journal.jsonl`, 'utf8');
  assert.equal((await run('success', r.dir)).code, 1);
  assert.equal(readFileSync(`${r.dir}/first-question/journal.jsonl`, 'utf8'), before);
});
test('concurrent processes serialize the same run identity with an exclusive persistent lock', async () => {
  const dir = root();
  const results = await Promise.all([run('success', dir), run('success', dir)]);
  assert.deepEqual(results.map(r => r.code).sort(), [0, 1]);
  assert.equal(journal(dir).filter(e => e.type === 'dispatch').length, 4);
});
test('crash leaves a durable unacknowledged dispatch; restart cannot replay it', async () => {
  const r = await run('crash'); assert.equal(r.code, 86);
  assert.equal(journal(r.dir).at(-1).type, 'dispatch');
  assert.equal((await run('success', r.dir)).code, 1);
  assert.equal(journal(r.dir).filter(e => e.type === 'dispatch').length, 1);
});
for (const scenario of ['audit-error', 'audit-timeout', 'audit-missing-usage', 'audit-crash']) {
  test(`${scenario} retains all four dispatches and refuses a fifth after restart`, async () => {
    const r = await run(scenario); assert.notEqual(r.code, 0);
    const events = journal(r.dir);
    assert.equal(events.filter(e => e.type === 'dispatch').length, 4);
    assert.equal(events.filter(e => e.type === 'ack').length, 3);
    assert.equal((await run('success', r.dir)).code, 1);
    assert.equal(journal(r.dir).filter(e => e.type === 'dispatch').length, 4);
    assert.ok(!existsSync(`${r.dir}/first-question/review.json`));
  });
}
test('SIGTERM during dispatch performs safe shutdown, holds uncertainty and cannot resume', async () => {
  const dir = root(); const running = start(['--root', dir, '--mock-scenario', 'shutdown']);
  const until = Date.now() + 5000;
  while (Date.now() < until) {
    try { if (journal(dir).some(e => e.type === 'dispatch')) break; } catch { /* Wait for initial fsync. */ }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.ok(journal(dir).some(e => e.type === 'dispatch'));
  running.child.kill('SIGTERM'); const result = await running.done;
  assert.equal(result.code, 1); assert.equal(journal(dir).at(-1).type, 'held');
  assert.equal((await run('success', dir)).code, 1);
});
test('live opt-in and ambient secrets/hosted configuration cannot enable execution', async () => {
  for (const [args, override] of [
    [['--live'], {}], [[], { ZI_PILOT_LIVE_APPROVED: 'true' }], [[], { GEMINI_API_KEY: 'test-secret-do-not-print' }],
    [[], { NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic.invalid' }], [[], { NODE_ENV: 'production' }], [[], { VERCEL: '1' }],
  ]) {
    const dir = root(); const r = await start(['--root', dir, ...args], override).done;
    assert.equal(r.code, 1); assert.ok(!existsSync(`${dir}/first-question`)); assert.ok(!r.err.includes('test-secret-do-not-print'));
  }
});
test('unsafe paths, permissions and arbitrary configuration are refused', async () => {
  const dir = root(); chmodSync(dir, 0o755);
  assert.equal((await run('success', dir)).code, 1);
  chmodSync(dir, 0o700); // Preserve evidence with private permissions.
  assert.equal((await run('success', root(), ['--run-id', '../escape'])).code, 1);
  assert.equal((await run('success', root(), ['--question-count', '5'])).code, 1);
});
test('transport guard denies hosted/local HTTP, Gemini, DB sockets, DNS and subprocesses', async () => {
  const code = `const a=require('node:assert/strict');
    for(const fn of [()=>fetch('https://generativelanguage.googleapis.com'),()=>fetch('https://synthetic.supabase.co'),()=>fetch('http://127.0.0.1'),
    ()=>require('node:net').connect({path:'/tmp/prepzii-phase5-pg17/.s.PGSQL.55436'}),()=>require('node:https').request('https://synthetic.invalid'),
    ()=>require('node:dns').lookup('synthetic.invalid',()=>{}),()=>require('node:child_process').spawn('psql',[])])a.throws(fn,/OFFLINE_PILOT_TRANSPORT_DENIED/);`;
  const p = spawn(process.execPath, ['--require', guard, '-e', code], { env });
  const result = await new Promise(resolve => p.on('close', resolve)); assert.equal(result, 0);
});
