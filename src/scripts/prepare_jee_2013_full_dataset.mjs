import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { classifyQuestion } from "./comprehensive_jee_2013_classifier.mjs";
import { NCERT_CHAPTERS } from "./test_jee_ncert_classifier.mjs";

const RAW_FILE = path.join(process.cwd(), "scratch/jee_2013_raw_dataset.json");
const OUT_PYQ_FILE = path.join(process.cwd(), "scratch/jee_2013_pyq_payload.json");
const OUT_QUESTIONS_FILE = path.join(process.cwd(), "scratch/jee_2013_questions_payload.json");

const SUBJECT_DEFAULT_CHAPTERS = {
  Physics: "Physical World, Units and Measurements",
  Chemistry: "Some Basic Concepts of Chemistry",
  Mathematics: "Sets"
};

async function main() {
  const rawData = JSON.parse(await fs.readFile(RAW_FILE, "utf8"));
  console.log(`Loaded ${rawData.length} raw questions.`);

  const pyqPayload = [];
  const questionsPayload = [];

  let mappedCount = 0;
  let fallbackCount = 0;

  for (const item of rawData) {
    const rowForClassifier = {
      subject: item.subject,
      question: item.question_text,
      option_a: item.option_a,
      option_b: item.option_b,
      option_c: item.option_c,
      option_d: item.option_d,
      explanation: item.explanation
    };

    const res = classifyQuestion(rowForClassifier);
    let chapter = res.chapter;

    if (!chapter || !NCERT_CHAPTERS[item.subject]?.includes(chapter)) {
      chapter = SUBJECT_DEFAULT_CHAPTERS[item.subject];
      fallbackCount++;
    } else {
      mappedCount++;
    }

    // Clean question text for test practice page (no "Question X:" prefix)
    let cleanText = item.question_text.trim();
    cleanText = cleanText.replace(/^Q(?:uestion)?\s*\d+[\.\:\-]?\s*/i, "").trim();
    if (!cleanText || cleanText.length < 5) {
      cleanText = `Refer to the question image and choose the correct option.`;
    }

    // 1. PYQ Question Object
    pyqPayload.push({
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2013,
      attempt: item.attempt,
      shift: item.shift,
      paper_code: item.paper_code,
      subject: item.subject,
      chapter: chapter,
      topic: "General",
      question_number: item.question_number,
      display_order: item.display_order,
      question_type: "MCQ",
      question: cleanText,
      question_image: item.question_image,
      option_a: item.option_a || "Option (A)",
      option_b: item.option_b || "Option (B)",
      option_c: item.option_c || "Option (C)",
      option_d: item.option_d || "Option (D)",
      correct_option: item.correct_option,
      numerical_answer: null,
      marks_positive: 4,
      marks_negative: -1,
      explanation: item.explanation,
      status: "PUBLISHED",
      confidence_score: 1.0,
      difficulty: "MEDIUM"
    });

    // 2. Practice Test Questions Object (source_type = 'PREPZII_PRACTICE')
    questionsPayload.push({
      exam: "JEE Main",
      subject: item.subject,
      chapter: chapter,
      topic: "General",
      difficulty: "MEDIUM",
      question_type: "MCQ",
      question_text: cleanText,
      question_image: item.question_image,
      option_a: item.option_a || "Option (A)",
      option_b: item.option_b || "Option (B)",
      option_c: item.option_c || "Option (C)",
      option_d: item.option_d || "Option (D)",
      correct_option: item.correct_option,
      explanation: item.explanation,
      marks: 4,
      negative_marks: 1,
      source_type: "PREPZII_PRACTICE",
      status: "PUBLISHED",
      is_active: true
    });
  }

  console.log(`\nClassification Summary:`);
  console.log(`- High-Confidence NCERT Mapped: ${mappedCount} (${((mappedCount / rawData.length) * 100).toFixed(1)}%)`);
  console.log(`- Default Chapter Assigned: ${fallbackCount}`);

  await fs.writeFile(OUT_PYQ_FILE, JSON.stringify(pyqPayload, null, 2), "utf8");
  await fs.writeFile(OUT_QUESTIONS_FILE, JSON.stringify(questionsPayload, null, 2), "utf8");

  console.log(`\nWrote:`);
  console.log(`- ${pyqPayload.length} rows -> ${OUT_PYQ_FILE}`);
  console.log(`- ${questionsPayload.length} rows -> ${OUT_QUESTIONS_FILE}`);
}

main().catch(console.error);
