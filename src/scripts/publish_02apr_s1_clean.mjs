import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const paperCode = "JEE-MAIN-26-02APR-S1";
const rootDir = path.join(process.cwd(), "tmp/jee-main-2026-april-clean", paperCode);
const visualDir = path.join(process.cwd(), "tmp/jee-main-2026-april/visuals", paperCode);

// Load the 3 batches
const logMaths = JSON.parse(await fs.readFile(path.join(process.cwd(), "tmp/02apr_s1_maths.json"), "utf8"));
const logPhysics = JSON.parse(await fs.readFile(path.join(process.cwd(), "tmp/02apr_s1_physics.json"), "utf8"));
const logChem = JSON.parse(await fs.readFile(path.join(process.cwd(), "tmp/02apr_s1_chem.json"), "utf8"));

const allQuestions = [...logMaths, ...logPhysics, ...logChem];
if (allQuestions.length !== 75) throw new Error(`Expected 75 questions, got ${allQuestions.length}`);

// Save structured-dataset.json
await fs.writeFile(path.join(rootDir, "structured-dataset.json"), JSON.stringify(allQuestions, null, 2), "utf8");

// Look up exam row
let { data: examRow, error: examError } = await supabase.from("pyq_exams").select("id").eq("paper_code", paperCode).single();
if (examError || !examRow) throw examError || new Error("Exam row not found");

// Look up existing question rows
const { data: existing, error: qLookupErr } = await supabase.from("pyq_questions").select("id, question_number").eq("paper_code", paperCode);
if (qLookupErr) throw qLookupErr;
const byNumber = new Map(existing.map((r) => [r.question_number, r.id]));

for (const q of allQuestions) {
  const qNum = q.number;
  const numerical = q.question_type === "NUMERICAL" || q.question_type === "Numerical";
  let questionImageUrl = null;
  const optionImages = { option_a_image: null, option_b_image: null, option_c_image: null, option_d_image: null };

  if (q.needs_image) {
    const visualPath = path.join(visualDir, `q${String(qNum).padStart(2, "0")}-question.png`);
    try {
      const bytes = await fs.readFile(visualPath);
      const objectPath = `jee-main-2026-april/${paperCode.toLowerCase()}/q${String(qNum).padStart(2, "0")}-question.png`;
      await supabase.storage.from("pyq-images").upload(objectPath, bytes, { contentType: "image/png", upsert: true });
      questionImageUrl = `${supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl}?v=${Date.now()}`;
    } catch (e) {
      console.warn(`Warning: no question visual for Q${qNum}: ${e.message}`);
    }

    for (const letter of ["a", "b", "c", "d"]) {
      const optPath = path.join(visualDir, `q${String(qNum).padStart(2, "0")}-option-${letter}.png`);
      try {
        const bytes = await fs.readFile(optPath);
        const objectPath = `jee-main-2026-april/${paperCode.toLowerCase()}/q${String(qNum).padStart(2, "0")}-option-${letter}.png`;
        await supabase.storage.from("pyq-images").upload(objectPath, bytes, { contentType: "image/png", upsert: true });
        optionImages[`option_${letter}_image`] = `${supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl}?v=${Date.now()}`;
      } catch {}
    }
  }

  const payload = {
    exam_id: examRow.id,
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2026,
    attempt: "2 Apr",
    shift: "Shift 1",
    paper_code: paperCode,
    question_number: qNum,
    display_order: qNum,
    subject: q.subject,
    chapter: q.chapter || "Unmapped",
    difficulty: "Medium",
    question_type: numerical ? "NUMERICAL" : "MCQ",
    question: q.question,
    option_a: optionImages.option_a_image ? "" : (q.option_a || "Not applicable"),
    option_b: optionImages.option_b_image ? "" : (q.option_b || "Not applicable"),
    option_c: optionImages.option_c_image ? "" : (q.option_c || "Not applicable"),
    option_d: optionImages.option_d_image ? "" : (q.option_d || "Not applicable"),
    ...optionImages,
    correct_option: numerical ? "a" : (q.correct_option?.toLowerCase() || "a"),
    numerical_answer: numerical ? Number(q.numerical_answer) : null,
    explanation: numerical ? `Official answer: ${q.numerical_answer}` : `Official answer: option ${q.correct_option?.toUpperCase()}`,
    question_image: questionImageUrl,
    status: "PUBLISHED",
    marks_positive: 4,
    marks_negative: numerical ? 0 : 1,
  };

  const id = byNumber.get(qNum);
  if (id) {
    const { error: updErr } = await supabase.from("pyq_questions").update(payload).eq("id", id);
    if (updErr) throw updErr;
  } else {
    const { error: insErr } = await supabase.from("pyq_questions").insert(payload);
    if (insErr) throw insErr;
  }
}

console.log(`Successfully updated all 75 questions for ${paperCode} with clean LaTeX!`);
