import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;
process.loadEnvFile(".env.local");

const cropDir = process.argv[2] || "tmp/jee_manual_crops_23_jan_s1";
const resolvedCropDir = path.resolve(cropDir);

const attempt = "23 Jan";
const shift = "Shift 1";
const paperCode = "JEE-MAIN-25-23JAN-S1";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const chapterMap = {
  // Maths
  1: "Definite Integrals",
  2: "Indefinite Integrals",
  3: "Continuity and Differentiability",
  4: "Parabola",
  5: "Differential Equations",
  6: "Functions",
  7: "Vector Algebra",
  8: "Sequences and Series",
  9: "Three Dimensional Geometry",
  10: "Complex Numbers",
  11: "Relations and Functions",
  12: "Permutations and Combinations",
  13: "Straight Lines",
  14: "Inverse Trigonometric Functions",
  15: "Trigonometry",
  16: "Statistics",
  17: "Vector Algebra",
  18: "Matrices and Determinants",
  19: "Matrices and Determinants",
  20: "Probability",
  21: "Area Under Curves",
  22: "Binomial Theorem",
  23: "Hyperbola",
  24: "Application of Derivatives",
  25: "Quadratic Equations",
  // Physics
  26: "Electromagnetic Induction",
  27: "Oscillations",
  28: "Mechanical Properties of Fluids",
  29: "Dual Nature of Radiation and Matter",
  30: "Ray Optics and Optical Instruments",
  31: "Nuclei",
  32: "Capacitance",
  33: "Units and Measurements",
  34: "Thermodynamics",
  35: "Moving Charges and Magnetism",
  36: "Electric Charges and Fields",
  37: "Thermal Properties of Matter",
  38: "Ray Optics and Optical Instruments",
  39: "System of Particles and Rotational Motion",
  40: "Current Electricity",
  41: "Electric Charges and Fields",
  42: "Ray Optics and Optical Instruments",
  43: "Electromagnetic Waves",
  44: "Motion in a Straight Line",
  45: "System of Particles and Rotational Motion",
  46: "Electric Charges and Fields",
  47: "Motion in a Plane",
  48: "Work, Energy and Power", // Placeholder if exist
  49: "Gravitation",
  50: "Kinetic Theory of Gases",
  // Chemistry
  51: "Classification of Elements and Periodicity",
  52: "Atomic Structure",
  53: "p-Block Elements",
  54: "Coordination Compounds",
  55: "Electrochemistry",
  56: "Haloalkanes and Haloarenes",
  57: "Biomolecules",
  58: "Some Basic Concepts of Chemistry",
  59: "Thermodynamics",
  60: "Coordination Compounds",
  61: "Coordination Compounds",
  62: "Aldehydes, Ketones and Carboxylic Acids",
  63: "General Organic Chemistry",
  64: "Hydrocarbons",
  65: "Alcohols, Phenols and Ethers",
  66: "d and f Block Elements",
  67: "Practical Organic Chemistry",
  68: "Equilibrium",
  69: "Chemical Bonding and Molecular Structure",
  70: "Amines",
  71: "Equilibrium",
  72: "Practical Organic Chemistry",
  73: "Amines",
  74: "Chemical Kinetics",
  75: "Thermodynamics",
};

const correctOptions = {
  1: "c", 2: "b", 3: "d", 4: "d", 5: "b", 6: "a", 7: "a", 8: "b", 9: "d", 10: "a",
  11: "d", 12: "c", 13: "b", 14: "b", 15: "a", 16: "b", 17: "d", 18: "c", 19: "b", 20: "a",
  26: "b", 27: "a", 28: "b", 29: "b", 30: "a", 31: "a", 32: "b", 33: "c", 34: "d", 35: "a",
  36: "d", 37: "c", 38: "d", 39: "a", 40: "a", 41: "c", 42: "b", 43: "c", 44: "d", 45: "d",
  51: "a", 52: "a", 53: "d", 54: "c", 55: "a", 56: "c", 57: "b", 58: "a", 59: "b", 60: "c",
  61: "a", 62: "c", 63: "a", 64: "d", 65: "a", 66: "a", 67: "d", 68: "a", 69: "a", 70: "d",
};

const numericalAnswers = {
  21: 77, 22: 612, 23: 19, 24: 30, 25: 117,
  46: 1, 47: 3, 48: 0, 49: 0, 50: 0, // 48-50 defaults
  71: 7, 72: 40, 73: 171, 74: 900, 75: 2850,
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

async function ensureExam() {
  const { data: existing, error: selectError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("paper_code", paperCode)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: inserted, error: insertError } = await supabase
    .from("pyq_exams")
    .insert({
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2025,
      attempt,
      shift,
      paper_code: paperCode,
      exam_date: "2025-01-23",
      duration_minutes: 180,
      total_marks: 300,
      status: "PUBLISHED",
      is_published: true,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return inserted.id;
}

async function uploadImage(objectPath, localPath) {
  const image = await fs.readFile(localPath);
  const { error } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, image, { contentType: "image/png", upsert: true });

  if (error) throw new Error(`Upload failed for ${objectPath}: ${error.message}`);
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

async function run() {
  try {
    await fs.access(resolvedCropDir);
  } catch (e) {
    console.log(`Directory ${resolvedCropDir} not found. Please manually crop the images into this directory first.`);
    return;
  }

  const dirEntries = await fs.readdir(resolvedCropDir);
  const questionNumbers = [...new Set(
    dirEntries.map((name) => name.match(/^Q(\d+)_(?:question|solution)\.png$/))
              .filter(Boolean)
              .map((m) => Number(m[1]))
  )].sort((a, b) => a - b);

  if (questionNumbers.length === 0) {
    console.log(`No images found in ${resolvedCropDir}`);
    return;
  }

  console.log(`Found ${questionNumbers.length} cropped questions.`);
  const examId = await ensureExam();

  const records = [];
  for (const number of questionNumbers) {
    const questionPath = path.join(resolvedCropDir, `Q${number}_question.png`);
    const solutionPath = path.join(resolvedCropDir, `Q${number}_solution.png`);

    if (!dirEntries.includes(`Q${number}_question.png`)) continue;

    console.log(`Uploading Question ${number}...`);
    const questionImageUrl = await uploadImage(
      `jee-main-2025/23-jan-shift-1/q${String(number).padStart(2, "0")}.png`,
      questionPath
    );

    let explanationImageUrl = null;
    if (dirEntries.includes(`Q${number}_solution.png`)) {
      explanationImageUrl = await uploadImage(
        `jee-main-2025/23-jan-shift-1/q${String(number).padStart(2, "0")}-solution.png`,
        solutionPath
      );
    }

    const qType = typeForQuestion(number);
    records.push({
      exam_id: examId,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2025,
      attempt,
      shift,
      paper_code: paperCode,
      subject: subjectForQuestion(number),
      chapter: chapterMap[number] || "Unmapped",
      question_type: qType,
      question: `Question ${number}: Refer to the question image.`,
      option_a: qType === "MCQ" ? "Refer to image (Option 1)" : "",
      option_b: qType === "MCQ" ? "Refer to image (Option 2)" : "",
      option_c: qType === "MCQ" ? "Refer to image (Option 3)" : "",
      option_d: qType === "MCQ" ? "Refer to image (Option 4)" : "",
      correct_option: qType === "MCQ" ? (correctOptions[number] || "a") : "a",
      numerical_answer: qType === "NUMERICAL" ? (numericalAnswers[number] ?? null) : null,
      explanation: "Refer to the explanation image.",
      question_image: questionImageUrl,
      explanation_image: explanationImageUrl,
      status: "PUBLISHED",
      marks_positive: 4,
      marks_negative: qType === "NUMERICAL" ? 0 : 1,
    });
  }

  console.log(`Inserting ${records.length} records into database...`);
  const { error } = await supabase.from("pyq_questions").insert(records);
  if (error) {
    console.error("Insertion failed:", error.message);
  } else {
    console.log("Successfully imported JEE Main 23 Jan Shift 1!");
  }
}

run().catch(console.error);
