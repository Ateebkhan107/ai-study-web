/** Read-only integration verification. Requires Node >=22 and configured env.
 * node --conditions=react-server --env-file=.env.local src/scripts/verify_zi_pyq_patterns.mjs [--analyze] [--case 0..3]
 * --analyze makes billable calls through the existing Zi Gemini provider.
 */
import assert from "node:assert/strict";
import { retrievePYQReferences, MAX_CANDIDATES } from "../lib/zi/testGenerator/retrieval.server.js";
import { analyzePYQPatterns } from "../lib/zi/testGenerator/analysis.server.js";

const cases = [
  { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion" },
  { exam: "JEE Advanced", subject: "Physics", chapter: "Rotational Motion" },
  { exam: "NEET", subject: "Biology", chapter: "Human Physiology" },
  { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", topic: "Phase2 nonexistent reference topic 8b0294" },
];

const caseFlag = process.argv.indexOf("--case");
const caseNumber = caseFlag < 0 ? null : Number(process.argv[caseFlag + 1]);
if (caseNumber !== null && (!Number.isInteger(caseNumber) || caseNumber < 0 || caseNumber >= cases.length)) throw new Error("--case must be 0, 1, 2, or 3.");
for (const input of caseNumber === null ? cases : [cases[caseNumber]]) {
  try {
    const retrieved = await retrievePYQReferences(input);
    assert.ok(retrieved.fetchedRowCount <= MAX_CANDIDATES);
    assert.ok(retrieved.references.length <= 20);
    assert.ok(retrieved.references.every((r) => r.exam === input.exam));
    assert.equal(new Set(retrieved.references.map((r) => r.id)).size, retrieved.references.length);
    const output = {
      input, fetchedRowCount: retrieved.fetchedRowCount, uniqueCandidates: retrieved.candidateCount,
      selectedReferences: retrieved.references.map(({ id, exam, subject, chapter, topic, year, type, difficulty }) => ({ id, exam, subject, chapter, topic, year, type, difficulty })),
      excluded: retrieved.excluded, limitations: retrieved.limitations,
    };
    if (process.argv.includes("--analyze")) {
      output.analysis = await analyzePYQPatterns(input);
      assert.ok(output.analysis.referencePYQIds.every((id) => retrieved.references.some((r) => r.id === id)));
      if (input.topic) {
        assert.equal(output.analysis.status, "insufficient_references");
        assert.equal(output.analysis.numberOfQuestionsAnalyzed, 0);
      } else if (output.analysis.numberOfQuestionsAnalyzed > 0) {
        const cached = await analyzePYQPatterns(input);
        assert.equal(cached.cache.hit, true);
        assert.equal(cached.provenance.analyzedAt, output.analysis.provenance.analyzedAt);
        output.cacheRecheckPassed = true;
      }
    }
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    // Do not dump SDK errors, prompts, environment, or request headers.
    console.error(JSON.stringify({ input, verification: "failed", code: error.code || "VERIFICATION_FAILED", reason: error.reason, providerStatus: error.providerStatus, message: error.message }));
    process.exitCode = 1;
  }
}
