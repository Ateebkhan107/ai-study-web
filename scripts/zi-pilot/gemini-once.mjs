import https from 'node:https';
import { ENDPOINT, MODEL, LIMITS, authorizeLive, refuse, assertRequestBoundary, assertLiveInputBound } from './live-policy.mjs';

// One non-streaming HTTP attempt. No SDK, retry runner, proxy, fallback or redirect following.
// io is explicit for offline transport tests; the actual HTTPS transport is reachable only below the billing/authorization gate.
export async function requestOnce({ body, key, signal, io, model = MODEL }) {
  if (![MODEL, 'gemini-3.5-flash-lite'].includes(model)) refuse('MODEL_NOT_ALLOWED');
  if (typeof io !== 'function' || typeof key !== 'string' || !key || /[\r\n]/.test(key)) refuse('INVALID_PRIVATE_TRANSPORT');
  assertRequestBoundary(body);
  const bounded = AbortSignal.any([signal || new AbortController().signal, AbortSignal.timeout(LIMITS.requestMs)]);
  bounded.throwIfAborted();
  let raw, onAbort;
  try {
    raw = await Promise.race([
      io({ body: JSON.stringify(body), key, signal: bounded }),
      new Promise((_, reject) => { onAbort = () => reject(Error('ABORTED')); bounded.addEventListener('abort', onAbort, { once: true }); }),
    ]);
  } catch { refuse('UNKNOWN_PROVIDER_OUTCOME'); }
  finally { if (onAbort) bounded.removeEventListener('abort', onAbort); }
  if (!raw || raw.status !== 200) refuse(raw?.status === 429 ? 'PROVIDER_429' : raw?.status >= 500 ? 'PROVIDER_5XX' : 'PROVIDER_HTTP_FAILURE');
  if (Buffer.byteLength(raw.body || '') > LIMITS.responseBytes) refuse('RESPONSE_LIMIT');
  let result;
  try { result = JSON.parse(raw.body); } catch { refuse('INVALID_PROVIDER_JSON'); }
  const u = result.usageMetadata;
  // Do not convert missing thought usage to zero. Uncertainty is a hold, not permission to guess.
  const usage = u && { inputTokens: u.promptTokenCount, outputTokens: u.candidatesTokenCount, thoughtTokens: u.thoughtsTokenCount, totalTokens: u.totalTokenCount };
  const candidates = result.candidates;
  if (!Array.isArray(candidates) || candidates.length !== 1 || candidates[0].finishReason !== 'STOP') refuse('INCOMPLETE_PROVIDER_OUTPUT');
  let data;
  try { data = JSON.parse(candidates[0].content.parts.filter(p => !p.thought).map(p => p.text || '').join('')); } catch { refuse('INVALID_STRUCTURED_OUTPUT'); }
  return { data, usage, model, returnedModelVersion: typeof result.modelVersion === 'string' && /^[a-z0-9._-]{1,100}$/i.test(result.modelVersion) ? result.modelVersion : null };
}

export function liveTransport({ approval, expected, env }) {
  authorizeLive(approval, expected, env); // Currently always refuses an unproven billing bound.
  const key = env.GEMINI_API_KEY; // No env file, browser variable or key in URL.
  return (body, signal) => {
    authorizeLive(approval, expected, env); // Recheck expiry/approval before every physical request.
    assertLiveInputBound(body); // Independent per-request refusal, before any provider I/O.
    return requestOnce({ body, signal, key, io: ({ body: text, key: privateKey, signal: bounded }) => new Promise((resolve, reject) => {
    const req = https.request(ENDPOINT, { method: 'POST', agent: false, signal: bounded,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(text), 'x-goog-api-key': privateKey } }, res => {
      const chunks = []; let size = 0;
      res.on('data', chunk => { size += chunk.length; if (size > LIMITS.responseBytes) req.destroy(Error('RESPONSE_LIMIT')); else chunks.push(chunk); });
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
      res.on('error', reject);
    });
    req.on('error', reject); req.end(text);
    }) });
  };
}
