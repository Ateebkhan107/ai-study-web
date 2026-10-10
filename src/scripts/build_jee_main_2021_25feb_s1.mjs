import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PAPER = "JEE-MAIN-21-25FEB-S1";
const source = JSON.parse(await fs.readFile(path.join(ROOT, "scratch/jee2021/local", PAPER, "jarvis-source.json"), "utf8"));
const byNumber = new Map(source.map((row) => [row.source_number, row]));

// Jarvis groups the right questions by subject, but does not retain the NTA PDF
// order.  This permutation was reconciled against every numbered question in
// the eSaral source PDFs (morning shift).
const mappings = {
  Physics: [10, 3, 7, 18, 9, 5, 15, 14, 1, 16, 4, 8, 13, 20, 2, 12, 11, 17, 6, 19, 30, 22, 26, 25, 27, 21, 23, 29, 28, 24],
  Chemistry: [36, 34, 46, 32, 35, 38, 45, 39, 43, 42, 40, 44, 49, 47, 31, 50, 33, 48, 41, 37, 58, 59, 52, 57, 51, 60, 53, 54, 56, 55],
  Mathematics: [80, 65, 70, 66, 62, 63, 79, 64, 69, 76, 71, 73, 72, 75, 61, 77, 68, 67, 78, 74, 85, 84, 82, 81, 89, 88, 86, 90, 87, 83],
};

const chapters = {
  Physics: [
    "Thermal Properties of Matter & Thermodynamics", "Waves & Sound", "Gravitation",
    "Electromagnetic Induction & Alternating Current", "Magnetic Effects of Current & Magnetism",
    "Communication Systems", "Kinetic Theory of Gases & Oscillations (SHM)",
    "Physical World & Units of Measurement", "Semiconductor Electronics & Devices",
    "Dual Nature of Radiation & Matter", "Thermal Properties of Matter & Thermodynamics",
    "Kinematics (Motion in a Straight Line & Plane)", "Physical World & Units of Measurement",
    "Magnetic Effects of Current & Magnetism", "Gravitation", "Atoms & Nuclei", "Vector Algebra",
    "Gravitation", "Current Electricity", "Wave Optics", "Electromagnetic Induction & Alternating Current",
    "Electrostatics & Capacitance", "Thermal Properties of Matter & Thermodynamics", "Work, Energy & Power",
    "Current Electricity", "Ray Optics & Optical Instruments", "Current Electricity",
    "Electromagnetic Induction & Alternating Current", "Thermal Properties of Matter & Thermodynamics",
    "Work, Energy & Power",
  ],
  Chemistry: [
    "d and f-Block Elements", "Chemical Bonding & Molecular Structure", "Amines & Organic Nitrogen Compounds",
    "Hydrogen", "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
    "Some Basic Concepts of Chemistry (Mole Concept)", "Aldehydes, Ketones & Carboxylic Acids",
    "p-Block Elements (Groups 13 to 18)", "Structure of Atom", "p-Block Elements (Groups 13 to 18)",
    "Classification of Elements & Periodicity", "Biomolecules", "Aldehydes, Ketones & Carboxylic Acids",
    "Coordination Compounds", "General Principles of Extraction (Metallurgy)", "Chemical & Ionic Equilibrium",
    "Surface Chemistry", "General Organic Chemistry (GOC) & Nomenclature", "Chemistry in Everyday Life",
    "Aldehydes, Ketones & Carboxylic Acids", "p-Block Elements (Groups 13 to 18)",
    "Solutions & Colligative Properties", "Redox Reactions & Electrochemistry", "States of Matter: Gases & Liquids",
    "Chemical Thermodynamics & Energetics", "Surface Chemistry", "Chemical Kinetics",
    "Some Basic Concepts of Chemistry (Mole Concept)", "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
    "Classification of Elements & Periodicity",
  ],
  Mathematics: [
    "Probability – I", "Sequences and Series", "Relations and Functions – I", "Three Dimensional Geometry",
    "Three Dimensional Geometry", "Integrals", "Integrals", "Trigonometric Functions", "Conic Sections",
    "Limits and Derivatives", "Complex Numbers and Quadratic Equations", "Straight Lines", "Trigonometric Functions",
    "Conic Sections", "Probability – I", "Permutations and Combinations", "Complex Numbers and Quadratic Equations",
    "Mathematical Reasoning", "Differential Equations", "Continuity and Differentiability",
    "Application of Derivatives", "Matrices", "Trigonometric Functions", "Sequences and Series", "Determinants",
    "Vector Algebra", "Continuity and Differentiability", "Permutations and Combinations", "Matrices", "Straight Lines",
  ],
};

const offsets = { Physics: 0, Chemistry: 30, Mathematics: 60 };
const imageDir = path.join(ROOT, "scratch/jee2021/images", PAPER);
await fs.mkdir(imageDir, { recursive: true });
await fs.mkdir(path.join(ROOT, "scratch/jee2021/transcribed"), { recursive: true });

for (const subject of Object.keys(mappings)) {
  const rows = mappings[subject].map((sourceNumber, index) => {
    const raw = byNumber.get(sourceNumber);
    if (!raw || raw.subject !== subject) throw new Error(`Bad mapping ${subject} local Q${index + 1} -> ${sourceNumber}`);
    const localNumber = index + 1;
    const questionNumber = offsets[subject] + localNumber;
    const numerical = localNumber > 20;
    const imagePath = raw.source_image ? path.join(imageDir, `q${questionNumber}.png`) : null;
    const options = numerical ? ["", "", "", ""] : [...raw.options];
    // These are genuine mathematical/figure labels, not placeholder choices.
    if (questionNumber === 39) options.splice(0, 4, ...options.map((value) => `$${value}$`));
    if (questionNumber === 47) options[1] = "$1$";
    if (!numerical && options.length !== 4) throw new Error(`${subject} Q${localNumber}: expected four options`);
    return {
      local_number: localNumber,
      question_type: numerical ? "NUMERICAL" : "MCQ",
      chapter: chapters[subject][index],
      question: questionNumber === 47
        ? raw.question.replace("proportional to P$^{x}$", "proportional to $P^{x}$")
        : raw.question,
      option_a: options[0] ?? "",
      option_b: options[1] ?? "",
      option_c: options[2] ?? "",
      option_d: options[3] ?? "",
      correct_option: numerical ? String(raw.correct) : String(raw.correct).toLowerCase(),
      needs_question_image: Boolean(raw.source_image),
      option_a_needs_image: false,
      option_b_needs_image: false,
      option_c_needs_image: false,
      option_d_needs_image: false,
      question_number: questionNumber,
      display_order: questionNumber,
      subject,
      question_image: imagePath,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null,
      source_image: raw.source_image,
      source_number: sourceNumber,
    };
  });
  const output = path.join(ROOT, "scratch/jee2021/transcribed", `${PAPER}_${subject}.json`);
  await fs.writeFile(output, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`${subject}: ${rows.length} -> ${output}`);
}
