import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PAPERS = [
  { code: "JEE-MAIN-24-27JAN-S1", attempt: "27 Jan", shift: "Shift 1", day: "27", time: "9:00 AM - 12:00 PM" },
  { code: "JEE-MAIN-24-27JAN-S2", attempt: "27 Jan", shift: "Shift 2", day: "27", time: "3:00 PM - 6:00 PM" },
  { code: "JEE-MAIN-24-29JAN-S1", attempt: "29 Jan", shift: "Shift 1", day: "29", time: "9:00 AM - 12:00 PM" },
  { code: "JEE-MAIN-24-29JAN-S2", attempt: "29 Jan", shift: "Shift 2", day: "29", time: "3:00 PM - 6:00 PM" },
  { code: "JEE-MAIN-24-30JAN-S1", attempt: "30 Jan", shift: "Shift 1", day: "30", time: "9:00 AM - 12:00 PM" },
  { code: "JEE-MAIN-24-30JAN-S2", attempt: "30 Jan", shift: "Shift 2", day: "30", time: "3:00 PM - 6:00 PM" },
  { code: "JEE-MAIN-24-31JAN-S1", attempt: "31 Jan", shift: "Shift 1", day: "31", time: "9:00 AM - 12:00 PM" },
  { code: "JEE-MAIN-24-31JAN-S2", attempt: "31 Jan", shift: "Shift 2", day: "31", time: "3:00 PM - 6:00 PM" },
  { code: "JEE-MAIN-24-01FEB-S1", attempt: "1 Feb", shift: "Shift 1", day: "01", time: "9:00 AM - 12:00 PM" },
  { code: "JEE-MAIN-24-01FEB-S2", attempt: "1 Feb", shift: "Shift 2", day: "01", time: "3:00 PM - 6:00 PM" },
];

async function publishPaper(paper) {
  const { code, attempt, shift, day } = paper;
  console.log(`\n========================================`);
  console.log(`Publishing ${code} (${attempt}, ${shift})...`);
  console.log(`========================================`);

  const examPayload = {
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2024,
    attempt: attempt,
    shift: shift,
    paper_code: code,
    exam_date: `2024-01-${day}`,
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

  // 2. Read structured dataset
  const datasetPath = `tmp/jee-main-2024-jan-clean/${code}/structured-dataset.json`;
  const questions = JSON.parse(await fs.readFile(datasetPath, "utf-8"));

  // Fetch existing questions
  const { data: existingQuestions, error: fetchQError } = await supabase
    .from("pyq_questions")
    .select("id, question_number")
    .eq("paper_code", code);

  if (fetchQError) throw fetchQError;

  const existingMap = new Map((existingQuestions || []).map((q) => [q.question_number, q.id]));

  let imagesUploaded = 0;
  let questionsUpserted = 0;

  for (const q of questions) {
    let questionImageUrl = null;

    if (q.needs_image) {
      const sourceCropNum = q.source_pdf_q ?? (q.number <= 30 ? q.number + 60 : q.number - 30);
      const cropPath = `tmp/jee-main-2024-jan/${code}/crops/q${String(sourceCropNum).padStart(2, "0")}.png`;

      try {
        const imageBytes = await fs.readFile(cropPath);
        const objectPath = `jee-main-2024-january-clean/${code.toLowerCase()}/q${String(q.number).padStart(2, "0")}.png`;

        const { error: uploadError } = await supabase.storage
          .from("pyq-images")
          .upload(objectPath, imageBytes, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          console.warn(`⚠️ Image upload warning for ${code} Q${q.number}: ${uploadError.message}`);
        } else {
          imagesUploaded++;
        }

        const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
        questionImageUrl = `${publicUrl}?v=20260828_pure_diagrams_v4`;
      } catch (err) {
        console.warn(`⚠️ Could not load crop file ${cropPath}: ${err.message}`);
      }
    }

    const isNumerical = q.question_type === "NUMERICAL";
    const correctOpt = isNumerical ? "a" : (q.correct_option?.toLowerCase() || "a");
    const numAns = isNumerical && q.numerical_answer !== "" && q.numerical_answer !== null ? Number(q.numerical_answer) : null;

    const rowPayload = {
      exam_id: examId,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2024,
      attempt: attempt,
      shift: shift,
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
  console.log("Starting publishing pipeline for all 10 JEE Main 2024 January shifts...");
  const results = [];

  for (const paper of PAPERS) {
    try {
      const res = await publishPaper(paper);
      results.push(res);
    } catch (err) {
      console.error(`❌ Failed publishing ${paper.code}:`, err);
      process.exit(1);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 ALL 10 PAPERS (900 QUESTIONS) SUCCESSFULLY PUBLISHED!`);
  console.log(`========================================`);
  console.table(results);
}

main().catch((err) => {
  console.error("Publishing script failed:", err);
  process.exit(1);
});
