import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-24-01FEB-S2";
const PDF_PATH = path.join(process.cwd(), "tmp/pdfs/source-d.pdf");
const WORK_DIR = path.join(process.cwd(), "tmp/jee-main-2024-01feb-s2-clean-repair");
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

const shiftVisualCrops = {
  35: { source: 5, page: 1, box: [190, 1690, 900, 1870], note: "rolling disc on incline" },
  40: { source: 10, page: 2, box: [200, 990, 820, 1305], note: "concentric cubes charge diagram" },
  41: { source: 11, page: 2, box: [205, 1575, 760, 1930], note: "galvanometer capacitor bridge circuit" },
  56: { source: 26, page: 4, box: [185, 1810, 800, 2170], note: "resistor capacitor circuit" },
  72: { source: 42, page: 6, box: [185, 1845, 1250, 2110], note: "hydrogenation reaction schemes" },
  79: { source: 49, page: 7, box: [180, 1710, 1360, 1950], note: "multistep organic reaction scheme" },
  88: { source: 58, page: 8, box: [180, 1730, 1060, 1935], note: "first order decomposition data table" },
};

const shiftManualText = {
  1: {
    question: "Question 1: Let $\\alpha$ and $\\beta$ be the roots of the equation $px^2+qx-r=0$, where $p\\ne0$. If p, q and r are consecutive terms of a non-constant G.P. and $\\frac1\\alpha+\\frac1\\beta=3$, then the value of $\\frac pq$ is:",
    options: ["$\\frac49$", "$\\frac{20}{9}$", "$\\frac83$", "1"],
  },
  2: {
    question: "Question 2: If z is a complex number such that $|z|\\le1$, then the minimum value of $|z+3+4i|$ is:",
    options: ["$2\\sqrt5$", "$2\\sqrt3$", "4", "$3\\sqrt2$"],
  },
  4: {
    question: "Question 4: Let m and n be the coefficients of seventh and thirteenth terms respectively in the expansion of $(x^{1/3}+\\frac1{2x^{2/3}})^{18}$. Then $\\frac3m$ is:",
    options: ["$\\frac14$", "$\\frac19$", "$\\frac94$", "$\\frac49$"],
  },
  6: {
    question: "Question 6: Let the locus of the mid points of the chords of circle $x^2+(y-1)^2=1$ drawn from the origin intersect the line x+y=1 at P and Q. Then, the length of PQ is:",
    options: ["$\\frac1{\\sqrt2}$", "$\\frac2{\\sqrt2}$", "1", "$\\frac12$"],
  },
  7: {
    question: "Question 7: Let P be a point on the ellipse $\\frac{x^2}{9}+\\frac{y^2}{4}=1$. Let the line passing through P and parallel to y-axis meet the circle $x^2+y^2=9$ at point Q such that P and Q are on the same side of the x-axis. Then, the eccentricity of the locus of R on PQ such that PR:RQ=1:2 is:",
    options: ["$\\frac{19}{23}$", "$\\frac{21}{23}$", "$\\sqrt{\\frac{139}{23}}$", "$\\frac{7\\sqrt{13}}{23}$"],
  },
  9: {
    question: "Question 9: Consider 10 observations $x_1,x_2,\\ldots,x_{10}$ such that $\\sum_{i=1}^{10}(x_i-\\alpha)=2$ and $\\sum_{i=1}^{10}(x_i-\\beta)^2=40$, where $\\alpha,\\beta$ are positive integers. Let the mean and the variance of the observations be $\\frac65$ and $\\frac{84}{25}$ respectively. The $\\frac\\beta\\alpha$ is equal to:",
    options: ["2", "$\\frac25$", "$\\frac52$", "$\\frac12$"],
  },
  17: {
    question: "Question 17: Consider a triangle ABC where A(1,3,2), B(-2,8,0) and C(3,6,7). If the angle bisector of angle BAC meets the line BC at D, then the length of the projection of vector AD on vector AC is:",
    options: ["$\\frac{37}{2\\sqrt{38}}$", "$\\frac{\\sqrt{38}}2$", "$\\frac{39}{2\\sqrt{38}}$", "$\\sqrt{19}$"],
  },
  20: {
    question: "Question 20: Let Ajay will not appear in JEE exam with probability $p=\\frac27$, while both Ajay and Vijay will appear in the exam with probability $q=\\frac15$. Then the probability that Ajay will appear in the exam and Vijay will not appear is:",
    options: ["$\\frac9{35}$", "$\\frac{18}{35}$", "$\\frac{24}{35}$", "$\\frac3{35}$"],
  },
  30: {
    question: "Question 30: Let $\\vec a=\\hat i+\\hat j+\\hat k$, $\\vec b=-\\hat i-8\\hat j+2\\hat k$ and $\\vec c=4\\hat i+c_2\\hat j+c_3\\hat k$ be three vectors such that $\\vec b\\times\\vec a=\\vec c\\times\\vec a$. If the angle between vector $\\vec c$ and the vector $3\\hat i+4\\hat j+\\hat k$ is $\\theta$, then the greatest integer less than or equal to $\\tan^2\\theta$ is ______.",
    options: [],
  },
  41: {
    question: "Question 41: A galvanometer G of 2 Ohm resistance is connected in the given circuit. The ratio of charge stored in $C_1$ and $C_2$ is:",
    options: ["$\\frac23$", "$\\frac32$", "1", "$\\frac12$"],
  },
  43: {
    question: "Question 43: In an ammeter, 5% of the main current passes through the galvanometer. If resistance of the galvanometer is G, the resistance of ammeter will be:",
    options: ["$\\frac G{20}$", "$\\frac G{199}$", "199G", "200G"],
  },
  72: {
    question: "Question 72: In the given reactions identify A and B.",
    options: ["A: 2-Pentyne, B: trans-2-butene", "A: n-Pentane, B: trans-2-butene", "A: 2-Pentyne, B: cis-2-butene", "A: n-Pentane, B: cis-2-butene"],
  },
  79: {
    question: "Question 79: Acid D formed in the above reaction is:",
    options: ["Gluconic acid", "Succinic acid", "Oxalic acid", "Malonic acid"],
  },
  88: {
    question: "Question 88: The following data were obtained during the first order thermal decomposition of a gas A at constant volume: A(g) -> 2B(g) + C(g). The rate constant of the reaction is ______ x 10^-2 s^-1 (nearest integer).",
    options: [],
  },
};

function normalizeText(value) {
  return String(value || "")
    .replace(/Join the Most Relevant Test Series[\s\S]*?MathonGo/g, " ")
    .replace(/J\s*EE Main 2024 \(01 Feb Shift 2\)\s*JEE Main Previous Year Paper\s*Question Paper\s*MathonGo/g, " ")
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
  let prompt = chunk.replace(new RegExp(`^\\W*Q\\s*\\.?\\s*${sourceNumber}\\.`), "");
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
marks = list(re.finditer(r"(?m)^\\W*Q\\s*\\.?\\s*(\\d+)\\.", body))
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
    const manual = shiftManualText[number];
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
      needs_image: Boolean(shiftVisualCrops[number]),
      image_note: shiftVisualCrops[number]?.note || null,
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
crops = ${JSON.stringify(shiftVisualCrops)}
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
  const objectPath = `jee-main-2024/01feb-shift-2-required/${filename}`;
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
      attempt: "01 Feb",
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
