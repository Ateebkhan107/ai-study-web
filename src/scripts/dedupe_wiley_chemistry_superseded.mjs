import fs from "node:fs/promises";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");

const sources = [
  {
    subject: "Physics",
    directory: "tmp/wiley-jee-main-physics",
    chapters: [
      "Physical World & Units of Measurement", "Kinematics (Motion in a Straight Line & Plane)",
      "Kinematics (Motion in a Straight Line & Plane)", "Laws of Motion & Friction", "Work, Energy & Power",
      "System of Particles & Rotational Motion", "Gravitation", "Mechanical Properties of Solids & Fluids",
      "Mechanical Properties of Solids & Fluids", "Thermal Properties of Matter & Thermodynamics",
      "Thermal Properties of Matter & Thermodynamics", "Kinetic Theory of Gases & Oscillations (SHM)",
      "Kinetic Theory of Gases & Oscillations (SHM)", "Waves & Sound", "Electrostatics & Capacitance",
      "Electrostatics & Capacitance", "Current Electricity", "Magnetic Effects of Current & Magnetism",
      "Magnetic Effects of Current & Magnetism", "Electromagnetic Induction & Alternating Current",
      "Electromagnetic Induction & Alternating Current", "Electromagnetic Waves", "Ray Optics & Optical Instruments",
      "Wave Optics", "Dual Nature of Radiation & Matter", "Atoms & Nuclei", "Atoms & Nuclei",
      "Semiconductor Electronics & Devices", "Communication Systems",
    ],
  },
  {
    subject: "Chemistry",
    directory: "tmp/wiley-jee-main-chemistry",
    chapters: [
      "Some Basic Concepts of Chemistry (Mole Concept)", "Structure of Atom", "Classification of Elements & Periodicity",
      "Chemical Bonding & Molecular Structure", "States of Matter: Gases & Liquids", "Chemical Thermodynamics & Energetics",
      "Chemical & Ionic Equilibrium", "Redox Reactions & Electrochemistry", "Hydrogen", "s-Block Elements",
      "p-Block Elements (Groups 13 to 18)", "General Organic Chemistry (GOC) & Nomenclature",
      "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)", "Environmental Chemistry", "Solid State",
      "Solutions & Colligative Properties", "Redox Reactions & Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
      "General Principles of Extraction (Metallurgy)", "p-Block Elements (Groups 13 to 18)", "d and f-Block Elements",
      "Coordination Compounds", "Haloalkanes & Haloarenes", "Alcohols, Phenols & Ethers",
      "Aldehydes, Ketones & Carboxylic Acids", "Amines & Organic Nitrogen Compounds", "Biomolecules", "Polymers",
      "Chemistry in Everyday Life",
    ],
  },
];

const expectedCounts = new Map();
for (const source of sources) {
  for (let chapterNumber = 1; chapterNumber <= source.chapters.length; chapterNumber += 1) {
    const filename = `${source.directory}/offline-chapter-${String(chapterNumber).padStart(2, "0")}.json`;
    const questions = JSON.parse(await fs.readFile(filename, "utf8"));
    for (const question of questions) {
      const identity = `${source.subject}\0${source.chapters[chapterNumber - 1]}\0${question.question_text.trim()}`;
      expectedCounts.set(identity, (expectedCounts.get(identity) || 0) + 1);
    }
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const rows = [];
for (const source of sources) {
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("questions")
      .select("id,subject,chapter,question_text,question_order,created_at")
      .in("exam", ["JEE Main", "JEE"])
      .eq("subject", source.subject)
      .in("chapter", [...new Set(source.chapters)])
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) break;
  }
}

const usedCounts = new Map();
const superseded = [];
for (const row of rows) {
  const identity = `${row.subject}\0${row.chapter}\0${String(row.question_text || "").trim()}`;
  const occurrence = usedCounts.get(identity) || 0;
  if (occurrence < (expectedCounts.get(identity) || 0)) usedCounts.set(identity, occurrence + 1);
  else superseded.push(row);
}

const distribution = superseded.reduce((counts, row) => {
  const key = `${row.subject} · ${row.chapter}`;
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});
const expectedDistribution = {
  "Physics · Laws of Motion & Friction": 1,
  "Physics · Work, Energy & Power": 1,
  "Physics · Thermal Properties of Matter & Thermodynamics": 1,
  "Chemistry · Surface Chemistry": 1,
  "Chemistry · Polymers": 22,
  "Chemistry · Chemistry in Everyday Life": 10,
};
const distributionMatches = Object.keys(expectedDistribution).every((key) => distribution[key] === expectedDistribution[key])
  && Object.keys(distribution).length === Object.keys(expectedDistribution).length;
if (superseded.length !== 36 || !distributionMatches) {
  throw new Error(`Refusing deletion: expected 36 superseded rows with ${JSON.stringify(expectedDistribution)}, found ${superseded.length} with ${JSON.stringify(distribution)}`);
}

const { data: references, error: referenceError } = await supabase.from("test_questions")
  .select("id,test_id,question_id,question_order")
  .in("question_id", superseded.map((row) => row.id));
if (referenceError) throw referenceError;
const supersededIds = new Set(superseded.map((row) => row.id));
const replacements = new Map();
for (const row of superseded.filter((item) => references.some((reference) => reference.question_id === item.id))) {
  const candidates = rows.filter((candidate) => {
    if (supersededIds.has(candidate.id)) return false;
    if (candidate.subject !== row.subject || candidate.chapter !== row.chapter || candidate.question_order !== row.question_order) return false;
    const identity = `${candidate.subject}\0${candidate.chapter}\0${String(candidate.question_text || "").trim()}`;
    return expectedCounts.has(identity);
  });
  if (candidates.length !== 1) {
    throw new Error(`Refusing remap: expected one replacement for ${row.id}, found ${candidates.length}`);
  }
  replacements.set(row.id, candidates[0].id);
}
const referencedTestIds = [...new Set(references.map((row) => row.test_id).filter(Boolean))];
const { data: testQuestionRows, error: testQuestionError } = referencedTestIds.length
  ? await supabase.from("test_questions").select("id,test_id,question_id").in("test_id", referencedTestIds)
  : { data: [], error: null };
if (testQuestionError) throw testQuestionError;
const collisions = references.filter((reference) => reference.test_id && testQuestionRows.some((row) => (
  row.test_id === reference.test_id && row.question_id === replacements.get(reference.question_id)
)));
if (collisions.length) throw new Error(`Refusing remap: ${collisions.length} tests already contain a replacement question`);
if (process.argv.includes("--inspect")) {
  console.log(JSON.stringify({
    superseded: superseded.map((row) => ({ ...row, references: references.filter((item) => item.question_id === row.id).length })),
    distribution,
    referenceCount: references.length,
    replacementCount: replacements.size,
    collisions: collisions.length,
  }, null, 2));
  process.exit(0);
}
for (const [oldQuestionId, newQuestionId] of replacements) {
  const { error: remapError } = await supabase.from("test_questions")
    .update({ question_id: newQuestionId })
    .eq("question_id", oldQuestionId);
  if (remapError) throw remapError;
}

const { data: deleted, error: deleteError } = await supabase.from("questions")
  .delete()
  .in("id", superseded.map((row) => row.id))
  .select("id");
if (deleteError) throw deleteError;
if (deleted.length !== superseded.length) throw new Error(`Expected ${superseded.length} deletions, got ${deleted.length}`);
console.log(JSON.stringify({ deleted: deleted.length, distribution }));
