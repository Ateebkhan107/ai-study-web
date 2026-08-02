import fs from "node:fs/promises";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

process.loadEnvFile(".env.local");

const chapterNumber = Number(process.argv[2]);
if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 29) {
  throw new Error("Pass a chapter number from 1 to 29");
}

const file = `tmp/wiley-jee-main-mathematics/offline-chapter-${String(chapterNumber).padStart(2, "0")}.json`;
const questions = JSON.parse(await fs.readFile(file, "utf8"));
const chapterNames = {
  1: "Sets",
  2: "Relations and Functions – I",
  3: "Trigonometric Functions",
  4: "Principle of Mathematical Induction",
  5: "Complex Numbers and Quadratic Equations",
  6: "Linear Inequalities",
  7: "Permutations and Combinations",
  8: "Binomial Theorem", 9: "Sequences and Series", 10: "Straight Lines", 11: "Conic Sections",
  12: "Introduction to Three Dimensional Geometry", 13: "Limits and Derivatives", 14: "Mathematical Reasoning",
  15: "Statistics", 16: "Probability – I", 17: "Relations and Functions – II", 18: "Inverse Trigonometric Functions",
  19: "Matrices", 20: "Determinants", 21: "Continuity and Differentiability", 22: "Application of Derivatives",
  23: "Integrals", 24: "Application of Integrals", 25: "Differential Equations", 26: "Vector Algebra",
  27: "Three Dimensional Geometry", 28: "Linear Programming", 29: "Probability – II",
};
const chapter = chapterNames[chapterNumber];
if (!chapter) throw new Error(`Chapter ${chapterNumber} is not yet approved for publishing`);

for (const question of questions) {
  if (!question.question_text || !question.correct_option || !question.explanation) throw new Error(`Chapter ${chapterNumber} Q${question.number} is incomplete`);
  if (question.question_type === "MCQ" && question.options?.length !== 4) throw new Error(`Chapter ${chapterNumber} Q${question.number} needs four options`);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: existing, error: existingError } = await supabase
  .from("questions")
  .select("id,question_text,explanation")
  .in("exam", ["JEE Main", "JEE"])
  .eq("subject", "Mathematics")
  .eq("chapter", chapter);
if (existingError) throw existingError;
const incomingTexts = new Set(questions.map((question) => question.question_text.trim()));
const existingTexts = new Set((existing || []).map((row) => String(row.question_text || "").trim()));

const rows = questions.filter((question) => !existingTexts.has(question.question_text.trim())).map((question, index) => ({
  exam: "JEE Main",
  subject: "Mathematics",
  chapter,
  topic: question.topic,
  difficulty: "Medium",
  question_type: question.question_type,
  question_text: question.question_text,
  question_image: null,
  option_a: question.options?.[0] || null,
  option_b: question.options?.[1] || null,
  option_c: question.options?.[2] || null,
  option_d: question.options?.[3] || null,
  option_a_image: null,
  option_b_image: null,
  option_c_image: null,
  option_d_image: null,
  correct_option: question.correct_option,
  explanation: question.explanation,
  explanation_image: null,
  marks: 4,
  negative_marks: question.question_type === "Numerical" ? 0 : 1,
  is_active: true,
  question_order: index + 1,
}));

if (rows.length === 0) throw new Error(`Chapter ${chapterNumber} has no new questions to publish`);

const { data, error } = await supabase.from("questions").insert(rows).select("id");
if (error) throw error;
console.log(JSON.stringify({ chapter: chapterNumber, inserted: data.length }));
