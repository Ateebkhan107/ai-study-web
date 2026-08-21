import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const manifestPath = process.argv[2];
if (!manifestPath) {
  throw new Error("Usage: node src/scripts/import_neet_2025_clean.mjs tmp/neet-2025-clean/neet-2025-manifest.json");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = "pyq-images";
const EXAM_FILTER = {
  exam: "NEET",
  year: 2025,
  paper_code: "Narmada 48",
};

const CSV_COLUMNS = [
  "exam_id",
  "exam",
  "subject",
  "chapter",
  "topic",
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "correct_options",
  "explanation",
  "year",
  "exam_type",
  "attempt",
  "shift",
  "question_type",
  "numerical_answer",
  "marks_positive",
  "marks_negative",
  "question_image",
  "explanation_image",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "numerical_min",
  "numerical_max",
  "paper_code",
  "question_number",
  "display_order",
  "difficulty",
  "import_package_id",
  "status",
  "confidence_score",
];

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join(",") : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  return [
    CSV_COLUMNS.join(","),
    ...rows.map((row) => CSV_COLUMNS.map((column) => csvEscape(row[column])).join(",")),
  ].join("\n");
}

function stripGeneratedFields(item) {
  const { number, image_path, storage_path, raw_text, ...row } = item;
  return row;
}

async function fetchAllExisting() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("pyq_questions")
      .select("*")
      .eq("exam", EXAM_FILTER.exam)
      .eq("year", EXAM_FILTER.year)
      .eq("paper_code", EXAM_FILTER.paper_code)
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 1000) return rows;
  }
}

async function ensureExam() {
  const examPayload = {
    exam: "NEET",
    year: 2025,
    exam_type: "NEET UG",
    exam_date: "2025-05-04",
    shift: "Shift 1",
    paper_code: "Narmada 48",
    duration_minutes: 180,
    total_marks: 720,
    status: "PUBLISHED",
    is_published: true,
    attempt: "NEET 2025 Official",
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: lookupError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("paper_code", "Narmada 48")
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { error } = await supabase.from("pyq_exams").update(examPayload).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("pyq_exams")
    .insert(examPayload)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function uploadImages(manifest) {
  const uploaded = [];
  for (let start = 0; start < manifest.length; start += 12) {
    const group = manifest.slice(start, start + 12);
    const rows = await Promise.all(
      group.map(async (item) => {
        const image = await fs.readFile(item.image_path);
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(item.storage_path, image, { contentType: "image/png", upsert: true });
        if (error) {
          throw new Error(`Question ${item.number} image upload failed: ${error.message}`);
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(item.storage_path);
        return { ...item, question_image: data.publicUrl };
      })
    );
    uploaded.push(...rows);
    console.log(`Uploaded images through question ${group.at(-1).number}`);
  }
  return uploaded;
}

async function insertRows(rows) {
  let inserted = 0;
  for (let start = 0; start < rows.length; start += 30) {
    const batch = rows.slice(start, start + 30);
    const { error } = await supabase.from("pyq_questions").insert(batch);
    if (error) throw new Error(`Question insert failed at ${start + 1}: ${error.message}`);
    inserted += batch.length;
    console.log(`Inserted questions ${start + 1}-${start + batch.length}`);
  }
  return inserted;
}

async function updateRowsInPlace(rows) {
  const { data: existing, error } = await supabase
    .from("pyq_questions")
    .select("id")
    .eq("exam", EXAM_FILTER.exam)
    .eq("year", EXAM_FILTER.year)
    .eq("paper_code", EXAM_FILTER.paper_code)
    .order("id", { ascending: true });
  if (error) throw error;
  if ((existing || []).length !== rows.length) {
    throw new Error(
      `Cannot replace in place: expected ${rows.length} existing rows, found ${(existing || []).length}`
    );
  }

  let updated = 0;
  for (let index = 0; index < rows.length; index += 1) {
    const { error: updateError } = await supabase
      .from("pyq_questions")
      .update(rows[index])
      .eq("id", existing[index].id);
    if (updateError) {
      throw new Error(`Question update failed at ${index + 1}: ${updateError.message}`);
    }
    updated += 1;
    if (updated % 30 === 0) console.log(`Updated ${updated} existing questions`);
  }
  return updated;
}

async function validationSummary(examId) {
  const { data, error } = await supabase
    .from("pyq_questions")
    .select("id,subject,chapter,question,question_image,option_a_image,option_b_image,option_c_image,option_d_image,correct_option,correct_options,question_type,status")
    .eq("exam_id", examId)
    .eq("exam", EXAM_FILTER.exam)
    .eq("year", EXAM_FILTER.year)
    .eq("paper_code", EXAM_FILTER.paper_code);
  if (error) throw error;

  const rows = data || [];
  const normalized = new Map();
  let duplicateCount = 0;
  for (const row of rows) {
    const key = String(row.question || "").trim().toLowerCase();
    if (normalized.has(key)) duplicateCount += 1;
    else normalized.set(key, row.id);
  }

  return {
    total: rows.length,
    physics: rows.filter((row) => row.subject === "Physics").length,
    chemistry: rows.filter((row) => row.subject === "Chemistry").length,
    biology: rows.filter((row) => row.subject === "Biology").length,
    questionsContainingImages: rows.filter((row) => Boolean(row.question_image)).length,
    questionsContainingImageOptions: rows.filter((row) =>
      Boolean(row.option_a_image || row.option_b_image || row.option_c_image || row.option_d_image)
    ).length,
    questionsContainingTables: rows.filter((row) => /<table|^\|/im.test(row.question || "")).length,
    questionsMissingCorrectOption: rows.filter((row) => !row.correct_option && !row.correct_options).length,
    questionsMissingChapter: rows.filter((row) => !row.chapter).length,
    questionsRequiringManualReview: rows.filter((row) => row.status === "NEEDS_REVIEW").length,
    duplicateCount,
  };
}

const outputDir = path.dirname(path.resolve(manifestPath));
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest) || manifest.length !== 180) {
  throw new Error("The manifest must contain exactly 180 questions");
}
if (manifest.some((item, index) => item.number !== index + 1)) {
  throw new Error("The manifest question numbers must be exactly 1 through 180");
}

const { error: bucketError } = await supabase.storage.getBucket(BUCKET);
if (bucketError) throw new Error(`The ${BUCKET} storage bucket is unavailable: ${bucketError.message}`);

const examId = await ensureExam();
const uploaded = await uploadImages(manifest);

const { data: pkgData, error: pkgError } = await supabase
  .from("pyq_import_packages")
  .insert([{ name: "NEET 2025 Clean Import", status: "NEEDS_REVIEW" }])
  .select("id")
  .single();
if (pkgError) throw pkgError;

const preparedRows = uploaded.map((item) => ({
  ...stripGeneratedFields(item),
  exam_id: examId,
  import_package_id: pkgData.id,
}));

await fs.writeFile(path.join(outputDir, "neet-2025-pyq.csv"), toCsv(preparedRows), "utf8");

const existingRows = await fetchAllExisting();
await fs.writeFile(
  path.join(outputDir, "review", "neet-2025-existing-backup.json"),
  JSON.stringify(existingRows, null, 2),
  "utf8"
).catch(async (error) => {
  if (error.code !== "ENOENT") throw error;
  await fs.mkdir(path.join(outputDir, "review"), { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "review", "neet-2025-existing-backup.json"),
    JSON.stringify(existingRows, null, 2),
    "utf8"
  );
});

const { error: deleteError } = await supabase
  .from("pyq_questions")
  .delete()
  .eq("exam", EXAM_FILTER.exam)
  .eq("year", EXAM_FILTER.year)
  .eq("paper_code", EXAM_FILTER.paper_code);
let inserted = 0;
let updatedInPlace = 0;
let physicalDeleteBlocked = false;
if (deleteError) {
  if (deleteError.code !== "23503") throw deleteError;
  physicalDeleteBlocked = true;
  updatedInPlace = await updateRowsInPlace(preparedRows);
} else {
  inserted = await insertRows(preparedRows);
}
const summary = await validationSummary(examId);

const { error: examUpdateError } = await supabase
  .from("pyq_exams")
  .update({ updated_at: new Date().toISOString() })
  .eq("id", examId);
if (examUpdateError) throw examUpdateError;

const report = {
  sourceQuestionsDetected: manifest.length,
  oldRowsDeleted: physicalDeleteBlocked ? 0 : existingRows.length,
  oldRowsUpdatedInPlace: updatedInPlace,
  physicalDeleteBlocked,
  physicalDeleteBlockReason: physicalDeleteBlocked
    ? "Existing NEET 2025 rows are referenced by pyq_attempts, so rows were overwritten in place to preserve foreign keys."
    : null,
  inserted,
  table: "pyq_questions",
  examTable: "pyq_exams",
  importPackageTable: "pyq_import_packages",
  storageBucket: BUCKET,
  examId,
  importPackageId: pkgData.id,
  csvPath: path.join(outputDir, "neet-2025-pyq.csv"),
  backupPath: path.join(outputDir, "review", "neet-2025-existing-backup.json"),
  validation: summary,
};

await fs.writeFile(path.join(outputDir, "import-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
