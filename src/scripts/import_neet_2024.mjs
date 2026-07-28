/**
 * Upload a manifest produced by prepare_neet_2025.py.
 *
 * The script refuses to overwrite an existing NEET 2025 paper. It uploads the
 * source-faithful question visuals first, then inserts the 200 question rows.
 * Run with: node src/scripts/import_neet_2024.mjs tmp/neet-ug-2024/neet-ug-2024-manifest.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from 'ws';

globalThis.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const manifestPath = process.argv[2];
if (!manifestPath) {
  throw new Error("Usage: node src/scripts/import_neet_2024.mjs MANIFEST_PATH");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest) || manifest.length !== 200) {
  throw new Error("The manifest must contain exactly 200 questions");
}
if (manifest.some((item, index) => item.number !== index + 1)) {
  throw new Error("The manifest question numbers must be exactly 1 through 200");
}

const { count, error: countError } = await supabase
  .from("pyq_questions")
  .select("id", { count: "exact", head: true })
  .eq("exam", "NEET")
  .eq("year", 2024)
  .eq("paper_code", "NEET 2024");

if (countError) throw countError;
if (count > 0) {
  throw new Error(`Import stopped: ${count} NEET 2024 records already exist.`);
}

const { error: bucketError } = await supabase.storage.getBucket("pyq-images");
if (bucketError) {
  throw new Error(`The pyq-images storage bucket is unavailable: ${bucketError.message}`);
}

const records = [];
for (let start = 0; start < manifest.length; start += 12) {
  const group = manifest.slice(start, start + 12);
  const uploaded = await Promise.all(group.map(async (item) => {
  const imagePath = item.image_path;
  const objectPath = `neet-ug-2024/question-${String(item.number).padStart(3, "0")}.png`;
  const image = await fs.readFile(imagePath);
  const { error: uploadError } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, image, { contentType: "image/png", upsert: true });
  if (uploadError) {
    throw new Error(`Question ${item.number} image upload failed: ${uploadError.message}`);
  }
  const { data: publicUrl } = supabase.storage.from("pyq-images").getPublicUrl(objectPath);
  const { number, image_path, ...record } = item;
  return { ...record, question_image: publicUrl.publicUrl };
  }));
  records.push(...uploaded);
  console.log(`Uploaded images through question ${group.at(-1).number}`);
}

const { data: pkgData, error: pkgErr } = await supabase
  .from("pyq_import_packages")
  .insert([{ name: "NEET 2024 (Auto Import)" }])
  .select("id")
  .single();
if (pkgErr) throw pkgErr;
const packageId = pkgData.id;

for (let index = 0; index < records.length; index += 30) {
  const batch = records.slice(index, index + 30).map(r => ({
    ...r,
    import_package_id: packageId,
    status: 'PENDING_REVIEW'
  }));
  const { error } = await supabase.from("pyq_questions").insert(batch);
  if (error) throw new Error(`Question insert failed at ${index + 1}: ${error.message}`);
  console.log(`Inserted questions ${index + 1}-${index + batch.length}`);
}

const { data: imported, count: importedCount, error: verifyError } = await supabase
  .from("pyq_questions")
  .select("id, subject, question", { count: "exact" })
  .eq("exam", "NEET")
  .eq("year", 2024)
  .eq("paper_code", "NEET 2024")
  .order("id");

if (verifyError) throw verifyError;
if (importedCount !== 200) {
  throw new Error(`Import verification failed: expected 200 rows, found ${importedCount}`);
}

const breakdown = Object.fromEntries(
  ["Physics", "Chemistry", "Biology"].map((subject) => [
    subject,
    imported.filter((item) => item.subject === subject).length,
  ])
);
console.log(JSON.stringify({ imported: importedCount, breakdown }, null, 2));
