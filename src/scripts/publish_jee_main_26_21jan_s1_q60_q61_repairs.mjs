/** Publish distinct, diagram-only Q60 and Q61 image repairs. */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const paperCode = "JEE-MAIN-26-21JAN-S1";
const version = "20260830-q60q61-distinct1";
const repairs = [
  { questionNumber: 60, fileName: "q60.png" },
  { questionNumber: 61, fileName: "q61.png" },
];
const questionNumbers = repairs.map(({ questionNumber }) => questionNumber);
const selectFields = "id,question_number,correct_option,numerical_answer,question_image";

const { data: before, error: beforeError } = await supabase
  .from("pyq_questions")
  .select(selectFields)
  .eq("paper_code", paperCode)
  .in("question_number", questionNumbers)
  .order("question_number");
if (beforeError) throw beforeError;
if (before.length !== repairs.length) throw new Error("Expected exactly two live question rows");

const expectedHashes = new Map();
for (const { questionNumber, fileName } of repairs) {
  const localImage = path.join(
    process.cwd(),
    "tmp/jee-main-2026-january-clean",
    paperCode,
    "final-diagrams",
    fileName,
  );
  const imageBytes = await fs.readFile(localImage);
  const expectedHash = crypto.createHash("sha256").update(imageBytes).digest("hex");
  expectedHashes.set(questionNumber, expectedHash);

  const objectPath = `jee-main-2026-jan/${paperCode}/q${questionNumber}_diagram_${version}.png`;
  const { error: uploadError } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, imageBytes, {
      contentType: "image/png",
      cacheControl: "31536000",
      upsert: false,
    });
  if (uploadError) throw new Error(`Q${questionNumber} upload: ${uploadError.message}`);

  const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  const { error: updateError } = await supabase
    .from("pyq_questions")
    .update({ question_image: `${publicUrl}?v=${version}` })
    .eq("paper_code", paperCode)
    .eq("question_number", questionNumber);
  if (updateError) throw new Error(`Q${questionNumber} update: ${updateError.message}`);
}

const { data: after, error: afterError } = await supabase
  .from("pyq_questions")
  .select(selectFields)
  .eq("paper_code", paperCode)
  .in("question_number", questionNumbers)
  .order("question_number");
if (afterError) throw afterError;

const liveHashes = new Map();
for (const previous of before) {
  const current = after.find(({ id }) => id === previous.id);
  if (!current) throw new Error(`Q${previous.question_number} disappeared during verification`);
  if (
    current.correct_option !== previous.correct_option ||
    current.numerical_answer !== previous.numerical_answer
  ) {
    throw new Error(`Q${previous.question_number} answer key changed unexpectedly`);
  }
  if (!current.question_image.endsWith(`?v=${version}`)) {
    throw new Error(`Q${previous.question_number} image version was not updated`);
  }

  const response = await fetch(current.question_image);
  if (!response.ok) throw new Error(`Q${previous.question_number} live image fetch failed`);
  const liveHash = crypto
    .createHash("sha256")
    .update(Buffer.from(await response.arrayBuffer()))
    .digest("hex");
  liveHashes.set(previous.question_number, liveHash);
  if (liveHash !== expectedHashes.get(previous.question_number)) {
    throw new Error(`Q${previous.question_number} live image differs from the verified source`);
  }
}

if (liveHashes.get(60) === liveHashes.get(61)) {
  throw new Error("Q60 and Q61 still contain identical image bytes");
}

console.log(JSON.stringify({
  paperCode,
  after,
  hashes: Object.fromEntries(liveHashes),
  distinctImages: true,
  answerKeysPreserved: true,
}, null, 2));
