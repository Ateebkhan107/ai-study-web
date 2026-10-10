import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PAPER = "JEE-MAIN-21-25FEB-S2";
const localDir = path.join(ROOT, "scratch/jee2021/local", PAPER);
const source = JSON.parse(await fs.readFile(path.join(localDir, "jarvis-source.json"), "utf8"));
const byNumber = new Map(source.map((row) => [row.source_number, row]));
const indexHtml = await fs.readFile(path.join(localDir, "mastiva-pages/index.html"), "utf8");
const metadata = [...indexHtml.matchAll(/public-index-row__meta">(.*?)<\/span>/g)].map((match) => match[1].replaceAll("&amp;", "&").split(" · ")[0]);
if (metadata.length !== 90) throw new Error(`Expected 90 chapter labels, found ${metadata.length}`);

const mappings = {
  Physics: [18, 5, 12, 13, 15, 3, 6, 8, 4, 17, 9, 1, 2, 19, 16, 11, null, 14, 7, 10, 22, 21, 24, 26, 27, 20, 29, 23, 25, 28],
  Chemistry: [44, 31, 41, 34, 38, 43, 46, 37, 32, 48, 39, 47, 36, 33, 49, 30, 42, 40, 35, 45, 50, 52, 56, 59, 51, 55, 54, 58, 57, 53],
  Mathematics: [74, 67, 75, 62, 68, 78, 60, 69, 77, 66, 61, 72, 64, 71, 63, null, 76, 73, 70, 65, 86, 84, 87, 82, 85, 80, 79, null, 81, 83],
};

const chapterAliases = {
  "Semiconductor Electronics: Materials, Devices and Simple Circuits": "Semiconductor Electronics & Devices",
  "Magnetism and Matter": "Magnetic Effects of Current & Magnetism",
  Thermodynamics: "Thermal Properties of Matter & Thermodynamics",
  "Motion in a Straight Line": "Kinematics (Motion in a Straight Line & Plane)",
  "Kinetic Theory": "Kinetic Theory of Gases & Oscillations (SHM)",
  Oscillations: "Kinetic Theory of Gases & Oscillations (SHM)",
  Electrostatics: "Electrostatics & Capacitance",
  "Electromagnetic Induction": "Electromagnetic Induction & Alternating Current",
  "Alternating Current": "Electromagnetic Induction & Alternating Current",
  "Dual Nature of Matter and Radiation": "Dual Nature of Radiation & Matter",
  "Atoms and Nuclei": "Atoms & Nuclei",
  "Ray Optics": "Ray Optics & Optical Instruments",
  "Wave Optics": "Wave Optics",
  "Units and Measurements": "Physical World & Units of Measurement",
  "Communication Systems": "Communication Systems",
  "Current Electricity": "Current Electricity",
  "Mechanical Properties of Solids": "Mechanical Properties of Solids & Fluids",
  "Electromagnetic Waves": "Electromagnetic Waves",
  "Motion in a Plane": "Kinematics (Motion in a Straight Line & Plane)",
  "Electric Charges and Fields": "Electrostatics & Capacitance",
  "Electrostatic Potential and Capacitance": "Electrostatics & Capacitance",
  "Physical World, Units and Measurements": "Physical World & Units of Measurement",
  "Mathematics in Physics": "Physical World & Units of Measurement",
  Atoms: "Atoms & Nuclei", Nuclei: "Atoms & Nuclei",
  Gravitation: "Gravitation",
  "Laws of Motion": "Laws of Motion & Friction",
  "Work, Energy and Power": "Work, Energy & Power",
  "System of Particles and Rotational Motion": "System of Particles & Rotational Motion",
  "Chemical Bonding and Molecular Structure": "Chemical Bonding & Molecular Structure",
  Amines: "Amines & Organic Nitrogen Compounds",
  Biomolecules: "Biomolecules",
  Hydrocarbons: "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
  "Coordination Compounds": "Coordination Compounds",
  "Environmental Chemistry": "Environmental Chemistry",
  "The p-Block Elements": "p-Block Elements (Groups 13 to 18)",
  "The p-Block Elements (Group 15, 16, 17 & 18)": "p-Block Elements (Groups 13 to 18)",
  "The s-Block Elements": "s-Block Elements",
  "Co-ordination Compounds": "Coordination Compounds",
  "Classification of Elements and Periodicity in Properties": "Classification of Elements & Periodicity",
  "Organic Chemistry — Some Basic Principles & Techniques": "General Organic Chemistry (GOC) & Nomenclature",
  "Alcohols, Phenols and Ethers": "Alcohols, Phenols & Ethers",
  "Aldehydes, Ketones and Carboxylic Acids": "Aldehydes, Ketones & Carboxylic Acids",
  "Analytical Chemistry": "Some Basic Concepts of Chemistry (Mole Concept)",
  Equilibrium: "Chemical & Ionic Equilibrium", "The Solid State": "Solid State",
  "Chemical Kinetics and Nuclear Chemistry": "Chemical Kinetics", "Redox Reactions": "Redox Reactions & Electrochemistry",
  "The d- and f-Block Elements": "d and f-Block Elements",
  "General Principles and Processes of Isolation of Elements": "General Principles of Extraction (Metallurgy)",
  "Surface Chemistry": "Surface Chemistry",
  "Solutions": "Solutions & Colligative Properties",
  "Chemical Kinetics": "Chemical Kinetics",
  "Electrochemistry": "Redox Reactions & Electrochemistry",
  "Some Basic Concepts of Chemistry": "Some Basic Concepts of Chemistry (Mole Concept)",
  "Structure of Atom": "Structure of Atom",
  "States of Matter": "States of Matter: Gases & Liquids",
  "Thermodynamics (Chemistry)": "Chemical Thermodynamics & Energetics",
  Determinants: "Determinants", Integrals: "Integrals",
  "Applications of Derivatives": "Application of Derivatives",
  "Complex Numbers and Quadratic Equations": "Complex Numbers and Quadratic Equations",
  "Conic Sections": "Conic Sections", "Trigonometric Functions": "Trigonometric Functions",
  "Three Dimensional Geometry": "Three Dimensional Geometry", Probability: "Probability – I",
  "Inverse Trigonometric Functions": "Inverse Trigonometric Functions", "Mathematical Reasoning": "Mathematical Reasoning",
  "Relations and Functions": "Relations and Functions – I", Matrices: "Matrices",
  "Permutations and Combinations": "Permutations and Combinations",
  "Continuity and Differentiability": "Continuity and Differentiability", "Vector Algebra": "Vector Algebra",
  "Basics Of Mathematics": "Sets", "Limits and Derivatives": "Limits and Derivatives",
  "Differential Equations": "Differential Equations",
};

const subjectChapterStart = { Mathematics: 0, Physics: 30, Chemistry: 60 };
const globalOffset = { Physics: 0, Chemistry: 30, Mathematics: 60 };
const imageDir = path.join(ROOT, "scratch/jee2021/images", PAPER);
await fs.mkdir(imageDir, { recursive: true });
await fs.mkdir(path.join(ROOT, "scratch/jee2021/transcribed"), { recursive: true });

function missingRow(subject, localNumber) {
  if (subject === "Physics" && localNumber === 17) return {
    question: "The truth table for the following logic circuit is:", options: ["", "", "", ""], correct: "b", graphicalOptions: true,
  };
  if (subject === "Mathematics" && localNumber === 16) return {
    question: "$\\displaystyle \\lim_{n\\to\\infty}\\left[\\frac{1}{n}+\\frac{n}{(n+1)^2}+\\frac{n}{(n+2)^2}+\\cdots+\\frac{n}{(2n-1)^2}\\right]$ is equal to:",
    options: ["$\\frac{1}{2}$", "$1$", "$\\frac{1}{3}$", "$\\frac{1}{4}$"], correct: "a",
  };
  if (subject === "Mathematics" && localNumber === 28) return {
    question: "If the curve $y=y(x)$ represented by the solution of the differential equation $(2xy^2-y)\\,dx+x\\,dy=0$ passes through the intersection of the lines $2x-3y=1$ and $3x+2y=8$, then $|y(1)|$ is equal to ________.",
    options: [], correct: "1",
  };
  throw new Error(`Unexpected missing source: ${subject} Q${localNumber}`);
}

for (const subject of Object.keys(mappings)) {
  const rows = mappings[subject].map((sourceNumber, index) => {
    const localNumber = index + 1;
    const questionNumber = globalOffset[subject] + localNumber;
    const raw = sourceNumber == null ? missingRow(subject, localNumber) : byNumber.get(sourceNumber);
    if (!raw) throw new Error(`Bad mapping ${subject} Q${localNumber} -> ${sourceNumber}`);
    const numerical = localNumber > 20;
    const chapterName = metadata[subjectChapterStart[subject] + index];
    const chapter = chapterName === "Thermodynamics" && subject === "Chemistry"
      ? "Chemical Thermodynamics & Energetics"
      : chapterAliases[chapterName];
    if (!chapter) throw new Error(`No chapter alias for ${chapterName}`);
    const options = numerical ? ["", "", "", ""] : [...raw.options];
    const graphicalOptions = Boolean(raw.graphicalOptions);
    const questionImage = raw.source_image
      ? path.join(imageDir, `q${questionNumber}.png`)
      : (subject === "Physics" && localNumber === 17 ? path.join(imageDir, "q17.png") : null);
    return {
      local_number: localNumber, question_type: numerical ? "NUMERICAL" : "MCQ", chapter,
      question: raw.question, option_a: options[0] ?? "", option_b: options[1] ?? "", option_c: options[2] ?? "", option_d: options[3] ?? "",
      correct_option: numerical ? String(raw.correct) : String(raw.correct).toLowerCase(),
      needs_question_image: Boolean(questionImage),
      option_a_needs_image: graphicalOptions, option_b_needs_image: graphicalOptions, option_c_needs_image: graphicalOptions, option_d_needs_image: graphicalOptions,
      question_number: questionNumber, display_order: questionNumber, subject, question_image: questionImage,
      option_a_image: graphicalOptions ? path.join(imageDir, `q${questionNumber}_opt_a.png`) : null,
      option_b_image: graphicalOptions ? path.join(imageDir, `q${questionNumber}_opt_b.png`) : null,
      option_c_image: graphicalOptions ? path.join(imageDir, `q${questionNumber}_opt_c.png`) : null,
      option_d_image: graphicalOptions ? path.join(imageDir, `q${questionNumber}_opt_d.png`) : null,
      source_image: raw.source_image ?? null, source_number: sourceNumber,
    };
  });
  const output = path.join(ROOT, "scratch/jee2021/transcribed", `${PAPER}_${subject}.json`);
  await fs.writeFile(output, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`${subject}: ${rows.length}`);
}
