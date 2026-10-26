import { createHash } from 'node:crypto';
export const MODEL = 'gemini-3.6-flash';
export const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
export const LIMITS = Object.freeze({ requests: 4, inputTokens: 16000, outputTokens: 8000, bodyBytes: 16000, responseBytes: 262144, requestMs: 45000, runMs: 240000 });
// Conservative price ceilings: $1.50/$7.50 per million, above the reviewed 2026 Standard prices.
// Nanodollars per token: no floating point money or optimistic refunds.
export const PRICES = Object.freeze({ inputNanoUsd: 1500, outputNanoUsd: 7500, reviewed: '2026-10-24', validThrough: '2026-12-31' });
export const BILLING_PROOF = Object.freeze({ verified: false, reason: 'No certified local tokenizer/input bound for the complete request including schema and service overhead.' });
export const DOCUMENTED_MODEL_LIMITS = Object.freeze({ inputTokens: 1048576, outputTokens: 65536, reviewed: '2026-10-24' });
export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function refuse(code) { throw Object.assign(Error(code), { safeCode: code }); }
export function parseAllowance(value = '0.40') {
  if (!/^(?:0\.[0-9]{1,3}|1(?:\.0{1,3})?)$/.test(value)) refuse('INVALID_SPENDING_ALLOWANCE');
  const [whole, decimals = ''] = value.split('.');
  const n = Number(whole) * 1e9 + Number(decimals.padEnd(9, '0'));
  if (n <= 0) refuse('INVALID_SPENDING_ALLOWANCE');
  return n;
}
export function estimatedCost(input = LIMITS.inputTokens, output = LIMITS.outputTokens) {
  if (![input, output].every(n => Number.isSafeInteger(n) && n >= 0) || input > LIMITS.inputTokens || output > LIMITS.outputTokens) refuse('TOKEN_LIMIT');
  return input * PRICES.inputNanoUsd + output * PRICES.outputNanoUsd;
}
// Diagnostic only: reserve the entire published model input window, not an invented bytes/token ratio.
// This is not approval of that much input or a guarantee about rejected requests/account billing.
export function modelEnvelopeCost() {
  return (DOCUMENTED_MODEL_LIMITS.inputTokens * PRICES.inputNanoUsd + LIMITS.outputTokens * PRICES.outputNanoUsd) * LIMITS.requests;
}
export function assertRequestBoundary(body) {
  if (!body || Object.keys(body).sort().join(',') !== 'contents,generationConfig,systemInstruction') refuse('REQUEST_SHAPE');
  const textParts = value => value && Object.keys(value).join(',') === 'parts' && Array.isArray(value.parts) && value.parts.length === 1
    && Object.keys(value.parts[0] || {}).join(',') === 'text' && typeof value.parts[0].text === 'string';
  if (!textParts(body.systemInstruction) || !Array.isArray(body.contents) || body.contents.length !== 1
    || body.contents[0]?.role !== 'user' || Object.keys(body.contents[0]).sort().join(',') !== 'parts,role'
    || !textParts({ parts: body.contents[0].parts })) refuse('TEXT_ONLY_REQUEST_REQUIRED');
  const g = body.generationConfig;
  if (!g || Object.keys(g).sort().join(',') !== 'candidateCount,maxOutputTokens,responseJsonSchema,responseMimeType,temperature,thinkingConfig'
    || g.maxOutputTokens !== LIMITS.outputTokens || g.candidateCount !== 1 || g.temperature !== 0.1 || g.responseMimeType !== 'application/json'
    || !g.responseJsonSchema || typeof g.responseJsonSchema !== 'object' || Array.isArray(g.responseJsonSchema)
    || !g.thinkingConfig || Object.keys(g.thinkingConfig).sort().join(',') !== 'includeThoughts,thinkingLevel'
    || g.thinkingConfig.thinkingLevel !== 'LOW' || g.thinkingConfig.includeThoughts !== false) refuse('GENERATION_LIMIT_DRIFT');
  const serializedBytes = Buffer.byteLength(JSON.stringify(body), 'utf8');
  if (serializedBytes > LIMITS.bodyBytes) refuse('PROMPT_LIMIT');
  return { serializedBytes, certifiedInputTokens: null, inputBoundVerified: BILLING_PROOF.verified };
}
export function assertLiveInputBound(body) {
  assertRequestBoundary(body);
  // No caller-supplied count/certificate or usage from a previous request can satisfy this gate.
  // Changing the old global approval flag alone must not turn bytes into a token certificate.
  refuse('LIVE_INPUT_TOKEN_BOUND_UNPROVEN');
}
export function admitRequestCost(body, reservedNanoUsd, allowanceNanoUsd, mode = 'dry-run') {
  assertRequestBoundary(body);
  if (mode === 'live') assertLiveInputBound(body);
  if (mode !== 'dry-run') refuse('INVALID_EXECUTION_MODE');
  if (![reservedNanoUsd, allowanceNanoUsd].every(n => Number.isSafeInteger(n) && n >= 0)) refuse('INVALID_COST_ACCOUNTING');
  const cost = estimatedCost();
  if (reservedNanoUsd + cost > allowanceNanoUsd) refuse('BUDGET_EXHAUSTED');
  return cost; // Conditional mock reservation only; never an accepted live token proof.
}
export function assertEnvironment(env) {
  if (env.NODE_ENV === 'production' || ['VERCEL', 'VERCEL_ENV', 'CI', 'NETLIFY', 'RENDER', 'FLY_APP_NAME', 'NEXT_RUNTIME', 'NEXT_PHASE', 'NODE_OPTIONS'].some(k => env[k])) refuse('LOCAL_CLI_ONLY');
  if (Object.keys(env).some(k => /SUPABASE|^PG|DATABASE_URL|CLERK|^NEXT_PUBLIC_|^ZI_GENERATION_|^ZI_GENERATED_TEST_ENGINE/.test(k) && env[k])) refuse('APPLICATION_ENVIRONMENT_DENIED');
}
export function requestBody(systemInstruction, payload, schema) {
  const body = { systemInstruction: { parts: [{ text: systemInstruction }] }, contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
    generationConfig: { responseMimeType: 'application/json', responseJsonSchema: schema, temperature: 0.1, candidateCount: 1,
      maxOutputTokens: LIMITS.outputTokens, thinkingConfig: { includeThoughts: false, thinkingLevel: 'LOW' } } };
  assertRequestBoundary(body);
  return body;
}
// Neither operator-supplied JSON nor an environment variable is a token/billing proof.
export function authorizeLive(approval, expected, env, now = Date.now()) {
  assertEnvironment(env);
  if (!approval || approval.version !== 1 || approval.authorizationId !== expected.authorizationId || approval.manifestHash !== expected.manifestHash
    || approval.allowanceNanoUsd !== expected.allowanceNanoUsd || approval.model !== MODEL || approval.maxRequests !== 4
    || approval.action !== 'one-question-four-requests' || !Number.isFinite(Date.parse(approval.expiresAt))
    || Date.parse(approval.expiresAt) <= now || Date.parse(approval.expiresAt) > now + 3600000) refuse('EXECUTION_AUTHORIZATION_REQUIRED');
  if (now > Date.parse(`${PRICES.validThrough}T23:59:59Z`)) refuse('PRICING_REVIEW_EXPIRED');
  if (!BILLING_PROOF.verified) refuse('LIVE_BILLING_BOUND_UNPROVEN');
  if (env.ZI_PILOT_EXECUTION_AUTHORIZATION !== approval.authorizationId) refuse('SEPARATE_OPT_IN_REQUIRED');
}
