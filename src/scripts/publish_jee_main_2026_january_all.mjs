import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const root = path.join(process.cwd(), "tmp/jee-main-2026-january-clean");

const papers = [
  { code: "JEE-MAIN-26-21JAN-S1", day: "21", shift: "1" },
  { code: "JEE-MAIN-26-21JAN-S2", day: "21", shift: "2" },
  { code: "JEE-MAIN-26-22JAN-S1", day: "22", shift: "1" },
  { code: "JEE-MAIN-26-22JAN-S2", day: "22", shift: "2" },
  { code: "JEE-MAIN-26-23JAN-S1", day: "23", shift: "1" },
  { code: "JEE-MAIN-26-23JAN-S2", day: "23", shift: "2" },
  { code: "JEE-MAIN-26-24JAN-S1", day: "24", shift: "1" },
  { code: "JEE-MAIN-26-24JAN-S2", day: "24", shift: "2" },
  { code: "JEE-MAIN-26-28JAN-S1", day: "28", shift: "1" },
  { code: "JEE-MAIN-26-28JAN-S2", day: "28", shift: "2" },
];

async function publishPaper(paper) {
  const { code, day, shift } = paper;
  console.log(`\n========================================`);
  console.log(`Publishing ${code} (Jan ${day}, Shift ${shift})...`);
  console.log(`========================================`);

  const datasetPath = path.join(root, code, "structured-dataset.json");
  const datasetRaw = await fs.readFile(datasetPath, "utf8");
  const questions = JSON.parse(datasetRaw);

  if (questions.length !== 75) {
    throw new Error(`${code}: Expected 75 questions, found ${questions.length}`);
  }

  // 1. Upsert Exam Record
  const examPayload = {
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2026,
    attempt: `${Number(day)} Jan`,
    shift: `Shift ${shift}`,
    paper_code: code,
    exam_date: `2026-01-${day.padStart(2, "0")}`,
    duration_minutes: 180,
    total_marks: 300,
    status: "PUBLISHED",
    is_published: true,
  };

  let examId = null;
  const { data: existingExam, error: examFetchError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("paper_code", code)
    .maybeSingle();

  if (examFetchError) throw examFetchError;

  if (existingExam) {
    examId = existingExam.id;
    const { error: updateError } = await supabase
      .from("pyq_exams")
      .update(examPayload)
      .eq("id", examId);
    if (updateError) throw updateError;
    console.log(` - Updated pyq_exams record: ${examId}`);
  } else {
    const { data: newExam, error: insertError } = await supabase
      .from("pyq_exams")
      .insert(examPayload)
      .select("id")
      .single();
    if (insertError) throw insertError;
    examId = newExam.id;
    console.log(` - Created pyq_exams record: ${examId}`);
  }

  // 2. Fetch existing questions for this paper code
  const { data: existingQuestions, error: qFetchError } = await supabase
    .from("pyq_questions")
    .select("id, question_number")
    .eq("paper_code", code);

  if (qFetchError) throw qFetchError;

  const existingMap = new Map();
  for (const eq of existingQuestions || []) {
    existingMap.set(eq.question_number, eq.id);
  }

  let imagesUploaded = 0;
  let questionsUpserted = 0;

  for (const q of questions) {
    let questionImageUrl = null;

    if (q.needs_image && q.question_image) {
      try {
        const imageBuffer = await fs.readFile(q.question_image);
        const objectPath = `jee-main-2026-january-clean/${code.toLowerCase()}/q${String(q.number).padStart(2, "0")}.png`;

        const { error: uploadError } = await supabase.storage
          .from("pyq-images")
          .upload(objectPath, imageBuffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.warn(`Warning: failed to upload image for ${code} Q${q.number}: ${uploadError.message}`);
        } else {
          questionImageUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
          imagesUploaded++;
        }
      } catch (err) {
        console.warn(`Warning: error reading image for ${code} Q${q.number}: ${err.message}`);
      }
    }

    const isNumerical = q.question_type === "NUMERICAL";
    const correctOpt = isNumerical ? "a" : (q.correct_option?.toLowerCase() || "a");
    const numAns = isNumerical && q.numerical_answer && q.numerical_answer !== "" ? Number(q.numerical_answer) : null;

    const rowPayload = {
      exam_id: examId,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2026,
      attempt: examPayload.attempt,
      shift: examPayload.shift,
      paper_code: code,
      question_number: q.number,
      display_order: q.number,
      subject: q.subject,
      chapter: q.chapter || "Unmapped",
      difficulty: "MEDIUM",
      question_type: q.question_type,
      question: q.question,
      option_a: q.option_a ?? "",
      option_b: q.option_b ?? "",
      option_c: q.option_c ?? "",
      option_d: q.option_d ?? "",
      correct_option: correctOpt,
      numerical_answer: numAns,
      question_image: questionImageUrl,
      explanation: isNumerical
        ? (numAns !== null ? `Official answer: ${numAns}` : "Numerical type question.")
        : `Official answer: Option (${correctOpt.toUpperCase()})`,
      marks_positive: 4,
      marks_negative: isNumerical ? 0 : 1,
      status: "PUBLISHED",
    };

    const existingId = existingMap.get(q.number);
    if (existingId) {
      const { error: updateQError } = await supabase
        .from("pyq_questions")
        .update(rowPayload)
        .eq("id", existingId);
      if (updateQError) throw updateQError;
    } else {
      const { error: insertQError } = await supabase
        .from("pyq_questions")
        .insert(rowPayload);
      if (insertQError) throw insertQError;
    }
    questionsUpserted++;
  }

  console.log(` ✅ ${code}: ${questionsUpserted} questions upserted, ${imagesUploaded} images uploaded.`);
  return { code, questions: questionsUpserted, images: imagesUploaded };
}

async function main() {
  console.log("Starting publishing pipeline for all 10 JEE Main 2026 January shifts...");
  const results = [];

  for (const paper of papers) {
    try {
      const res = await publishPaper(paper);
      results.push(res);
    } catch (err) {
      console.error(`❌ Failed publishing ${paper.code}:`, err);
      process.exit(1);
    }
  }

  console.log("\n========================================");
  console.log("🎉 ALL 10 PAPERS (750 QUESTIONS) SUCCESSFULLY PUBLISHED!");
  console.log("========================================");
  console.table(results);
}

main();
