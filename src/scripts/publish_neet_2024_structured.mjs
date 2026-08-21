import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const WORK_DIR = path.join(ROOT, "tmp/neet-2024-clean/structured");
const DATASET = path.join(WORK_DIR, "neet-2024-structured-draft.json");
const BACKUP = path.join(WORK_DIR, "live-backup-before-structured-publish.json");
const CSV = path.join(WORK_DIR, "neet-2024-structured.csv");
const REPORT = path.join(WORK_DIR, "publish-report.json");
const BUCKET = "pyq-images";
const PAPER_CODE = "NEET 2024";

for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const imageFields = ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"];

function contentType(file) {
  const extension = path.extname(file).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

function publicUrl(objectPath) {
  return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

function assertDataset(rows) {
  if (!Array.isArray(rows) || rows.length !== 200) throw new Error(`Expected 200 rows, found ${rows?.length}`);
  const problems = [];
  for (const [index, row] of rows.entries()) {
    const number = index + 1;
    if (row.number !== number) problems.push(`Q${number}: sequence mismatch (${row.number})`);
    for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) {
      if (!String(row[field] || "").trim()) problems.push(`Q${number}: empty ${field}`);
    }
    if (!/[a-d]/i.test(String(row.correct_option))) problems.push(`Q${number}: invalid answer`);
    if (row.needs_review) problems.push(`Q${number}: still marked for review`);
    const combined = [row.question, row.option_a, row.option_b, row.option_c, row.option_d].join(" ");
    if (/[�□]|[\uE000-\uF8FF]/u.test(combined)) problems.push(`Q${number}: unresolved glyph`);
  }
  if (problems.length) throw new Error(problems.join("\n"));
}

async function uploadVisual(localPath, number, field) {
  const extension = path.extname(localPath).toLowerCase() || ".png";
  const objectPath = `neet-ug-2024/structured/q${String(number).padStart(3, "0")}-${field.replaceAll("_", "-")}${extension}`;
  const bytes = await fs.readFile(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType: contentType(localPath),
    upsert: true,
  });
  if (error) throw new Error(`Q${number} ${field}: ${error.message}`);
  return publicUrl(objectPath);
}

async function main() {
  const dataset = JSON.parse(await fs.readFile(DATASET, "utf8"));
  assertDataset(dataset);
  const { data: liveRows, error } = await supabase.from("pyq_questions").select("*")
    .eq("exam", "NEET").eq("year", 2024).eq("paper_code", PAPER_CODE).order("question_number");
  if (error) throw error;
  if (liveRows.length !== 200) throw new Error(`Expected 200 live rows, found ${liveRows.length}`);
  if (liveRows.some((row, index) => Number(row.question_number) !== index + 1)) throw new Error("Live question numbering is not 1..200");
  await fs.writeFile(BACKUP, JSON.stringify(liveRows, null, 2));

  const records = [];
  for (const source of dataset) {
    const live = liveRows[source.number - 1];
    const record = {
      ...live,
      subject: source.subject,
      question: source.question,
      option_a: source.option_a,
      option_b: source.option_b,
      option_c: source.option_c,
      option_d: source.option_d,
      correct_option: String(source.correct_option).toUpperCase(),
      question_type: "MCQ",
      question_number: source.number,
      display_order: source.number,
      status: "PUBLISHED",
    };
    for (const field of imageFields) {
      record[field] = source[field] ? (APPLY ? await uploadVisual(source[field], source.number, field) : source[field]) : null;
    }
    records.push(record);
  }

  await fs.writeFile(CSV, Papa.unparse(records, { newline: "\n" }));
  const report = {
    mode: APPLY ? "apply" : "dry-run",
    total: records.length,
    subjects: Object.fromEntries(["Physics", "Chemistry", "Biology"].map((subject) => [subject, records.filter((row) => row.subject === subject).length])),
    semanticTables: records.filter((row) => /\n\|.*\|/.test(row.question)).length,
    questionImages: records.filter((row) => row.question_image).length,
    optionImages: records.reduce((sum, row) => sum + [row.option_a_image, row.option_b_image, row.option_c_image, row.option_d_image].filter(Boolean).length, 0),
    questionsWithAnyVisual: records.filter((row) => imageFields.some((field) => row[field])).length,
    fullQuestionScreenshots: 0,
    missingCorrectOption: records.filter((row) => !/[A-D]/.test(row.correct_option)).length,
    missingChapter: records.filter((row) => !row.chapter).length,
    needsReview: dataset.filter((row) => row.needs_review).length,
    duplicateNumbers: records.length - new Set(records.map((row) => row.question_number)).size,
    backup: BACKUP,
    csv: CSV,
  };

  if (APPLY) {
    for (let start = 0; start < records.length; start += 20) {
      await Promise.all(records.slice(start, start + 20).map(async (record) => {
        const patch = Object.fromEntries([
          "subject", "question", "option_a", "option_b", "option_c", "option_d", "correct_option",
          "question_type", "question_number", "display_order", "status", ...imageFields,
        ].map((field) => [field, record[field]]));
        const { error: updateError } = await supabase.from("pyq_questions").update(patch).eq("id", record.id)
          .eq("exam", "NEET").eq("year", 2024).eq("paper_code", PAPER_CODE);
        if (updateError) throw new Error(`Q${record.question_number}: ${updateError.message}`);
      }));
    }
    const { data: verified, error: verifyError } = await supabase.from("pyq_questions")
      .select("question_number,subject,question,option_a,option_b,option_c,option_d,correct_option,question_image,option_a_image,option_b_image,option_c_image,option_d_image")
      .eq("exam", "NEET").eq("year", 2024).eq("paper_code", PAPER_CODE).order("question_number");
    if (verifyError) throw verifyError;
    report.verified = {
      total: verified.length,
      duplicateNumbers: verified.length - new Set(verified.map((row) => row.question_number)).size,
      questionImages: verified.filter((row) => row.question_image).length,
      optionImages: verified.reduce((sum, row) => sum + [row.option_a_image, row.option_b_image, row.option_c_image, row.option_d_image].filter(Boolean).length, 0),
      placeholders: verified.filter((row) => /refer to the source image for the complete question/i.test(row.question)).length,
      emptyStructuredFields: verified.filter((row) => [row.question, row.option_a, row.option_b, row.option_c, row.option_d].some((value) => !String(value || "").trim())).length,
    };
    if (report.verified.total !== 200 || report.verified.duplicateNumbers || report.verified.placeholders || report.verified.emptyStructuredFields) {
      throw new Error(`Post-publish verification failed: ${JSON.stringify(report.verified)}`);
    }
  }

  await fs.writeFile(REPORT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
