import "server-only";
import { z } from "zod";
import { sessionQuestion, generatedReviewQuestion, AI_SOURCE } from "./questionSource.server.js";
import { validateGenerationConfig, QUESTION_VALIDATION_VERSION } from "../zi/testGenerator/questionSchema.server.js";
import { validateQuestionStructure, validateQuestionAnswer } from "../zi/testGenerator/questionValidation.server.js";
import { confirmedGenerationConfiguration } from "../zi/testGenerator/builder.server.js";
import { checkQuestionOriginality } from "../zi/testGenerator/originality.server.js";

const Id = z.uuid();
export const GeneratedStart = z.object({ sourceType: z.literal(AI_SOURCE), generatedTestId: Id }).strict();
export const GeneratedAnswerRequest = z.object({ sourceType: z.literal(AI_SOURCE), sessionId: Id, revision: z.number().int().min(0),
  answers: z.record(Id, z.union([z.number().int().min(0).max(3), z.null()])).refine((a) => Object.keys(a).length <= 30) }).strict();
export class GeneratedTestError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function generatedEngineEnabled(env = process.env) { return env.ZI_GENERATED_TEST_ENGINE_ENABLED === "true"; }
export function assertGeneratedEngineEnabled(env = process.env) {
  if (!generatedEngineEnabled(env)) throw new GeneratedTestError("AI practice tests are not available yet. Database migration and security verification must be approved first.", 503);
}
function validateIdentity(userId, id) {
  if (!userId) throw new GeneratedTestError("Unauthorized", 401);
  if (!Id.safeParse(id).success) throw new GeneratedTestError("Invalid test identifier.");
}
async function rpc(client, name, args) {
  const { data, error } = await client.rpc(name, args);
  if (error) {
    const status = error.code === "P0002" ? 404 : error.code === "40001" ? 409 : error.code === "22023" ? 400 : 503;
    throw new GeneratedTestError(status === 404 ? "Test not found." : status === 409 ? "This test changed in another tab. Reload to resume your saved answers." : status === 400 ? "Invalid test or answers." : "AI practice-test storage is unavailable.", status);
  }
  return data;
}
async function ownedTest(client, userId, testId) {
  const { data, error } = await client.from("zi_generated_tests").select("*").eq("id", testId).eq("owner_id", userId).maybeSingle();
  if (error) throw new GeneratedTestError("AI practice-test storage is unavailable.", 503);
  if (!data) throw new GeneratedTestError("Test not found.", 404);
  return data;
}
async function questionsFor(client, testId) {
  const { data, error } = await client.from("zi_generated_questions").select("id, question_order, content").eq("test_id", testId).order("question_order", { ascending: true }).limit(30);
  if (error) throw new GeneratedTestError("Could not load the private test.", 503);
  return data || [];
}
async function ownedSession(client, userId, id) {
  validateIdentity(userId, id);
  const { data, error } = await client.from("zi_generated_sessions").select("*").eq("session_id", id).eq("owner_id", userId).maybeSingle();
  if (error) throw new GeneratedTestError("AI practice-test storage is unavailable.", 503);
  if (!data) throw new GeneratedTestError("Test not found.", 404);
  return data;
}
export async function startGeneratedTest({ userId, testId, client }) {
  validateIdentity(userId, testId);
  const s = await rpc(client, "zi_start_generated_test", { p_owner: userId, p_test: testId });
  if (s.submitted_at) return { sourceType: AI_SOURCE, submitted: true, attemptId: s.session_id };
  const test = await ownedTest(client, userId, testId);
  const questions = await questionsFor(client, testId);
  if (test.validation_version !== QUESTION_VALIDATION_VERSION || questions.length !== test.question_count) throw new GeneratedTestError("This test is incomplete or requires revalidation.", 409);
  return { sourceType: AI_SOURCE, track: test.config.exam, sessionId: s.session_id, testId, mode: test.mode,
    durationMinutes: test.duration_minutes, startedAt: s.started_at, deadlineAt: s.deadline_at,
    revision: s.revision, answers: s.answers, serverNow: s.server_now,
    questions: questions.map((row) => sessionQuestion({ ...row.content, id: row.id }, AI_SOURCE)) };
}
export async function saveGeneratedAnswers({ userId, request, client }) {
  if (!userId) throw new GeneratedTestError("Unauthorized", 401);
  const parsed = GeneratedAnswerRequest.safeParse(request);
  if (!parsed.success) throw new GeneratedTestError("Invalid answers.");
  return rpc(client, "zi_save_generated_answers", { p_owner: userId, p_session: parsed.data.sessionId, p_revision: parsed.data.revision, p_answers: parsed.data.answers });
}
export async function submitGeneratedTest({ userId, request, client }) {
  if (!userId) throw new GeneratedTestError("Unauthorized", 401);
  const parsed = GeneratedAnswerRequest.safeParse(request);
  if (!parsed.success) throw new GeneratedTestError("Invalid answers.");
  const result = await rpc(client, "zi_submit_generated_test", { p_owner: userId, p_session: parsed.data.sessionId, p_revision: parsed.data.revision, p_answers: parsed.data.answers });
  return { attemptId: result.attemptId, sourceType: AI_SOURCE };
}
export async function generatedResult({ userId, sessionId, client, review = false }) {
  const session = await ownedSession(client, userId, sessionId);
  if (!session.submitted_at || !session.result) throw new GeneratedTestError("Submit this test before viewing solutions.", 409);
  if (!review) return session.result;
  const questions = await questionsFor(client, session.test_id);
  return { sourceType: AI_SOURCE, answers: questions.map((row) => generatedReviewQuestion(row, session.answers[row.id])) };
}

/** Trusted worker handoff only: NO student-facing route accepts generated output.
 * The Phase 3 generator is deliberately not invoked anywhere in this phase. */
export async function storeValidatedGeneration({ userId, configuration, result, creationKey, client }) {
  if (!userId) throw new GeneratedTestError("Unauthorized", 401);
  const config = validateGenerationConfig(configuration.generationConfig);
  const mode = configuration.sessionConfig?.mode;
  const duration = configuration.sessionConfig?.durationMinutes ?? null;
  if (!["timed", "practice"].includes(mode) || (mode === "timed" && (!Number.isInteger(duration) || duration < 5 || duration > 180)) || (mode === "practice" && duration !== null)) throw new GeneratedTestError("Invalid session configuration.");
  if (typeof creationKey !== "string" || creationKey.length < 16 || creationKey.length > 200) throw new GeneratedTestError("A durable creation key is required.");
  if (result?.status !== "complete" || result.validationVersion !== QUESTION_VALIDATION_VERSION || result.requestedCount !== config.questionCount || result.acceptedCount !== config.questionCount || result.questions?.length !== config.questionCount || !result.provenance?.referencePYQIds?.length) throw new GeneratedTestError("Only a complete, validated generation can be saved. Partial results require a newly confirmed smaller configuration.");
  const ids = new Set();
  const checked = [];
  for (const q of result.questions) {
    const v = q.validation;
    const candidate = Object.fromEntries(Object.entries(q).filter(([key]) => !["id", "validation"].includes(key)));
    let valid = false;
    try { valid = validateQuestionStructure(candidate, config).passed && validateQuestionAnswer(q, v?.blindSolution, v?.audit).passed; } catch { /* Fail closed on incomplete evidence. */ }
    if (!q.id || ids.has(q.id) || !checkQuestionOriginality(q, checked).passed || v?.status !== "passed_implemented_checks" || v.validationVersion !== QUESTION_VALIDATION_VERSION || !v.referencePYQIds?.length || !v.referencePYQIds.every((id) => result.provenance.referencePYQIds.includes(id)) || !valid) throw new GeneratedTestError("A question failed revalidation before storage.");
    ids.add(q.id);
    checked.push(q);
  }
  const testId = await rpc(client, "zi_store_generated_test", { p_owner: userId, p_key: creationKey, p_config: config,
    p_mode: mode, p_duration: duration, p_version: QUESTION_VALIDATION_VERSION, p_questions: result.questions });
  if (!Id.safeParse(testId).success) throw new GeneratedTestError("Could not confirm that the test was saved.", 503);
  return { testId, sourceType: AI_SOURCE, status: "saved", startRoute: `/test/session?sourceType=${AI_SOURCE}&generatedTestId=${testId}` };
}
export async function storeGenerationForConfirmedDraft({ userId, access, token, result, creationKey, client }) {
  const configuration = confirmedGenerationConfiguration({ userId, access, token });
  return storeValidatedGeneration({ userId, configuration, result, creationKey, client });
}
