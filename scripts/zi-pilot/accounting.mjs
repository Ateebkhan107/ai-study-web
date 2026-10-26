import { mkdirSync, realpathSync, lstatSync, openSync, writeFileSync, fsyncSync, closeSync } from 'node:fs';
import { LIMITS, PRICES, digest, refuse, estimatedCost, admitRequestCost } from './live-policy.mjs';
import { DEMO, demoAdmission, demoCost } from './demo-policy.mjs';
function syncDir(path) { const f = openSync(path, 'r'); try { fsyncSync(f); } finally { closeSync(f); } }
export function ledger(root, authorizationId, manifest) {
  const demo = manifest?.profile === DEMO.profile;
  if (manifest?.profile && !demo) refuse('UNKNOWN_LEDGER_PROFILE');
  if (demo && (manifest.model !== DEMO.model || manifest.allowanceNanoUsd !== DEMO.allowanceNanoUsd)) refuse('DEMO_POLICY_MISMATCH');
  const limits = demo ? DEMO : LIMITS;
  if (!Number.isSafeInteger(manifest?.allowanceNanoUsd) || manifest.allowanceNanoUsd <= 0 || manifest.allowanceNanoUsd > 1000000000) refuse('INVALID_SPENDING_ALLOWANCE');
  if (!/^\/private\/tmp\/prepzii-gemini-pilot-[A-Za-z0-9]+$/.test(root) || realpathSync(root) !== root) refuse('UNSAFE_ROOT');
  const st = lstatSync(root);
  if (!st.isDirectory() || st.isSymbolicLink() || st.uid !== process.getuid() || (st.mode & 0o777) !== 0o700) refuse('UNSAFE_ROOT');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(authorizationId)) refuse('INVALID_AUTHORIZATION_ID');
  const dir = `${root}/${authorizationId}`;
  try { mkdirSync(dir, { mode: 0o700 }); } catch { refuse('DUPLICATE_OR_UNCERTAIN_EXECUTION'); }
  syncDir(root);
  const fd = openSync(`${dir}/journal.jsonl`, 'wx', 0o600); syncDir(dir);
  let requests = 0, reservedNanoUsd = 0, pending = false, closed = false, terminal = false;
  const event = (type, data = {}) => {
    if (closed || terminal) refuse('LEDGER_CLOSED');
    writeFileSync(fd, JSON.stringify({ type, requests, reservedNanoUsd, ...data }) + '\n'); fsyncSync(fd);
  };
  event('reserved', { manifest, manifestHash: digest(manifest), prices: demo ? { inputNanoUsd: DEMO.inputNanoUsd, outputNanoUsd: DEMO.outputNanoUsd, reviewed: DEMO.reviewed } : PRICES });
  return {
    dir, event,
    dispatch(stage, body) {
      if (closed || terminal) refuse('LEDGER_CLOSED');
      if (pending) refuse('CONCURRENT_REQUEST_DENIED');
      if (requests >= limits.requests) refuse('REQUEST_LIMIT');
      const cost = (demo ? demoAdmission : admitRequestCost)(body, reservedNanoUsd, manifest.allowanceNanoUsd, manifest.mode || 'dry-run');
      requests++; reservedNanoUsd += cost;
      event('dispatch', { stage, requestHash: digest(body), reservedInputTokens: limits.inputTokens, reservedOutputTokens: limits.outputTokens, maximumEstimatedNanoUsd: cost });
      pending = true;
    },
    ack(usage) {
      if (closed || terminal) refuse('LEDGER_CLOSED');
      if (!pending) refuse('UNEXPECTED_ACK');
      if (!usage || !['inputTokens', 'outputTokens', 'thoughtTokens', 'totalTokens'].every(k => Number.isSafeInteger(usage[k]) && usage[k] >= 0)
        || usage.totalTokens <= 0 || usage.totalTokens !== usage.inputTokens + usage.outputTokens + usage.thoughtTokens) refuse('UNKNOWN_USAGE');
      const estimatedNanoUsd = (demo ? demoCost : estimatedCost)(usage.inputTokens, usage.outputTokens + usage.thoughtTokens);
      event('ack', { usage, estimatedNanoUsd }); pending = false;
    },
    finish(ok, reason = null) { event(ok ? 'complete' : pending ? 'held' : 'failed', { reason, retryAllowed: false }); terminal = true; },
    artifact(value) {
      if (closed || terminal) refuse('LEDGER_CLOSED');
      if (pending || requests !== limits.requests) refuse('INCOMPLETE_VALIDATION');
      const file = openSync(`${dir}/review.json`, 'wx', 0o600);
      try { writeFileSync(file, JSON.stringify(value, null, 2)); fsyncSync(file); } finally { closeSync(file); }
      syncDir(dir);
    },
    close() { if (!closed) { closeSync(fd); closed = true; } },
    snapshot() { return { requests, reservedNanoUsd, pending }; },
  };
}
