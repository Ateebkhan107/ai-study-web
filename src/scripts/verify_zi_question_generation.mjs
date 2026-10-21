/** Controlled, billable, read-only Phase 3 verification. Requires Node >=22.
 * node --conditions=react-server --env-file=.env.local src/scripts/verify_zi_question_generation.mjs --output docs/zi-phase3-live-review.md
 * Optional --case 0|1|2 reruns one case without repeating the others.
 * Writes ONLY a local human-review report. No student tables or public endpoints.
 */
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { generateAIQuestions } from "../lib/zi/testGenerator/generation.server.js";
import { serializeStudentGeneration } from "../lib/zi/testGenerator/questionSerializers.server.js";

const cases = [
  { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", difficulty: "Medium", questionCount: 5 },
  { exam: "NEET", subject: "Biology", chapter: "Human Physiology", difficulty: "Medium", questionCount: 5 },
  { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", topic: "Phase3 nonexistent reference topic c12ad9", difficulty: "Medium", questionCount: 5 },
];
const caseFlag = process.argv.indexOf("--case");
const caseNumber = caseFlag < 0 ? null : Number(process.argv[caseFlag + 1]);
if (caseNumber !== null && (!Number.isInteger(caseNumber) || !cases[caseNumber])) throw new Error("--case must be 0, 1 or 2.");
const outputFlag = process.argv.indexOf("--output");
const outputPath = path.resolve(outputFlag < 0 ? "/tmp/prepzii-phase3-review.md" : process.argv[outputFlag + 1]);
const lines = ["# PrepZii Phase 3 — local generation review", "", `Run: ${new Date().toISOString()}`, "", "AI-GENERATED PRACTICE QUESTIONS. This is a private local review artifact containing answer keys and solutions. No questions were published or written to student-facing database tables. Passing implemented checks is not a guarantee of correctness or originality. Subject/exam/difficulty checks include AI review; numerical recomputation covers a fixed catalog only.", ""];
await fs.mkdir(path.dirname(outputPath), { recursive: true });
async function save() { await fs.writeFile(outputPath, lines.join("\n")); }
await save();
for (const config of caseNumber === null ? cases : [cases[caseNumber]]) {
  console.log(JSON.stringify({ event: "starting", exam: config.exam, chapter: config.chapter, topic: config.topic || null }));
  const result = await generateAIQuestions(config, { onProgress: (progress) => console.log(JSON.stringify({ event: "progress", exam: config.exam, ...progress })) });
  const safe = serializeStudentGeneration(result);
  assert.ok(safe.questions.every((q) => !Object.hasOwn(q, "correctAnswer") && !Object.hasOwn(q, "explanation") && !Object.hasOwn(q, "validation")));
  assert.equal(result.acceptedCount, result.questions.length);
  if (config.topic) {
    assert.equal(result.status, "insufficient_references");
    assert.equal(result.metrics.generationCalls, 0);
  }
  lines.push(`## ${config.exam} — ${config.chapter}${config.topic ? ` — ${config.topic}` : ""}`, "", `Requested: ${config.questionCount}; generated: ${result.metrics.generatedCount}; accepted: ${result.acceptedCount}; rejected/unverified: ${result.metrics.rejectedCount}; status: ${result.status}; code: ${result.code || "none"}.`, "", result.message, "", "### Request usage and rejections", "", "```json", JSON.stringify({ metrics: result.metrics, rejectionCounts: result.rejectionCounts || {}, rejectionDetails: result.rejections || [], diagnostics: result.diagnostics || [], referencePYQIds: result.provenance?.referencePYQIds || [] }, null, 2), "```", "");
  for (const [index, q] of result.questions.entries()) {
    lines.push(`### Question ${index + 1} — ${q.topic}`, "", `ID: ${q.id}; ${q.difficulty}; source: AI_GENERATED`, "", q.statement, "", ...q.options.map((option, i) => `${"ABCD"[i]}. ${option}`), "", `**Correct answer: ${"ABCD"[q.correctAnswer]}**`, "", ...q.explanation.map((step, i) => `${i + 1}. ${step}`), "", `Concepts: ${q.concepts.join(", ")}`, "", `Formulas: ${q.formulas.join("; ") || "Not applicable"}`, "", `Deterministic check: ${q.validation.deterministic.method}${q.validation.deterministic.family ? ` (${q.validation.deterministic.family})` : ""}.`, "");
  }
  lines.push("### Limitations", "", ...(result.limitations || []).map((line) => `- ${line}`), "");
  await save();
  console.log(JSON.stringify({ event: "completed", exam: config.exam, status: result.status, requested: result.requestedCount, accepted: result.acceptedCount, code: result.code, rejectionCounts: result.rejectionCounts, metrics: result.metrics, diagnostics: result.diagnostics }));
  if (!["complete", "partial", "insufficient_references"].includes(result.status)) process.exitCode = 1;
  if (result.code === "AI_RATE_LIMITED" || result.diagnostics?.some((d) => d.providerStatus >= 400)) {
    lines.push("**Live verification stopped at the provider blocker. Remaining cases were NOT run; no model/key switching or quota bypass was attempted.**", "");
    await save();
    break;
  }
}
console.log(JSON.stringify({ report: outputPath }));
