import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import katex from "katex";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");
const papers = [
  "JEE-MAIN-22-24JUN-S1", "JEE-MAIN-22-24JUN-S2", "JEE-MAIN-22-25JUN-S1",
  "JEE-MAIN-22-25JUN-S2", "JEE-MAIN-22-26JUN-S1", "JEE-MAIN-22-26JUN-S2",
  "JEE-MAIN-22-27JUN-S1", "JEE-MAIN-22-27JUN-S2", "JEE-MAIN-22-28JUN-S1",
  "JEE-MAIN-22-28JUN-S2", "JEE-MAIN-22-29JUN-S1", "JEE-MAIN-22-29JUN-S2",
  "JEE-MAIN-22-30JUN-S1",
];

const key = (paper, number) => `${paper}:${number}`;
const fixes = new Map();
const add = (paper, number, fields) => fixes.set(key(paper, number), fields);
const qualityTargets = new Set([
  ["24JUN-S1", 69], ["24JUN-S1", 85], ["24JUN-S2", 82],
  ["25JUN-S1", 8], ["25JUN-S1", 26], ["25JUN-S1", 45], ["25JUN-S1", 65], ["25JUN-S1", 71],
  ["25JUN-S2", 18], ["25JUN-S2", 29], ["25JUN-S2", 46], ["25JUN-S2", 81], ["25JUN-S2", 82],
  ["26JUN-S1", 28], ["26JUN-S1", 67], ["26JUN-S1", 76],
  ["26JUN-S2", 76], ["26JUN-S2", 84], ["26JUN-S2", 89],
  ["27JUN-S1", 75], ["27JUN-S1", 83], ["27JUN-S2", 13], ["27JUN-S2", 62], ["27JUN-S2", 81],
  ["28JUN-S1", 25], ["28JUN-S1", 62], ["28JUN-S1", 68], ["28JUN-S1", 84],
  ["28JUN-S2", 15], ["28JUN-S2", 18], ["28JUN-S2", 66], ["28JUN-S2", 74], ["28JUN-S2", 79], ["28JUN-S2", 87],
  ["29JUN-S1", 64], ["29JUN-S1", 65],
  ["29JUN-S2", 66], ["29JUN-S2", 72], ["29JUN-S2", 74], ["29JUN-S2", 75], ["29JUN-S2", 80], ["29JUN-S2", 81], ["29JUN-S2", 89],
  ["30JUN-S1", 1], ["30JUN-S1", 64], ["30JUN-S1", 83],
].map(([suffix, number]) => key(`JEE-MAIN-22-${suffix}`, number)));

for (const [paper, number] of [
  ["JEE-MAIN-22-25JUN-S1", 8], ["JEE-MAIN-22-25JUN-S1", 26], ["JEE-MAIN-22-25JUN-S1", 45],
  ["JEE-MAIN-22-25JUN-S2", 18], ["JEE-MAIN-22-25JUN-S2", 29],
  ["JEE-MAIN-22-25JUN-S2", 46], ["JEE-MAIN-22-26JUN-S1", 28],
]) add(paper, number, { question_image: `scratch/jee2022/images/${paper}/q${number}.png` });

add("JEE-MAIN-22-24JUN-S1", 85, { question: "The number of points where the function $f$ is discontinuous is _____. Here, $[t]$ denotes the greatest integer less than or equal to $t$.\n\n| Condition | $f(x)$ |\n| :--- | :--- |\n| $x\\le -1$ | $\\lvert 2x^2-3x-7\\rvert$ |\n| $-1<x<1$ | $[4x^2-1]$ |\n| $x\\ge 1$ | $\\lvert x+1\\rvert+\\lvert x-2\\rvert$ |" });
add("JEE-MAIN-22-25JUN-S2", 82, { question: "Let $f(x)=[2x^2+1]$, where $[t]$ is the greatest integer less than or equal to $t$, and let\n\n| Condition | $g(x)$ |\n| :--- | :--- |\n| $x<0$ | $2x-3$ |\n| $x\\ge 0$ | $2x+3$ |\n\nIn the open interval $(-1,1)$, the number of points where $f\\circ g$ is discontinuous is equal to:" });
add("JEE-MAIN-22-26JUN-S1", 67, { question: "Let $f,g:\\mathbb{R}\\to\\mathbb{R}$ be defined by\n\n| Condition | $f(x)$ | $g(x)$ |\n| :--- | :--- | :--- |\n| $x<0$ | $-\\lvert x+3\\rvert$ | $x^2+k_1x$ |\n| $x\\ge0$ | $e^x$ | $4x+k_2$ |\n\nwhere $k_1,k_2$ are real constants. If $g\\circ f$ is differentiable at $x=0$, then $(g\\circ f)(-4)+(g\\circ f)(4)$ is equal to:" });
add("JEE-MAIN-22-27JUN-S2", 81, { question: "Let $S=\\{1,2,3,4,5,6,7,8,9,10\\}$. Define $f:S\\to S$ by\n\n| Condition | $f(n)$ |\n| :--- | :--- |\n| $n=1,2,3,4,5$ | $2n$ |\n| $n=6,7,8,9,10$ | $2n-11$ |\n\nLet $g:S\\to S$ satisfy\n\n| Condition | $(f\\circ g)(n)$ |\n| :--- | :--- |\n| $n$ odd | $n+1$ |\n| $n$ even | $n-1$ |\n\nThen $g(10)\\bigl(g(1)+g(2)+g(3)+g(4)+g(5)\\bigr)$ is equal to ______." });
add("JEE-MAIN-22-28JUN-S1", 62, { question: "Let $f:\\mathbb{N}\\to\\mathbb{N}$ be defined by\n\n| Values of $n$ | $f(n)$ |\n| :--- | :--- |\n| $n=2,4,6,8,\\ldots$ | $2n$ |\n| $n=3,7,11,15,\\ldots$ | $n-1$ |\n| $n=1,5,9,13,\\ldots$ | $\\dfrac{n+1}{2}$ |\n\nThen $f$ is:" });
add("JEE-MAIN-22-28JUN-S1", 68, { question: "Let $f:\\mathbb{R}\\to\\mathbb{R}$ be defined by\n\n| Condition | $f(x)$ |\n| :--- | :--- |\n| $x<0$ | $[e^x]$ |\n| $0\\le x<1$ | $ae^x+[x-1]$ |\n| $1\\le x<2$ | $b+[\\sin(\\pi x)]$ |\n| $x\\ge2$ | $[e^{-x}]-c$ |\n\nwhere $a,b,c\\in\\mathbb{R}$ and $[t]$ denotes the greatest integer less than or equal to $t$. Which statement is true?" });
add("JEE-MAIN-22-28JUN-S2", 66, { question: "Let $f,g:\\mathbb{R}\\to\\mathbb{R}$ be defined by\n\n| Condition | $f(x)$ | $g(x)$ |\n| :--- | :--- | :--- |\n| $x<0$ | $[x]$ | $e^x-x$ |\n| $x\\ge0$ | $\\lvert1-x\\rvert$ | $(x-1)^2-1$ |\n\nwhere $[x]$ denotes the greatest integer less than or equal to $x$. Then $f\\circ g$ is discontinuous at exactly:" });
add("JEE-MAIN-22-29JUN-S1", 64, { question: "Let $f:\\mathbb{R}\\to\\mathbb{R}$ be defined by\n\n| Condition | $f(x)$ |\n| :--- | :--- |\n| $x\\le2$ | $\\max_{t\\le x}(t^3-3t)$ |\n| $2<x<3$ | $x^2+2x-6$ |\n| $3\\le x\\le5$ | $[x-3]+9$ |\n| $x>5$ | $2x+1$ |\n\nwhere $[t]$ is the greatest integer less than or equal to $t$. Let $m$ be the number of points where $f$ is not differentiable and $I=\\int_{-2}^{2}f(x)\\,dx$. Then $(m,I)$ is:" });

add("JEE-MAIN-22-29JUN-S2", 72, {
  question: "The line $\\dfrac{x-2}{3}=\\dfrac{y+1}{-2}=\\dfrac{z+3}{-1}$ lies on the plane $px-qy+z=5$ for some $p,q\\in\\mathbb{R}$. The shortest distance of the plane from the origin is:",
  option_a: "$\\sqrt{\\dfrac{3}{109}}$", option_b: "$\\sqrt{\\dfrac{5}{142}}$",
  option_c: "$\\dfrac{5}{\\sqrt{71}}$", option_d: "$\\dfrac{1}{\\sqrt{142}}$",
});
add("JEE-MAIN-22-29JUN-S2", 74, { question: "Let $Q$ be the mirror image of $P(1,2,1)$ with respect to the plane $x+2y+2z=16$. Let $T$ be a plane passing through $Q$ and containing the line $\\vec r=-\\hat{k}+\\lambda(\\hat{i}+\\hat{j}+2\\hat{k})$, $\\lambda\\in\\mathbb{R}$. Which point lies on $T$?" });
add("JEE-MAIN-22-29JUN-S2", 66, {
  question: "Let $f:\\mathbb{R}\\to\\mathbb{R}$ be defined by $f(x)=(x-3)^{n_1}(x-5)^{n_2}$, where $n_1,n_2\\in\\mathbb{N}$. Which statement is NOT true?",
  option_a: "For $n_1=3,n_2=4$, there exists $\\alpha\\in(3,5)$ where $f$ attains a local maximum.",
  option_b: "For $n_1=4,n_2=3$, there exists $\\alpha\\in(3,5)$ where $f$ attains a local minimum.",
  option_c: "For $n_1=3,n_2=5$, there exists $\\alpha\\in(3,5)$ where $f$ attains a local maximum.",
  option_d: "For $n_1=4,n_2=6$, there exists $\\alpha\\in(3,5)$ where $f$ attains a local maximum.",
});
add("JEE-MAIN-22-29JUN-S2", 80, {
  question: "Let $n\\ge5$ be an integer. If $9^n-8n-1=64\\alpha$ and $6^n-5n-1=25\\beta$, then $\\alpha-\\beta$ is equal to:",
  option_a: "$1+\\binom n2(8-5)+\\binom n3(8^2-5^2)+\\cdots+\\binom nn(8^{n-1}-5^{n-1})$",
  option_b: "$1+\\binom n3(8-5)+\\binom n4(8^2-5^2)+\\cdots+\\binom nn(8^{n-2}-5^{n-2})$",
  option_c: "$\\binom n3(8-5)+\\binom n4(8^2-5^2)+\\cdots+\\binom nn(8^{n-2}-5^{n-2})$",
  option_d: "$\\binom n4(8-5)+\\binom n5(8^2-5^2)+\\cdots+\\binom nn(8^{n-3}-5^{n-3})$",
});

function cleanTypography(value) {
  return String(value ?? "")
    .replace(/\\begin\{(pmatrix|bmatrix|matrix|vmatrix)\}([\s\S]*?)\\end\{\1\}/g, (_, kind, body) => {
      const rows = body.split(/\\\\/).map((row) => `[${row.split("&").map((cell) => cell.trim()).join(", ")}]`).join(", ");
      return kind === "vmatrix" ? `\\det\\bigl([${rows}]\\bigr)` : `\\bigl[${rows}\\bigr]`;
    })
    .replaceAll("\\overset{ˆ}{i}", "\\hat{i}").replaceAll("\\overset{ˆ}{j}", "\\hat{j}").replaceAll("\\overset{ˆ}{k}", "\\hat{k}")
    .replaceAll("\\overset{\\to }", "\\vec").replaceAll("⃗", "")
    .replaceAll("", "$\\tau$").replaceAll("", "$\\lambda$")
    .replaceAll("π", "\\pi").replaceAll("α", "\\alpha").replaceAll("β", "\\beta").replaceAll("γ", "\\gamma").replaceAll("≥", "\\ge ").replaceAll("≤", "\\le ").replaceAll("∈", "\\in ")
    .replaceAll("⎡", "").replaceAll("⎤", "").replaceAll("⎣", "").replaceAll("⎦", "").replaceAll("⎢", "").replaceAll("⎥", "")
    .replaceAll("⎧", "").replaceAll("⎨", "").replaceAll("⎩", "")
    .replaceAll("∣", "|").replaceAll("−", "-").replaceAll("–", "-");
}

function validateMath(label, value) {
  if (/\\begin\{|[⎡⎤⎣⎦⎧⎨⎩ˆ]/.test(value)) throw new Error(`${label}: renderer-unsafe glyph or environment remains`);
  const tokens = value.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g) ?? [];
  for (const token of tokens) {
    const display = token.startsWith("$$");
    katex.renderToString(token.slice(display ? 2 : 1, display ? -2 : -1), { displayMode: display, throwOnError: true, strict: "ignore" });
  }
}

const touched = [];
const rowsByPaper = new Map();
for (const paper of papers) {
  const paperRows = [];
  for (const subject of ["physics", "chemistry", "mathematics"]) {
    const file = path.join(TRANSCRIBED, `${paper}_${subject}.json`);
    const rows = JSON.parse(await fs.readFile(file, "utf8"));
    for (const row of rows) {
      const fields = fixes.get(key(paper, row.question_number));
      if (fields) Object.assign(row, fields);
      let changed = Boolean(fields) || qualityTargets.has(key(paper, row.question_number));
      if (changed) {
        for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) {
          const cleaned = cleanTypography(row[field]);
          if (cleaned !== row[field]) row[field] = cleaned;
        }
      }
      if (changed) touched.push({ paper, number: row.question_number });
      paperRows.push(row);
    }
    await fs.writeFile(file, `${JSON.stringify(rows, null, 2).replaceAll("°", "\\u00b0")}\n`);
  }
  rowsByPaper.set(paper, paperRows);
}

for (const { paper, number } of touched) {
  const row = rowsByPaper.get(paper).find((item) => item.question_number === number);
  for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) validateMath(`${paper} Q${number} ${field}`, row[field]);
}

if (APPLY) {
  process.loadEnvFile(".env.local");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const paper of papers) {
    const { error } = await supabase.from("pyq_questions").update({ attempt: "June" }).eq("paper_code", paper);
    if (error) throw new Error(`${paper} metadata: ${error.message}`);
  }
  for (const { paper, number } of touched) {
    const row = rowsByPaper.get(paper).find((item) => item.question_number === number);
    const payload = Object.fromEntries(["question", "option_a", "option_b", "option_c", "option_d"].map((field) => [field, row[field]]));
    if (row.question_image) {
      const objectPath = `jee-main-2022/${paper}/q${number}.png`;
      const { error: uploadError } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(row.question_image), { contentType: "image/png", cacheControl: "0", upsert: true });
      if (uploadError) throw new Error(`${paper} Q${number} image: ${uploadError.message}`);
      payload.question_image = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
    }
    const { error } = await supabase.from("pyq_questions").update(payload).eq("paper_code", paper).eq("question_number", number);
    if (error) throw new Error(`${paper} Q${number}: ${error.message}`);
  }
}

console.log(JSON.stringify({ papers: papers.length, questions: 1170, touched: touched.length, image_links: 7, applied: APPLY }, null, 2));
