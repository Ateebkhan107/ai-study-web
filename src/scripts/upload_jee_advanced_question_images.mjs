/** Upload clean source-paper screenshots and replace garbled extracted question text. */
import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const dryRun = process.argv.includes("--dry-run");
const imageVersion = "20260801-paragraph-order";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase credentials are required");
}

const papers = [2023, 2024, 2025].flatMap(year => [1, 2].map(number => ({
  year,
  number,
  code: `JEE-ADV-${String(year).slice(2)}-P${number}`,
})));

async function uploadQuestion(paper, item, row) {
  const objectPath = `jee-advanced/${paper.year}/paper-${paper.number}/q${String(item.question_number).padStart(2, "0")}.jpg`;
  const bytes = await fs.readFile(item.image);
  const { error: uploadError } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, bytes, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw new Error(`${paper.code} Q${item.question_number} upload: ${uploadError.message}`);

  const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  const questionImage = `${publicUrl}?v=${imageVersion}`;
  const { error: updateError } = await supabase.from("pyq_questions").update({
    question: `Question ${item.question_number}: Refer to the source image.`,
    option_a: "Option A",
    option_b: "Option B",
    option_c: "Option C",
    option_d: "Option D",
    question_image: questionImage,
  }).eq("id", row.id);
  if (updateError) throw new Error(`${paper.code} Q${item.question_number} update: ${updateError.message}`);
}

for (const paper of papers) {
  const manifestPath = `tmp/jee-advanced/${paper.year}/paper-${paper.number}/image-manifest.json`;
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const expected = paper.year === 2025 ? 48 : 51;
  const { data: rows, error } = await supabase
    .from("pyq_questions")
    .select("id,question_number")
    .eq("paper_code", paper.code)
    .order("question_number");
  if (error) throw new Error(`${paper.code}: ${error.message}`);
  if (manifest.length !== expected || rows.length !== expected) {
    throw new Error(`${paper.code}: expected ${expected}; found ${manifest.length} images and ${rows.length} database rows`);
  }
  const byNumber = new Map(rows.map(row => [row.question_number, row]));
  if (dryRun) {
    console.log(JSON.stringify({ paper: paper.code, images: manifest.length, dryRun: true }));
    continue;
  }
  for (let start = 0; start < manifest.length; start += 10) {
    await Promise.all(manifest.slice(start, start + 10).map(item => {
      const row = byNumber.get(item.question_number);
      if (!row) throw new Error(`${paper.code}: missing database Q${item.question_number}`);
      return uploadQuestion(paper, item, row);
    }));
  }
  console.log(JSON.stringify({ paper: paper.code, uploaded: manifest.length }));
}
