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
    old: [
      "Physical World & Units of Measurement", "Kinematics (Motion in a Straight Line & Plane)", "Kinematics (Motion in a Straight Line & Plane)",
      "Laws of Motion & Friction", "Work, Energy & Power", "System of Particles & Rotational Motion", "Gravitation",
      "Mechanical Properties of Solids & Fluids", "Mechanical Properties of Solids & Fluids",
      "Thermal Properties of Matter & Thermodynamics", "Thermal Properties of Matter & Thermodynamics",
      "Kinetic Theory of Gases & Oscillations (SHM)", "Kinetic Theory of Gases & Oscillations (SHM)", "Waves & Sound",
      "Electrostatics & Capacitance", "Electrostatics & Capacitance", "Current Electricity",
      "Magnetic Effects of Current & Magnetism", "Magnetic Effects of Current & Magnetism",
      "Electromagnetic Induction & Alternating Current", "Electromagnetic Induction & Alternating Current",
      "Electromagnetic Waves", "Ray Optics & Optical Instruments", "Wave Optics", "Dual Nature of Radiation & Matter",
      "Atoms & Nuclei", "Atoms & Nuclei", "Semiconductor Electronics & Devices", "Communication Systems",
    ],
    exact: [
      "Physical World, Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion",
      "Work, Energy and Power", "System of Particles and Rotational Motion", "Gravitation", "Mechanical Properties of Solids",
      "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics", "Kinetic Theory", "Oscillations",
      "Waves", "Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity",
      "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current",
      "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Dual Nature of Radiation and Matter",
      "Atoms", "Nuclei", "Semiconductor Electronics: Materials, Devices and Simple Circuits", "Communication Systems",
    ],
  },
  {
    subject: "Chemistry",
    directory: "tmp/wiley-jee-main-chemistry",
    old: [
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
    exact: [
      "Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions",
      "Hydrogen", "The s-Block Elements", "The p-Block Elements (Group 13 and 14)",
      "Organic Chemistry - Some Basic Principles and Techniques", "Hydrocarbons", "Environmental Chemistry",
      "The Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
      "General Principles and Processes of Isolation of Elements", "The p-Block Elements (Group 15 to 18)",
      "The d- and f-Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines", "Biomolecules", "Polymers",
      "Chemistry in Everyday Life",
    ],
  },
];

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const summary = {};

for (const source of sources) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("questions")
      .select("id,chapter,question_text,question_order")
      .in("exam", ["JEE Main", "JEE"])
      .eq("subject", source.subject)
      .in("chapter", [...new Set([...source.old, ...source.exact])])
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) break;
  }

  const claimed = new Set();
  const updates = new Map();
  let expected = 0;
  for (let index = 0; index < source.exact.length; index += 1) {
    const filename = `${source.directory}/offline-chapter-${String(index + 1).padStart(2, "0")}.json`;
    const questions = JSON.parse(await fs.readFile(filename, "utf8"));
    questions.sort((a, b) => a.number - b.number);
    for (const [questionIndex, question] of questions.entries()) {
      expected += 1;
      let candidates = rows.filter((row) => !claimed.has(row.id)
        && [source.old[index], source.exact[index]].includes(row.chapter)
        && String(row.question_text || "").trim() === question.question_text.trim());
      if (candidates.length > 1) {
        const ordered = candidates.filter((row) => row.question_order === questionIndex + 1);
        if (ordered.length) candidates = ordered;
      }
      if (candidates.length !== 1) {
        throw new Error(`${source.subject} chapter ${index + 1} Q${question.number}: expected one row, found ${candidates.length}`);
      }
      const row = candidates[0];
      claimed.add(row.id);
      if (row.chapter !== source.exact[index]) {
        const key = `${row.chapter}\0${source.exact[index]}`;
        if (!updates.has(key)) updates.set(key, []);
        updates.get(key).push(row.id);
      }
    }
  }
  if (claimed.size !== expected) throw new Error(`${source.subject}: matched ${claimed.size}/${expected}`);
  const unexpected = rows.filter((row) => !claimed.has(row.id));
  if (unexpected.length) {
    throw new Error(`${source.subject}: found ${unexpected.length} unclaimed rows in old/exact Wiley chapters`);
  }

  let changed = 0;
  for (const [key, ids] of updates) {
    const [, newChapter] = key.split("\0");
    for (let offset = 0; offset < ids.length; offset += 100) {
      const batch = ids.slice(offset, offset + 100);
      const { data, error } = await supabase.from("questions")
        .update({ chapter: newChapter }).in("id", batch).select("id");
      if (error) throw error;
      if (data.length !== batch.length) throw new Error(`${source.subject}: updated ${data.length}/${batch.length}`);
      changed += data.length;
    }
  }
  summary[source.subject] = { expected, matched: claimed.size, changed, chapters: source.exact.length };
}

console.log(JSON.stringify(summary, null, 2));
