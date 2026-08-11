import fs from "node:fs/promises";
import process from "node:process";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");

const subjectArg = String(process.argv[2] || "").toLowerCase();
const subject = subjectArg === "physics" ? "Physics" : subjectArg === "chemistry" ? "Chemistry" : null;
const chapterNumber = Number(process.argv[3]);
if (!subject || !Number.isInteger(chapterNumber)) throw new Error("Use: node ... <physics|chemistry> <chapter-number>");

const physicsChapters = [
  "Physical World, Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion",
  "Work, Energy and Power", "System of Particles and Rotational Motion", "Gravitation",
  "Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics",
  "Kinetic Theory", "Oscillations", "Waves", "Electric Charges and Fields", "Electrostatic Potential and Capacitance",
  "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction",
  "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics",
  "Dual Nature of Radiation and Matter", "Atoms", "Nuclei",
  "Semiconductor Electronics: Materials, Devices and Simple Circuits", "Communication Systems",
];
const chemistryChapters = [
  "Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements and Periodicity in Properties",
  "Chemical Bonding and Molecular Structure", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions",
  "Hydrogen", "The s-Block Elements", "The p-Block Elements (Group 13 and 14)",
  "Organic Chemistry - Some Basic Principles and Techniques", "Hydrocarbons", "Environmental Chemistry",
  "The Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
  "General Principles and Processes of Isolation of Elements", "The p-Block Elements (Group 15 to 18)",
  "The d- and f-Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes",
  "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines",
  "Biomolecules", "Polymers", "Chemistry in Everyday Life",
];
const chapter = (subject === "Physics" ? physicsChapters : chemistryChapters)[chapterNumber - 1];
if (!chapter) throw new Error(`Invalid ${subject} chapter ${chapterNumber}`);

const slug = subject.toLowerCase();
const file = `tmp/wiley-jee-main-${slug}/offline-chapter-${String(chapterNumber).padStart(2, "0")}.json`;
const questions = JSON.parse(await fs.readFile(file, "utf8"));
questions.sort((a, b) => a.number - b.number);
for (const question of questions) {
  if (!question.question_text || !question.correct_option || !question.explanation) throw new Error(`Q${question.number} is incomplete`);
  if (question.question_type === "MCQ" && question.options?.length !== 4) throw new Error(`Q${question.number} needs four options`);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: existing, error: existingError } = await supabase.from("questions")
  .select("id,question_text,question_image,question_order").in("exam", ["JEE Main", "JEE"]).eq("subject", subject).eq("chapter", chapter);
if (existingError) throw existingError;
const existingByText = new Map();
for (const row of existing || []) {
  const key = String(row.question_text || "").trim();
  if (!existingByText.has(key)) existingByText.set(key, []);
  existingByText.get(key).push(row);
}
for (const matches of existingByText.values()) {
  matches.sort((a, b) => (a.question_order ?? Number.MAX_SAFE_INTEGER) - (b.question_order ?? Number.MAX_SAFE_INTEGER));
}
const existingTextOccurrences = new Map();
let uploadedAssets = 0;
async function uploadQuestionImage(question) {
  if (!question.question_image_path) return null;
  const imagePath = path.resolve(question.question_image_path);
  const extension = path.extname(imagePath).toLowerCase() === ".jpg" ? "jpg" : "png";
  const objectPath = `wiley-jee-main/${slug}/chapter-${String(chapterNumber).padStart(2, "0")}/q${String(question.number).padStart(3, "0")}.${extension}`;
  const { error } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(imagePath), {
    contentType: extension === "jpg" ? "image/jpeg" : "image/png",
    upsert: true,
  });
  if (error) throw error;
  uploadedAssets += 1;
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

const rows = [];
let updatedImages = 0;
let updatedRows = 0;
for (const [index, question] of questions.entries()) {
  const textKey = question.question_text.trim();
  const occurrence = existingTextOccurrences.get(textKey) || 0;
  existingTextOccurrences.set(textKey, occurrence + 1);
  const existingRow = existingByText.get(textKey)?.[occurrence];
  if (existingRow) {
    let questionImage = null;
    if (question.question_image_path) {
      questionImage = await uploadQuestionImage(question);
      if (questionImage !== existingRow.question_image) {
        updatedImages += 1;
      }
    }
    const { error: updateError } = await supabase.from("questions")
      .update({
        exam: "JEE Main", subject, chapter, topic: question.topic, difficulty: "Medium",
        question_type: question.question_type, question_text: question.question_text,
        question_image: questionImage,
        option_a: question.options?.[0] || null, option_b: question.options?.[1] || null,
        option_c: question.options?.[2] || null, option_d: question.options?.[3] || null,
        option_a_image: null, option_b_image: null, option_c_image: null, option_d_image: null,
        correct_option: question.correct_option, explanation: question.explanation,
        explanation_image: null, marks: 4,
        negative_marks: question.question_type === "Numerical" ? 0 : 1,
        is_active: true, question_order: index + 1,
      })
      .eq("id", existingRow.id);
    if (updateError) throw updateError;
    updatedRows += 1;
    continue;
  }
  rows.push({
    exam: "JEE Main", subject, chapter, topic: question.topic, difficulty: "Medium", question_type: question.question_type,
    question_text: question.question_text, question_image: await uploadQuestionImage(question),
    option_a: question.options?.[0] || null, option_b: question.options?.[1] || null,
    option_c: question.options?.[2] || null, option_d: question.options?.[3] || null,
    option_a_image: null, option_b_image: null, option_c_image: null, option_d_image: null,
    correct_option: question.correct_option, explanation: question.explanation, explanation_image: null,
    marks: 4, negative_marks: question.question_type === "Numerical" ? 0 : 1, is_active: true, question_order: index + 1,
  });
}
let inserted = 0;
if (rows.length) {
  const { data, error } = await supabase.from("questions").insert(rows).select("id");
  if (error) throw error;
  inserted = data.length;
}
if (!inserted && !updatedRows && !updatedImages && !uploadedAssets) throw new Error("No question changes to publish");
console.log(JSON.stringify({ subject, sourceChapter: chapterNumber, chapter, inserted, updatedRows, updatedImages, uploadedAssets }));
