import process from "node:process";
import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function cleanText(text) {
  if (!text) return "";
  let s = String(text);
  // Strip "Question \d+:\s*" or "Question \d+\s*"
  s = s.replace(/^\s*Question\s+\d+\s*:\s*/i, "");
  s = s.replace(/^\s*Question\s+\d+\s+/i, "");
  // Strip PYQ / Paper headers if any
  s = s.replace(/^JEE\s+Main\s+\d{4}\s+[^:]+:\s*/i, "");
  return s.trim();
}

function cleanOption(opt) {
  if (!opt || opt === "Not applicable" || opt === "Option 1" || opt === "Option 2" || opt === "Option 3" || opt === "Option 4") {
    return opt || "";
  }
  return String(opt).trim();
}

function formatCorrectOption(opt, qType, numAns) {
  if (qType === "NUMERICAL") {
    if (numAns !== null && numAns !== undefined && String(numAns).trim() !== "") {
      return String(numAns).trim();
    }
    return String(opt || "").trim();
  }
  const val = String(opt || "").trim().toUpperCase();
  if (["A", "B", "C", "D"].includes(val)) return val;
  if (val === "1") return "A";
  if (val === "2") return "B";
  if (val === "3") return "C";
  if (val === "4") return "D";
  return val;
}

export async function mergeAndIngest() {
  console.log("Checking classification files...");
  const classifiedPath = "./scratch/jee_classification/classified.json";
  const physicsPath = "./scratch/jee_classification/physics_classified.json";
  const chemistryPath = "./scratch/jee_classification/chemistry_classified.json";
  const mathsPath = "./scratch/jee_classification/maths_classified.json";

  const mainClassified = JSON.parse(await fs.readFile(classifiedPath, "utf8"));
  
  let physicsClassified = [];
  let chemistryClassified = [];
  let mathsClassified = [];

  try {
    physicsClassified = JSON.parse(await fs.readFile(physicsPath, "utf8"));
  } catch (e) {
    console.log("Waiting for physics_classified.json...");
  }
  try {
    chemistryClassified = JSON.parse(await fs.readFile(chemistryPath, "utf8"));
  } catch (e) {
    console.log("Waiting for chemistry_classified.json...");
  }
  try {
    mathsClassified = JSON.parse(await fs.readFile(mathsPath, "utf8"));
  } catch (e) {
    console.log("Waiting for maths_classified.json...");
  }

  console.log({
    mainClassified: mainClassified.length,
    physicsClassified: physicsClassified.length,
    chemistryClassified: chemistryClassified.length,
    mathsClassified: mathsClassified.length,
  });

  // Build a lookup map of id -> ncert_chapter
  const chapterMap = new Map();
  for (const item of mainClassified) {
    if (item.ncert_chapter) chapterMap.set(item.id, item.ncert_chapter);
  }
  for (const item of physicsClassified) {
    if (item.ncert_chapter) chapterMap.set(item.id, item.ncert_chapter);
  }
  for (const item of chemistryClassified) {
    if (item.ncert_chapter) chapterMap.set(item.id, item.ncert_chapter);
  }
  for (const item of mathsClassified) {
    if (item.ncert_chapter) chapterMap.set(item.id, item.ncert_chapter);
  }

  console.log("Total unique questions with NCERT chapters:", chapterMap.size);

  // Fetch all unclassified questions to get their full fields
  const unclassifiedAll = JSON.parse(await fs.readFile("./scratch/jee_classification/unclassified.json", "utf8"));
  const allTextQuestions = [...mainClassified, ...unclassifiedAll];
  
  const dedupedQuestions = new Map();
  for (const q of allTextQuestions) {
    if (!dedupedQuestions.has(q.id) && chapterMap.has(q.id)) {
      dedupedQuestions.set(q.id, {
        ...q,
        ncert_chapter: chapterMap.get(q.id),
      });
    }
  }

  console.log("Ready to ingest questions:", dedupedQuestions.size);

  // Format into questions schema
  const toUpsert = [];
  const pyqUpdates = [];

  for (const [id, q] of dedupedQuestions) {
    const rawSubject = q.subject === "Maths" ? "Mathematics" : q.subject;
    const qType = q.question_type === "NUMERICAL" ? "NUMERICAL" : "MCQ";
    const correctOpt = formatCorrectOption(q.correct_option, qType, q.numerical_answer);

    const questionRow = {
      id: q.id,
      exam: "JEE Main",
      subject: rawSubject,
      chapter: q.ncert_chapter,
      topic: q.topic && q.topic !== "Unmapped" && q.topic !== "General" ? q.topic : q.ncert_chapter,
      difficulty: q.difficulty || "Medium",
      question_type: qType,
      question_text: cleanText(q.question),
      question_image: q.question_image || null,
      option_a: qType === "MCQ" ? cleanOption(q.option_a) : null,
      option_b: qType === "MCQ" ? cleanOption(q.option_b) : null,
      option_c: qType === "MCQ" ? cleanOption(q.option_c) : null,
      option_d: qType === "MCQ" ? cleanOption(q.option_d) : null,
      option_a_image: q.option_a_image || null,
      option_b_image: q.option_b_image || null,
      option_c_image: q.option_c_image || null,
      option_d_image: q.option_d_image || null,
      correct_option: correctOpt,
      explanation: cleanText(q.explanation),
      explanation_image: q.explanation_image || null,
      marks: 4,
      negative_marks: qType === "NUMERICAL" ? 0 : 1,
      is_active: true,
      status: "PUBLISHED",
      source_type: "PREPZII_PRACTICE",
      question_order: null,
    };

    toUpsert.push(questionRow);
    pyqUpdates.push({ id: q.id, chapter: q.ncert_chapter, subject: rawSubject });
  }

  console.log("Formatted rows count:", toUpsert.length);
  return { toUpsert, pyqUpdates };
}

if (process.argv.includes("--run")) {
  mergeAndIngest();
}
