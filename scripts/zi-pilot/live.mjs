// DRY RUN by default; no app route imports this operator-only entry point.
import './deny-network.cjs';
import { mkdtempSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { evaluateOneQuestion } from './pipeline.mjs';
import { config, references, mockResponse } from './fixtures.mjs';
import { MODEL, LIMITS, PRICES, BILLING_PROOF, digest, refuse, parseAllowance, assertEnvironment, authorizeLive, requestBody } from './live-policy.mjs';
import { ledger } from './accounting.mjs';
import { requestOnce, liveTransport } from './gemini-once.mjs';

function privateApproval(path, root) {
  if (!path || !path.startsWith(`${root}/`) || realpathSync(path) !== path) refuse('UNSAFE_APPROVAL_FILE');
  const st = lstatSync(path);
  if (!st.isFile() || st.isSymbolicLink() || st.uid !== process.getuid() || (st.mode & 0o777) !== 0o600 || st.size > 4096) refuse('UNSAFE_APPROVAL_FILE');
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { refuse('INVALID_APPROVAL_FILE'); }
}
export async function main(args = process.argv.slice(2), env = process.env) {
  assertEnvironment(env);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key === '--live') { if (options.live) refuse('INVALID_ARGUMENT'); options.live = true; continue; }
    if (!['--root', '--authorization-id', '--approval-file', '--max-usd', '--mock-scenario'].includes(key) || !args[i + 1] || options[key]) refuse('INVALID_ARGUMENT');
    options[key] = args[++i];
  }
  const mode = options.live ? 'live' : 'dry-run';
  const authorizationId = options['--authorization-id'] || 'first-question';
  const allowanceNanoUsd = parseAllowance(options['--max-usd']);
  const scenario = options['--mock-scenario'] || 'success';
  const scenarios = ['success', '429', '503', 'timeout', 'missing-usage', 'invalid-usage', 'input-overflow', 'output-overflow', 'partial', 'request-limit', 'crash', 'audit-crash'];
  if (!scenarios.includes(scenario) || mode === 'live' && scenario !== 'success') refuse('INVALID_SCENARIO');
  const root = options['--root'] || mkdtempSync('/private/tmp/prepzii-gemini-pilot-');
  const implementationHash = digest(['live.mjs', 'live-policy.mjs', 'accounting.mjs', 'gemini-once.mjs', 'pipeline.mjs', 'fixtures.mjs', 'deny-network.cjs',
    '../../src/lib/zi/testGenerator/questionSchema.server.js', '../../src/lib/zi/testGenerator/analysisSchema.server.js',
    '../../src/lib/zi/testGenerator/questionValidation.server.js', '../../src/lib/zi/testGenerator/numericalValidation.server.js',
    '../../src/lib/zi/testGenerator/questionSerializers.server.js', '../../src/lib/zi/testGenerator/originality.server.js',
    '../../src/lib/zi/testGenerator/questionPrompts.server.js'].map(name => [name, readFileSync(new URL(name, import.meta.url), 'utf8')]));
  const manifest = { version: 1, mode, authorizationId, evidenceRoot: root, allowanceNanoUsd, model: MODEL, limits: LIMITS, prices: PRICES,
    implementationHash, configHash: digest(config), referenceHash: digest(references), provenance: 'synthetic_offline_fixture', billingBoundVerified: BILLING_PROOF.verified };
  const expected = { authorizationId, allowanceNanoUsd, manifestHash: digest(manifest) };
  let transport;
  if (mode === 'live') {
    const approval = privateApproval(options['--approval-file'], root);
    authorizeLive(approval, expected, env); // Always blocked by source-controlled unproven input bound.
    transport = liveTransport({ approval, expected, env });
  } else if (env.ZI_PILOT_EXECUTION_AUTHORIZATION) refuse('LIVE_OPT_IN_REQUIRES_LIVE_MODE');
  // Dry-run mode never reads a provider key, even if one is present in the caller's environment.
  const log = ledger(root, authorizationId, manifest);
  const controller = new AbortController();
  const shutdown = () => controller.abort();
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
  const timer = setTimeout(shutdown, LIMITS.runMs);
  try {
    const call = async (stage, system, payload, schema) => {
      controller.signal.throwIfAborted();
      const body = requestBody(system, payload, schema);
      log.dispatch(stage, body);
      if (scenario === 'crash' || scenario === 'audit-crash' && stage === 'audit') process.exit(86);
      let response;
      if (transport) response = await transport(body, controller.signal);
      else {
        const signal = scenario === 'timeout' ? AbortSignal.any([controller.signal, AbortSignal.timeout(20)]) : controller.signal;
        response = await requestOnce({ body, key: 'offline-fixture-not-a-secret', signal, io: async () => {
          if (scenario === 'timeout') return new Promise(() => {});
          if (['429', '503'].includes(scenario)) return { status: Number(scenario), body: 'PRIVATE_PROVIDER_ERROR_DO_NOT_LOG' };
          const r = mockResponse(stage, payload, scenario === 'partial' ? 'incomplete-validation' : 'success');
          let u = { promptTokenCount: 100, candidatesTokenCount: 50, thoughtsTokenCount: 0, totalTokenCount: 150 };
          if (scenario === 'missing-usage') u = undefined;
          if (scenario === 'invalid-usage') u.totalTokenCount = '150';
          if (scenario === 'input-overflow') u = { ...u, promptTokenCount: 16001, totalTokenCount: 16051 };
          if (scenario === 'output-overflow') u = { ...u, thoughtsTokenCount: 8000, totalTokenCount: 8150 };
          return { status: 200, body: JSON.stringify({ modelVersion: MODEL, usageMetadata: u,
            candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(r.data) }] } }] }) };
        } });
      }
      log.ack(response.usage);
      return response.data;
    };
    const result = await evaluateOneQuestion(call);
    if (scenario === 'request-limit') await call('forbidden-fifth', '', {}, {});
    controller.signal.throwIfAborted();
    const artifact = { status: 'human_review_required', mode, provenance: manifest.provenance, liveQualityEstablished: false, ...result };
    log.event('validated', { artifactHash: digest(artifact) });
    log.artifact(artifact); log.finish(true);
    console.log(JSON.stringify({ status: 'human_review_required', mode, root, authorizationId, ...log.snapshot(), liveRequests: mode === 'dry-run' ? 0 : undefined }));
  } catch (error) {
    log.finish(false, error.safeCode || 'PRIVATE_STAGE_FAILURE');
    console.log(JSON.stringify({ status: log.snapshot().pending ? 'held' : 'failed', mode, root, authorizationId, ...log.snapshot(), liveRequests: mode === 'dry-run' ? 0 : undefined }));
    process.exitCode = 1;
  } finally { clearTimeout(timer); process.removeListener('SIGINT', shutdown); process.removeListener('SIGTERM', shutdown); log.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => {
  console.error(JSON.stringify({ status: 'refused', code: error.safeCode || 'LOCAL_PILOT_REFUSED' })); process.exitCode = 1;
});
