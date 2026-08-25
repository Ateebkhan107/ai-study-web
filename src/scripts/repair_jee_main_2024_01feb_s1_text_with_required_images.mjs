import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-24-01FEB-S1";
const PDF_PATH = path.join(process.cwd(), "tmp/pdfs/source-c.pdf");
const WORK_DIR = path.join(process.cwd(), "tmp/jee-main-2024-01feb-s1-clean-repair");
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
  34: { source: 4, page: 1, box: [190, 1235, 760, 1660], note: "block and trolley system" },
  42: { source: 12, page: 2, box: [220, 1495, 835, 1780], note: "ideal voltmeter circuit" },
  61: { source: 31, page: 5, box: [170, 225, 1290, 785], note: "de Broglie wavelength graph options" },
  72: { source: 42, page: 6, box: [180, 1880, 1430, 2465], note: "electrophilic attack structure options" },
  77: { source: 47, page: 7, box: [200, 1605, 1560, 2115], note: "organic reaction sequence and product options" },
};

const shiftManualText = {
  7: {
    question: "Question 7: Let $\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1$, $a>b$, be an ellipse, whose eccentricity is $\\frac1{\\sqrt2}$ and the length of the latus rectum is $\\sqrt{14}$. Then the square of the eccentricity of $\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$ is:",
    options: ["3", "$\\frac72$", "$\\frac32$", "$\\frac52$"],
  },
  8: {
    question: "Question 8: For $0<\\theta<\\frac\\pi2$, if the eccentricity of the hyperbola $x^2-y^2\\cosec^2\\theta=5$ is $\\sqrt7$ times eccentricity of the ellipse $x^2\\cosec^2\\theta+y^2=5$, then the value of $\\theta$ is:",
    options: ["$\\frac\\pi6$", "$\\frac{5\\pi}{12}$", "$\\frac\\pi3$", "$\\frac\\pi4$"],
  },
  17: {
    question: "Question 17: Let $y=y(x)$ be the solution of the differential equation $\\frac{dy}{dx}=2x(x+y^3)-x(x+y-1)$, $y(0)=1$. Then $\\frac1{\\sqrt2}+y(\\frac1{\\sqrt2})^2$ equals:",
    options: ["$\\frac4{4+\\sqrt e}$", "$\\frac3{3-\\sqrt e}$", "$\\frac2{1+\\sqrt e}$", "$\\frac1{2-\\sqrt e}$"],
  },
  20: {
    question: "Question 20: A bag contains 8 balls, whose colours are either white or black. 4 balls are drawn at random without replacement and it was found that 2 balls are white and other 2 balls are black. The probability that the bag contains equal number of white and black balls is:",
    options: ["$\\frac25$", "$\\frac27$", "$\\frac17$", "$\\frac15$"],
  },
  30: {
    question: "Question 30: Let the line of the shortest distance between the lines $L_1:\\vec r=\\hat i+2\\hat j+3\\hat k+\\lambda(\\hat i-\\hat j+\\hat k)$ and $L_2:\\vec r=4\\hat i+5\\hat j+6\\hat k+\\mu(\\hat i+\\hat j-\\hat k)$ intersect $L_1$ and $L_2$ at P and Q respectively. If $\\alpha,\\beta,\\gamma$ is the midpoint of the line segment PQ, then $2\\alpha+\\beta+\\gamma$ is equal to ______.",
    options: [],
  },
  33: {
    question: "Question 33: A particle moving in a circle of radius R with uniform speed takes time T to complete one revolution. If this particle is projected with the same speed at an angle $\\theta$ to the horizontal, the maximum height attained by it is equal to 4R. The angle of projection $\\theta$ is then given by:",
    options: ["$\\sin^{-1}\\left(\\frac{2gT^2}{\\pi^2R}\\right)^{1/2}$", "$\\sin^{-1}\\left(\\frac{\\pi^2R}{2gT^2}\\right)^{1/2}$", "$\\cos^{-1}\\left(\\frac{2gT^2}{\\pi^2R}\\right)^{1/2}$", "$\\cos^{-1}\\left(\\frac{\\pi R}{2gT^2}\\right)^{1/2}$"],
  },
  50: {
    question: "Question 50: 10 divisions on the main scale of a Vernier calliper coincide with 11 divisions on the Vernier scale. If each division on the main scale is of 5 units, the least count of the instrument is:",
    options: ["$\\frac5{11}$", "$\\frac{50}{11}$", "$\\frac1{11}$", "$\\frac{11}{50}$"],
  },
  61: {
    question: "Question 61: According to the wave-particle duality of matter by de-Broglie, which of the following graph plot presents most appropriate relationship between wavelength of matter wave and momentum?",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  72: {
    question: "Question 72: Which of the following compound will most easily be attacked by an electrophile?",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  77: {
    question: "Question 77: Identify A and B in the following sequence of reaction.",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
};

function normalizeText(value) {
  return String(value || "")
    .replace(/Join the Most Relevant Test Series[\s\S]*?MathonGo/g, " ")
    .replace(/J\s*EE Main 2024 \(01 Feb Shift 1\)\s*JEE Main Previous Year Paper\s*Question Paper\s*MathonGo/g, " ")
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
  const objectPath = `jee-main-2024/01feb-shift-1-required/${filename}`;
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
