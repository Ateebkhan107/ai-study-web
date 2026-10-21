import test from "node:test";
import assert from "node:assert/strict";
import { classifyGeminiError, createGeminiRequestRunner, retryAfterMs } from "../geminiRetry.server.js";

function quota(quotaId, { quotaValue = "20", retryDelay = "1s", headers } = {}) {
  return { status: 429, headers, body: { error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "You exceeded your quota, please check plan and billing details. PRIVATE_PROJECT_DO_NOT_PRINT", details: [
    { "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [{ quotaId, quotaMetric: "generativelanguage.googleapis.com/generate_content_free_tier_requests", quotaValue, quotaDimensions: { model: "gemini-3.6-flash", location: "global", project: "PRIVATE_PROJECT_DO_NOT_PRINT" } }] },
    { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay },
  ] } } };
}
function harness() {
  let time = 1700000000000;
  const delays = [];
  const run = createGeminiRequestRunner({ now: () => time, random: () => 0.5, wait: async (ms) => { delays.push(ms); time += ms; } });
  return { run, delays, now: () => time };
}
const models = ["primary", "existing-fallback"];

test("daily request quota overrides generic billing prose and short retry advice", () => {
  const policy = classifyGeminiError(quota("GenerateRequestsPerDayPerProjectPerModel-FreeTier", { retryDelay: "17345s" }));
  assert.equal(policy.category, "daily_request_quota");
  assert.equal(policy.retryable, false);
  assert.equal(policy.retryAfterMs, 17345000);
  assert.equal(policy.quotaViolations[0].quotaValue, 20);
  assert.ok(!JSON.stringify(policy).includes("PRIVATE_PROJECT"));
});
test("daily token and zero model quotas are not retried", () => {
  assert.equal(classifyGeminiError(quota("GenerateContentInputTokensPerModelPerDay-FreeTier")).category, "daily_token_quota");
  assert.equal(classifyGeminiError(quota("GenerateRequestsPerMinute", { quotaValue: "0" })).category, "zero_model_quota");
});
test("an unclassified 429 is not automatically assumed to be a retryable request rate", () => {
  const policy = classifyGeminiError({ status: 429, body: { error: { status: "RESOURCE_EXHAUSTED" } } });
  assert.equal(policy.category, "unclassified_resource_exhaustion");
  assert.equal(policy.retryable, false);
});
test("minute request/token quotas are distinguished and retryable", () => {
  assert.equal(classifyGeminiError(quota("GenerateRequestsPerMinutePerProjectPerModel-FreeTier")).category, "request_rate_limit");
  const token = classifyGeminiError(quota("GenerateContentInputTokensPerModelPerMinute-FreeTier"));
  assert.equal(token.category, "token_rate_limit");
  assert.equal(token.retryable, true);
});
test("actual billing restrictions are distinguished from quota messages mentioning billing", () => {
  const policy = classifyGeminiError({ status: 403, body: { error: { message: "Billing is disabled for this project." } } });
  assert.equal(policy.category, "billing_restriction");
  assert.equal(policy.retryable, false);
});
test("Retry-After supports seconds and HTTP dates and rejects malformed negative delays", () => {
  const now = 1700000000000;
  assert.equal(retryAfterMs("2.5", now), 2500);
  assert.equal(retryAfterMs(new Date(now + 5000).toUTCString(), now), 5000);
  assert.equal(retryAfterMs("-1", now), null);
  assert.equal(retryAfterMs("not-a-date", now), null);
});
test("policy respects the larger HTTP or structured retry delay", () => {
  const policy = classifyGeminiError(quota("GenerateRequestsPerMinute", { retryDelay: "2s", headers: new Headers({ "retry-after": "4" }) }));
  assert.equal(policy.retryAfterMs, 4000);
});
test("transient errors back off exponentially with bounded jitter and exact request counts", async () => {
  const { run, delays } = harness();
  let calls = 0;
  const result = await run({ models: ["primary"], cooldownKey: "transient", operation: async () => { if (++calls < 3) throw { status: 503 }; return "ok"; } });
  assert.equal(result.providerRequests, 3);
  assert.deepEqual(delays, [375, 750]);
  assert.equal(result.result, "ok");
});
test("minute throttling waits for provider advice and never changes models", async () => {
  const { run, delays } = harness();
  const used = [];
  const result = await run({ models, cooldownKey: "minute", operation: async (model) => { used.push(model); if (used.length === 1) throw quota("GenerateRequestsPerMinute", { retryDelay: "2.5s" }); return "ok"; } });
  assert.deepEqual(used, ["primary", "primary"]);
  assert.deepEqual(delays, [2500]);
  assert.equal(result.providerRequests, 2);
});
test("retry exhaustion makes at most three physical requests", async () => {
  const { run, delays } = harness();
  let calls = 0;
  await assert.rejects(run({ models: ["primary"], cooldownKey: "exhaust", operation: async () => { calls++; throw { status: 502 }; } }), (e) => e.providerRequests === 3 && e.providerDiagnostic.retryExhausted === true);
  assert.equal(calls, 3);
  assert.equal(delays.length, 2);
});
test("daily quota is attempted once, then prevented by a credential-scoped cooldown", async () => {
  const { run, delays } = harness();
  let calls = 0;
  const options = { models, cooldownKey: "hashed-key-and-model", operation: async () => { calls++; throw quota("GenerateRequestsPerDayPerProjectPerModel-FreeTier"); } };
  await assert.rejects(run(options), (e) => e.providerRequests === 1 && e.providerDiagnostic.category === "daily_request_quota");
  await assert.rejects(run(options), (e) => e.providerRequests === 0 && e.providerDiagnostic.cooldownHit === true);
  assert.equal(calls, 1);
  assert.deepEqual(delays, []);
});
test("provider delay beyond the operation deadline is returned, never capped into an early retry", async () => {
  const { run, delays, now } = harness();
  await assert.rejects(run({ models, cooldownKey: "long-delay", deadlineAt: now() + 45000, operation: async () => { throw quota("GenerateRequestsPerMinute", { retryDelay: "60s" }); } }), (e) => e.providerRequests === 1 && e.providerDiagnostic.retryDeferred === true && e.providerDiagnostic.retryAfterMs === 60000);
  assert.deepEqual(delays, []);
});
test("cancelled backoff preserves attempt accounting and never issues another request", async () => {
  const controller = new AbortController();
  let calls = 0;
  const run = createGeminiRequestRunner({ wait: async () => { controller.abort(); throw new Error("cancelled"); } });
  await assert.rejects(run({ models, signal: controller.signal, cooldownKey: "cancel", operation: async () => { calls++; throw { status: 503 }; } }), (e) => e.providerRequests === 1 && e.providerDiagnostic.cancelled === true);
  assert.equal(calls, 1);
});
test("bad requests and unknown network failures are never repeatedly retried", async () => {
  const { run, delays } = harness();
  for (const error of [{ status: 400 }, { status: 401 }, { cause: { code: "ENOTFOUND" } }]) await assert.rejects(run({ models, cooldownKey: String(error.status), operation: async () => { throw error; } }), (e) => e.providerRequests === 1);
  assert.deepEqual(delays, []);
});
