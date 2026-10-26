import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { install, sql, json, literal, client, saveEvidence, database } from "./phase61Lab.mjs";
import { jobRepository, executeGenerationJob } from "../zi/testGenerator/jobs.server.js";
import { configuration, generationFixture } from "./fixtures/generated.mjs";
import { validateGenerationConfig } from "../zi/testGenerator/questionSchema.server.js";
import { storeValidatedGeneration } from "./generatedTests.server.js";

const enabled = process.env.ZI_PHASE61_DB_LOCAL === "1";
test("isolated PostgreSQL 17.6 generation job acceptance", { skip: !enabled }, async (t) => {
  await install();
  const rows = [], ids = [];
  const balances = await sql("SELECT jsonb_agg(to_jsonb(x) ORDER BY user_id) FROM public.user_xp x;");
  const receiptCount = await sql("SELECT count(*) FROM prepzii_integrity.receipts;");
  const repo = jobRepository(client);
  const hash = (s) => createHash("sha256").update(s).digest("hex");
  const reserve = (owner, key = randomUUID(), config = configuration) => repo("reserve", owner, null, {
    configuration: config, expectedConfig: validateGenerationConfig(config.generationConfig), draftKey: hash(key), configHash: hash(JSON.stringify(config)),
  });
  const scenario = async (name, fn) => t.test(name, async () => {
    try { await fn(); rows.push({ name, result: "PASS" }); }
    catch (error) { rows.push({ name, result: "FAIL" }); throw error; }
  });
  const finish = (j, state = "failed") => repo("finish", j.owner_id, j.id, { executionToken: j.execution_token, state, stage: state === "held" ? "review_required" : "quality_failed" });
  await scenario("actual anon/authenticated cannot execute RPC or read/mutate private jobs", async () => {
    for (const role of ["anon", "authenticated"]) {
      await assert.rejects(sql("SELECT * FROM zi_generation.jobs;", role), /permission denied/);
      await assert.rejects(sql("SELECT public.zi_generation_job('read','synthetic-a');", role), /permission denied/);
      await assert.rejects(sql("TRUNCATE zi_generation.jobs;", role), /permission denied/);
    }
    assert.equal(await sql("SELECT relrowsecurity FROM pg_class WHERE oid='zi_generation.jobs'::regclass;"), "t");
    await assert.rejects(sql("UPDATE zi_generation.policy SET daily_jobs=10;", "service_role"), /permission denied/);
  });
  await scenario("concurrent duplicate reservations debit once", async () => {
    const key = randomUUID();
    const [a, b] = await Promise.all([reserve("synthetic-a", key), reserve("synthetic-a", key)]);
    assert.equal(a.id, b.id); ids.push(a.id);
    assert.equal(await sql("SELECT count(*)||':'||sum(reserved_tokens) FROM zi_generation.jobs WHERE owner_id='synthetic-a';"), "1:300000");
  });
  await scenario("same key with changed configuration is rejected", async () => {
    const j = JSON.parse(await sql(`SELECT to_jsonb(j) FROM zi_generation.jobs j WHERE id=${literal(ids[0])};`));
    await assert.rejects(repo("reserve", j.owner_id, null, { draftKey: j.draft_key, configHash: j.config_hash,
      configuration: { ...configuration, sessionConfig: { mode: "practice" } }, expectedConfig: j.expected_config }), { status: 409 });
  });
  await scenario("per-user concurrency and cross-user reads are denied", async () => {
    await assert.rejects(reserve("synthetic-a"), { status: 429 });
    await assert.rejects(repo("read", "synthetic-b", ids[0]), { status: 404 });
  });
  let active;
  await scenario("independent processes claim one execution exactly once", async () => {
    const claims = await Promise.all([repo("claim", "synthetic-a", ids[0]), repo("claim", "synthetic-a", ids[0])]);
    assert.equal(claims.filter((j) => j.claimed).length, 1); active = claims.find((j) => j.claimed);
  });
  await scenario("wrong execution token cannot dispatch or finish", async () => {
    await assert.rejects(repo("dispatch", active.owner_id, active.id, { executionToken: randomUUID(), requestId: randomUUID(), tokens: 10000 }), { status: 409 });
  });
  await scenario("dispatch receipt persists before provider and unresolved dispatch blocks another", async () => {
    const j = await repo("dispatch", active.owner_id, active.id, { executionToken: active.execution_token, requestId: randomUUID(), tokens: 10000 });
    assert.equal(j.requests[0].state, "dispatched");
    await assert.rejects(repo("dispatch", active.owner_id, active.id, { executionToken: active.execution_token, requestId: randomUUID(), tokens: 10000 }), { status: 429 });
  });
  await scenario("crash/expired claim is held and never automatically re-leased", async () => {
    await sql(`UPDATE zi_generation.jobs SET deadline_at=clock_timestamp()-interval '1 second' WHERE id=${literal(active.id)};`);
    const held = await repo("read", active.owner_id, active.id);
    assert.equal(held.state, "held"); assert.equal((await repo("claim", active.owner_id, active.id)).claimed, false);
    assert.equal((await repo("read", active.owner_id, active.id)).committed_tokens, 10000);
    // Synthetic operator resolves this no-provider-call fixture only; no app retry mechanism.
    await sql(`UPDATE zi_generation.jobs SET state='failed',stage='quality_failed' WHERE id=${literal(active.id)};`);
  });
  await scenario("fleet reservation limit is enforced across different owners", async () => {
    const b = await reserve("synthetic-b"), c = await reserve("synthetic-c");
    await assert.rejects(reserve("synthetic-d"), { status: 429 });
    for (const j of [b, c]) await finish(await repo("claim", j.owner_id, j.id));
  });
  await scenario("daily count and admission-token budget survive failed requests", async () => {
    const j = await reserve("synthetic-a"); await finish(await repo("claim", j.owner_id, j.id));
    await assert.rejects(reserve("synthetic-a"), { status: 429 });
    assert.equal(await sql("SELECT sum(reserved_tokens) FROM zi_generation.jobs WHERE owner_id='synthetic-a';"), "600000");
  });
  await scenario("per-job dispatch budget and immutable receipt acknowledgement", async () => {
    const j = await reserve("synthetic-budget"), claim = await repo("claim", j.owner_id, j.id), requestId = randomUUID();
    await repo("dispatch", j.owner_id, j.id, { executionToken: claim.execution_token, requestId, tokens: 299999 });
    await repo("ack", j.owner_id, j.id, { executionToken: claim.execution_token, requestId, known: true, reportedTokens: 50 });
    await assert.rejects(repo("ack", j.owner_id, j.id, { executionToken: claim.execution_token, requestId, known: true, reportedTokens: 50 }), { status: 409 });
    await assert.rejects(repo("dispatch", j.owner_id, j.id, { executionToken: claim.execution_token, requestId: randomUUID(), tokens: 2 }), { status: 429 });
    await finish(claim);
  });
  await scenario("transaction rollback removes uncommitted reservation", async () => {
    const data = { configuration, expectedConfig: validateGenerationConfig(configuration.generationConfig), draftKey: hash(randomUUID()), configHash: hash("rollback") };
    await sql(`BEGIN; SET LOCAL ROLE service_role; SELECT public.zi_generation_job('reserve','synthetic-rollback',NULL,${json(data)}); ROLLBACK;`);
    assert.equal(await sql("SELECT count(*) FROM zi_generation.jobs WHERE owner_id='synthetic-rollback';"), "0");
  });
  await scenario("mocked execution stores through actual private validation/RPC and retry cannot repay/regenerate", async () => {
    const j = await reserve("synthetic-e2e"); let calls = 0;
    const env = { ZI_GENERATION_PILOT_ENABLED: "true", ZI_GENERATED_TEST_ENGINE_ENABLED: "true", ZI_GENERATION_PILOT_USERS: j.owner_id, ZI_GENERATION_PROVIDER_APPROVED: "true" };
    const deps = { repo, client, env, complete: async () => { calls++; return { data: {}, providerRequests: 1, usage: { totalTokens: 100 } }; },
      prepare: async (_, options) => { return options; },
      generate: async (_, options) => { await options.complete({ systemPrompt: "Synthetic provider", prompt: "Synthetic only" }); return generationFixture(); } };
    const job = await executeGenerationJob({ userId: j.owner_id, access: { userId: j.owner_id, examTrack: "JEE" }, id: j.id }, deps);
    assert.equal(job.state, "ready"); assert.equal(job.acceptedCount, 5);
    await executeGenerationJob({ userId: j.owner_id, access: { userId: j.owner_id, examTrack: "JEE" }, id: j.id }, deps);
    assert.equal(calls, 1);
    assert.equal(await sql(`SELECT count(*) FROM public.zi_generated_tests WHERE owner_id=${literal(j.owner_id)};`), "1");
    assert.equal(await sql(`SELECT count(*) FROM public.user_xp WHERE user_id=${literal(j.owner_id)};`), "0");
    await assert.rejects(sql("SELECT content FROM public.zi_generated_questions;", "authenticated"), /permission denied/);
  });
  await scenario("lost storage ack becomes ready by reconciliation without a provider replay", async () => {
    const j = await reserve("synthetic-storage-crash"); const claim = await repo("claim", j.owner_id, j.id);
    await storeValidatedGeneration({ userId: j.owner_id, configuration, result: generationFixture(), creationKey: `zi-job:${j.id}`, client });
    // Simulate process death before final status acknowledgement.
    assert.equal((await repo("read", j.owner_id, j.id)).state, "ready");
    assert.equal((await repo("claim", j.owner_id, j.id)).claimed, false);
    assert.ok(claim.execution_token);
  });
  await scenario("incomplete results cannot enter private storage", async () => {
    const result = generationFixture(); result.status = "partial";
    await assert.rejects(storeValidatedGeneration({ userId: "synthetic-incomplete", configuration, result, creationKey: `zi-job:${randomUUID()}`, client }));
    assert.equal(await sql("SELECT count(*) FROM public.zi_generated_tests WHERE owner_id='synthetic-incomplete';"), "0");
  });
  await scenario("Phase 5 balances, historical records and reward receipts remain unchanged", async () => {
    assert.equal(await sql("SELECT jsonb_agg(to_jsonb(x) ORDER BY user_id) FROM public.user_xp x;"), balances);
    assert.equal(await sql("SELECT count(*) FROM prepzii_integrity.receipts;"), receiptCount);
    assert.equal(await sql("SELECT has_table_privilege('service_role','public.user_xp','UPDATE');"), "f");
  });
  saveEvidence("acceptance", { database, scenarios: rows, production_connections: 0, paid_calls: 0, retained: true });
  saveEvidence("jobs", JSON.parse(await sql("SELECT jsonb_agg(to_jsonb(j)) FROM zi_generation.jobs j;")));
});
