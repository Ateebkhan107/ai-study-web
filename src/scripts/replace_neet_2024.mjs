import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const WORK_DIR = path.join(ROOT, "tmp", "neet-2024-clean");
const QUESTION_DIR = path.join(ROOT, "tmp", "neet-ug-2024", "question-images");
const SOLUTION_DIR = path.join(ROOT, "tmp", "neet-ug-2024", "solution-images");
const MANIFEST_PATH = path.join(ROOT, "tmp", "neet-ug-2024", "neet-ug-2024-manifest.json");
const CSV_PATH = path.join(WORK_DIR, "neet-2024-pyq.csv");
const BACKUP_PATH = path.join(WORK_DIR, "neet-2024-backup.json");
const REPORT_PATH = path.join(WORK_DIR, "import-report.json");
const BUCKET = "pyq-images";
const PAPER_CODE = "NEET 2024";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase credentials in .env.local");
}

const questionNumber = (row) => {
  const explicit = Number(row.question_number);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 200) return explicit;
  const match = String(row.question || "").match(/^Question\s+(\d+)\s*:/i);
  return match ? Number(match[1]) : null;
};

const publicUrl = (objectPath) =>
  supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;

async function fetchOldRows() {
  const { data, error } = await supabase
    .from("pyq_questions")
    .select("*")
    .eq("exam", "NEET")
    .eq("year", 2024)
    .eq("paper_code", PAPER_CODE);
  if (error) throw error;
  return data || [];
}

async function fetchAttempts(ids) {
  const rows = [];
  for (let index = 0; index < ids.length; index += 40) {
    const { data, error } = await supabase
      .from("pyq_attempts")
      .select("*")
      .in("question_id", ids.slice(index, index + 40));
    if (error) throw error;
    rows.push(...(data || []));
  }
  return rows;
}

async function assertLocalAssets() {
  const missing = [];
  for (let number = 1; number <= 200; number += 1) {
    for (const [kind, directory] of [["question", QUESTION_DIR], ["solution", SOLUTION_DIR]]) {
      const filename = `neet-ug-2024-${kind}-${String(number).padStart(3, "0")}.png`;
      try {
        const stat = await fs.stat(path.join(directory, filename));
        if (stat.size < 1000) missing.push(`${filename} (too small)`);
      } catch {
        missing.push(filename);
      }
    }
  }
  if (missing.length) throw new Error(`Missing/invalid local assets: ${missing.join(", ")}`);
}

function buildRows(manifest, oldRows, examId, packageId) {
  const oldByNumber = new Map(oldRows.map((row) => [questionNumber(row), row]));
  if (oldByNumber.size !== 200 || oldByNumber.has(null)) {
    throw new Error(`Could not map all ${oldRows.length} old rows to official numbers 1-200`);
  }

  return manifest.map((source, index) => {
    const number = index + 1;
    if (source.number !== number) throw new Error(`Manifest is out of order at question ${number}`);
    const old = oldByNumber.get(number);
    if (!old) throw new Error(`No existing canonical metadata for question ${number}`);
    const questionObject = `neet-ug-2024/question-${String(number).padStart(3, "0")}.png`;
    const solutionObject = `neet-ug-2024/solution-${String(number).padStart(3, "0")}.png`;
    return {
      id: old.id,
      exam: "NEET",
      subject: source.subject,
      chapter: old.chapter,
      question: source.question,
      option_a: source.option_a,
      option_b: source.option_b,
      option_c: source.option_c,
      option_d: source.option_d,
      correct_option: String(source.correct_option).toUpperCase(),
      explanation: source.explanation || null,
      year: 2024,
      exam_type: "NEET UG",
      attempt: "NEET 2024 Official",
      shift: "Single Shift",
      question_type: source.question_type || "MCQ",
      numerical_answer: null,
      marks_positive: 4,
      marks_negative: -1,
      question_image: publicUrl(questionObject),
      correct_options: null,
      numerical_min: null,
      numerical_max: null,
      paper_code: PAPER_CODE,
      explanation_image: publicUrl(solutionObject),
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null,
      exam_id: examId,
      question_number: number,
      display_order: number,
      difficulty: old.difficulty || null,
      topic: old.topic || null,
      import_package_id: packageId,
      status: "PUBLISHED",
      confidence_score: old.confidence_score || null,
    };
  });
}

async function uploadAssets() {
  let uploaded = 0;
  for (let start = 1; start <= 200; start += 10) {
    const numbers = Array.from({ length: Math.min(10, 201 - start) }, (_, i) => start + i);
    await Promise.all(numbers.flatMap((number) => ["question", "solution"].map(async (kind) => {
      const directory = kind === "question" ? QUESTION_DIR : SOLUTION_DIR;
      const filename = `neet-ug-2024-${kind}-${String(number).padStart(3, "0")}.png`;
      const objectPath = `neet-ug-2024/${kind}-${String(number).padStart(3, "0")}.png`;
      const bytes = await fs.readFile(path.join(directory, filename));
      const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
        contentType: "image/png",
        upsert: true,
      });
      if (error) throw new Error(`Upload failed for ${objectPath}: ${error.message}`);
      uploaded += 1;
    })));
  }
  return uploaded;
}

async function insertBatches(table, rows, size = 25) {
  for (let index = 0; index < rows.length; index += size) {
    const { error } = await supabase.from(table).insert(rows.slice(index, index + size));
    if (error) throw new Error(`${table} insert ${index + 1}-${index + size} failed: ${error.message}`);
  }
}

async function main() {
  await fs.mkdir(WORK_DIR, { recursive: true });
  await assertLocalAssets();
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(manifest) || manifest.length !== 200) throw new Error("Expected a 200-question manifest");

  const oldRows = await fetchOldRows();
  if (oldRows.length !== 200) throw new Error(`Refusing replacement: expected 200 old rows, found ${oldRows.length}`);
  const ids = oldRows.map((row) => row.id);
  const attempts = await fetchAttempts(ids);
  const examIds = [...new Set(oldRows.map((row) => row.exam_id).filter(Boolean))];
  const packageIds = [...new Set(oldRows.map((row) => row.import_package_id).filter(Boolean))];
  if (examIds.length !== 1 || packageIds.length !== 1) {
    throw new Error(`Expected one exam/package, found ${examIds.length}/${packageIds.length}`);
  }

  const rows = buildRows(manifest, oldRows, examIds[0], packageIds[0]);
  const duplicateNumbers = rows.length - new Set(rows.map((row) => row.question_number)).size;
  const invalidAnswers = rows.filter((row) => !["A", "B", "C", "D"].includes(row.correct_option));
  if (duplicateNumbers || invalidAnswers.length) throw new Error("Question numbers or answer keys failed validation");

  await fs.writeFile(BACKUP_PATH, JSON.stringify({ questions: oldRows, attempts }, null, 2));
  await fs.writeFile(CSV_PATH, Papa.unparse(rows, { newline: "\n" }));

  const report = {
    mode: APPLY ? "apply" : "dry-run",
    detected: rows.length,
    oldRowsMatched: oldRows.length,
    dependentAttemptsPreserved: attempts.length,
    breakdown: Object.fromEntries(["Physics", "Chemistry", "Biology"].map((subject) => [subject, rows.filter((row) => row.subject === subject).length])),
    questionImages: 200,
    explanationImages: 200,
    optionImages: 0,
    tablesPreservedAsImages: rows.filter((row) => /match list|list i|table|column i/i.test(row.question)).length,
    missingCorrectOption: invalidAnswers.length,
    missingChapter: rows.filter((row) => !row.chapter).length,
    needsReview: 0,
    duplicateCount: duplicateNumbers,
    table: "pyq_questions",
    bucket: BUCKET,
    csvPath: CSV_PATH,
    backupPath: BACKUP_PATH,
  };

  if (APPLY) {
    report.uploadedAssets = await uploadAssets();
    const { error: attemptDeleteError } = await supabase.from("pyq_attempts").delete().in("id", attempts.map((row) => row.id));
    if (attemptDeleteError) throw new Error(`Could not temporarily remove dependent attempts: ${attemptDeleteError.message}`);
    const { error: deleteError, count: deletedCount } = await supabase
      .from("pyq_questions")
      .delete({ count: "exact" })
      .in("id", ids)
      .eq("exam", "NEET")
      .eq("year", 2024)
      .eq("paper_code", PAPER_CODE);
    if (deleteError || deletedCount !== 200) throw new Error(`Question delete failed: ${deleteError?.message || `deleted ${deletedCount}`}`);
    report.deleted = deletedCount;

    try {
      await insertBatches("pyq_questions", rows);
      await insertBatches("pyq_attempts", attempts);
    } catch (error) {
      await supabase.from("pyq_questions").delete().in("id", ids);
      await insertBatches("pyq_questions", oldRows);
      await insertBatches("pyq_attempts", attempts);
      throw new Error(`Replacement failed and backup was restored: ${error.message}`);
    }

    const imported = await fetchOldRows();
    const restoredAttempts = await fetchAttempts(ids);
    report.imported = imported.length;
    report.restoredAttempts = restoredAttempts.length;
    report.duplicateCount = imported.length - new Set(imported.map(questionNumber)).size;
    report.missingCorrectOption = imported.filter((row) => !["A", "B", "C", "D"].includes(row.correct_option)).length;
    report.missingChapter = imported.filter((row) => !row.chapter).length;
    if (imported.length !== 200 || restoredAttempts.length !== attempts.length || report.duplicateCount) {
      throw new Error("Post-import verification failed; inspect backup and live data immediately");
    }
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
