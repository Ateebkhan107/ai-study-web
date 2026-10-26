// Standalone offline quality evaluation. No application route, SDK, DB adapter or env loader.
import './deny-network.cjs';
import { mkdirSync, mkdtempSync, realpathSync, lstatSync, openSync, writeFileSync, fsyncSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { config, references, mockResponse } from './fixtures.mjs';
import { evaluateOneQuestion } from './pipeline.mjs';
import { validateGenerationConfig } from '../../src/lib/zi/testGenerator/questionSchema.server.js';

const LIMITS = Object.freeze({ requests: 4, requestBytes: 16000, outputTokens: 8000, reservationUnits: 96000, requestMs: 45000, runMs: 240000 });
const scenarios = ['success', 'request-limit', 'budget-exhausted', 'provider-error', 'timeout', 'invalid-answer', 'wrong-numerical', 'incomplete-validation', 'two-questions', 'uncertain-requests', 'missing-usage', 'usage-overflow', 'incomplete-output', 'shutdown', 'crash', 'audit-error', 'audit-timeout', 'audit-missing-usage', 'audit-crash', 'copied-reference', 'oversized-prompt'];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function fail(code) { throw Object.assign(Error(code), { safeCode: code }); }
function privateDirectory(path) {
  if (!/^\/private\/tmp\/prepzii-one-question-[A-Za-z0-9]+$/.test(path) || realpathSync(path) !== path) fail('UNSAFE_EVIDENCE_ROOT');
  const st = lstatSync(path);
  if (!st.isDirectory() || st.isSymbolicLink() || st.uid !== process.getuid() || (st.mode & 0o777) !== 0o700) fail('UNSAFE_EVIDENCE_PERMISSIONS');
}
function durableFile(path, value) {
  const fd = openSync(path, 'wx', 0o600);
  try { writeFileSync(fd, value); fsyncSync(fd); } finally { closeSync(fd); }
}
function syncDirectory(path) { const fd = openSync(path, 'r'); try { fsyncSync(fd); } finally { closeSync(fd); } }

async function main() {
  const args = process.argv.slice(2);
  // Reject unknown options; no key, URL, connection string or live adapter can be supplied.
  if (args.includes('--live') || process.env.ZI_PILOT_LIVE_APPROVED === 'true') fail('LIVE_EXECUTION_NOT_IMPLEMENTED');
  if (process.env.NODE_ENV === 'production' || ['VERCEL', 'VERCEL_ENV', 'CI', 'NETLIFY', 'RENDER', 'FLY_APP_NAME'].some(k => process.env[k])) fail('LOCAL_ONLY');
  if (['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'DATABASE_URL', 'PGHOST', 'PGSERVICE', 'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NODE_OPTIONS'].some(k => process.env[k])) fail('AMBIENT_CREDENTIAL_OR_TRANSPORT_CONFIG');
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--root', '--run-id', '--mock-scenario'].includes(args[i]) || !args[i + 1] || options[args[i]]) fail('INVALID_ARGUMENT');
    options[args[i]] = args[i + 1];
  }
  const scenario = options['--mock-scenario'] || 'success';
  if (!scenarios.includes(scenario)) fail('INVALID_MOCK_SCENARIO');
  const runId = options['--run-id'] || 'first-question';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(runId)) fail('INVALID_RUN_ID');
  const root = options['--root'] || mkdtempSync('/private/tmp/prepzii-one-question-');
  privateDirectory(root);
  const dir = `${root}/${runId}`;
  try { mkdirSync(dir, { mode: 0o700 }); }
  catch (error) { if (error.code === 'EEXIST') fail('DUPLICATE_EXECUTION_REQUIRES_REVIEW'); throw error; }
  // Exclusive mkdir is also the cross-process lock. Never removed, even on shutdown/crash.
  syncDirectory(root);
  const fd = openSync(`${dir}/journal.jsonl`, 'wx', 0o600);
  syncDirectory(dir);
  let requests = 0, reservationUnits = 0, pending = false;
  const controller = new AbortController();
  const shutdown = () => controller.abort();
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
  const runTimer = setTimeout(shutdown, LIMITS.runMs);
  const event = (type, data = {}) => { writeFileSync(fd, JSON.stringify({ type, requests, reservationUnits, ...data }) + '\n'); fsyncSync(fd); };
  async function call(stage, systemInstruction, payload, schema) {
    if (controller.signal.aborted) fail('SHUTDOWN');
    if (requests >= LIMITS.requests) fail('REQUEST_LIMIT');
    // Same REST JSON envelope as the existing adapter, but never transmitted.
    const body = { systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
      ...(scenario === 'oversized-prompt' ? { offlineTestPadding: 'x'.repeat(16000) } : {}),
      generationConfig: { responseMimeType: 'application/json', responseJsonSchema: schema, temperature: 0.1, maxOutputTokens: LIMITS.outputTokens, thinkingConfig: { thinkingLevel: 'LOW', includeThoughts: false } } };
    const bytes = Buffer.byteLength(JSON.stringify(body));
    if (bytes > LIMITS.requestBytes) fail('PROMPT_LIMIT');
    const reservation = bytes + LIMITS.outputTokens;
    if (reservationUnits + reservation > (scenario === 'budget-exhausted' ? 1 : LIMITS.reservationUnits)) fail('BUDGET_EXHAUSTED');
    requests++; reservationUnits += reservation;
    event('dispatch', { stage, bodyHash: hash(body), requestBytes: bytes, reservedUnits: reservation, maxAttempts: 1 });
    pending = true;
    if (scenario === 'crash' || scenario === 'audit-crash' && stage === 'audit') process.exit(86); // Offline crash fixture: durable unacked dispatch survives.
    let timer;
    let onAbort;
    try {
      const result = await Promise.race([
        Promise.resolve().then(() => {
          if (scenario === 'provider-error' || scenario === 'audit-error' && stage === 'audit') throw Error('private mock error deliberately withheld');
          if (['timeout', 'shutdown'].includes(scenario) || scenario === 'audit-timeout' && stage === 'audit') return new Promise(() => {});
          return mockResponse(stage, payload, scenario === 'audit-missing-usage' && stage === 'audit' ? 'missing-usage' : scenario);
        }),
        new Promise((_, reject) => { timer = setTimeout(() => reject(Error('timeout')), scenario === 'timeout' || scenario === 'audit-timeout' && stage === 'audit' ? 20 : LIMITS.requestMs); }),
        new Promise((_, reject) => { onAbort = () => reject(Error('shutdown')); controller.signal.addEventListener('abort', onAbort, { once: true }); }),
      ]);
      const u = result.usage;
      if (result.providerRequests !== 1 || !u || !['inputTokens', 'outputTokens', 'thoughtTokens', 'totalTokens'].every(k => Number.isSafeInteger(u[k]) && u[k] >= 0)
        || u.totalTokens <= 0 || u.inputTokens + u.outputTokens + u.thoughtTokens !== u.totalTokens || u.totalTokens > reservation || u.outputTokens + u.thoughtTokens > LIMITS.outputTokens) fail('UNCERTAIN_ACCOUNTING');
      event('ack', { stage, usage: u }); pending = false;
      if (result.finishReason !== 'STOP') fail('INCOMPLETE_PROVIDER_OUTPUT');
      return result.data;
    } finally { clearTimeout(timer); controller.signal.removeEventListener('abort', onAbort); }
  }
  try {
    event('reserved', { mode: 'offline_mock_only', config, configurationHash: hash(config), referenceHash: hash(references), provenance: 'synthetic_offline_fixture', limits: LIMITS, intendedLiveModel: 'gemini-3.6-flash' });
    // Preserve the normal application's minimum five: the pilot uses candidate schemas only.
    let productionRejectedOne = false;
    try { validateGenerationConfig(config); } catch { productionRejectedOne = true; }
    if (!productionRejectedOne) fail('PRODUCTION_LIMIT_DRIFT');
    const { question, blind, audit, validation } = await evaluateOneQuestion(call);
    if (scenario === 'request-limit') await call('forbidden-fifth', '', {}, {});
    if (controller.signal.aborted) fail('SHUTDOWN');
    const artifact = { status: 'offline_checks_passed_human_review_required', liveScientificQualityEstablished: false, provenance: 'synthetic_offline_fixture', question, blind, audit, validation, requests };
    event('validated', { artifactHash: hash(artifact) });
    durableFile(`${dir}/review.json`, JSON.stringify(artifact, null, 2)); syncDirectory(dir);
    event('complete');
    console.log(JSON.stringify({ status: artifact.status, requests, root, runId, liveRequests: 0 }));
  } catch (error) {
    const state = pending ? 'held' : 'failed';
    event(state, { reason: error.safeCode || (controller.signal.aborted ? 'SHUTDOWN' : 'OFFLINE_STAGE_FAILED'), retryAllowed: false });
    console.log(JSON.stringify({ status: state, requests, root, runId, liveRequests: 0 }));
    process.exitCode = 1;
  } finally {
    clearTimeout(runTimer); process.removeListener('SIGTERM', shutdown); process.removeListener('SIGINT', shutdown); closeSync(fd);
  }
}
main().catch(() => { console.error('Pilot refused; check local-only mode, clean environment, private evidence root and run identity. Live execution is unavailable.'); process.exitCode = 1; });
