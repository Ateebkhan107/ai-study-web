import fs from "node:fs/promises";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

globalThis.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const REVIEW_STATUS = "NEEDS_REVIEW";
const STORAGE_BUCKET = "pyq-images";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const PAPER_CODES = [
  "JEE-MAIN-26-02APR-S1",
  "JEE-MAIN-26-02APR-S2",
  "JEE-MAIN-26-04APR-S1",
  "JEE-MAIN-26-04APR-S2",
  "JEE-MAIN-26-05APR-S1",
  "JEE-MAIN-26-05APR-S2",
  "JEE-MAIN-26-06APR-S1",
  "JEE-MAIN-26-06APR-S2",
  "JEE-MAIN-26-08APR-S2",
];

function parsePaperCode(code) {
  const match = code.match(/^JEE-MAIN-26-(\d\d)APR-S([12])$/);
  if (!match) throw new Error(`Unsupported paper code: ${code}`);
  const [, day, shift] = match;
  return { day, shift };
}

async function ensureExam(code) {
  const { day, shift } = parsePaperCode(code);
  const exam = {
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2026,
    attempt: `${Number(day)} Apr`,
    shift: `Shift ${shift}`,
    paper_code: code,
    exam_date: `2026-04-${day}`,
    duration_minutes: 180,
    total_marks: 300,
    status: "PUBLISHED",
    is_published: true,
  };

  const { data: existing, error: selectError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("paper_code", code)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing?.id) {
    const { error } = await supabase.from("pyq_exams").update(exam).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase.from("pyq_exams").insert(exam).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureImportPackage(name) {
  const { data: existing, error: selectError } = await supabase
    .from("pyq_import_packages")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("pyq_import_packages")
    .insert({ name, status: REVIEW_STATUS })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertQuestions(code) {
  const manifest = JSON.parse(
    await fs.readFile(`tmp/jee-main-2026-april-clean/${code}/manifest.json`, "utf8"),
  );
  if (manifest.length !== 75) throw new Error(`${code}: incomplete manifest`);

  const examId = await ensureExam(code);
  const importPackageId = await ensureImportPackage(`JEE Main 2026 April ${code} Clean Import`);
  const { day, shift } = parsePaperCode(code);

  const { data: existing, error: existingError } = await supabase
    .from("pyq_questions")
    .select("id, question_number")
    .eq("paper_code", code);
  if (existingError) throw existingError;

  const byNumber = new Map((existing || []).map((row) => [Number(row.question_number), row.id]));

  for (const item of manifest) {
    const objectPath = `jee-main-2026-april-clean/${code}/q${String(item.number).padStart(2, "0")}.png`;
    const fileBytes = await fs.readFile(item.image_path);
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, fileBytes, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
    const numerical = item.question_type === "NUMERICAL";

    const row = {
      exam_id: examId,
      import_package_id: importPackageId,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2026,
      attempt: `${Number(day)} Apr`,
      shift: `Shift ${shift}`,
      paper_code: code,
      question_number: item.number,
      display_order: item.number,
      subject: item.subject,
      chapter: "Unmapped",
      topic: "Unmapped",
      difficulty: "Medium",
      question_type: item.question_type,
      question: `Question ${item.number}: Refer to the source image.`,
      option_a: numerical ? "Option 1" : "Option 1",
      option_b: numerical ? "Option 2" : "Option 2",
      option_c: numerical ? "Option 3" : "Option 3",
      option_d: numerical ? "Option 4" : "Option 4",
      correct_option: item.correct_option ?? "a",
      correct_options: item.correct_options ?? null,
      numerical_answer: item.numerical_answer ?? null,
      numerical_min: item.numerical_min ?? null,
      numerical_max: item.numerical_max ?? null,
      explanation: `Imported from the official NTA paper and answer key. Answer reference: ${item.answer_label}.`,
      explanation_image: null,
      question_image: publicUrl,
      status: REVIEW_STATUS,
      marks_positive: 4,
      marks_negative: numerical ? 0 : 1,
      confidence_score: 0.65,
    };

    const existingId = byNumber.get(item.number);
    const query = existingId
      ? supabase.from("pyq_questions").update(row).eq("id", existingId)
      : supabase.from("pyq_questions").insert(row);
    const { error } = await query;
    if (error) throw error;
  }
}

const requested = process.argv[2];
const codes = requested ? [requested] : PAPER_CODES;

for (const code of codes) {
  await upsertQuestions(code);
  console.log(code);
}
