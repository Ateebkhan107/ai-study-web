/** Import the supplied JEE Advanced 2023-2025 papers as text-first PYQs. */
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const dryRun = process.argv.includes("--dry-run");
const PDFTOTEXT = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext";
const papers = [
  { year: 2023, number: 1, date: "2023-06-04", answerJson: "tmp/jee-advanced-answer-keys/2023-p1-answers.json" },
  { year: 2023, number: 2, date: "2023-06-04", answerJson: "tmp/jee-advanced-answer-keys/2023-p2-answers.json" },
  { year: 2024, number: 1, date: "2024-05-26", answerPdf: "tmp/jee-advanced-answer-keys/2024-p1.pdf" },
  { year: 2024, number: 2, date: "2024-05-26", answerPdf: "tmp/jee-advanced-answer-keys/2024-p2.pdf" },
  { year: 2025, number: 1, date: "2025-05-18", answerPdf: "/Users/ateebfatmi/Downloads/2025_1_English.pdf" },
  { year: 2025, number: 2, date: "2025-05-18", answerPdf: "/Users/ateebfatmi/Downloads/2025_2_English.pdf" },
].map(paper => ({ ...paper, shift: `Paper ${paper.number}`, paperCode: `JEE-ADV-${String(paper.year).slice(2)}-P${paper.number}` }));

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials are required");

async function answerKey(paper) {
  if (paper.answerJson) return JSON.parse(await fs.readFile(paper.answerJson, "utf8"));
  const text = execFileSync(PDFTOTEXT, ["-layout", paper.answerPdf, "-"], { encoding: "utf8" });
  return [...text.matchAll(/Answer\s*:\s*([^\n\r]+)|(?:Question Dropped\.\s*)?MARKS TO ALL/gi)]
    .map(match => match[1]?.trim() || "MARKS TO ALL");
}

function compact(text) {
  return String(text || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function promptFrom(question) {
  return compact(question.replace(/^Q\.\s*\d+\s*/i, "").replace(/^L\s+(?=Let\b)/, "").replace(/\n\s*\(A\)[\s\S]*$/, ""));
}

function parseAnswer(raw, hasOptions) {
  const normalized = String(raw).replace(/[()]/g, "").trim();
  if (/MARKS TO ALL/i.test(normalized)) {
    return hasOptions
      ? { type: "MULTIPLE_CORRECT", option: "a", options: ["a", "b", "c", "d"], answer: null, min: null, max: null }
      : { type: "NUMERICAL", answer: 0, min: -1e12, max: 1e12, option: null, options: null };
  }
  if (/\bOR\b/i.test(normalized) && /\bto\b/i.test(normalized)) {
    const values = [...normalized.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
    if (values.length >= 4) return { type: "NUMERICAL", answer: values[0], min: Math.min(...values), max: Math.max(...values) };
  }
  const range = normalized.match(/^\[?\s*(-?\d+(?:\.\d+)?)\s+(?:to|,)\s+(-?\d+(?:\.\d+)?)\s*\]?$/i);
  if (range) return { type: "NUMERICAL", answer: Number(range[1]), min: Number(range[1]), max: Number(range[2]) };
  const numericAlternatives = normalized.split(/\s+OR\s+/i);
  if (numericAlternatives.length > 1 && numericAlternatives.every(value => /^-?\d+(?:\.\d+)?$/.test(value))) {
    const values = numericAlternatives.map(Number);
    return { type: "NUMERICAL", answer: values[0], min: Math.min(...values), max: Math.max(...values) };
  }
  if (/^-?\d+(?:\.\d+)?$/.test(normalized)) return { type: "NUMERICAL", answer: Number(normalized), min: null, max: null };
  const choices = normalized.match(/[A-D]/gi)?.map(choice => choice.toLowerCase()) || [];
  const uniqueChoices = [...new Set(choices)];
  if (!uniqueChoices.length) throw new Error(`Unrecognised final-key answer: ${raw}`);
  return uniqueChoices.length > 1
    ? { type: "MULTIPLE_CORRECT", option: uniqueChoices[0], options: uniqueChoices, answer: null, min: null, max: null }
    : { type: "MCQ", option: uniqueChoices[0], options: null, answer: null, min: null, max: null };
}

async function upsertExam(paper) {
  const payload = { exam: "JEE", exam_type: "JEE Advanced", year: paper.year, attempt: "JEE Advanced", shift: paper.shift, paper_code: paper.paperCode, exam_date: paper.date, duration_minutes: 180, total_marks: 180, status: "PUBLISHED", is_published: true };
  const { data: existing, error: lookupError } = await supabase.from("pyq_exams").select("id").eq("paper_code", paper.paperCode).maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing) {
    const { error } = await supabase.from("pyq_exams").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return existing.id;
  }
  const { data, error } = await supabase.from("pyq_exams").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

for (const paper of papers) {
  const questions = JSON.parse(await fs.readFile(`tmp/jee-advanced/${paper.year}/paper-${paper.number}/text-manifest.json`, "utf8"));
  const answers = await answerKey(paper);
  const expected = paper.year === 2025 ? 48 : 51;
  if (questions.length !== expected || answers.length !== expected) throw new Error(`${paper.paperCode}: expected ${expected}; found ${questions.length} questions and ${answers.length} answers`);
  const rows = questions.map((item, index) => {
    const options = item.options || {};
    const finalAnswer = parseAnswer(answers[index], Object.keys(options).length === 4);
    if (finalAnswer.type !== "NUMERICAL" && Object.keys(options).length !== 4) throw new Error(`${paper.paperCode} Q${index + 1}: missing options for ${answers[index]}`);
    return {
      exam: "JEE", exam_type: "JEE Advanced", year: paper.year, attempt: "JEE Advanced", shift: paper.shift, paper_code: paper.paperCode,
      question_number: index + 1, display_order: index + 1, subject: item.subject, chapter: "Unmapped", topic: "Unmapped", difficulty: "Medium",
      question_type: finalAnswer.type, question: `Question ${index + 1}: ${promptFrom(item.question)}`,
      option_a: compact(options.A), option_b: compact(options.B), option_c: compact(options.C), option_d: compact(options.D),
      correct_option: finalAnswer.option || "a", correct_options: finalAnswer.options || null,
      numerical_answer: finalAnswer.answer ?? null, numerical_min: finalAnswer.min, numerical_max: finalAnswer.max,
      explanation: `Official JEE Advanced ${paper.year} final answer key: ${answers[index]}.`, question_image: null, explanation_image: null,
      marks_positive: 4, marks_negative: finalAnswer.type === "NUMERICAL" ? 0 : finalAnswer.type === "MULTIPLE_CORRECT" ? 2 : 1,
      status: "PUBLISHED", confidence_score: 1,
    };
  });
  const summary = { paper: paper.paperCode, questions: rows.length, subjects: Object.fromEntries(["Maths", "Physics", "Chemistry"].map(subject => [subject, rows.filter(row => row.subject === subject).length])), answerTypes: rows.reduce((acc, row) => ({ ...acc, [row.question_type]: (acc[row.question_type] || 0) + 1 }), {}) };
  if (dryRun) { console.log(JSON.stringify({ ...summary, dryRun: true })); continue; }
  const examId = await upsertExam(paper);
  const { count, error: countError } = await supabase.from("pyq_questions").select("id", { count: "exact", head: true }).eq("paper_code", paper.paperCode);
  if (countError) throw new Error(countError.message);
  if (count) {
    if (count !== expected) throw new Error(`${paper.paperCode} already contains an incomplete ${count}-question set; refusing to duplicate.`);
    console.log(JSON.stringify({ ...summary, existingQuestions: count, skipped: true }));
    continue;
  }
  for (let start = 0; start < rows.length; start += 24) {
    const { error } = await supabase.from("pyq_questions").insert(rows.slice(start, start + 24).map(row => ({ ...row, exam_id: examId })));
    if (error) throw new Error(`${paper.paperCode}: ${error.message}`);
  }
  console.log(JSON.stringify({ ...summary, examId }));
}
