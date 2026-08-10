/**
 * Chapterwise Wiley JEE Main Chemistry offline publish helper.
 *
 * Offline files live at:
 *   tmp/wiley-jee-main-chemistry/offline-chapter-NN.json
 * Answer keys:
 *   tmp/wiley-jee-main-chemistry/answer-keys.json
 *
 * Usage:
 *   node src/scripts/import_wiley_jee_main_chemistry.mjs --publish <chapter>
 *   node src/scripts/import_wiley_jee_main_chemistry.mjs --publish-all
 *   node src/scripts/import_wiley_jee_main_chemistry.mjs --audit <chapter>
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");

const ROOT = path.resolve("tmp/wiley-jee-main-chemistry");
const KEYS = path.join(ROOT, "answer-keys.json");

export const chemistryChapters = [
  "Some Basic Concepts of Chemistry (Mole Concept)",
  "Structure of Atom",
  "Classification of Elements & Periodicity",
  "Chemical Bonding & Molecular Structure",
  "States of Matter: Gases & Liquids",
  "Chemical Thermodynamics & Energetics",
  "Chemical & Ionic Equilibrium",
  "Redox Reactions & Electrochemistry",
  "Hydrogen",
  "s-Block Elements",
  "p-Block Elements (Groups 13 to 18)",
  "General Organic Chemistry (GOC) & Nomenclature",
  "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
  "Environmental Chemistry",
  "Solid State",
  "Solutions & Colligative Properties",
  "Redox Reactions & Electrochemistry",
  "Chemical Kinetics",
  "Surface Chemistry",
  "General Principles of Extraction (Metallurgy)",
  "p-Block Elements (Groups 13 to 18)",
  "d and f-Block Elements",
  "Coordination Compounds",
  "Haloalkanes & Haloarenes",
  "Alcohols, Phenols & Ethers",
  "Aldehydes, Ketones & Carboxylic Acids",
  "Amines & Organic Nitrogen Compounds",
  "Biomolecules",
  "Polymers",
  "Chemistry in Everyday Life",
];

/** Printed CQ page → PDF page offset: PDF = CQ + 6 */
export const chapterPages = {
  1: [7, 10], 2: [11, 16], 3: [17, 20], 4: [21, 26], 5: [27, 30],
  6: [31, 38], 7: [39, 46], 8: [47, 50], 9: [51, 54], 10: [55, 58],
  11: [59, 62], 12: [63, 70], 13: [71, 78], 14: [79, 82], 15: [83, 86],
  16: [87, 92], 17: [93, 100], 18: [101, 108], 19: [109, 114], 20: [115, 118],
  21: [119, 124], 22: [125, 130], 23: [131, 138], 24: [139, 148], 25: [149, 156],
  26: [157, 170], 27: [171, 180], 28: [181, 186], 29: [187, 192], 30: [193, 196],
};

function chapterFile(n) {
  return path.join(ROOT, `offline-chapter-${String(n).padStart(2, "0")}.json`);
}

function hasUnbalancedDollar(value) {
  return ((String(value || "").match(/\$/g) || []).length % 2) !== 0;
}

async function loadChapter(chapterNumber) {
  const chapter = chemistryChapters[chapterNumber - 1];
  if (!chapter) throw new Error(`Invalid chapter ${chapterNumber}`);
  const questions = JSON.parse(await fs.readFile(chapterFile(chapterNumber), "utf8"));
  const keys = JSON.parse(await fs.readFile(KEYS, "utf8"))[String(chapterNumber)] || {};
  const problems = [];
  for (const question of questions) {
    if (!question.question_text || !question.correct_option || !question.explanation) {
      problems.push({ number: question.number, reason: "incomplete" });
    }
    if (question.question_type === "MCQ" && question.options?.length !== 4) {
      problems.push({ number: question.number, reason: "need four options" });
    }
    if (hasUnbalancedDollar([question.question_text, ...(question.options || []), question.explanation].join(" "))) {
      problems.push({ number: question.number, reason: "unbalanced_dollar_math" });
    }
    const keyed = keys[String(question.number)];
    if (keyed && keyed !== "DROPPED" && String(question.correct_option) !== String(keyed)) {
      problems.push({ number: question.number, reason: `answer_mismatch offline=${question.correct_option} key=${keyed}` });
    }
  }
  return { chapter, questions, problems };
}

async function uploadQuestionImage(supabase, chapterNumber, question) {
  if (!question.question_image_path) return null;
  const imagePath = path.resolve(question.question_image_path);
  const extension = path.extname(imagePath).toLowerCase() === ".jpg" ? "jpg" : "png";
  const objectPath = `wiley-jee-main/chemistry/chapter-${String(chapterNumber).padStart(2, "0")}/q${String(question.number).padStart(3, "0")}.${extension}`;
  const { error } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(imagePath), {
    contentType: extension === "jpg" ? "image/jpeg" : "image/png",
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

async function publishChapter(chapterNumber, { allowAnswerMismatch = false } = {}) {
  for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
    if (!process.env[key]) throw new Error(`${key} is required`);
  }
  const { chapter, questions, problems } = await loadChapter(chapterNumber);
  const blocking = problems.filter((problem) => allowAnswerMismatch ? problem.reason === "incomplete" || problem.reason === "need four options" : true);
  if (blocking.length) {
    console.error(JSON.stringify({ chapterNumber, problems: blocking }, null, 2));
    throw new Error(`Chapter ${chapterNumber} has ${blocking.length} audit problems`);
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: existing, error: existingError } = await supabase.from("questions")
    .select("id,question_text,question_image")
    .in("exam", ["JEE Main", "JEE"])
    .eq("subject", "Chemistry")
    .eq("chapter", chapter);
  if (existingError) throw existingError;
  const existingByText = new Map((existing || []).map((row) => [String(row.question_text || "").trim(), row]));

  const rows = [];
  let updatedImages = 0;
  for (const [index, question] of questions.entries()) {
    if (question.correct_option === "DROPPED") continue;
    const existingRow = existingByText.get(question.question_text.trim());
    if (existingRow) {
      if (question.question_image_path) {
        const questionImage = await uploadQuestionImage(supabase, chapterNumber, question);
        if (questionImage !== existingRow.question_image) {
          const { error: updateError } = await supabase.from("questions")
            .update({ question_image: questionImage })
            .eq("id", existingRow.id);
          if (updateError) throw updateError;
          updatedImages += 1;
        }
      }
      continue;
    }
    rows.push({
      exam: "JEE Main",
      subject: "Chemistry",
      chapter,
      topic: question.topic,
      difficulty: "Medium",
      question_type: question.question_type,
      question_text: question.question_text,
      question_image: await uploadQuestionImage(supabase, chapterNumber, question),
      option_a: question.options?.[0] || null,
      option_b: question.options?.[1] || null,
      option_c: question.options?.[2] || null,
      option_d: question.options?.[3] || null,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null,
      correct_option: question.correct_option,
      explanation: question.explanation,
      explanation_image: null,
      marks: 4,
      negative_marks: question.question_type === "Numerical" ? 0 : 1,
      is_active: true,
      question_order: index + 1,
    });
  }

  let inserted = 0;
  if (rows.length) {
    for (let start = 0; start < rows.length; start += 40) {
      const { data, error } = await supabase.from("questions").insert(rows.slice(start, start + 40)).select("id");
      if (error) throw error;
      inserted += data.length;
    }
  }
  const result = { subject: "Chemistry", sourceChapter: chapterNumber, chapter, inserted, updatedImages, totalOffline: questions.length };
  console.log(JSON.stringify(result));
  return result;
}

const mode = process.argv[2];
if (mode === "--audit") {
  const chapterNumber = Number(process.argv[3]);
  const { chapter, questions, problems } = await loadChapter(chapterNumber);
  console.log(JSON.stringify({ chapterNumber, chapter, count: questions.length, problems }, null, 2));
  if (problems.length) process.exitCode = 1;
} else if (mode === "--publish") {
  await publishChapter(Number(process.argv[3]), { allowAnswerMismatch: process.argv.includes("--force") });
} else if (mode === "--publish-all") {
  const names = (await fs.readdir(ROOT)).filter((name) => /^offline-chapter-\d{2}\.json$/.test(name)).sort();
  for (const name of names) {
    const chapterNumber = Number(name.match(/\d{2}/)[0]);
    await publishChapter(chapterNumber, { allowAnswerMismatch: process.argv.includes("--force") });
  }
} else {
  throw new Error("Use --audit <n>, --publish <n>, or --publish-all");
}
