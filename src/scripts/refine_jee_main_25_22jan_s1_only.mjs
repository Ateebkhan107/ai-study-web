import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-25-22JAN-S1";
const EXAM_ID = "668c0028-9c58-4ceb-9cd5-2b9aae385c5a";
const REVIEW_STATUS = "NEEDS_REVIEW";
const PACKAGE_NAME = "JEE Main 2025 22 January Shift 1 Structured Refinement";
const CROP_DIR = path.resolve("tmp/jee-main-cropped/jee_main_22_jan_shift_1");
const STORAGE_BUCKET = "pyq-images";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const QUESTION_OVERRIDES = {
  3: {
    chapter: "Sequence and Series",
    question: "Question 3: If \\(\\sum_{r=1}^{n} T_r = \\dfrac{(2n-1)(2n+1)(2n+3)(2n+5)}{64}\\), then \\(\\lim_{n\\to\\infty} \\sum_{r=1}^{n} \\dfrac{1}{T_r}\\) is equal to:",
    option_a: "1",
    option_b: "0",
    option_c: "\\(\\dfrac{2}{3}\\)",
    option_d: "\\(\\dfrac{1}{3}\\)",
    correct_option: "c",
    explanation:
      "Using \\(T_n = S_n - S_{n-1}\\), we get \\(T_n = \\dfrac{(2n-1)(2n+1)(2n+3)}{8}\\). Then \\(\\dfrac{1}{T_n}\\) telescopes and the infinite sum evaluates to \\(\\dfrac{2}{3}\\).",
  },
  4: {
    chapter: "Probability",
    question:
      "Question 4: A coin is tossed three times. Let \\(X\\) denote the number of times a tail follows a head. If \\(\\mu\\) and \\(\\sigma^2\\) denote the mean and variance of \\(X\\), then the value of \\(64(\\mu + \\sigma^2)\\) is:",
    option_a: "51",
    option_b: "48",
    option_c: "32",
    option_d: "64",
    correct_option: "b",
    explanation:
      "Listing all eight outcomes gives \\(P(X=0)=\\frac{1}{2}\\) and \\(P(X=1)=\\frac{1}{2}\\). Hence \\(\\mu=\\frac{1}{2}\\), \\(\\sigma^2=\\frac{1}{4}\\), and \\(64(\\mu+\\sigma^2)=64\\cdot\\frac{3}{4}=48\\).",
  },
  5: {
    chapter: "Sets, Relations and Functions",
    question: "Question 5: The number of non-empty equivalence relations on the set \\(\\{1,2,3\\}\\) is:",
    option_a: "6",
    option_b: "7",
    option_c: "5",
    option_d: "4",
    correct_option: "c",
    explanation:
      "An equivalence relation corresponds to a partition of the set. The set \\(\\{1,2,3\\}\\) has 5 partitions, so it has 5 non-empty equivalence relations.",
  },
  8: {
    chapter: "Three Dimensional Geometry",
  },
  9: {
    chapter: "Permutation and Combination",
  },
  11: {
    chapter: "Logarithms",
    question:
      "Question 11: The product of all solutions of the equation \\(e^{5(\\log_e x)^2+3}=x^8\\), \\(x>0\\), is:",
    option_a: "\\(e^{\\frac{8}{5}}\\)",
    option_b: "\\(e^{\\frac{6}{5}}\\)",
    option_c: "\\(e^2\\)",
    option_d: "\\(e\\)",
    correct_option: "a",
    explanation:
      "Putting \\(t=\\ln x\\), the equation becomes \\(e^{5t^2+3}=e^{8t}\\), so \\(5t^2-8t+3=0\\). The sum of roots is \\(\\frac{8}{5}\\), hence \\(\\ln(x_1x_2)=\\frac{8}{5}\\) and the product is \\(e^{\\frac{8}{5}}\\).",
  },
  52: {
    chapter: "Isomerism",
  },
};

function inferChapter(questionNumber, row) {
  if (QUESTION_OVERRIDES[questionNumber]?.chapter) {
    return QUESTION_OVERRIDES[questionNumber].chapter;
  }

  const text = String(row.question || "").toLowerCase();
  if (text.includes("gp.") || text.includes("increasing positive terms")) return "Sequence and Series";
  if (text.includes("equivalence relation")) return "Sets, Relations and Functions";
  if (text.includes("tail follows a head")) return "Probability";
  if (text.includes("complex numbers on the circle")) return "Complex Numbers";
  if (text.includes("shortest distance between")) return "Three Dimensional Geometry";
  if (text.includes("english alphabets")) return "Permutation and Combination";
  if (text.includes("product of all solutions") && text.includes("log")) return "Logarithms";
  if (text.includes("geometrical isomerism")) return "Isomerism";
  if (text.includes("second quadrant") && text.includes("radius")) return "Circles";
  if (text.includes("inside the circle") && text.includes("parabola")) return "Circles";
  return row.chapter || "Unmapped";
}

function inferDifficulty(row) {
  return row.difficulty || "MEDIUM";
}

async function ensureImportPackage() {
  const { data: existing, error: existingError } = await supabase
    .from("pyq_import_packages")
    .select("id")
    .eq("name", PACKAGE_NAME)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("pyq_import_packages")
    .insert({ name: PACKAGE_NAME, status: REVIEW_STATUS })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

async function uploadSolutionImage(questionNumber) {
  const localPath = path.join(CROP_DIR, `Q${questionNumber}_solution.png`);
  try {
    await fs.access(localPath);
  } catch {
    return null;
  }

  const objectPath = `jee-main-january-solutions/${PAPER_CODE.toLowerCase()}/q${String(questionNumber).padStart(2, "0")}-solution.png`;
  const image = await fs.readFile(localPath);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, image, { contentType: "image/png", upsert: false });

  if (error && error.statusCode !== "409") {
    throw new Error(`Q${questionNumber} solution image upload failed: ${error.message}`);
  }

  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

const { data: examRows, error: examError } = await supabase
  .from("pyq_exams")
  .select("id, exam, exam_type, year, attempt, shift, paper_code")
  .eq("id", EXAM_ID)
  .eq("paper_code", PAPER_CODE);

if (examError) throw new Error(`Exam lookup failed: ${examError.message}`);
if (!examRows || examRows.length !== 1) throw new Error(`Expected exactly one exam row for ${PAPER_CODE}`);

const { data: rows, error: rowsError } = await supabase
  .from("pyq_questions")
  .select("id, question_number, display_order, subject, chapter, difficulty, question_type, question, option_a, option_b, option_c, option_d, correct_option, numerical_answer, explanation, question_image, explanation_image, marks_positive, marks_negative")
  .eq("paper_code", PAPER_CODE)
  .order("question_number", { ascending: true });

if (rowsError) throw new Error(`Question lookup failed: ${rowsError.message}`);
if (!rows || rows.length !== 75) throw new Error(`Expected 75 question rows for ${PAPER_CODE}, found ${rows?.length || 0}`);

const packageId = await ensureImportPackage();
const updated = [];

for (const row of rows) {
  const override = QUESTION_OVERRIDES[row.question_number] || {};
  const explanationImage = (await uploadSolutionImage(row.question_number)) || row.explanation_image || null;

  const payload = {
    display_order: row.question_number,
    subject: row.subject,
    chapter: inferChapter(row.question_number, row),
    difficulty: inferDifficulty(row),
    question_type: row.question_type,
    question: override.question || row.question,
    option_a: override.option_a || row.option_a,
    option_b: override.option_b || row.option_b,
    option_c: override.option_c || row.option_c,
    option_d: override.option_d || row.option_d,
    correct_option: override.correct_option || row.correct_option,
    numerical_answer: row.numerical_answer,
    explanation: override.explanation || row.explanation || "Verify the final explanation against the source image during review.",
    explanation_image: explanationImage,
    marks_positive: row.marks_positive ?? 4,
    marks_negative: row.marks_negative ?? (row.question_type === "NUMERICAL" ? 0 : 1),
    import_package_id: packageId,
    status: REVIEW_STATUS,
  };

  const { error } = await supabase
    .from("pyq_questions")
    .update(payload)
    .eq("id", row.id);

  if (error) {
    throw new Error(`Q${row.question_number} update failed: ${error.message}`);
  }

  updated.push(row.question_number);
}

const { error: pkgError } = await supabase
  .from("pyq_import_packages")
  .update({ status: REVIEW_STATUS })
  .eq("id", packageId);

if (pkgError) throw new Error(`Import package update failed: ${pkgError.message}`);

console.log(JSON.stringify({
  paperCode: PAPER_CODE,
  examId: EXAM_ID,
  updatedRows: updated.length,
  packageId,
  updatedQuestionNumbers: updated,
}, null, 2));
