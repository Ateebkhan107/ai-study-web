import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { completeZiQuestionTask } from "../provider.js";
import { assertGenerationContext, prepareQuestionGenerationContext } from "./generationContext.server.js";
import { validateGenerationConfig, BlindBatchSchema, AuditBatchSchema, BLIND_JSON_SCHEMA, AUDIT_JSON_SCHEMA, QUESTION_VALIDATION_VERSION, MAX_GENERATION_BATCH_SIZE, generationResponseSchema } from "./questionSchema.server.js";
import { validateQuestionStructure, validateQuestionAnswer } from "./questionValidation.server.js";
import { verifyNumericalQuestion, parseNumericOption } from "./numericalValidation.server.js";
import { checkQuestionOriginality } from "./originality.server.js";
import { serializeStudentQuestion } from "./questionSerializers.server.js";
import { AUDIT_QUESTIONS_PROMPT, patternPromptContext, questionTaskInstructions } from "./questionPrompts.server.js";

const Envelope = z.object({ questions: z.array(z.unknown()).min(1).max(MAX_GENERATION_BATCH_SIZE) }).strict();
const MAX_PROMPT_CHARS = 80000;
const LIMITATIONS = [
  "Passing the implemented checks is not proof of scientific correctness or guaranteed originality. Blind solve and audit use the same AI provider in separate calls.",
  "Deterministic numerical coverage is limited to the fixed rotational-physics catalog and supported numeric SI options. Other unresolved calculations are rejected.",
  "Originality comparison covers the retrieved sample and this generation run, not every published question. Historical PYQs do not certify current syllabus inclusion.",
];

function verificationMap(schema, data, questions, key) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) return null;
  const items = parsed.data[key];
  const expected = new Set(questions.map((q) => q.id));
  if (items.length !== expected.size || new Set(items.map((q) => q.id)).size !== expected.size || items.some((q) => !expected.has(q.id))) return null;
  return new Map(items.map((q) => [q.id, q]));
}

export async function generateAIQuestions(input, { context, client, signal, complete = completeZiQuestionTask, onProgress } = {}) {
  let config;
  try { config = validateGenerationConfig(input); }
  catch (error) { return { status: "error", code: error.code === "UNSUPPORTED_EXAM" ? error.code : "INVALID_CONFIGURATION", requestedCount: Number.isInteger(input?.questionCount) ? input.questionCount : 0, acceptedCount: 0, questions: [], message: "Choose a valid JEE Main or NEET configuration with 5–30 questions." }; }
  const overall = AbortSignal.timeout(Math.min(600000, 180000 + config.questionCount * 6000));
  const combinedSignal = signal ? AbortSignal.any([signal, overall]) : overall;
  const questions = [];
  const rejected = [];
  const diagnostics = [];
  const proposed = [];
  const candidateIds = new Set();
  const maxBatches = Math.ceil(config.questionCount / MAX_GENERATION_BATCH_SIZE) + 2;
  const metrics = { generatedCount: 0, acceptedCount: 0, rejectedCount: 0, generationCalls: 0, blindSolveCalls: 0, auditCalls: 0, providerRequests: 0, estimatedInputTokens: 0, usageReportedRequests: 0, patternAnalysisRequests: 0, patternAnalysisTokens: 0, patternAnalysisEstimatedInputTokens: 0, totalTokens: 0, inputTokens: 0, outputTokens: 0, batches: 0, maxBatches, maxTokens: Math.min(300000, 30000 + config.questionCount * 10000), models: [] };
  let fatalCode = null;
  const reject = (code, id = null, stage = "validation", details = {}) => rejected.push({ code, id, stage, ...details });
  const progress = (stage) => { try { onProgress?.({ stage, acceptedCount: questions.length, rejectedCount: rejected.length, metrics: structuredClone(metrics) }); } catch { /* Telemetry cannot change validation outcomes. */ } };
  const diagnostic = (error, stage) => {
    const known = ["ZI_PROVIDER_NOT_CONFIGURED", "ZI_ANALYSIS_INVALID_JSON", "ZI_ANALYSIS_INCOMPLETE", "ZI_ANALYSIS_ABORTED", "ZI_ANALYSIS_PROVIDER_ERROR", "PYQ_RETRIEVAL_ABORTED", "PYQ_RETRIEVAL_FAILED", "PYQ_ANALYSIS_FAILED", "GENERATION_CONTEXT_MISMATCH", "INVALID_GENERATION_CONTEXT", "TOKEN_BUDGET_REACHED", "PROMPT_BUDGET_REACHED"];
    diagnostics.push({ stage, reasonCode: known.includes(error.code) ? error.code : "OPERATION_FAILED", ...(Number.isInteger(error.providerStatus) ? { providerStatus: error.providerStatus } : {}), ...(error.providerDiagnostic ? { providerDiagnostic: error.providerDiagnostic } : {}) });
  };
  async function call(stage, systemPrompt, payload, responseJsonSchema) {
    combinedSignal.throwIfAborted();
    if (metrics.totalTokens + metrics.patternAnalysisTokens >= metrics.maxTokens) throw Object.assign(new Error("Token budget reached."), { code: "TOKEN_BUDGET_REACHED" });
    const prompt = JSON.stringify(payload);
    if (prompt.length > MAX_PROMPT_CHARS) throw Object.assign(new Error("Prompt budget reached."), { code: "PROMPT_BUDGET_REACHED" });
    if (metrics.totalTokens + metrics.patternAnalysisTokens + Math.ceil((prompt.length + systemPrompt.length) / 3) + 8000 > metrics.maxTokens) throw Object.assign(new Error("Token budget reached."), { code: "TOKEN_BUDGET_REACHED" });
    metrics[stage] += 1;
    let accounted = false;
    try {
      const response = await complete({ systemPrompt, prompt, responseJsonSchema, signal: combinedSignal });
      metrics.providerRequests += response.providerRequests ?? 1;
      metrics.estimatedInputTokens += Math.ceil((prompt.length + systemPrompt.length) / 3) * (response.providerRequests ?? 1);
      if (response.usage?.totalTokens > 0) metrics.usageReportedRequests += 1;
      accounted = true;
      for (const key of ["totalTokens", "inputTokens", "outputTokens"]) metrics[key] += response.usage?.[key] || 0;
      if (response.model && !metrics.models.includes(response.model)) metrics.models.push(response.model);
      combinedSignal.throwIfAborted();
      if (metrics.totalTokens + metrics.patternAnalysisTokens > metrics.maxTokens) throw Object.assign(new Error("Token budget reached."), { code: "TOKEN_BUDGET_REACHED" });
      progress(stage);
      return response.data;
    } catch (error) {
      // Incomplete/malformed provider output is eligible for bounded regeneration;
      // configuration, quota and persistent availability failures end the run.
      if (!accounted) {
        metrics.providerRequests += error.providerRequests ?? 1;
        metrics.estimatedInputTokens += Math.ceil((prompt.length + systemPrompt.length) / 3) * (error.providerRequests ?? 1);
      }
      throw error;
    }
  }
  try {
    context ||= await prepareQuestionGenerationContext(input, { client, signal: combinedSignal, onProviderUsage: (event) => {
      metrics.patternAnalysisRequests += event.providerRequests;
      metrics.patternAnalysisTokens += event.usage.totalTokens;
      metrics.patternAnalysisEstimatedInputTokens += event.estimatedInputTokens;
    } });
    assertGenerationContext(context, config);
    if (!["analyzed", "limited_references"].includes(context.analysis.status)) return {
      status: "insufficient_references", code: "INSUFFICIENT_PYQ_REFERENCES", requestedCount: config.questionCount, acceptedCount: 0, questions: [],
      message: "Suitable verified PYQ pattern analysis is unavailable. No questions were generated.",
      limitations: context.analysis.coverageLimitations, metrics,
    };
    const patterns = patternPromptContext(context.analysis);
    const references = context.references.map(({ id, statement, options }) => ({ id, statement, options }));
    for (let batch = 0; batch < maxBatches && questions.length < config.questionCount; batch += 1) {
      metrics.batches += 1;
      const count = Math.min(MAX_GENERATION_BATCH_SIZE, config.questionCount - questions.length);
      const difficulties = Array.from({ length: count }, (_, i) => config.difficulty === "Mixed" ? ["Easy", "Medium", "Hard"][(questions.length + i) % 3] : config.difficulty);
      try {
        const generated = await call("generationCalls", questionTaskInstructions(config, "generation"), {
          configuration: config, count, targetDifficulties: difficulties, patterns,
          previouslyProposedScenarios: proposed.map((q) => ({ id: q.id, statement: q.statement.slice(0, 600) })),
          previousRejections: rejected.slice(-10).map(({ code, field, detail }) => ({ code, field, detail })),
        }, generationResponseSchema(config, difficulties));
        const envelope = Envelope.safeParse(generated);
        if (!envelope.success || envelope.data.questions.length > count) { reject("MALFORMED_GENERATION_RESPONSE", null, "structure"); continue; }
        const candidates = [];
        metrics.generatedCount += envelope.data.questions.length;
        for (const [index, raw] of envelope.data.questions.entries()) {
          const candidateId = randomUUID();
          candidateIds.add(candidateId);
          const structural = validateQuestionStructure(raw, config);
          if (!structural.passed) { reject(structural.code, candidateId, "structure", structural.field ? { field: structural.field, detail: structural.detail } : {}); continue; }
          if (structural.question.difficulty !== difficulties[index]) { reject("DIFFICULTY_MISMATCH", candidateId, "structure"); continue; }
          const question = { ...structural.question, id: candidateId };
          const originality = checkQuestionOriginality(question, [...references, ...proposed]);
          proposed.push(question);
          if (!originality.passed) { reject(originality.code, question.id, "originality"); continue; }
          candidates.push(question);
        }
        if (!candidates.length) continue;
        const blindData = await call("blindSolveCalls", questionTaskInstructions(config, "blind"), { configuration: config, questions: candidates.map(serializeStudentQuestion) }, BLIND_JSON_SCHEMA);
        const blind = verificationMap(BlindBatchSchema, blindData, candidates, "solutions");
        if (!blind) { candidates.forEach((q) => reject("INVALID_BLIND_VERIFICATION", q.id, "answer")); continue; }
        const auditable = candidates.filter((q) => {
          const solution = blind.get(q.id);
          if (solution.correctOptions.length !== 1 || solution.correctOptions[0] !== q.correctAnswer) { reject("ANSWER_DISAGREEMENT_OR_AMBIGUITY", q.id, "answer"); return false; }
          if (!solution.scientificallySound || !solution.sufficientInformation || solution.uncertainties.length) { reject("UNRESOLVED_SCIENTIFIC_UNCERTAINTY", q.id, "answer"); return false; }
          if (solution.requiresCalculation || q.options.every(parseNumericOption)) {
            const deterministic = verifyNumericalQuestion(q, solution.calculation);
            if (!deterministic.passed) { reject(deterministic.code, q.id, "numerical"); return false; }
            const minimumSteps = q.difficulty === "Hard" ? 3 : q.difficulty === "Medium" ? 2 : 1;
            if (deterministic.substantiveSteps < minimumSteps) { reject("EXAM_LEVEL_COMPLEXITY_TOO_LOW", q.id, "numerical"); return false; }
          }
          return true;
        });
        if (!auditable.length) continue;
        const ids = new Set(auditable.map((q) => q.id));
        const auditData = await call("auditCalls", AUDIT_QUESTIONS_PROMPT, {
          configuration: config, questions: auditable,
          blindSolutions: auditable.map((q) => blind.get(q.id)), officialReferenceComparisons: references,
          otherCandidateComparisons: proposed.filter((q) => !ids.has(q.id)).map(({ id, statement, options }) => ({ id, statement, options })),
        }, AUDIT_JSON_SCHEMA);
        const audits = verificationMap(AuditBatchSchema, auditData, auditable, "audits");
        if (!audits) { auditable.forEach((q) => reject("INVALID_AUDIT_VERIFICATION", q.id, "review")); continue; }
        for (const question of auditable) {
          const audit = audits.get(question.id);
          const outcome = validateQuestionAnswer(question, blind.get(question.id), audit);
          if (!outcome.passed) { reject(outcome.code, question.id, "review"); continue; }
          questions.push({ ...question, validation: {
            status: "passed_implemented_checks", structural: true, originality: "normalized_comparison_and_semantic_audit",
            blindSolution: blind.get(question.id), audit, deterministic: outcome.deterministic,
            referencePYQIds: context.analysis.referencePYQIds, validationVersion: QUESTION_VALIDATION_VERSION,
          } });
        }
      } catch (error) {
        diagnostic(error, "generation_pipeline");
        const safeRetry = ["ZI_ANALYSIS_INVALID_JSON", "ZI_ANALYSIS_INCOMPLETE"].includes(error.code);
        reject(safeRetry ? "MALFORMED_AI_RESPONSE" : "AI_PROVIDER_OR_BUDGET_FAILURE", null, "provider");
        if (!safeRetry) {
          fatalCode = combinedSignal.aborted ? "GENERATION_ABORTED" : error.providerStatus === 429 ? "AI_RATE_LIMITED" : ["TOKEN_BUDGET_REACHED", "PROMPT_BUDGET_REACHED"].includes(error.code) ? error.code : "AI_PROVIDER_FAILURE";
          break;
        }
      }
    }
  } catch (error) {
    diagnostic(error, "context");
    fatalCode = combinedSignal.aborted ? "GENERATION_ABORTED" : error.providerStatus === 429 ? "AI_RATE_LIMITED" : ["INVALID_GENERATION_CONTEXT", "GENERATION_CONTEXT_MISMATCH"].includes(error.code) ? error.code : "PYQ_CONTEXT_UNAVAILABLE";
  }
  const acceptedIds = new Set(questions.map((q) => q.id));
  const rejectedIds = new Set(rejected.map((q) => q.id));
  for (const id of candidateIds) if (!acceptedIds.has(id) && !rejectedIds.has(id)) reject("UNVERIFIED_INTERRUPTED_VALIDATION", id, "interrupted");
  metrics.acceptedCount = questions.length;
  metrics.rejectedCount = metrics.generatedCount - questions.length;
  const status = questions.length === config.questionCount ? "complete" : questions.length ? "partial" : "error";
  return {
    status, code: status === "complete" ? null : fatalCode || "VALIDATION_ATTEMPTS_EXHAUSTED", validationVersion: QUESTION_VALIDATION_VERSION,
    requestedCount: config.questionCount, acceptedCount: questions.length, questions,
    message: status === "complete" ? `${questions.length} AI-generated questions passed the implemented checks.` : `${fatalCode === "AI_RATE_LIMITED" ? "Zi's AI provider rate limit was reached. " : ""}Only ${questions.length} of ${config.questionCount} questions passed the implemented checks. No unchecked questions were added.`,
    rejections: rejected, rejectionCounts: rejected.reduce((counts, r) => { counts[r.code] = (counts[r.code] || 0) + 1; return counts; }, {}),
    limitations: [...LIMITATIONS, ...(context?.analysis.coverageLimitations || [])], metrics, diagnostics,
    provenance: { referencePYQIds: context?.analysis.referencePYQIds || [], patternModel: context?.analysis.provenance?.model || null, analysisCacheHit: context?.analysis.cache?.hit || false },
  };
}
