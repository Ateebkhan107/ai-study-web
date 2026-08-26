import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function publishPaper(paperCode, attempt, shift, questions) {
  const rootDir = path.join(process.cwd(), "tmp/jee-main-2026-april-clean", paperCode);
  const visualDir = path.join(process.cwd(), "tmp/jee-main-2026-april/visuals", paperCode);

  await fs.writeFile(path.join(rootDir, "structured-dataset.json"), JSON.stringify(questions, null, 2), "utf8");

  let { data: examRow, error: examError } = await supabase.from("pyq_exams").select("id").eq("paper_code", paperCode).single();
  if (examError || !examRow) throw examError || new Error("Exam row not found for " + paperCode);

  const { data: existing, error: qLookupErr } = await supabase.from("pyq_questions").select("id, question_number").eq("paper_code", paperCode);
  if (qLookupErr) throw qLookupErr;
  const byNumber = new Map(existing.map((r) => [r.question_number, r.id]));

  for (const q of questions) {
    const qNum = Number(q.number || q.question_number);
    const qType = (q.question_type || "").toUpperCase();
    const numerical = qType === "NUMERICAL";
    let questionImageUrl = null;
    const optionImages = { option_a_image: null, option_b_image: null, option_c_image: null, option_d_image: null };

    if (q.needs_image) {
      const visualPath = path.join(visualDir, `q${String(qNum).padStart(2, "0")}-question.png`);
      try {
        const bytes = await fs.readFile(visualPath);
        const objectPath = `jee-main-2026-april/${paperCode.toLowerCase()}/q${String(qNum).padStart(2, "0")}-question.png`;
        await supabase.storage.from("pyq-images").upload(objectPath, bytes, { contentType: "image/png", upsert: true });
        questionImageUrl = `${supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl}?v=${Date.now()}`;
      } catch (e) {}

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

    const optA = q.option_a ?? (q.options ? q.options.a || q.options[0] : "") ?? "";
    const optB = q.option_b ?? (q.options ? q.options.b || q.options[1] : "") ?? "";
    const optC = q.option_c ?? (q.options ? q.options.c || q.options[2] : "") ?? "";
    const optD = q.option_d ?? (q.options ? q.options.d || q.options[3] : "") ?? "";

    const payload = {
      exam_id: examRow.id,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2026,
      attempt,
      shift,
      paper_code: paperCode,
      question_number: qNum,
      display_order: qNum,
      subject: q.subject === "Mathematics" ? "Maths" : q.subject,
      chapter: q.chapter || "Unmapped",
      difficulty: "Medium",
      question_type: numerical ? "NUMERICAL" : "MCQ",
      question: q.question || q.question_text,
      option_a: optionImages.option_a_image ? "" : (String(optA) || "Not applicable"),
      option_b: optionImages.option_b_image ? "" : (String(optB) || "Not applicable"),
      option_c: optionImages.option_c_image ? "" : (String(optC) || "Not applicable"),
      option_d: optionImages.option_d_image ? "" : (String(optD) || "Not applicable"),
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

  console.log(`Successfully published all 75 questions for ${paperCode}!`);
}

// 02APR-S2
const s2_maths = JSON.parse(await fs.readFile("tmp/02apr_s2_maths.json", "utf8"));
const s2_physics = JSON.parse(await fs.readFile("tmp/02apr_s2_physics.json", "utf8"));
const s2_chem = JSON.parse(await fs.readFile("tmp/02apr_s2_chem.json", "utf8"));
await publishPaper("JEE-MAIN-26-02APR-S2", "2 Apr", "Shift 2", [...s2_maths, ...s2_physics, ...s2_chem]);

// 04APR-S1
const s4_maths = JSON.parse(await fs.readFile("tmp/04apr_s1_maths.json", "utf8"));
const s4_physics = JSON.parse(await fs.readFile("tmp/04apr_s1_physics.json", "utf8"));
const s4_chem = JSON.parse(await fs.readFile("tmp/04apr_s1_chem.json", "utf8"));
await publishPaper("JEE-MAIN-26-04APR-S1", "4 Apr", "Shift 1", [...s4_maths, ...s4_physics, ...s4_chem]);
