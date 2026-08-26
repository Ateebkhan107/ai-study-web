import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-25-22JAN-S1";
const DATASET_PATH = path.join(process.cwd(), "tmp/jee-main-2025-january-clean/JEE-MAIN-25-22JAN-S1/structured-dataset.json");
const DIAGRAMS_DIR = path.join(process.cwd(), "tmp/jee-main-2025-january-clean/JEE-MAIN-25-22JAN-S1/tight-diagrams");
const BUCKET = "pyq-images";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function uploadDiagramImage(questionNumber) {
  const filename = `q${String(questionNumber).padStart(2, "0")}_diagram.png`;
  const localPath = path.join(DIAGRAMS_DIR, filename);
  const objectPath = `jee-main-2025/22-jan-shift-1/diagram-q${String(questionNumber).padStart(2, "0")}.png`;

  const fileData = await fs.readFile(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, fileData, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed for Q${questionNumber}: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  // append cache-busting timestamp so browser doesn't serve old image
  return `${data.publicUrl}?v=${Date.now()}`;
}

async function main() {
  console.log(`Starting clean re-publish for ${PAPER_CODE}...`);
  const rawData = await fs.readFile(DATASET_PATH, "utf8");
  const dataset = JSON.parse(rawData);

  if (dataset.length !== 75) {
    throw new Error(`Expected 75 questions in dataset, got ${dataset.length}`);
  }

  // Ensure exam container exists and is published
  const { data: examData, error: examError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("paper_code", PAPER_CODE)
    .maybeSingle();

  if (examError) throw examError;

  let examId = examData?.id;
  const examPayload = {
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2025,
    attempt: "22 Jan",
    shift: "Shift 1",
    paper_code: PAPER_CODE,
    exam_date: "2025-01-22",
    duration_minutes: 180,
    total_marks: 300,
    status: "PUBLISHED",
    is_published: true,
    question_count: 75,
  };

  if (!examId) {
    const { data: newExam, error: createExamErr } = await supabase
      .from("pyq_exams")
      .insert(examPayload)
      .select("id")
      .single();
    if (createExamErr) throw createExamErr;
    examId = newExam.id;
  } else {
    await supabase.from("pyq_exams").update(examPayload).eq("id", examId);
  }

  // Fetch existing question rows
  const { data: existingRows, error: fetchError } = await supabase
    .from("pyq_questions")
    .select("id, question, question_number")
    .eq("paper_code", PAPER_CODE);

  if (fetchError) throw fetchError;

  const rowMapByNumber = new Map();
  for (const row of existingRows || []) {
    let num = row.question_number;
    if (!num) {
      const match = String(row.question || "").match(/^Question\s+(\d+)\s*:/i);
      if (match) num = Number(match[1]);
    }
    if (num && num >= 1 && num <= 75) {
      rowMapByNumber.set(num, row.id);
    }
  }

  console.log(`Found ${rowMapByNumber.size} existing rows to update.`);

  let uploadedImagesCount = 0;
  let updatedCount = 0;

  for (const q of dataset) {
    let imageUrl = null;
    if (q.needs_image) {
      console.log(`Uploading tight diagram image for Q${q.number}...`);
      imageUrl = await uploadDiagramImage(q.number);
      uploadedImagesCount++;
    }

    const isNumerical = q.question_type === "NUMERICAL";
    const correctOpt = isNumerical ? "a" : (q.correct_option ? q.correct_option.toLowerCase() : "a");
    const numAnswer = isNumerical ? (q.numerical_answer !== null && q.numerical_answer !== undefined ? Number(q.numerical_answer) : null) : null;

    const rowPayload = {
      exam_id: examId,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2025,
      attempt: "22 Jan",
      shift: "Shift 1",
      paper_code: PAPER_CODE,
      question_number: q.number,
      display_order: q.number,
      subject: q.subject,
      chapter: q.chapter || "Unmapped",
      question_type: q.question_type,
      question: q.question,
      option_a: isNumerical ? "" : (q.option_a || ""),
      option_b: isNumerical ? "" : (q.option_b || ""),
      option_c: isNumerical ? "" : (q.option_c || ""),
      option_d: isNumerical ? "" : (q.option_d || ""),
      correct_option: correctOpt,
      numerical_answer: numAnswer,
      explanation: isNumerical
        ? `Official NTA Answer: ${numAnswer}`
        : `Official NTA Answer: Option (${correctOpt.toUpperCase()})`,
      explanation_image: null,
      question_image: imageUrl,
      marks_positive: 4,
      marks_negative: 1,
      status: "PUBLISHED",
    };

    const existingId = rowMapByNumber.get(q.number);
    if (existingId) {
      const { error: updateErr } = await supabase
        .from("pyq_questions")
        .update(rowPayload)
        .eq("id", existingId);
      if (updateErr) throw new Error(`Failed to update Q${q.number}: ${updateErr.message}`);
    } else {
      const { error: insertErr } = await supabase
        .from("pyq_questions")
        .insert(rowPayload);
      if (insertErr) throw new Error(`Failed to insert Q${q.number}: ${insertErr.message}`);
    }
    updatedCount++;
  }

  // Verification query
  const { data: verifiedRows, error: verifyError } = await supabase
    .from("pyq_questions")
    .select("id, question_number, subject, chapter, question_type, question, question_image, correct_option, numerical_answer")
    .eq("paper_code", PAPER_CODE)
    .order("question_number", { ascending: true });

  if (verifyError) throw verifyError;

  const report = {
    paperCode: PAPER_CODE,
    totalRows: verifiedRows.length,
    uploadedImagesCount,
    subjects: {
      Maths: verifiedRows.filter((r) => r.subject === "Maths").length,
      Physics: verifiedRows.filter((r) => r.subject === "Physics").length,
      Chemistry: verifiedRows.filter((r) => r.subject === "Chemistry").length,
    },
    types: {
      MCQ: verifiedRows.filter((r) => r.question_type === "MCQ").length,
      NUMERICAL: verifiedRows.filter((r) => r.question_type === "NUMERICAL").length,
    },
    withDiagramOnlyImage: verifiedRows.filter((r) => Boolean(r.question_image)).map((r) => r.question_number),
    textOnlyQuestions: verifiedRows.filter((r) => !r.question_image).length,
    sampleQ1: verifiedRows[0]?.question,
    sampleQ3: verifiedRows[2]?.question,
  };

  console.log("Re-publish completed successfully!");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("Error in publish script:", err);
  process.exit(1);
});
