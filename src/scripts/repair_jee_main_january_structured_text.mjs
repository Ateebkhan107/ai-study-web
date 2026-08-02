import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

global.WebSocket = WebSocket;

process.loadEnvFile(".env.local");

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, "tmp", "jee-main-january-ocr-cache");
const STORAGE_BUCKET = "pyq-images";
const REVIEW_STATUS = "NEEDS_REVIEW";
const PAPER_CODES = [
  "JEE-MAIN-25-22JAN-S1",
  "JEE-MAIN-25-22JAN-S2",
  "JEE-MAIN-25-23JAN-S1",
  "JEE-MAIN-25-23JAN-S2",
  "JEE-MAIN-25-24JAN-S1",
  "JEE-MAIN-25-24JAN-S2",
  "JEE-MAIN-25-28JAN-S1",
  "JEE-MAIN-25-28JAN-S2",
  "JEE-MAIN-25-29JAN-S1",
  "JEE-MAIN-25-29JAN-S2",
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanupMathText(text) {
  return normalizeWhitespace(text)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, "-")
    .replace(/(?<=\d)[oO](?=\d)/g, "0")
    .replace(/\b[QO](?=\d)/g, "0");
}

function parsePaperMeta(paperCode) {
  const match = paperCode.match(/^JEE-MAIN-(\d\d)-(\d\d)JAN-S([12])$/);
  if (!match) throw new Error(`Unsupported paper code: ${paperCode}`);

  const [, year, day, shift] = match;
  return {
    year: Number(`20${year}`),
    day,
    shift,
    cropDirName: `jee_main_${Number(day)}_jan_shift_${shift}`,
    importPackageName: `JEE Main 20${year} January ${Number(day)} Shift ${shift} Structured OCR Repair`,
  };
}

function chapterFromKeywords(subject, fullText) {
  const text = fullText.toLowerCase();
  const keywordMap = {
    Physics: [
      ["Units and Measurements", ["dimension", "units", "vernier", "screw gauge"]],
      ["Motion in a Plane", ["projectile", "vector", "range", "velocity"]],
      ["Work, Energy and Power", ["kinetic energy", "potential energy", "power", "work done"]],
      ["System of Particles and Rotational Motion", ["moment of inertia", "torque", "angular acceleration", "center of mass"]],
      ["Gravitation", ["gravitational", "escape velocity", "satellite"]],
      ["Mechanical Properties of Fluids", ["bernoulli", "viscosity", "surface tension", "capillary"]],
      ["Thermal Properties of Matter", ["stefan", "thermal", "calorimetry", "heat capacity"]],
      ["Current Electricity", ["current", "resistance", "kirchhoff", "potentiometer"]],
      ["Electric Charges and Fields", ["electric field", "coulomb", "gauss", "flux"]],
      ["Electrostatic Potential and Capacitance", ["capacitor", "capacitance", "electrostatic potential"]],
      ["Moving Charges and Magnetism", ["lorentz", "magnetic field", "cyclotron"]],
      ["Electromagnetic Induction", ["induced emf", "self inductance", "mutual inductance"]],
      ["Alternating Current", ["rms", "reactance", "alternating current"]],
      ["Electromagnetic Waves", ["displacement current", "electromagnetic wave"]],
      ["Ray Optics and Optical Instruments", ["lens", "mirror", "prism", "refractive index"]],
      ["Wave Optics", ["interference", "diffraction", "ydse", "polarisation"]],
      ["Dual Nature of Radiation and Matter", ["photoelectric", "de broglie", "stopping potential"]],
      ["Atoms and Nuclei", ["radioactive", "bohr", "binding energy", "nucleus"]],
      ["Semiconductor Electronics", ["diode", "transistor", "semiconductor", "logic gate"]],
    ],
    Chemistry: [
      ["Some Basic Concepts of Chemistry", ["mole", "stoichiometry", "empirical formula"]],
      ["Atomic Structure", ["bohr", "orbital", "de broglie", "rydberg"]],
      ["Classification of Elements and Periodicity", ["ionization enthalpy", "periodicity", "electron affinity"]],
      ["Chemical Bonding and Molecular Structure", ["hybridization", "bond angle", "vsepr", "lattice"]],
      ["Thermodynamics", ["enthalpy", "entropy", "gibbs", "thermodynamics"]],
      ["Chemical Equilibrium", ["equilibrium constant", "ph", "buffer", "le chatelier"]],
      ["Solutions", ["raoult", "henry", "mole fraction", "osmotic"]],
      ["Electrochemistry", ["electrode potential", "nernst", "electrochemical", "conductance"]],
      ["Chemical Kinetics", ["rate constant", "half life", "order of reaction"]],
      ["d and f Block Elements", ["lanthanide", "actinoid", "transition element"]],
      ["Coordination Compounds", ["coordination", "ligand", "chelate", "cfse"]],
      ["General Organic Chemistry (GOC) & Nomenclature", ["iupac", "resonance", "hyperconjugation", "inductive"]],
      ["Hydrocarbons", ["alkane", "alkene", "alkyne", "benzene"]],
      ["Haloalkanes and Haloarenes", ["sn1", "sn2", "haloalkane", "haloarene"]],
      ["Alcohols, Phenols and Ethers", ["phenol", "ether", "alcohol"]],
      ["Aldehydes, Ketones and Carboxylic Acids", ["aldehyde", "ketone", "carboxylic", "tollens"]],
      ["Amines", ["amine", "diazonium", "aniline", "carbylamine"]],
      ["Biomolecules", ["glucose", "protein", "amino acid", "carbohydrate"]],
    ],
    Maths: [
      ["Sets, Relations and Functions", ["relation", "function", "domain", "range"]],
      ["Complex Numbers", ["complex", "argand", "modulus", "imaginary"]],
      ["Matrices and Determinants", ["adj", "det(", "matrix", "determinant"]],
      ["Permutation and Combination", ["permutation", "combination", "arrangement"]],
      ["Sequence and Series", ["series", "sequence", "ap", "gp"]],
      ["Probability", ["probability", "random variable", "coin", "binomial"]],
      ["Straight Lines", ["slope", "line", "distance from the line"]],
      ["Circles", ["circle", "radius", "tangent", "chord"]],
      ["Parabola", ["parabola", "focus", "directrix"]],
      ["Ellipse", ["ellipse", "eccentricity"]],
      ["Hyperbola", ["hyperbola", "asymptote"]],
      ["Limits, Continuity and Differentiability", ["limit", "continuous", "differentiable"]],
      ["Application of Derivatives", ["maxima", "minima", "tangent", "normal"]],
      ["Definite Integrals", ["integral", "area under", "integration"]],
      ["Differential Equations", ["differential equation", "dy/dx"]],
      ["Vector Algebra", ["vector", "dot product", "cross product"]],
      ["Three Dimensional Geometry", ["plane", "direction cosines", "line in space"]],
      ["Inverse Trigonometric Functions", ["sin^-1", "cos^-1", "tan^-1", "sec^-1", "cosec^-1"]],
      ["Trigonometry", ["trigonometric", "sin", "cos", "tan"]],
    ],
    Mathematics: [],
  };

  const groups = keywordMap[subject] || keywordMap.Maths;
  let best = null;
  for (const [chapter, keywords] of groups) {
    const score = keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { chapter, score };
    }
  }

  return best?.chapter || "Unmapped";
}

function parseOptions(optionBlock) {
  const cleaned = optionBlock
    .replace(/\bOptions?\b/gi, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const matches = [...cleaned.matchAll(/(?:^|\n)\s*(?:\(?([1-4])\)?|([A-D]))[.:)\]-]?\s*(.+?)(?=(?:\n\s*(?:\(?[1-4]\)?|[A-D])[.:)\]-]?\s)|$)/gims)];
  if (matches.length >= 4) {
    return matches.slice(0, 4).map((match) => cleanupMathText(match[3]));
  }

  return null;
}

function extractStructuredText(ocrText, questionNumber, questionType) {
  const text = cleanupMathText(ocrText)
    .replace(new RegExp(`^Q?\\s*${questionNumber}\\s*[.:)]?\\s*`, "i"), "")
    .replace(/^Question\s+\d+\s*:\s*/i, "")
    .trim();

  const optionIndex = text.search(/\bOptions?\b/i);
  const questionPart = optionIndex >= 0 ? text.slice(0, optionIndex) : text;
  const optionPart = optionIndex >= 0 ? text.slice(optionIndex) : "";

  return {
    question: `Question ${questionNumber}: ${cleanupMathText(questionPart) || "Refer to the source image."}`,
    options: questionType === "MCQ" ? parseOptions(optionPart) : null,
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(destination, Buffer.from(arrayBuffer));
}

async function prepareOcrImage(sourcePath, outputPath) {
  await sharp(sourcePath)
    .greyscale()
    .normalize()
    .sharpen()
    .resize({ width: 2200, withoutEnlargement: false })
    .png()
    .toFile(outputPath);
}

async function ocrImage(imagePath) {
  const { stdout } = await execFileAsync("tesseract", [imagePath, "stdout", "--psm", "6"]);
  return cleanupMathText(stdout);
}

async function ensureImportPackage(packageName) {
  const { data: existing, error: selectError } = await supabase
    .from("pyq_import_packages")
    .select("id")
    .eq("name", packageName)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to look up import package ${packageName}: ${selectError.message}`);
  }

  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("pyq_import_packages")
    .insert({ name: packageName, status: REVIEW_STATUS })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create import package ${packageName}: ${error.message}`);
  }

  return data.id;
}

async function uploadSolutionImage(localPath, paperCode, questionNumber) {
  const objectPath = `jee-main-january-solutions/${paperCode.toLowerCase()}/q${String(questionNumber).padStart(2, "0")}-solution.png`;
  const image = await fs.readFile(localPath);
  const upload = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, image, { contentType: "image/png", upsert: false });

  if (upload.error && upload.error.statusCode !== "409") {
    throw new Error(`Failed to upload solution image for ${paperCode} Q${questionNumber}: ${upload.error.message}`);
  }

  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

function reviewExplanation(row) {
  const answer = row.question_type === "NUMERICAL"
    ? row.numerical_answer ?? "Unknown"
    : row.correct_option ? row.correct_option.toUpperCase() : "Unknown";

  return `Imported from the preserved source image. Verify formatting against the backup image during review. Current answer key: ${answer}.`;
}

function computeConfidence({ hasQuestion, hasOptions, hasChapter, hasAnswer }) {
  const hits = [hasQuestion, hasOptions, hasChapter, hasAnswer].filter(Boolean).length;
  return Number((hits / 4).toFixed(2));
}

async function fetchPaperRows(paperCode) {
  const { data, error } = await supabase
    .from("pyq_questions")
    .select("id, paper_code, question_number, subject, question_type, question_image, correct_option, numerical_answer, explanation_image, option_a, option_b, option_c, option_d")
    .eq("paper_code", paperCode)
    .order("question_number", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch ${paperCode}: ${error.message}`);
  }

  return data || [];
}

function createInitialReport() {
  return {
    totalQuestions: 0,
    importedSuccessfully: 0,
    failed: 0,
    needsReview: 0,
    missingChapter: 0,
    missingAnswer: 0,
    missingDiagram: 0,
    missingOptions: 0,
    duplicateQuestions: 0,
    perPaper: {},
    failures: [],
  };
}

async function processPaper(paperCode, report) {
  const meta = parsePaperMeta(paperCode);
  const packageId = await ensureImportPackage(meta.importPackageName);
  const rows = await fetchPaperRows(paperCode);
  const cropDir = path.join(ROOT, "tmp", "jee-main-cropped", meta.cropDirName);
  const paperCacheDir = path.join(CACHE_DIR, paperCode);
  await ensureDir(paperCacheDir);

  const paperReport = {
    totalQuestions: rows.length,
    importedSuccessfully: 0,
    failed: 0,
    needsReview: 0,
    missingChapter: 0,
    missingAnswer: 0,
    missingDiagram: 0,
    missingOptions: 0,
    duplicateQuestions: 0,
  };
  report.perPaper[paperCode] = paperReport;
  report.totalQuestions += rows.length;

  for (const row of rows) {
    const qNumber = row.question_number;
    try {
      if (!row.question_image) {
        throw new Error("Missing preserved question_image");
      }

      const sourcePath = path.join(paperCacheDir, `q${String(qNumber).padStart(2, "0")}.png`);
      const ocrPath = path.join(paperCacheDir, `q${String(qNumber).padStart(2, "0")}-ocr.png`);
      try {
        await fs.access(sourcePath);
      } catch {
        await downloadFile(row.question_image, sourcePath);
      }
      try {
        await fs.access(ocrPath);
      } catch {
        await prepareOcrImage(sourcePath, ocrPath);
      }
      const structured = extractStructuredText(await ocrImage(ocrPath), qNumber, row.question_type);
      const options = row.question_type === "MCQ" ? structured.options || [] : [];
      const fullText = [structured.question, ...options].join("\n");
      const chapter = chapterFromKeywords(row.subject, fullText);
      const hasAnswer = row.question_type === "NUMERICAL"
        ? row.numerical_answer !== null && row.numerical_answer !== undefined
        : Boolean(row.correct_option);

      let explanationImage = row.explanation_image || null;
      const localSolutionPath = path.join(cropDir, `Q${qNumber}_solution.png`);
      try {
        await fs.access(localSolutionPath);
        explanationImage = await uploadSolutionImage(localSolutionPath, paperCode, qNumber);
      } catch {
        // Optional local solution crop.
      }

      const confidence = computeConfidence({
        hasQuestion: !/refer to the source image/i.test(structured.question),
        hasOptions: row.question_type !== "MCQ" || options.length === 4,
        hasChapter: chapter !== "Unmapped",
        hasAnswer,
      });

      const payload = {
        question: structured.question,
        option_a: row.question_type === "MCQ" ? options[0] || row.option_a : row.option_a,
        option_b: row.question_type === "MCQ" ? options[1] || row.option_b : row.option_b,
        option_c: row.question_type === "MCQ" ? options[2] || row.option_c : row.option_c,
        option_d: row.question_type === "MCQ" ? options[3] || row.option_d : row.option_d,
        chapter,
        topic: chapter === "Unmapped" ? "Unmapped" : chapter,
        explanation: reviewExplanation(row),
        explanation_image: explanationImage,
        import_package_id: packageId,
        status: REVIEW_STATUS,
        confidence_score: confidence,
      };

      const { error: updateError } = await supabase
        .from("pyq_questions")
        .update(payload)
        .eq("id", row.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      paperReport.importedSuccessfully += 1;
      paperReport.needsReview += 1;
      report.importedSuccessfully += 1;
      report.needsReview += 1;

      if (chapter === "Unmapped") {
        paperReport.missingChapter += 1;
        report.missingChapter += 1;
      }
      if (!hasAnswer) {
        paperReport.missingAnswer += 1;
        report.missingAnswer += 1;
      }
      if (row.question_type === "MCQ" && options.length !== 4) {
        paperReport.missingOptions += 1;
        report.missingOptions += 1;
      }
      if (!explanationImage) {
        paperReport.missingDiagram += 1;
        report.missingDiagram += 1;
      }
    } catch (error) {
      paperReport.failed += 1;
      report.failed += 1;
      report.failures.push({ paperCode, questionNumber: qNumber, error: error.message });
    }
  }

  const { error: packageError } = await supabase
    .from("pyq_import_packages")
    .update({ status: REVIEW_STATUS })
    .eq("id", packageId);

  if (packageError) {
    throw new Error(`Failed to update import package ${paperCode}: ${packageError.message}`);
  }
}

async function run() {
  const report = createInitialReport();
  await ensureDir(CACHE_DIR);

  for (const paperCode of PAPER_CODES) {
    await processPaper(paperCode, report);
  }

  const reportPath = path.join(ROOT, "tmp", "jee-main-january-structured-report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ reportPath, ...report }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
