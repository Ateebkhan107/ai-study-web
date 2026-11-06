import "server-only";

import { createHash } from "node:crypto";
import { databaseFilters, normalizeDifficulty, normalizeExam, normalizeKey, normalizeQuestionType, normalizeScope } from "./scope.server.js";

export const MAX_CANDIDATES = 120;
export const MIN_REFERENCES = 5;
const QUERY_LIMIT = MAX_CANDIDATES / 2;
const MAX_REFERENCE_CHARS = 6000;
export const PYQ_REFERENCE_FIELDS = `id, exam, exam_type, subject, chapter, topic, year, exam_id,
  difficulty, question_type, status, question, option_a, option_b, option_c, option_d,
  correct_option, correct_options, numerical_answer, numerical_min, numerical_max,
  explanation, question_image, option_a_image, option_b_image, option_c_image, option_d_image,
  question_content, paper:pyq_exams!inner(id, exam, exam_type, year, status, is_published)`;
const PLACEHOLDER = /extraction needs review|(?:question|option|content|text|image) (?:unavailable|missing|not available)|placeholder|\b(?:todo|tbd|lorem ipsum)\b/i;
const IMAGE_DEPENDENCY = /(?:shown|given|depicted|illustrated)\s+(?:below|above|in\s+(?:the\s+)?(?:figure|diagram|graph|picture))|(?:following|accompanying)\s+(?:figure|diagram|graph|structures)|\b(?:figure|diagram)\s+(?:shows|below|above)|includegraphics|<img|!\[/i;
const MISSING_TOPIC = new Set(["", "unmapped", "unknown", "general", "n a"]);

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function complete(value, min = 1, max = 700) { return value.length >= min && value.length <= max && !PLACEHOLDER.test(value); }
function hasMedia(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasMedia);
  return /image|diagram|graph|media/i.test(String(value.type || "")) || Object.values(value).some(hasMedia);
}

export function normalizeReference(row, scope) {
  const paper = Array.isArray(row.paper) ? row.paper[0] : row.paper;
  const filters = databaseFilters(scope);
  const has = (values, value) => values.some((v) => normalizeKey(v) === normalizeKey(value));
  if (!paper || !row.id || !row.exam_id || row.exam_id !== paper.id || !paper.is_published || !has(filters.statuses, paper.status) || !has(filters.statuses, row.status)) return { reason: "unpublished_or_unapproved" };
  if (!has(filters.exams, row.exam) || !has(filters.exams, paper.exam) || normalizeExam(row.exam_type) !== scope.exam || normalizeExam(paper.exam_type) !== scope.exam) return { reason: "exam_mismatch" };
  if (!has(filters.subjects, row.subject) || (scope.chapter && !has(scope.chapterAliases, row.chapter)) || (scope.topic && normalizeKey(row.topic) !== normalizeKey(scope.topic))) return { reason: "scope_mismatch" };
  const statement = text(row.question);
  const type = normalizeQuestionType(row.question_type);
  if (!type || !complete(statement, 30, 3000)) return { reason: "incomplete_content" };
  // Phase 2 has no image-understanding pass. Reject attachments conservatively,
  // including option images and native media blocks, rather than infer their text.
  if (row.question_image || ["a", "b", "c", "d"].some((k) => row[`option_${k}_image`]) || hasMedia(row.question_content) || IMAGE_DEPENDENCY.test(statement) || /\bList[- –]?I\b/i.test(statement)) return { reason: "image_or_layout_dependency" };
  const options = [row.option_a, row.option_b, row.option_c, row.option_d].map(text);
  const key = text(row.correct_option).toUpperCase();
  const multiple = Array.isArray(row.correct_options) ? row.correct_options.map((v) => text(v).toUpperCase()) : key.split(/[,\s]+/).filter(Boolean);
  let answer;
  if (type === "numerical") {
    answer = row.numerical_answer ?? (key !== "" && Number.isFinite(Number(key)) ? Number(key) : null);
    if (answer === null || !Number.isFinite(Number(answer))) return { reason: "invalid_answer" };
  } else {
    if (!options.every((v) => complete(v)) || new Set(options.map((v) => v.normalize("NFKC").toLowerCase().replace(/\s+/g, ""))).size !== 4) return { reason: "incomplete_options" };
    if (type === "single_correct") {
      if (!/^[ABCD]$/.test(key) || (multiple.length > 0 && (multiple.length !== 1 || multiple[0] !== key))) return { reason: "invalid_answer" };
      answer = key;
    } else {
      if (!multiple.length || multiple.some((v) => !/^[ABCD]$/.test(v)) || new Set(multiple).size !== multiple.length) return { reason: "invalid_answer" };
      answer = multiple;
    }
  }
  const explanation = text(row.explanation);
  const hasReasoning = complete(explanation, 80, 1600) && !/^Official .*answer key:/i.test(explanation);
  const reference = {
    id: row.id, paperId: paper.id, exam: scope.exam, subject: scope.subject,
    chapter: row.chapter, topic: MISSING_TOPIC.has(normalizeKey(row.topic)) ? null : text(row.topic),
    year: paper.year ?? row.year ?? null, difficulty: normalizeDifficulty(row.difficulty), type,
    statement, options: type === "numerical" ? [] : options, answer,
    explanation: hasReasoning ? explanation : null,
  };
  if (JSON.stringify(reference).length > MAX_REFERENCE_CHARS) return { reason: "content_budget_exceeded" };
  return { reference };
}

export function selectDiverseReferences(references, limit) {
  const remaining = [...references].sort((a, b) => a.id.localeCompare(b.id));
  const selected = [];
  const seen = new Map();
  const dimensions = (q) => [q.paperId, q.year, q.topic || q.chapter, q.type, q.difficulty].map((v, i) => `${i}:${v}`);
  while (remaining.length && selected.length < limit) {
    let bestIndex = 0;
    let bestScore = -1;
    remaining.forEach((q, i) => {
      const score = dimensions(q).reduce((sum, key) => sum + 1 / (1 + (seen.get(key) || 0)), 0) + (q.explanation ? 0.15 : 0);
      if (score > bestScore) { bestScore = score; bestIndex = i; }
    });
    const [next] = remaining.splice(bestIndex, 1);
    selected.push(next);
    dimensions(next).forEach((key) => seen.set(key, (seen.get(key) || 0) + 1));
  }
  return selected;
}

export async function retrievePYQReferences(input, { client, signal } = {}) {
  const scope = normalizeScope(input);
  if (!client) client = (await import("../../supabaseAdmin.js")).supabaseAdmin;
  const filters = databaseFilters(scope);
  const querySignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000);
  const buildQuery = (ascending) => {
    let query = client.from("pyq_questions").select(PYQ_REFERENCE_FIELDS)
      .in("exam", filters.exams).in("exam_type", filters.examTypes).in("subject", filters.subjects)
      .in("status", filters.statuses).eq("paper.is_published", true)
      .in("paper.status", filters.statuses).in("paper.exam", filters.exams).in("paper.exam_type", filters.examTypes);
    if (scope.chapter) query = query.in("chapter", filters.chapters);
    // Literal, case-insensitive topic equality. No wildcards or chapter fallback.
    if (scope.topic) query = query.ilike("topic", scope.topic.replace(/[\\%_]/g, "\\$&"));
    return query.order("year", { ascending, nullsFirst: false }).order("id", { ascending: true }).limit(QUERY_LIMIT).abortSignal(querySignal);
  };
  const results = await Promise.all([buildQuery(false), buildQuery(true)]);
  if (results.some((result) => result.error)) {
    const error = new Error("Official PYQ retrieval failed; no pattern analysis was performed.");
    error.code = querySignal.aborted ? "PYQ_RETRIEVAL_ABORTED" : "PYQ_RETRIEVAL_FAILED";
    throw error;
  }
  const rows = [...new Map(results.flatMap((r) => r.data || []).map((r) => [r.id, r])).values()];
  const excluded = {};
  const usable = [];
  const statements = new Set();
  for (const row of rows) {
    const { reference, reason } = normalizeReference(row, scope);
    if (!reference) { excluded[reason] = (excluded[reason] || 0) + 1; continue; }
    const fingerprint = normalizeKey(reference.statement);
    if (statements.has(fingerprint)) { excluded.duplicate = (excluded.duplicate || 0) + 1; continue; }
    statements.add(fingerprint);
    usable.push(reference);
  }
  const diverse = selectDiverseReferences(usable, scope.sampleSize);
  let remainingChars = 60000;
  const references = diverse.filter((reference) => {
    const size = JSON.stringify(reference).length;
    if (size > remainingChars) { excluded.prompt_budget = (excluded.prompt_budget || 0) + 1; return false; }
    remainingChars -= size;
    return true;
  });
  const limitations = [
    "This is a bounded, purposive sample of published official PYQs, not an exam-wide statistical distribution.",
    "Image/layout-dependent references are excluded. Difficulty labels are source metadata, not independently calibrated.",
    "Chapter aliases can map to combined syllabus chapters; coverage follows the mapped chapter labels. Source chapter/topic accuracy is not independently verified.",
  ];
  if (results.some((r) => r.data?.length === QUERY_LIMIT)) limitations.push("Candidate retrieval reached a page limit; additional matching PYQs may exist. Newest and oldest windows were sampled.");
  if (references.length < 12) limitations.push(`Only ${references.length} usable references were found within the bounded search; the target is 12–20.`);
  if (references.some((q) => !q.topic)) limitations.push("Some reference topic labels are missing or unmapped; concept classifications will be inferred from question text.");
  if (references.some((q) => !q.explanation)) limitations.push("Some references lack a usable worked solution; inferred solving methods cannot be verified against those solutions.");
  if (Object.keys(excluded).length) limitations.push(`Excluded candidate counts: ${JSON.stringify(excluded)}.`);
  const fingerprint = createHash("sha256").update(JSON.stringify({ scope, references })).digest("hex");
  return { scope, references, fingerprint, candidateCount: rows.length, fetchedRowCount: results.reduce((sum, r) => sum + (r.data?.length || 0), 0), candidateLimit: MAX_CANDIDATES, excluded, limitations };
}
