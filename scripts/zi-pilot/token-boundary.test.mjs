import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { requestBody, assertRequestBoundary, assertLiveInputBound, admitRequestCost, modelEnvelopeCost, DOCUMENTED_MODEL_LIMITS, LIMITS, parseAllowance } from './live-policy.mjs';
import { ledger } from './accounting.mjs';
import { requestOnce } from './gemini-once.mjs';

test('complete serialized request accepts exactly the byte ceiling, refuses one byte above', () => {
  const base = requestBody('system', { text: '' }, {});
  const remaining = LIMITS.bodyBytes - Buffer.byteLength(JSON.stringify(base));
  const exact = requestBody('system', { text: 'a'.repeat(remaining) }, {});
  assert.equal(assertRequestBoundary(exact).serializedBytes, LIMITS.bodyBytes);
  assert.throws(() => requestBody('system', { text: 'a'.repeat(remaining + 1) }, {}), /PROMPT_LIMIT/);
  assert.equal(assertRequestBoundary(exact).certifiedInputTokens, null);
});
test('multibyte, combining text and JSON escaping are measured as serialized UTF-8, never tokens', () => {
  for (const text of ['Physics 旋转运动', 'घूर्णन गति', '🧪⚙️', 'e\u0301', '\\"\n\t']) {
    const body = requestBody(text, { context: text }, { description: text });
    assert.equal(assertRequestBoundary(body).serializedBytes, Buffer.byteLength(JSON.stringify(body), 'utf8'));
    assert.equal(assertRequestBoundary(body).certifiedInputTokens, null);
    assert.throws(() => assertLiveInputBound(body), /INPUT_TOKEN_BOUND_UNPROVEN/);
  }
  const deceptivelyShort = '🧪'.repeat(4500);
  assert.ok(deceptivelyShort.length < LIMITS.bodyBytes);
  assert.throws(() => requestBody('', { context: deceptivelyShort }, {}), /PROMPT_LIMIT/);
});
test('system instructions, question context and validation/schema descriptions each count toward the cap', () => {
  const big = 'x'.repeat(LIMITS.bodyBytes);
  for (const make of [() => requestBody(big, {}, {}), () => requestBody('', { questions: [big] }, {}), () => requestBody('', {}, { description: big })]) {
    assert.throws(make, /PROMPT_LIMIT/);
  }
});
test('tools, media, output-limit drift and fabricated token claims cannot bypass request boundary', () => {
  const mutations = [b => { b.tools = []; }, b => { b.inputTokenCount = 1; }, b => { b.contents[0].parts = [{ inlineData: { data: 'not-allowed' } }]; },
    b => { b.generationConfig.maxOutputTokens = 8001; }, b => { b.generationConfig.candidateCount = 2; }, b => { b.generationConfig.thinkingConfig.includeThoughts = true; }];
  for (const mutate of mutations) {
    const body = requestBody('system', {}, {}); mutate(body);
    assert.throws(() => assertRequestBoundary(body));
  }
});
test('live ledger independently refuses unproven input before any dispatch or reservation', () => {
  const root = mkdtempSync('/private/tmp/prepzii-gemini-pilot-');
  const l = ledger(root, 'token-gate', { mode: 'live', allowanceNanoUsd: parseAllowance() });
  try {
    assert.throws(() => l.dispatch('analysis', requestBody('', {}, {})), /INPUT_TOKEN_BOUND_UNPROVEN/);
    assert.deepEqual(l.snapshot(), { requests: 0, reservedNanoUsd: 0, pending: false });
    l.finish(false, 'LIVE_INPUT_TOKEN_BOUND_UNPROVEN');
  } finally { l.close(); }
  const events = readFileSync(`${root}/token-gate/journal.jsonl`, 'utf8');
  assert.ok(!events.includes('"type":"dispatch"'));
});
test('budget admission accepts an exact remaining amount and rejects one nanodollar short', () => {
  const body = requestBody('', {}, {});
  assert.equal(admitRequestCost(body, 252000000, 336000000), 84000000);
  assert.throws(() => admitRequestCost(body, 252000000, 335999999), /BUDGET_EXHAUSTED/);
  for (const value of [NaN, Infinity, -1, 1.5]) assert.throws(() => admitRequestCost(body, value, 400000000), /COST_ACCOUNTING/);
  assert.throws(() => admitRequestCost(body, 0, 400000000, 'live'), /INPUT_TOKEN_BOUND_UNPROVEN/);
});
test('published full-context envelope exceeds existing allowance; it is not silently admitted', () => {
  assert.equal(DOCUMENTED_MODEL_LIMITS.inputTokens, 1048576);
  assert.equal(modelEnvelopeCost(), 6531456000);
  assert.ok(modelEnvelopeCost() > parseAllowance());
  assert.ok(modelEnvelopeCost() > parseAllowance('1.00'));
  assert.throws(() => parseAllowance('6.54'), /SPENDING_ALLOWANCE/);
});
test('missing input metadata, missing thought usage and token overflow keep pending reservations held', () => {
  for (const usage of [
    { outputTokens: 1, thoughtTokens: 0, totalTokens: 1 },
    { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    { inputTokens: 16001, outputTokens: 1, thoughtTokens: 0, totalTokens: 16002 },
  ]) {
    const root = mkdtempSync('/private/tmp/prepzii-gemini-pilot-');
    const l = ledger(root, 'metadata', { mode: 'dry-run', allowanceNanoUsd: parseAllowance() });
    try {
      l.dispatch('analysis', requestBody('', {}, {}));
      assert.throws(() => l.ack(usage)); assert.equal(l.snapshot().pending, true);
      l.finish(false, 'UNKNOWN_USAGE');
    } finally { l.close(); }
  }
});
test('transport refuses malformed or overlarge payload before calling even mocked IO', async () => {
  let calls = 0;
  const io = async () => { calls++; return { status: 200, body: '{}' }; };
  const over = requestBody('', {}, {}); over.systemInstruction.parts[0].text = '🧪'.repeat(5000);
  await assert.rejects(() => requestOnce({ body: over, key: 'offline-only', io }), /PROMPT_LIMIT/);
  const forged = requestBody('', {}, {}); forged.tools = [];
  await assert.rejects(() => requestOnce({ body: forged, key: 'offline-only', io }), /REQUEST_SHAPE/);
  assert.equal(calls, 0);
});
