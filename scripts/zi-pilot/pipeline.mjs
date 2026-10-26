// Shared one-candidate orchestration; no provider or database transport.
import { randomUUID } from 'node:crypto';
import { config, references } from './fixtures.mjs';
import { GenerationBatchSchema, BlindBatchSchema, AuditBatchSchema, generationResponseSchema, BLIND_JSON_SCHEMA, AUDIT_JSON_SCHEMA } from '../../src/lib/zi/testGenerator/questionSchema.server.js';
import { PATTERN_RESPONSE_JSON_SCHEMA, validatePatternAnalysis } from '../../src/lib/zi/testGenerator/analysisSchema.server.js';
import { validateQuestionStructure, validateQuestionAnswer } from '../../src/lib/zi/testGenerator/questionValidation.server.js';
import { checkQuestionOriginality } from '../../src/lib/zi/testGenerator/originality.server.js';
import { serializeStudentQuestion } from '../../src/lib/zi/testGenerator/questionSerializers.server.js';
import { GENERATE_QUESTIONS_PROMPT, BLIND_SOLVE_PROMPT, AUDIT_QUESTIONS_PROMPT } from '../../src/lib/zi/testGenerator/questionPrompts.server.js';
function fail(code) { throw Object.assign(Error(code), { safeCode: code }); }

export async function evaluateOneQuestion(call, { referencePack = references, provenance = 'synthetic_offline_fixture' } = {}) {
    const analysis = validatePatternAnalysis(await call('analysis', 'Analyze only the supplied local reference pack with its explicit provenance. Synthetic fixtures are not official PYQs. Do not infer current syllabus coverage. Return sample-specific pattern JSON.', { references: referencePack, provenance }, PATTERN_RESPONSE_JSON_SCHEMA), referencePack);
    const batch = GenerationBatchSchema.parse(await call('generation', GENERATE_QUESTIONS_PROMPT, { configuration: config, count: 1, targetDifficulties: ['Easy'], patterns: analysis, provenance }, generationResponseSchema(config, ['Easy'])));
    if (batch.questions.length !== 1) fail('EXACTLY_ONE_REQUIRED');
    const structural = validateQuestionStructure(batch.questions[0], config);
    if (!structural.passed) fail(structural.code);
    const question = { ...structural.question, id: randomUUID() };
    const originality = checkQuestionOriginality(question, referencePack);
    if (!originality.passed) fail(originality.code);
    const blind = BlindBatchSchema.parse(await call('blind', BLIND_SOLVE_PROMPT, { questions: [serializeStudentQuestion(question)], configuration: config }, BLIND_JSON_SCHEMA));
    if (blind.solutions.length !== 1 || blind.solutions[0].id !== question.id || blind.solutions[0].correctOptions.length !== 1 || blind.solutions[0].correctOptions[0] !== question.correctAnswer) fail('ANSWER_DISAGREEMENT');
    const audit = AuditBatchSchema.parse(await call('audit', AUDIT_QUESTIONS_PROMPT, { questions: [question], blindSolutions: blind.solutions, syntheticReferenceComparisons: referencePack, referenceProvenance: provenance }, AUDIT_JSON_SCHEMA));
    if (audit.audits.length !== 1) fail('MISSING_AUDIT');
    const validation = validateQuestionAnswer(question, blind.solutions[0], audit.audits[0]);
    if (!validation.passed) fail(validation.code);
  return { question, blind: blind.solutions[0], audit: audit.audits[0], validation };
}
