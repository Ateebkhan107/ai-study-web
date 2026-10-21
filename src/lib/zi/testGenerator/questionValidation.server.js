import "server-only";
import katex from "katex";
import { CandidateQuestionSchema } from "./questionSchema.server.js";
import { normalizeKey, chapterScope } from "./scope.server.js";
import { parseNumericOption, verifyNumericalQuestion } from "./numericalValidation.server.js";

function renderingIssue(value) {
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(value)) return "unsupported_control_character";
  if (/<\/?[a-z][^>]*>|!\[|\]\(|```|\b(?:https?|javascript|file):|data:[^\s]|www\.|\\(?:href|url|html\w*|includegraphics|def|gdef|newcommand|require)\b/i.test(value)) return "unsafe_or_unsupported_content";
  // Only explicit $...$ / $$...$$ delimiters. Do not rely on the renderer's
  // heuristic repairs of malformed/bare LaTeX for newly generated questions.
  if (/\\[()[\]]/.test(value)) return "unsupported_math_delimiter";
  const math = /\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g;
  let valid = true;
  const remainder = value.replace(math, (_, display, inline) => {
    try { katex.renderToString(display ?? inline, { throwOnError: true, strict: "ignore", trust: false, maxExpand: 100, maxSize: 20, displayMode: display !== undefined }); }
    catch { valid = false; }
    return "";
  });
  return !valid ? "invalid_katex" : /\$|\\[a-zA-Z]+/.test(remainder) ? "unbalanced_or_bare_latex" : null;
}
export function validateQuestionRendering(value) { return renderingIssue(value) === null; }

export function validateQuestionStructure(raw, config) {
  const parsed = CandidateQuestionSchema.safeParse(raw);
  if (!parsed.success) return { passed: false, code: "INVALID_QUESTION_SCHEMA" };
  const q = parsed.data;
  const allowedChapters = config.chapter ? chapterScope(config.subject, config.requestedChapter || config.chapter).aliases : [];
  if (config.chapter && allowedChapters.some((chapter) => normalizeKey(chapter) === normalizeKey(q.chapter))) q.chapter = config.chapter;
  const mismatch = ["exam", "subject", "chapter", "topic", "difficulty"].find((field) => {
    if (!config[field] || (field === "difficulty" && config.difficulty === "Mixed")) return false;
    return ["chapter", "topic"].includes(field) ? normalizeKey(q[field]) !== normalizeKey(config[field]) : q[field] !== config[field];
  });
  if (mismatch) return { passed: false, code: "CONFIGURATION_MISMATCH", field: mismatch, detail: "does_not_match_requested_configuration" };
  if ([q.topic, q.chapter].some((v) => /^(?:unknown|unmapped|general|n\/a)$/i.test(v))) return { passed: false, code: "INCOMPLETE_SCOPE" };
  if (new Set(q.options.map((v) => v.normalize("NFKC").toLowerCase().replace(/[\s${}]/g, ""))).size !== 4) return { passed: false, code: "DUPLICATE_OPTIONS" };
  const content = [q.statement, ...q.options, ...q.explanation, ...q.formulas, ...q.concepts, q.topic, q.chapter];
  if (content.some((v) => /\b(?:placeholder|todo|tbd|lorem ipsum)\b|(?:figure|diagram) (?:above|below)|as shown/i.test(v))) return { passed: false, code: "INCOMPLETE_CONTENT" };
  const entries = [["statement", q.statement], ...q.options.map((v, i) => [`options.${i}`, v]), ...q.explanation.map((v, i) => [`explanation.${i}`, v]), ...q.formulas.map((v, i) => [`formulas.${i}`, v]), ...q.concepts.map((v, i) => [`concepts.${i}`, v]), ["topic", q.topic], ["chapter", q.chapter]];
  for (const [field, value] of entries) { const detail = renderingIssue(value); if (detail) return { passed: false, code: "UNRENDERABLE_CONTENT", field, detail }; }
  for (const step of q.explanation) {
    const claims = [...step.matchAll(/(?:correct (?:answer|option)(?: is)?|answer is)\s*[:(-]?\s*([ABCD])\b/gi)];
    if (claims.some((claim) => "ABCD".indexOf(claim[1].toUpperCase()) !== q.correctAnswer)) return { passed: false, code: "EXPLANATION_KEY_CONTRADICTION" };
  }
  return { passed: true, question: q };
}

const AUDIT_FLAGS = ["answerCorrect", "exactlyOneCorrect", "explanationConsistent", "noContradictions", "quantitiesAndUnitsConsistent", "sufficientInformation", "examMatches", "subjectMatches", "topicMatches", "difficultyMatches", "reasoningAppropriate", "originalityPass"];
export function validateQuestionAnswer(question, blind, audit) {
  if (!blind || !audit || blind.id !== question.id || audit.id !== question.id) return { passed: false, code: "MISSING_VERIFICATION" };
  const uniqueCorrect = (options) => options.length === 1 && options[0] === question.correctAnswer;
  if (!uniqueCorrect(blind.correctOptions) || !uniqueCorrect(audit.independentlyCorrectOptions)) return { passed: false, code: "ANSWER_DISAGREEMENT_OR_AMBIGUITY" };
  if (!blind.sufficientInformation || !blind.scientificallySound || blind.uncertainties.length) return { passed: false, code: "UNRESOLVED_SCIENTIFIC_UNCERTAINTY" };
  if (audit.verdict !== "accept" || audit.confidence !== "high" || audit.issues.length || !AUDIT_FLAGS.every((key) => audit[key] === true)) return { passed: false, code: audit.issues[0] || "INDEPENDENT_REVIEW_REJECTED" };
  const requiresCalculation = blind.requiresCalculation || audit.requiresCalculation || question.options.every((o) => parseNumericOption(o));
  const deterministic = requiresCalculation ? verifyNumericalQuestion(question, blind.calculation) : { passed: true, method: "not_applicable", limitation: "Conceptual scientific correctness is supported by independent AI reviews, not deterministic proof." };
  if (requiresCalculation && !audit.deterministicModelApplies) return { passed: false, code: "UNRESOLVED_PHYSICAL_MODEL" };
  if (!deterministic.passed) return deterministic;
  const minimumSteps = question.difficulty === "Hard" ? 3 : question.difficulty === "Medium" ? 2 : 1;
  if (audit.substantiveReasoningSteps < minimumSteps || (requiresCalculation && deterministic.substantiveSteps < minimumSteps)) return { passed: false, code: "EXAM_LEVEL_COMPLEXITY_TOO_LOW" };
  return { passed: true, deterministic };
}
