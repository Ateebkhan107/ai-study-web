import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { GoogleGenerativeAI } from "@google/generative-ai";

process.loadEnvFile(".env.local");
if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required in .env.local");

const ROOT = process.cwd();
const WORK = path.join(ROOT, "scratch", "jee2021");
const manifest = JSON.parse(await fs.readFile(path.join(WORK, "source", "manifest.json"), "utf8"));
const requestedPaper = process.argv.find((arg) => arg.startsWith("--paper="))?.slice(8);
const requestedSubject = process.argv.find((arg) => arg.startsWith("--subject="))?.slice(10)?.toLowerCase();
const overwrite = process.argv.includes("--overwrite");
const subjects = ["physics", "chemistry", "mathematics"];
const offsets = { physics: 0, chemistry: 30, mathematics: 60 };
const displaySubjects = { physics: "Physics", chemistry: "Chemistry", mathematics: "Mathematics" };

const chapters = {
  physics: ["Physical World & Units of Measurement", "Kinematics (Motion in a Straight Line & Plane)", "Laws of Motion & Friction", "Work, Energy & Power", "System of Particles & Rotational Motion", "Gravitation", "Mechanical Properties of Solids & Fluids", "Thermal Properties of Matter & Thermodynamics", "Kinetic Theory of Gases & Oscillations (SHM)", "Waves & Sound", "Electrostatics & Capacitance", "Current Electricity", "Magnetic Effects of Current & Magnetism", "Electromagnetic Induction & Alternating Current", "Electromagnetic Waves", "Ray Optics & Optical Instruments", "Wave Optics", "Dual Nature of Radiation & Matter", "Atoms & Nuclei", "Semiconductor Electronics & Devices", "Communication Systems"],
  chemistry: ["Some Basic Concepts of Chemistry (Mole Concept)", "Structure of Atom", "Classification of Elements & Periodicity", "Chemical Bonding & Molecular Structure", "States of Matter: Gases & Liquids", "Chemical Thermodynamics & Energetics", "Chemical & Ionic Equilibrium", "Redox Reactions & Electrochemistry", "Hydrogen", "s-Block Elements", "Chemical Kinetics", "Solutions & Colligative Properties", "Surface Chemistry", "Environmental Chemistry", "Solid State", "p-Block Elements (Groups 13 to 18)", "d and f-Block Elements", "Coordination Compounds", "General Principles of Extraction (Metallurgy)", "General Organic Chemistry (GOC) & Nomenclature", "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)", "Haloalkanes & Haloarenes", "Alcohols, Phenols & Ethers", "Aldehydes, Ketones & Carboxylic Acids", "Amines & Organic Nitrogen Compounds", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
  mathematics: ["Sets", "Relations and Functions – I", "Trigonometric Functions", "Principle of Mathematical Induction", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry", "Limits and Derivatives", "Mathematical Reasoning", "Statistics", "Probability – I", "Relations and Functions – II", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability", "Application of Derivatives", "Integrals", "Application of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming", "Probability – II"],
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelNames = [
  "gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-flash-lite-latest",
  "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3-flash-preview",
  "gemini-flash-latest", "gemini-3.8-flash",
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanJson(text) {
  const value = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : parsed.questions;
}

function dollarsBalanced(value) {
  return (String(value ?? "").match(/(?<!\\)\$/g) || []).length % 2 === 0;
}

function validate(rows, subject, paperCode) {
  const errors = [];
  if (!Array.isArray(rows) || rows.length !== 30) errors.push(`expected 30 questions, found ${rows?.length ?? "non-array"}`);
  for (let local = 1; local <= 30; local += 1) {
    const row = rows?.find((item) => Number(item.local_number) === local);
    if (!row) { errors.push(`missing local question ${local}`); continue; }
    const expectedType = local <= 20 ? "MCQ" : "NUMERICAL";
    if (row.question_type !== expectedType) errors.push(`Q${local}: expected ${expectedType}`);
    if (!chapters[subject].includes(row.chapter)) errors.push(`Q${local}: non-canonical chapter ${JSON.stringify(row.chapter)}`);
    for (const field of ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"]) {
      if (!dollarsBalanced(row[field])) errors.push(`Q${local}: unbalanced dollars in ${field}`);
    }
    if (!String(row.question || "").trim()) errors.push(`Q${local}: blank question`);
    if (expectedType === "NUMERICAL") {
      for (const letter of ["a", "b", "c", "d"]) if (row[`option_${letter}`] !== "") errors.push(`Q${local}: numerical option ${letter} is not empty`);
      if (!String(row.correct_option ?? "").trim()) errors.push(`Q${local}: missing numerical answer`);
    } else {
      if (!["a", "b", "c", "d"].includes(String(row.correct_option).toLowerCase())) errors.push(`Q${local}: invalid MCQ answer`);
      for (const letter of ["a", "b", "c", "d"]) {
        const value = String(row[`option_${letter}`] ?? "");
        if (!value.trim() && !row[`option_${letter}_needs_image`]) errors.push(`Q${local}: empty option ${letter}`);
        if (/^(option\s*[a-d]|\(?[1-4a-d]\)?)$/i.test(value.trim())) errors.push(`Q${local}: placeholder option ${letter}`);
      }
    }
  }
  if (errors.length) throw new Error(`${paperCode} ${subject} validation failed:\n${errors.slice(0, 80).join("\n")}`);
}

async function transcribe(pdfPath, paper, subject) {
  const pdf = { inlineData: { data: (await fs.readFile(pdfPath)).toString("base64"), mimeType: "application/pdf" } };
  const prompt = `Transcribe the 30 ORIGINAL JEE Main 2021 ${displaySubjects[subject]} questions from this official-answer solution booklet for ${paper.attempt}. Ignore all worked solutions, coaching branding, headers, footers, page numbers, URLs, app banners, and watermarks. SECTION-A contains MCQs numbered 1-20. SECTION-B restarts its printed numbering at 1-10; map those ten numerical questions to local_number 21-30 (printed Section-B 1 becomes 21, 2 becomes 22, ..., 10 becomes 30). The returned local_number values must therefore be the unique integers 1 through 30.

Return exactly one JSON array of 30 objects with these keys:
local_number, question_type, chapter, question, option_a, option_b, option_c, option_d, correct_option, needs_question_image, option_a_needs_image, option_b_needs_image, option_c_needs_image, option_d_needs_image.

Accuracy rules:
- Copy every word, value, sign, exponent, matrix entry, chemical formula, list and assertion exactly from the original question, using the worked solution only to disambiguate typesetting.
- Convert mathematical and chemical notation to valid KaTeX. Every formula, variable, number with a unit, chemical species, relation, matrix, and symbolic option must be inside balanced $...$ delimiters. Use $$...$$ only for genuinely standalone multi-line equations.
- Use plain prose outside math. Escape backslashes correctly for JSON.
- SECTION-A MCQ option labels (1)-(4) map to option_a through option_d. correct_option must be a/b/c/d based on the printed "Official Ans. by NTA".
- Every SECTION-B item is NUMERICAL even though its printed number is 1-10. Map it to local_number 21-30, set all four option strings to exactly "", and put the exact printed numerical answer in correct_option as a string.
- Do not emit placeholder text, solution steps, answer labels, or an explanation.
- Set an image flag true only if the original meaning cannot be represented accurately as text/KaTeX (circuit, graph, ray diagram, apparatus, organic structure/reaction drawing, molecular geometry, or graphic option). Tables and lists should be transcribed as Markdown/KaTeX, not images.
- For graphic options, the corresponding option string must be "" and its option image flag true. Otherwise all option image flags are false.
- chapter must be exactly one of this canonical list: ${chapters[subject].map((item) => JSON.stringify(item)).join(", ")}.
- Return JSON only.`;
  let lastError;
  for (let attempt = 0; attempt < modelNames.length; attempt += 1) {
    try {
      const model = genAI.getGenerativeModel({ model: modelNames[attempt % modelNames.length], generationConfig: { responseMimeType: "application/json", temperature: 0, maxOutputTokens: 65536 } });
      const response = await model.generateContent([prompt, pdf]);
      const rows = cleanJson(response.response.text());
      validate(rows, subject, paper.paper_code);
      return rows.map((row) => ({
        ...row,
        local_number: Number(row.local_number),
        question_number: offsets[subject] + Number(row.local_number),
        display_order: offsets[subject] + Number(row.local_number),
        subject: displaySubjects[subject],
        correct_option: String(row.correct_option).toLowerCase(),
      })).sort((a, b) => a.local_number - b.local_number);
    } catch (error) {
      lastError = error;
      console.error(`${paper.paper_code} ${subject} attempt ${attempt + 1}: ${error.message}`);
      await sleep(Math.min(30000, 2500 * (attempt + 1)));
    }
  }
  throw lastError;
}

const selectedPapers = requestedPaper ? manifest.filter((paper) => paper.paper_code === requestedPaper) : manifest;
if (!selectedPapers.length) throw new Error(`Unknown paper: ${requestedPaper}`);
const selectedSubjects = requestedSubject ? subjects.filter((subject) => subject === requestedSubject) : subjects;
if (!selectedSubjects.length) throw new Error(`Unknown subject: ${requestedSubject}`);
await fs.mkdir(path.join(WORK, "transcribed"), { recursive: true });

for (const paper of selectedPapers) {
  for (const subject of selectedSubjects) {
    const outPath = path.join(WORK, "transcribed", `${paper.paper_code}_${displaySubjects[subject]}.json`);
    if (!overwrite) {
      try { const cached = JSON.parse(await fs.readFile(outPath, "utf8")); validate(cached, subject, paper.paper_code); console.log(`${paper.paper_code} ${subject}: cached`); continue; } catch {}
    }
    const pdfPath = path.join(WORK, "source", "pdfs", paper.paper_code, `${subject}.pdf`);
    const rows = await transcribe(pdfPath, paper, subject);
    await fs.writeFile(outPath, `${JSON.stringify(rows, null, 2)}\n`);
    console.log(`${paper.paper_code} ${subject}: transcribed ${rows.length}/30`);
  }
}
