import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const dryRun = process.argv.includes("--dry-run");
const paperCode = "JEE-MAIN-25-22JAN-S2";
const attempt = "22 Jan";
const shift = "Shift 2";
const cropDir = path.resolve("tmp/jee-main-cropped/jee_main_22_jan_shift_2");
const pageDir = path.resolve("tmp/jee-main-2025-shift-2/question-images");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MANUAL_QUESTIONS = {
  5: {
    subject: "Maths",
    chapter: "Straight Lines",
    question_type: "MCQ",
    question_page: "page-02.png",
    explanation_page: "page-02.png",
    question:
      "Question 5: A rod of length eight units moves such that its ends A and B always lie on the lines x - y + 2 = 0 and y + 2 = 0, respectively. If the locus of the point P, that divides the rod AB internally in the ratio 2 : 1 is 9(x^2 + alpha y^2 + beta xy + gamma x + 28y) - 76 = 0, then alpha - beta - gamma is equal to:",
    option_a: "24",
    option_b: "23",
    option_c: "21",
    option_d: "22",
    correct_option: "b",
    explanation:
      "Write the endpoints on the two lines, use the section formula for the point dividing the rod in the ratio 2:1, and then impose AB = 8. The resulting locus simplifies to 9(x^2 + 13y^2 - 6xy - 4x + 28y) = 76, so alpha = 13, beta = -6 and gamma = -4. Hence alpha - beta - gamma = 23.",
  },
  6: {
    subject: "Maths",
    chapter: "Three Dimensional Geometry",
    question_type: "MCQ",
    question_page: "page-02.png",
    explanation_page: "page-02.png",
    question:
      "Question 6: The distance of the line (x - 2)/2 = (y - 6)/3 = (z - 3)/4 from the point (1, 4, 0) along the line x/1 = (y - 2)/2 = (z + 3)/3 is:",
    option_a: "sqrt(17)",
    option_b: "sqrt(14)",
    option_c: "sqrt(15)",
    option_d: "sqrt(13)",
    correct_option: "b",
    explanation:
      "Take the line through (1, 4, 0) in the given direction and intersect it with the first line. The intersection point comes out to be (2, 6, 3). The required distance from (1, 4, 0) to this point is sqrt((2 - 1)^2 + (6 - 4)^2 + (3 - 0)^2) = sqrt(14).",
  },
  8: {
    subject: "Maths",
    chapter: "Definite Integrals",
    question_type: "MCQ",
    question_page: "page-02.png",
    explanation_page: "page-03.png",
    question:
      "Question 8: If the area of the region {(x, y) : -1 <= x <= 1, 0 <= y <= a + e^|x| - e^-x, a > 0} is (e^2 + 8e + 1)/e, then the value of a is:",
    option_a: "7",
    option_b: "6",
    option_c: "8",
    option_d: "5",
    correct_option: "d",
    explanation:
      "Split the integral at x = 0 because of |x|. The total area becomes 2a + integral from 0 to 1 of (a + e^x - e^-x) dx + integral from -1 to 0 of a dx, which simplifies to 2a + e + 1/e - 2. Equating this with (e^2 + 8e + 1)/e gives 2a = 10 and hence a = 5.",
  },
  9: {
    subject: "Maths",
    chapter: "Application of Derivatives",
    question_type: "MCQ",
    question_page: "page-03.png",
    explanation_page: "page-03.png",
    question:
      "Question 9: A spherical chocolate ball has a layer of ice-cream of uniform thickness around it. When the thickness of the ice-cream layer is 1 cm, the ice-cream melts at the rate of 81 cm^3/min and the thickness of the ice-cream layer decreases at the rate of 1/(4pi) cm/min. The surface area (in cm^2) of the chocolate ball (without the ice-cream layer) is:",
    option_a: "225pi",
    option_b: "128pi",
    option_c: "196pi",
    option_d: "256pi",
    correct_option: "d",
    explanation:
      "Let r be the outer radius of the ice-cream layer. Then dV/dt = 4pi r^2 dr/dt. Using dV/dt = 81 and dr/dt = 1/(4pi) gives r^2 = 81, so the outer radius is 9 cm. Since the layer thickness is 1 cm, the chocolate ball radius is 8 cm and its surface area is 4pi(8^2) = 256pi.",
  },
  28: {
    subject: "Physics",
    chapter: "Ray Optics and Optical Instruments",
    question_type: "MCQ",
    question_page: "page-08.png",
    explanation_page: "page-08.png",
    question:
      "Question 28: The refractive index of the material of a glass prism is sqrt(3). The angle of minimum deviation is equal to the angle of the prism. What is the angle of the prism?",
    option_a: "50 degrees",
    option_b: "60 degrees",
    option_c: "58 degrees",
    option_d: "48 degrees",
    correct_option: "b",
    explanation:
      "For a prism at minimum deviation, mu = sin((A + delta_m)/2) / sin(A/2). Given delta_m = A and mu = sqrt(3), we get sqrt(3) = sin A / sin(A/2) = 2 cos(A/2). Therefore cos(A/2) = sqrt(3)/2, so A/2 = 30 degrees and A = 60 degrees.",
  },
  33: {
    subject: "Physics",
    chapter: "Mechanical Properties of Fluids",
    question_type: "MCQ",
    question_page: "page-09.png",
    explanation_page: "page-09.png",
    question:
      "Question 33: Water flows in a horizontal pipe whose one end is closed with a valve. The reading of the pressure gauge attached to the pipe is P1. The reading of the pressure gauge falls to P2, when the valve is opened. The speed of water flowing in the pipe is proportional to:",
    option_a: "sqrt(P1 - P2)",
    option_b: "(P1 - P2)^2",
    option_c: "(P1 - P2)^4",
    option_d: "P1 - P2",
    correct_option: "a",
    explanation:
      "Apply Bernoulli's equation between the closed state and the flowing state in the horizontal pipe. The pressure drop provides kinetic energy, so P1 = P2 + (1/2) rho v^2. Hence v is proportional to sqrt(P1 - P2).",
  },
  34: {
    subject: "Physics",
    chapter: "Units and Dimensions",
    question_type: "MCQ",
    question_page: "page-09.png",
    explanation_page: "page-09.png",
    question:
      "Question 34: Match List-I with List-II. List-I: (A) Permeability of free space, (B) Magnetic field, (C) Magnetic moment, (D) Torsional constant. List-II: (I) [M L^2 T^-2], (II) [M T^-2 A^-1], (III) [M L T^-2 A^-2], (IV) [L^2 A]. Choose the correct answer from the options given below:",
    option_a: "(A)-(I), (B)-(IV), (C)-(II), (D)-(III)",
    option_b: "(A)-(II), (B)-(I), (C)-(III), (D)-(IV)",
    option_c: "(A)-(IV), (B)-(III), (C)-(I), (D)-(II)",
    option_d: "(A)-(III), (B)-(II), (C)-(IV), (D)-(I)",
    correct_option: "d",
    explanation:
      "Use the standard dimensions: permeability of free space is [M L T^-2 A^-2], magnetic field is [M T^-2 A^-1], magnetic moment is current times area so [L^2 A], and torsional constant has the dimensions of torque so [M L^2 T^-2]. This matches option (4).",
  },
  38: {
    subject: "Physics",
    chapter: "Wave Optics",
    question_type: "MCQ",
    question_page: "page-10.png",
    explanation_page: "page-10.png",
    question:
      "Question 38: The width of one of the two slits in Young's double slit experiment is d while that of the other slit is xd. If the ratio of the maximum to the minimum intensity in the interference pattern on the screen is 9 : 4, then what is the value of x? Assume that the field strength varies according to the slit width.",
    option_a: "2",
    option_b: "3",
    option_c: "5",
    option_d: "4",
    correct_option: "c",
    explanation:
      "If field amplitude is proportional to slit width, then the amplitudes are in the ratio 1 : x and the corresponding intensities are proportional to 1 and x^2. Using Imax/Imin = ((x + 1)/(x - 1))^2 = 9/4 gives (x + 1)/(x - 1) = 3/2. Solving gives x = 5.",
  },
  43: {
    subject: "Physics",
    chapter: "Thermodynamics",
    question_type: "MCQ",
    question_page: "page-11.png",
    explanation_page: "page-11.png",
    question:
      "Question 43: Using the given P-V diagram, the work done by an ideal gas along the path ABCD is:",
    option_a: "4 P0 V0",
    option_b: "3 P0 V0",
    option_c: "-4 P0 V0",
    option_d: "-3 P0 V0",
    correct_option: "d",
    explanation:
      "Only the horizontal segments contribute to work. Along AB, the gas expands from 2V0 to 3V0 at pressure P0, so the work is +P0V0. Along CD, it is compressed from 3V0 to V0 at pressure 2P0, so the work is -4P0V0. Therefore the net work along ABCD is -3P0V0.",
  },
  49: {
    subject: "Physics",
    chapter: "Electromagnetic Waves",
    question_type: "NUMERICAL",
    question_page: "page-13.png",
    explanation_page: "page-13.png",
    question:
      "Question 49: A time varying potential difference is applied between the plates of a parallel plate capacitor of capacitance 2.5 microfarad. The dielectric constant of the medium between the capacitor plates is 1. It produces an instantaneous displacement current of 0.25 mA in the intervening space between the capacitor plates. The magnitude of the rate of change of the potential difference will be ______ V s^-1.",
    option_a: "NA",
    option_b: "NA",
    option_c: "NA",
    option_d: "NA",
    correct_option: "a",
    numerical_answer: 100,
    explanation:
      "For displacement current in a capacitor, I = C dV/dt. Therefore dV/dt = I/C = (0.25 x 10^-3)/(2.5 x 10^-6) = 100 V s^-1.",
  },
  68: {
    subject: "Chemistry",
    chapter: "Solutions",
    question_type: "MCQ",
    question_page: "page-18.png",
    explanation_page: "page-18.png",
    question:
      "Question 68: Consider a binary solution of two volatile liquid components 1 and 2. x1 and y1 are the mole fractions of component 1 in liquid and vapour phase, respectively. The slope and intercept of the linear plot of 1/x1 vs 1/y1 are given respectively as:",
    option_a: "P1^0 / P2^0 , (P2^0 - P1^0) / P2^0",
    option_b: "P2^0 / P1^0 , (P1^0 - P2^0) / P2^0",
    option_c: "P1^0 / P2^0 , (P1^0 - P2^0) / P2^0",
    option_d: "P2^0 / P1^0 , (P2^0 - P1^0) / P1^0",
    correct_option: "a",
    explanation:
      "Use Raoult's law for an ideal binary solution. Rearranging the vapour-liquid relation gives 1/x1 = (P1^0/P2^0)(1/y1) + (P2^0 - P1^0)/P2^0. Hence the slope is P1^0/P2^0 and the intercept is (P2^0 - P1^0)/P2^0.",
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
  const trimmed = rawText
    .replace(/\f/g, "")
    .replace(new RegExp(`^${questionNumber}[.)]?\\s*`, "i"), "")
    .replace(/^Question\s+\d+\s*:\s*/i, "")
    .trim();

  const beforeAnswer = trimmed.split(/\bAns[.:]?\b/i)[0]?.trim() || trimmed;
  return `Question ${questionNumber}: ${beforeAnswer || "Refer to the question image."}`;
}

function finalizeQuestionText(rawText, questionNumber) {
  const candidate = parseQuestionText(rawText, questionNumber);
  const body = candidate.replace(/^Question\s+\d+\s*:\s*/i, "").trim();
  const alphaNumericCount = (body.match(/[A-Za-z0-9]/g) || []).length;
  const noisyCount = (body.match(/[|~_]+/g) || []).length;

  if (
    alphaNumericCount < 24 ||
    noisyCount > 4 ||
    /\bSECTION-[AB]\b/i.test(body) ||
    /^0$/.test(body)
  ) {
    return `Question ${questionNumber}: Refer to the question image.`;
  }

  return candidate;
}

function parseOptions(rawText) {
  const flattened = rawText.replace(/\n/g, " ");
  const matches = [...flattened.matchAll(/\((1|2|3|4)\)\s*(.+?)(?=\s*\((?:1|2|3|4)\)\s*|(?:\bAns[.:]?\b)|$)/g)];

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
        exam_date: "2025-01-22",
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
      exam_date: "2025-01-22",
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

async function manualRecord(questionNumber, examId) {
  const manual = MANUAL_QUESTIONS[questionNumber];
  let questionImageUrl = null;
  let explanationImageUrl = null;

  if (!dryRun) {
    const questionPagePath = path.join(pageDir, manual.question_page);
    const explanationPagePath = path.join(pageDir, manual.explanation_page);

    questionImageUrl = await uploadImage(
      `jee-main-2025/22-jan-shift-2/manual-q${String(questionNumber).padStart(2, "0")}.png`,
      questionPagePath
    );
    explanationImageUrl = await uploadImage(
      `jee-main-2025/22-jan-shift-2/manual-q${String(questionNumber).padStart(2, "0")}-solution.png`,
      explanationPagePath
    );
  }

  return {
    exam_id: examId,
    exam: "JEE",
    exam_type: "JEE Main",
    year: 2025,
    attempt,
    shift,
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
    numerical_answer: maybeNumber(manual.numerical_answer),
    explanation: manual.explanation,
    question_image: questionImageUrl,
    explanation_image: explanationImageUrl,
    status: "PUBLISHED",
    marks_positive: 4,
    marks_negative: manual.question_type === "NUMERICAL" ? 0 : 1,
  };
}

async function buildRecords() {
  const dirEntries = await fs.readdir(cropDir);
  const examId = dryRun ? "dry-run-exam" : await ensureExam();
  const records = [];

  for (let questionNumber = 1; questionNumber <= 75; questionNumber += 1) {
    if (MANUAL_QUESTIONS[questionNumber]) {
      records.push(await manualRecord(questionNumber, examId));
      continue;
    }

    const questionPath = path.join(cropDir, `Q${questionNumber}_question.png`);
    const solutionPath = path.join(cropDir, `Q${questionNumber}_solution.png`);
    const hasQuestion = dirEntries.includes(`Q${questionNumber}_question.png`);

    if (!hasQuestion) {
      throw new Error(`Missing crop for Q${questionNumber}`);
    }

    const questionType = typeForQuestion(questionNumber);
    const subject = subjectForQuestion(questionNumber);
    const questionOcr = ocrImage(questionPath);
    const solutionOcr = dirEntries.includes(`Q${questionNumber}_solution.png`) ? ocrImage(solutionPath) : "";
    const optionTexts = questionType === "MCQ" ? parseOptions(questionOcr) : null;
    const numericalAnswer = questionType === "NUMERICAL" ? parseNumericalAnswer(solutionOcr || questionOcr) : null;
    const correctOption = questionType === "MCQ"
      ? resolveCorrectOption(
          optionTexts || ["Option (1)", "Option (2)", "Option (3)", "Option (4)"],
          solutionOcr || questionOcr
        )
      : null;

    let questionImageUrl = null;
    let explanationImageUrl = null;

    if (!dryRun) {
      questionImageUrl = await uploadImage(
        `jee-main-2025/22-jan-shift-2/q${String(questionNumber).padStart(2, "0")}.png`,
        questionPath
      );

      if (dirEntries.includes(`Q${questionNumber}_solution.png`)) {
        explanationImageUrl = await uploadImage(
          `jee-main-2025/22-jan-shift-2/q${String(questionNumber).padStart(2, "0")}-solution.png`,
          solutionPath
        );
      }
    }

    records.push({
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
      question: finalizeQuestionText(questionOcr, questionNumber),
      option_a: optionTexts?.[0] || "Option (1) - see question image",
      option_b: optionTexts?.[1] || "Option (2) - see question image",
      option_c: optionTexts?.[2] || "Option (3) - see question image",
      option_d: optionTexts?.[3] || "Option (4) - see question image",
      correct_option: correctOption || "a",
      numerical_answer: maybeNumber(numericalAnswer),
      explanation: solutionOcr || "Refer to the explanation image.",
      question_image: questionImageUrl,
      explanation_image: explanationImageUrl,
      status: "PUBLISHED",
      marks_positive: 4,
      marks_negative: questionType === "NUMERICAL" ? 0 : 1,
    });
  }

  return records;
}

async function main() {
  const records = await buildRecords();

  const summary = {
    dryRun,
    total: records.length,
    withQuestionImages: records.filter((record) => !!record.question_image).length,
    withExplanationImages: records.filter((record) => !!record.explanation_image).length,
    withPlaceholderOptions: records.filter((record) => record.option_a === "Option A").length,
    withExplanationText: records.filter((record) => !!record.explanation).length,
    manualQuestions: Object.keys(MANUAL_QUESTIONS).map(Number),
  };

  if (dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    const samples = records
      .filter((record) => typeof record.question === "string" && record.question.startsWith("Question "))
      .slice(0, 12)
      .map((record) => ({
        question: record.question.slice(0, 120),
        type: record.question_type,
        subject: record.subject,
        option_a: record.option_a,
        correct_option: record.correct_option,
        numerical_answer: record.numerical_answer,
      }));
    console.log(JSON.stringify(samples, null, 2));
    return;
  }

  const { data: existing, error: existingError } = await supabase
    .from("pyq_questions")
    .select("id")
    .eq("paper_code", paperCode);

  if (existingError) {
    throw new Error(`Failed to load existing Shift 2 rows: ${existingError.message}`);
  }

  if ((existing || []).length > 0) {
    const { error: deleteError } = await supabase
      .from("pyq_questions")
      .delete()
      .eq("paper_code", paperCode);

    if (deleteError) {
      throw new Error(`Failed to remove existing Shift 2 rows: ${deleteError.message}`);
    }
  }

  for (let start = 0; start < records.length; start += 20) {
    const batch = records.slice(start, start + 20);
    const { error } = await supabase.from("pyq_questions").insert(batch);
    if (error) {
      throw new Error(`Question insert failed for batch starting at ${start + 1}: ${error.message}`);
    }
    console.log(`Inserted questions ${start + 1}-${start + batch.length}`);
  }

  const { count, error: countError } = await supabase
    .from("pyq_questions")
    .select("*", { count: "exact", head: true })
    .eq("paper_code", paperCode);

  if (countError) {
    throw new Error(`Failed to verify Shift 2 row count: ${countError.message}`);
  }

  console.log(JSON.stringify({ ...summary, finalRowCount: count ?? 0 }, null, 2));
}

await main();
