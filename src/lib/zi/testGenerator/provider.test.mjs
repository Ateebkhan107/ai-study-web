import test from "node:test";
import assert from "node:assert/strict";
import { completeZiPatternAnalysis, completeZiQuestionTask } from "../provider.js";

// Intercept HTTP so the real SDK and existing-provider adapter are exercised
// without secrets, network requests, or billable calls.
const request = { systemPrompt: "Analyze references only.", prompt: "Reference data", responseJsonSchema: { type: "object", properties: { ok: { type: "boolean" } } } };
const success = (finishReason = "STOP", text = '{"ok":true}') => Response.json({ candidates: [{ finishReason, content: { parts: [{ text }] } }] });
function setup(t, handler) {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.ZI_AI_MODEL;
  process.env.GEMINI_API_KEY = "unit-test-only";
  process.env.ZI_AI_MODEL = "unit-primary-model";
  t.after(() => {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.ZI_AI_MODEL;
    else process.env.ZI_AI_MODEL = previousModel;
  });
  return t.mock.method(globalThis, "fetch", handler);
}

test("Gemini adapter uses structured JSON, bounded output, timeout and explicit retry limit", async (t) => {
  setup(t, async (url, options) => {
    assert.match(String(url), /unit-primary-model/);
    const body = JSON.parse(options.body);
    assert.equal(body.generationConfig.responseMimeType, "application/json");
    assert.deepEqual(body.generationConfig.responseJsonSchema, request.responseJsonSchema);
    assert.equal(body.generationConfig.maxOutputTokens, 8000);
    assert.ok(options.signal instanceof AbortSignal);
    return success();
  });
  assert.deepEqual(await completeZiPatternAnalysis(request), { data: { ok: true }, model: "unit-primary-model" });
});
test("Gemini availability errors use only the existing fallback model", async (t) => {
  const calls = [];
  setup(t, async (url) => {
    const model = String(url).match(/models\/([^:]+):generateContent/)[1];
    calls.push(model);
    if (calls.length === 1) return Response.json({ error: { code: 503, message: "temporary provider failure", status: "UNAVAILABLE" } }, { status: 503 });
    return success();
  });
  const result = await completeZiPatternAnalysis(request);
  assert.deepEqual(calls, ["unit-primary-model", "gemini-flash-lite-latest"]);
  assert.equal(result.model, "gemini-flash-lite-latest");
});
test("Gemini invalid requests fail without fallback, exposing only safe status metadata", async (t) => {
  const mock = setup(t, async () => Response.json({ error: { code: 400, message: "private request content", status: "INVALID_ARGUMENT" } }, { status: 400 }));
  await assert.rejects(completeZiPatternAnalysis(request), (error) => error.code === "ZI_ANALYSIS_PROVIDER_ERROR" && error.providerStatus === 400 && !error.message.includes("private"));
  assert.equal(mock.mock.callCount(), 1);
});
test("Gemini invalid JSON and truncated responses never become completed analyses", async (t) => {
  setup(t, async () => success("STOP", "not JSON"));
  await assert.rejects(completeZiPatternAnalysis(request), (error) => error.code === "ZI_ANALYSIS_INVALID_JSON");
});
test("Gemini truncated output is rejected rather than parsed as a successful partial result", async (t) => {
  setup(t, async () => success("MAX_TOKENS"));
  await assert.rejects(completeZiPatternAnalysis(request), (error) => error.code === "ZI_ANALYSIS_INCOMPLETE");
});
test("cancelled requests do not start an AI call", async (t) => {
  const mock = setup(t, async () => { throw new Error("should never be reached"); });
  await assert.rejects(completeZiPatternAnalysis({ ...request, signal: AbortSignal.abort() }), (error) => error.code === "ZI_ANALYSIS_ABORTED");
  assert.equal(mock.mock.callCount(), 0);
});
test("missing Gemini credentials fail clearly without any SDK call", async (t) => {
  const mock = setup(t, async () => { throw new Error("should never be reached"); });
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(completeZiPatternAnalysis(request), (error) => error.code === "ZI_PROVIDER_NOT_CONFIGURED");
  assert.equal(mock.mock.callCount(), 0);
});

test("job single-attempt mode never retries or falls back after an uncertain availability failure", async (t) => {
  const mock = setup(t, async () => Response.json({ error: { code: 503, status: "UNAVAILABLE" } }, { status: 503 }));
  await assert.rejects(completeZiQuestionTask({ ...request, maxAttempts: 1 }), (e) => e.providerRequests === 1);
  assert.equal(mock.mock.callCount(), 1);
});

test("structured transport preserves actual Retry-After headers when retry must be deferred", async (t) => {
  const mock = setup(t, async () => Response.json({ error: { code: 429, status: "RESOURCE_EXHAUSTED" } }, { status: 429, headers: { "retry-after": "60" } }));
  await assert.rejects(completeZiQuestionTask(request), (e) => e.providerRequests === 1 && e.providerDiagnostic.retryAfterMs === 60000 && e.providerDiagnostic.retryDeferred === true);
  assert.equal(mock.mock.callCount(), 1);
});
test("structured quota diagnostics survive without exposing raw service messages", async (t) => {
  const mock = setup(t, async () => Response.json({ error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "PRIVATE_KEY_NEVER_RETURN", details: [{ "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier", quotaValue: "20", quotaDimensions: { model: "reported-model", project: "PRIVATE_PROJECT" } }] }] } }, { status: 429 }));
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-quota-test-distinct-key";
  try {
    await assert.rejects(completeZiQuestionTask(request), (e) => e.providerDiagnostic.category === "daily_request_quota" && !JSON.stringify(e).includes("PRIVATE"));
    await assert.rejects(completeZiQuestionTask(request), (e) => e.providerRequests === 0 && e.providerDiagnostic.cooldownHit === true);
    assert.equal(mock.mock.callCount(), 1);
  } finally { process.env.GEMINI_API_KEY = previousKey; }
});
