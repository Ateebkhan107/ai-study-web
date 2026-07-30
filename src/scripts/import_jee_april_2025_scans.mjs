/**
 * Imports image-based JEE Main 2025 April Session 2 papers while preserving
 * the original typesetting (equations, diagrams, and tables) as question
 * images. Gemini supplies metadata, answers, and question crop boxes.
 *
 * Usage:
 *   node src/scripts/import_jee_april_2025_scans.mjs [--prepare-only]
 *
 * Source PDFs are intentionally addressed by absolute path because they were
 * supplied outside of the repository.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

process.loadEnvFile(".env.local");

const PYTHON = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm";
const SOURCE_PAPERS = [
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file.pdf", date: "2025-04-02", shift: 1 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-2.pdf", date: "2025-04-02", shift: 2 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-3.pdf", date: "2025-04-03", shift: 1 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-4.pdf", date: "2025-04-03", shift: 2 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-5.pdf", date: "2025-04-04", shift: 1 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-6.pdf", date: "2025-04-04", shift: 2 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-7.pdf", date: "2025-04-07", shift: 1 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-8.pdf", date: "2025-04-07", shift: 2 },
  { source: "/Users/ateebfatmi/Downloads/selfstudys_com_file-9.pdf", date: "2025-04-08", shift: 2 },
];
const OUT_DIR = path.resolve("tmp/jee-main-2025-april");
const prepareOnly = process.argv.includes("--prepare-only");

for (const key of ["GEMINI_API_KEY", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[key]) throw new Error(`${key} is required in .env.local`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite", generationConfig: { responseMimeType: "application/json", temperature: 0 } });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function subjectFor(number) {
  if (number <= 25) return "Maths";
  if (number <= 50) return "Physics";
  return "Chemistry";
}

function typeFor(number) {
  return number % 25 <= 20 && number % 25 !== 0 ? "MCQ" : "NUMERICAL";
}

function normaliseAnswer(value) {
  const answer = String(value || "").trim().toLowerCase();
  if (["a", "b", "c", "d"].includes(answer)) return answer;
  const match = answer.match(/[1-4]/);
  return match ? ["a", "b", "c", "d"][Number(match[0]) - 1] : null;
}

function safeBox(box, width, height) {
  const x = Math.max(0, Math.floor(Number(box?.x) || 0));
  const y = Math.max(0, Math.floor(Number(box?.y) || 0));
  const right = Math.min(width, Math.ceil(Number(box?.x || 0) + Number(box?.width || 0)));
  const bottom = Math.min(height, Math.ceil(Number(box?.y || 0) + Number(box?.height || 0)));
  if (right - x < 80 || bottom - y < 40) return null;
  return { x, y, width: right - x, height: bottom - y };
}

async function imageSize(imagePath) {
  const command = "from PIL import Image; import sys; print(*Image.open(sys.argv[1]).size)";
  const [width, height] = execFileSync(PYTHON, ["-c", command, imagePath], { encoding: "utf8" }).trim().split(/\s+/).map(Number);
  return { width, height };
}

async function crop(imagePath, outPath, box) {
  const command = "from PIL import Image; import sys; im=Image.open(sys.argv[1]); x,y,w,h=map(int,sys.argv[3:]); im.crop((x,y,x+w,y+h)).save(sys.argv[2])";
  execFileSync(PYTHON, ["-c", command, imagePath, outPath, String(box.x), String(box.y), String(box.width), String(box.height)]);
}

async function renderPages(paper) {
  const paperDir = path.join(OUT_DIR, `${paper.date}-shift-${paper.shift}`);
  const pagesDir = path.join(paperDir, "pages");
  await fs.mkdir(pagesDir, { recursive: true });
  const prefix = path.join(pagesDir, "page");
  const hasPages = (await fs.readdir(pagesDir)).some((name) => name.endsWith(".png"));
  if (!hasPages) execFileSync(PDFTOPPM, ["-png", "-r", "200", paper.source, prefix]);
  return (await fs.readdir(pagesDir)).filter((name) => name.endsWith(".png")).sort().map((name) => path.join(pagesDir, name));
}

async function analysePage(imagePath, paper, pageNumber) {
  const { width, height } = await imageSize(imagePath);
  const inlineData = { data: (await fs.readFile(imagePath)).toString("base64"), mimeType: "image/png" };
  const prompt = `This is page ${pageNumber} of JEE Main 2025 Session 2, ${paper.date} Shift ${paper.shift}. The page is ${width} pixels wide by ${height} pixels high. It is a scan with questions, their answers, and worked solutions in columns. Identify every numbered exam question that begins on this page. Return a JSON array only. For each item use: number (integer 1-75), question_type (MCQ or NUMERICAL), option_a/option_b/option_c/option_d (strings or null), correct_option (a/b/c/d or null), numerical_answer (number or null), chapter (concise JEE chapter), and box {x,y,width,height}. The box must tightly include only that question's prompt, formulae, diagrams/tables and all four options, stopping immediately before Ans./Sol.; it must not include the answer or solution. Use exact pixels, not percentages. Do not include headers, section titles, duplicate continuation text, answers, or solutions.`;
  const result = await model.generateContent([prompt, { inlineData }]);
  const raw = result.response.text();
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error(`Invalid Gemini JSON for Shift ${paper.shift}, page ${pageNumber}: ${raw.slice(0, 500)}`); }
  if (!Array.isArray(parsed)) throw new Error(`Expected an array for Shift ${paper.shift}, page ${pageNumber}`);
  return parsed.map((item) => ({ ...item, source_page: pageNumber, image_width: width, image_height: height }));
}

async function preparePaper(paper) {
  const paperDir = path.join(OUT_DIR, `${paper.date}-shift-${paper.shift}`);
  const manifestPath = path.join(paperDir, "manifest.json");
  try { return JSON.parse(await fs.readFile(manifestPath, "utf8")); } catch {}
  const pages = await renderPages(paper);
  const all = [];
  for (const [index, page] of pages.entries()) {
    const pageNumber = index + 1;
    const questions = await analysePage(page, paper, pageNumber);
    all.push(...questions);
    console.log(`${paper.date} Shift ${paper.shift}: analysed page ${pageNumber}/${pages.length} (${questions.length} question starts)`);
  }
  const byNumber = new Map();
  for (const item of all) if (Number.isInteger(item.number) && item.number >= 1 && item.number <= 75 && !byNumber.has(item.number)) byNumber.set(item.number, item);
  const manifest = [...byNumber.values()].sort((a, b) => a.number - b.number);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

async function ensureExam(paper) {
  const day = paper.date.slice(-2);
  const attempt = `${Number(day)} Apr`;
  const paperCode = `JEE-MAIN-25-${day}APR-S${paper.shift}`;
  const where = supabase.from("pyq_exams").select("id").eq("exam", "JEE").eq("year", 2025).eq("exam_type", "JEE Main").eq("attempt", attempt).eq("shift", `Shift ${paper.shift}`).maybeSingle();
  const { data: existing, error } = await where;
  if (error) throw new Error(error.message);
  const record = { exam: "JEE", exam_type: "JEE Main", year: 2025, attempt, shift: `Shift ${paper.shift}`, paper_code: paperCode, exam_date: paper.date, duration_minutes: 180, total_marks: 300, status: "PUBLISHED", is_published: true };
  if (existing) {
    const { error: updateError } = await supabase.from("pyq_exams").update(record).eq("id", existing.id);
    if (updateError) throw new Error(updateError.message);
    return { id: existing.id, paperCode, attempt };
  }
  const { data, error: insertError } = await supabase.from("pyq_exams").insert(record).select("id").single();
  if (insertError) throw new Error(insertError.message);
  return { id: data.id, paperCode, attempt };
}

async function uploadQuestionImage(paper, number, sourcePage, box) {
  const paperDir = path.join(OUT_DIR, `${paper.date}-shift-${paper.shift}`);
  const pagePath = path.join(paperDir, "pages", `page-${String(sourcePage).padStart(2, "0")}.png`);
  const cropsDir = path.join(paperDir, "questions");
  await fs.mkdir(cropsDir, { recursive: true });
  const cropPath = path.join(cropsDir, `q${String(number).padStart(2, "0")}.png`);
  await crop(pagePath, cropPath, box);
  const objectPath = `jee-main-2025/${paper.date}-shift-${paper.shift}/q${String(number).padStart(2, "0")}.png`;
  const { error } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(cropPath), { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Upload Q${number}: ${error.message}`);
  return supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
}

async function importPaper(paper, manifest) {
  if (manifest.length !== 75) throw new Error(`${paper.date} Shift ${paper.shift} has ${manifest.length}/75 questions in its manifest; refusing to publish an incomplete paper.`);
  const exam = await ensureExam(paper);
  const { data: existing, error: existingError } = await supabase.from("pyq_questions").select("id, question").eq("paper_code", exam.paperCode);
  if (existingError) throw new Error(existingError.message);
  if (existing.length) throw new Error(`${exam.paperCode} already has ${existing.length} question rows; refusing to duplicate it.`);
  const records = [];
  for (const item of manifest) {
    const box = safeBox(item.box, item.image_width, item.image_height);
    if (!box) throw new Error(`Invalid question crop for Shift ${paper.shift} Q${item.number}`);
    const imageUrl = await uploadQuestionImage(paper, item.number, item.source_page, box);
    const type = item.question_type === "NUMERICAL" ? "NUMERICAL" : typeFor(item.number);
    records.push({
      exam_id: exam.id, exam: "JEE", exam_type: "JEE Main", year: 2025, attempt: exam.attempt, shift: `Shift ${paper.shift}`, paper_code: exam.paperCode,
      subject: subjectFor(item.number), chapter: item.chapter || "Unmapped", question_type: type,
      question: `Question ${item.number}: Refer to the source image.`, option_a: item.option_a || "Option A", option_b: item.option_b || "Option B", option_c: item.option_c || "Option C", option_d: item.option_d || "Option D",
      correct_option: type === "MCQ" ? normaliseAnswer(item.correct_option) || "a" : null, numerical_answer: type === "NUMERICAL" && Number.isFinite(Number(item.numerical_answer)) ? Number(item.numerical_answer) : null,
      explanation: "Refer to the official solution source.", question_image: imageUrl, status: "PUBLISHED", marks_positive: 4, marks_negative: 1,
    });
  }
  for (let start = 0; start < records.length; start += 20) {
    const { error } = await supabase.from("pyq_questions").insert(records.slice(start, start + 20));
    if (error) throw new Error(`Insert batch ${start + 1}: ${error.message}`);
  }
  return { paperCode: exam.paperCode, total: records.length, images: records.length };
}

const manifests = [];
for (const paper of SOURCE_PAPERS) manifests.push({ paper, manifest: await preparePaper(paper) });
console.log(JSON.stringify(Object.fromEntries(manifests.map(({ paper, manifest }) => [`shift${paper.shift}`, { questions: manifest.length }]))));
if (!prepareOnly) {
  for (const { paper, manifest } of manifests) console.log(JSON.stringify(await importPaper(paper, manifest)));
}
