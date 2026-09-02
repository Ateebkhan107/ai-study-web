/** Replace corrupted multi-question composites with one diagram per question. */
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
const version = "20260829-single-diagram1";
const repairs = [38, 39, 43, 44, 46].map((questionNumber) => ({
  questionNumber,
  fileName: `q${questionNumber}.png`,
}));
const questionNumbers = repairs.map(({ questionNumber }) => questionNumber);

const selectFields = "id,question_number,correct_option,numerical_answer,question_image";
const { data: before, error: beforeError } = await supabase
  .from("pyq_questions")
  .select(selectFields)
  .eq("paper_code", paperCode)
  .in("question_number", questionNumbers)
  .order("question_number");
if (beforeError) throw beforeError;
if (before.length !== repairs.length) {
  throw new Error(`Expected ${repairs.length} live question rows, found ${before.length}`);
}

for (const { questionNumber, fileName } of repairs) {
  const localImage = path.join(
    process.cwd(),
    "tmp/jee-main-2026-january-clean",
    paperCode,
    "final-diagrams",
    fileName,
  );
  const image = await fs.readFile(localImage);
  const objectPath = `jee-main-2026-jan/${paperCode}/q${questionNumber}_diagram.png`;
  const { error: uploadError } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, image, {
      contentType: "image/png",
      cacheControl: "0",
      upsert: true,
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
}

console.log(JSON.stringify({ paperCode, repaired: questionNumbers, before, after, answerKeysPreserved: true }, null, 2));
