import "server-only";
import { z } from "zod";
import { normalizeScope } from "./scope.server.js";

const Label = z.string().trim().min(2).max(160);
const Prose = z.string().trim().min(10).max(1000);
const OptionIndex = z.number().int().min(0).max(3);
export const QUESTION_VALIDATION_VERSION = "zi-questions-v1.1";
export const MAX_GENERATION_BATCH_SIZE = 5;
export const QuestionConfigSchema = z.object({
  exam: z.string().trim(), subject: Label, chapter: Label.optional(), topic: Label.optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Mixed"]), questionCount: z.number().int().min(5).max(30),
}).strict();

export function validateGenerationConfig(input) {
  const parsed = QuestionConfigSchema.parse(input);
  const scope = normalizeScope({ exam: parsed.exam, subject: parsed.subject, ...(parsed.chapter ? { chapter: parsed.chapter } : {}), ...(parsed.topic ? { topic: parsed.topic } : {}) });
  if (scope.exam === "JEE Advanced") throw Object.assign(new Error("JEE Advanced generation is not supported in Phase 3."), { code: "UNSUPPORTED_EXAM" });
  return { ...parsed, exam: scope.exam, subject: scope.subject, chapter: scope.chapter, topic: scope.topic, requestedChapter: parsed.chapter || null };
}

export const CandidateQuestionSchema = z.object({
  exam: z.enum(["JEE Main", "NEET"]), subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology"]),
  chapter: Label, topic: Label, difficulty: z.enum(["Easy", "Medium", "Hard"]),
  questionType: z.literal("MCQ"), sourceType: z.literal("AI_GENERATED"),
  statement: z.string().trim().min(30).max(2400),
  options: z.tuple(Array.from({ length: 4 }, () => z.string().trim().min(1).max(500))),
  correctAnswer: OptionIndex,
  explanation: z.array(Prose).min(2).max(8), concepts: z.array(Label).min(1).max(6),
  formulas: z.array(z.string().trim().min(1).max(240)).max(8),
}).strict();
export const GenerationBatchSchema = z.object({ questions: z.array(CandidateQuestionSchema).min(1).max(MAX_GENERATION_BATCH_SIZE) }).strict();
export const NumericProofSchema = z.object({
  family: z.enum(["torque_acceleration", "body_inertia", "rotational_energy", "angular_momentum", "angular_velocity", "parallel_axis", "momentum_conservation", "rolling_speed", "torque_spinup_energy", "braking_angle", "spinup_power", "conserved_momentum_energy_change", "attached_mass_speed", "rolling_total_energy", "unsupported"]),
  geometry: z.enum(["solid_disc", "solid_sphere", "hoop", "rod_center", "rod_end"]).nullable(),
  geometryEvidence: z.string().max(300),
  inputs: z.array(z.object({ name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]{0,30}$/), value: z.number().finite(), unit: z.string().min(1).max(40), sourceText: z.string().min(1).max(180) }).strict()).max(8),
}).strict();
export const BlindSolutionSchema = z.object({
  id: z.string().uuid(), correctOptions: z.array(OptionIndex).max(4),
  sufficientInformation: z.boolean(), scientificallySound: z.boolean(), requiresCalculation: z.boolean(),
  solutionSteps: z.array(Prose).min(1).max(8), uncertainties: z.array(Prose).max(5),
  calculation: NumericProofSchema.nullable(),
}).strict();
export const BlindBatchSchema = z.object({ solutions: z.array(BlindSolutionSchema).min(1).max(MAX_GENERATION_BATCH_SIZE) }).strict();
export const AuditSchema = z.object({
  id: z.string().uuid(), verdict: z.enum(["accept", "reject", "uncertain"]),
  independentlyCorrectOptions: z.array(OptionIndex).max(4),
  answerCorrect: z.boolean(), exactlyOneCorrect: z.boolean(), explanationConsistent: z.boolean(),
  noContradictions: z.boolean(), quantitiesAndUnitsConsistent: z.boolean(), sufficientInformation: z.boolean(),
  examMatches: z.boolean(), subjectMatches: z.boolean(), topicMatches: z.boolean(), difficultyMatches: z.boolean(),
  reasoningAppropriate: z.boolean(), originalityPass: z.boolean(), requiresCalculation: z.boolean(),
  deterministicModelApplies: z.boolean(), confidence: z.enum(["high", "medium", "low"]),
  substantiveReasoningSteps: z.number().int().min(1).max(10),
  issues: z.array(z.enum(["INCORRECT_ANSWER", "AMBIGUOUS_ANSWER", "INSUFFICIENT_INFORMATION", "EXPLANATION_CONTRADICTION", "CALCULATION_ERROR", "UNIT_ERROR", "SCOPE_MISMATCH", "DIFFICULTY_MISMATCH", "SEMANTIC_REWRITE", "SCIENTIFIC_UNCERTAINTY"])).max(10),
  rationale: Prose,
}).strict();
export const AuditBatchSchema = z.object({ audits: z.array(AuditSchema).min(1).max(MAX_GENERATION_BATCH_SIZE) }).strict();

export function geminiSchema(schema) {
  return JSON.parse(JSON.stringify(z.toJSONSchema(schema), (key, value) => {
    if (["$schema", "format", "additionalProperties", "minItems", "maxItems", "minLength", "maxLength", "minimum", "maximum", "pattern"].includes(key)) return undefined;
    if (value && typeof value === "object" && Object.hasOwn(value, "const")) { const { const: literal, ...rest } = value; return { ...rest, enum: [literal] }; }
    return value;
  }));
}

// Gemini does not support draft-2020 tuple prefixItems. Use an array on the wire;
// the exact four-element tuple and option lengths remain mandatory locally.
export const GENERATION_JSON_SCHEMA = geminiSchema(GenerationBatchSchema);
GENERATION_JSON_SCHEMA.properties.questions.items.properties.options = { type: "array", items: { type: "string" } };
export const BLIND_JSON_SCHEMA = geminiSchema(BlindBatchSchema);
export const AUDIT_JSON_SCHEMA = geminiSchema(AuditBatchSchema);

export function generationResponseSchema(config, difficulties) {
  const schema = structuredClone(GENERATION_JSON_SCHEMA);
  const properties = schema.properties.questions.items.properties;
  for (const field of ["exam", "subject", "chapter", "topic"]) if (config[field]) properties[field] = { type: "string", enum: [config[field]] };
  properties.difficulty = { type: "string", enum: [...new Set(difficulties)] };
  return schema;
}
