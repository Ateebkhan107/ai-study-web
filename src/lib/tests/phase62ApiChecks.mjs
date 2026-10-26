import assert from "node:assert/strict";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { createHmac } from "node:crypto";
import { pathToFileURL } from "node:url";
const dir = process.argv[2], testId = process.argv[3];
if (!/^\/private\/tmp\/prepzii-phase62-[A-Za-z0-9]+$/.test(dir) || !/^[a-f0-9-]{36}$/.test(testId)) throw Error("Expected isolated fixture directory and synthetic test UUID");
assert.equal(statSync(dir).uid, process.getuid());
const manifest = JSON.parse(readFileSync(`${dir}/fixture.json`, "utf8"));
assert.equal(manifest.origin, "http://127.0.0.1:3462");
const health = await (await fetch(`${manifest.origin}/fixture-local/health`)).json();
assert.equal(health.fixture, "phase62-synthetic"); assert.equal(health.database, manifest.database); assert.equal(health.version, 170006);
const { sql, literal, database } = await import(pathToFileURL(`${dir}/src/lib/tests/phase61Lab.mjs`).href);
assert.equal(database, manifest.database);
const results = [];
const cookie = (actor) => actor ? `zi_synthetic_session=${actor}.${createHmac("sha256", manifest.secret).update(actor).digest("hex")}` : "";
async function api(path, actor, body, method = body === undefined ? "GET" : "POST") {
  const response = await fetch(`${manifest.origin}${path}`, { method,
    headers: { Cookie: cookie(actor), ...(body === undefined ? {} : { "Content-Type": "application/json", Origin: manifest.origin }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), redirect: "manual" });
  return { status: response.status, data: await response.json() };
}
async function check(name, fn) {
  try { await fn(); results.push({ name, result: "PASS" }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, result: "FAIL", error: error.message }); throw error; }
}
try {
  const raw = await sql(`SELECT to_jsonb(s) FROM public.zi_generated_sessions s WHERE test_id=${literal(testId)};`);
  assert.ok(raw, "No session for this generatedTestId. Supply the test UUID from Start test, not the result/attempt UUID.");
  const session = JSON.parse(raw);
  const actor = session.owner_id, other = actor === "journey-student-a" ? "journey-student-b" : "journey-student-a";
  const suffix = `/${session.session_id}?sourceType=AI_GENERATED`;
  const request = { sourceType: "AI_GENERATED", sessionId: session.session_id, revision: session.revision, answers: session.answers };
  await check("actual API round-trip and ten stored private questions", async () => {
    assert.equal(await sql(`SELECT count(*) FROM public.zi_generated_questions WHERE test_id=${literal(testId)};`), "10");
    const job = await api("/api/zi/generation-jobs", actor);
    assert.equal(job.status, 200); assert.equal(job.data.job.state, "ready"); assert.equal(job.data.job.acceptedCount, 10);
    assert.doesNotMatch(JSON.stringify(job.data), /correctAnswer|execution_token|draft_key|configuration/);
    assert.equal(await sql(`SELECT jsonb_array_length(requests) FROM zi_generation.jobs WHERE test_id=${literal(testId)};`), "7");
  });
  await check("wrong-owner start, save, submit, result and review are rejected", async () => {
    assert.equal((await api("/api/test-session", other, { sourceType: "AI_GENERATED", generatedTestId: testId })).status, 404);
    assert.equal((await api("/api/test-session", other, request, "PATCH")).status, 404);
    assert.equal((await api("/api/test-session", other, request, "PUT")).status, 404);
    assert.equal((await api(`/api/test-attempts${suffix}`, other)).status, 404);
    assert.equal((await api(`/api/test-attempts/${session.session_id}/review?sourceType=AI_GENERATED`, other)).status, 404);
  });
  await check("signed-out and forged-session callers are rejected", async () => {
    assert.equal((await api(`/api/test-attempts${suffix}`, null)).status, 401);
    assert.equal((await api("/api/zi/generation-jobs", null)).status, 401);
    const response = await fetch(`${manifest.origin}/api/zi/generation-jobs`, { headers: { Cookie: "zi_synthetic_session=journey-student-a.invalid" } });
    assert.equal(response.status, 401);
  });
  if (!session.submitted_at) {
    await check("pre-submission answers and explanations remain private", async () => {
      const start = await api("/api/test-session", actor, { sourceType: "AI_GENERATED", generatedTestId: testId });
      assert.equal(start.status, 200); assert.equal(start.data.questions.length, 10);
      assert.doesNotMatch(JSON.stringify(start.data.questions), /correct_option|correctAnswer|explanation|blindSolution|validation/);
      assert.equal((await api(`/api/test-attempts${suffix}`, actor)).status, 409);
      assert.equal((await api(`/api/test-attempts/${session.session_id}/review?sourceType=AI_GENERATED`, actor)).status, 409);
    });
  } else {
    await check("concurrent duplicate submissions preserve the committed result", async () => {
      const before = await sql(`SELECT to_jsonb(s) FROM public.zi_generated_sessions s WHERE session_id=${literal(session.session_id)};`);
      const replies = await Promise.all([api("/api/test-session", actor, request, "PUT"), api("/api/test-session", actor, { ...request, revision: 0, answers: {} }, "PUT")]);
      for (const reply of replies) { assert.equal(reply.status, 200); assert.equal(reply.data.attemptId, session.session_id); }
      assert.equal(await sql(`SELECT to_jsonb(s) FROM public.zi_generated_sessions s WHERE session_id=${literal(session.session_id)};`), before);
      assert.equal((await api(`/api/test-attempts${suffix}`, actor)).status, 200);
    });
    await check("post-submit review exposes only the owned ten answers", async () => {
      const response = await api(`/api/test-attempts/${session.session_id}/review?sourceType=AI_GENERATED`, actor);
      assert.equal(response.status, 200); assert.equal(response.data.answers.length, 10);
      assert.equal(response.data.answers[0].correct_option, "A");
    });
  }
  await check("generated submissions produce no legacy attempt or XP reward", async () => {
    assert.equal(await sql(`SELECT count(*) FROM public.test_attempts WHERE session_id=${literal(session.session_id)};`), "0");
    assert.equal(await sql(`SELECT count(*) FROM public.user_xp WHERE user_id=${literal(actor)};`), "0");
    assert.equal(await sql(`SELECT count(*) FROM prepzii_integrity.receipts WHERE user_id=${literal(actor)};`), "0");
    assert.equal(await sql("SELECT has_table_privilege('service_role','public.user_xp','UPDATE');"), "f");
    assert.equal(await sql("SELECT count(*) FROM public.user_xp x FULL JOIN prepzii_integrity.opening_profiles b USING(user_id) WHERE to_jsonb(x) IS DISTINCT FROM b.profile;"), "0");
  });
} finally {
  const path = `${dir}/evidence/api-${testId}-${Date.now()}.json`;
  writeFileSync(path, JSON.stringify({ fixture: true, testId, results, paid_calls: 0, production_connections: 0 }, null, 2), { flag: "wx", mode: 0o600 });
  console.log(`Evidence: ${path}`);
}
