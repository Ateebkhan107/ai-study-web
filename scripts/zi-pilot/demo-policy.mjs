import { assertRequestBoundary, digest, refuse } from './live-policy.mjs';
export const DEMO = Object.freeze({ profile: 'one-real-question-demo-v1', model: 'gemini-3.5-flash-lite', requests: 1,
  inputTokens: 1048576, outputTokens: 8000, allowanceNanoUsd: 400000000, reservationNanoUsd: 390000000,
  inputNanoUsd: 300, outputNanoUsd: 2500, reviewed: '2026-10-25', validThrough: '2026-10-26T23:59:59Z' });
export const demoMaximumCost = () => DEMO.inputTokens * DEMO.inputNanoUsd + DEMO.outputTokens * DEMO.outputNanoUsd;
export function demoCost(input, output) {
  if (![input, output].every(n => Number.isSafeInteger(n) && n >= 0) || input > DEMO.inputTokens || output > DEMO.outputTokens) refuse('TOKEN_LIMIT');
  return input * DEMO.inputNanoUsd + output * DEMO.outputNanoUsd;
}
export function demoAdmission(body, reserved, allowance, mode) {
  assertRequestBoundary(body);
  if (!['dry-run', 'demo-live'].includes(mode) || allowance !== DEMO.allowanceNanoUsd || !Number.isSafeInteger(reserved) || reserved < 0) refuse('DEMO_POLICY_MISMATCH');
  if (reserved + DEMO.reservationNanoUsd > allowance || demoMaximumCost() > DEMO.reservationNanoUsd) refuse('BUDGET_EXHAUSTED');
  return DEMO.reservationNanoUsd;
}
export function authorizeDemo(plan, approval, env, now = Date.now()) {
  if (now > Date.parse(DEMO.validThrough)) refuse('DEMO_PRICING_REVIEW_EXPIRED');
  if (!approval || approval.action !== DEMO.profile || approval.manifestHash !== digest(plan) || approval.authorizationId !== plan.authorizationId
    || approval.allowanceNanoUsd !== DEMO.allowanceNanoUsd || approval.maxRequests !== 1 || approval.model !== DEMO.model
    || approval.developmentProjectConfirmed !== true || approval.standardPricingConfirmed !== true || !env.GEMINI_API_KEY
    || approval.keyFingerprint !== digest(env.GEMINI_API_KEY)
    || env.ZI_PILOT_EXECUTION_AUTHORIZATION !== plan.authorizationId || !Number.isFinite(Date.parse(approval.expiresAt))
    || Date.parse(approval.expiresAt) <= now || Date.parse(approval.expiresAt) > now + 3600000) refuse('DEMO_EXECUTION_AUTHORIZATION_REQUIRED');
}
