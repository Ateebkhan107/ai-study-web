import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const PAPER_CODES = [
  "JEE-MAIN-24-27JAN-S1",
  "JEE-MAIN-24-27JAN-S2",
  "JEE-MAIN-24-29JAN-S1",
  "JEE-MAIN-24-29JAN-S2",
  "JEE-MAIN-24-30JAN-S1",
  "JEE-MAIN-24-30JAN-S2",
  "JEE-MAIN-24-31JAN-S1",
  "JEE-MAIN-24-31JAN-S2",
  "JEE-MAIN-24-01FEB-S1",
  "JEE-MAIN-24-01FEB-S2",
];
const requestedPapers = process.argv.slice(2);
const activePaperCodes = requestedPapers.length ? requestedPapers : PAPER_CODES;

const CLEAN_ROOT = path.join(process.cwd(), "tmp", "jee-main-2024-january-clean-question-images");
const reportPath = path.join(process.cwd(), "tmp", "jee-main-2024-january-cropped-image-report.json");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const report = {
  paperCodes: activePaperCodes,
  updated: 0,
  uploaded: 0,
  perPaper: {},
};

function paperSlug(paperCode) {
  const match = paperCode.match(/^JEE-MAIN-24-(\d{2}(?:JAN|FEB))-S([12])$/);
  if (!match) throw new Error(`Unexpected paper code: ${paperCode}`);
  const [, day, shift] = match;
  return `${day.toLowerCase()}-shift-${shift}-cleaned`;
}

for (const paperCode of activePaperCodes) {
  console.error(`Starting ${paperCode}`);

  const { data: rows, error: rowsError } = await supabase
    .from("pyq_questions")
    .select("id, question_number, question_image")
    .eq("paper_code", paperCode)
    .order("question_number", { ascending: true });

  if (rowsError) throw rowsError;
  if (rows.length !== 90) throw new Error(`${paperCode}: expected 90 rows, found ${rows.length}`);

  const perPaper = [];

  for (const row of rows) {
    const number = String(row.question_number).padStart(2, "0");
    const localImagePath = path.join(CLEAN_ROOT, paperCode, `q${number}.png`);
    const objectPath = `jee-main-2024/${paperSlug(paperCode)}/q${number}.png`;
    const fileBuffer = await fs.readFile(localImagePath);

    const { error: uploadError } = await supabase.storage
      .from("pyq-images")
      .upload(objectPath, fileBuffer, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
    const { error: updateError } = await supabase
      .from("pyq_questions")
      .update({ question_image: publicUrl })
      .eq("id", row.id);
    if (updateError) throw updateError;

    report.uploaded += 1;
    report.updated += 1;
    perPaper.push({
      questionNumber: row.question_number,
      originalQuestionImage: row.question_image,
      croppedQuestionImage: publicUrl,
    });
  }

  report.perPaper[paperCode] = {
    updated: perPaper.length,
    uploaded: perPaper.length,
    rows: perPaper,
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.error(`Finished ${paperCode}: ${perPaper.length} rows`);
}

await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ reportPath, updated: report.updated, uploaded: report.uploaded }, null, 2));
