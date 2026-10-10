import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) if (!process.env[key]) throw new Error(`${key} is required`);

const APPLY = process.argv.includes("--apply");
const requestedPaper = process.argv.find((arg) => arg.startsWith("--paper="))?.slice(8);
const ROOT = process.cwd();
const WORK = path.join(ROOT, "scratch", "jee2021");
const manifest = JSON.parse(await fs.readFile(path.join(WORK, "source", "manifest.json"), "utf8"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

function balanced(value) {
  return (String(value ?? "").match(/(?<!\\)\$/g) || []).length % 2 === 0;
}

async function dataset(paper) {
  const rows = [];
  for (const subject of ["Physics", "Chemistry", "Mathematics"]) {
    rows.push(...JSON.parse(await fs.readFile(path.join(WORK, "transcribed", `${paper.paper_code}_${subject}.json`), "utf8")));
  }
  rows.sort((a, b) => a.question_number - b.question_number);
  const errors = [];
  if (rows.length !== 90) errors.push(`expected 90 rows, found ${rows.length}`);
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.question_number !== index + 1 || row.display_order !== index + 1) errors.push(`bad sequence at ${index + 1}`);
    const expectedSubject = index < 30 ? "Physics" : index < 60 ? "Chemistry" : "Mathematics";
    if (row.subject !== expectedSubject) errors.push(`Q${index + 1}: expected ${expectedSubject}`);
    if (!row.chapter || /^(unmapped|general)$/i.test(row.chapter.trim())) errors.push(`Q${index + 1}: invalid chapter`);
    for (const field of ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"]) if (!balanced(row[field])) errors.push(`Q${index + 1}: unbalanced dollars in ${field}`);
    if (/^(option\s*[a-d]|\(?[1-4a-d]\)?)$/i.test(String(row.option_a).trim()) || /^(option\s*[a-d]|\(?[1-4a-d]\)?)$/i.test(String(row.option_b).trim()) || /^(option\s*[a-d]|\(?[1-4a-d]\)?)$/i.test(String(row.option_c).trim()) || /^(option\s*[a-d]|\(?[1-4a-d]\)?)$/i.test(String(row.option_d).trim())) errors.push(`Q${index + 1}: placeholder option`);
    if (row.question_type === "NUMERICAL" && ["a", "b", "c", "d"].some((letter) => row[`option_${letter}`] !== "")) errors.push(`Q${index + 1}: numerical options are not empty`);
  }
  if (errors.length) throw new Error(`${paper.paper_code} dataset failed:\n${errors.slice(0, 100).join("\n")}`);
  return rows;
}

async function ensureExam(paper) {
  const { data: existing, error } = await supabase.from("pyq_exams").select("id").eq("paper_code", paper.paper_code).maybeSingle();
  if (error) throw error;
  const payload = {
    exam: "JEE", exam_type: "JEE Main", year: 2021, attempt: paper.session,
    shift: paper.shift, paper_code: paper.paper_code, exam_date: paper.exam_date,
    duration_minutes: 180, total_marks: 300, status: "PUBLISHED", is_published: true,
  };
  if (!APPLY) return { id: existing?.id ?? "DRY-RUN", existing: Boolean(existing) };
  if (existing) {
    const { error: updateError } = await supabase.from("pyq_exams").update(payload).eq("id", existing.id);
    if (updateError) throw updateError;
    return { id: existing.id, existing: true };
  }
  const { data, error: insertError } = await supabase.from("pyq_exams").insert(payload).select("id").single();
  if (insertError) throw insertError;
  return { id: data.id, existing: false };
}

async function uploadImage(paperCode, number, field, source) {
  if (!source) return null;
  const suffix = field === "question_image" ? "" : `_opt_${field.match(/option_([a-d])_image/)[1]}`;
  const objectPath = `jee-main-2021/${paperCode}/q${number}${suffix}.png`;
  if (APPLY) {
    const { error } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(source), { contentType: "image/png", cacheControl: "0", upsert: true });
    if (error) throw new Error(`${paperCode} Q${number} ${field}: ${error.message}`);
  }
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

const reports = [];
for (const paper of manifest.filter((item) => !requestedPaper || item.paper_code === requestedPaper)) {
  const rows = await dataset(paper);
  const exam = await ensureExam(paper);
  const { data: existing, error: existingError } = await supabase.from("pyq_questions").select("id,question_number").eq("paper_code", paper.paper_code);
  if (existingError) throw existingError;
  const ids = new Map(existing.map((row) => [row.question_number, row.id]));
  let imageCount = 0;
  for (const row of rows) {
    const imageFields = {};
    for (const field of ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
      imageFields[field] = await uploadImage(paper.paper_code, row.question_number, field, row[field]);
      if (imageFields[field]) imageCount += 1;
    }
    const numeric = row.question_type === "NUMERICAL";
    const numericValue = numeric && Number.isFinite(Number(row.correct_option)) ? Number(row.correct_option) : null;
    const payload = {
      exam_id: exam.id, exam: "JEE", exam_type: "JEE Main", year: 2021,
      attempt: paper.attempt, shift: paper.shift, paper_code: paper.paper_code,
      question_number: row.question_number, display_order: row.question_number,
      subject: row.subject, chapter: row.chapter, question_type: row.question_type,
      question: row.question, option_a: row.option_a, option_b: row.option_b,
      option_c: row.option_c, option_d: row.option_d, ...imageFields,
      correct_option: row.correct_option, numerical_answer: numericValue,
      status: "PUBLISHED", marks_positive: 4, marks_negative: 1,
    };
    if (!APPLY) continue;
    const id = ids.get(row.question_number);
    const operation = id ? supabase.from("pyq_questions").update(payload).eq("id", id) : supabase.from("pyq_questions").insert(payload);
    const { error } = await operation;
    if (error) throw new Error(`${paper.paper_code} Q${row.question_number}: ${error.message}`);
  }
  reports.push({ paper_code: paper.paper_code, questions: rows.length, images: imageCount, existing_ids_preserved: existing.length, applied: APPLY });
}

console.log(JSON.stringify(reports, null, 2));
