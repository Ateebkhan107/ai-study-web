import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "tmp", "jee-main-2024-january-question-image-manifest.json");
const IMAGE_ROOT = path.join(ROOT, "tmp", "jee-main-2024-january-tight-required-images");
const REPORT_PATH = path.join(ROOT, "tmp", "jee-main-2024-january-tight-required-upload-report.json");
const BUCKET = "pyq-images";

const PAPER_TO_FOLDER = {
  "JEE-MAIN-24-27JAN-S1": "27jan-s1",
  "JEE-MAIN-24-27JAN-S2": "27jan-s2",
  "JEE-MAIN-24-29JAN-S1": "29jan-s1",
  "JEE-MAIN-24-29JAN-S2": "29jan-s2",
  "JEE-MAIN-24-30JAN-S1": "30jan-s1",
  "JEE-MAIN-24-30JAN-S2": "30jan-s2",
  "JEE-MAIN-24-31JAN-S1": "31jan-s1",
  "JEE-MAIN-24-31JAN-S2": "31jan-s2",
  "JEE-MAIN-24-01FEB-S1": "01feb-s1",
  "JEE-MAIN-24-01FEB-S2": "01feb-s2",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
const rows = manifest.filter((row) => row.question_image);
const timestamp = Date.now();
const report = {
  sourceManifest: MANIFEST_PATH,
  imageRoot: IMAGE_ROOT,
  updatedAt: new Date().toISOString(),
  updated: 0,
  uploaded: 0,
  skipped: [],
  rows: [],
};

for (const row of rows) {
  const folder = PAPER_TO_FOLDER[row.paper_code];
  if (!folder) throw new Error(`Unsupported paper_code: ${row.paper_code}`);

  const number = String(row.question_number).padStart(2, "0");
  const localPath = path.join(IMAGE_ROOT, folder, `q${number}.png`);

  try {
    await fs.access(localPath);
  } catch {
    report.skipped.push({ ...row, reason: "Missing local tight crop", localPath });
    continue;
  }

  const objectPath = `jee-main-2024/january-tight-required/${row.paper_code}/q${number}.png`;
  const fileBuffer = await fs.readFile(localPath);
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, fileBuffer, { contentType: "image/png", upsert: true });

  if (uploadError) {
    throw new Error(`${row.paper_code} Q${row.question_number}: upload failed: ${uploadError.message}`);
  }

  const publicUrl = `${supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl}?v=${timestamp}`;
  const { error: updateError } = await supabase
    .from("pyq_questions")
    .update({ question_image: publicUrl })
    .eq("id", row.id);

  if (updateError) {
    throw new Error(`${row.paper_code} Q${row.question_number}: DB update failed: ${updateError.message}`);
  }

  report.uploaded += 1;
  report.updated += 1;
  report.rows.push({
    id: row.id,
    paper_code: row.paper_code,
    question_number: row.question_number,
    original_question_image: row.question_image,
    cleaned_question_image: publicUrl,
    localPath,
  });

  if (report.updated % 10 === 0) {
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
  }
}

await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  reportPath: REPORT_PATH,
  updated: report.updated,
  uploaded: report.uploaded,
  skipped: report.skipped.length,
}, null, 2));
