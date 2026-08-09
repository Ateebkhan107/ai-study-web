import fs from "node:fs/promises";
import process from "node:process";
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

const file = `tmp/wiley-jee-main-${subjectArg}/offline-chapter-${String(chapterNumber).padStart(2, "0")}.json`;
const questions = JSON.parse(await fs.readFile(file, "utf8"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let updated = 0;
for (const question of questions) {
  const values = {
    topic: question.topic,
    question_type: question.question_type,
    option_a: question.options?.[0] || null,
    option_b: question.options?.[1] || null,
    option_c: question.options?.[2] || null,
    option_d: question.options?.[3] || null,
    correct_option: question.correct_option,
    explanation: question.explanation,
    marks: 4,
    negative_marks: question.question_type === "Numerical" ? 0 : 1,
  };
  const { data, error } = await supabase.from("questions").update(values)
    .in("exam", ["JEE Main", "JEE"])
    .eq("subject", subject)
    .eq("chapter", chapter)
    .eq("question_text", question.question_text)
    .select("id");
  if (error) throw error;
  updated += data.length;
}

if (updated !== questions.length) throw new Error(`Expected ${questions.length} matching rows, updated ${updated}`);
console.log(JSON.stringify({ subject, sourceChapter: chapterNumber, chapter, updated }));
