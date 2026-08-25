import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const PAPER_CODE = "JEE-MAIN-24-30JAN-S1";
const PDF_PATH = path.join(process.cwd(), "tmp/pdfs/current-jee-main-source.pdf");
const WORK_DIR = path.join(process.cwd(), "tmp/jee-main-2024-30jan-s1-clean-repair");
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
  9: { source: 69, page: 11, box: [185, 1880, 1065, 1995], note: "frequency distribution table" },
  31: { source: 1, page: 1, box: [175, 255, 1050, 620], note: "dimension matching table" },
  33: { source: 3, page: 1, box: [175, 1080, 710, 1520], note: "pulley block system" },
  34: { source: 4, page: 1, box: [150, 1650, 780, 1910], note: "frictionless track" },
  39: { source: 9, page: 2, box: [170, 1015, 735, 1515], note: "log P-log V process graph" },
  41: { source: 11, page: 2, box: [165, 1965, 1020, 2285], note: "potential divider circuit" },
  43: { source: 13, page: 3, box: [160, 585, 660, 1065], note: "perpendicular circular loops" },
  45: { source: 15, page: 3, box: [170, 1680, 930, 2035], note: "transformer circuit" },
  50: { source: 20, page: 4, box: [170, 820, 755, 1220], note: "Zener diode regulator" },
  52: { source: 22, page: 4, box: [170, 1740, 765, 2140], note: "rotating disc diagram" },
  53: { source: 23, page: 5, box: [160, 195, 690, 530], note: "three-block wire system" },
  56: { source: 26, page: 5, box: [170, 850, 745, 1120], note: "opposing cells circuit" },
  63: { source: 33, page: 6, box: [165, 610, 1060, 1015], note: "molecule shape matching table" },
  64: { source: 34, page: 6, box: [170, 1010, 1570, 1445], note: "4-methylpent-2-enal structure options" },
  65: { source: 35, page: 6, box: [170, 1415, 1510, 1875], note: "vinylic halide structure options" },
  67: { source: 37, page: 7, box: [170, 410, 1345, 820], note: "stability structure options" },
  68: { source: 38, page: 7, box: [175, 870, 1500, 1225], note: "alkyne reaction scheme" },
  69: { source: 39, page: 7, box: [170, 1305, 1535, 1700], note: "oxidation reaction scheme" },
  72: { source: 42, page: 8, box: [160, 180, 1120, 770], note: "species electronic distribution table" },
  75: { source: 45, page: 8, box: [170, 1420, 1100, 1685], note: "Rosenmund reduction scheme" },
  76: {
    source: 46,
    parts: [
      { page: 8, box: [170, 1910, 1320, 2250] },
      { page: 9, box: [170, 230, 1280, 1040] },
    ],
    note: "aromatic amine confirmatory test options",
  },
  77: { source: 47, page: 9, box: [160, 1010, 1480, 1735], note: "multistep product options" },
  84: { source: 54, page: 10, box: [170, 650, 730, 980], note: "cyclic PV diagram" },
};

const manualText = {
  1: {
    question: "Question 1: If $z=x+iy$, $xy\\ne0$, satisfies the equation $z^2+i\\bar z=0$, then $|z^2|$ is equal to:",
    options: ["9", "1", "4", "$\\frac14$"],
  },
  3: {
    question: "Question 3: If $2\\sin^3x+\\sin2x\\cos x+4\\sin x-4=0$ has exactly 3 solutions in the interval $[0,\\frac{n\\pi}{2}]$, $n\\in\\mathbb N$, then the roots of the equation $x^2+nx+(n-3)=0$ belong to:",
    options: ["$(0,\\infty)$", "$(-\\infty,0)$", "$(-\\frac{\\sqrt{17}}2,\\frac{\\sqrt{17}}2)$", "$\\mathbb Z$"],
  },
  5: {
    question: "Question 5: If the circles $(x+1)^2+(y+2)^2=r^2$ and $x^2+y^2-4x-4y+4=0$ intersect at exactly two distinct points, then:",
    options: ["$5<r<9$", "$0<r<7$", "$3<r<7$", "$\\frac12<r<7$"],
  },
  9: {
    question: "Question 9: Let M denote the median of the following frequency distribution. Then 20M is equal to:",
    options: ["416", "104", "52", "208"],
  },
  10: {
    question: "Question 10: If $f(x)=\\begin{vmatrix}2\\cos^4x&2\\sin^4x&3+\\sin^22x\\\\3+2\\cos^4x&2\\sin^4x&\\sin^22x\\\\2\\cos^4x&3+2\\sin^4x&\\sin^22x\\end{vmatrix}$, then $\\frac15 f'(0)$ is equal to:",
    options: ["0", "1", "2", "6"],
  },
  14: {
    question: "Question 14: The value of $\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\frac{n^3}{(n^2+k^2)(n^2+3k^2)}$ is:",
    options: ["$\\frac{(2\\sqrt3+3)\\pi}{24}$", "$\\frac{13\\pi}{8(4\\sqrt3+3)}$", "$\\frac{13(2\\sqrt3-3)\\pi}{8}$", "$\\frac{\\pi}{8(2\\sqrt3+3)}$"],
  },
  7: {
    question: "Question 7: If the length of the minor axis of an ellipse is equal to half of the distance between the foci, then the eccentricity of the ellipse is:",
    options: ["$\\frac{\\sqrt5}{3}$", "$\\frac{\\sqrt3}{2}$", "$\\frac1{\\sqrt3}$", "$\\frac2{\\sqrt5}$"],
  },
  11: {
    question: "Question 11: Consider the system of linear equations $x+y+z=4\\mu$, $x+2y+2\\lambda z=10\\mu$, $x+3y+4\\lambda^2z=\\mu^2+15$, where $\\lambda,\\mu\\in\\mathbb R$. Which one of the following statements is NOT correct?",
    options: ["The system has unique solution if $\\lambda\\ne\\frac12$ and $\\mu\\ne1,15$", "The system is inconsistent if $\\lambda=\\frac12$ and $\\mu\\ne1$", "The system has infinite number of solutions if $\\lambda=\\frac12$ and $\\mu=15$", "The system is consistent if $\\lambda\\ne\\frac12$"],
  },
  13: {
    question: "Question 13: Let $g:\\mathbb R\\to\\mathbb R$ be a non-constant twice differentiable function such that $g'(\\frac12)=g'(\\frac32)$. If a real-valued function f is defined as $f(x)=\\frac12[g(x)+g(2-x)]$, then:",
    options: ["$f''(x)=0$ for at least two x in $(0,2)$", "$f''(x)=0$ for exactly one x in $(0,1)$", "$f''(x)=0$ for no x in $(0,1)$", "$f'(\\frac32)+f'(\\frac12)=1$"],
  },
  16: {
    question: "Question 16: Let $y=y(x)$ be the solution of the differential equation $\\sec x\\,dy+\\{2(1-x)\\tan x+x(2-x)\\}\\,dx=0$ such that $y(0)=2$. Then $y(2)$ is equal to:",
    options: ["2", "$2\\{1-\\sin(2)\\}$", "$2\\{\\sin(2)+1\\}$", "1"],
  },
  17: {
    question: "Question 17: Let $A(2,3,5)$ and $C(-3,4,-2)$ be opposite vertices of a parallelogram ABCD. If the diagonal $\\overrightarrow{BD}=\\hat i+2\\hat j+3\\hat k$, then the area of the parallelogram is equal to:",
    options: ["$\\frac12\\sqrt{410}$", "$\\frac12\\sqrt{474}$", "$\\frac12\\sqrt{586}$", "$\\frac12\\sqrt{306}$"],
  },
  18: {
    question: "Question 18: Let $\\vec a=a_1\\hat i+a_2\\hat j+a_3\\hat k$ and $\\vec b=b_1\\hat i+b_2\\hat j+b_3\\hat k$ be two vectors such that $|\\vec a|=1$, $\\vec a\\cdot\\vec b=2$ and $|\\vec b|=4$. If $\\vec c=2(\\vec a\\times\\vec b)-3\\vec b$, then the angle between $\\vec b$ and $\\vec c$ is equal to:",
    options: ["$\\cos^{-1}(\\frac2{\\sqrt3})$", "$\\cos^{-1}(-\\frac1{\\sqrt3})$", "$\\cos^{-1}(-\\frac{\\sqrt3}{2})$", "$\\cos^{-1}(\\frac23)$"],
  },
  20: {
    question: "Question 20: Two integers x and y are chosen with replacement from the set $\\{0,1,2,3,\\ldots,10\\}$. Then the probability that $|x-y|>5$ is:",
    options: ["$\\frac{30}{121}$", "$\\frac{62}{121}$", "$\\frac{60}{121}$", "$\\frac{31}{121}$"],
  },
  21: {
    question: "Question 21: Let $\\alpha,\\beta\\in\\mathbb R$ be roots of the equation $x^2-70x+\\lambda=0$, where $\\frac\\lambda2,\\frac\\lambda3\\notin\\mathbb Z$. If $\\lambda$ assumes the minimum possible value, then $\\frac{(\\sqrt{\\alpha-1}+\\sqrt{\\beta-1})(\\lambda+35)}{|\\alpha-\\beta|}$ is equal to ______.",
    options: [],
  },
  28: {
    question: "Question 28: The value $9\\int_0^9\\left\\lfloor\\sqrt{\\frac{10x}{x+1}}\\right\\rfloor dx$, where $\\lfloor t\\rfloor$ denotes the greatest integer less than or equal to t, is ______.",
    options: [],
  },
  29: {
    question: "Question 29: Let $y=y(x)$ be the solution of the differential equation $(1-x^2)dy=[xy+(x^3+2)\\sqrt{3(1-x^2)}]dx$, $-1<x<1$, $y(0)=0$. If $y(\\frac12)=\\frac{m}{n}$, where m and n are coprime numbers, then $m+n$ is equal to ______.",
    options: [],
  },
  30: {
    question: "Question 30: If $d_1$ is the shortest distance between the lines $x+1=2y=-12z$, $x=y+2=6z-6$ and $d_2$ is the shortest distance between the lines $\\frac{x-1}{2}=\\frac{y+8}{-7}=\\frac{z-4}{5}$, $\\frac{x-1}{2}=\\frac{y-2}{1}=\\frac{z-6}{-3}$, then the value of $\\frac{32\\sqrt3d_1}{d_2}$ is ______.",
    options: [],
  },
  31: {
    question: "Question 31: Match List-I with List-II.",
    options: ["A-II, B-I, C-IV, D-III", "A-I, B-II, C-III, D-IV", "A-III, B-IV, C-II, D-I", "A-IV, B-III, C-II, D-I"],
  },
  32: {
    question: "Question 32: A particle of mass m projected with velocity u making an angle of 30° with the horizontal. The magnitude of angular momentum of the projectile about the point of projection when the particle is at its maximum height h is:",
    options: ["$\\frac{\\sqrt3mu^3}{16g}$", "$\\frac{\\sqrt3mu^2}{2g}$", "$\\frac{mu^3}{\\sqrt{2g}}$", "zero"],
  },
  33: {
    question: "Question 33: All surfaces shown in figure are assumed to be frictionless and the pulleys and the string are light. The acceleration of the block of mass 2 kg is:",
    options: ["g", "$\\frac{g}{3}$", "$\\frac{g}{2}$", "$\\frac{g}{4}$"],
  },
  34: {
    question: "Question 34: A particle is placed at the point A of a frictionless track ABC as shown in figure. It is gently pushed towards right. The speed of the particle when it reaches the point B is: Take $g=10\\ m\\ s^{-2}$.",
    options: ["20 m s^-1", "$\\sqrt{10}$ m s^-1", "$2\\sqrt{10}$ m s^-1", "10 m s^-1"],
  },
  35: {
    question: "Question 35: A spherical body of mass 100 g is dropped from a height of 10 m from the ground. After hitting the ground, the body rebounds to a height of 5 m. The impulse of force imparted by the ground to the body is given by: (given $g=9.8\\ m\\ s^{-2}$)",
    options: ["$4.32\\ kg\\ m\\ s^{-1}$", "$43.2\\ kg\\ m\\ s^{-1}$", "$23.9\\ kg\\ m\\ s^{-1}$", "$2.39\\ kg\\ m\\ s^{-1}$"],
  },
  39: {
    question: "Question 39: Two thermodynamical processes are shown in the figure. The molar heat capacities for processes A and B are $C_A$ and $C_B$. The molar heat capacities at constant pressure and constant volume are represented by $C_P$ and $C_V$ respectively. Choose the correct statement.",
    options: ["$C_P>C_B>C_V$", "$C_A=0$ and $C_B=∞$", "$C_P>C_V>C_A=C_B$", "$C_A>C_P>C_V$"],
  },
  40: {
    question: "Question 40: The electrostatic potential due to an electric dipole at a distance r varies as:",
    options: ["r", "$\\frac{1}{r^2}$", "$\\frac{1}{r^3}$", "$\\frac{1}{r}$"],
  },
  41: {
    question: "Question 41: A potential divider circuit is shown in figure. The output voltage $V_0$ is:",
    options: ["4 V", "2 mV", "0.5 V", "12 mV"],
  },
  42: {
    question: "Question 42: An electric toaster has resistance 60 Ω at room temperature (27 °C). The toaster is connected to a 220 V supply. If the current flowing through it reaches 2.75 A, the temperature attained by toaster is around: if $α=2\\times10^{-4}\\ ^\\circ C^{-1}$.",
    options: ["694 °C", "1235 °C", "1694 °C", "1667 °C"],
  },
  43: {
    question: "Question 43: Two insulated circular loops A and B of radius a carry a current I in the anti-clockwise direction as shown in figure. The magnitude of magnetic induction at the centre will be:",
    options: ["$\\frac{\\sqrt2 μ_0I}{a}$", "$\\frac{μ_0I}{2a}$", "$\\frac{μ_0I}{\\sqrt2a}$", "$\\frac{2μ_0I}{a}$"],
  },
  44: {
    question: "Question 44: A series LR circuit connected with an ac source $E=(25\\sin1000t)\\ V$ has a power factor of $\\frac1{\\sqrt2}$. If the source emf is changed to $E=(20\\sin2000t)\\ V$, the new power factor of the circuit will be:",
    options: ["$\\frac1{\\sqrt2}$", "$\\frac1{\\sqrt3}$", "$\\frac1{\\sqrt5}$", "$\\frac1{\\sqrt7}$"],
  },
  45: {
    question: "Question 45: Primary coil of a transformer is connected to 220 V AC. Primary and secondary turns of the transformer are 100 and 10 respectively. Secondary coil of transformer is connected to two series resistances as shown in figure. The output voltage $V_0$ is:",
    options: ["7 V", "15 V", "44 V", "22 V"],
  },
  47: {
    question: "Question 47: The diffraction pattern of light of wavelength 400 nm diffracting from a slit of width 0.2 mm is focused on the focal plane of a convex lens of focal length 100 cm. The width of the 1st secondary maxima will be:",
    options: ["2 mm", "2 cm", "0.02 mm", "0.2 mm"],
  },
  49: {
    question: "Question 49: The ratio of the magnitude of the kinetic energy to the potential energy of an electron in the 5th excited state of a hydrogen atom is:",
    options: ["4", "$\\frac14$", "$\\frac12$", "1"],
  },
  50: {
    question: "Question 50: A Zener diode of breakdown voltage 10 V is used as a voltage regulator as shown in the figure. The current through the Zener diode is:",
    options: ["50 mA", "0", "30 mA", "20 mA"],
  },
  52: {
    question: "Question 52: Consider a disc of mass 5 kg, radius 2 m, rotating with angular velocity 10 rad s^-1 about an axis perpendicular to the plane of rotation. An identical disc is kept gently over the rotating disc along the same axis. The energy dissipated so that both the discs continue to rotate together without slipping is ______ J.",
    options: [],
  },
  53: {
    question: "Question 53: Each of three blocks P, Q and R shown in figure has a mass of 3 kg. Each of the wires A and B has cross-sectional area 0.005 cm^2 and Young's modulus $2\\times10^{11}\\ N\\ m^{-2}$. Neglecting friction, the longitudinal strain on wire B is ______ $\\times10^{-4}$. Take $g=10\\ m\\ s^{-2}$.",
    options: [],
  },
  56: {
    question: "Question 56: Two cells are connected in opposition as shown. Cell $E_1$ is of 8 V emf and 2 Ω internal resistance; cell $E_2$ is of 2 V emf and 4 Ω internal resistance. The terminal potential difference of cell $E_2$ is ______ V.",
    options: [],
  },
  61: {
    question: "Question 61: Given below are two statements. Statement-I: The orbitals having same energy are called degenerate orbitals. Statement-II: In hydrogen atom, 3p and 3d orbitals are not degenerate orbitals. Choose the most appropriate answer from the options given below.",
    options: ["Statement-I is true but Statement-II is false", "Both Statement-I and Statement-II are true", "Both Statement-I and Statement-II are false", "Statement-I is false but Statement-II is true"],
  },
  63: {
    question: "Question 63: Match List-I with List-II.",
    options: ["(A)-I, (B)-II, (C)-IV, (D)-III", "(A)-II, (B)-I, (C)-III, (D)-IV", "(A)-III, (B)-IV, (C)-I, (D)-II", "(A)-IV, (B)-III, (C)-I, (D)-II"],
  },
  64: {
    question: "Question 64: Structure of 4-methylpent-2-enal is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  65: {
    question: "Question 65: Example of vinylic halide is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  67: {
    question: "Question 67: Which of the following molecule/species is most stable?",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  68: {
    question: "Question 68: Compound A formed in the following reaction reacts with B to give the product C. Find out A and B.",
    options: ["A = CH3-C≡C^- Na^+, B = CH3-CH2-CH2-Br", "A = CH3-CH=CH2, B = CH3-CH2-CH2-Br", "A = CH3-CH2-CH3, B = CH3-C≡CH", "A = CH3-C≡C^- Na^+, B = CH3-CH2-CH3"],
  },
  69: {
    question: "Question 69: In the given reactions identify reagent A and reagent B.",
    options: ["A = CrO3, B = CrO3", "A = CrO3, B = CrO2Cl2", "A = CrO2Cl2, B = CrO2Cl2", "A = CrO2Cl2, B = CrO3"],
  },
  72: {
    question: "Question 72: Match List-I with List-II.",
    options: ["(A)-I, (B)-II, (C)-III, (D)-IV", "(A)-III, (B)-IV, (C)-I, (D)-II", "(A)-IV, (B)-III, (C)-I, (D)-II", "(A)-II, (B)-I, (C)-IV, (D)-III"],
  },
  75: {
    question: "Question 75: This reduction reaction is known as:",
    options: ["Rosenmund reduction", "Wolff-Kishner reduction", "Stephen reduction", "Etard reduction"],
  },
  76: {
    question: "Question 76: Following is a confirmatory test for aromatic primary amines. Identify reagent (A) and (B).",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  77: {
    question: "Question 77: The final product A, formed in the following multistep reaction sequence, is:",
    options: ["See figure option 1", "See figure option 2", "See figure option 3", "See figure option 4"],
  },
  84: {
    question: "Question 84: An ideal gas undergoes a cyclic transformation starting from point A and coming back to the same point by tracing the path A -> B -> C -> A as shown in the diagram. The total work done in the process is ______ J.",
    options: [],
  },
};

function normalizeText(value) {
  return String(value || "")
    .replace(/Join the Most Relevant Test Series[\s\S]*?MathonGo/g, " ")
    .replace(/J\s*EE Main 2024 \(30 Jan Shift 1\)\s*JEE Main Previous Year Paper\s*Question Paper\s*MathonGo/g, " ")
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
  const objectPath = `jee-main-2024/30jan-shift-1-required/${filename}`;
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
      attempt: "30 Jan",
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
