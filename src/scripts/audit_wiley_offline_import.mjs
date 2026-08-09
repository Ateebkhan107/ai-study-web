import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");

const sources = [
  {
    subject: "Mathematics",
    directory: "tmp/wiley-jee-main-mathematics",
    chapters: [
      "Sets", "Relations and Functions – I", "Trigonometric Functions", "Principle of Mathematical Induction",
      "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem",
      "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry",
      "Limits and Derivatives", "Mathematical Reasoning", "Statistics", "Probability – I", "Relations and Functions – II",
      "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability",
      "Application of Derivatives", "Integrals", "Application of Integrals", "Differential Equations", "Vector Algebra",
      "Three Dimensional Geometry", "Linear Programming", "Probability – II",
    ],
  },
  {
    subject: "Physics",
    directory: "tmp/wiley-jee-main-physics",
    chapters: [
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
    ],
  },
  {
    subject: "Chemistry",
    directory: "tmp/wiley-jee-main-chemistry",
    chapters: [
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
    ],
  },
];

const expected = [];
for (const source of sources) {
  const names = await fs.readdir(source.directory).catch(() => []);
  const manifestNames = names.filter((name) => /^offline-chapter-\d{2}\.json$/.test(name)).sort();
  for (const name of manifestNames) {
    const sourceChapter = Number(name.match(/\d{2}/)[0]);
    const chapter = source.chapters[sourceChapter - 1];
    if (!chapter) throw new Error(`No chapter mapping for ${source.subject} source chapter ${sourceChapter}`);
    const questions = JSON.parse(await fs.readFile(`${source.directory}/${name}`, "utf8"));
    for (const question of questions) expected.push({ subject: source.subject, sourceChapter, chapter, ...question });
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const rows = [];
for (const subject of [...new Set(expected.map((item) => item.subject))]) {
  const chapters = [...new Set(expected.filter((item) => item.subject === subject).map((item) => item.chapter))];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("questions")
      .select("id,exam,subject,chapter,topic,question_type,question_text,question_image,option_a,option_b,option_c,option_d,option_a_image,option_b_image,option_c_image,option_d_image,correct_option,explanation,explanation_image,is_active")
      .in("exam", ["JEE Main", "JEE"])
      .eq("subject", subject)
      .in("chapter", chapters)
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) break;
  }
}

const byIdentity = new Map();
for (const row of rows) {
  const key = `${row.subject}\u0000${row.chapter}\u0000${String(row.question_text || "").trim()}`;
  if (!byIdentity.has(key)) byIdentity.set(key, []);
  byIdentity.get(key).push(row);
}

const problems = [];
const chapterCounts = {};
const hasUnbalancedDollar = (value) => ((String(value || "").match(/\$/g) || []).length % 2) !== 0;
for (const item of expected) {
  const countKey = `${item.subject} · ${item.chapter}`;
  chapterCounts[countKey] ||= { expected: 0, matched: 0 };
  chapterCounts[countKey].expected += 1;
  const identity = `${item.subject}\u0000${item.chapter}\u0000${item.question_text.trim()}`;
  const matches = byIdentity.get(identity) || [];
  const reference = { subject: item.subject, sourceChapter: item.sourceChapter, chapter: item.chapter, number: item.number };
  if (matches.length !== 1) {
    problems.push({ type: matches.length ? "duplicate" : "missing", ...reference, matches: matches.length });
    continue;
  }
  chapterCounts[countKey].matched += 1;
  const row = matches[0];
  const expectedOptions = item.options || [];
  const actualOptions = [row.option_a, row.option_b, row.option_c, row.option_d];
  if (row.correct_option !== item.correct_option) problems.push({ type: "answer_mismatch", ...reference });
  if (row.explanation !== item.explanation || !row.explanation?.trim()) problems.push({ type: "explanation_mismatch", ...reference });
  if (row.question_type !== item.question_type) problems.push({ type: "type_mismatch", ...reference });
  if (item.question_type === "MCQ" && expectedOptions.some((option, index) => actualOptions[index] !== option)) problems.push({ type: "option_mismatch", ...reference });
  if (item.question_type === "Numerical" && actualOptions.some(Boolean)) problems.push({ type: "numerical_has_options", ...reference });
  if (item.question_image_path && !row.question_image) problems.push({ type: "missing_question_image", ...reference });
  if (!item.question_image_path && row.question_image) problems.push({ type: "unexpected_question_image", ...reference });
  if ([row.option_a_image, row.option_b_image, row.option_c_image, row.option_d_image, row.explanation_image].some(Boolean)) problems.push({ type: "unexpected_auxiliary_image", ...reference });
  if (/Wiley|answer checked|printed answer|source image|refer to the source/i.test(row.explanation || "")) problems.push({ type: "placeholder_explanation", ...reference });
  if ([row.question_text, ...actualOptions, row.explanation].some(hasUnbalancedDollar)) problems.push({ type: "unbalanced_dollar_math", ...reference });
  if (!row.topic?.trim() || !row.is_active) problems.push({ type: "metadata", ...reference });
}

console.log(JSON.stringify({ expected: expected.length, matched: expected.length - problems.filter((problem) => problem.type === "missing").length, chapterCounts, problems }, null, 2));
if (problems.length) process.exitCode = 1;
