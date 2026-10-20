import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const IMAGE_ROOT = path.join(ROOT, "scratch", "jee2021", "images");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const repaired = {
  "JEE-MAIN-21-16MAR-S1": [34, 37, 41],
  "JEE-MAIN-21-16MAR-S2": [43, 50],
  "JEE-MAIN-21-17MAR-S1": [33, 36, 41],
  "JEE-MAIN-21-17MAR-S2": [42, 46],
  "JEE-MAIN-21-18MAR-S1": [31, 33, 37, 43, 45],
  "JEE-MAIN-21-18MAR-S2": [7, 17, 44],
};

const fields = ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"];
const suffixes = ["", "_opt_a", "_opt_b", "_opt_c", "_opt_d"];
const report = [];

for (const [paperCode, numbers] of Object.entries(repaired)) {
  for (const number of numbers) {
    const payload = {};
    let uploaded = 0;
    for (let index = 0; index < fields.length; index += 1) {
      const source = path.join(IMAGE_ROOT, paperCode, `q${number}${suffixes[index]}.png`);
      try {
        await fs.access(source);
      } catch {
        payload[fields[index]] = null;
        continue;
      }
      const objectPath = `jee-main-2021/${paperCode}/q${number}${suffixes[index]}.png`;
      if (APPLY) {
        const { error } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(source), {
          contentType: "image/png", cacheControl: "0", upsert: true,
        });
        if (error) throw new Error(`${paperCode} Q${number}: ${error.message}`);
      }
      payload[fields[index]] = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
      uploaded += 1;
    }
    if (APPLY) {
      const { data: existing, error: readError } = await supabase.from("pyq_questions")
        .select("id").eq("paper_code", paperCode).eq("question_number", number).single();
      if (readError) throw readError;
      const { error: updateError } = await supabase.from("pyq_questions").update(payload).eq("id", existing.id);
      if (updateError) throw updateError;
    }
    report.push({ paper_code: paperCode, question_number: number, uploaded, applied: APPLY });
  }
}

const physics = JSON.parse(await fs.readFile(path.join(ROOT, "scratch", "jee2021", "transcribed", "JEE-MAIN-21-17MAR-S2_Physics.json"), "utf8"));
const correctedQuestion = physics.find((row) => row.question_number === 15)?.question;
if (!correctedQuestion) throw new Error("Missing corrected March 17 Shift 2 Q15");
if (APPLY) {
  const { data: existing, error: readError } = await supabase.from("pyq_questions")
    .select("id").eq("paper_code", "JEE-MAIN-21-17MAR-S2").eq("question_number", 15).single();
  if (readError) throw readError;
  const { error: updateError } = await supabase.from("pyq_questions").update({ question: correctedQuestion }).eq("id", existing.id);
  if (updateError) throw updateError;
}

const mathematics = JSON.parse(await fs.readFile(path.join(ROOT, "scratch", "jee2021", "transcribed", "JEE-MAIN-21-17MAR-S1_Mathematics.json"), "utf8"));
const acceptedAnswerQuestion = mathematics.find((row) => row.question_number === 78);
if (!acceptedAnswerQuestion || !Array.isArray(acceptedAnswerQuestion.correct_options)) {
  throw new Error("Missing corrected March 17 Shift 1 Q78 accepted answers");
}
if (APPLY) {
  const { data: existing, error: readError } = await supabase.from("pyq_questions")
    .select("id").eq("paper_code", "JEE-MAIN-21-17MAR-S1").eq("question_number", 78).single();
  if (readError) throw readError;
  const { error: updateError } = await supabase.from("pyq_questions").update({
    correct_option: acceptedAnswerQuestion.correct_option,
    correct_options: acceptedAnswerQuestion.correct_options,
  }).eq("id", existing.id);
  if (updateError) throw updateError;
}

console.log(JSON.stringify({ repaired_questions: report.length, corrected_text_questions: 1, corrected_answer_keys: 1, report }, null, 2));
