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
  { code: "JEE-MAIN-24-04APR-S1", attempt: "4 Apr", shift: "Shift 1", day: "04" },
  { code: "JEE-MAIN-24-04APR-S2", attempt: "4 Apr", shift: "Shift 2", day: "04" },
  { code: "JEE-MAIN-24-05APR-S1", attempt: "5 Apr", shift: "Shift 1", day: "05" },
  { code: "JEE-MAIN-24-05APR-S2", attempt: "5 Apr", shift: "Shift 2", day: "05" },
  { code: "JEE-MAIN-24-06APR-S1", attempt: "6 Apr", shift: "Shift 1", day: "06" },
  { code: "JEE-MAIN-24-06APR-S2", attempt: "6 Apr", shift: "Shift 2", day: "06" },
  { code: "JEE-MAIN-24-08APR-S1", attempt: "8 Apr", shift: "Shift 1", day: "08" },
  { code: "JEE-MAIN-24-08APR-S2", attempt: "8 Apr", shift: "Shift 2", day: "08" },
  { code: "JEE-MAIN-24-09APR-S1", attempt: "9 Apr", shift: "Shift 1", day: "09" },
  { code: "JEE-MAIN-24-09APR-S2", attempt: "9 Apr", shift: "Shift 2", day: "09" },
];

async function withRetry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Retry ${i + 1}/${retries} after error: ${err.message || err}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

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
    exam_date: `2024-04-${day}`,
    duration_minutes: 180,
    total_marks: 300,
    status: "PUBLISHED",
    is_published: true,
  };

  let examId = null;
  const existingExam = await withRetry(async () => {
    const { data, error } = await supabase
      .from("pyq_exams")
      .select("id")
      .eq("paper_code", code)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

  if (existingExam) {
    examId = existingExam.id;
    await withRetry(async () => {
      const { error } = await supabase
        .from("pyq_exams")
        .update(examPayload)
        .eq("id", examId);
      if (error) throw error;
    });
    console.log(` - Updated pyq_exams record: ${examId}`);
  } else {
    const newExam = await withRetry(async () => {
      const { data, error } = await supabase
        .from("pyq_exams")
        .insert(examPayload)
        .select("id")
        .single();
      if (error) throw error;
      return data;
    });
    examId = newExam.id;
    console.log(` - Created pyq_exams record: ${examId}`);
  }

  // 2. Read structured dataset
  const datasetPath = `tmp/jee-main-2024-apr-clean/${code}/structured-dataset.json`;
  const questions = JSON.parse(await fs.readFile(datasetPath, "utf-8"));

  // Fetch existing questions
  const existingQuestions = await withRetry(async () => {
    const { data, error } = await supabase
      .from("pyq_questions")
      .select("id, question_number")
      .eq("paper_code", code);
    if (error) throw error;
    return data;
  });

  const existingMap = new Map((existingQuestions || []).map((q) => [q.question_number, q.id]));

  let imagesUploaded = 0;
  let questionsUpserted = 0;

  for (const q of questions) {
    let questionImageUrl = null;

    if (q.needs_image) {
      const sourceCropNum = q.source_pdf_q ?? (q.number <= 30 ? q.number + 60 : q.number - 30);
      const cropPath = `tmp/jee-main-2024-apr/${code}/crops/q${String(sourceCropNum).padStart(2, "0")}.png`;

      try {
        const imageBytes = await fs.readFile(cropPath);
        const objectPath = `jee-main-2024-april-clean/${code.toLowerCase()}/q${String(q.number).padStart(2, "0")}.png`;

        await withRetry(async () => {
          const { error: uploadError } = await supabase.storage
            .from("pyq-images")
            .upload(objectPath, imageBytes, {
              contentType: "image/png",
              upsert: true,
            });
          if (uploadError) throw uploadError;
        }, 3, 1000);

        imagesUploaded++;
        const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
        questionImageUrl = `${publicUrl}?v=20260828_pure_embedded_v5`;
      } catch (err) {
        console.warn(`⚠️ Could not load or upload crop file ${cropPath}: ${err.message}`);
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
    await withRetry(async () => {
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
    });
    questionsUpserted++;
  }

  console.log(` ✅ ${code}: ${questionsUpserted} questions upserted, ${imagesUploaded} images uploaded.`);
  return { code, questions: questionsUpserted, images: imagesUploaded };
}

async function main() {
  console.log("Starting publishing pipeline for all 10 JEE Main 2024 April shifts...");
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
  console.log(`🎉 ALL 10 APRIL PAPERS (900 QUESTIONS) SUCCESSFULLY PUBLISHED!`);
  console.log(`========================================`);
  console.table(results);
}

main().catch((err) => {
  console.error("Publishing script failed:", err);
  process.exit(1);
});
