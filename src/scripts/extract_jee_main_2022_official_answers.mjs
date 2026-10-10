import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve("tmp/jee-main-2022");
const OCR = path.resolve("tmp/pdfs/vision_ocr");
const ONLY = process.argv[2] || null;
const SUBJECTS = [
  ["physics", 0],
  ["chemistry", 30],
  ["mathematics", 60],
];

const natural = new Intl.Collator(undefined, { numeric: true });
async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }

function parseAnswers(output) {
  const results = [];
  const fallbacks = [];
  for (const line of output.split("\n")) {
    const fields = line.split("\t");
    if (fields.length < 5) continue;
    const isOfficial = /^Official Ans\. by NTA\b/i.test(fields[0]);
    const isFallback = /^Ans\.\s*/i.test(fields[0]);
    if (!isOfficial && !isFallback) continue;
    const match = isOfficial
      ? fields[0].match(/^Official Ans\. by NTA\s*(?:\(([A-D])\)|(.+?))\s*$/i)
      : fields[0].match(/^Ans\.\s*(?:\(([A-D])\)|(.+?))\s*$/i);
    if (!match) continue;
    const entry = {
      answer: match[1]?.toLowerCase() || match[2]?.trim(),
      x: Number(fields[1]),
      y: Number(fields[2]),
      raw: fields[0],
    };
    (isOfficial ? results : fallbacks).push(entry);
  }
  // Vision occasionally misses the longer official label while still reading the
  // adjacent short "Ans." label. Use it only when no official observation exists
  // at the same question position; official NTA values always take precedence.
  for (const fallback of fallbacks) {
    const hasOfficial = results.some((entry) => Math.abs(entry.x - fallback.x) < 0.12
      && entry.y > fallback.y && entry.y - fallback.y < 0.15);
    if (!hasOfficial) results.push(fallback);
  }
  return results.sort((a, b) => {
    const columnA = a.x < 0.45 ? 0 : 1;
    const columnB = b.x < 0.45 ? 0 : 1;
    return columnA - columnB || b.y - a.y;
  });
}

async function runPool(items, concurrency, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

const paperCodes = (await fs.readdir(ROOT)).filter((name) => name.startsWith("JEE-MAIN-22-") && (!ONLY || name === ONLY)).sort();
for (const paperCode of paperCodes) {
  const answerMap = {};
  const audit = [];
  for (const [subject, offset] of SUBJECTS) {
    const pageDir = path.join(ROOT, paperCode, "pages", subject);
    if (!(await exists(pageDir))) {
      audit.push({ subject, status: "missing-solution-pdf" });
      continue;
    }
    const pages = (await fs.readdir(pageDir)).filter((name) => name.endsWith(".png")).sort(natural.compare);
    const cacheDir = path.join(ROOT, paperCode, "answer-ocr", subject);
    await fs.mkdir(cacheDir, { recursive: true });
    const pageAnswers = Array(pages.length);
    await runPool(pages, 8, async (page, index) => {
      const cache = path.join(cacheDir, `${path.parse(page).name}.txt`);
      let output;
      if (await exists(cache)) output = await fs.readFile(cache, "utf8");
      else {
        ({ stdout: output } = await execFileAsync(OCR, [path.join(pageDir, page)], { maxBuffer: 16 * 1024 * 1024 }));
        await fs.writeFile(cache, output);
      }
      pageAnswers[index] = parseAnswers(output);
    });
    const answers = pageAnswers.flat();
    answers.forEach((entry, index) => { answerMap[String(offset + index + 1)] = entry.answer; });
    audit.push({ subject, pages: pages.length, answers: answers.length, status: answers.length === 30 ? "ok" : "needs-review" });
  }
  await fs.writeFile(path.join(ROOT, paperCode, "official-answers.json"), `${JSON.stringify({ paper_code: paperCode, answers: answerMap, audit }, null, 2)}\n`);
  console.log(`${paperCode}: ${audit.map((item) => `${item.subject}=${item.answers ?? 0}`).join(", ")}`);
}
