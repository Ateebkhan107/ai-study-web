import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const BUCKET = "pyq-images";
const TIGHT_ROOT = path.join(process.cwd(), "tmp", "jee-main-2026-january-tight-question-images");
const BACKUP_ROOT = "jee-main-2026-january-backups/2026-08-10";
const TARGET_ROOT = "jee-main-2026-january-tight";
const REPORT_PATH = path.join(process.cwd(), "tmp", "jee-main-2026-january-tight-upload-report.json");
const MANUAL_REVIEW_BY_PAPER = {
  "JEE-MAIN-26-21JAN-S1": new Set([58, 62, 70, 75]),
};

const paperCode = process.argv[2];
if (!paperCode) {
  throw new Error("Usage: node src/scripts/upload_jee_main_2026_january_tight_crops.mjs PAPER_CODE");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function paperSlug(code) {
  const match = code.match(/^JEE-MAIN-26-(\d{2}JAN)-S([12])$/);
  if (!match) throw new Error(`Unexpected paper code: ${code}`);
  const [, day, shift] = match;
  return `${day.toLowerCase()}-shift-${shift}`;
}

async function fetchCurrentImage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
  if (!response.ok) {
    throw new Error(`Failed to download current image backup: ${response.status} ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

const slug = paperSlug(paperCode);
const manualReview = MANUAL_REVIEW_BY_PAPER[paperCode] ?? new Set();
const { data: rows, error: rowsError } = await supabase
  .from("pyq_questions")
  .select("id, question_number, question_image")
  .eq("paper_code", paperCode)
  .order("question_number", { ascending: true });

if (rowsError) throw rowsError;
if (rows.length !== 75) throw new Error(`${paperCode}: expected 75 rows, found ${rows.length}`);

const report = {
  paperCode,
  totalQuestions: rows.length,
  skippedManualReview: [...manualReview].sort((a, b) => a - b),
  uploaded: 0,
  updated: 0,
  rows: [],
};

for (const row of rows) {
  const questionNumber = Number(row.question_number);
  if (manualReview.has(questionNumber)) {
    report.rows.push({
      questionNumber,
      skipped: true,
      reason: "Existing/source crop is clipped and needs PDF-level recrop.",
      existingQuestionImage: row.question_image,
    });
    continue;
  }

  const paddedNumber = String(questionNumber).padStart(2, "0");
  const localImagePath = path.join(TIGHT_ROOT, paperCode, `q${paddedNumber}.png`);
  const targetObjectPath = `${TARGET_ROOT}/${slug}/q${paddedNumber}.png`;
  const backupObjectPath = `${BACKUP_ROOT}/${slug}/q${paddedNumber}.png`;
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(targetObjectPath).data.publicUrl;

  if (row.question_image === publicUrl) {
    report.rows.push({
      questionNumber,
      skipped: true,
      reason: "Already points to tight crop.",
      existingQuestionImage: row.question_image,
    });
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
    console.error(`${paperCode} Q${paddedNumber}: already updated`);
    continue;
  }

  const tightImage = await fs.readFile(localImagePath);
  const backupImage = await fetchCurrentImage(row.question_image);

  const { error: backupError } = await supabase.storage
    .from(BUCKET)
    .upload(backupObjectPath, backupImage, { contentType: "image/png", upsert: true });
  if (backupError) throw backupError;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(targetObjectPath, tightImage, { contentType: "image/png", upsert: true });
  if (uploadError) throw uploadError;

  const backupUrl = supabase.storage.from(BUCKET).getPublicUrl(backupObjectPath).data.publicUrl;
  const { error: updateError } = await supabase
    .from("pyq_questions")
    .update({ question_image: publicUrl })
    .eq("id", row.id);
  if (updateError) throw updateError;

  report.uploaded += 1;
  report.updated += 1;
  report.rows.push({
    questionNumber,
    skipped: false,
    originalQuestionImage: row.question_image,
    backupQuestionImage: backupUrl,
    tightQuestionImage: publicUrl,
  });
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
  console.error(`${paperCode} Q${paddedNumber}: uploaded and updated`);
}

await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  reportPath: REPORT_PATH,
  totalQuestions: report.totalQuestions,
  uploaded: report.uploaded,
  updated: report.updated,
  skippedManualReview: report.skippedManualReview,
}, null, 2));
