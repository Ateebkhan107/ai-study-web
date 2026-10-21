import "server-only";
import { analyzePYQPatterns } from "./analysis.server.js";
import { retrievePYQReferences, MIN_REFERENCES } from "./retrieval.server.js";
import { validateGenerationConfig } from "./questionSchema.server.js";

const issuedContexts = new WeakSet();
function freeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

export async function prepareQuestionGenerationContext(input, { client, signal, analyze = analyzePYQPatterns, retrieve = retrievePYQReferences, onProviderUsage } = {}) {
  const config = validateGenerationConfig(input);
  const scope = { exam: config.exam, subject: config.subject, ...(config.requestedChapter ? { chapter: config.requestedChapter } : {}), ...(config.topic ? { topic: config.topic } : {}) };
  const analysis = await analyze(scope, { client, signal, onProviderUsage });
  let references = [];
  if (["analyzed", "limited_references"].includes(analysis.status)) {
    // Reuse Phase 2's public service unchanged. One additional bounded retrieval
    // obtains originals for comparison and detects changes since analysis.
    const retrieved = await retrieve(scope, { client, signal });
    references = retrieved.references;
    const ids = references;
    if (analysis.exam !== config.exam || analysis.subject !== config.subject || analysis.chapter !== config.chapter || analysis.topic !== config.topic || analysis.provenance?.source !== "official_pyq" || analysis.provenance.referenceFingerprint !== retrieved.fingerprint || analysis.numberOfQuestionsAnalyzed !== ids.length || ids.length < MIN_REFERENCES || JSON.stringify(analysis.referencePYQIds) !== JSON.stringify(ids.map((r) => r.id))) {
      throw Object.assign(new Error("PYQ references changed or do not match the requested analysis."), { code: "GENERATION_CONTEXT_MISMATCH" });
    }
  }
  const context = freeze(structuredClone({ config, analysis, references }));
  issuedContexts.add(context);
  return context;
}

export function assertGenerationContext(context, config) {
  if (!issuedContexts.has(context) || JSON.stringify(config) !== JSON.stringify(context.config)) throw Object.assign(new Error("Use a matching server-issued Phase 2 generation context."), { code: "INVALID_GENERATION_CONTEXT" });
}
