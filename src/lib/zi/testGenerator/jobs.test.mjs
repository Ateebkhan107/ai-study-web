import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { handleBuilder, confirmedGenerationDraft } from "./builder.server.js";
import { reserveGenerationJob, executeGenerationJob, readGenerationJob, publicJob, ReserveJobRequest } from "./jobs.server.js";
import { generationPilotAllowed } from "./jobPolicy.js";
import { generationJobRequest } from "../../../components/zi/generationJobClient.js";
import { configuration, generationFixture } from "../../tests/fixtures/generated.mjs";
import { prepareQuestionGenerationContext } from "./generationContext.server.js";
import { validateGenerationConfig } from "./questionSchema.server.js";
import { GENERATE_QUESTIONS_PROMPT, BLIND_SOLVE_PROMPT } from "./questionPrompts.server.js";

const env = { ZI_GENERATION_PILOT_ENABLED: "true", ZI_GENERATED_TEST_ENGINE_ENABLED: "true", ZI_GENERATION_PILOT_USERS: "synthetic-a,synthetic-b", ZI_GENERATION_PROVIDER_APPROVED: "true" };
const access = { userId: "synthetic-a", examTrack: "JEE", proTracks: [] };
const options = { secret: "synthetic-job-secret", now: 1000, env };
function confirmed() {
  const draft = handleBuilder({ userId: access.userId, access, operation: "update", patch: { ...configuration.generationConfig, ...configuration.sessionConfig } }, options);
  return handleBuilder({ userId: access.userId, access, operation: "confirm", token: draft.token }, options);
}
function memoryRepo() {
  const jobs = new Map(); let saved = null;
  const repo = async (op, owner, id, data) => {
    let j = jobs.get(id);
    if (op === "reserve") {
      j = [...jobs.values()].find((j) => j.owner_id === owner && j.draft_key === data.draftKey);
      if (!j) { j = { id: randomUUID(), owner_id: owner, configuration: data.configuration, draft_key: data.draftKey, state: "reserved", stage: "reserved", accepted: 0, requests: [] }; jobs.set(j.id, j); }
    } else if (!j || j.owner_id !== owner) throw Object.assign(new Error("Job not found"), { status: 404 });
    if (saved && ["held", "running"].includes(j.state)) { j.state = "ready"; j.stage = "complete"; j.test_id = saved; }
    let claimed = false;
    if (op === "claim" && j.state === "reserved") { claimed = true; j.state = "running"; j.execution_token = randomUUID(); }
    if (op === "progress") { j.stage = data.stage; j.accepted = data.accepted; }
    if (op === "dispatch") j.requests.push({ id: data.requestId, tokens: data.tokens });
    if (op === "ack") j.requests.at(-1).known = data.known;
    if (op === "finish" && j.state !== "ready") { j.state = data.state; j.stage = data.stage; }
    return structuredClone({ ...j, claimed });
  };
  return { repo, jobs, save: () => { saved = randomUUID(); return { testId: saved }; } };
}
async function setup() {
  const memory = memoryRepo();
  const draft = confirmed();
  const job = await reserveGenerationJob({ userId: access.userId, access, token: draft.token }, { repo: memory.repo, env, draftOptions: options });
  return { ...memory, draft, job };
}
async function context(input) {
  const c = validateGenerationConfig(input);
  const references = Array.from({ length: 5 }, (_, i) => ({ id: `ref-${i}`, statement: `Synthetic reference ${i} about unrelated laboratory optical observations and colored signals.`, options: ["red", "blue", "green", "yellow"] }));
  return prepareQuestionGenerationContext(input, { analyze: async () => ({ status: "analyzed", exam: c.exam, subject: c.subject, chapter: c.chapter, topic: c.topic,
    provenance: { source: "official_pyq", referenceFingerprint: "synthetic" }, referencePYQIds: references.map((r) => r.id), numberOfQuestionsAnalyzed: 5,
    patternSummary: "Synthetic patterns", conceptDistribution: [], commonFormulas: [], questionStructures: [], reasoningPatterns: [], distractorPatterns: [], coverageLimitations: [] }),
    retrieve: async () => ({ references, fingerprint: "synthetic" }) });
}
function mockComplete() {
  let calls = 0;
  const fixture = generationFixture();
  const complete = async (request) => {
    calls++; assert.equal(request.maxAttempts, 1);
    const payload = JSON.parse(request.prompt);
    let data;
    if (request.systemPrompt.startsWith(GENERATE_QUESTIONS_PROMPT)) data = { questions: fixture.questions.map(({ id, validation, ...q }) => q) };
    else if (request.systemPrompt === BLIND_SOLVE_PROMPT) {
      assert.ok(payload.questions.every((q) => !Object.hasOwn(q, "correctAnswer")));
      data = { solutions: payload.questions.map((q) => ({ ...fixture.questions[0].validation.blindSolution, id: q.id, solutionSteps: ["Synthetic blind solution."], calculation: null })) };
    } else data = { audits: payload.questions.map((q) => ({ ...fixture.questions[0].validation.audit, id: q.id, deterministicModelApplies: true, rationale: "Synthetic independent audit." })) };
    return { data, model: "mock-only", providerRequests: 1, usage: { totalTokens: 30, inputTokens: 10, outputTokens: 20 } };
  };
  return { complete, count: () => calls };
}
test("public access stays closed without both pilot gates and exact user allowlist", () => {
  assert.equal(generationPilotAllowed(access.userId, {}), false);
  assert.equal(generationPilotAllowed("synthetic", env), false);
  assert.equal(generationPilotAllowed(access.userId, env), true);
  assert.equal(confirmed().availability.generationEnabled, false);
});
test("duplicate confirmation produces immutable draft identity despite different encrypted tokens", () => {
  const d = confirmed();
  const again = handleBuilder({ userId: access.userId, access, operation: "confirm", token: d.token }, options);
  assert.notEqual(d.token, again.token);
  assert.equal(confirmedGenerationDraft({ userId: access.userId, access, token: d.token }, options).draftKey,
    confirmedGenerationDraft({ userId: access.userId, access, token: again.token }, options).draftKey);
});
test("expired, unconfirmed and wrong-owner drafts fail before reservation", async () => {
  let calls = 0; const repo = async () => { calls++; };
  const d = confirmed();
  for (const [identity, draftOptions] of [[access.userId, { ...options, now: 4000000 }], ["synthetic-b", options]]) {
    await assert.rejects(reserveGenerationJob({ userId: identity, access: { ...access, userId: identity }, token: d.token }, { repo, env, draftOptions }));
  }
  const draft = handleBuilder({ userId: access.userId, access, operation: "update", patch: { ...configuration.generationConfig, ...configuration.sessionConfig } }, options);
  await assert.rejects(reserveGenerationJob({ userId: access.userId, access, token: draft.token }, { repo, env, draftOptions: options }));
  assert.equal(calls, 0);
});
test("reservation rejects browser questions, user identity and supplied creation keys", () => {
  for (const extra of [{ userId: "other" }, { questions: [] }, { creationKey: "chosen" }, { result: {} }]) assert.equal(ReserveJobRequest.safeParse({ token: "encrypted", ...extra }).success, false);
});
test("concurrent execution claims run the existing real validation pipeline once", async () => {
  const f = await setup(), ai = mockComplete();
  const deps = { repo: f.repo, env, prepare: context, complete: ai.complete, store: f.save };
  const results = await Promise.all([1, 2].map(() => executeGenerationJob({ userId: access.userId, access, id: f.job.id }, deps)));
  assert.equal(ai.count(), 3);
  assert.ok(results.some((j) => j.state === "ready" && j.acceptedCount === 5));
  assert.ok((await readGenerationJob({ userId: access.userId, id: f.job.id }, deps)).startRoute);
});
test("provider execution approval is separate from reserving jobs", async () => {
  const f = await setup();
  await assert.rejects(executeGenerationJob({ userId: access.userId, access, id: f.job.id }, { repo: f.repo, env: { ...env, ZI_GENERATION_PROVIDER_APPROVED: "false" } }), { status: 403 });
  assert.equal(f.jobs.get(f.job.id).state, "reserved");
});
test("exam entitlement is checked again before claiming", async () => {
  const f = await setup();
  await assert.rejects(executeGenerationJob({ userId: access.userId, access: { ...access, examTrack: "NEET" }, id: f.job.id }, { repo: f.repo, env }), { status: 403 });
  assert.equal(f.jobs.get(f.job.id).state, "reserved");
});
for (const failure of ["timeout", "quota", "missing-usage"]) test(`${failure} holds the job and cannot replay provider requests`, async () => {
  const f = await setup(); let calls = 0;
  const complete = async () => { calls++; if (failure === "missing-usage") return { data: {}, providerRequests: 1 }; throw Object.assign(new Error("PRIVATE_PROVIDER_DETAIL"), { providerStatus: failure === "quota" ? 429 : undefined }); };
  const deps = { repo: f.repo, env, prepare: context, complete, store: () => { throw Error("Must not store"); } };
  const job = await executeGenerationJob({ userId: access.userId, access, id: f.job.id }, deps);
  assert.equal(job.state, "held"); assert.doesNotMatch(JSON.stringify(job), /PRIVATE_PROVIDER_DETAIL|execution_token|configuration|requests/);
  await executeGenerationJob({ userId: access.userId, access, id: f.job.id }, deps);
  assert.equal(calls, 1);
});
test("incomplete generation fails closed without a storage write", async () => {
  const f = await setup(); let writes = 0;
  const job = await executeGenerationJob({ userId: access.userId, access, id: f.job.id }, { repo: f.repo, env, prepare: context,
    generate: async () => ({ status: "partial", questions: [] }), store: async () => { writes++; } });
  assert.equal(job.state, "failed"); assert.equal(writes, 0);
});
test("lost provider acknowledgement in the database holds execution before another call", async () => {
  const f = await setup(), ai = mockComplete();
  const repo = (op, ...args) => op === "ack" ? Promise.reject(Error("Unknown DB acknowledgement")) : f.repo(op, ...args);
  const job = await executeGenerationJob({ userId: access.userId, access, id: f.job.id }, { repo, env, prepare: context, complete: ai.complete });
  assert.equal(job.state, "held"); assert.equal(ai.count(), 1);
});
test("a cancelled invocation cannot dispatch or store questions", async () => {
  const f = await setup(); let calls = 0;
  const job = await executeGenerationJob({ userId: access.userId, access, id: f.job.id }, { repo: f.repo, env, prepare: context, signal: AbortSignal.abort(),
    complete: async () => { calls++; throw Error("Must not dispatch"); }, store: async () => { throw Error("Must not store"); } });
  assert.equal(job.state, "failed"); assert.equal(calls, 0);
});
test("reservation budget failure is returned without invoking generation", async () => {
  const d = confirmed();
  await assert.rejects(reserveGenerationJob({ userId: access.userId, access, token: d.token }, { env, draftOptions: options,
    repo: async () => { throw Object.assign(Error("Budget exhausted"), { status: 429 }); } }), { status: 429 });
});
test("committed storage with lost acknowledgement reconciles without regeneration", async () => {
  const f = await setup(), ai = mockComplete();
  const deps = { repo: f.repo, env, prepare: context, complete: ai.complete, store: async () => { f.save(); throw Error("Unknown storage ack"); } };
  assert.equal((await executeGenerationJob({ userId: access.userId, access, id: f.job.id }, deps)).state, "ready");
  await executeGenerationJob({ userId: access.userId, access, id: f.job.id }, deps);
  assert.equal(ai.count(), 3);
});
test("job DTO never returns internal tokens, questions or owner fields", () => {
  const dto = publicJob({ id: randomUUID(), state: "held", configuration, execution_token: "secret", questions: [{ correctAnswer: 0 }], owner_id: "private" });
  assert.doesNotMatch(JSON.stringify(dto), /secret|correctAnswer|owner_id|configuration/);
});
test("client status polling is read-only and surfaces safe HTTP failures", async () => {
  const job = await generationJobRequest("/synthetic", undefined, async (_, options) => { assert.equal(options.method, "GET"); assert.equal(options.cache, "no-store"); return Response.json({ job: { state: "held" } }); });
  assert.equal(job.state, "held");
  await assert.rejects(generationJobRequest("", undefined, async () => Response.json({ error: "Budget unavailable" }, { status: 429 })), { status: 429 });
});
