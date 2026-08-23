/** Publish the audited text-first JEE Main April 2026 papers and required visuals. */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const apply = process.argv.includes("--apply");
const root = path.join(process.cwd(), "tmp", "jee-main-2026-april", "structured");
const paperFiles = (await fs.readdir(root)).filter((name) => /^JEE-MAIN-26-.*\.json$/.test(name)).sort();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizePowers(value) {
  const parts = String(value ?? "").split(/(\$[^$]*\$)/g);
  return parts.map((part) => {
    if (part.startsWith("$") && part.endsWith("$")) return part;
    return part.replace(/\b([A-Za-zαβγλμθρ])([2-9])\b/g, (_, base, power) => `$${base}^{${power}}$`);
  }).join("");
}

async function uploadVisual(localPath, paperCode, filename) {
  if (!localPath) return null;
  const bytes = await fs.readFile(localPath);
  const objectPath = `jee-main-2026-april/${paperCode.toLowerCase()}/${filename}`;
  const { error } = await supabase.storage.from("pyq-images").upload(objectPath, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

const report = [];
for (const filename of paperFiles) {
  const manifest = JSON.parse(await fs.readFile(path.join(root, filename), "utf8"));
  if (manifest.questions.length !== 75) throw new Error(`${manifest.paper_code}: expected 75 questions`);
  const exam = {
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2026,
    attempt: manifest.attempt,
    shift: manifest.shift,
    paper_code: manifest.paper_code,
    exam_date: manifest.exam_date,
    duration_minutes: 180,
    total_marks: 300,
    status: "PUBLISHED",
    is_published: true,
  };
  if (!apply) {
    report.push({ paper_code: manifest.paper_code, mode: "dry-run", questions: manifest.questions.length });
    continue;
  }
  let { data: examRow, error: examLookupError } = await supabase.from("pyq_exams").select("id").eq("paper_code", manifest.paper_code).maybeSingle();
  if (examLookupError) throw examLookupError;
  if (examRow) {
    const { error } = await supabase.from("pyq_exams").update(exam).eq("id", examRow.id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("pyq_exams").insert(exam).select("id").single();
    if (error) throw error;
    examRow = data;
  }
  const { data: existing, error: existingError } = await supabase.from("pyq_questions").select("id,question_number").eq("paper_code", manifest.paper_code);
  if (existingError) throw existingError;
  const existingByNumber = new Map(existing.map((row) => [Number(row.question_number), row.id]));
  let inserted = 0;
  let updated = 0;
  for (const question of manifest.questions) {
    const number = Number(question.number);
    const imageFields = {};
    imageFields.question_image = await uploadVisual(question.question_image, manifest.paper_code, `q${String(number).padStart(2, "0")}-question.png`);
    for (const letter of "abcd") {
      imageFields[`option_${letter}_image`] = await uploadVisual(
        question[`option_${letter}_image`],
        manifest.paper_code,
        `q${String(number).padStart(2, "0")}-option-${letter}.png`,
      );
    }
    const numerical = question.question_type === "NUMERICAL";
    const row = {
      exam_id: examRow.id,
      ...exam,
      is_published: undefined,
      exam_date: undefined,
      duration_minutes: undefined,
      total_marks: undefined,
      question_number: number,
      display_order: number,
      subject: question.subject,
      chapter: "Unmapped",
      topic: "Unmapped",
      difficulty: "Medium",
      question_type: question.question_type,
      question: normalizePowers(question.question),
      option_a: normalizePowers(question.option_a || "Not applicable"),
      option_b: normalizePowers(question.option_b || "Not applicable"),
      option_c: normalizePowers(question.option_c || "Not applicable"),
      option_d: normalizePowers(question.option_d || "Not applicable"),
      correct_option: question.correct_option,
      numerical_answer: numerical ? question.numerical_answer : null,
      explanation: question.explanation,
      explanation_image: null,
      ...imageFields,
      marks_positive: 4,
      marks_negative: numerical ? 0 : 1,
      confidence_score: 1,
    };
    delete row.is_published;
    delete row.exam_date;
    delete row.duration_minutes;
    delete row.total_marks;
    const id = existingByNumber.get(number);
    const result = id
      ? await supabase.from("pyq_questions").update(row).eq("id", id)
      : await supabase.from("pyq_questions").insert(row);
    if (result.error) throw new Error(`${manifest.paper_code} Q${number}: ${result.error.message}`);
    if (id) updated += 1;
    else inserted += 1;
  }
  const { data: verified, error: verifyError } = await supabase
    .from("pyq_questions")
    .select("question_number,question,option_a,option_b,option_c,option_d,correct_option,question_image")
    .eq("paper_code", manifest.paper_code)
    .order("question_number");
  if (verifyError) throw verifyError;
  const sequence = verified.length === 75 && verified.every((row, index) => Number(row.question_number) === index + 1);
  if (!sequence) throw new Error(`${manifest.paper_code}: live sequence verification failed`);
  report.push({ paper_code: manifest.paper_code, inserted, updated, verified: verified.length });
}

await fs.writeFile(path.join(root, "publish-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
