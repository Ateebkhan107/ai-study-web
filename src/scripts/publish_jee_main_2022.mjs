import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) if (!process.env[key]) throw new Error(`${key} is required`);

const APPLY = process.argv.includes("--apply");
const paperCode = process.argv.find((argument) => argument.startsWith("--paper="))?.slice(8);
if (!paperCode) throw new Error("Usage: node src/scripts/publish_jee_main_2022.mjs --paper=PAPER_CODE [--apply]");
const match = paperCode.match(/^JEE-MAIN-22-(\d{2})(JUN|JUL)-S([12])$/);
if (!match) throw new Error(`Invalid 2022 paper code: ${paperCode}`);

const [, day, monthCode, shiftNumber] = match;
const month = monthCode === "JUN" ? "June" : "July";
const monthNumber = monthCode === "JUN" ? "06" : "07";
const shift = `Shift ${shiftNumber}`;
const attempt = `${month} ${Number(day)} - ${shift}`;
const examDate = `2022-${monthNumber}-${day}`;
const ROOT = process.cwd();
const WORK = path.join(ROOT, "scratch", "jee2022");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const rows = [];
for (const subject of ["Physics", "Chemistry", "Mathematics"]) {
  rows.push(...JSON.parse(await fs.readFile(path.join(WORK, "transcribed", `${paperCode}_${subject.toLowerCase()}.json`), "utf8")));
}
rows.sort((left, right) => left.question_number - right.question_number);
if (rows.length !== 90) throw new Error(`${paperCode}: expected 90 questions, found ${rows.length}`);

const { data: existingExam, error: examReadError } = await supabase.from("pyq_exams").select("id").eq("paper_code", paperCode).maybeSingle();
if (examReadError) throw examReadError;
const examPayload = {
  exam: "JEE", exam_type: "JEE Main", year: 2022, attempt: month, shift,
  paper_code: paperCode, exam_date: examDate, duration_minutes: 180,
  total_marks: 300, status: "PUBLISHED", is_published: true,
};
let examId = existingExam?.id ?? "DRY-RUN";
if (APPLY && existingExam) {
  const { error } = await supabase.from("pyq_exams").update(examPayload).eq("id", existingExam.id);
  if (error) throw error;
} else if (APPLY) {
  const { data, error } = await supabase.from("pyq_exams").insert(examPayload).select("id").single();
  if (error) throw error;
  examId = data.id;
}

const { data: existingRows, error: rowsReadError } = await supabase.from("pyq_questions").select("id,question_number").eq("paper_code", paperCode);
if (rowsReadError) throw rowsReadError;
const ids = new Map(existingRows.map((row) => [row.question_number, row.id]));

async function uploadImage(number, field, source) {
  if (!source) return null;
  const suffix = field === "question_image" ? "" : `_opt_${field.match(/option_([a-d])_image/)[1]}`;
  const objectPath = `jee-main-2022/${paperCode}/q${number}${suffix}.png`;
  if (APPLY) {
    const { error } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(source), { contentType: "image/png", cacheControl: "0", upsert: true });
    if (error) throw new Error(`${paperCode} Q${number} ${field}: ${error.message}`);
  }
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

let imageCount = 0;
for (const row of rows) {
  const imageFields = {};
  for (const field of ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
    imageFields[field] = await uploadImage(row.question_number, field, row[field]);
    if (imageFields[field]) imageCount += 1;
  }
  const numerical = row.question_type === "NUMERICAL";
  const numericalAnswer = numerical && Number.isFinite(Number(row.correct_option)) ? Number(row.correct_option) : null;
  const payload = {
    exam_id: examId, exam: "JEE", exam_type: "JEE Main", year: 2022,
    attempt, shift, paper_code: paperCode, question_number: row.question_number,
    display_order: row.question_number, subject: row.subject, chapter: row.chapter,
    question_type: row.question_type, question: row.question, option_a: row.option_a,
    option_b: row.option_b, option_c: row.option_c, option_d: row.option_d,
    ...imageFields, correct_option: row.correct_option, numerical_answer: numericalAnswer,
    status: "PUBLISHED", marks_positive: 4, marks_negative: 1,
  };
  if (!APPLY) continue;
  const id = ids.get(row.question_number);
  const operation = id ? supabase.from("pyq_questions").update(payload).eq("id", id) : supabase.from("pyq_questions").insert(payload);
  const { error } = await operation;
  if (error) throw new Error(`${paperCode} Q${row.question_number}: ${error.message}`);
}

console.log(JSON.stringify({ paper_code: paperCode, questions: rows.length, images: imageCount, existing_ids_preserved: existingRows.length, applied: APPLY }, null, 2));
