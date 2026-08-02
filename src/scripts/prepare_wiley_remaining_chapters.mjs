import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GoogleGenerativeAI } = require("@google/generative-ai");
process.loadEnvFile(".env.local");

const SOURCE = "/Users/ateebfatmi/Desktop/Wiley's Mathematics JEE Main Practice Problems.pdf";
const ROOT = path.resolve("tmp/wiley-jee-main-mathematics/remaining");
const PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftoppm";
const chapters = {
  25: { name: "Differential Equations", first: 139, last: 144, answers: "1C 2C 3A 4B 5B 6C 7D 8D 9D 10A 11D 12D 13D 14D 15A 16C 17B 18C 19B 20C 21A 22B 23C 24D 25C 26D 27D 28B 29D 30C 31C 32D 33D 34C 35B 36A 37B 38B 39D 40A 41C 42A 43D 44B 45B 46C 47=0.0625 48=0 49=3 50=2" },
  26: { name: "Vector Algebra", first: 145, last: 152, answers: "1A 2A 3B 4D 5D 6B 7C 8A 9A 10B 11C 12D 13B 14B 15C 16B 17C 18A 19D 20B 21=None 22D 23C 24D 25A 26A 27B 28A 29B 30C 31D 32B 33C 34A 35C 36D 37D 38D 39D 40D 41D 42D 43D 44C 45C 46B 47B 48C 49C 50B 51A 52A 53D 54A 55D 56D 57A 58C 59C 60A 61B 62A 63B 64C 65B 66=6 67=4 68=1 69=30 70=9 71=1 72=2 73=0 74=4 75=1.5" },
  27: { name: "Three Dimensional Geometry", first: 153, last: 160, answers: "1D 2A 3A 4D 5C 6A 7C 8A 9B 10A 11B 12C 13D 14A 15A 16D 17A 18A 19B 20A 21A 22B 23B 24A 25A 26B 27C 28D 29C 30C 31B 32A 33C 34B 35B 36D 37A 38D 39A 40C 41A 42C 43B 44D 45B 46C 47C 48A 49B 50C 51B 52A 53C 54C 55B 56=None 57C 58B 59C 60C 61A 62A 63A 64A 65C 66A 67B 68B 69C 70D 71D 72C 73=A,D 74B 75B 76=4.5 77=5.831 78=4.919 79=120 80=4.770 81=1 82=7 83=13 84=0.577 85=7.483 86=36 87=0.25 88=7 89=4.491 90=1.291" },
  28: { name: "Linear Programming", first: 161, last: 164, answers: "1C 2D 3C 4D 5B 6D 7D 8B 9B 10A 11=12 12=112 13=13 14=12 15=26" },
  29: { name: "Probability – II", first: 165, last: 168, answers: "1B 2A 3A 4B 5B 6B 7C 8A 9C 10A 11C 12D 13A 14C 15D 16C 17C 18A 19D 20C 21D 22A 23A 24B 25C 26D 27=7 28=137 29=0.6531 30=0.0875" },
};

const chapterNumber = Number(process.argv[2]);
const chapter = chapters[chapterNumber];
if (!chapter) throw new Error("Pass a chapter number from 25 to 29");
if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required");

function cleanJson(raw) {
  return JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
}

async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
async function imagePart(file) { return { inlineData: { data: (await fs.readFile(file)).toString("base64"), mimeType: "image/png" } }; }

const chapterRoot = path.join(ROOT, `chapter-${chapterNumber}`);
const pagesRoot = path.join(chapterRoot, "pages");
const cacheRoot = path.join(chapterRoot, "cache");
await fs.mkdir(pagesRoot, { recursive: true });
await fs.mkdir(cacheRoot, { recursive: true });

const pageFile = (page) => path.join(pagesRoot, `page-${page}.png`);
if (!(await exists(pageFile(chapter.first)))) {
  execFileSync(PDFTOPPM, ["-f", String(chapter.first), "-l", String(Math.min(168, chapter.last + 1)), "-r", "210", "-png", SOURCE, path.join(pagesRoot, "page")], { stdio: "inherit" });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite", generationConfig: { responseMimeType: "application/json", temperature: 0, maxOutputTokens: 32768 } });

async function transcribe(page) {
  const cache = path.join(cacheRoot, `page-${page}.json`);
  if (await exists(cache)) return JSON.parse(await fs.readFile(cache, "utf8"));
  const prompt = `Transcribe and solve EVERY numbered question that BEGINS on the first image from Chapter ${chapterNumber}: ${chapter.name}. The second image is context only for a question continuing across a page boundary.

Printed answer key for this entire chapter: ${chapter.answers}

Return JSON only as {"questions":[...]}. Each question must contain:
- number (integer)
- topic (concise mathematical topic)
- question_type: "MCQ" or "Numerical"
- question_text: exact complete Markdown with all mathematics in valid LaTeX
- options: exactly four complete option strings for MCQ, [] for Numerical
- correct_option: A/B/C/D for MCQ, exact keyed value for Numerical
- explanation: a real, concise step-by-step mathematical derivation proving the keyed answer; never mention Wiley, a book, source, key, or answer checking
- has_required_visual: true if the printed question contains or requires any graph, diagram, geometric figure, plotted region, or image/table that cannot be represented faithfully as ordinary text
- confidence: 0 to 1

Rules:
1. Preserve every exponent, subscript, fraction, radical, matrix/determinant entry, vector mark, bound, inequality, and interval exactly. Use $...$ LaTeX and valid JSON escaping.
2. Do not include questions beginning only on the second image.
3. Do not include headers, watermarks, exam labels, or page furniture.
4. Do the mathematics yourself and ensure the explanation actually establishes the keyed result. If the source is internally defective or the key is mathematically impossible, set defective:true and explain the conflict in defect_reason rather than inventing a proof.
5. A formula is text, not a visual. Mark visual only for actual non-text figures/graphs/tables.
6. For multiple-correct keyed answers, use the comma-separated letters exactly.`;
  const parts = [prompt, await imagePart(pageFile(page))];
  if (page <= chapter.last && await exists(pageFile(page + 1))) parts.push(await imagePart(pageFile(page + 1)));
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const result = await model.generateContent(parts);
      const data = cleanJson(result.response.text());
      await fs.writeFile(cache, JSON.stringify(data, null, 2));
      console.log(`page ${page}: ${data.questions?.length || 0}`);
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`page ${page}, attempt ${attempt}: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, Math.min(30000, 1500 * 2 ** (attempt - 1))));
    }
  }
  throw lastError;
}

const pageNumbers = Array.from({ length: chapter.last - chapter.first + 1 }, (_, index) => chapter.first + index);
const results = new Array(pageNumbers.length);
let cursor = 0;
await Promise.all(Array.from({ length: 2 }, async () => {
  while (cursor < pageNumbers.length) {
    const index = cursor++;
    results[index] = await transcribe(pageNumbers[index]);
  }
}));

const seen = new Set();
const approved = [];
const skipped = [];
for (const result of results) {
  for (const question of result.questions || []) {
    const number = Number(question.number);
    if (!Number.isInteger(number) || seen.has(number)) continue;
    seen.add(number);
    if (question.has_required_visual || question.defective || Number(question.confidence) < 0.88) {
      skipped.push({ number, visual: Boolean(question.has_required_visual), defective: Boolean(question.defective), confidence: question.confidence, reason: question.defect_reason || null });
      continue;
    }
    approved.push({
      number,
      topic: question.topic,
      question_type: question.question_type,
      question_text: question.question_text,
      ...(question.question_type === "MCQ" ? { options: question.options } : {}),
      correct_option: String(question.correct_option),
      explanation: question.explanation,
    });
  }
}
approved.sort((a, b) => a.number - b.number);
await fs.writeFile(path.resolve(`tmp/wiley-jee-main-mathematics/offline-chapter-${chapterNumber}.json`), JSON.stringify(approved, null, 2));
await fs.writeFile(path.join(chapterRoot, "report.json"), JSON.stringify({ chapter: chapterNumber, approved: approved.length, skipped, seen: [...seen].sort((a,b)=>a-b) }, null, 2));
console.log(JSON.stringify({ chapter: chapterNumber, approved: approved.length, skipped: skipped.length, seen: seen.size }));
