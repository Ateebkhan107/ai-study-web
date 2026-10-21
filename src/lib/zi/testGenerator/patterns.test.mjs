import test from "node:test";
import assert from "node:assert/strict";
import { chapterScope, normalizeScope, normalizeDifficulty, normalizeQuestionType } from "./scope.server.js";
import { retrievePYQReferences, normalizeReference, selectDiverseReferences, MAX_CANDIDATES } from "./retrieval.server.js";
import { analyzePYQPatterns } from "./analysis.server.js";
import { PATTERN_RESPONSE_JSON_SCHEMA, validatePatternAnalysis } from "./analysisSchema.server.js";

const input = { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion" };
const scope = normalizeScope(input);
const id = (n) => `12345678-1234-4234-8234-${String(n).padStart(12, "0")}`;
function row(n = 1, changes = {}) {
  return {
    id: id(n), exam_id: id(100), exam: "JEE", exam_type: "JEE Main", subject: "Physics", chapter: "Rotational Motion", topic: "Moment of inertia", year: 2024,
    status: "PUBLISHED", difficulty: "MEDIUM", question_type: "MCQ",
    question: `A uniform disc has radius ${n} metres. Determine its moment of inertia about the symmetry axis given its mass and uniform density.`,
    option_a: "2MR^2", option_b: "MR^2/2", option_c: "MR^2/4", option_d: "MR^2", correct_option: "b",
    paper: { id: id(100), exam: "JEE", exam_type: "JEE Main", is_published: true, status: "PUBLISHED", year: 2024 },
    ...changes,
  };
}
function database(rows, error = null) {
  const calls = [];
  return {
    calls,
    from(table) {
      const call = { table, filters: [], orders: [] };
      calls.push(call);
      const builder = {
        select(value) { call.select = value; return this; },
        in(key, value) { call.filters.push(["in", key, value]); return this; },
        eq(key, value) { call.filters.push(["eq", key, value]); return this; },
        ilike(key, value) { call.filters.push(["ilike", key, value]); return this; },
        order(key, options) { call.orders.push([key, options]); return this; },
        limit(value) { call.limit = value; return this; },
        abortSignal(value) { call.signal = value; return this; },
        then(resolve, reject) { return Promise.resolve({ data: rows.slice(0, call.limit), error }).then(resolve, reject); },
      };
      return builder;
    },
  };
}
function validAnalysis(references) {
  const referenceIds = references.map((r) => r.id);
  const pattern = { description: "Rotational inertia relates mass distribution to resistance against angular acceleration.", referenceIds };
  return {
    patternSummary: "The sampled problems connect rotational inertia with axis choice and mass distribution through short quantitative reasoning.",
    classifications: references.map((q) => ({ referenceId: q.id, nature: "numerical", concepts: ["Moment of inertia", "Rotational dynamics"], estimatedReasoningSteps: 2 })),
    commonFormulas: [{ expression: "I = MR^2/2", usage: "Applicable to a uniform disc about its central symmetry axis.", referenceIds }],
    questionStructures: [pattern], reasoningPatterns: [pattern], distractorPatterns: [pattern], multiConceptCombinations: [],
    difficultyCharacteristics: { observations: [pattern], caveats: ["Source difficulty labels are not independently calibrated."] }, coverageLimitations: [],
  };
}

test("normalizes explicit exam, subject, chapter, difficulty and format aliases", () => {
  const s = normalizeScope({ exam: "JEE Mains", subject: "physics", chapter: "rotation" });
  assert.equal(s.exam, "JEE Main");
  assert.equal(s.chapter, "System of Particles & Rotational Motion");
  assert.equal(normalizeDifficulty("MEDIUM"), "Medium");
  assert.equal(normalizeDifficulty(null), "Unknown");
  assert.equal(normalizeQuestionType("MULTIPLE_CORRECT"), "multiple_correct");
  assert.equal(normalizeQuestionType("NUMERICAL"), "numerical");
});
test("does not broaden ambiguous exams, invalid subjects or empty scope", () => {
  for (const invalid of [{ ...input, exam: "JEE" }, { ...input, subject: "Biology" }, { exam: "NEET", subject: "Maths", chapter: "Algebra" }, { exam: "NEET", subject: "Biology" }]) assert.throws(() => normalizeScope(invalid));
  assert.throws(() => normalizeScope({ ...input, sampleSize: 1000 }));
  assert.throws(() => normalizeScope({ ...input, userId: "untrusted" }));
});
test("scopes ambiguous chapter aliases by subject and excludes legacy broad fallbacks", () => {
  assert.match(chapterScope("Chemistry", "Thermodynamics").chapter, /Chemical/);
  assert.match(chapterScope("Physics", "Thermodynamics").chapter, /Thermal/);
  assert.ok(!scope.chapterAliases.includes("Centre of Mass"));
  assert.ok(!chapterScope("Physics", "Wave Optics").aliases.includes("Ray & Wave Optics"));
  assert.equal(chapterScope("Biology", "Human Physiology").chapter, "Human Physiology (Digestion, Respiration, Circulation)");
});
test("canonical combined chapter names containing commas stay intact", () => {
  const canonical = "Human Physiology (Digestion, Respiration, Circulation)";
  assert.ok(normalizeScope({ exam: "NEET UG", subject: "Biology", chapter: canonical }).chapterAliases.includes(canonical));
});
test("both queries enforce official paper, exact exam, subject, chapter and status with hard limits", async () => {
  const client = database([row()]);
  const r = await retrievePYQReferences(input, { client });
  assert.equal(client.calls.length, 2);
  for (const call of client.calls) {
    assert.equal(call.table, "pyq_questions");
    assert.match(call.select, /pyq_exams!inner/);
    assert.equal(call.limit, MAX_CANDIDATES / 2);
    assert.ok(call.signal instanceof AbortSignal);
    for (const field of ["exam", "exam_type", "subject", "chapter", "status", "paper.exam", "paper.exam_type", "paper.status"]) assert.ok(call.filters.some((f) => f[1] === field));
    assert.ok(call.filters.some((f) => f[1] === "paper.is_published" && f[2] === true));
    assert.ok(!call.filters.find((f) => f[1] === "exam_type")[2].includes("JEE Advanced"));
    assert.ok(!call.filters.find((f) => f[1] === "status")[2].includes("NEEDS_REVIEW"));
  }
  assert.equal(r.references.length, 1);
  assert.equal(r.fetchedRowCount, 2);
});
test("topic-only requests use literal matching and never fallback to unrelated chapters", async () => {
  const client = database([]);
  await retrievePYQReferences({ exam: "JEE Advanced", subject: "Physics", topic: "angular_100%" }, { client });
  for (const call of client.calls) {
    assert.ok(call.filters.some((f) => f[0] === "ilike" && f[2] === "angular\\_100\\%"));
    assert.ok(!call.filters.some((f) => f[1] === "chapter"));
    assert.ok(!call.filters.find((f) => f[1] === "exam_type")[2].includes("JEE Main"));
  }
});
test("rejects cross-exam, mismatched paper, subject, chapter and topic even if DB filters regress", () => {
  for (const changes of [
    { exam_type: "JEE Advanced" }, { paper: { ...row().paper, exam_type: "JEE Advanced" } }, { exam_id: id(99) },
    { subject: "Chemistry" }, { chapter: "Centre of Mass" }, { exam: "NEET" },
  ]) assert.equal(normalizeReference(row(1, changes), scope).reference, undefined);
  assert.equal(normalizeReference(row(), normalizeScope({ ...input, topic: "Angular momentum" })).reason, "scope_mismatch");
});
test("rejects unpublished/unapproved references and unpublished papers", () => {
  for (const changes of [{ status: "NEEDS_REVIEW" }, { status: "DRAFT" }, { paper: null }, { paper: { ...row().paper, is_published: false } }, { paper: { ...row().paper, status: "DRAFT" } }]) assert.equal(normalizeReference(row(1, changes), scope).reason, "unpublished_or_unapproved");
  assert.ok(normalizeReference(row(1, { status: "APPROVED" }), scope).reference);
});
test("rejects attached media, image prose, layout-only matching and placeholder options", () => {
  for (const changes of [
    { question_image: "https://example.invalid/diagram.png" }, { option_a_image: "diagram" },
    { question_content: { blocks: [{ type: "image", url: "diagram" }] } },
    { question: "Determine the angular acceleration of the disc shown in the figure with the specified forces." },
    { question: "List-I shows planar structures. Match each body with the correct inertia in List-II." },
    { option_a: "Option extraction needs review" }, { question: "" },
  ]) assert.equal(normalizeReference(row(1, changes), scope).reference, undefined);
});
test("requires complete distinct options and consistent answer keys", () => {
  for (const changes of [{ option_a: "" }, { option_b: "2MR^2" }, { correct_option: "" }, { correct_option: "E" }, { correct_options: ["A", "B"] }]) assert.equal(normalizeReference(row(1, changes), scope).reference, undefined);
  assert.ok(normalizeReference(row(1, { option_a: "-MR^2", option_b: "MR^2", option_d: "3MR^2" }), scope).reference);
});
test("numerical and multiple-correct references are analyzed without enabling generated formats", () => {
  const numerical = normalizeReference(row(1, { question_type: "NUMERICAL", numerical_answer: 0, correct_option: "", option_a: null }), scope).reference;
  assert.equal(numerical.answer, 0);
  assert.deepEqual(numerical.options, []);
  assert.ok(normalizeReference(row(1, { question_type: "MULTIPLE_CORRECT", correct_options: ["A", "C"] }), scope).reference);
  assert.equal(normalizeReference(row(1, { question_type: "NUMERICAL", numerical_answer: null, correct_option: "" }), scope).reason, "invalid_answer");
});
test("answer-key-only explanations are not treated as worked solutions", () => {
  const r = normalizeReference(row(1, { explanation: "Official JEE Advanced final answer key: B." }), scope).reference;
  assert.equal(r.explanation, null);
});
test("deduplicates references and samples at most 20 across available dimensions", async () => {
  const client = database(Array.from({ length: 60 }, (_, i) => row(i + 1, { year: 2020 + i % 5, paper: { ...row().paper, year: 2020 + i % 5 }, difficulty: i % 2 ? "HARD" : "EASY" })));
  const r = await retrievePYQReferences({ ...input, sampleSize: 20 }, { client });
  assert.equal(r.references.length, 20);
  assert.ok(r.fetchedRowCount <= 120);
  assert.equal(new Set(r.references.map((q) => q.id)).size, 20);
  assert.ok(new Set(r.references.map((q) => q.year)).size > 1);
  assert.ok(r.limitations.some((s) => s.includes("page limit")));
  const references = [1, 2, 3].map((n) => normalizeReference(row(n), scope).reference);
  assert.deepEqual(selectDiverseReferences(references, 2), selectDiverseReferences([...references].reverse(), 2));
});
test("retrieval failures do not become insufficient-reference successes", async () => {
  await assert.rejects(retrievePYQReferences(input, { client: database([], { message: "private raw DB failure" }) }), (error) => error.code === "PYQ_RETRIEVAL_FAILED" && !error.message.includes("private"));
});
test("insufficient data never calls Gemini or fabricates a summary", async () => {
  for (const count of [0, 4]) {
    let called = false;
    const result = await analyzePYQPatterns(input, { client: database(Array.from({ length: count }, (_, n) => row(n + 1))), complete: async () => { called = true; } });
    assert.equal(called, false);
    assert.equal(result.status, "insufficient_references");
    assert.equal(result.numberOfQuestionsAnalyzed, 0);
    assert.equal(result.patternSummary, null);
    assert.equal(result.referencePYQIds.length, count);
  }
});
test("analysis is grounded in retrieved IDs; counts are computed in code", async () => {
  const rows = Array.from({ length: 12 }, (_, n) => row(n + 1));
  const result = await analyzePYQPatterns(input, { client: database(rows), complete: async ({ prompt, responseJsonSchema, systemPrompt }) => {
    assert.ok(prompt.length < 65000);
    assert.ok(responseJsonSchema.properties.classifications);
    assert.match(systemPrompt, /untrusted source data/);
    return { data: validAnalysis(JSON.parse(prompt).references), model: "test-provider" };
  } });
  assert.equal(result.status, "analyzed");
  assert.equal(result.numberOfQuestionsAnalyzed, 12);
  assert.equal(result.conceptDistribution[0].count, 12);
  assert.equal(result.conceptDistribution[0].proportionOfSample, 1);
  assert.deepEqual(result.difficultyCharacteristics.sourceLabelCounts, { Medium: 12 });
  assert.deepEqual(result.questionDistribution.nature, { numerical: 12 });
});
test("small analyzable samples are clearly marked limited", async () => {
  const result = await analyzePYQPatterns(input, { client: database(Array.from({ length: 5 }, (_, n) => row(n + 1))), complete: async ({ prompt }) => ({ data: validAnalysis(JSON.parse(prompt).references), model: "test-provider" }) });
  assert.equal(result.status, "limited_references");
  assert.equal(result.numberOfQuestionsAnalyzed, 5);
  assert.ok(result.coverageLimitations.some((s) => s.includes("12–20")));
});
test("schema rejects invented citations, missing/duplicate classifications and malformed output", () => {
  const refs = Array.from({ length: 5 }, (_, n) => normalizeReference(row(n + 1), scope).reference);
  for (const alter of [
    (data) => { data.commonFormulas[0].referenceIds = [id(999)]; },
    (data) => { data.classifications.pop(); },
    (data) => { data.classifications[0].referenceId = data.classifications[1].referenceId; },
    (data) => { data.classifications[0].nature = "made-up"; },
    (data) => { data.questionStructures[0].referenceIds = [id(1), id(1)]; },
  ]) { const data = validAnalysis(refs); alter(data); assert.throws(() => validatePatternAnalysis(data, refs)); }
});
test("schema rejects verbatim question prose in a pattern summary", () => {
  const refs = Array.from({ length: 5 }, (_, n) => normalizeReference(row(n + 1), scope).reference);
  const data = validAnalysis(refs);
  data.patternSummary = refs[0].statement;
  assert.throws(() => validatePatternAnalysis(data, refs), /reproduced/);
});
test("provider schema stays compatible while local validation enforces UUIDs and lengths", () => {
  assert.equal(JSON.stringify(PATTERN_RESPONSE_JSON_SCHEMA).includes('"format"'), false);
  assert.equal(JSON.stringify(PATTERN_RESPONSE_JSON_SCHEMA).includes('"$schema"'), false);
  const refs = Array.from({ length: 5 }, (_, n) => normalizeReference(row(n + 1), scope).reference);
  const data = validAnalysis(refs);
  data.classifications[0].referenceId = "not-a-uuid";
  assert.throws(() => validatePatternAnalysis(data, refs));
});
test("distractor claims cannot cite numerical references without options", () => {
  const refs = Array.from({ length: 5 }, (_, n) => normalizeReference(row(n + 1, { question_type: "NUMERICAL", numerical_answer: 2 }), scope).reference);
  assert.throws(() => validatePatternAnalysis(validAnalysis(refs), refs), /without answer options/);
});
test("provider errors and invalid analyses are safe failures, never cached successful results", async () => {
  const client = database(Array.from({ length: 5 }, (_, n) => row(n + 1)));
  for (const complete of [async () => { throw new Error("private provider failure"); }, async () => ({ data: {} })]) await assert.rejects(analyzePYQPatterns(input, { client, complete }), (error) => error.code === "PYQ_ANALYSIS_FAILED" && !error.message.includes("private"));
});
