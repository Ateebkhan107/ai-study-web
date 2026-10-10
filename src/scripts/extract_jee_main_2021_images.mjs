import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { GoogleGenerativeAI } from "@google/generative-ai";

process.loadEnvFile(".env.local");
if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required");

const ROOT = process.cwd();
const WORK = path.join(ROOT, "scratch", "jee2021");
const PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm";
const PYTHON = "python3";
const CLEANER = path.join(ROOT, "src", "scripts", "clean_jee_main_2021_crop.py");
const requestedPaper = process.argv.find((arg) => arg.startsWith("--paper="))?.slice(8);
const requestedSubject = process.argv.find((arg) => arg.startsWith("--subject="))?.slice(10)?.toLowerCase();
const manifest = JSON.parse(await fs.readFile(path.join(WORK, "source", "manifest.json"), "utf8"));
const displaySubjects = { physics: "Physics", chemistry: "Chemistry", mathematics: "Mathematics" };
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const modelNames = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-3-flash-preview", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-3.1-flash-lite"];

function cleanJson(text) {
  const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim());
  return Array.isArray(parsed) ? parsed : parsed.images;
}

async function locate(pdfPath, flagged) {
  const pdf = { inlineData: { data: (await fs.readFile(pdfPath)).toString("base64"), mimeType: "application/pdf" } };
  const prompt = `Locate only the essential visual assets for these JEE questions: ${JSON.stringify(flagged)}. Return a JSON array. Each item must have local_number and any applicable fields question_image, option_a_image, option_b_image, option_c_image, option_d_image. Each image field is either null or {"page": one_based_pdf_page, "box_2d": [ymin,xmin,ymax,xmax]}. Coordinates are normalized 0..1000 relative to the full page. A question_image box must contain ONLY the diagram/circuit/graph/reaction scheme, never question prose, question number, answer, worked solution, page header/footer, URL, logo, or MCQ option blocks. An option image box must contain ONLY the option's graphic, excluding its (1)-(4) label and neighboring options. Use null rather than including text that KaTeX can represent. Return JSON only.`;
  let lastError;
  for (let attempt = 0; attempt < modelNames.length; attempt += 1) {
    try {
      const model = genAI.getGenerativeModel({ model: modelNames[attempt], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
      return cleanJson((await model.generateContent([prompt, pdf])).response.text());
    } catch (error) {
      lastError = error;
      await sleep(Math.min(30000, 2500 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function render(pdfPath, pagesDir) {
  await fs.mkdir(pagesDir, { recursive: true });
  if (!(await fs.readdir(pagesDir)).some((name) => name.endsWith(".png"))) {
    execFileSync(PDFTOPPM, ["-png", "-r", "240", pdfPath, path.join(pagesDir, "page")], { stdio: "ignore", env: { ...process.env, XDG_CACHE_HOME: "/tmp/codex-font-cache" } });
  }
}

function normalizeBox(box, width, height) {
  if (!Array.isArray(box) || box.length !== 4) return null;
  const [y1, x1, y2, x2] = box.map(Number);
  const left = Math.max(0, Math.floor(width * x1 / 1000));
  const top = Math.max(0, Math.floor(height * y1 / 1000));
  const right = Math.min(width, Math.ceil(width * x2 / 1000));
  const bottom = Math.min(height, Math.ceil(height * y2 / 1000));
  if (right - left < 20 || bottom - top < 20) return null;
  return { left, top, width: right - left, height: bottom - top };
}

for (const paper of manifest.filter((item) => !requestedPaper || item.paper_code === requestedPaper)) {
  for (const subject of Object.keys(displaySubjects).filter((item) => !requestedSubject || item === requestedSubject)) {
    const transcriptPath = path.join(WORK, "transcribed", `${paper.paper_code}_${displaySubjects[subject]}.json`);
    let rows;
    try { rows = JSON.parse(await fs.readFile(transcriptPath, "utf8")); } catch { continue; }
    const flagged = rows.filter((row) => row.needs_question_image || ["a", "b", "c", "d"].some((letter) => row[`option_${letter}_needs_image`])).map((row) => ({
      local_number: row.local_number,
      question_image: Boolean(row.needs_question_image),
      option_images: ["a", "b", "c", "d"].filter((letter) => row[`option_${letter}_needs_image`]),
    }));
    if (!flagged.length) { console.log(`${paper.paper_code} ${subject}: no visual assets`); continue; }
    const pdfPath = path.join(WORK, "source", "pdfs", paper.paper_code, `${subject}.pdf`);
    const subjectDir = path.join(WORK, "images", paper.paper_code, subject);
    const pagesDir = path.join(subjectDir, "pages");
    const locatorPath = path.join(subjectDir, "locators.json");
    await fs.mkdir(subjectDir, { recursive: true });
    let locators;
    try { locators = JSON.parse(await fs.readFile(locatorPath, "utf8")); } catch { locators = await locate(pdfPath, flagged); await fs.writeFile(locatorPath, `${JSON.stringify(locators, null, 2)}\n`); }
    await render(pdfPath, pagesDir);
    const byLocal = new Map(locators.map((item) => [Number(item.local_number), item]));
    for (const row of rows) {
      const locator = byLocal.get(row.local_number);
      if (!locator) continue;
      for (const [field, suffix] of [["question_image", ""], ["option_a_image", "_opt_a"], ["option_b_image", "_opt_b"], ["option_c_image", "_opt_c"], ["option_d_image", "_opt_d"]]) {
        const location = locator[field];
        if (!location) continue;
        const pageName = `page-${String(location.page).padStart(2, "0")}.png`;
        const pagePath = path.join(pagesDir, pageName);
        const metadata = await sharp(pagePath).metadata();
        const box = normalizeBox(location.box_2d, metadata.width, metadata.height);
        if (!box) throw new Error(`${paper.paper_code} ${subject} Q${row.local_number}: invalid ${field} box`);
        const globalNumber = row.question_number;
        const raw = path.join(subjectDir, `q${globalNumber}${suffix}.raw.png`);
        const cleaned = path.join(WORK, "images", paper.paper_code, `q${globalNumber}${suffix}.png`);
        await sharp(pagePath).extract(box).png().toFile(raw);
        execFileSync(PYTHON, [CLEANER, raw, cleaned]);
        row[field] = cleaned;
      }
    }
    await fs.writeFile(transcriptPath, `${JSON.stringify(rows, null, 2)}\n`);
    console.log(`${paper.paper_code} ${subject}: extracted ${flagged.length} visual question sets`);
  }
}
