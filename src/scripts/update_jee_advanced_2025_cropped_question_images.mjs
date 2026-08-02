import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const PAPER_CODES = ["JEE-ADV-25-P1", "JEE-ADV-25-P2"];
const CLEAN_ROOT = path.join(process.cwd(), "tmp", "jee-advanced-2025-clean-question-images");
const reportPath = path.join(process.cwd(), "tmp", "jee-advanced-2025-cropped-image-report.json");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const report = {
  paperCodes: PAPER_CODES,
  updated: 0,
  uploaded: 0,
  perPaper: {},
};

function paperMeta(paperCode) {
  const match = paperCode.match(/^JEE-ADV-25-P([12])$/);
  if (!match) throw new Error(`Unexpected paper code: ${paperCode}`);
  return { paperNumber: match[1] };
}

for (const paperCode of PAPER_CODES) {
  console.error(`Starting ${paperCode}`);

  const { data: rows, error: rowsError } = await supabase
    .from("pyq_questions")
    .select("id, question_number, question_image")
    .eq("paper_code", paperCode)
    .order("question_number", { ascending: true });

  if (rowsError) throw rowsError;
  if (rows.length !== 48) throw new Error(`${paperCode}: expected 48 rows, found ${rows.length}`);

  const { paperNumber } = paperMeta(paperCode);
  const perPaper = [];

  for (const row of rows) {
    const number = String(row.question_number).padStart(2, "0");
    const localImagePath = path.join(CLEAN_ROOT, paperCode, `q${number}.jpg`);
    const objectPath = `jee-advanced/2025-cleaned/paper-${paperNumber}/q${number}.jpg`;
    const fileBuffer = await fs.readFile(localImagePath);

    const { error: uploadError } = await supabase.storage
      .from("pyq-images")
      .upload(objectPath, fileBuffer, { contentType: "image/jpeg", upsert: true });
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
