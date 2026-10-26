import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { generationFixture, configuration, fixtureId } from "./fixtures/generated.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
let userId = "owner", bankQuestion, inserted, rewardCallbacks, calls, submitted, bankCommitted;
let bankAttempts = [], savedBankAnswers = [], failAnswerWrite = false, failAttemptLookup = false, bankRpcConflict = false;
const generatedSession = { session_id: fixtureId(50), test_id: fixtureId(40), owner_id: "owner", answers: {}, revision: 0, server_now: new Date().toISOString(), started_at: new Date().toISOString(), deadline_at: new Date(Date.now() + 1800000).toISOString() };
const query = (table) => {
  let op = "read", rows;
  const filters = {};
  const finish = () => {
    calls.push({ table, op, rows, filters });
    if (table === "user_profiles") return { data: { exam: "JEE" } };
    if (table === "test_sessions") return { data: op === "read" && filters.user_id !== "owner" ? null : { id: filters.id || fixtureId(50), duration_minutes: 30, started_at: new Date(Date.now() - 60000).toISOString() } };
    if (table === "test_questions") return { data: [{ question_id: bankQuestion.id, questions: { ...bankQuestion, correct_option: bankQuestion.correct_option || "A" } }] };
    if (table === "test_attempts" && op === "read") return failAttemptLookup ? { error: new Error("Fixture lookup unavailable") } : { data: bankAttempts.filter((a) => a.session_id === filters.session_id && a.user_id === filters.user_id).slice(0, 2) };
    if (table === "test_attempts" && op === "insert") { inserted = rows; const attempt = { id: fixtureId(60), ...rows }; bankAttempts.push(attempt); return { data: attempt }; }
    if (table === "user_answers" && op === "insert") { if (failAnswerWrite) return { error: new Error("Fixture answer write failed") }; savedBankAnswers.push(...rows); return { data: null }; }
    if (table === "user_answers" && op === "read") return { data: savedBankAnswers.filter((a) => a.attempt_id === filters.attempt_id) };
    if (table === "institute_test_attempts" && op === "read") return { data: [] };
    if (table === "zi_generated_tests") return { data: filters.owner_id === "owner" ? { id: fixtureId(40), config: configuration.generationConfig, validation_version: "zi-questions-v1.1", mode: "timed", duration_minutes: 30, question_count: 5 } : null };
    if (table === "zi_generated_sessions") return { data: filters.owner_id === "owner" ? { ...generatedSession, submitted_at: submitted ? new Date().toISOString() : null, result: submitted ? { id: fixtureId(50), sourceType: "AI_GENERATED", score: 4 } : null } : null };
    if (table === "zi_generated_questions") return { data: generationFixture().questions.map((q, i) => ({ id: q.id, question_order: i + 1, content: q })) };
    return { data: null, error: null };
  };
  return { select() { return this; }, eq(k, v) { filters[k] = v; return this; }, order() { return this; }, limit() { return this; },
    insert(value) { op = "insert"; rows = value; return this; }, update(value) { op = "update"; rows = value; return this; },
    single: async () => finish(), maybeSingle: async () => finish(), then(resolve, reject) { return Promise.resolve(finish()).then(resolve, reject); } };
};
globalThis.__phase5RouteFixture = {
  auth: () => ({ userId, sessionClaims: {} }),
  client: { from: query, rpc: async (name, args) => {
    calls.push({ rpc: name, args });
    if (name === "prepzii_commit_test") {
      if (bankRpcConflict) return { error: { code: "PZ409", message: "Private SQL detail" } };
      return { data: { attemptId: fixtureId(60), created: !bankCommitted } };
    }
    if (args.p_owner !== "owner") return { error: { code: "P0002" } };
    if (name === "zi_start_generated_test") return { data: { ...generatedSession, submitted_at: submitted ? new Date().toISOString() : null } };
    if (name === "zi_submit_generated_test") { submitted = true; return { data: { attemptId: fixtureId(50) } }; }
    if (name === "zi_save_generated_answers") return { data: { revision: 1 } };
    if (name === "zi_commit_bank_submission") {
      if (bankRpcConflict) return { error: { code: "PZ409", message: "Private SQL detail" } };
      const created = !bankCommitted; bankCommitted = true;
      if (created) { bankAttempts.push({ id: fixtureId(60), user_id: args.p_owner, session_id: args.p_session, ...args.p_result }); savedBankAnswers.push(...args.p_answers.map((a) => ({ ...a, attempt_id: fixtureId(60) }))); }
      return { data: { attemptId: fixtureId(60), created } };
    }
    throw new Error("Unexpected RPC");
  } },
  after: () => { rewardCallbacks++; },
  questions: () => [bankQuestion],
};
const data = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
const hooks = registerHooks({ resolve(specifier, context, next) {
  const mocks = {
    "@clerk/nextjs/server": 'export const auth=async()=>globalThis.__phase5RouteFixture.auth();',
    "next/server": 'export const NextResponse=Response; export const after=(fn)=>globalThis.__phase5RouteFixture.after(fn);',
    "@/lib/supabaseAdmin": 'export const supabaseAdmin=globalThis.__phase5RouteFixture.client;',
    "@/lib/questions": 'export const getQuestions=async()=>globalThis.__phase5RouteFixture.questions();',
    "@/utils/levelEngine": 'export const getLevelFromXP=()=>({});',
    "@/lib/instituteAuth": 'export const getInstituteContext=()=>{throw new Error("Unexpected institute lookup")};',
    "@/lib/accessControl": 'export const FEATURES={};export const canUseFeature=()=>({allowed:true});export const getUserAccessContext=async()=>({});',
    "@/lib/auth": 'export const getFirstNameFromClaims=()=>"Fixture";',
    "@/lib/zi/rateLimit": 'export const checkZiRateLimit=()=>({allowed:true});',
  };
  if (mocks[specifier]) return { url: data(mocks[specifier]), shortCircuit: true };
  if (specifier.startsWith("@/")) { const filename = path.join(root, specifier.slice(2)); if (existsSync(filename)) return next(pathToFileURL(filename).href, context); if (existsSync(`${filename}.js`)) return next(pathToFileURL(`${filename}.js`).href, context); }
  return next(specifier, context);
} });
const { POST, PUT, PATCH } = await import("../../app/api/test-session/route.js");
const { GET: result } = await import("../../app/api/test-attempts/[id]/route.js");
const { GET: review } = await import("../../app/api/test-attempts/[id]/review/route.js");
const request = (method, body) => new Request("https://prepzii.invalid/api/test-session", { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
const reviewRequest = () => new Request("https://prepzii.invalid/api/test-attempts/fixture?sourceType=AI_GENERATED");
test.beforeEach(() => {
  userId = "owner"; rewardCallbacks = 0; inserted = null; calls = []; submitted = false; bankCommitted = false;
  bankAttempts = []; savedBankAnswers = []; failAnswerWrite = false; failAttemptLookup = false; bankRpcConflict = false;
  bankQuestion = { id: fixtureId(1), exam: "JEE Main", subject: "Physics", question_type: "MCQ", correct_option: "A", correct: 0, text: "Bank fixture", options: ["one", "two", "three", "four"], marks: 4, negative_marks: 1 };
  delete process.env.ZI_GENERATED_TEST_ENGINE_ENABLED;
  delete process.env.ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED;
  delete process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED;
});
test("integrity cutover sends only verified identity and answer choices and never falls back", async () => {
  process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED = "true";
  const body = { sessionId: fixtureId(50), answers: { [fixtureId(1)]: 0 }, score: 999999, correct: 999999 };
  assert.equal((await PUT(request("PUT", body))).status, 200);
  const rpc = calls.find(c => c.rpc === "prepzii_commit_test");
  assert.deepEqual(rpc.args, { p_user: "owner", p_session: fixtureId(50), p_answers: [{question_id:fixtureId(1),selected_option:"A"}] });
  assert.equal(rewardCallbacks, 0);
  assert.equal(calls.some(c => c.op === "insert" || c.op === "update"), false);
  bankRpcConflict = true;
  const failure = await PUT(request("PUT", body));
  assert.equal(failure.status, 409);
  assert.equal(JSON.stringify(await failure.json()).includes("Private SQL"), false);
  assert.equal(calls.some(c => c.op === "insert" || c.op === "update"), false);
});
test("existing normal starts keep their original safe DTO and bank source", async () => {
  const response = await POST(request("POST", { count: 1 }));
  assert.equal(response.status, 200); const payload = await response.json();
  assert.equal(payload.questions[0].text, "Bank fixture"); assert.equal(payload.questions[0].correct, undefined);
  assert.equal(calls.some((c) => c.rpc || c.table?.startsWith("zi_generated")), false);
});
test("generated endpoints fail closed before migration/engine activation", async () => {
  const response = await POST(request("POST", { sourceType: "AI_GENERATED", generatedTestId: fixtureId(40) }));
  assert.equal(response.status, 503); assert.equal(calls.length, 0);
});
test("all session and generated result endpoints require authentication", async () => {
  userId = null;
  for (const handler of [POST, PUT, PATCH]) assert.equal((await handler(request("POST", {}))).status, 401);
  assert.equal((await result(reviewRequest(), { params: Promise.resolve({ id: fixtureId(50) }) })).status, 401);
});
test("generated load reuses session DTO without answer keys, explanations or hints", async () => {
  process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true";
  const response = await POST(request("POST", { sourceType: "AI_GENERATED", generatedTestId: fixtureId(40) }));
  assert.equal(response.status, 200); const payload = await response.json();
  assert.equal(payload.sessionId, fixtureId(50)); assert.equal(payload.questions.length, 5);
  for (const q of payload.questions) for (const key of ["correctAnswer", "explanation", "validation", "concepts", "formulas"]) assert.equal(q[key], undefined);
  assert.equal(calls.some((c) => ["questions", "test_questions", "user_answers"].includes(c.table)), false);
});
test("generated ownership is checked server-side on load and review", async () => {
  process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true"; userId = "other";
  assert.equal((await POST(request("POST", { sourceType: "AI_GENERATED", generatedTestId: fixtureId(40) }))).status, 404);
  assert.equal((await review(reviewRequest(), { params: Promise.resolve({ id: fixtureId(50) }) })).status, 404);
});
test("generated result/review refuse access until submission", async () => {
  process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true";
  for (const handler of [result, review]) assert.equal((await handler(reviewRequest(), { params: Promise.resolve({ id: fixtureId(50) }) })).status, 409);
});
test("generated submission creates no normal reward callbacks and review works afterward", async () => {
  process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true";
  const response = await PUT(request("PUT", { sourceType: "AI_GENERATED", sessionId: fixtureId(50), revision: 0, answers: {} }));
  assert.equal(response.status, 200); assert.equal(rewardCallbacks, 0);
  const payload = await (await review(reviewRequest(), { params: Promise.resolve({ id: fixtureId(50) }) })).json();
  assert.equal(payload.answers[0].selected_option, null); assert.ok(payload.answers[0].questions.explanation);
  assert.equal(payload.answers[0].questions.validation, undefined);
  const resumed = await (await POST(request("POST", { sourceType: "AI_GENERATED", generatedTestId: fixtureId(40) }))).json();
  assert.equal(resumed.submitted, true); assert.equal(resumed.questions, undefined);
});
test("client scores, clocks and answer keys are rejected on generated submit", async () => {
  process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true";
  for (const extra of [{ score: 999 }, { timeTakenSeconds: 1 }, { correctAnswer: 0 }]) assert.equal((await PUT(request("PUT", { sourceType: "AI_GENERATED", sessionId: fixtureId(50), revision: 0, answers: {}, ...extra }))).status, 400);
});
for (const value of [null, "", false, undefined]) test(`normal unanswered ${String(value)} cannot score as option A`, async () => {
  const response = await PUT(request("PUT", { sessionId: fixtureId(50), answers: { [fixtureId(1)]: value }, timeTakenSeconds: 1799 }));
  assert.equal(response.status, 200); assert.equal(inserted.score, 0); assert.equal(inserted.attempted, 0);
  assert.ok(inserted.time_taken_seconds < 120);
});
test("normal correct, incorrect, numerical zero and multiple-correct marking regressions", async () => {
  for (const [type, correctOption, answer, score] of [["MCQ", "A", 0, 4], ["MCQ", "A", 1, -1], ["Numerical", "0", 0, 4], ["Numerical", "0", null, 0], ["Multiple Correct", "A,B", [0, 1], 4]]) {
    bankAttempts = []; savedBankAnswers = []; // independent sessions for marking cases
    bankQuestion.question_type = type; bankQuestion.correct_option = correctOption;
    assert.equal((await PUT(request("PUT", { sessionId: fixtureId(50), answers: { [fixtureId(1)]: answer } }))).status, 200);
    assert.equal(inserted.score, score);
  }
});
test("migrated normal submission schedules reward eligibility only on first commit", async () => {
  process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true";
  const req = () => request("PUT", { sessionId: fixtureId(50), answers: { [fixtureId(1)]: 0 } });
  assert.equal((await PUT(req())).status, 200); assert.equal((await PUT(req())).status, 200);
  assert.equal(rewardCallbacks, 1);
});
test("normal atomic rollout can be configured without enabling the generated engine", async () => {
  process.env.ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED = "true";
  const body = { sessionId: fixtureId(50), answers: {} };
  assert.equal((await PUT(request("PUT", body))).status, 200);
  assert.equal((await PUT(request("PUT", body))).status, 200);
  assert.equal(calls.filter((c) => c.rpc === "zi_commit_bank_submission").length, 1);
  assert.equal(rewardCallbacks, 1);
  const generated = await POST(request("POST", { sourceType: "AI_GENERATED", generatedTestId: fixtureId(40) }));
  assert.equal(generated.status, 503);
});
test("database conflict is a terminal safe response without reward scheduling", async () => {
  process.env.ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED = "true"; bankRpcConflict = true;
  const response = await PUT(request("PUT", { sessionId: fixtureId(50), answers: {} }));
  assert.equal(response.status, 409); const payload = await response.json();
  assert.match(payload.error, /unresolved saved submission/); assert.ok(!payload.error.includes("Private SQL"));
  assert.equal(rewardCallbacks, 0); assert.equal(bankAttempts.length, 0);
});
test("legacy repeated submissions and lost-response retries reuse the completed result without rewards", async () => {
  const submit = () => PUT(request("PUT", { sessionId: fixtureId(50), answers: { [fixtureId(1)]: 0 } }));
  const first = await (await submit()).json();
  const retry = await submit();
  assert.equal(retry.status, 200); assert.deepEqual(await retry.json(), first);
  assert.equal(bankAttempts.length, 1); assert.equal(savedBankAnswers.length, 1); assert.equal(rewardCallbacks, 1);
  assert.equal(calls.some((c) => c.rpc || c.table?.startsWith("zi_generated")), false);
});
test("same-worker concurrent legacy requests create one attempt and one reward callback", async () => {
  const responses = await Promise.all(Array.from({ length: 8 }, () => PUT(request("PUT", { sessionId: fixtureId(50), answers: { [fixtureId(1)]: null } }))));
  assert.ok(responses.every((r) => r.status === 200));
  const payloads = await Promise.all(responses.map((r) => r.json()));
  assert.equal(new Set(payloads.map((p) => p.attemptId)).size, 1);
  assert.equal(bankAttempts.length, 1); assert.equal(rewardCallbacks, 1);
  assert.equal(inserted.score, 0); assert.equal(savedBankAnswers[0].selected_option, null);
});
test("a partial legacy answer-write failure cannot turn a retry into a duplicate or fake result", async () => {
  failAnswerWrite = true;
  assert.equal((await PUT(request("PUT", { sessionId: fixtureId(50), answers: {} }))).status, 500);
  failAnswerWrite = false;
  const retry = await PUT(request("PUT", { sessionId: fixtureId(50), answers: {} }));
  assert.equal(retry.status, 409); assert.match((await retry.json()).error, /incomplete/);
  assert.equal(bankAttempts.length, 1); assert.equal(savedBankAnswers.length, 0); assert.equal(rewardCallbacks, 0);
});
test("historical duplicate attempts fail closed without selecting a canonical record", async () => {
  bankAttempts = [60, 61].map((id) => ({ id: fixtureId(id), user_id: "owner", session_id: fixtureId(50), total_questions: 1 }));
  for (const engine of [false, true]) {
    process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = String(engine);
    const response = await PUT(request("PUT", { sessionId: fixtureId(50), answers: {} }));
    assert.equal(response.status, 409); assert.match((await response.json()).error, /conflicting/);
  }
  assert.equal(bankAttempts.length, 2); assert.equal(rewardCallbacks, 0); assert.equal(calls.some((c) => c.rpc), false);
});
test("failed previous-attempt lookup creates no attempts or rewards", async () => {
  failAttemptLookup = true;
  assert.equal((await PUT(request("PUT", { sessionId: fixtureId(50), answers: {} }))).status, 500);
  assert.equal(bankAttempts.length, 0); assert.equal(rewardCallbacks, 0);
});
test("normal submission ownership is checked before previous attempts or writes", async () => {
  userId = "other";
  assert.equal((await PUT(request("PUT", { sessionId: fixtureId(50), answers: {} }))).status, 404);
  assert.equal(calls.some((c) => c.table === "test_attempts"), false);
});
test.after(() => { hooks.deregister(); delete process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED; delete process.env.ZI_GENERATED_TEST_ENGINE_ENABLED; delete process.env.ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED; delete globalThis.__phase5RouteFixture; });
