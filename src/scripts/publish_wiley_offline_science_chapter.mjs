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
  "Physical World & Units of Measurement",
  "Kinematics (Motion in a Straight Line & Plane)", "Kinematics (Motion in a Straight Line & Plane)",
  "Laws of Motion & Friction", "Work, Energy & Power", "System of Particles & Rotational Motion", "Gravitation",
  "Mechanical Properties of Solids & Fluids", "Mechanical Properties of Solids & Fluids",
  "Thermal Properties of Matter & Thermodynamics", "Thermal Properties of Matter & Thermodynamics",
  "Kinetic Theory of Gases & Oscillations (SHM)", "Kinetic Theory of Gases & Oscillations (SHM)", "Waves & Sound",
  "Electrostatics & Capacitance", "Electrostatics & Capacitance", "Current Electricity",
  "Magnetic Effects of Current & Magnetism", "Magnetic Effects of Current & Magnetism",
  "Electromagnetic Induction & Alternating Current", "Electromagnetic Induction & Alternating Current",
  "Electromagnetic Waves", "Ray Optics & Optical Instruments", "Wave Optics", "Dual Nature of Radiation & Matter",
  "Atoms & Nuclei", "Atoms & Nuclei", "Semiconductor Electronics & Devices", "Communication Systems",
];
const chemistryChapters = [
  "Some Basic Concepts of Chemistry (Mole Concept)", "Structure of Atom", "Classification of Elements & Periodicity",
  "Chemical Bonding & Molecular Structure", "States of Matter: Gases & Liquids", "Chemical Thermodynamics & Energetics",
  "Chemical & Ionic Equilibrium", "Redox Reactions & Electrochemistry", "Hydrogen",
  "s-Block Elements", "p-Block Elements (Groups 13 to 18)", "General Organic Chemistry (GOC) & Nomenclature",
  "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)", "Environmental Chemistry",
  "Solid State", "Solutions & Colligative Properties", "Redox Reactions & Electrochemistry",
  "Chemical Kinetics", "Surface Chemistry", "General Principles of Extraction (Metallurgy)",
  "p-Block Elements (Groups 13 to 18)", "d and f-Block Elements", "Coordination Compounds", "Haloalkanes & Haloarenes",
  "Alcohols, Phenols & Ethers", "Aldehydes, Ketones & Carboxylic Acids", "Amines & Organic Nitrogen Compounds",
  "Biomolecules", "Polymers", "Chemistry in Everyday Life",
];
const chapter = (subject === "Physics" ? physicsChapters : chemistryChapters)[chapterNumber - 1];
if (!chapter) throw new Error(`Invalid ${subject} chapter ${chapterNumber}`);

const slug = subject.toLowerCase();
const file = `tmp/wiley-jee-main-${slug}/offline-chapter-${String(chapterNumber).padStart(2, "0")}.json`;
const questions = JSON.parse(await fs.readFile(file, "utf8"));
for (const question of questions) {
  if (!question.question_text || !question.correct_option || !question.explanation) throw new Error(`Q${question.number} is incomplete`);
  if (question.question_type === "MCQ" && question.options?.length !== 4) throw new Error(`Q${question.number} needs four options`);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: existing, error: existingError } = await supabase.from("questions")
  .select("id,question_text,question_image").in("exam", ["JEE Main", "JEE"]).eq("subject", subject).eq("chapter", chapter);
if (existingError) throw existingError;
const existingByText = new Map((existing || []).map((row) => [String(row.question_text || "").trim(), row]));
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
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

const rows = [];
let updatedImages = 0;
for (const [index, question] of questions.entries()) {
  const existingRow = existingByText.get(question.question_text.trim());
  if (existingRow) {
    if (question.question_image_path) {
      const questionImage = await uploadQuestionImage(question);
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
if (!inserted && !updatedImages) throw new Error("No new questions or image updates to publish");
console.log(JSON.stringify({ subject, sourceChapter: chapterNumber, chapter, inserted, updatedImages }));
