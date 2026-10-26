import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { generationPilotAllowed } from "./jobPolicy.js";
import { confirmedGenerationDraft } from "./builder.server.js";
import { validateGenerationConfig } from "./questionSchema.server.js";
import { prepareQuestionGenerationContext } from "./generationContext.server.js";
import { analyzePYQPatterns } from "./analysis.server.js";
import { generateAIQuestions } from "./generation.server.js";
import { completeZiQuestionTask } from "../provider.js";
import { storeValidatedGeneration } from "../../tests/generatedTests.server.js";
import { BLIND_SOLVE_PROMPT, AUDIT_QUESTIONS_PROMPT } from "./questionPrompts.server.js";

export const ReserveJobRequest = z.object({ token: z.string().min(1).max(4096) }).strict();
export const JobId = z.string().uuid();
export class GenerationJobError extends Error {
  constructor(message, status = 503) { super(message); this.status = status; }
}
export function assertPilot(userId, env = process.env) {
  if (!userId) throw new GenerationJobError("Please sign in again.", 401);
  if (!generationPilotAllowed(userId, env)) throw new GenerationJobError("AI generation remains unavailable.", 403);
}
export function publicJob(j) {
  return { id: j.id, state: j.state, stage: j.stage, acceptedCount: j.accepted,
    requestedCount: j.configuration.generationConfig.questionCount, createdAt: j.created_at,
    retrySafe: j.state === "reserved",
    ...(j.state === "ready" ? { startRoute: `/test/session?sourceType=AI_GENERATED&generatedTestId=${j.test_id}` } : {}),
    ...(j.state === "held" ? { message: "Execution requires reconciliation. No automatic generation retry will be made." } : {}),
    ...(j.state === "failed" ? { message: "A complete verified test could not be produced. No test was released." } : {}) };
}
export function jobRepository(client) {
  return async (op, owner, id = null, data = {}) => {
    const { data: result, error } = await client.rpc("zi_generation_job", { p_op: op, p_owner: owner, p_id: id, p_data: data });
    if (error) {
      const status = error.code === "P0002" ? 404 : error.code === "40001" ? 409 : error.code === "P0001" ? 429 : 503;
      throw new GenerationJobError(status === 404 ? "Job not found." : status === 429 ? "Generation budget or capacity is unavailable." : "Generation state could not be confirmed. Resume status before retrying.", status);
    }
    if (!result?.id || result.owner_id !== owner) throw new GenerationJobError("Generation state could not be confirmed.");
    return result;
  };
}
export async function reserveGenerationJob({ userId, access, token }, { repo, env = process.env, draftOptions } = {}) {
  assertPilot(userId, env);
  const { configuration, draftKey } = confirmedGenerationDraft({ userId, access, token }, draftOptions);
  const expectedConfig = validateGenerationConfig(configuration.generationConfig);
  const configHash = createHash("sha256").update(JSON.stringify(configuration)).digest("hex");
  return publicJob(await repo("reserve", userId, null, { configuration, draftKey, configHash, expectedConfig }));
}
export async function readGenerationJob({ userId, id = null }, { repo, env = process.env } = {}) {
  assertPilot(userId, env);
  if (id !== null) JobId.parse(id);
  return publicJob(await repo("read", userId, id));
}

// A single, awaited, bounded invocation. No detached promises, automatic job
// replay, or inference inside chat. Expired claims are held, never re-leased.
export async function executeGenerationJob({ userId, access, id }, {
  repo, client, env = process.env, complete = completeZiQuestionTask,
  prepare = prepareQuestionGenerationContext, generate = generateAIQuestions,
  store = storeValidatedGeneration, signal = AbortSignal.timeout(240000),
} = {}) {
  assertPilot(userId, env); JobId.parse(id);
  // Independent approval gate: deploying the dormant routes cannot cause paid calls.
  if (env.ZI_GENERATION_PROVIDER_APPROVED !== "true") throw new GenerationJobError("Provider execution has not been approved.", 403);
  const existing = await repo("read", userId, id);
  const track = existing.configuration.generationConfig.exam === "NEET" ? "NEET" : "JEE";
  if (access?.userId !== userId || (!access.isPlatformAdmin && ![access.examTrack, ...(access.proTracks || [])].includes(track))) {
    throw new GenerationJobError("Exam access is unavailable.", 403);
  }
  const job = await repo("claim", userId, id);
  if (!job.claimed) return publicJob(job);
  const controller = new AbortController();
  const boundedSignal = AbortSignal.any([signal, controller.signal]);
  let uncertain = false, quota = false, accepted = 0, analyzing = true;
  const mutate = (op, data) => repo(op, userId, id, { executionToken: job.execution_token, ...data });
  const progress = async (stage) => { await mutate("progress", { stage, accepted }); };
  const trackedComplete = async (request) => {
    boundedSignal.throwIfAborted();
    await progress(analyzing ? "analysis" : request.systemPrompt === BLIND_SOLVE_PROMPT ? "blind" : request.systemPrompt === AUDIT_QUESTIONS_PROMPT ? "audit" : "generation");
    const requestId = randomUUID();
    // Full UTF-8 bytes plus bounded output, no refund of unused reservation.
    const tokens = Buffer.byteLength(request.prompt + request.systemPrompt, "utf8") + 8000;
    await mutate("dispatch", { requestId, tokens });
    uncertain = true; // Durable dispatch precedes the external side effect.
    try {
      const response = await complete({ ...request, signal: boundedSignal, maxAttempts: 1 });
      const usage = response.usage;
      const known = response.providerRequests === 1 && Number.isSafeInteger(usage?.totalTokens) && usage.totalTokens > 0 && usage.totalTokens <= tokens;
      await mutate("ack", { requestId, known, reportedTokens: Number.isSafeInteger(usage?.totalTokens) ? Math.min(usage.totalTokens, 2147483647) : null });
      if (!known) throw new Error("Provider outcome or usage is unknown");
      uncertain = false;
      return response;
    } catch (error) {
      quota = error.providerStatus === 429;
      controller.abort(); // Even malformed output cannot trigger another dispatch.
      throw error;
    }
  };
  try {
    const context = await prepare(job.configuration.generationConfig, { client, signal: boundedSignal,
      analyze: (scope, options) => analyzePYQPatterns(scope, { ...options, useCache: false, complete: trackedComplete }) });
    analyzing = false;
    await progress("generation");
    const result = await generate(job.configuration.generationConfig, { client, context, signal: boundedSignal, complete: trackedComplete,
      onProgress: (p) => { accepted = p.acceptedCount; } });
    accepted = Number.isInteger(result.acceptedCount) ? result.acceptedCount : accepted;
    boundedSignal.throwIfAborted();
    if (uncertain || result.status !== "complete") {
      await mutate("finish", { state: uncertain ? "held" : "failed", stage: quota ? "quota_blocked" : uncertain ? "review_required" : "quality_failed" });
    } else {
      await progress("storage");
      uncertain = true;
      await store({ userId, configuration: job.configuration, result, creationKey: `zi-job:${id}`, client });
      // Read reconciles a committed storage transaction, including lost acks.
    }
  } catch {
    // No raw provider errors/prompts/answers in a public response or log.
    try { await mutate("finish", { state: uncertain ? "held" : "failed", stage: quota ? "quota_blocked" : uncertain ? "review_required" : "quality_failed" }); }
    catch { /* A lost DB acknowledgement is recovered by read; never rerun. */ }
  }
  return publicJob(await repo("read", userId, id));
}
