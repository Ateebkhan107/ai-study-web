import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");

const requestedSubject = String(process.argv[2] || "").toLowerCase();
const requestedChapter = Number(process.argv[3] || 0);
const requestedExam = process.argv.includes("--neet") ? "NEET" : null;

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
      "Physical World, Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion",
      "Work, Energy and Power", "System of Particles and Rotational Motion", "Gravitation",
      "Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics",
      "Kinetic Theory", "Oscillations", "Waves", "Electric Charges and Fields", "Electrostatic Potential and Capacitance",
      "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction",
      "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics",
      "Dual Nature of Radiation and Matter", "Atoms", "Nuclei",
      "Semiconductor Electronics: Materials, Devices and Simple Circuits", "Communication Systems",
    ],
  },
  {
    subject: "Chemistry",
    directory: "tmp/wiley-jee-main-chemistry",
    chapters: [
      "Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions",
      "Hydrogen", "The s-Block Elements", "The p-Block Elements (Group 13 and 14)",
      "Organic Chemistry - Some Basic Principles and Techniques", "Hydrocarbons", "Environmental Chemistry",
      "The Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
      "General Principles and Processes of Isolation of Elements", "The p-Block Elements (Group 15 to 18)",
      "The d- and f-Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines",
      "Biomolecules", "Polymers", "Chemistry in Everyday Life",
    ],
  },
];

const expected = [];
for (const source of sources) {
  if (requestedSubject && source.subject.toLowerCase() !== requestedSubject) continue;
  const names = await fs.readdir(source.directory).catch(() => []);
  const manifestNames = names.filter((name) => /^offline-chapter-\d{2}\.json$/.test(name)).sort();
  for (const name of manifestNames) {
    const sourceChapter = Number(name.match(/\d{2}/)[0]);
    if (requestedChapter && sourceChapter !== requestedChapter) continue;
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
    let query = supabase.from("questions")
      .select("id,exam,subject,chapter,topic,question_type,question_text,question_image,option_a,option_b,option_c,option_d,option_a_image,option_b_image,option_c_image,option_d_image,correct_option,explanation,explanation_image,is_active,question_order")
      .eq("subject", subject)
      .in("chapter", chapters)
      .range(from, from + 999);
    query = requestedExam ? query.eq("exam", requestedExam) : query.in("exam", ["JEE Main", "JEE"]);
    const { data, error } = await query;
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
for (const matches of byIdentity.values()) {
  matches.sort((a, b) => (a.question_order ?? Number.MAX_SAFE_INTEGER) - (b.question_order ?? Number.MAX_SAFE_INTEGER));
}

const problems = [];
const chapterCounts = {};
const identityOccurrences = new Map();
const expectedIdentityCounts = new Map();
for (const item of expected) {
  const identity = `${item.subject}\u0000${item.chapter}\u0000${item.question_text.trim()}`;
  expectedIdentityCounts.set(identity, (expectedIdentityCounts.get(identity) || 0) + 1);
}
const hasUnbalancedDollar = (value) => ((String(value || "").match(/\$/g) || []).length % 2) !== 0;
for (const item of expected) {
  const countKey = `${item.subject} · ${item.chapter}`;
  chapterCounts[countKey] ||= { expected: 0, matched: 0 };
  chapterCounts[countKey].expected += 1;
  const identity = `${item.subject}\u0000${item.chapter}\u0000${item.question_text.trim()}`;
  const matches = byIdentity.get(identity) || [];
  const occurrence = identityOccurrences.get(identity) || 0;
  identityOccurrences.set(identity, occurrence + 1);
  const expectedIdentityCount = expectedIdentityCounts.get(identity) || 1;
  const reference = { subject: item.subject, sourceChapter: item.sourceChapter, chapter: item.chapter, number: item.number };
  if (matches.length !== expectedIdentityCount) {
    if (occurrence === 0) problems.push({ type: matches.length ? "duplicate" : "missing", ...reference, matches: matches.length, expectedMatches: expectedIdentityCount });
    continue;
  }
  chapterCounts[countKey].matched += 1;
  const row = matches[occurrence];
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

// A manifest-to-database comparison must also reject rows that have no
// manifest counterpart. Without this reverse check, old imports can coexist
// with the verified rows while the audit still reports every expected item as
// matched.
for (const [identity, matches] of byIdentity) {
  const expectedCount = expectedIdentityCounts.get(identity) || 0;
  if (matches.length <= expectedCount) continue;
  const [subject, chapter, questionText] = identity.split("\0");
  for (const row of matches.slice(expectedCount)) {
    problems.push({
      type: "unexpected_database_row",
      subject,
      chapter,
      id: row.id,
      questionText: questionText.slice(0, 160),
    });
  }
}

console.log(JSON.stringify({ expected: expected.length, matched: expected.length - problems.filter((problem) => problem.type === "missing").length, chapterCounts, problems }, null, 2));
if (problems.length) process.exitCode = 1;
