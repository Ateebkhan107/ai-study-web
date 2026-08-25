import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-24-29JAN-S2";
const PDF_PATH = path.join(process.cwd(), "tmp/pdfs/current-jee-main-source.pdf");
const WORK_DIR = path.join(process.cwd(), "tmp/jee-main-2024-29jan-s2-clean-repair");
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
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}`);
}

function sourceNumberForAppNumber(number) {
  if (number <= 30) return number + 60;
  if (number <= 60) return number - 30;
  return number - 30;
}

function subjectForAppNumber(number) {
  if (number <= 30) return "Maths";
  if (number <= 60) return "Physics";
  return "Chemistry";
}

function typeForAppNumber(number) {
  return ((number - 1) % 30) + 1 <= 20 ? "MCQ" : "NUMERICAL";
}

function correctOptionFromKey(key) {
  return "abcd"[Number(key) - 1] || "a";
}

const visualCrops = {
  35: { source: 5, page: 1, box: [100, 1390, 900, 1910], note: "vertical circle pendulum diagram" },
  42: { source: 12, page: 2, box: [100, 1370, 1050, 1780], note: "resistor network circuit" },
  50: {
    source: 20,
    parts: [
      { page: 3, box: [150, 1885, 850, 2195] },
      { page: 4, box: [100, 130, 1340, 760] },
    ],
    note: "logic circuit and truth table options",
  },
  55: { source: 25, page: 4, box: [100, 1580, 850, 1980], note: "parallel resistor circuit" },
  58: { source: 28, page: 5, box: [170, 370, 700, 800], note: "capacitor circuit" },
  61: { source: 31, page: 5, box: [190, 1220, 980, 1740], note: "spectral series matching table" },
  64: { source: 34, page: 6, box: [800, 150, 1280, 430], note: "cyclohexenol structure" },
  65: { source: 35, page: 6, box: [180, 555, 1600, 900], note: "acidic hydrogen structure list" },
  66: { source: 36, page: 6, box: [190, 1110, 960, 1455], note: "pKa matching table" },
  67: { source: 37, page: 7, box: [120, 185, 1500, 650], note: "geometrical isomerism structure options" },
  75: { source: 45, page: 8, box: [180, 470, 1600, 900], note: "organic conversion scheme" },
  76: { source: 46, page: 8, box: [160, 1100, 1600, 1810], note: "reaction options with structures" },
  77: {
    source: 47,
    parts: [
      { page: 8, box: [180, 1740, 1300, 2180] },
      { page: 9, box: [120, 130, 1500, 610] },
    ],
    note: "diazotization reaction and product options",
  },
  80: { source: 50, page: 9, box: [180, 1060, 1160, 1405], note: "biopolymer matching table" },
};

const manualText = {
  1: {
    question: "Question 1: Let $r$ and $θ$ respectively be the modulus and amplitude of the complex number $z=2-i\\left(2\\tan\\frac{5π}{8}\\right)$. Then $(r,θ)$ is equal to:",
    options: ["$\\left(2\\sec\\frac{3π}{8},\\frac{3π}{8}\\right)$", "$\\left(2\\sec\\frac{3π}{8},\\frac{5π}{8}\\right)$", "$\\left(2\\sec\\frac{5π}{8},\\frac{3π}{8}\\right)$", "$\\left(2\\sec\\frac{11π}{8},\\frac{11π}{8}\\right)$"],
  },
  5: {
    question: "Question 5: The sum of the solutions $x\\in R$ of the equation $\\frac{3\\cos2x+\\cos^3 2x}{\\cos^6x-\\sin^6x}=x^3-x^2+6$ is:",
    options: ["0", "1", "-1", "3"],
  },
  8: {
    question: "Question 8: If the mean and variance of five observations are $\\frac{24}{5}$ and $\\frac{194}{25}$ respectively and the mean of first four observations is $\\frac{7}{2}$, then the variance of the first four observations is equal to:",
    options: ["$\\frac45$", "$\\frac{77}{12}$", "$\\frac54$", "$\\frac{105}{4}$"],
  },
  10: {
    question: "Question 10: Let $A=\\begin{bmatrix}2&1&2\\\\6&2&11\\\\3&3&2\\end{bmatrix}$ and $P=\\begin{bmatrix}1&2&0\\\\5&0&2\\\\7&1&5\\end{bmatrix}$. The sum of the prime factors of $|P^{-1}AP-2I|$ is equal to:",
    options: ["26", "27", "66", "23"],
  },
  16: {
    question: "Question 16: If $\\sin\\left(\\frac{y}{x}\\right)=\\log_e|x|+\\frac{α}{2}$ is the solution of the differential equation $x\\cos\\left(\\frac{y}{x}\\right)\\frac{dy}{dx}=y\\cos\\left(\\frac{y}{x}\\right)+x$ and $y(1)=\\frac{π}{3}$, then $α^2$ is equal to:",
    options: ["3", "12", "4", "9"],
  },
  18: {
    question: "Question 18: Let a unit vector $\\hat u=x\\hat i+y\\hat j+z\\hat k$ make angles $\\frac{π}{2}$, $\\frac{π}{3}$ and $\\frac{2π}{3}$ with the vectors $\\frac{1}{\\sqrt2}\\hat i+\\frac{1}{\\sqrt2}\\hat k$, $\\frac{1}{\\sqrt2}\\hat j+\\frac{1}{\\sqrt2}\\hat k$ and $\\frac{1}{\\sqrt2}\\hat i+\\frac{1}{\\sqrt2}\\hat j$ respectively. If $\\vec v=\\frac{1}{\\sqrt2}\\hat i+\\frac{1}{\\sqrt2}\\hat j+\\frac{1}{\\sqrt2}\\hat k$, then $|\\hat u-\\vec v|^2$ is equal to:",
    options: ["$\\frac{11}{2}$", "$\\frac52$", "9", "7"],
  },
  20: {
    question: "Question 20: An integer is chosen at random from the integers 1, 2, 3, ..., 50. The probability that the chosen integer is a multiple of at least one of 4, 6 and 7 is:",
    options: ["$\\frac{8}{25}$", "$\\frac{21}{50}$", "$\\frac{9}{50}$", "$\\frac{14}{25}$"],
  },
  28: {
    question: "Question 28: If $\\int_{π/6}^{π/3}\\sqrt{1-\\sin2x}\\,dx=α+β\\sqrt2+γ\\sqrt3$, where $α,β$ and $γ$ are rational numbers, then $3α+4β-γ$ is equal to ______.",
    options: [],
  },
  30: {
    question: "Question 30: Let O be the origin, and M and N be the points on the lines $\\frac{x-5}{4}=\\frac{y-4}{1}=\\frac{z-5}{3}$ and $\\frac{x+8}{12}=\\frac{y+2}{5}=\\frac{z+11}{9}$ respectively such that MN is the shortest distance between the given lines. Then $\\overrightarrow{OM}\\cdot\\overrightarrow{ON}$ is equal to ______.",
    options: [],
  },
  31: {
    question: "Question 31: A physical quantity Q is found to depend on quantities a, b, c by the relation $Q=\\frac{a^4b^3}{c^2}$. The percentage errors in a, b and c are 3%, 4% and 5% respectively. Then the percentage error in Q is:",
    options: ["66%", "43%", "34%", "14%"],
  },
  35: {
    question: "Question 35: A bob of mass $m$ is suspended by a light string of length $L$. It is imparted a minimum horizontal velocity at the lowest position A such that it just completes half circle reaching the topmost position B. The ratio of kinetic energies $\\left(\\frac{K.E.}{K.E.}\\right)_{A/B}$ is:",
    options: ["3 : 2", "5 : 1", "2 : 5", "1 : 5"],
  },
  42: {
    question: "Question 42: In the given circuit, the current in resistance $R_3$ is:",
    options: ["1 A", "1.5 A", "2 A", "2.5 A"],
  },
  47: {
    question: "Question 47: In Young's double slit experiment, light from two identical sources are superimposing on a screen. The path difference between the two lights reaching at a point on the screen is $\\frac{7λ}{4}$. The ratio of intensity of fringe at this point with respect to the maximum intensity of the fringe is:",
    options: ["$\\frac12$", "$\\frac34$", "$\\frac13$", "$\\frac14$"],
  },
  50: {
    question: "Question 50: The truth table for this given circuit is:",
    options: ["See truth table option 1", "See truth table option 2", "See truth table option 3", "See truth table option 4"],
  },
  55: {
    question: "Question 55: In the given circuit, the current flowing through the resistance 20 Ω is 0.3 A, while the ammeter reads 0.9 A. The value of $R_1$ is ______ Ω.",
    options: [],
  },
  58: {
    question: "Question 58: In the given figure, the charge stored in 6 μF capacitor, when points A and B are joined by a connecting wire, is ______ μC.",
    options: [],
  },
  61: {
    question: "Question 61: Match List I with List II.",
    options: ["A-II, B-III, C-I, D-IV", "A-I, B-III, C-II, D-IV", "A-II, B-IV, C-III, D-I", "A-I, B-II, C-III, D-IV"],
  },
  64: {
    question: "Question 64: According to IUPAC system, the compound shown in the figure is named as:",
    options: ["Cyclohex-1-en-2-ol", "1-Hydroxyhex-2-ene", "Cyclohex-1-en-3-ol", "Cyclohex-2-en-1-ol"],
  },
  65: {
    question: "Question 65: The ascending acidity order of the following H atoms is:",
    options: ["C < D < B < A", "A < B < C < D", "A < B < D < C", "D < C < B < A"],
  },
  66: {
    question: "Question 66: Match List I with List II.",
    options: ["A-I, B-II, C-III, D-IV", "A-IV, B-I, C-II, D-III", "A-III, B-IV, C-I, D-II", "A-II, B-I, C-IV, D-III"],
  },
  67: {
    question: "Question 67: Which one of the following will show geometrical isomerism?",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  75: {
    question: "Question 75: Identify the reagents used for the following conversion.",
    options: ["A = LiAlH4, B = NaOH(aq), C = NH2-NH2/KOH ethylene glycol", "A = LiAlH4, B = NaOH(alc), C = Zn/HCl", "A = DIBAL-H, B = NaOH(aq), C = NH2-NH2/KOH ethylene glycol", "A = DIBAL-H, B = NaOH(alc), C = Zn/HCl"],
  },
  76: {
    question: "Question 76: Which of the following reaction is correct?",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  77: {
    question: "Question 77: The product A formed in the following reaction is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  80: {
    question: "Question 80: Match List I with List II.",
    options: ["A-II, B-I, C-III, D-IV", "A-IV, B-II, C-I, D-III", "A-I, B-III, C-IV, D-II", "A-II, B-III, C-I, D-IV"],
  },
};

function normalizeText(value) {
  return String(value || "")
    .replace(/Join the Most Relevant Test Series[\s\S]*?MathonGo/g, " ")
    .replace(/J\s*EE Main 2024 \(29 Jan Shift 2\)\s*JEE Main Previous Year Paper\s*Question Paper\s*MathonGo/g, " ")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(\d+)\s+\.\s+(\d+)/g, "$1.$2")
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
    const question = manual?.question || `Question ${number}: ${parsePrompt(sourceChunk, sourceNumber)}`;
    rows.push({
      number,
      sourceNumber,
      subject: subjectForAppNumber(number),
      question_type: questionType,
      question,
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
    parts = item.get("parts")
    if parts:
        cropped_parts = []
        for part in parts:
            img = Image.open(pages / f"page-{part['page']:02}.png").convert("RGB")
            cropped_parts.append(img.crop(tuple(part["box"])))
        width = max(part.width for part in cropped_parts)
        height = sum(part.height for part in cropped_parts) + 24 * (len(cropped_parts) - 1)
        crop = Image.new("RGB", (width, height), "white")
        y = 0
        for part in cropped_parts:
            crop.paste(part, (0, y))
            y += part.height + 24
    else:
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
  const objectPath = `jee-main-2024/29jan-shift-2-required/${filename}`;
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
      attempt: "29 Jan",
      shift: "Shift 2",
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
    .select("question_number, subject, question_type, question, question_image, option_a, option_b, option_c, option_d, correct_option, numerical_answer")
    .eq("paper_code", PAPER_CODE)
    .order("question_number", { ascending: true });
  if (verifyError) throw verifyError;

  const mcqRows = verified.filter((row) => row.question_type === "MCQ");
  const report = {
    paperCode: PAPER_CODE,
    totalRows: verified.length,
    textRows: verified.filter((row) => !/refer to the source image/i.test(row.question)).length,
    emptyMcqOptions: mcqRows.filter((row) => [row.option_a, row.option_b, row.option_c, row.option_d].some((value) => !value)).map((row) => row.question_number),
    imageRows: verified.filter((row) => row.question_image).map((row) => row.question_number),
    subjectCounts: {
      Maths: verified.filter((row) => row.subject === "Maths").length,
      Physics: verified.filter((row) => row.subject === "Physics").length,
      Chemistry: verified.filter((row) => row.subject === "Chemistry").length,
    },
    typeCounts: {
      MCQ: verified.filter((row) => row.question_type === "MCQ").length,
      NUMERICAL: verified.filter((row) => row.question_type === "NUMERICAL").length,
    },
    sampleRows: verified.filter((row) => [1, 31, 35, 42, 50, 61, 75, 80, 90].includes(row.question_number)),
  };
  await fs.writeFile(path.join(WORK_DIR, "publish-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
