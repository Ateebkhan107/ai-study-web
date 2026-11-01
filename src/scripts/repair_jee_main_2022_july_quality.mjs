import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import katex from "katex";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");
const papers = [
  "JEE-MAIN-22-25JUL-S1", "JEE-MAIN-22-25JUL-S2", "JEE-MAIN-22-26JUL-S1", "JEE-MAIN-22-26JUL-S2",
  "JEE-MAIN-22-27JUL-S1", "JEE-MAIN-22-27JUL-S2", "JEE-MAIN-22-28JUL-S1", "JEE-MAIN-22-28JUL-S2",
  "JEE-MAIN-22-29JUL-S1", "JEE-MAIN-22-29JUL-S2", "JEE-MAIN-22-30JUL-S2",
];
const key = (paper, number) => `${paper}:${number}`;
const targets = new Set([
  ["25JUL-S1",20],["25JUL-S1",64],["25JUL-S1",69],["25JUL-S1",81],["25JUL-S1",86],["25JUL-S2",83],
  ["26JUL-S1",63],["26JUL-S1",67],["26JUL-S1",68],["26JUL-S1",69],["26JUL-S2",63],["26JUL-S2",90],
  ["27JUL-S1",64],["27JUL-S1",80],["27JUL-S2",2],["27JUL-S2",24],["27JUL-S2",55],["27JUL-S2",64],["27JUL-S2",81],
  ["28JUL-S1",21],["28JUL-S1",63],["28JUL-S1",74],["28JUL-S1",85],["28JUL-S2",2],["28JUL-S2",77],
  ["29JUL-S1",6],["29JUL-S1",10],["29JUL-S1",29],["29JUL-S1",41],["29JUL-S1",74],["29JUL-S1",87],
  ["29JUL-S2",16],["29JUL-S2",29],["29JUL-S2",33],["29JUL-S2",62],["29JUL-S2",63],["29JUL-S2",64],["29JUL-S2",83],
  ["30JUL-S2",64],["30JUL-S2",69],
  ["26JUL-S1",10],["26JUL-S1",17],["26JUL-S1",27],
  ["26JUL-S2",14],["26JUL-S2",23],["26JUL-S2",30],["27JUL-S1",19],
  ["26JUL-S1",1],["26JUL-S1",25],["26JUL-S1",26],["26JUL-S1",28],
  ["27JUL-S1",7],["27JUL-S2",20],["29JUL-S1",4],["29JUL-S1",48],
].map(([suffix, number]) => key(`JEE-MAIN-22-${suffix}`, number)));

const imageTargets = new Set([
  ["26JUL-S1",10],["26JUL-S1",17],["26JUL-S1",27],
  ["26JUL-S2",14],["26JUL-S2",23],["26JUL-S2",30],["27JUL-S1",19],
  ["26JUL-S1",1],["26JUL-S1",25],["26JUL-S1",26],["26JUL-S1",28],
  ["27JUL-S1",7],["27JUL-S2",20],["29JUL-S1",4],["29JUL-S1",48],
].map(([suffix, number]) => key(`JEE-MAIN-22-${suffix}`, number)));

const explicit = new Map([
  [key("JEE-MAIN-22-28JUL-S1", 74), {
    question: "Let $A=\\bigl[[0,1,0],[0,0,1],[1,0,0]\\bigr]$ and $B_0=A^{49}+2A^{98}$. If $B_n=\\operatorname{adj}(B_{n-1})$ for every $n\\ge1$, then $\\det(B_4)$ is equal to:",
    option_a: "$3^{28}$", option_b: "$3^{30}$", option_c: "$3^{32}$", option_d: "$3^{36}$",
  }],
  [key("JEE-MAIN-22-29JUL-S1", 41), { question: "Which among the following pairs has only herbicides?" }],
  [key("JEE-MAIN-22-29JUL-S2", 29), {
    question: "Two radioactive materials $A$ and $B$ have decay constants $25\\lambda$ and $16\\lambda$, respectively. If initially they contain the same number of nuclei, then the ratio of the number of nuclei of $A$ to that of $B$ will be $1/e$ after a time:",
  }],
]);

function flattenEnvironments(value) {
  return value
    .replace(/\\begin\{(pmatrix|bmatrix|matrix|vmatrix)\}([\s\S]*?)\\end\{\1\}/g, (_, kind, body) => {
      const rows = body.split(/\\\\/).map((row) => `[${row.split("&").map((cell) => cell.trim()).filter(Boolean).join(", ")}]`).join(", ");
      return kind === "vmatrix" ? `\\det\\bigl([${rows}]\\bigr)` : `\\bigl[${rows}\\bigr]`;
    })
    .replace(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g, (_, body) => body.replaceAll("&", "").replace(/\\\\/g, ";\\quad "))
    .replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_, body) => `\\left\\{${body.replaceAll("&", "\\quad ").replace(/\\\\/g, ";\\quad ")}\\right.`);
}

function clean(value) {
  return flattenEnvironments(String(value ?? ""))
    .replace(/\\overset\{(?:ˆ|⃗|\\to\s*)\}\{([^}]+)\}/g, "\\vec{$1}")
    .replaceAll("\\vec{i}", "\\hat{i}").replaceAll("\\vec{j}", "\\hat{j}").replaceAll("\\vec{k}", "\\hat{k}")
    .replaceAll("", "\\lambda").replaceAll("", "")
    .replaceAll("⎛", "").replaceAll("⎝", "").replaceAll("⎜", "").replaceAll("⎞", "").replaceAll("⎠", "").replaceAll("⎟", "")
    .replaceAll("⎡", "").replaceAll("⎤", "").replaceAll("⎣", "").replaceAll("⎦", "").replaceAll("⎢", "").replaceAll("⎥", "")
    .replaceAll("", "").replaceAll("", "")
    .replaceAll("∣", "|").replaceAll("−", "-").replaceAll("–", "-");
}

function validate(label, value) {
  if (/\\begin\{|[⎡⎤⎣⎦⎢⎥⎛⎞⎝⎠⎜⎟ˆ-]/u.test(value)) throw new Error(`${label}: renderer-unsafe input remains`);
  const tokens = value.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g) ?? [];
  for (const token of tokens) {
    const display = token.startsWith("$$");
    katex.renderToString(token.slice(display ? 2 : 1, display ? -2 : -1), { displayMode: display, throwOnError: true, strict: "ignore" });
  }
}

const rowsByPaper = new Map();
for (const paper of papers) {
  const paperRows = [];
  for (const subject of ["physics", "chemistry", "mathematics"]) {
    const file = path.join(TRANSCRIBED, `${paper}_${subject}.json`);
    const rows = JSON.parse(await fs.readFile(file, "utf8"));
    for (const row of rows) {
      if (!targets.has(key(paper, row.question_number))) { paperRows.push(row); continue; }
      Object.assign(row, explicit.get(key(paper, row.question_number)) ?? {});
      if (imageTargets.has(key(paper, row.question_number))) row.question_image = `scratch/jee2022/images/${paper}/q${row.question_number}.png`;
      for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) row[field] = clean(row[field]);
      for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) validate(`${paper} Q${row.question_number} ${field}`, row[field]);
      paperRows.push(row);
    }
    await fs.writeFile(file, `${JSON.stringify(rows, null, 2).replaceAll("°", "\\u00b0")}\n`);
  }
  rowsByPaper.set(paper, paperRows);
}

if (APPLY) {
  process.loadEnvFile(".env.local");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const paper of papers) {
    const { error } = await supabase.from("pyq_questions").update({ attempt: "July" }).eq("paper_code", paper);
    if (error) throw new Error(`${paper} metadata: ${error.message}`);
  }
  for (const target of targets) {
    const [paper, rawNumber] = target.split(":");
    const number = Number(rawNumber);
    const row = rowsByPaper.get(paper).find((candidate) => candidate.question_number === number);
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

console.log(JSON.stringify({ papers: papers.length, questions: 990, repaired: targets.size, image_links: imageTargets.size, applied: APPLY }, null, 2));
