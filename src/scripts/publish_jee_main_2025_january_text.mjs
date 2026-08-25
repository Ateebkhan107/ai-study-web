/** Replace image-only January 2025 rows with locally prepared text-first rows. */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const APPLY = process.argv.includes("--apply");
const requested = process.argv.slice(2).filter((arg) => arg !== "--apply");
const root = path.join(process.cwd(), "tmp/jee-main-2025-january-clean");
const allCodes = (await fs.readdir(root)).filter((name) => /^JEE-MAIN-25-\d\dJAN-S[12]$/.test(name) && name !== "JEE-MAIN-25-22JAN-S1").sort();
const codes = requested.length ? requested : allCodes;
const reports = [];

for (const code of codes) {
  const rows = JSON.parse(await fs.readFile(path.join(root, code, "structured-dataset.json"), "utf8"));
  if (rows.length !== 75 || rows.some((row, index) => row.number !== index + 1)) {
    throw new Error(`${code}: dataset is not a complete ordered 75-question paper`);
  }
  const { data: existing, error: fetchError } = await supabase.from("pyq_questions")
    .select("id,question_number,chapter,difficulty,explanation,explanation_image")
    .eq("paper_code", code).order("question_number");
  if (fetchError) throw fetchError;
  if (existing.length !== 75) throw new Error(`${code}: expected 75 existing rows, found ${existing.length}`);
  const byNumber = new Map(existing.map((row) => [row.question_number, row]));
  let uploadedImages = 0;

  for (const row of rows) {
    const current = byNumber.get(row.number);
    if (!current) throw new Error(`${code}: missing existing Q${row.number}`);
    let questionImage = null;
    if (row.needs_image) {
      const image = await fs.readFile(row.question_image);
      const objectPath = `jee-main-2025-january-text/${code.toLowerCase()}/q${String(row.number).padStart(2, "0")}.png`;
      if (APPLY) {
        const { error } = await supabase.storage.from("pyq-images").upload(objectPath, image, {
          contentType: "image/png", upsert: true,
        });
        if (error) throw new Error(`${code} Q${row.number} image: ${error.message}`);
      }
      questionImage = `${supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl}?v=20260825`;
      uploadedImages += 1;
    }
    const optionImages = {};
    for (const key of ["option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
      optionImages[key] = null;
      if (!row[key]) continue;
      const objectPath = `jee-main-2025-january-text/${code.toLowerCase()}/q${String(row.number).padStart(2, "0")}-${key}.png`;
      if (APPLY) {
        const { error } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(row[key]), {
          contentType: "image/png", upsert: true,
        });
        if (error) throw new Error(`${code} Q${row.number} ${key}: ${error.message}`);
      }
      optionImages[key] = `${supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl}?v=20260825b`;
    }
    const payload = {
      question_number: row.number,
      display_order: row.number,
      subject: row.subject,
      chapter: row.chapter && row.chapter !== "Unmapped" ? row.chapter : (current.chapter || "Unmapped"),
      difficulty: current.difficulty || "MEDIUM",
      question_type: row.question_type,
      question: row.question,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      ...optionImages,
      // The legacy schema requires a non-null option even for numerical and
      // dropped questions; grading uses numerical_answer/question_type there.
      correct_option: row.question_type === "NUMERICAL" ? "a" : (row.correct_option?.toLowerCase() || "a"),
      numerical_answer: row.numerical_answer,
      question_image: questionImage,
      explanation: current.explanation && !current.explanation.startsWith("Imported from the preserved source image")
        ? current.explanation
        : (row.question_type === "NUMERICAL"
          ? `Official answer: ${row.numerical_answer}`
          : `Official answer: option ${row.correct_option}`),
      explanation_image: current.explanation_image,
      marks_positive: 4,
      marks_negative: row.question_type === "NUMERICAL" ? 0 : 1,
      status: "PUBLISHED",
    };
    if (APPLY) {
      const { error } = await supabase.from("pyq_questions").update(payload).eq("id", current.id);
      if (error) throw new Error(`${code} Q${row.number}: ${error.message}`);
    }
  }
  reports.push({ paperCode: code, questions: rows.length, textOnly: rows.filter((row) => !row.needs_image).length, requiredImages: uploadedImages, applied: APPLY });
}

console.log(JSON.stringify(reports, null, 2));
