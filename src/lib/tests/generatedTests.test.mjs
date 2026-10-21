import test from "node:test";
import assert from "node:assert/strict";
import { mcqIndex, hasNumericAnswer } from "./answers.js";
import { sessionQuestion, generatedReviewQuestion } from "./questionSource.server.js";
import { assertGeneratedEngineEnabled, storeValidatedGeneration, generatedResult, GeneratedAnswerRequest } from "./generatedTests.server.js";
import { createGeneratedAnswerQueue } from "./generatedSessionClient.js";
import { generationFixture, configuration, fixtureId } from "./fixtures/generated.mjs";

test("MCQ null, blanks, booleans, arrays and invalid values never become option A", () => {
  for (const value of [null, undefined, "", " ", false, true, [], {}, -1, 4, 0.5]) assert.equal(mcqIndex(value), null);
  for (const value of [0, "0", 1, "3"]) assert.equal(mcqIndex(value), Number(value));
  assert.equal(hasNumericAnswer(null), false); assert.equal(hasNumericAnswer(0), true);
});
test("both adapters exclude answers, explanations and internal hints before submission", () => {
  const q = generationFixture().questions[0];
  const ai = sessionQuestion(q, "AI_GENERATED");
  const bank = sessionQuestion({ ...q, text: q.statement, question_type: "MCQ", correct: 0, correct_value: "A", marks: 4, negative_marks: -1 });
  for (const result of [ai, bank]) for (const key of ["correct", "correctAnswer", "correct_value", "explanation", "validation", "concepts", "formulas"]) assert.equal(result[key], undefined);
  assert.equal(ai.text, q.statement); assert.equal(ai.sourceType, "AI_GENERATED"); assert.equal(bank.sourceType, undefined);
});
test("student flag cannot enable generation or engine implicitly", () => {
  assert.throws(() => assertGeneratedEngineEnabled({ ZI_AI_TEST_GENERATION_ENABLED: "true" }), /not available/);
});
test("only complete internally validated results enter private storage", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => { calls.push({ name, args }); return { data: fixtureId(50) }; } };
  const result = await storeValidatedGeneration({ userId: "owner", configuration, result: generationFixture(), creationKey: "fixture-creation-key", client });
  assert.equal(calls.length, 1); assert.equal(calls[0].name, "zi_store_generated_test");
  assert.equal(calls[0].args.p_owner, "owner"); assert.ok(result.startRoute.includes(fixtureId(50)));
  assert.ok(!JSON.stringify(result).includes("correctAnswer"));
});
test("an invalid storage acknowledgement never exposes a Start route", async () => {
  await assert.rejects(storeValidatedGeneration({ userId: "owner", configuration, result: generationFixture(), creationKey: "fixture-creation-key", client: { rpc: async () => ({ data: null }) } }), /Could not confirm/);
});
for (const failure of ["partial", "wrong-key", "missing-evidence", "unsupported-numerical", "duplicate", "missing-references"]) test(`storage fails closed for ${failure}`, async () => {
  const result = generationFixture();
  if (failure === "partial") result.status = "partial";
  if (failure === "wrong-key") result.questions[0].correctAnswer = 1;
  if (failure === "missing-evidence") delete result.questions[0].validation.audit;
  if (failure === "missing-references") result.provenance.referencePYQIds = [];
  if (failure === "duplicate") result.questions[1].statement = result.questions[0].statement;
  if (failure === "unsupported-numerical") { result.questions[0].validation.blindSolution.requiresCalculation = true; result.questions[0].validation.blindSolution.calculation = { family: "unsupported" }; }
  await assert.rejects(storeValidatedGeneration({ userId: "owner", configuration, result, creationKey: "fixture-creation-key", client: { rpc: () => { throw new Error("Must not persist invalid output"); } } }), /validated|revalidation/);
});
test("review is inaccessible before server submission", async () => {
  let questionQueries = 0;
  const client = { from(table) { if (table !== "zi_generated_sessions") questionQueries++;
    return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { submitted_at: null, result: null } }) }; } };
  await assert.rejects(generatedResult({ userId: "owner", sessionId: fixtureId(30), client, review: true }), /Submit this test/);
  assert.equal(questionQueries, 0);
});
test("review serialization preserves unanswered and exposes explanations only in authorized review", () => {
  const row = { id: fixtureId(1), content: generationFixture().questions[0] };
  const skipped = generatedReviewQuestion(row, null); assert.equal(skipped.selected_option, null); assert.equal(skipped.is_correct, false);
  const answered = generatedReviewQuestion(row, 0); assert.equal(answered.selected_option, "A"); assert.equal(answered.is_correct, true);
  assert.match(answered.questions.explanation, /1\./); assert.equal(answered.questions.validation, undefined);
});
test("answer requests reject score, elapsed time, keys and invalid answer types", () => {
  const base = { sourceType: "AI_GENERATED", sessionId: fixtureId(30), revision: 0, answers: { [fixtureId(1)]: null } };
  assert.equal(GeneratedAnswerRequest.safeParse(base).success, true);
  for (const extra of [{ score: 1000 }, { timeTakenSeconds: 1 }, { correctAnswer: 0 }]) assert.equal(GeneratedAnswerRequest.safeParse({ ...base, ...extra }).success, false);
  for (const value of ["0", true, [], 4]) assert.equal(GeneratedAnswerRequest.safeParse({ ...base, answers: { [fixtureId(1)]: value } }).success, false);
});
test("autosave queue serializes revisions, snapshots, and waits before submission", async () => {
  const calls = [];
  const queue = createGeneratedAnswerQueue({ sessionId: fixtureId(30), revision: 5, fetcher: async (_url, req) => {
    const payload = JSON.parse(req.body); calls.push(payload); return Response.json({ revision: payload.revision + 1 });
  } });
  const first = { [fixtureId(1)]: 0 }; const a = queue.save(first); first[fixtureId(1)] = 3;
  const b = queue.save({ [fixtureId(1)]: null });
  await Promise.all([a, b]); assert.equal(await queue.flush(), 7);
  assert.equal(calls[0].answers[fixtureId(1)], 0); assert.deepEqual(calls.map((c) => c.revision), [5, 6]);
});
test("lost save acknowledgement blocks final submission until server resume", async () => {
  const queue = createGeneratedAnswerQueue({ sessionId: fixtureId(30), revision: 0, fetcher: async () => Response.json({ error: "Reload to resume" }, { status: 409 }) });
  await assert.rejects(queue.save({}), /Reload/); await assert.rejects(queue.flush(), /Reload/);
});
