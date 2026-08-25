import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const ROOT = path.join(process.cwd(), "tmp", "jee-main-2024-04apr-clean-repair");
const PAPER_META = {
  "JEE-MAIN-24-04APR-S1": { attempt: "4 Apr", shift: "Shift 1", examDate: "2024-04-04" },
  "JEE-MAIN-24-04APR-S2": { attempt: "4 Apr", shift: "Shift 2", examDate: "2024-04-04" },
  "JEE-MAIN-24-05APR-S1": { attempt: "5 Apr", shift: "Shift 1", examDate: "2024-04-05" },
  "JEE-MAIN-24-05APR-S2": { attempt: "5 Apr", shift: "Shift 2", examDate: "2024-04-05" },
  "JEE-MAIN-24-06APR-S1": { attempt: "6 Apr", shift: "Shift 1", examDate: "2024-04-06" },
  "JEE-MAIN-24-06APR-S2": { attempt: "6 Apr", shift: "Shift 2", examDate: "2024-04-06" },
  "JEE-MAIN-24-08APR-S1": { attempt: "8 Apr", shift: "Shift 1", examDate: "2024-04-08" },
  "JEE-MAIN-24-08APR-S2": { attempt: "8 Apr", shift: "Shift 2", examDate: "2024-04-08" },
  "JEE-MAIN-24-09APR-S1": { attempt: "9 Apr", shift: "Shift 1", examDate: "2024-04-09" },
  "JEE-MAIN-24-09APR-S2": { attempt: "9 Apr", shift: "Shift 2", examDate: "2024-04-09" },
};

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function correctOption(answer) {
  return "abcd"[Number(String(answer).trim()) - 1] || "a";
}

function safeText(value) {
  return String(value ?? "").replace(/\u0000/g, "").trim();
}

async function uploadQuestionImage(paperCode, number, localPath) {
  if (!localPath) return null;
  const bytes = await fs.readFile(localPath);
  const filename = `q${String(number).padStart(2, "0")}.png`;
  const objectPath = `jee-main-2024/april-text-required/${paperCode.toLowerCase()}/${filename}`;
  const { error } = await supabase.storage.from("pyq-images").upload(objectPath, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`${paperCode} Q${number}: image upload failed: ${error.message}`);
  return `${supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl}?v=${Date.now()}`;
}

async function publishPaper(paperCode) {
  const meta = PAPER_META[paperCode];
  const manifestPath = path.join(ROOT, paperCode, "structured-dataset.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  if (manifest.questions.length !== 90) throw new Error(`${paperCode}: expected 90 questions`);

  const examPayload = {
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2024,
    attempt: meta.attempt,
    shift: meta.shift,
    paper_code: paperCode,
    exam_date: meta.examDate,
    duration_minutes: 180,
    total_marks: 300,
    status: "PUBLISHED",
    is_published: true,
  };

  let { data: examRow, error: examError } = await supabase.from("pyq_exams").select("id").eq("paper_code", paperCode).maybeSingle();
  if (examError) throw examError;
  if (examRow?.id) {
    const { error: examUpdateError } = await supabase.from("pyq_exams").update(examPayload).eq("id", examRow.id);
    if (examUpdateError) throw examUpdateError;
  } else {
    const { data, error } = await supabase.from("pyq_exams").insert(examPayload).select("id").single();
    if (error) throw error;
    examRow = data;
  }

  const { data: existingRows, error: rowsError } = await supabase
    .from("pyq_questions")
    .select("id,question_number")
    .eq("paper_code", paperCode)
    .order("question_number", { ascending: true });
  if (rowsError) throw rowsError;
  if (!existingRows || existingRows.length !== 90) throw new Error(`${paperCode}: expected 90 existing rows, found ${existingRows?.length || 0}`);
  const idByNumber = new Map(existingRows.map((row) => [Number(row.question_number), row.id]));

  const imageUrls = new Map();
  for (const question of manifest.questions) {
    if (question.question_image) {
      imageUrls.set(question.number, await uploadQuestionImage(paperCode, question.number, question.question_image));
    }
  }

  for (const question of manifest.questions) {
    const numerical = question.question_type === "NUMERICAL";
    const answer = String(question.answer).replace(/,/g, "").trim();
    const payload = {
      exam_id: examRow.id,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2024,
      attempt: meta.attempt,
      shift: meta.shift,
      paper_code: paperCode,
      question_number: question.number,
      display_order: question.number,
      subject: question.subject,
      chapter: "Unmapped",
      topic: "Unmapped",
      difficulty: "Medium",
      question_type: question.question_type,
      question: safeText(question.question),
      option_a: numerical ? "" : safeText(question.option_a),
      option_b: numerical ? "" : safeText(question.option_b),
      option_c: numerical ? "" : safeText(question.option_c),
      option_d: numerical ? "" : safeText(question.option_d),
      correct_option: numerical ? "a" : correctOption(answer),
      numerical_answer: numerical ? Number(answer) : null,
      explanation: `Official answer key: ${question.answer}.`,
      question_image: imageUrls.get(question.number) || null,
      explanation_image: null,
      marks_positive: 4,
      marks_negative: numerical ? 0 : 1,
      status: "PUBLISHED",
      confidence_score: 1,
    };
    const { error } = await supabase.from("pyq_questions").update(payload).eq("id", idByNumber.get(question.number));
    if (error) throw new Error(`${paperCode} Q${question.number}: ${error.message}`);
  }

  const { data: verified, error: verifyError } = await supabase
    .from("pyq_questions")
    .select("question_number,subject,question_type,question,question_image,option_a,option_b,option_c,option_d,correct_option,numerical_answer")
    .eq("paper_code", paperCode)
    .order("question_number", { ascending: true });
  if (verifyError) throw verifyError;
  const badPlaceholders = verified.filter((row) => /refer to the source image/i.test(row.question || ""));
  const imageRows = verified.filter((row) => row.question_image).map((row) => row.question_number);
  return {
    paperCode,
    rows: verified.length,
    textRows: verified.length - badPlaceholders.length,
    placeholderRows: badPlaceholders.map((row) => row.question_number),
    imageRows,
    subjectCounts: {
      Maths: verified.filter((row) => row.subject === "Maths").length,
      Physics: verified.filter((row) => row.subject === "Physics").length,
      Chemistry: verified.filter((row) => row.subject === "Chemistry").length,
    },
    samples: verified.filter((row) => [1, 31, 35, 42, 56, 64, 78, 90].includes(row.question_number)),
  };
}

const requested = process.argv.slice(2);
const paperCodes = requested.length ? requested : Object.keys(PAPER_META);
const report = [];
for (const paperCode of paperCodes) {
  if (!PAPER_META[paperCode]) throw new Error(`Unknown paper code: ${paperCode}`);
  report.push(await publishPaper(paperCode));
}

await fs.writeFile(path.join(ROOT, "publish-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
