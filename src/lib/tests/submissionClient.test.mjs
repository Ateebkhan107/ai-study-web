import test from "node:test";
import assert from "node:assert/strict";
import { submitTestSessionRequest } from "./submissionClient.js";

const id = "00000000-0000-4000-8000-000000000001";
test("submission transport preserves normal null answers and generated revision payloads", async () => {
  for (const body of [{ sessionId: id, answers: { q: null }, timeTakenSeconds: 1 }, { sourceType: "AI_GENERATED", sessionId: id, revision: 2, answers: { q: 0 } }]) {
    let calls = 0;
    const result = await submitTestSessionRequest(body, async (url, options) => {
      calls++; assert.equal(url, "/api/test-session"); assert.equal(options.method, "PUT"); assert.deepEqual(JSON.parse(options.body), body);
      return Response.json({ attemptId: id });
    });
    assert.equal(result.attemptId, id); assert.equal(calls, 1);
  }
});
test("terminal conflict status reaches the UI and does not trigger transport retries", async () => {
  let calls = 0;
  await assert.rejects(submitTestSessionRequest({ sessionId: id }, async () => { calls++; return Response.json({ error: "Incomplete saved submission" }, { status: 409 }); }),
    (e) => e.status === 409 && e.message === "Incomplete saved submission");
  assert.equal(calls, 1);
});
test("network loss and rate errors never automatically repeat a submission", async () => {
  for (const response of [null, new Response("unavailable", { status: 429 })]) {
    let calls = 0;
    await assert.rejects(submitTestSessionRequest({}, async () => { calls++; if (!response) throw new Error("connection lost"); return response; }));
    assert.equal(calls, 1);
  }
});
test("a malformed success never becomes a results navigation acknowledgement", async () => {
  for (const payload of [{}, { attemptId: null }, { attemptId: "not-a-real-saved-id" }]) {
    await assert.rejects(submitTestSessionRequest({}, async () => Response.json(payload)), /acknowledgement/);
  }
});
