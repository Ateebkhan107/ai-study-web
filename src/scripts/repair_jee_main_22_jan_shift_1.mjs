import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const paperCode = "JEE-MAIN-25-22JAN-S1";
const examId = "668c0028-9c58-4ceb-9cd5-2b9aae385c5a";
const cropDir = path.resolve("tmp/jee_manual_crops");

const chapterMap = {
  1: "Relations and Functions",
  2: "Differential Equations",
  3: "Straight Lines",
  4: "Complex Numbers",
  5: "Inverse Trigonometric Functions",
  6: "Probability",
  7: "Sequences and Series",
  8: "Three Dimensional Geometry",
  9: "Logarithms",
  10: "Sequences and Series",
  11: "Permutation and Combination",
  12: "Differential Equations",
  13: "Parabola",
  14: "Circles",
  15: "Definite Integrals",
  16: "Functions",
  17: "Number Theory",
  18: "Parabola",
  19: "Probability",
  20: "Hyperbola",
  21: "Continuity and Differentiability",
  22: "Definite Integrals",
  23: "Matrices and Determinants",
  24: "Three Dimensional Geometry",
  25: "Vector Algebra",
  26: "Units and Measurements",
  27: "Electric Charges and Fields",
  28: "Current Electricity",
  29: "Wave Optics",
  30: "Thermal Properties of Matter",
  31: "Thermal Properties of Matter",
  32: "Dual Nature of Radiation and Matter",
  33: "Ray Optics and Optical Instruments",
  34: "Electric Charges and Fields",
  35: "Current Electricity",
  36: "Waves and Sound",
  37: "System of Particles and Rotational Motion",
  38: "Gravitation",
  39: "Dual Nature of Radiation and Matter",
  40: "Units and Dimensions",
  41: "Work, Energy and Power",
  42: "Current Electricity",
  43: "Semiconductor Electronics",
  44: "Electrostatic Potential and Capacitance",
  45: "Ray Optics and Optical Instruments",
  46: "Mechanical Properties of Fluids",
  47: "Ray Optics and Optical Instruments",
  48: "Thermal Properties of Matter",
  49: "System of Particles and Rotational Motion",
  50: "Motion in a Plane",
  51: "Electrochemistry",
  52: "Atomic Structure",
  53: "Isomerism",
  54: "Classification of Elements and Periodicity",
  55: "d and f Block Elements",
  56: "Classification of Elements and Periodicity",
  57: "Biomolecules",
  58: "Thermodynamics",
  59: "Atomic Structure",
  60: "Haloalkanes and Haloarenes",
  61: "Hydrocarbons",
  62: "Chemical Equilibrium",
  63: "IUPAC Nomenclature",
  64: "Electrochemistry",
  65: "Aldehydes, Ketones and Carboxylic Acids",
  66: "Coordination Compounds",
  67: "Solutions",
  68: "Amines",
  69: "Coordination Compounds",
  70: "Isomerism",
  71: "Mole Concept",
  72: "Practical Organic Chemistry",
  73: "Chemical Bonding and Molecular Structure",
  74: "Chemical Kinetics",
  75: "Amines",
};

const numericalAnswerMap = {
  46: 4,
  48: 40,
  75: 154,
};

const manualQuestions = {
  1: {
    subject: "Maths",
    chapter: chapterMap[1],
    question_type: "MCQ",
    question: "Question 1: The number of non-empty equivalence relations on the set {1,2,3} is:",
    option_a: "6",
    option_b: "7",
    option_c: "5",
    option_d: "4",
    correct_option: "c",
    explanation: "An equivalence relation partitions the set. For {1,2,3}, the five possible set partitions give the five non-empty equivalence relations.",
  },
  5: {
    subject: "Maths",
    chapter: chapterMap[5],
    question_type: "MCQ",
    question: "Question 5: Using the principal values of the inverse trigonometric functions, the sum of the maximum and the minimum values of 16((sec^-1 x)^2 + (cosec^-1 x)^2) is:",
    option_a: "24 pi^2",
    option_b: "18 pi^2",
    option_c: "31 pi^2",
    option_d: "22 pi^2",
    correct_option: "d",
    explanation: "Let sec^-1 x = a in [0, pi] \\ {pi/2}. Then cosec^-1 x = pi/2 - a, so the expression becomes 16(2a^2 - pi a + pi^2/4). Its minimum occurs at a = pi/4 and maximum at a = pi, giving 2pi^2 and 20pi^2. Their sum is 22pi^2.",
  },
  6: {
    subject: "Maths",
    chapter: chapterMap[6],
    question_type: "MCQ",
    question: "Question 6: A coin is tossed three times. Let X denote the number of times a tail follows a head. If mu and sigma^2 denote the mean and variance of X, then the value of 64(mu + sigma^2) is:",
    option_a: "51",
    option_b: "48",
    option_c: "32",
    option_d: "64",
    correct_option: "b",
    explanation: "List all eight outcomes and count how many times T immediately follows H. This gives P(X=0)=1/2 and P(X=1)=1/2, so mu=1/2 and sigma^2=1/4. Therefore 64(mu + sigma^2) = 64(3/4) = 48.",
  },
  9: {
    subject: "Maths",
    chapter: chapterMap[9],
    question_type: "MCQ",
    question: "Question 9: The product of all solutions of the equation e^(5(log_e x)^2 + 3) = x^8, x > 0, is:",
    option_a: "e^(8/5)",
    option_b: "e^(6/5)",
    option_c: "e^2",
    option_d: "e",
    correct_option: "a",
    explanation: "Put t = ln x. Then e^(5t^2+3) = e^(8t), so 5t^2 - 8t + 3 = 0. The sum of roots is 8/5, hence ln(x1 x2)=8/5 and the product is e^(8/5).",
  },
  10: {
    subject: "Maths",
    chapter: chapterMap[10],
    question_type: "MCQ",
    question: "Question 10: If sum_(r=1)^n T_r = ((2n-1)(2n+1)(2n+3)(2n+5))/64, then lim_(n->infinity) sum_(r=1)^n (1/T_r) is equal to:",
    option_a: "1",
    option_b: "0",
    option_c: "2/3",
    option_d: "1/3",
    correct_option: "c",
    explanation: "Since T_n = S_n - S_(n-1), we get T_n = ((2n-1)(2n+1)(2n+3))/8. Then 1/T_n telescopes as 8/[(2n-1)(2n+1)(2n+3)] = 2[(1/((2n-1)(2n+1))) - (1/((2n+1)(2n+3)))]. The infinite sum evaluates to 2/3.",
  },
  52: {
    subject: "Chemistry",
    chapter: chapterMap[52],
    question_type: "MCQ",
    question: "Question 52: Which of the following statement is not true for radioactive decay?",
    option_a: "Amount of radioactive substance remained after three half lives is 1/8th of original amount.",
    option_b: "Decay constant does not depend upon temperature.",
    option_c: "Decay constant increases with increase in temperature.",
    option_d: "Half life is ln 2 times of 1/rate constant.",
    correct_option: "c",
    explanation: "Radioactive decay is a nuclear phenomenon and its decay constant is independent of temperature and ordinary physical conditions. The relation between half-life and decay constant is t1/2 = (ln 2)/k. Hence the temperature-dependent statement is the incorrect one.",
  },
};

function subjectForQuestion(number) {
  if (number <= 25) return "Maths";
  if (number <= 50) return "Physics";
  return "Chemistry";
}

function typeForQuestion(number) {
  if (number <= 20) return "MCQ";
  if (number <= 25) return "NUMERICAL";
  if (number <= 45) return "MCQ";
  if (number <= 50) return "NUMERICAL";
  if (number <= 70) return "MCQ";
  return "NUMERICAL";
}

function normalizeManualRecord(questionNumber) {
  const manual = manualQuestions[questionNumber];
  return {
    exam_id: examId,
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2025,
    attempt: "22 Jan",
    shift: "Shift 1",
    paper_code: paperCode,
    subject: manual.subject,
    chapter: manual.chapter,
    question_type: manual.question_type,
    question: manual.question,
    option_a: manual.option_a,
    option_b: manual.option_b,
    option_c: manual.option_c,
    option_d: manual.option_d,
    correct_option: manual.correct_option,
    explanation: manual.explanation,
    marks_positive: 4,
    marks_negative: 1,
    status: "PUBLISHED",
  };
}

async function uploadManualCrop(questionNumber, kind) {
  const localName = `Q${questionNumber}_${kind}.png`;
  const localPath = path.join(cropDir, localName);
  const objectPath = `jee-main-2025/22-jan-shift-1/${localName.toLowerCase()}`;
  const image = await fs.readFile(localPath);

  const { error: uploadError } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, image, { contentType: "image/png", upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload ${localName}: ${uploadError.message}`);
  }

  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

const { data: rows, error: rowsError } = await supabase
  .from("pyq_questions")
  .select("id, question")
  .eq("paper_code", paperCode)
  .order("created_at");

if (rowsError) {
  throw new Error(`Failed to load existing question rows: ${rowsError.message}`);
}

const byNumber = new Map();
for (const row of rows) {
  const match = String(row.question || "").match(/^Question\s+(\d+)\s*:/i);
  if (match) {
    byNumber.set(Number(match[1]), row);
  }
}

for (const [questionNumber, row] of byNumber.entries()) {
  const payload = {
    subject: subjectForQuestion(questionNumber),
    chapter: chapterMap[questionNumber],
    question_type: typeForQuestion(questionNumber),
    marks_positive: 4,
    marks_negative: 1,
    status: "PUBLISHED",
  };

  if (numericalAnswerMap[questionNumber] !== undefined) {
    payload.numerical_answer = numericalAnswerMap[questionNumber];
  }

  const { error } = await supabase.from("pyq_questions").update(payload).eq("id", row.id);
  if (error) {
    throw new Error(`Failed to update Question ${questionNumber}: ${error.message}`);
  }
}

for (const questionNumber of [1, 5, 6, 9, 10, 52]) {
  const record = normalizeManualRecord(questionNumber);
  record.question_image = await uploadManualCrop(questionNumber, "question");
  record.explanation_image = await uploadManualCrop(questionNumber, "solution");

  const { error } = await supabase.from("pyq_questions").insert(record);
  if (error) {
    throw new Error(`Failed to insert Question ${questionNumber}: ${error.message}`);
  }
}

const { error: examError } = await supabase
  .from("pyq_exams")
  .update({
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2025,
    attempt: "22 Jan",
    shift: "Shift 1",
    paper_code: paperCode,
    exam_date: "2025-01-22",
    duration_minutes: 180,
    total_marks: 300,
    status: "PUBLISHED",
    is_published: true,
  })
  .eq("id", examId);

if (examError) {
  throw new Error(`Failed to update exam row: ${examError.message}`);
}

const { data: verifyRows, error: verifyError } = await supabase
  .from("pyq_questions")
  .select("id, question, subject, chapter, question_type, numerical_answer")
  .eq("paper_code", paperCode)
  .order("created_at");

if (verifyError) {
  throw new Error(`Failed to verify repaired question bank: ${verifyError.message}`);
}

const summary = {
  total: verifyRows.length,
  numbered: verifyRows.filter((row) => /^Question\s+\d+:/i.test(row.question || "")).length,
  subjects: [...new Set(verifyRows.map((row) => row.subject))],
  chapters: [...new Set(verifyRows.map((row) => row.chapter))].length,
  types: verifyRows.reduce((acc, row) => {
    acc[row.question_type] = (acc[row.question_type] || 0) + 1;
    return acc;
  }, {}),
};

console.log(JSON.stringify(summary, null, 2));
