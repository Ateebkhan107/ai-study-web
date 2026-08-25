import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-24-27JAN-S1";
const PDF_PATH = path.join(process.cwd(), "tmp/pdfs/jee-main-2024-27jan-s1-source.pdf");
const WORK_DIR = path.join(process.cwd(), "tmp/jee-main-2024-27jan-s1-clean-repair");
const DATASET_PATH = path.join(WORK_DIR, "structured-dataset.json");
const PYTHON = "/Users/ateebmazhar/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const POPPLER = "/Users/ateebmazhar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}`);
  }
}

function sourceNumberForAppNumber(number) {
  if (number <= 30) return number + 60; // Maths appears last in the source PDF.
  if (number <= 60) return number - 30; // Physics appears first.
  return number - 30; // Chemistry appears second.
}

function subjectForAppNumber(number) {
  if (number <= 30) return "Maths";
  if (number <= 60) return "Physics";
  return "Chemistry";
}

function typeForAppNumber(number) {
  const withinSubject = ((number - 1) % 30) + 1;
  return withinSubject <= 20 ? "MCQ" : "NUMERICAL";
}

function correctOptionFromKey(key) {
  return "abcd"[Number(key) - 1] || "a";
}

function optionLabelFor(index, visual = false) {
  return visual ? `See figure option ${index}` : "";
}

const visualCrops = {
  49: { source: 19, page: 3, box: [160, 820, 1500, 1385], note: "reverse-biased circuit options" },
  56: { source: 26, page: 4, box: [205, 635, 785, 860], note: "capacitor bridge circuit" },
  57: { source: 27, page: 4, box: [185, 1090, 525, 1345], note: "parallel current-carrying wires" },
  59: { source: 29, page: 4, box: [170, 1755, 705, 2045], note: "two-liquid beaker diagram" },
  64: { source: 34, page: 5, box: [170, 780, 1520, 1305], note: "Bronsted base structure options" },
  69: { source: 39, page: 6, box: [145, 740, 1605, 1230], note: "acidic hydrogen structure options" },
  70: { source: 40, page: 6, box: [155, 1265, 675, 1835], note: "phenol derivative structures" },
  71: { source: 41, page: 7, box: [150, 170, 1540, 760], note: "enol content structure options" },
  86: { source: 56, page: 9, box: [150, 190, 670, 830], note: "aromatic compound structures" },
};

const manualText = {
  12: {
    question: "Question 12: Consider the matrix $f(x)=\\begin{bmatrix}\\cos x&-\\sin x&0\\\\\\sin x&\\cos x&0\\\\0&0&1\\end{bmatrix}$. Given below are two statements: Statement I: $f(-x)$ is the inverse of the matrix $f(x)$. Statement II: $f(x)f(y)=f(x+y)$. In the light of the above statements, choose the correct answer from the options given below:",
    options: [
      "Statement I is false but Statement II is true",
      "Both Statement I and Statement II are false",
      "Statement I is true but Statement II is false",
      "Both Statement I and Statement II are true",
    ],
  },
  17: {
    question: "Question 17: Let x = x(t) and y = y(t) be solutions of the differential equations dx/dt + ax = 0 and dy/dt + by = 0 respectively, a, b ∈ R. Given that x(0) = 2, y(0) = 1 and 3y(1) = 2x(1), the value of t, for which x(t) = y(t), is:",
    options: ["log_{2/3} 2", "log_{4/3} 3", "log_{3/4} 4", "log_{4/3} 2"],
  },
  19: {
    question: "Question 19: The distance of the point (7, -2, 11) from the line $(x-6)/1=(y-4)/0=(z-8)/3$ along the line $(x-5)/2=(y-1)/(-3)=(z-5)/6$ is:",
    options: ["12", "14", "18", "21"],
  },
  20: {
    question: "Question 20: If the shortest distance between the lines $(x-4)/1=(y+1)/2=z/(-3)$ and $(x-λ)/2=(y+1)/4=(z-2)/(-5)$ is $6/\\sqrt{5}$, then the sum of all possible values of λ is:",
    options: ["5", "8", "7", "10"],
  },
  23: {
    question: "Question 23: Let the set of all $a \\in R$ such that the equation $\\cos 2x+a\\sin x=2a-7$ has a solution be $[p,q]$ and $r=\\frac{\\tan 9^\\circ-\\tan 27^\\circ-1}{\\cot 63^\\circ}+\\tan 81^\\circ$, then $pqr$ is equal to ________.",
    options: [],
  },
  24: {
    question: "Question 24: Let $A=\\begin{bmatrix}2&0&1\\\\1&1&0\\\\1&0&1\\end{bmatrix}$, $B=[B_1\\ B_2\\ B_3]$, where $B_1,B_2,B_3$ are column matrices, and $AB_1=\\begin{bmatrix}1\\\\0\\\\0\\end{bmatrix}$, $AB_2=\\begin{bmatrix}2\\\\3\\\\0\\end{bmatrix}$, $AB_3=\\begin{bmatrix}3\\\\2\\\\1\\end{bmatrix}$. If $α=|B|$ and $β$ is the sum of all the diagonal elements of $B$, then $α^3+β^3$ is equal to ______.",
    options: [],
  },
  39: {
    question: "Question 39: The average kinetic energy of a monatomic molecule is 0.414 eV at temperature: (Use $K_B=1.38\\times10^{-23}\\ J\\ K^{-1}$)",
    options: ["3000 K", "3200 K", "1600 K", "1500 K"],
  },
  45: {
    question: "Question 45: A plane electromagnetic wave propagating in x-direction is described by $E_y=(200\\ V\\ m^{-1})\\sin[1.5\\times10^7t-0.05x]$. The intensity of the wave is: (Use $\\epsilon_0=8.85\\times10^{-12}\\ C^2N^{-1}m^{-2}$)",
    options: ["35.4 W m^-2", "53.1 W m^-2", "26.6 W m^-2", "106.2 W m^-2"],
  },
  49: {
    question: "Question 49: Which of the following circuits is reverse-biased?",
    options: [1, 2, 3, 4].map((n) => optionLabelFor(n, true)),
  },
  56: {
    question: "Question 56: The charge accumulated on the capacitor connected in the following circuit is ______ μC. (Given C = 150 μF)",
    options: [],
  },
  57: {
    question: "Question 57: Two long, straight wires carry equal currents in opposite directions as shown in the figure. The separation between the wires is 5.0 cm. The magnitude of the magnetic field at a point P midway between the wires is ______ μT. (Given: μ0 = 4π × 10^-7 T m A^-1)",
    options: [],
  },
  59: {
    question: "Question 59: Two immiscible liquids of refractive indices 8/5 and 3/2 respectively are put in a beaker as shown in the figure. The height of each column is 6 cm. A coin is placed at the bottom of the beaker. For near normal vision, the apparent depth of the coin is α/4 cm. The value of α is ______.",
    options: [],
  },
  53: {
    question: "Question 53: If average depth of an ocean is 4000 m and the bulk modulus of water is $2\\times10^9\\ N\\ m^{-2}$, then fractional compression $\\Delta V/V$ of water at the bottom of ocean is $α\\times10^{-2}$. The value of $α$ is _______. (Given, $g=10\\ m\\ s^{-2}$, $ρ=1000\\ kg\\ m^{-3}$)",
    options: [],
  },
  55: {
    question: "Question 55: A thin metallic wire having cross sectional area of $10^{-4}\\ m^2$ is used to make a ring of radius 30 cm. A positive charge of $2π\\ C$ is uniformly distributed over the ring, while another positive charge of 30 pC is kept at the centre of the ring. The tension in the ring is _______ N; provided that the ring does not get deformed (neglect the influence of gravity). (Given, $1/(4π\\epsilon_0)=9\\times10^9$ SI units)",
    options: [],
  },
  64: {
    question: "Question 64: Which of the following is strongest Bronsted base?",
    options: [1, 2, 3, 4].map((n) => optionLabelFor(n, true)),
  },
  67: {
    question: "Question 67: IUPAC name of the given compound (P) is:",
    options: [
      "1-Ethyl-5,5-dimethylcyclohexane",
      "3-Ethyl-1,1-dimethylcyclohexane",
      "1-Ethyl-3,3-dimethylcyclohexane",
      "1,1-Dimethyl-3-ethylcyclohexane",
    ],
  },
  69: {
    question: "Question 69: Which of the following has highly acidic hydrogen?",
    options: [1, 2, 3, 4].map((n) => optionLabelFor(n, true)),
  },
  70: {
    question: "Question 70: The ascending order of acidity of -OH group in the following compounds is:",
    options: [
      "(A) < (D) < (C) < (B) < (E)",
      "(C) < (A) < (D) < (B) < (E)",
      "(C) < (D) < (B) < (A) < (E)",
      "(A) < (C) < (D) < (B) < (E)",
    ],
  },
  71: {
    question: "Question 71: Highest enol content will be shown by:",
    options: [1, 2, 3, 4].map((n) => optionLabelFor(n, true)),
  },
  86: {
    question: "Question 86: Among the given organic compounds, the total number of aromatic compounds is ______.",
    options: [],
  },
  74: {
    question: "Question 74: NaCl reacts with conc. H2SO4 and K2Cr2O7 to give reddish fumes (B), which react with NaOH to give yellow solution (C). (B) and (C) respectively are:",
    options: ["CrO2Cl2, Na2CrO4", "Na2CrO4, CrO2Cl2", "CrO2Cl2, KHSO4", "CrO2Cl2, Na2Cr2O7"],
  },
  81: {
    question: "Question 81: Mass of methane required to produce 22 g of CO2 after complete combustion is ______ g. (Given molar mass in g mol^-1: C = 12.0, H = 1.0, O = 16.0)",
    options: [],
  },
  85: {
    question: "Question 85: Among the following, total number of meta directing functional groups is (integer based): -OCH3, -NO2, -CN, -CH3, -NHCOCH3, -COR, -OH, -COOH, -Cl.",
    options: [],
  },
  89: {
    question: "Question 89: Consider the following data for the given reaction: $2HI_{(g)} \\rightarrow H_{2(g)} + I_{2(g)}$. | HI (mol L^-1) | 0.005 | 0.01 | 0.02 | |---|---:|---:|---:| | Rate (mol L^-1 s^-1) | 7.5 × 10^-4 | 3.0 × 10^-3 | 1.2 × 10^-2 | The order of the reaction is ______.",
    options: [],
  },
  90: {
    question: "Question 90: From the given list, the number of compounds with +4 oxidation state of sulphur is ______: SO3, H2SO3, SOCl2, SF4, BaSO4, H2S2O7.",
    options: [],
  },
};

function normalizeText(value) {
  return String(value || "")
    .replace(/Join the Most Relevant Test Series[\s\S]*?MathonGo/g, " ")
    .replace(/J\s*EE Main 2024 \(27 Jan Shift 1\)\s*JEE Main Previous Year Paper\s*Question Paper\s*MathonGo/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b0\. (\d)/g, "0.$1")
    .replace(/\b1\. 5\b/g, "1.5")
    .replace(/\b4\. 5\b/g, "4.5")
    .replace(/\b5\. 0\b/g, "5.0")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function parseOptions(chunk) {
  const flat = normalizeText(chunk);
  const matches = [...flat.matchAll(/\((1|2|3|4)\)\s*(.*?)(?=\s*\([1-4]\)\s*|$)/g)];
  if (matches.length !== 4) return [];
  return matches.map((match) => normalizeText(match[2]));
}

function parsePrompt(chunk, sourceNumber) {
  let prompt = chunk.replace(new RegExp(`^Q\\s*\\.?\\s*${sourceNumber}\\.`), "");
  prompt = prompt.replace(/\s*\(1\)[\s\S]*$/, "");
  return normalizeText(prompt);
}

async function prepareDataset() {
  await fs.mkdir(WORK_DIR, { recursive: true });
  const script = `
import json, re
from pathlib import Path
import pdfplumber
p = Path(${JSON.stringify(PDF_PATH)})
texts = []
with pdfplumber.open(p) as pdf:
    for page in pdf.pages:
        texts.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")
text = "\\n".join(texts)
body = text[text.find("Q1."):]
marks = list(re.finditer(r"(?m)^Q\\s*\\.?\\s*(\\d+)\\.", body))
chunks = {}
for i, mark in enumerate(marks):
    end = marks[i + 1].start() if i + 1 < len(marks) else len(body)
    chunks[int(mark.group(1))] = body[mark.start():end].strip()
keys = {int(n): v.strip() for n, v in re.findall(r"\\b(\\d+)\\.\\s*\\(([^)]+)\\)", body[body.find("ANSWER KEYS"):])}
Path(${JSON.stringify(path.join(WORK_DIR, "source-extract.json"))}).write_text(json.dumps({"chunks": chunks, "keys": keys}, ensure_ascii=False, indent=2))
`;
  run(PYTHON, ["-c", script]);

  const source = JSON.parse(await fs.readFile(path.join(WORK_DIR, "source-extract.json"), "utf8"));
  if (Object.keys(source.chunks).length !== 90) {
    throw new Error(`Expected 90 source chunks, found ${Object.keys(source.chunks).length}`);
  }
  if (Object.keys(source.keys).length !== 90) {
    throw new Error(`Expected 90 answer keys, found ${Object.keys(source.keys).length}`);
  }

  const rows = [];
  for (let number = 1; number <= 90; number++) {
    const sourceNumber = sourceNumberForAppNumber(number);
    const sourceChunk = source.chunks[sourceNumber];
    const key = source.keys[sourceNumber];
    const questionType = typeForAppNumber(number);
    const manual = manualText[number];
    const options = manual?.options || (questionType === "MCQ" ? parseOptions(sourceChunk) : []);
    const prompt = manual?.question || `Question ${number}: ${parsePrompt(sourceChunk, sourceNumber)}`;
    rows.push({
      number,
      sourceNumber,
      subject: subjectForAppNumber(number),
      question_type: questionType,
      question: prompt,
      options,
      answer: key,
      needs_image: Boolean(visualCrops[number]),
      image_note: visualCrops[number]?.note || null,
    });
  }

  const badOptions = rows.filter((row) => row.question_type === "MCQ" && row.options.length !== 4);
  if (badOptions.length) {
    throw new Error(`MCQ option parse failures: ${badOptions.map((row) => `Q${row.number}/sourceQ${row.sourceNumber}`).join(", ")}`);
  }

  await fs.writeFile(DATASET_PATH, JSON.stringify(rows, null, 2));
  return rows;
}

async function cropRequiredImages() {
  const pagesDir = path.join(WORK_DIR, "pages");
  const cropsDir = path.join(WORK_DIR, "required-images");
  await fs.mkdir(pagesDir, { recursive: true });
  await fs.mkdir(cropsDir, { recursive: true });
  run(POPPLER, ["-png", "-r", "220", PDF_PATH, path.join(pagesDir, "page")]);

  const cropScript = `
import json
from pathlib import Path
from PIL import Image
crops = ${JSON.stringify(visualCrops)}
pages = Path(${JSON.stringify(pagesDir)})
out = Path(${JSON.stringify(cropsDir)})
out.mkdir(parents=True, exist_ok=True)
for app_num, item in crops.items():
    img = Image.open(pages / f"page-{item['page']:02}.png").convert("RGB")
    crop = img.crop(tuple(item["box"]))
    px = crop.load()
    w, h = crop.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r > 205 and g > 215 and b > 220 and b >= r and b >= g:
                px[x, y] = (255, 255, 255)
    crop.save(out / f"q{int(app_num):02}.png", optimize=True)
print(json.dumps({"cropped": len(crops), "dir": str(out)}))
`;
  run(PYTHON, ["-c", cropScript]);
}

async function uploadImage(questionNumber) {
  const filename = `q${String(questionNumber).padStart(2, "0")}.png`;
  const localPath = path.join(WORK_DIR, "required-images", filename);
  const objectPath = `jee-main-2024/27jan-shift-1-required/${filename}`;
  const bytes = await fs.readFile(localPath);
  const { error } = await supabase.storage
    .from("pyq-images")
    .upload(objectPath, bytes, { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Image upload failed for Q${questionNumber}: ${error.message}`);
  return `${supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl}?v=${Date.now()}`;
}

async function main() {
  const dataset = await prepareDataset();
  await cropRequiredImages();

  const { data: exam, error: examError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("paper_code", PAPER_CODE)
    .maybeSingle();
  if (examError) throw examError;
  if (!exam?.id) throw new Error(`${PAPER_CODE} exam row was not found`);

  const { data: existingRows, error: rowsError } = await supabase
    .from("pyq_questions")
    .select("id, question_number")
    .eq("paper_code", PAPER_CODE)
    .order("question_number", { ascending: true });
  if (rowsError) throw rowsError;
  if (!existingRows || existingRows.length !== 90) {
    throw new Error(`Expected 90 existing rows, found ${existingRows?.length || 0}`);
  }
  const byNumber = new Map(existingRows.map((row) => [row.question_number, row.id]));

  const imageUrls = {};
  for (const row of dataset.filter((item) => item.needs_image)) {
    imageUrls[row.number] = await uploadImage(row.number);
  }

  for (const item of dataset) {
    const numerical = item.question_type === "NUMERICAL";
    const answer = String(item.answer).replace(/,/g, "").trim();
    const payload = {
      exam_id: exam.id,
      exam: "JEE",
      exam_type: "JEE Main",
      year: 2024,
      attempt: "27 Jan",
      shift: "Shift 1",
      paper_code: PAPER_CODE,
      question_number: item.number,
      display_order: item.number,
      subject: item.subject,
      chapter: "Unmapped",
      topic: "Unmapped",
      difficulty: "Medium",
      question_type: item.question_type,
      question: item.question,
      option_a: numerical ? "" : item.options[0],
      option_b: numerical ? "" : item.options[1],
      option_c: numerical ? "" : item.options[2],
      option_d: numerical ? "" : item.options[3],
      correct_option: numerical ? "a" : correctOptionFromKey(answer),
      numerical_answer: numerical ? Number(answer) : null,
      explanation: `Official answer key: ${item.answer}.`,
      question_image: imageUrls[item.number] || null,
      explanation_image: null,
      marks_positive: 4,
      marks_negative: numerical ? 0 : 1,
      status: "PUBLISHED",
      confidence_score: 1,
    };
    const { error } = await supabase
      .from("pyq_questions")
      .update(payload)
      .eq("id", byNumber.get(item.number));
    if (error) throw new Error(`Failed to update Q${item.number}: ${error.message}`);
  }

  const { data: verified, error: verifyError } = await supabase
    .from("pyq_questions")
    .select("question_number, subject, question_type, question, question_image, option_a, correct_option, numerical_answer")
    .eq("paper_code", PAPER_CODE)
    .order("question_number", { ascending: true });
  if (verifyError) throw verifyError;

  const report = {
    paperCode: PAPER_CODE,
    totalRows: verified.length,
    textRows: verified.filter((row) => !/refer to the source image/i.test(row.question)).length,
    imageRows: verified.filter((row) => row.question_image).map((row) => row.question_number),
    subjectCounts: {
      Maths: verified.filter((row) => row.subject === "Maths").length,
      Physics: verified.filter((row) => row.subject === "Physics").length,
      Chemistry: verified.filter((row) => row.subject === "Chemistry").length,
    },
    sampleRows: verified.filter((row) => [1, 31, 49, 64, 86, 90].includes(row.question_number)),
  };
  await fs.writeFile(path.join(WORK_DIR, "publish-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
