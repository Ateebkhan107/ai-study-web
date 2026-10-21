import test from "node:test";
import assert from "node:assert/strict";
import { handleBuilder, parseBuilderText, generationAvailability, BuilderPatch, BuilderRequest, confirmedGenerationConfiguration } from "./builder.server.js";
import { validateGenerationConfig } from "./questionSchema.server.js";
import { createGeminiRequestRunner } from "../geminiRetry.server.js";

const access = { userId: "student-1", examTrack: "JEE", proTracks: [] };
const options = { secret: "a-test-secret-that-is-never-used-in-production", now: 1000, env: {} };
const run = (args = {}, opts = options) => handleBuilder({ userId: access.userId, access, ...args }, opts);
const complete = { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", topic: "Rotational Motion", difficulty: "Medium", questionCount: 15, mode: "timed", durationMinutes: 30 };

test("natural request infers subject/topic and uses exam preference without Gemini", () => {
  const a = run({ text: "Zi, make me a test on Rotational Motion." });
  assert.equal(a.config.exam, "JEE Main"); assert.equal(a.config.subject, "Physics");
  assert.match(a.config.chapter, /Rotational Motion/); assert.equal(a.preferenceUsed, true);
  assert.deepEqual(a.missing, ["difficulty", "questionCount", "mode"]);
});
test("complete natural request captures every supplied detail", () => {
  const a = run({ text: "Generate 20 difficult JEE Main questions on Electrostatics in a timed test for 40 minutes" });
  assert.equal(a.config.questionCount, 20); assert.equal(a.config.difficulty, "Hard");
  assert.equal(a.config.durationMinutes, 40); assert.deepEqual(a.missing, []);
});
test("follow-up 15 medium questions retains prior subject and topic", () => {
  const first = run({ text: "Create a test on Rotational Motion" });
  const second = run({ token: first.token, text: "15 medium questions" });
  assert.equal(second.config.questionCount, 15); assert.equal(second.config.difficulty, "Medium");
  assert.equal(second.config.chapter, first.config.chapter); assert.deepEqual(second.missing, ["mode"]);
});
test("does not ask for question count again when only difficulty is missing", () => {
  const a = run({ text: "Create a test on Rotational Motion with 20 questions" });
  assert.match(a.prompt, /What difficulty/); assert.ok(!a.prompt.includes("how many"));
});
test("timed mode asks only for missing duration then bare minutes completes", () => {
  const a = run({ patch: { ...complete, mode: "practice" }, operation: "update" });
  const b = run({ token: a.token, text: "timed" });
  assert.deepEqual(b.missing, ["durationMinutes"]);
  const c = run({ token: b.token, text: "25" });
  assert.equal(c.config.durationMinutes, 25); assert.deepEqual(c.missing, []);
});
test("NEET preference and Human Physiology map to Biology", () => {
  const a = run({ access: { ...access, examTrack: "NEET" }, text: "Make a test on Human Physiology" });
  assert.equal(a.config.exam, "NEET"); assert.equal(a.config.subject, "Biology");
});
test("no exam preference asks for exam", () => {
  const a = run({ access: { ...access, examTrack: undefined }, text: "Make a test on Rotational Motion" });
  assert.equal(a.missing[0], "exam"); assert.match(a.prompt, /Which exam/);
});
test("explicit exam overrides default only when access allows it", () => {
  const a = run({ access: { ...access, proTracks: ["NEET"] }, text: "Create a NEET Biology test on Human Physiology" });
  assert.equal(a.config.exam, "NEET"); assert.equal(a.preferenceUsed, false);
});
test("cross-track access restriction preserves the prior configuration", () => {
  const a = run({ patch: complete });
  const b = run({ token: a.token, text: "change to NEET" });
  assert.equal(b.config.exam, "JEE Main"); assert.match(b.errors.join(), /exam access/);
});
test("JEE Advanced is rejected without silently mapping to Main", () => {
  const a = run({ text: "Create a JEE Advanced test on Rotational Motion" });
  assert.equal(a.config.exam, undefined); assert.match(a.errors.join(), /not supported/);
});
for (const count of [-5, 0, 4, 5.5, 31, 500]) test(`rejects invalid count ${count}`, () => {
  const a = run({ text: `Create a test with ${count} questions on Rotational Motion` });
  assert.match(a.errors.join(), /5 to 30/); assert.equal(a.config.questionCount, undefined);
});
test("invalid difficulty does not replace an existing valid difficulty", () => {
  const a = run({ patch: complete }); const b = run({ token: a.token, text: "change difficulty to extreme" });
  assert.equal(b.config.difficulty, "Medium"); assert.match(b.errors.join(), /Easy, Medium, Hard, or Mixed/);
});
test("schema rejects unsupported fields and invalid numerical values", () => {
  for (const patch of [{ difficulty: "Expert" }, { questionCount: 5.5 }, { questionCount: 31 }, { answer: "A" }, { durationMinutes: 181 }, { exam: "JEE Advanced" }]) assert.equal(BuilderPatch.safeParse(patch).success, false);
  assert.equal(BuilderRequest.safeParse({ operation: "generate" }).success, false);
});
test("subject change clears unrelated chapter and topic", () => {
  const a = run({ patch: complete }); const b = run({ token: a.token, text: "change to Chemistry" });
  assert.equal(b.config.subject, "Chemistry"); assert.equal(b.config.chapter, undefined); assert.equal(b.missing[0], "topic");
});
test("practice mode removes timed duration", () => {
  const a = run({ patch: complete }); const b = run({ token: a.token, text: "practice quiz" });
  assert.equal(b.config.durationMinutes, undefined); assert.equal(b.config.mode, "practice");
});
test("harder and count changes invalidate confirmation", () => {
  const a = run({ patch: complete }); const b = run({ token: a.token, operation: "confirm" });
  assert.equal(b.confirmed, true);
  const c = run({ token: b.token, text: "make it harder with 20 questions" });
  assert.equal(c.confirmed, false); assert.equal(c.config.difficulty, "Hard"); assert.equal(c.config.questionCount, 20);
});
test("confirmation requires complete configuration and a reviewed token", () => {
  const a = run({ text: "Create a test" }); const b = run({ token: a.token, operation: "confirm" });
  assert.equal(b.confirmed, false); assert.match(b.errors.join(), /missing details/);
  const c = run({ operation: "confirm", patch: complete }); assert.equal(c.confirmed, false);
});
test("cannot change values during confirmation without reviewing new summary", () => {
  const a = run({ patch: complete }); const b = run({ token: a.token, operation: "confirm", patch: { questionCount: 20 } });
  assert.equal(b.confirmed, false); assert.equal(b.config.questionCount, 15); assert.match(b.errors.join(), /review the summary/);
});
test("confirmation yields an integration config only, no ready test or route", () => {
  const a = run({ patch: complete }); const b = run({ token: a.token, text: "confirm" });
  assert.equal(b.confirmed, true); assert.equal(b.availability.generationEnabled, false);
  assert.match(b.prompt, /No test has been generated/); assert.equal(b.trustedRoute, undefined);
  const c = confirmedGenerationConfiguration({ userId: access.userId, access, token: b.token }, options);
  assert.equal(c.generationConfig.questionCount, 15); assert.equal(c.generationConfig.exam, "JEE Main");
  assert.equal(validateGenerationConfig(c.generationConfig).topic, null);
  assert.deepEqual(c.sessionConfig, { mode: "timed", durationMinutes: 30 });
});
test("draft ownership is enforced independently of client-supplied access fields", () => {
  const a = run({ patch: complete });
  assert.throws(() => run({ token: a.token, userId: "other", access: { ...access, userId: "other" } }), /another student/);
  assert.throws(() => run({ userId: "other" }), /Unauthorized/);
});
test("expired, modified and malformed tokens fail closed", () => {
  const a = run({ patch: complete });
  assert.throws(() => run({ token: a.token }, { ...options, now: 3601001 }), /expired/);
  assert.throws(() => run({ token: `X${a.token.slice(1)}` }), /invalid/);
  assert.throws(() => run({ token: "bad-token" }), /invalid/);
});
test("opaque tokens do not disclose identity or config", () => {
  const a = run({ patch: complete }); const decoded = Buffer.from(a.token, "base64url").toString();
  assert.ok(!decoded.includes(access.userId)); assert.ok(!decoded.includes("Rotational Motion"));
  for (const field of ["owner", "answer", "correctAnswer", "validation", "apiKey"]) assert.equal(a[field], undefined);
});
test("quota status disables generation regardless of feature flag", () => {
  for (const flag of ["false", "true"]) {
    const a = generationAvailability({ ZI_AI_TEST_GENERATION_ENABLED: flag, ZI_AI_TEST_PROVIDER_STATUS: "quota_blocked" });
    assert.equal(a.state, "quota_blocked"); assert.equal(a.generationEnabled, false); assert.match(a.message, /quota/);
  }
});
test("generation stays disabled even when future feature flag is set", () => {
  assert.equal(generationAvailability({}).state, "disabled");
  const a = generationAvailability({ ZI_AI_TEST_GENERATION_ENABLED: "true" });
  assert.equal(a.state, "verification_pending"); assert.equal(a.generationEnabled, false);
});
test("normal tutoring and explicit PYQ tests keep their existing flow", () => {
  const a = run({ patch: complete });
  assert.equal(run({ token: a.token, text: "Explain Rotational Motion" }), null);
  assert.equal(run({ text: "Create a test using official PYQs on Rotational Motion" }), null);
  assert.equal(parseBuilderText("Hello Zi").handled, false);
});
test("no fabricated weaknesses", () => {
  const a = run({ text: "Create a test on my weak topics" });
  assert.match(a.errors.join(), /will not infer weaknesses/); assert.equal(a.config.topic, undefined);
});
test("reset clears old settings and reuses preference", () => {
  const a = run({ patch: complete }); const b = run({ token: a.token, operation: "reset" });
  assert.deepEqual(b.config, { exam: "JEE Main" }); assert.equal(b.confirmed, false);
});
test("supplying a missing subject preserves an already supplied custom topic", () => {
  const a = run({ text: "Create a test on angular momentum" });
  const b = run({ token: a.token, text: "Physics" });
  assert.equal(b.config.topic, a.config.topic); assert.equal(b.config.subject, "Physics");
});
test("supported number words work in requests and follow-ups", () => {
  const a = run({ text: "Create a test on Rotational Motion with five medium questions" });
  assert.equal(a.config.questionCount, 5);
  const b = run({ token: a.token, text: "twenty" }); assert.equal(b.config.questionCount, 20);
  const c = run({ token: b.token, text: "thirty-five questions" }); assert.match(c.errors.join(), /5 to 30/);
});
test("can correct an unsupported request without losing the conversation", () => {
  const a = run({ text: "Create a JEE Advanced test" });
  const b = run({ token: a.token, text: "JEE Main" }); assert.equal(b.config.exam, "JEE Main");
});
test("observed provider cooldown is visible without an AI request", () => {
  assert.equal(generationAvailability({}, { blocked: true }).state, "quota_blocked");
});
test("quota status reads an observed cooldown without probing and expires honestly", async () => {
  let now = 1000;
  const runner = createGeminiRequestRunner({ now: () => now });
  const error = { status: 429, body: { error: { details: [{ "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] }] } } };
  await assert.rejects(runner({ models: ["test-model"], cooldownKey: "opaque", operation: async () => { throw error; } }));
  assert.equal(generationAvailability({}, runner.getQuotaCooldown()).state, "quota_blocked");
  assert.deepEqual(Object.keys(runner.getQuotaCooldown()).sort(), ["blocked", "retryAfterMs"]);
  now += 60001;
  assert.deepEqual(runner.getQuotaCooldown(), { blocked: false });
});
test("valid supplied details survive an invalid count so the student need not repeat them", () => {
  const a = run({ text: "Create a test on Rotational Motion with 40 medium questions" });
  assert.equal(a.config.subject, "Physics"); assert.equal(a.config.difficulty, "Medium");
  assert.equal(a.config.questionCount, undefined); assert.match(a.errors.join(), /5 to 30/);
});
test("unknown exact topics use Phase 2 topic filtering rather than invented chapter names", () => {
  const a = run({ patch: { ...complete, chapter: "Moment of inertia", topic: "Moment of inertia" } });
  const b = run({ token: a.token, operation: "confirm" });
  const c = confirmedGenerationConfiguration({ userId: access.userId, access, token: b.token }, options);
  assert.equal(c.generationConfig.chapter, undefined); assert.equal(c.generationConfig.topic, "Moment of inertia");
  assert.equal(validateGenerationConfig(c.generationConfig).topic, "Moment of inertia");
});
