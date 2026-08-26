import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PAPERS = [
  { code: "JEE-MAIN-26-02APR-S1", attempt: "2 Apr", shift: "Shift 1", prefix: "02apr_s1" },
  { code: "JEE-MAIN-26-02APR-S2", attempt: "2 Apr", shift: "Shift 2", prefix: "02apr_s2" },
  { code: "JEE-MAIN-26-04APR-S1", attempt: "4 Apr", shift: "Shift 1", prefix: "04apr_s1" },
  { code: "JEE-MAIN-26-04APR-S2", attempt: "4 Apr", shift: "Shift 2", prefix: "04apr_s2" },
  { code: "JEE-MAIN-26-05APR-S1", attempt: "5 Apr", shift: "Shift 1", prefix: "05apr_s1" },
  { code: "JEE-MAIN-26-05APR-S2", attempt: "5 Apr", shift: "Shift 2", prefix: "05apr_s2" },
  { code: "JEE-MAIN-26-06APR-S1", attempt: "6 Apr", shift: "Shift 1", prefix: "06apr_s1" },
  { code: "JEE-MAIN-26-06APR-S2", attempt: "6 Apr", shift: "Shift 2", prefix: "06apr_s2" },
  { code: "JEE-MAIN-26-08APR-S2", attempt: "8 Apr", shift: "Shift 2", prefix: "08apr_s2" },
];

async function publishPaper(paper) {
  const { code: paperCode, attempt, shift, prefix } = paper;
  console.log(`\n================ Processing ${paperCode} ================`);
  const rootDir = path.join(process.cwd(), "tmp/jee-main-2026-april-clean", paperCode);
  const visualDir = path.join(process.cwd(), "tmp/jee-main-2026-april/visuals", paperCode);

  const maths = JSON.parse(await fs.readFile(`tmp/${prefix}_maths.json`, "utf8"));
  const physics = JSON.parse(await fs.readFile(`tmp/${prefix}_physics.json`, "utf8"));
  const chem = JSON.parse(await fs.readFile(`tmp/${prefix}_chem.json`, "utf8"));
  const questions = [...maths, ...physics, ...chem];

  if (questions.length !== 75) {
    throw new Error(`Expected 75 questions for ${paperCode}, got ${questions.length}`);
  }

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

    let optA = q.option_a;
    let optB = q.option_b;
    let optC = q.option_c;
    let optD = q.option_d;

    if (optA === undefined && q.options) {
      if (Array.isArray(q.options)) {
        if (typeof q.options[0] === "object" && q.options[0] !== null && "text" in q.options[0]) {
          optA = q.options[0].text;
          optB = q.options[1]?.text;
          optC = q.options[2]?.text;
          optD = q.options[3]?.text;
        } else {
          optA = q.options[0];
          optB = q.options[1];
          optC = q.options[2];
          optD = q.options[3];
        }
      } else if (typeof q.options === "object") {
        optA = q.options.a;
        optB = q.options.b;
        optC = q.options.c;
        optD = q.options.d;
      }
    }

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
      option_a: optionImages.option_a_image ? "" : (String(optA ?? "") || "Not applicable"),
      option_b: optionImages.option_b_image ? "" : (String(optB ?? "") || "Not applicable"),
      option_c: optionImages.option_c_image ? "" : (String(optC ?? "") || "Not applicable"),
      option_d: optionImages.option_d_image ? "" : (String(optD ?? "") || "Not applicable"),
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

  console.log(`SUCCESS: Published all 75 questions for ${paperCode}!`);
}

for (const p of PAPERS) {
  await publishPaper(p);
}
console.log("\nALL 9 PAPERS CLEANLY PUBLISHED TO SUPABASE!");
