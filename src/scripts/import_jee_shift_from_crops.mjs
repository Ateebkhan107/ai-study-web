import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const cropDir = process.argv[2] || "tmp/jee-main-cropped/jee_main_22_jan_shift_1";
const resolvedCropDir = path.resolve(cropDir);
const basename = path.basename(resolvedCropDir);
const match = basename.match(/^jee_main_(\d+)_jan_shift_(\d+)$/i);

if (!match) {
  throw new Error("Expected a crop directory like tmp/jee-main-cropped/jee_main_22_jan_shift_1");
}

const day = match[1];
const shiftNumber = match[2];
const attempt = `${day} Jan`;
const shift = `Shift ${shiftNumber}`;
const paperCode = `JEE-MAIN-25-${day}JAN-S${shiftNumber}`;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function subjectForQuestion(number) {
  if (number <= 25) return "Physics";
  if (number <= 50) return "Chemistry";
  return "Maths";
}

function typeForQuestion(number) {
  if (number <= 20) return "MCQ";
  if (number <= 25) return "NUMERICAL";
  if (number <= 45) return "MCQ";
  if (number <= 50) return "NUMERICAL";
  if (number <= 70) return "MCQ";
  return "NUMERICAL";
}

function normalizeWhitespace(text) {
  return text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeForMatch(text) {
  return text
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/[^a-z0-9.+\-=/()% ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ocrImage(filePath) {
  const output = execFileSync("tesseract", [filePath, "stdout"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return normalizeWhitespace(output);
}

function parseQuestionText(rawText, questionNumber) {
  const withoutHeader = rawText
    .replace(new RegExp(`^${questionNumber}\\.?\\s*`, "i"), "")
    .replace(/\f/g, "")
    .trim();

  return `Question ${questionNumber}: ${withoutHeader || "Refer to the question image."}`;
}

function parseOptions(rawText) {
  const flattened = rawText.replace(/\n/g, " ");
  const matches = [...flattened.matchAll(/\((1|2|3|4)\)\s*(.+?)(?=\s*\((?:1|2|3|4)\)\s*|$)/g)];

  if (matches.length !== 4) {
    return null;
  }

  return matches.map((matchItem) => normalizeWhitespace(matchItem[2]));
}

function parseNumericalAnswer(solutionText) {
  const cleaned = solutionText.replace(/,/g, "");
  const equalsMatches = [...cleaned.matchAll(/=\s*(-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?)/g)];
  if (equalsMatches.length > 0) {
    return equalsMatches.at(-1)[1].replace(/\s+/g, "");
  }

  const numberMatches = cleaned.match(/-?\d+(?:\.\d+)?/g);
  return numberMatches?.at(-1) || null;
}

function resolveCorrectOption(options, solutionText) {
  const numbered = solutionText.match(/\bans(?:wer)?\b[^1-4a-d]{0,12}(?:\(?([1-4])\)?|([a-d]))/i);
  if (numbered) {
    const value = numbered[1] || numbered[2];
    return ["a", "b", "c", "d"][Number(value) - 1] || String(value).toLowerCase();
  }

  const normalizedSolution = normalizeForMatch(solutionText);
  const solutionNumbers = new Set((normalizedSolution.match(/-?\d+(?:\.\d+)?/g) || []).filter(Boolean));

  let best = null;
  for (const [index, option] of options.entries()) {
    const normalizedOption = normalizeForMatch(option);
    if (normalizedOption && normalizedSolution.includes(normalizedOption)) {
      return ["a", "b", "c", "d"][index];
    }

    const optionNumbers = (normalizedOption.match(/-?\d+(?:\.\d+)?/g) || []).filter(Boolean);
    const score = optionNumbers.filter((item) => solutionNumbers.has(item)).length;

    if (score > 0 && (!best || score > best.score)) {
      best = { option: ["a", "b", "c", "d"][index], score };
    }
  }

  return best?.option || "a";
}

function maybeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

async function ensureExam() {
  const { data: existing, error: selectError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("exam", "JEE")
    .eq("year", 2025)
    .eq("exam_type", "JEE Main")
    .eq("attempt", attempt)
    .eq("shift", shift)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to look up exam row: ${selectError.message}`);
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("pyq_exams")
      .update({
        paper_code: paperCode,
        exam_date: `2025-01-${day.padStart(2, "0")}`,
        duration_minutes: 180,
        total_marks: 300,
        status: "PUBLISHED",
        is_published: true,
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`Failed to publish existing exam row: ${updateError.message}`);
    }

    return existing.id;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("pyq_exams")
    .insert({
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2025,
      attempt,
      shift,
      paper_code: paperCode,
      exam_date: `2025-01-${day.padStart(2, "0")}`,
      duration_minutes: 180,
      total_marks: 300,
      status: "PUBLISHED",
      is_published: true,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Failed to create exam row: ${insertError.message}`);
  }

  return inserted.id;
}

async function uploadImage(objectPath, localPath) {
  const image = await fs.readFile(localPath);
  const { error: uploadError } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, image, { contentType: "image/png", upsert: true });

  if (uploadError) {
    throw new Error(`Image upload failed for ${objectPath}: ${uploadError.message}`);
  }

  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

const dirEntries = await fs.readdir(resolvedCropDir);
const questionNumbers = [...new Set(
  dirEntries
    .map((name) => name.match(/^Q(\d+)_(?:question|solution)\.png$/))
    .filter(Boolean)
    .map((matchItem) => Number(matchItem[1]))
)]
  .filter((number) => number > 0)
  .sort((a, b) => a - b);

if (questionNumbers.length === 0) {
  throw new Error(`No cropped question images found in ${resolvedCropDir}`);
}

const existingRowsQuery = await supabase
  .from("pyq_questions")
  .select("id, created_at")
  .eq("exam", "JEE")
  .eq("year", 2025)
  .eq("paper_code", paperCode)
  .order("created_at");

if (existingRowsQuery.error) {
  throw new Error(`Failed to check existing questions: ${existingRowsQuery.error.message}`);
}

const existingRows = existingRowsQuery.data || [];
if (existingRows.length > questionNumbers.length) {
  throw new Error(
    `Import stopped: found ${existingRows.length} existing rows but only ${questionNumbers.length} cropped questions to repair.`
  );
}

const examId = await ensureExam();

const stats = {
  total: 0,
  mcq: 0,
  numerical: 0,
  uploadedImages: 0,
  resolvedMcqAnswers: 0,
  resolvedNumericalAnswers: 0,
};

const records = [];
for (const [index, number] of questionNumbers.entries()) {
  const questionPath = path.join(resolvedCropDir, `Q${number}_question.png`);
  const solutionPath = path.join(resolvedCropDir, `Q${number}_solution.png`);

  const hasQuestion = dirEntries.includes(`Q${number}_question.png`);
  if (!hasQuestion) continue;

  const questionType = typeForQuestion(number);
  const subject = subjectForQuestion(number);
  const questionOcr = ocrImage(questionPath);
  const solutionOcr = dirEntries.includes(`Q${number}_solution.png`) ? ocrImage(solutionPath) : "";
  const optionTexts = questionType === "MCQ" ? parseOptions(questionOcr) : null;
  const numericalAnswer = questionType === "NUMERICAL" ? parseNumericalAnswer(solutionOcr) : null;
  const correctOption = questionType === "MCQ"
    ? resolveCorrectOption(
        optionTexts || ["Option A", "Option B", "Option C", "Option D"],
        solutionOcr
      )
    : null;

  const questionImageUrl = await uploadImage(
    `jee-main-2025/22-jan-shift-${shiftNumber}/q${String(number).padStart(2, "0")}.png`,
    questionPath
  );
  stats.uploadedImages += 1;

  let explanationImageUrl = null;
  if (dirEntries.includes(`Q${number}_solution.png`)) {
    explanationImageUrl = await uploadImage(
      `jee-main-2025/22-jan-shift-${shiftNumber}/q${String(number).padStart(2, "0")}-solution.png`,
      solutionPath
    );
    stats.uploadedImages += 1;
  }

  if (questionType === "MCQ" && correctOption) stats.resolvedMcqAnswers += 1;
  if (questionType === "NUMERICAL" && numericalAnswer !== null) stats.resolvedNumericalAnswers += 1;

  records.push({
    id: existingRows[index]?.id,
    exam_id: examId,
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2025,
    attempt,
    shift,
    paper_code: paperCode,
    subject,
    chapter: "Unmapped",
    question_type: questionType,
    question: parseQuestionText(questionOcr, number),
    option_a: optionTexts?.[0] || "Option A",
    option_b: optionTexts?.[1] || "Option B",
    option_c: optionTexts?.[2] || "Option C",
    option_d: optionTexts?.[3] || "Option D",
    correct_option: correctOption || "a",
    numerical_answer: maybeNumber(numericalAnswer),
    explanation: solutionOcr || "Refer to the explanation image.",
    question_image: questionImageUrl,
    explanation_image: explanationImageUrl,
    status: "PUBLISHED",
    marks_positive: 4,
    marks_negative: questionType === "NUMERICAL" ? 0 : 1,
  });

  stats.total += 1;
  if (questionType === "MCQ") stats.mcq += 1;
  if (questionType === "NUMERICAL") stats.numerical += 1;
}

const updates = records.filter((record) => record.id);
const inserts = records.filter((record) => !record.id).map(({ id, ...record }) => record);

for (let start = 0; start < updates.length; start += 20) {
  const batch = updates.slice(start, start + 20);
  for (const record of batch) {
    const { id, ...payload } = record;
    const { error } = await supabase.from("pyq_questions").update(payload).eq("id", id);
    if (error) {
      throw new Error(`Question update failed for ${id}: ${error.message}`);
    }
  }
  console.log(`Updated questions ${start + 1}-${start + batch.length}`);
}

for (let start = 0; start < inserts.length; start += 20) {
  const batch = inserts.slice(start, start + 20);
  const { error } = await supabase.from("pyq_questions").insert(batch);
  if (error) {
    throw new Error(`Question insert failed for batch starting at ${start + 1}: ${error.message}`);
  }
  console.log(`Inserted questions ${start + 1}-${start + batch.length}`);
}

console.log(JSON.stringify({
  attempt,
  shift,
  paperCode,
  examId,
  existingRows: existingRows.length,
  updatedRows: updates.length,
  insertedRows: inserts.length,
  ...stats,
}, null, 2));
