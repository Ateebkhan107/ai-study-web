import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

process.loadEnvFile('.env.local');
if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');

const root = process.cwd();
const work = path.join(root, 'tmp', 'jee-main-2022');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelNames = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite'];
const subjectOffsets = { physics: 0, chemistry: 30, mathematics: 60 };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanJson(text) {
  return JSON.parse(text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim());
}

async function detect(pagePath, context, cachePath) {
  try { return JSON.parse(await fs.readFile(cachePath, 'utf8')); } catch {}
  const metadata = await sharp(pagePath).metadata();
  const inlineData = { data: (await fs.readFile(pagePath)).toString('base64'), mimeType: 'image/png' };
  const prompt = context.kind === 'solution'
    ? `This is a ${metadata.width}x${metadata.height}px two-column JEE Main 2022 ${context.subject} solution-book page. Detect every ORIGINAL EXAM QUESTION whose numbered stem begins on this page. Ignore worked solution text. Section A questions are numbered 1-20. Section B numerical questions may be printed 1-10; return them as local_number 21-30. For each, return local_number, question_type (MCQ or NUMERICAL), correct_option (a/b/c/d for MCQ or the exact numerical answer as a string), and box {x,y,width,height} in exact pixels. The box must tightly contain only the original question stem, formulae, required diagram/table and four original options, ending immediately before "Official Ans.", "Ans.", or "Sol.". Exclude headers, solutions, and neighboring questions. Return a JSON array only.`
    : `This is a ${metadata.width}x${metadata.height}px official NTA JEE Main 2022 Paper 1 page. Detect every question whose "Q:" marker begins on this page. Return source_number (1-90), and box {x,y,width,height} in exact pixels. Include the complete NTA question card with stem, diagrams and options, but exclude the following question and page header. Return a JSON array only.`;
  let error;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelNames[(attempt - 1) % modelNames.length],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      });
      const response = await model.generateContent([prompt, { inlineData }]);
      const parsed = cleanJson(response.response.text());
      const rows = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(rows)) throw new Error('Response is not an array');
      await fs.mkdir(path.dirname(cachePath), { recursive: true });
      await fs.writeFile(cachePath, `${JSON.stringify(rows, null, 2)}\n`);
      return rows;
    } catch (caught) {
      error = caught;
      await sleep(Math.min(20000, attempt * 2500));
    }
  }
  throw error;
}

function sourceToGlobal(sourceNumber) {
  if (sourceNumber <= 30) return { global: sourceNumber + 60, subject: 'Mathematics', local: sourceNumber };
  if (sourceNumber <= 60) return { global: sourceNumber - 30, subject: 'Physics', local: sourceNumber - 30 };
  return { global: sourceNumber - 30, subject: 'Chemistry', local: sourceNumber - 60 };
}

async function cropRow(pagePath, row, outputPath) {
  const metadata = await sharp(pagePath).metadata();
  const rawBox = row.box ?? row.bounding_box;
  const box = Array.isArray(rawBox)
    ? { x: rawBox[0], y: rawBox[1], width: rawBox[2], height: rawBox[3] }
    : rawBox;
  if (!box || [box.x, box.y, box.width, box.height].some((value) => !Number.isFinite(Number(value)))) return false;
  const normalized = metadata.width > 1100 && metadata.height > 1100
    && Number(box.x) + Number(box.width) <= 1100 && Number(box.y) + Number(box.height) <= 1100;
  const scaleX = normalized ? metadata.width / 1000 : 1;
  const scaleY = normalized ? metadata.height / 1000 : 1;
  const left = Math.max(0, Math.round(Number(box.x) * scaleX));
  const top = Math.max(0, Math.round(Number(box.y) * scaleY));
  const width = Math.min(metadata.width - left, Math.max(1, Math.round(Number(box.width) * scaleX)));
  const height = Math.min(metadata.height - top, Math.max(1, Math.round(Number(box.height) * scaleY)));
  await sharp(pagePath).extract({ left, top, width, height }).png().toFile(outputPath);
  return true;
}

async function processPaper(paperCode) {
  const sourceDir = path.join(work, 'sources', paperCode);
  const paperDir = path.join(work, paperCode);
  const cropsDir = path.join(paperDir, 'crops');
  await fs.mkdir(cropsDir, { recursive: true });
  const entries = new Map();
  const official = path.join(sourceDir, 'official.pdf');
  let isOfficial = false;
  try { await fs.stat(official); isOfficial = true; } catch {}
  const subjects = isOfficial ? ['official'] : ['physics', 'chemistry', 'mathematics'];
  for (const subject of subjects) {
    const pagesDir = path.join(paperDir, 'pages', subject);
    const pages = (await fs.readdir(pagesDir)).filter((name) => name.endsWith('.png')).sort();
    for (let index = 0; index < pages.length; index += 1) {
      const pagePath = path.join(pagesDir, pages[index]);
      const cachePath = path.join(paperDir, 'detections', subject, `${pages[index]}.json`);
      const rows = await detect(pagePath, { kind: isOfficial ? 'official' : 'solution', subject }, cachePath);
      for (const row of rows) {
        let number;
        let entrySubject;
        let local;
        if (isOfficial) {
          const mapped = sourceToGlobal(Number(row.source_number));
          number = mapped.global; entrySubject = mapped.subject; local = mapped.local;
        } else {
          local = Number(row.local_number);
          if (String(row.question_type).toUpperCase() === 'NUMERICAL' && local <= 10) local += 20;
          number = subjectOffsets[subject] + local;
          entrySubject = subject === 'mathematics' ? 'Mathematics' : `${subject[0].toUpperCase()}${subject.slice(1)}`;
          if (String(row.question_type).toUpperCase() === 'NUMERICAL' && entries.has(number)) {
            const offset = subjectOffsets[subject];
            number = Array.from({ length: 10 }, (_, index) => offset + 21 + index)
              .find((candidate) => !entries.has(candidate));
            local = number - offset;
          }
        }
        if (!Number.isInteger(number) || number < 1 || number > 90 || entries.has(number)) continue;
        const outputPath = path.join(cropsDir, `q${number}.png`);
        if (!await cropRow(pagePath, row, outputPath)) continue;
        entries.set(number, {
          question_number: number,
          subject: entrySubject,
          question_type: local > 20 ? 'NUMERICAL' : 'MCQ',
          correct_option: row.correct_option == null ? null : String(row.correct_option).toLowerCase(),
          crop: outputPath,
          source_page: index + 1,
          source: isOfficial ? official : path.join(sourceDir, `${subject}.pdf`),
        });
      }
      console.log(`${paperCode} ${subject} ${index + 1}/${pages.length}: ${entries.size}/90`);
    }
  }
  const manifest = [...entries.values()].sort((a, b) => a.question_number - b.question_number);
  await fs.writeFile(path.join(paperDir, 'crop-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const missing = Array.from({ length: 90 }, (_, index) => index + 1).filter((number) => !entries.has(number));
  console.log(JSON.stringify({ paper_code: paperCode, questions: manifest.length, missing }));
  return { paper_code: paperCode, questions: manifest.length, missing };
}

const selection = process.argv[2];
const sourceDirs = (await fs.readdir(path.join(work, 'sources'), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && (!selection || entry.name === selection))
  .map((entry) => entry.name).sort();
if (!sourceDirs.length) throw new Error(`No matching paper: ${selection}`);
const results = [];
for (const paperCode of sourceDirs) results.push(await processPaper(paperCode));
await fs.writeFile(path.join(work, 'crop-audit.json'), `${JSON.stringify(results, null, 2)}\n`);
