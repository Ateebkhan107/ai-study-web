import "server-only";

import { z } from "zod";

const Label = z.string().trim().min(1).max(160);
const Description = z.string().trim().min(8).max(600);
const ReferenceIds = z.array(z.string().uuid()).min(1).max(20);
const EvidencePattern = z.object({ description: Description, referenceIds: ReferenceIds }).strict();
export const PatternAnalysisSchema = z.object({
  patternSummary: z.string().trim().min(30).max(1400),
  classifications: z.array(z.object({
    referenceId: z.string().uuid(),
    nature: z.enum(["numerical", "conceptual", "mixed"]),
    concepts: z.array(Label).min(1).max(5),
    estimatedReasoningSteps: z.number().int().min(1).max(12),
  }).strict()).min(5).max(20),
  commonFormulas: z.array(z.object({ expression: Label, usage: Description, referenceIds: ReferenceIds }).strict()).max(12),
  questionStructures: z.array(EvidencePattern).min(1).max(8),
  reasoningPatterns: z.array(EvidencePattern).min(1).max(8),
  distractorPatterns: z.array(EvidencePattern).max(8),
  multiConceptCombinations: z.array(z.object({ concepts: z.array(Label).min(2).max(5), description: Description, referenceIds: ReferenceIds }).strict()).max(8),
  difficultyCharacteristics: z.object({ observations: z.array(EvidencePattern).min(1).max(8), caveats: z.array(Description).max(6) }).strict(),
  coverageLimitations: z.array(Description).max(8),
}).strict();

// Gemini's JSON-schema dialect does not accept every Zod annotation (notably
// UUID formats). Send the structural subset, then enforce ALL constraints locally.
export const PATTERN_RESPONSE_JSON_SCHEMA = JSON.parse(JSON.stringify(
  z.toJSONSchema(PatternAnalysisSchema),
  (key, value) => ["$schema", "format", "additionalProperties", "minItems", "maxItems", "minLength", "maxLength", "minimum", "maximum"].includes(key) ? undefined : value,
));

export function validatePatternAnalysis(data, references) {
  const analysis = PatternAnalysisSchema.parse(data);
  const expected = new Set(references.map((q) => q.id));
  const received = analysis.classifications.map((q) => q.referenceId);
  if (new Set(received).size !== expected.size || received.length !== expected.size || received.some((id) => !expected.has(id))) throw new Error("Analysis must classify each retrieved reference exactly once.");
  const evidence = [
    ...analysis.commonFormulas, ...analysis.questionStructures, ...analysis.reasoningPatterns,
    ...analysis.distractorPatterns, ...analysis.multiConceptCombinations, ...analysis.difficultyCharacteristics.observations,
  ];
  if (evidence.some((pattern) => new Set(pattern.referenceIds).size !== pattern.referenceIds.length || pattern.referenceIds.some((id) => !expected.has(id)))) throw new Error("Analysis cited references outside the retrieved sample.");
  const byId = new Map(references.map((q) => [q.id, q]));
  if (analysis.distractorPatterns.some((pattern) => pattern.referenceIds.some((id) => byId.get(id).type === "numerical"))) throw new Error("Distractor analysis cited a reference without answer options.");
  // Summaries describe patterns, never reproduce long runs of question prose.
  const words = (s) => s.toLowerCase().match(/[a-z]{2,}/g) || [];
  const prose = words(JSON.stringify({ ...analysis, classifications: [] })).join(" ");
  for (const reference of references) {
    const tokens = words(reference.statement);
    for (let i = 0; i + 12 <= tokens.length; i += 1) {
      if (prose.includes(tokens.slice(i, i + 12).join(" "))) throw new Error("Pattern analysis reproduced reference question prose.");
    }
  }
  return analysis;
}
