import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-24-29JAN-S1";
const PDF_PATH = path.join(process.cwd(), "tmp/pdfs/current-jee-main-source.pdf");
const WORK_DIR = path.join(process.cwd(), "tmp/jee-main-2024-29jan-s1-clean-repair");
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
  38: { source: 8, page: 2, box: [200, 250, 740, 625], note: "pressure-volume process graph" },
  41: { source: 11, page: 2, box: [195, 1300, 735, 1740], note: "Maxwell equations matching table" },
  50: { source: 20, page: 3, box: [215, 1910, 775, 2385], note: "Zener diode circuit" },
  59: { source: 29, page: 4, box: [185, 1880, 700, 2365], note: "double slit geometry" },
  70: { source: 40, page: 6, box: [150, 535, 1560, 1405], note: "chlorination product structures" },
  71: { source: 41, page: 6, box: [150, 1510, 1560, 2365], note: "reaction scheme and product options" },
  72: { source: 42, page: 7, box: [190, 285, 1440, 810], note: "arenium ion structures" },
  73: { source: 43, page: 7, box: [160, 915, 1560, 1690], note: "multistep reaction and product options" },
  85: { source: 55, page: 9, box: [205, 190, 1030, 410], note: "ozonolysis reaction scheme" },
};

const manualText = {
  1: {
    question: "Question 1: If $z=\\frac{1}{2}-2i$ is such that $|z+1|=αz+β(1+i)$, where $i=\\sqrt{-1}$ and $α,β\\in R$, then $α+β$ is equal to:",
  },
  2: {
    question: "Question 2: In an A.P., the sixth term $a_6=2$. If $a_1a_4a_5$ is the greatest, then the common difference of the A.P. is equal to:",
    options: ["$\\frac{3}{2}$", "$\\frac{8}{5}$", "$\\frac{2}{3}$", "$\\frac{5}{8}$"],
  },
  4: {
    question: "Question 4: If $α,-\\frac{π}{2}<α<\\frac{π}{2}$, is the solution of $4\\cos θ+5\\sin θ=1$, then the value of $\\tan α$ is:",
    options: ["$\\frac{10-\\sqrt{10}}{6}$", "$\\frac{10-\\sqrt{10}}{12}$", "$\\frac{\\sqrt{10}-10}{12}$", "$\\frac{\\sqrt{10}-10}{6}$"],
  },
  6: {
    question: "Question 6: In a $\\Delta ABC$, suppose $y=x$ is the equation of the bisector of angle B and the equation of side AC is $2x-y=2$. If $2AB=BC$ and the points A and B are respectively $(4,6)$ and $(α,β)$, then $α+2β$ is equal to:",
  },
  7: {
    question: "Question 7: $\\lim_{x\\to π/2}\\left(\\frac{1}{(x-π/2)^2}\\int_{x^3}^{(π/2)^3}\\cos\\left(\\frac{1}{t^3}\\right)dt\\right)$ is equal to:",
    options: ["$\\frac{3π}{8}$", "$\\frac{3π^2}{4}$", "$\\frac{3π^2}{8}$", "$\\frac{3π}{4}$"],
  },
  9: {
    question: "Question 9: Let $A=\\begin{bmatrix}1&0&0\\\\0&α&β\\\\0&β&α\\end{bmatrix}$ and $2A^3=22I$, where $α,β\\in Z$. Then a value of $α$ is:",
  },
  11: {
    question: "Question 11: If $f(x)=\\begin{cases}2+2x,&-1\\le x<0\\\\1-x^3,&0\\le x\\le3\\end{cases}$ and $g(x)=\\begin{cases}-x,&-3\\le x\\le0\\\\x,&0<x\\le1\\end{cases}$, then the range of $(f\\circ g)(x)$ is:",
  },
  14: {
    question: "Question 14: If the value of the integral $\\int_{-π/2}^{π/2}\\left(\\frac{x^2\\cos x}{1+πx}+\\frac{1+\\sin^2x}{1+e^{(\\sin x)^{2023}}}\\right)dx=\\frac{π}{4}(π+a)-2$, then the value of $a$ is:",
    options: ["3", "$-\\frac{3}{2}$", "2", "$\\frac{3}{2}$"],
  },
  15: {
    question: "Question 15: For $x\\in(-π/2,π/2)$, if $y(x)=\\int \\frac{\\cosec x+\\sin x}{\\cosec x(\\sec x+\\tan x)\\sin^2x}\\,dx$ and $\\lim_{x\\to(π/2)^-}y(x)=0$, then $y(π/4)$ is equal to:",
    options: ["$\\tan^{-1}\\left(\\frac{1}{\\sqrt2}\\right)$", "$\\frac12\\tan^{-1}\\left(\\frac{1}{\\sqrt2}\\right)$", "$-\\frac{1}{\\sqrt2}\\tan^{-1}\\left(\\frac{1}{\\sqrt2}\\right)$", "$\\frac{1}{\\sqrt2}\\tan^{-1}\\left(-\\frac12\\right)$"],
  },
  17: {
    question: "Question 17: Let $\\vec a,\\vec b$ and $\\vec c$ be three non-zero vectors such that $\\vec b$ and $\\vec c$ are non-collinear. If $\\vec a+5\\vec b$ is collinear with $\\vec c$, $\\vec b+6\\vec c$ is collinear with $\\vec a$ and $\\vec a+α\\vec b+β\\vec c=0$, then $α+β$ is equal to:",
  },
  18: {
    question: "Question 18: Let O be the origin and the position vectors of A and B be $2\\hat i+2\\hat j+\\hat k$ and $2\\hat i+4\\hat j+4\\hat k$ respectively. If the internal bisector of $\\angle AOB$ meets the line AB at C, then the length of OC is:",
    options: ["$\\frac{2\\sqrt{31}}{3}$", "$\\frac{2\\sqrt{34}}{3}$", "$\\frac{3\\sqrt{34}}{4}$", "$\\frac{3\\sqrt{31}}{2}$"],
  },
  19: {
    question: "Question 19: Let PQR be a triangle with $R(-1,4,2)$. Suppose $M(2,1,2)$ is the midpoint of PQ. The distance of the centroid of $\\Delta PQR$ from the point of intersection of the lines $\\frac{x-2}{0}=\\frac{y}{2}=\\frac{z+3}{-1}$ and $\\frac{x-1}{1}=\\frac{y+3}{-3}=\\frac{z+1}{1}$ is:",
  },
  20: {
    question: "Question 20: A fair die is thrown until 2 appears. Then the probability that 2 appears in an even number of throws is:",
    options: ["$\\frac{5}{6}$", "$\\frac{1}{6}$", "$\\frac{5}{11}$", "$\\frac{6}{11}$"],
  },
  28: {
    question: "Question 28: The area, in sq. units, of the part of the circle $x^2+y^2=169$ which is below the line $5x-y=13$ is $\\frac{πα}{2}-65+\\frac{α\\sin^{-1}(12/13)}{2β}$, where $α,β$ are coprime numbers. Then $α+β$ is equal to ______.",
    options: [],
  },
  29: {
    question: "Question 29: If the solution curve $y=y(x)$ of the differential equation $(1+y^2)(1+\\log_e x)\\,dx+x\\,dy=0$, $x>0$, passes through $(1,1)$ and $y(e)=\\frac{α-\\tan(3/2)}{β+\\tan(3/2)}$, then $α+2β$ is equal to ______.",
    options: [],
  },
  30: {
    question: "Question 30: A line with direction ratios $2,1,2$ meets the lines $x=y+2=z$ and $x+2=2y=2z$ respectively at the points P and Q. If the length of the perpendicular from $(1,2,12)$ to the line PQ is $l$, then $l^2$ is equal to ______.",
    options: [],
  },
  31: {
    question: "Question 31: The resistance $R=\\frac{V}{I}$, where $V=(200\\pm5)\\ V$ and $I=(20\\pm0.2)\\ A$. The percentage error in the measurement of R is:",
    options: ["3.5%", "7%", "3%", "5.5%"],
  },
  36: {
    question: "Question 36: At what distance above and below the surface of the earth will a body have the same weight? Take radius of earth as R.",
    options: ["$\\sqrt5R-R$", "$\\frac{\\sqrt3R-R}{2}$", "$\\frac{R}{2}$", "$\\frac{\\sqrt5R-R}{2}$"],
  },
  38: {
    question: "Question 38: A thermodynamic system is taken from an original state A to an intermediate state B by a linear process as shown in the figure. Its volume is then reduced to the original value from B to C by an isobaric process. The total work done by the gas from A to B and B to C would be:",
    options: ["33800 J", "2200 J", "600 J", "800 J"],
  },
  40: {
    question: "Question 40: Two charges of $5Q$ and $-2Q$ are situated at $(3a,0)$ and $(-5a,0)$ respectively. The electric flux through a sphere of radius $4a$ having centre at origin is:",
    options: ["$\\frac{2Q}{ε_0}$", "$\\frac{5Q}{ε_0}$", "$\\frac{7Q}{ε_0}$", "$\\frac{3Q}{ε_0}$"],
  },
  41: {
    question: "Question 41: Match List I with List II.",
    options: ["A-IV, B-I, C-III, D-II", "A-II, B-III, C-I, D-IV", "A-IV, B-III, C-I, D-II", "A-I, B-II, C-III, D-IV"],
  },
  48: {
    question: "Question 48: The de-Broglie wavelength of an electron is the same as that of a photon. If velocity of electron is 25% of the velocity of light, then the ratio of K.E. of electron and K.E. of photon will be:",
    options: ["$\\frac{1}{1}$", "$\\frac{1}{8}$", "$\\frac{8}{1}$", "$\\frac{1}{4}$"],
  },
  49: {
    question: "Question 49: The explosive in a hydrogen bomb is a mixture of $^2_1H$, $^3_1H$ and $^6_3Li$ in some condensed form. The chain reaction is $^6_3Li+^1_0n\\to{}^4_2He+^3_1H$; $^2_1H+^3_1H\\to{}^4_2He+^1_0n$. During the explosion, the energy released is approximately. Given $M(Li)=6.01690$ amu, $M(^2_1H)=2.01471$ amu, $M(^4_2He)=4.00388$ amu and 1 amu = 931.5 MeV.",
  },
  50: {
    question: "Question 50: In the given circuit, the breakdown voltage of the Zener diode is 3.0 V. What is the value of $I_z$?",
    options: ["3.3 mA", "5.5 mA", "10 mA", "7 mA"],
  },
  55: {
    question: "Question 55: An electron is moving under the influence of the electric field of a uniformly charged infinite plane sheet S having surface charge density $+σ$. The electron at $t=0$ is at a distance of 1 m from S and has a speed of $1\\ m\\ s^{-1}$. The maximum value of $σ$, if the electron strikes S at $t=1$ s, is $α\\left[\\frac{mε_0}{e}\\right]\\frac{C}{m^2}$. The value of $α$ is ______.",
    options: [],
  },
  56: {
    question: "Question 56: A 16 Ω wire is bent to form a square loop. A 9 V battery with internal resistance 1 Ω is connected across one of its sides. If a 4 μF capacitor is connected across one of its diagonals, the energy stored by the capacitor will be $\\frac{x}{2}\\ μJ$, where $x$ is ______.",
    options: [],
  },
  57: {
    question: "Question 57: The magnetic potential due to a magnetic dipole at a point on its axis situated at a distance of 20 cm from its center is $1.5\\times10^{-5}\\ T\\ m$. The magnetic moment of the dipole is ______ $A\\ m^2$. Given $\\frac{μ_0}{4π}=10^{-7}\\ T\\ m\\ A^{-1}$.",
    options: [],
  },
  59: {
    question: "Question 59: In a double slit experiment shown in figure, when light of wavelength 400 nm is used, dark fringe is observed at P. If $D=0.2\\ m$, the minimum distance between the slits $S_1$ and $S_2$ is $α\\ mm$. Write the value of $10α$ to the nearest integer.",
    options: [],
  },
  60: {
    question: "Question 60: When a hydrogen atom going from $n=2$ to $n=1$ emits a photon, its recoil speed is $\\frac{x}{5}\\ m\\ s^{-1}$. The value of $x$ is ______. Use: mass of hydrogen atom = $1.6\\times10^{-27}$ kg, charge of electron $e=1.6\\times10^{-19}$ C.",
    options: [],
  },
  70: {
    question: "Question 70: Identify product A and product B.",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  71: {
    question: "Question 71: The major product (P) in the following reaction is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  72: {
    question: "Question 72: The arenium ion which is not involved in the bromination of aniline is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  73: {
    question: "Question 73: The final product A formed in the following multistep reaction sequence is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  85: {
    question: "Question 85: Consider the given reaction. The total number of oxygen atoms present per molecule of the product (P) is ______.",
    options: [],
  },
  86: {
    question: "Question 86: A solution of $H_2SO_4$ is 31.4% $H_2SO_4$ by mass and has a density of 1.25 g/mL. The molarity of the $H_2SO_4$ solution is M, nearest integer. Given molar mass of $H_2SO_4=98\\ g\\ mol^{-1}$.",
    options: [],
  },
  87: {
    question: "Question 87: The osmotic pressure of a dilute solution is $7\\times10^5$ Pa at 273 K. Osmotic pressure of the same solution at 283 K is ______ $\\times10^4\\ Nm^{-2}$, nearest integer.",
    options: [],
  },
  88: {
    question: "Question 88: The mass of zinc produced by the electrolysis of zinc sulphate solution with a steady current of 0.015 A for 15 minutes is ______ $\\times10^{-4}$ g. Atomic mass of zinc = 65.4 amu.",
    options: [],
  },
  89: {
    question: "Question 89: For a reaction taking place in three steps at the same temperature, overall rate constant $K=\\frac{K_1K_2}{K_3}$. If $Ea_1$, $Ea_2$ and $Ea_3$ are 40, 50 and 60 kJ/mol respectively, the overall $Ea$ is ______ kJ/mol.",
    options: [],
  },
  90: {
    question: "Question 90: From the compounds given below, the number of compounds which give positive Fehling's test is ______: benzaldehyde, acetaldehyde, acetone, acetophenone, methanal, 4-nitrobenzaldehyde, cyclohexane carbaldehyde.",
    options: [],
  },
};

function normalizeText(value) {
  return String(value || "")
    .replace(/Join the Most Relevant Test Series[\s\S]*?MathonGo/g, " ")
    .replace(/J\s*EE Main 2024 \(29 Jan Shift 1\)\s*JEE Main Previous Year Paper\s*Question Paper\s*MathonGo/g, " ")
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
  const objectPath = `jee-main-2024/29jan-shift-1-required/${filename}`;
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
    typeCounts: {
      MCQ: verified.filter((row) => row.question_type === "MCQ").length,
      NUMERICAL: verified.filter((row) => row.question_type === "NUMERICAL").length,
    },
    sampleRows: verified.filter((row) => [1, 31, 38, 41, 50, 70, 85, 90].includes(row.question_number)),
  };
  await fs.writeFile(path.join(WORK_DIR, "publish-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
