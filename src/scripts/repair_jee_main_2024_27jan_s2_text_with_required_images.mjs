import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-24-27JAN-S2";
const PDF_PATH = path.join(process.cwd(), "tmp/pdfs/current-jee-main-source.pdf");
const WORK_DIR = path.join(process.cwd(), "tmp/jee-main-2024-27jan-s2-clean-repair");
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
  43: { source: 13, page: 3, box: [170, 175, 720, 435], note: "voltmeter circuit" },
  49: {
    source: 19,
    parts: [
      { page: 3, box: [155, 1780, 930, 2215] },
      { page: 4, box: [155, 175, 1345, 610] },
    ],
    note: "logic gate circuit and truth tables",
  },
  57: { source: 27, page: 5, box: [150, 205, 680, 520], note: "semicircular wire loop" },
  63: { source: 33, page: 5, box: [170, 1415, 1500, 1955], note: "bond-line formula options" },
  64: { source: 34, page: 6, box: [170, 165, 930, 640], note: "resonance contributing structures" },
  67: { source: 37, page: 6, box: [170, 1265, 1510, 1930], note: "reaction sequence and product options" },
  75: { source: 45, page: 7, box: [175, 1810, 1450, 2065], note: "halide structure options" },
  76: { source: 46, page: 8, box: [150, 175, 1460, 680], note: "amine product structure options" },
  78: { source: 48, page: 8, box: [170, 810, 1495, 1835], note: "reaction matching table" },
  79: {
    source: 49,
    parts: [
      { page: 8, box: [170, 1855, 1030, 2165] },
      { page: 9, box: [170, 175, 1500, 665] },
    ],
    note: "ether reaction scheme and product options",
  },
  87: { source: 57, page: 9, box: [170, 1600, 930, 2325], note: "chiral carbon compound list" },
};

const manualText = {
  1: {
    question: "Question 1: If α, β are the roots of the equation $x^2-x-1=0$ and $S_n=2023α^n+2024β^n$, then:",
    options: ["$2S_{12}=S_{11}+S_{10}$", "$S_{12}=S_{11}+S_{10}$", "$2S_{11}=S_{12}+S_{10}$", "$S_{11}=S_{10}+S_{12}$"],
  },
  2: {
    question: "Question 2: Let $α=\\frac{(4!)!}{(4!)^{3!}}$ and $β=\\frac{(5!)!}{(5!)^{4!}}$. Then:",
    options: ["$α∈N$ and $β∉N$", "$α∉N$ and $β∈N$", "$α∈N$ and $β∈N$", "$α∉N$ and $β∉N$"],
  },
  4: {
    question: "Question 4: If $2\\tan^2θ-5\\sec θ=1$ has exactly 7 solutions in the interval $(0,nπ/2)$, for the least value of $n∈N$, then $\\sum_{k=1}^{n} k/2^k$ is equal to:",
    options: ["$(1/2^{15})2^{14}-14$", "$(1/2^{14})2^{15}-15$", "$1-15/2^{13}$", "$(1/2^{13})2^{14}-15$"],
  },
  7: {
    question: "Question 7: Let $e_1$ be the eccentricity of the hyperbola $x^2/16-y^2/9=1$ and $e_2$ be the eccentricity of the ellipse $x^2/a^2+y^2/b^2=1$, $a>b$, which passes through the foci of the hyperbola. If $e_1e_2=1$, then the length of the chord of the ellipse parallel to the x-axis and passing through $(0,2)$ is:",
    options: ["$4\\sqrt5$", "$8\\sqrt5/3$", "$10\\sqrt5/3$", "$3\\sqrt5$"],
  },
  11: {
    question: "Question 11: Let $f: R-\\{-1/2\\}\\to R$ and $g: R-\\{-5/2\\}\\to R$ be defined as $f(x)=\\frac{2x+3}{2x+1}$ and $g(x)=\\frac{|x|+1}{2x+5}$. Then the domain of the function $f\\circ g$ is:",
    options: ["$R-\\{-5/2\\}$", "$R$", "$R-\\{-7/4\\}$", "$R-\\{-5/2,-7/4\\}$"],
  },
  12: {
    question: "Question 12: Consider the function $f:(0,2)\\to R$ defined by $f(x)=x/2+2/x$ and the function $g(x)$ defined by $g(x)=\\min\\{f(t)\\}, 0<t\\le x, 0<x\\le1$ and $g(x)=3/2+x, 1<x<2$. Then:",
    options: ["g is continuous but not differentiable at x = 1", "g is not continuous for all x ∈ (0, 2)", "g is neither continuous nor differentiable at x = 1", "g is continuous and differentiable for all x ∈ (0, 2)"],
  },
  14: {
    question: "Question 14: The integral $\\int \\frac{x^8-x^2}{x^{12}+3x^6+1}\\,dx$ is equal to:",
    options: ["$\\frac{1}{3}\\log_e\\left(\\tan^{-1}x^3+\\frac{1}{x^3}\\right)^3+C$", "$\\frac{1}{2}\\log_e\\left(\\tan^{-1}x^3+\\frac{1}{x^3}\\right)^2+C$", "$\\log_e\\left(\\tan^{-1}x^3+\\frac{1}{x^3}\\right)+C$", "$\\log_e\\left(\\tan^{-1}x^3+\\frac{1}{x^3}\\right)^3+C$"],
  },
  15: {
    question: "Question 15: For $0<a<1$, the value of the integral $\\int_0^π \\frac{dx}{1-2a\\cos x+a^2}$ is:",
    options: ["$π^2/(π+a^2)$", "$π^2/(π-a^2)$", "$π/(1-a^2)$", "$π/(1+a^2)$"],
  },
  19: {
    question: "Question 19: Let the image of the point $(1,0,7)$ in the line $x/1=(y-1)/2=(z-2)/3$ be the point $(α,β,γ)$. Then which one of the following points lies on the line passing through $(α,β,γ)$ and making angles $2π/3$ and $3π/4$ with y-axis and z-axis respectively and an acute angle with x-axis?",
    options: ["$(1,-2,1+\\sqrt2)$", "$(1,2,1-\\sqrt2)$", "$(3,4,3-2\\sqrt2)$", "$(3,-4,3+2\\sqrt2)$"],
  },
  21: {
    question: "Question 21: Let the complex numbers $α$ and $1/\\bar{α}$ lie on the circles $|z-z_0|^2=4$ and $|z-z_0|^2=16$ respectively, where $z_0=1+i$. Then, the value of $100|α|^2$ is ______.",
    options: [],
  },
  29: {
    question: "Question 29: If the solution curve of the differential equation $dy/dx=(x+y-2)/(x-y)$ passing through the point $(2,1)$ is $\\tan^{-1}\\left(\\frac{y-1}{x-1}\\right)-\\frac{1}{β}\\log_e\\left(α+\\frac{y-1}{x-1}\\right)=\\log_e(x-1)$, then $5β+α^2$ is equal to ______.",
    options: [],
  },
  30: {
    question: "Question 30: The lines $(x-2)/2=y/(-2)=(z-7)/16$ and $(x+3)/4=(y+2)/3=(z+2)/1$ intersect at the point P. If the distance of P from the line $(x+1)/2=(y-1)/3=(z-1)/1$ is $l$, then $14l^2$ is equal to ______.",
    options: [],
  },
  31: {
    question: "Question 31: The equation of state of a real gas is given by $(P+a/V^2)(V-b)=RT$, where P, V and T are pressure, volume and temperature respectively and R is the universal gas constant. The dimensions of $a/b^2$ is similar to that of:",
    options: ["PV", "P", "RT", "R"],
  },
  38: {
    question: "Question 38: During an adiabatic process, the pressure of a gas is found to be proportional to the cube of its absolute temperature. The ratio of $C_p/C_v$ for the gas is:",
    options: ["5/3", "3/2", "7/5", "9/7"],
  },
  41: {
    question: "Question 41: Wheatstone bridge principle is used to measure the specific resistance $S_1$ of given wire, having length L and radius r. If X is the resistance of wire, then specific resistance is $S_1=Xπr^2/L$. If the length of the wire gets doubled then the value of specific resistance will be:",
    options: ["$S_1/4$", "$2S_1$", "$S_1/2$", "$S_1$"],
  },
  43: {
    question: "Question 43: Three voltmeters, all having different internal resistances are joined as shown in figure. When some potential difference is applied across A and B, their readings are $V_1$, $V_2$ and $V_3$. Choose the correct option.",
    options: ["$V_1=V_2$", "$V_1≠V_3-V_2$", "$V_1+V_2>V_3$", "$V_1+V_2=V_3$"],
  },
  49: {
    question: "Question 49: The truth table of the given circuit diagram is:",
    options: ["See truth table option 1", "See truth table option 2", "See truth table option 3", "See truth table option 4"],
  },
  57: {
    question: "Question 57: The magnetic field at the centre of a wire loop formed by two semicircular wires of radii $R_1=2π\\ m$ and $R_2=4π\\ m$ carrying current $I=4\\ A$ as per figure given below is $α×10^{-7}\\ T$. The value of $α$ is ______. (Centre O is common for all segments)",
    options: [],
  },
  63: {
    question: "Question 63: Bond line formula of $HOCH(CN)_2$ is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  64: {
    question: "Question 64: The order of relative stability of the contributing structure is:",
    options: ["I > II > III", "II > I > III", "I = II = III", "III > II > I"],
  },
  67: {
    question: "Question 67: The final product A, formed in the following reaction sequence is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  75: {
    question: "Question 75: Which among the following halide/s will not show SN1 reaction:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  76: {
    question: "Question 76: Identify B formed in the reaction: Cl-CH2-CH2-CH2-CH2-Cl reacts with excess NH3 to form A; A reacts with NaOH to form B + H2O + NaCl.",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  78: {
    question: "Question 78: Match List-I with List-II.",
    options: ["(A)-(IV), (B)-(I), (C)-(III), (D)-(II)", "(A)-(II), (B)-(III), (C)-(I), (D)-(IV)", "(A)-(II), (B)-(I), (C)-(III), (D)-(IV)", "(A)-(IV), (B)-(III), (C)-(I), (D)-(II)"],
  },
  79: {
    question: "Question 79: Major product formed in the reaction of the shown ether with HI is a mixture of:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  85: {
    question: "Question 85: The number of non-polar molecules from the following is ______: HF, H2O, SO2, H2, CO2, CH4, NH3, HCl, CHCl3, BF3.",
    options: [],
  },
  87: {
    question: "Question 87: Total number of compounds with chiral carbon atoms from the following is ______.",
    options: [],
  },
  90: {
    question: "Question 90: The spin-only magnetic moment value of square planar complex $[Pt(NH_3)_2Cl(NH_2CH_3)]Cl$ is ______ B.M. (Nearest integer) (Given atomic number for Pt = 78)",
    options: [],
  },
};

function normalizeText(value) {
  return String(value || "")
    .replace(/Join the Most Relevant Test Series[\s\S]*?MathonGo/g, " ")
    .replace(/J\s*EE Main 2024 \(27 Jan Shift 2\)\s*JEE Main Previous Year Paper\s*Question Paper\s*MathonGo/g, " ")
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
  const objectPath = `jee-main-2024/27jan-shift-2-required/${filename}`;
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
    sampleRows: verified.filter((row) => [1, 31, 43, 63, 79, 87, 90].includes(row.question_number)),
  };
  await fs.writeFile(path.join(WORK_DIR, "publish-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
