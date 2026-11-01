import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import katex from "katex";
import { createClient } from "@supabase/supabase-js";

const PAPER = "JEE-MAIN-22-24JUN-S2";
const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");

const fixes = new Map([
  [11, {
    question: "Potential energy as a function of $r$ is given by\n\n$$U(r)=\\frac{A}{r^{10}}-\\frac{B}{r^5},$$\n\nwhere $r$ is the interatomic distance and $A$ and $B$ are positive constants. The equilibrium distance between the two atoms will be:",
  }],
  [24, {
    question: "Two travelling waves of equal amplitudes and equal frequencies move in opposite directions along a string. They interfere to produce a stationary wave whose equation is\n\n$$y=10\\cos(\\pi x)\\sin\\left(\\frac{2\\pi t}{T}\\right)\\text{ cm}.$$\n\nThe amplitude of the particle at $x=\\frac{4}{3}\\text{ cm}$ will be ______ cm.",
  }],
  [25, {
    question: "In the given circuit, the value of current $I_L$ will be ______ mA when $R_L=1\\,\\mathrm{k}\\Omega$.",
  }],
  [34, {
    question: "At $25^\\circ\\mathrm{C}$ and $1\\,\\mathrm{atm}$ pressure, the enthalpies of combustion are as given below:\n\n| Substance | $\\mathrm{H_2(g)}$ | $\\mathrm{C(graphite)}$ | $\\mathrm{C_2H_6(g)}$ |\n| :--- | :---: | :---: | :---: |\n| $\\Delta_c H^\\circ$ ($\\mathrm{kJ\\,mol^{-1}}$) | $-286.0$ | $-394.0$ | $-1560.0$ |\n\nThe enthalpy of formation of ethane is:",
  }],
  [47, {
    question: "The conversion of propan-1-ol to $n$-butylamine involves the sequential addition of reagents. The correct sequential order of reagents is:",
    option_a: "(i) $\\mathrm{SOCl_2}$ (ii) $\\mathrm{KCN}$ (iii) $\\mathrm{H_2/Ni}$ or $\\mathrm{Na(Hg)/C_2H_5OH}$",
    option_b: "(i) $\\mathrm{HCl}$ (ii) $\\mathrm{H_2/Ni}$ or $\\mathrm{Na(Hg)/C_2H_5OH}$",
    option_c: "(i) $\\mathrm{SOCl_2}$ (ii) $\\mathrm{KCN}$ (iii) $\\mathrm{CH_3NH_2}$",
    option_d: "(i) $\\mathrm{HCl}$ (ii) $\\mathrm{CH_3NH_2}$",
  }],
  [49, {
    question: "The structure shown below is of which well-known drug molecule?",
  }],
  [60, {
    question: "In alanylglycylleucylalanylvaline, the number of peptide linkages is ______.",
  }],
  [61, {
    question: "Let $x*y=x^2+y^3$ and $(x*1)*1=x*(1*1)$. Then a value of\n\n$$2\\sin^{-1}\\left(\\frac{x^4+x^2-2}{x^4+x^2+2}\\right)$$\n\nis:",
  }],
  [63, {
    question: "Let the system of linear equations\n\n$$x+y+\\alpha z=2,$$\n\n$$3x+y+z=4,$$\n\n$$x+2z=1$$\n\nhave a unique solution $(x^*,y^*,z^*)$. If $(\\alpha,x^*)$, $(y^*,\\alpha)$ and $(x^*,-y^*)$ are collinear points, then the sum of the absolute values of all possible values of $\\alpha$ is:",
  }],
  [65, {
    question: "Let $f(x)$ be defined as follows:\n\n| Condition | $f(x)$ |\n| :--- | :--- |\n| $x\\in(-2,-1)$ | $\\dfrac{\\sin(x-[x])}{x-[x]}$ |\n| $\\lvert x\\rvert<1$ | $\\max\\{2x,3[\\lvert x\\rvert]\\}$ |\n| Otherwise | $1$ |\n\nHere, $[t]$ denotes the greatest integer less than or equal to $t$. If $m$ is the number of points where $f$ is not continuous and $n$ is the number of points where $f$ is not differentiable, then the ordered pair $(m,n)$ is:",
  }],
  [66, {
    question: "The value of the integral\n\n$$\\int_{-\\pi/2}^{\\pi/2}\\frac{dx}{(1+e^x)(\\sin^6x+\\cos^6x)}$$\n\nis equal to:",
  }],
  [67, {
    question: "The value of\n\n$$\\lim_{n\\to\\infty}\\left(\\frac{n^2}{(n^2+1)(n+1)}+\\frac{n^2}{(n^2+4)(n+2)}+\\frac{n^2}{(n^2+9)(n+3)}+\\cdots+\\frac{n^2}{(n^2+n^2)(n+n)}\\right)$$\n\nis:",
  }],
  [72, {
    question: "A random variable $X$ has the following probability distribution:\n\n| $X$ | $0$ | $1$ | $2$ | $3$ | $4$ |\n| :--- | :---: | :---: | :---: | :---: | :---: |\n| $P(X)$ | $k$ | $2k$ | $4k$ | $6k$ | $8k$ |\n\nThe value of $P(1<X<4\\mid X\\le 2)$ is equal to:",
  }],
  [73, {
    question: "The number of solutions of the equation\n\n$$\\cos\\left(x+\\frac{\\pi}{3}\\right)\\cos\\left(\\frac{\\pi}{3}-x\\right)=\\frac{1}{4}\\cos^2(2x),\\qquad x\\in[-3\\pi,3\\pi]$$\n\nis:",
  }],
  [81, {
    question: "Let\n\n$$S=\\left\\{z\\in\\mathbb{C}:|z-3|\\le 1\\text{ and }z(4+3i)+\\bar z(4-3i)\\le 24\\right\\}.$$\n\nIf $\\alpha+i\\beta$ is the point in $S$ which is closest to $4i$, then $25(\\alpha+\\beta)$ is equal to ______.",
  }],
  [87, {
    question: "Let a circle $C:(x-h)^2+(y-k)^2=r^2$, where $k>0$, touch the $x$-axis at $(1,0)$. If the line $x+y=0$ intersects $C$ at $P$ and $Q$ such that the length of chord $PQ$ is $2$, then $h+k+r$ is equal to ______.",
  }],
]);

function validateMath(label, value) {
  if (/\\\\[()[\\]]/.test(value)) throw new Error(`${label}: unsupported \\( \\) or \\[ \\] delimiter`);
  const tokens = value.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g) ?? [];
  for (const token of tokens) {
    const display = token.startsWith("$$");
    const source = token.slice(display ? 2 : 1, display ? -2 : -1);
    katex.renderToString(source, { displayMode: display, throwOnError: true, strict: "ignore" });
  }
  const remainder = value.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g, "");
  if (/\\(?:frac|begin|sin|cos|alpha|beta|pi|mathbb|mathrm|text|bar|le|in)\b/.test(remainder)) {
    throw new Error(`${label}: bare LaTeX remains outside math delimiters`);
  }
}

const allRows = [];
for (const subject of ["physics", "chemistry", "mathematics"]) {
  const file = path.join(TRANSCRIBED, `${PAPER}_${subject}.json`);
  const rows = JSON.parse(await fs.readFile(file, "utf8"));
  for (const row of rows) {
    const fix = fixes.get(row.question_number);
    if (fix) Object.assign(row, fix);
  }
  const serialized = JSON.stringify(rows, null, 2).replaceAll("°", "\\u00b0");
  await fs.writeFile(file, `${serialized}\n`);
  allRows.push(...rows);
}

for (const [number, fix] of fixes) {
  const row = allRows.find((candidate) => candidate.question_number === number);
  if (!row) throw new Error(`Q${number}: missing from local data`);
  for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) {
    validateMath(`Q${number} ${field}`, String(row[field] ?? ""));
  }
}

if (APPLY) {
  process.loadEnvFile(".env.local");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: metadataError } = await supabase
    .from("pyq_questions")
    .update({ attempt: "June" })
    .eq("paper_code", PAPER);
  if (metadataError) throw new Error(`Paper metadata: ${metadataError.message}`);
  for (const [number, fields] of fixes) {
    const { error } = await supabase.from("pyq_questions").update(fields).eq("paper_code", PAPER).eq("question_number", number);
    if (error) throw new Error(`Q${number}: ${error.message}`);
  }
}

console.log(JSON.stringify({ paper_code: PAPER, repaired: [...fixes.keys()], applied: APPLY }, null, 2));
