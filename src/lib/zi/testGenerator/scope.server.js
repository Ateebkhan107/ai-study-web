import "server-only";

import { z } from "zod";
import { CHAPTER_ALIASES, TEST_PAGE_CHAPTERS } from "../../pyqChapterMapping.js";

export function normalizeKey(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

const EXAMS = {
  "jee main": "JEE Main", "jee mains": "JEE Main", "iit jee main": "JEE Main",
  "jee advanced": "JEE Advanced", "iit jee advanced": "JEE Advanced",
  neet: "NEET", "neet ug": "NEET",
};
const SUBJECTS = { physics: "Physics", chemistry: "Chemistry", biology: "Biology", maths: "Mathematics", math: "Mathematics", mathematics: "Mathematics" };
const Label = z.string().trim().min(2).max(120).refine((s) => !/[\u0000-\u001f]/.test(s));
const Input = z.object({ exam: Label, subject: Label, chapter: Label.optional(), topic: Label.optional(), sampleSize: z.number().int().min(12).max(20).default(16) }).strict();

export function normalizeExam(value) {
  return EXAMS[normalizeKey(value)] ?? null;
}

export function normalizeDifficulty(value) {
  return ({ easy: "Easy", medium: "Medium", moderate: "Medium", hard: "Hard", difficult: "Hard" })[normalizeKey(value)] ?? "Unknown";
}

export function normalizeQuestionType(value) {
  return ({ mcq: "single_correct", "single correct": "single_correct", "single correct mcq": "single_correct", "multiple choice": "single_correct", numerical: "numerical", "numerical answer": "numerical", "integer answer": "numerical", integer: "numerical", "multiple correct": "multiple_correct", "multi correct": "multiple_correct", msq: "multiple_correct" })[normalizeKey(value)] ?? null;
}

// Do not use getChapterTargets: its legacy broad-chapter fallbacks intentionally
// include unrelated chapters. Resolve aliases inside the requested subject only.
export function chapterScope(subject, requested) {
  const chapters = TEST_PAGE_CHAPTERS[subject === "Mathematics" ? "Maths" : subject] || [];
  const canonical = chapters.find((chapter) => [chapter, ...(CHAPTER_ALIASES[chapter] || [])].some((label) => normalizeKey(label) === normalizeKey(requested)));
  if (!canonical) return { chapter: requested, aliases: [requested] };
  let aliases = [canonical, ...(CHAPTER_ALIASES[canonical] || [])];
  // A request for rotation must not silently include standalone centre-of-mass PYQs.
  if (canonical === "System of Particles & Rotational Motion" && /rotat/i.test(requested)) {
    aliases = aliases.filter((label) => !/cent[er]+ of mass/i.test(label));
  }
  return { chapter: canonical, aliases: [...new Set(aliases)] };
}

export function normalizeScope(input) {
  const parsed = Input.parse(input);
  const exam = normalizeExam(parsed.exam);
  const subject = SUBJECTS[normalizeKey(parsed.subject)];
  if (!exam) throw new Error("Choose JEE Main, JEE Advanced, or NEET; JEE alone is ambiguous.");
  if (!subject || (exam === "NEET" && subject === "Mathematics") || (exam !== "NEET" && subject === "Biology")) throw new Error("Subject is not supported for this exam.");
  if (!parsed.chapter && !parsed.topic) throw new Error("A chapter or exact topic is required.");
  const chapter = parsed.chapter ? chapterScope(subject, parsed.chapter) : { chapter: null, aliases: [] };
  return { exam, subject, chapter: chapter.chapter, topic: parsed.topic || null, chapterAliases: chapter.aliases, sampleSize: parsed.sampleSize };
}

function variants(values) {
  return [...new Set(values.flatMap((v) => [v, v.toUpperCase(), v.toLowerCase()]))];
}

export function databaseFilters(scope) {
  return {
    exams: variants(scope.exam === "NEET" ? ["NEET", "NEET UG"] : ["JEE", scope.exam]),
    examTypes: variants(scope.exam === "NEET" ? ["NEET", "NEET UG"] : [scope.exam]),
    subjects: variants(scope.subject === "Mathematics" ? ["Mathematics", "Maths"] : [scope.subject]),
    statuses: variants(["PUBLISHED", "APPROVED"]),
    chapters: variants(scope.chapterAliases),
  };
}
