/** Import the supplied JEE Advanced 2025 final-answer-key PDFs as text-first PYQs.
 * Questions are extracted into manifests by prepare_jee_advanced_2025_text.py.
 */
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PDFTOTEXT = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext";
const ROOT = new URL("../../", import.meta.url);
const papers = [
  { number: 1, pdf: "/Users/ateebfatmi/Desktop/2025_1_English.pdf", paperCode: "JEE-ADV-25-P1", shift: "Paper 1" },
  { number: 2, pdf: "/Users/ateebfatmi/Desktop/2025_2_English.pdf", paperCode: "JEE-ADV-25-P2", shift: "Paper 2" },
];

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase credentials are required");
}

function answerKey(pdf) {
  const text = execFileSync(PDFTOTEXT, ["-layout", pdf, "-"], { encoding: "utf8" });
  const answers = [...text.matchAll(/\bAnswer:\s*([^\n\r]+)/g)].map(match => match[1].trim());
  // Paper 2 Physics Q.4 has the visible key label “MARKS TO ALL”, which is
  // not represented as an `Answer:` line in the PDF text layer. Every option
  // is accepted, as verified from the supplied final-key page.
  if (pdf.endsWith("2025_2_English.pdf") && answers.length === 47) answers.splice(19, 0, "A, B, C, D");
  if (answers.length !== 48) throw new Error(`Expected 48 final-key answers, found ${answers.length} in ${pdf}`);
  return answers;
}

function subjectFor(index) {
  if (index < 16) return "Maths";
  if (index < 32) return "Physics";
  return "Chemistry";
}

function compact(text) {
  return String(text || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function promptFrom(question) {
  const withoutNumber = question.replace(/^Q\.\s*\d+\s*/i, "");
  return compact(withoutNumber.replace(/^L\s+(?=Let\b)/, "").replace(/\n\s*\(A\)[\s\S]*$/, ""));
}

function parseAnswer(raw) {
  const range = raw.match(/^\[\s*(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)\s*\]$/i);
  if (range) return { type: "NUMERICAL", answer: Number(range[1]), min: Number(range[1]), max: Number(range[2]) };
  const alternativeRanges = raw.match(/^\[\s*(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)\s*\]\s+OR\s+\[\s*(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)\s*\]$/i);
  if (alternativeRanges) {
    return { type: "NUMERICAL", answer: Number(alternativeRanges[1]), min: Number(alternativeRanges[1]), max: Number(alternativeRanges[4]) };
  }
  const alternatives = raw.match(/^(-?\d+(?:\.\d+)?)\s+OR\s+(-?\d+(?:\.\d+)?)$/i);
  if (alternatives) return { type: "NUMERICAL", answer: Number(alternatives[1]), min: Number(alternatives[1]), max: Number(alternatives[2]) };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { type: "NUMERICAL", answer: Number(raw), min: null, max: null };
  const choices = raw.match(/[A-D]/gi)?.map(choice => choice.toLowerCase()) || [];
  if (!choices.length) throw new Error(`Unrecognised final-key answer: ${raw}`);
  return choices.length > 1
    ? { type: "MULTIPLE_CORRECT", option: choices[0], options: choices, min: null, max: null }
    : { type: "MCQ", option: choices[0], options: null, min: null, max: null };
}

async function upsertExam(paper) {
  const payload = {
    exam: "JEE",
    exam_type: "JEE Advanced",
    year: 2025,
    attempt: "JEE Advanced",
    shift: paper.shift,
    paper_code: paper.paperCode,
    exam_date: "2025-05-18",
    duration_minutes: 180,
    total_marks: 180,
    status: "PUBLISHED",
    is_published: true,
  };
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
  const manifestPath = new URL(`tmp/jee-advanced-2025/paper-${paper.number}/text-manifest.json`, ROOT);
  const questions = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const answers = answerKey(paper.pdf);
  if (questions.length !== 48) throw new Error(`${paper.paperCode}: expected 48 questions, found ${questions.length}`);
  const examId = await upsertExam(paper);
  const { count, error: countError } = await supabase.from("pyq_questions").select("id", { count: "exact", head: true }).eq("paper_code", paper.paperCode);
  if (countError) throw new Error(countError.message);
  if (count) {
    if (count !== 48) throw new Error(`${paper.paperCode} already contains an incomplete ${count}-question set; refusing to duplicate.`);
    console.log(JSON.stringify({ paper: paper.paperCode, existingQuestions: count, skipped: true }));
    continue;
  }

  const rows = questions.map((item, index) => {
    const finalAnswer = parseAnswer(answers[index]);
    const options = item.options || {};
    if (finalAnswer.type !== "NUMERICAL" && Object.keys(options).length !== 4) {
      throw new Error(`${paper.paperCode} question ${index + 1} is missing one or more options.`);
    }
    return {
      exam_id: examId,
      exam: "JEE",
      exam_type: "JEE Advanced",
      year: 2025,
      attempt: "JEE Advanced",
      shift: paper.shift,
      paper_code: paper.paperCode,
      question_number: index + 1,
      display_order: index + 1,
      subject: subjectFor(index),
      chapter: "Unmapped",
      topic: "Unmapped",
      difficulty: "Medium",
      question_type: finalAnswer.type,
      question: `Question ${index + 1}: ${promptFrom(item.question)}`,
      option_a: compact(options.A),
      option_b: compact(options.B),
      option_c: compact(options.C),
      option_d: compact(options.D),
      correct_option: finalAnswer.option || "a",
      correct_options: finalAnswer.options || null,
      numerical_answer: finalAnswer.answer ?? null,
      numerical_min: finalAnswer.min,
      numerical_max: finalAnswer.max,
      explanation: `Official JEE Advanced 2025 final answer key: ${answers[index]}.`,
      question_image: null,
      explanation_image: null,
      marks_positive: 4,
      marks_negative: finalAnswer.type === "NUMERICAL" ? 0 : finalAnswer.type === "MULTIPLE_CORRECT" ? 2 : 1,
      status: "PUBLISHED",
      confidence_score: 1,
    };
  });
  for (let start = 0; start < rows.length; start += 24) {
    const { error } = await supabase.from("pyq_questions").insert(rows.slice(start, start + 24));
    if (error) throw new Error(`${paper.paperCode}: ${error.message}`);
  }
  console.log(JSON.stringify({ paper: paper.paperCode, examId, questions: rows.length, answerTypes: rows.reduce((acc, row) => ({ ...acc, [row.question_type]: (acc[row.question_type] || 0) + 1 }), {}) }));
}
