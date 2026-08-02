import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-25-22JAN-S1";
const CLEAN_DIR = path.join(process.cwd(), "tmp", "jee-main-25-22jan-s1-clean-question-images");
const REPORT_PATH = path.join(process.cwd(), "tmp", "jee-main-25-22jan-s1-cropped-image-report.json");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const { data: rows, error } = await supabase
  .from("pyq_questions")
  .select("id, question_number, question_image")
  .eq("paper_code", PAPER_CODE)
  .order("question_number", { ascending: true });

if (error) {
  throw new Error(`Failed to load ${PAPER_CODE} rows: ${error.message}`);
}

if (!rows || rows.length !== 75) {
  throw new Error(`Expected 75 rows for ${PAPER_CODE}, found ${rows?.length || 0}`);
}

const report = {
  paperCode: PAPER_CODE,
  updated: 0,
  uploaded: 0,
  rows: [],
};

for (const row of rows) {
  const filename = `q${String(row.question_number).padStart(2, "0")}.png`;
  const localPath = path.join(CLEAN_DIR, filename);
  const objectPath = `jee-main-2025/22-jan-shift-1-cleaned/${filename}`;
  const image = await fs.readFile(localPath);

  const upload = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, image, { contentType: "image/png", upsert: true });

  if (upload.error) {
    throw new Error(`Upload failed for Q${row.question_number}: ${upload.error.message}`);
  }

  const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;

  const { error: updateError } = await supabase
    .from("pyq_questions")
    .update({ question_image: publicUrl })
    .eq("id", row.id);

  if (updateError) {
    throw new Error(`Question image update failed for Q${row.question_number}: ${updateError.message}`);
  }

  report.updated += 1;
  report.uploaded += 1;
  report.rows.push({
    questionNumber: row.question_number,
    originalQuestionImage: row.question_image,
    croppedQuestionImage: publicUrl,
  });
}

await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ reportPath: REPORT_PATH, updated: report.updated, uploaded: report.uploaded }, null, 2));
