import test from "node:test";
import assert from "node:assert/strict";
import { generateAIQuestions } from "./generation.server.js";
import { prepareQuestionGenerationContext } from "./generationContext.server.js";
import { validateGenerationConfig, GENERATION_JSON_SCHEMA, generationResponseSchema } from "./questionSchema.server.js";
import { validateQuestionRendering, validateQuestionStructure } from "./questionValidation.server.js";
import { verifyNumericalQuestion } from "./numericalValidation.server.js";
import { checkQuestionOriginality } from "./originality.server.js";
import { serializeStudentGeneration, serializeInternalQuestion } from "./questionSerializers.server.js";
import { GENERATE_QUESTIONS_PROMPT, BLIND_SOLVE_PROMPT, questionTaskInstructions } from "./questionPrompts.server.js";

// Synthetic, deterministic test fixtures only. Never used by production or live CLI.
const config = { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", difficulty: "Medium", questionCount: 5 };
const normalized = validateGenerationConfig(config);
const id = (n) => `12345678-1234-4234-8234-${String(n).padStart(12, "0")}`;
const statements = [
  "A laboratory flywheel rotates about a fixed axle. Bearings exert negligible friction. Which change directly produces angular acceleration about the axle?",
  "An ice skater draws her arms inward while spinning freely on a horizontal rink. Which statement accounts for the resulting increase in rotation rate?",
  "Two rings share equal mass but their material lies at different distances from their central axes. Why does the wider ring resist changes in spin more strongly?",
  "A spinning satellite releases an internal brake connecting counter-rotating rotors. With no external moment acting, which system property remains unchanged?",
  "A wheel rolls without slipping on a stationary rough surface. What explains why static friction need not dissipate mechanical energy at the contact point?",
];
const options = [
  ["Applying a nonzero net torque", "Increasing the observation time alone", "Changing the zero of angular position", "Changing the laboratory temperature only"],
  ["Angular momentum remains conserved while rotational inertia decreases", "Her mass decreases", "External torque necessarily increases", "Angular momentum must decrease"],
  ["Its mass has a larger squared-distance weighting", "Its gravitational mass is smaller", "The axle changes the gravitational constant", "Its angular speed must vanish"],
  ["Total angular momentum", "The angular speed of each rotor separately", "The mechanical energy of each rotor separately", "The orientation of every component"],
  ["The instantaneous contact point is at rest relative to the surface", "All frictional forces are conservative", "The contact force is always absent", "Gravity ceases to act during rolling"],
];
function candidate(index = 0, changes = {}) {
  return {
    exam: "JEE Main", subject: "Physics", chapter: normalized.chapter, topic: "Rotational dynamics", difficulty: "Medium", questionType: "MCQ", sourceType: "AI_GENERATED",
    statement: statements[index], options: options[index], correctAnswer: 0,
    explanation: ["Identify the conserved quantity or the rotational equation that applies to the stated system.", "Apply that principle to the specified change and compare all four options carefully."],
    concepts: ["Rotational dynamics"], formulas: [], ...changes,
  };
}
async function contextFor(input = config, { insufficient = false, refs, mismatch = false } = {}) {
  const c = validateGenerationConfig(input);
  const references = refs || Array.from({ length: 16 }, (_, i) => ({ id: id(i + 1), statement: `Archive reference ${i}: a separate particle-system problem discussing an unrelated mechanical configuration.`, options: ["red", "blue", "green", "yellow"] }));
  const analysis = {
    status: insufficient ? "insufficient_references" : "analyzed", exam: c.exam, subject: c.subject, chapter: c.chapter, topic: c.topic,
    provenance: { source: "official_pyq", referenceFingerprint: "fixture-fingerprint", model: "test-model" },
    referencePYQIds: references.map((r) => r.id), numberOfQuestionsAnalyzed: references.length,
    patternSummary: "Synthetic test-only pattern context.", conceptDistribution: [{ concept: "Rotational dynamics" }], commonFormulas: [], questionStructures: [], reasoningPatterns: [], distractorPatterns: [], coverageLimitations: [], cache: { hit: false },
  };
  return prepareQuestionGenerationContext(input, { analyze: async () => analysis, retrieve: async () => ({ references, fingerprint: mismatch ? "changed" : "fixture-fingerprint" }) });
}
function auditFor(q, changes = {}) {
  return {
    id: q.id, verdict: "accept", independentlyCorrectOptions: [q.correctAnswer], answerCorrect: true,
    exactlyOneCorrect: true, explanationConsistent: true, noContradictions: true,
    quantitiesAndUnitsConsistent: true, sufficientInformation: true, examMatches: true, subjectMatches: true,
    topicMatches: true, difficultyMatches: true, reasoningAppropriate: true, originalityPass: true,
    requiresCalculation: false, deterministicModelApplies: true, substantiveReasoningSteps: 3, confidence: "high", issues: [], rationale: "Test-only independent review accepted this candidate.", ...changes,
  };
}
function mockAI({ pool = Array.from({ length: 5 }, (_, i) => candidate(i)), generate, blind, audit } = {}) {
  let cursor = 0;
  const calls = [];
  const complete = async (request) => {
    const payload = JSON.parse(request.prompt);
    calls.push({ system: request.systemPrompt, payload });
    let data;
    if (request.systemPrompt.startsWith(GENERATE_QUESTIONS_PROMPT)) {
      const batch = Array.from({ length: payload.count }, (_, n) => structuredClone(pool[(cursor + n) % pool.length]));
      cursor += payload.count;
      data = generate ? generate(batch, payload, cursor) : { questions: batch };
    } else if (request.systemPrompt === BLIND_SOLVE_PROMPT) {
      assert.ok(payload.questions.every((q) => !Object.hasOwn(q, "correctAnswer") && !Object.hasOwn(q, "explanation")));
      data = { solutions: payload.questions.map((q) => ({
        id: q.id, correctOptions: [0], sufficientInformation: true, scientificallySound: true, requiresCalculation: false,
        solutionSteps: ["Independent test-only reasoning reaches the intended conclusion."], uncertainties: [], calculation: null,
        ...(blind ? blind(q) : {}),
      })) };
    } else data = { audits: payload.questions.map((q) => auditFor(q, audit ? audit(q) : {})) };
    return { data, model: "mock-gemini", providerRequests: 1, usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 } };
  };
  return { complete, calls };
}
async function run(mock, options = {}) { return generateAIQuestions(config, { context: await contextFor(config, options), complete: mock.complete }); }

test("generates five questions through structure, blind solve and audit with server IDs", async () => {
  const ai = mockAI();
  const result = await run(ai);
  assert.equal(result.status, "complete");
  assert.equal(result.acceptedCount, 5);
  assert.equal(new Set(result.questions.map((q) => q.id)).size, 5);
  assert.equal(result.metrics.generationCalls, 1);
  assert.equal(result.metrics.blindSolveCalls, 1);
  assert.equal(result.metrics.auditCalls, 1);
  assert.equal(result.metrics.providerRequests, 3);
  assert.equal(result.metrics.generatedCount, 5);
  assert.equal(result.metrics.rejectedCount, 0);
  assert.ok(result.questions.every((q) => q.validation.status === "passed_implemented_checks"));
  assert.ok(!JSON.stringify(ai.calls[0].payload).includes("Archive reference")); // generation gets summary only
});
test("malformed responses exhaust the bounded generation budget without fake fallback", async () => {
  const result = await run(mockAI({ generate: () => ({ unexpected: "response" }) }));
  assert.equal(result.status, "error");
  assert.equal(result.metrics.generationCalls, 3);
  assert.equal(result.metrics.blindSolveCalls, 0);
  assert.equal(result.code, "VALIDATION_ATTEMPTS_EXHAUSTED");
});
test("missing options and multi-answer keys fail strict Zod validation", async () => {
  for (const mutate of [(q) => ({ ...q, options: q.options.slice(0, 3) }), (q) => ({ ...q, correctAnswer: [0, 1] })]) {
    const result = await run(mockAI({ generate: (batch) => ({ questions: batch.map(mutate) }) }));
    assert.equal(result.acceptedCount, 0);
    assert.ok(result.rejectionCounts.INVALID_QUESTION_SCHEMA > 0);
  }
});
test("independent solve rejects incorrect keys and multiple correct options", async () => {
  for (const correctOptions of [[1], [0, 1], []]) {
    const result = await run(mockAI({ blind: () => ({ correctOptions }) }));
    assert.equal(result.acceptedCount, 0);
    assert.ok(result.rejectionCounts.ANSWER_DISAGREEMENT_OR_AMBIGUITY > 0);
    assert.equal(result.metrics.auditCalls, 0);
  }
});
test("exact PYQ copies are rejected and cannot be silently replenished", async () => {
  const refs = Array.from({ length: 16 }, (_, i) => ({ id: id(i + 1), statement: i === 0 ? statements[0] : `Different archived mathematical problem number ${i} on vector projection in mechanics.`, options: [] }));
  const result = await run(mockAI(), { refs });
  assert.equal(result.status, "partial");
  assert.equal(result.acceptedCount, 4);
  assert.ok(result.rejectionCounts.EXACT_DUPLICATE > 0);
});
test("numerical substitutions and near-paraphrases are rejected before AI verification", () => {
  const original = { id: id(1), statement: "A uniform disc of mass 2 kg and radius 3 m rotates about its central axis with angular speed 4 rad/s. Determine its kinetic energy." };
  assert.equal(checkQuestionOriginality({ statement: original.statement.replace("2 kg", "7 kg").replace("3 m", "9 m") }, [original]).code, "NUMERICAL_REWRITE");
  assert.equal(checkQuestionOriginality({ statement: original.statement.replace("Determine", "Calculate") }, [original]).code, "NEAR_DUPLICATE");
});
test("duplicate detection spans separate generation batches", async () => {
  const result = await run(mockAI({ pool: [candidate(0), candidate(1), candidate(2)] }));
  assert.equal(result.status, "partial");
  assert.equal(result.acceptedCount, 3);
  assert.ok(result.rejectionCounts.EXACT_DUPLICATE > 0);
  assert.match(result.message, /Only 3 of 5/);
});
test("JEE Advanced generation stays unsupported without any AI call", async () => {
  let called = false;
  const result = await generateAIQuestions({ ...config, exam: "JEE Advanced" }, { complete: async () => { called = true; } });
  assert.equal(result.code, "UNSUPPORTED_EXAM");
  assert.equal(called, false);
});
test("insufficient official references never invoke generation", async () => {
  const ai = mockAI();
  const result = await run(ai, { insufficient: true });
  assert.equal(result.status, "insufficient_references");
  assert.equal(result.acceptedCount, 0);
  assert.equal(ai.calls.length, 0);
});
test("provider failure exposes only structured failure codes and retains no raw error", async () => {
  const result = await generateAIQuestions(config, { context: await contextFor(), complete: async () => { throw new Error("SECRET private provider payload"); } });
  assert.equal(result.code, "AI_PROVIDER_FAILURE");
  assert.equal(result.metrics.generationCalls, 1);
  assert.ok(!JSON.stringify(result).includes("SECRET"));
});
test("provider rate limits are explicit and are not retried to evade quotas", async () => {
  const result = await generateAIQuestions(config, { context: await contextFor(), complete: async () => { throw Object.assign(new Error("private rate-limit details"), { providerStatus: 429 }); } });
  assert.equal(result.code, "AI_RATE_LIMITED");
  assert.equal(result.metrics.generationCalls, 1);
  assert.match(result.message, /rate limit/);
});
test("malformed JSON provider errors have a fixed regeneration limit", async () => {
  const result = await generateAIQuestions(config, { context: await contextFor(), complete: async () => { throw Object.assign(new Error("bad JSON"), { code: "ZI_ANALYSIS_INVALID_JSON" }); } });
  assert.equal(result.metrics.generationCalls, 3);
  assert.equal(result.acceptedCount, 0);
  assert.equal(result.rejectionCounts.MALFORMED_AI_RESPONSE, 3);
});
test("student serialization excludes answers, explanations, formulas and internal reasoning", async () => {
  const result = await run(mockAI());
  const safe = serializeStudentGeneration(result);
  const serialized = JSON.stringify(safe);
  for (const forbidden of ["correctAnswer", "explanation", "formulas", "concepts", "blindSolution", "rationale", "validation", "referencePYQIds"]) assert.ok(!serialized.includes(`"${forbidden}"`));
  assert.equal(safe.questions.length, 5);
  const internal = serializeInternalQuestion(result.questions[0]);
  assert.equal(internal.correctAnswer, 0);
  assert.equal(internal.explanation.length, 2);
});
test("unissued or changed pattern contexts are rejected", async () => {
  const context = await contextFor();
  assert.throws(() => { context.references[0].statement = "mutated"; });
  const result = await generateAIQuestions(config, { context: structuredClone(context), complete: mockAI().complete });
  assert.equal(result.code, "INVALID_GENERATION_CONTEXT");
  await assert.rejects(contextFor(config, { mismatch: true }), (error) => error.code === "GENERATION_CONTEXT_MISMATCH");
});
test("audit rejects semantic rewrites, scientific uncertainty, difficulty and explanation failures", async () => {
  for (const changes of [
    { originalityPass: false, verdict: "reject", issues: ["SEMANTIC_REWRITE"] },
    { confidence: "low", verdict: "uncertain" },
    { explanationConsistent: false, issues: ["EXPLANATION_CONTRADICTION"] },
    { difficultyMatches: false, issues: ["DIFFICULTY_MISMATCH"] },
    { substantiveReasoningSteps: 1 },
  ]) {
    const result = await run(mockAI({ audit: () => changes }));
    assert.equal(result.acceptedCount, 0);
  }
});
test("missing verification or duplicate verifier IDs cannot be treated as acceptance", async () => {
  const ai = mockAI();
  const result = await generateAIQuestions(config, { context: await contextFor(), complete: async (request) => request.systemPrompt === BLIND_SOLVE_PROMPT ? { data: { solutions: [] } } : ai.complete(request) });
  assert.equal(result.acceptedCount, 0);
  assert.ok(result.rejectionCounts.INVALID_BLIND_VERIFICATION > 0);
});
test("bad exam, subject, topic or difficulty cannot pass structural scope checks", () => {
  for (const changes of [{ exam: "NEET" }, { subject: "Biology" }, { chapter: "Electrostatics" }, { difficulty: "Easy" }]) assert.equal(validateQuestionStructure(candidate(0, changes), normalized).code, "CONFIGURATION_MISMATCH");
  assert.equal(validateQuestionStructure(candidate(0, { topic: "Unmapped" }), normalized).code, "INCOMPLETE_SCOPE");
  assert.equal(validateQuestionStructure(candidate(0, { explanation: ["The correct answer is B, which follows directly.", "Use the relationship above for the required result."] }), normalized).code, "EXPLANATION_KEY_CONTRADICTION");
});
test("valid KaTeX is accepted; malformed or unsafe notation and bare LaTeX are rejected", () => {
  assert.equal(validateQuestionRendering("The inertia is $I=\\frac{1}{2}MR^2$."), true);
  for (const value of ["Unbalanced $math", "$\\frac{1}{$", "\\frac{1}{2}", "$\\href{https://example.org}{x}$", "![diagram](https://example.org)", "<script>alert(1)</script>", "Hidden\u0000control", "Spoof\u202edirection", "Read https://example.org/reference"]) assert.equal(validateQuestionRendering(value), false);
});
test("wire schema uses arrays and enum literals while local schema stays strict", () => {
  const options = GENERATION_JSON_SCHEMA.properties.questions.items.properties.options;
  assert.deepEqual(options, { type: "array", items: { type: "string" } });
  assert.ok(!JSON.stringify(GENERATION_JSON_SCHEMA).includes('"const"'));
  assert.equal(validateQuestionStructure(candidate(0, { id: "model-supplied-id" }), normalized).code, "INVALID_QUESTION_SCHEMA");
});

const numeric = () => ({ ...candidate(), id: id(99), statement: "A uniform disc of mass 2 kg and radius 0.5 m starts from rest. A constant net torque 1 N m acts for 2 s about its fixed symmetry axis. What rotational energy does it acquire?", options: ["8 J", "4 J", "2 J", "16 J"] });
const proof = () => ({ family: "torque_spinup_energy", geometry: "solid_disc", geometryEvidence: "uniform disc", inputs: [
  { name: "mass", value: 2, unit: "kg", sourceText: "2 kg" },
  { name: "size", value: 0.5, unit: "m", sourceText: "0.5 m" },
  { name: "torque", value: 1, unit: "N m", sourceText: "1 N m" },
  { name: "time", value: 2, unit: "s", sourceText: "2 s" },
] });
test("fixed numerical formulas independently recompute a multi-step rotational answer", () => {
  const result = verifyNumericalQuestion(numeric(), proof());
  assert.equal(result.passed, true);
  assert.equal(result.computedAnswer, 8);
});
test("incorrect answer keys and incorrect calculations fail deterministic verification", () => {
  assert.equal(verifyNumericalQuestion({ ...numeric(), correctAnswer: 1 }, proof()).code, "INCORRECT_ANSWER_KEY");
  assert.equal(verifyNumericalQuestion({ ...numeric(), options: ["9 J", "4 J", "2 J", "16 J"] }, proof()).code, "INCORRECT_CALCULATION");
});
test("multiple numerically equivalent options are rejected even when text differs", () => {
  assert.equal(verifyNumericalQuestion({ ...numeric(), options: ["8 J", "8.000 J", "2 J", "16 J"] }, proof()).code, "AMBIGUOUS_NUMERICAL_ANSWER");
});
test("unsupported formulas, unbound givens and mismatched units cannot get a deterministic pass", () => {
  assert.equal(verifyNumericalQuestion(numeric(), { ...proof(), family: "unsupported" }).code, "UNSUPPORTED_CALCULATION");
  const wrong = proof(); wrong.inputs[0].value = 7;
  assert.equal(verifyNumericalQuestion(numeric(), wrong).code, "UNBOUND_CALCULATION_INPUT");
  const units = proof(); units.inputs[0].unit = "m";
  assert.equal(verifyNumericalQuestion(numeric(), units).code, "UNIT_MISMATCH");
  const geometry = proof(); geometry.geometryEvidence = "solid sphere";
  assert.equal(verifyNumericalQuestion(numeric(), geometry).code, "UNBOUND_GEOMETRY");
});
test("numerical generation requires bound calculations, not just an AI assertion", async () => {
  const q = numeric(); delete q.id;
  const ai = mockAI({ pool: [q], blind: () => ({ requiresCalculation: true, calculation: proof() }), audit: () => ({ requiresCalculation: true }) });
  const result = await run(ai);
  assert.equal(result.acceptedCount, 1); // repeats are never used to reach five
  assert.equal(result.questions[0].validation.deterministic.computedAnswer, 8);
  const unsupported = await run(mockAI({ pool: [q], blind: () => ({ requiresCalculation: true, calculation: { ...proof(), family: "unsupported" } }) }));
  assert.equal(unsupported.acceptedCount, 0);
});
test("cancelled runs cannot generate or return unverified questions", async () => {
  const ai = mockAI();
  const result = await generateAIQuestions(config, { context: await contextFor(), complete: ai.complete, signal: AbortSignal.abort() });
  assert.equal(result.code, "GENERATION_ABORTED");
  assert.equal(ai.calls.length, 0);
});
test("question-count limits are enforced before context or provider access", async () => {
  for (const questionCount of [0, 4, 31, 500]) {
    const result = await generateAIQuestions({ ...config, questionCount }, { complete: async () => { assert.fail("must not call provider"); } });
    assert.equal(result.code, "INVALID_CONFIGURATION");
  }
});

test("all supported fixed formulas and output units match independent worked examples", () => {
  const cases = [
    ["torque_acceleration", [["torque", 2, "N m"], ["inertia", 0.5, "kg m^2"]], 4, "rad/s^2"],
    ["body_inertia", [["mass", 2, "kg"], ["size", 0.5, "m"]], 0.25, "kg m^2", "solid_disc"],
    ["rotational_energy", [["inertia", 2, "kg m^2"], ["omega", 3, "rad/s"]], 9, "J"],
    ["angular_momentum", [["inertia", 2, "kg m^2"], ["omega", 3, "rad/s"]], 6, "kg m^2/s"],
    ["angular_velocity", [["initialOmega", 2, "rad/s"], ["alpha", 3, "rad/s^2"], ["time", 4, "s"]], 14, "rad/s"],
    ["parallel_axis", [["centerInertia", 0.25, "kg m^2"], ["mass", 2, "kg"], ["offset", 0.5, "m"]], 0.75, "kg m^2"],
    ["momentum_conservation", [["initialInertia", 2, "kg m^2"], ["initialOmega", 3, "rad/s"], ["finalInertia", 3, "kg m^2"]], 2, "rad/s"],
    ["rolling_speed", [["height", 7, "m"], ["gravity", 10, "m/s^2"]], 10, "m/s", "solid_sphere"],
    ["braking_angle", [["mass", 2, "kg"], ["size", 1, "m"], ["initialOmega", 4, "rad/s"], ["brakingTorque", 2, "N m"]], 4, "rad", "solid_disc"],
    ["spinup_power", [["mass", 2, "kg"], ["size", 1, "m"], ["torque", 2, "N m"], ["time", 3, "s"]], 12, "W", "solid_disc"],
    ["conserved_momentum_energy_change", [["initialInertia", 2, "kg m^2"], ["initialOmega", 3, "rad/s"], ["finalInertia", 3, "kg m^2"]], -3, "J"],
    ["attached_mass_speed", [["inertia", 2, "kg m^2"], ["initialOmega", 6, "rad/s"], ["attachedMass", 1, "kg"], ["offset", 2, "m"]], 2, "rad/s"],
    ["rolling_total_energy", [["mass", 2, "kg"], ["speed", 3, "m/s"]], 18, "J", "hoop"],
  ];
  for (const [family, givens, expected, outputUnit, geometry = null] of cases) {
    const geometryEvidence = geometry === "solid_disc" ? "uniform disc" : geometry === "solid_sphere" ? "solid sphere" : geometry === "hoop" ? "thin ring" : "";
    const inputs = givens.map(([name, value, unit]) => ({ name, value, unit, sourceText: `${value} ${unit}` }));
    const statement = `${geometryEvidence}. ${inputs.map((v) => `${v.name} is ${v.sourceText}`).join("; ")}. Find the requested quantity.`;
    const q = { ...numeric(), statement, options: [expected, expected + 10, expected + 20, expected + 30].map((v) => `${v} ${outputUnit}`) };
    const result = verifyNumericalQuestion(q, { family, inputs, geometry, geometryEvidence });
    assert.equal(result.passed, true, family);
    assert.ok(Math.abs(result.computedAnswer - expected) < 1e-9, family);
  }
});
test("prototype properties cannot masquerade as supported formulas or executable programs", () => {
  for (const family of ["constructor", "__proto__", "process.exit(1)"]) assert.equal(verifyNumericalQuestion(numeric(), { ...proof(), family }).code, "UNSUPPORTED_CALCULATION");
});
test("known source chapter aliases normalize without broadening unrelated chapters", () => {
  assert.equal(validateQuestionStructure(candidate(0, { chapter: "Rotation" }), normalized).passed, true);
  assert.equal(validateQuestionStructure(candidate(0, { chapter: "Centre of Mass" }), normalized).passed, false);
});

test("metadata is constrained on the wire and diagnostics identify the mismatched field", () => {
  const schema = generationResponseSchema(normalized, ["Medium"]);
  const properties = schema.properties.questions.items.properties;
  assert.deepEqual(properties.exam.enum, ["JEE Main"]);
  assert.deepEqual(properties.chapter.enum, [normalized.chapter]);
  assert.deepEqual(properties.difficulty.enum, ["Medium"]);
  assert.equal(validateQuestionStructure(candidate(0, { subject: "Biology" }), normalized).field, "subject");
});
test("Biology instructions omit unused physics catalog but preserve independent calculation rejection", () => {
  const biology = { subject: "Biology" };
  const generation = questionTaskInstructions(biology, "generation");
  const blind = questionTaskInstructions(biology, "blind");
  assert.ok(!generation.includes("torque_spinup_energy:"));
  assert.ok(!blind.includes("torque_spinup_energy:"));
  assert.match(blind, /unsupported calculations will be rejected/);
  assert.match(generation, /exactly four distinct options/);
});
test("quota interruption preserves accepted questions and explicitly rejects unverified candidates", async () => {
  const input = { ...config, questionCount: 7 };
  const pool = Array.from({ length: 7 }, (_, i) => candidate(i % 5, i < 5 ? {} : { statement: i === 5 ? "A door hinge is frictionless and a handle can be pushed along different lines. Which direction makes opening the door most effective for a fixed applied force?" : "A mechanic observes a freely turning platform as equipment is shifted toward its rim. Which physical principle determines how its rotation rate responds?" }));
  const ai = mockAI({ pool });
  const result = await generateAIQuestions(input, { context: await contextFor(input), complete: async (request) => {
    if (request.systemPrompt === BLIND_SOLVE_PROMPT && JSON.parse(request.prompt).questions.length === 2) throw Object.assign(new Error("quota exhausted"), { providerStatus: 429, providerRequests: 1 });
    return ai.complete(request);
  } });
  assert.equal(result.status, "partial");
  assert.equal(result.code, "AI_RATE_LIMITED");
  assert.equal(result.metrics.generatedCount, 7);
  assert.equal(result.metrics.acceptedCount, 5);
  assert.equal(result.metrics.rejectedCount, 2);
  assert.equal(result.rejectionCounts.UNVERIFIED_INTERRUPTED_VALIDATION, 2);
  assert.equal(serializeStudentGeneration(result).questions.length, 5);
});
