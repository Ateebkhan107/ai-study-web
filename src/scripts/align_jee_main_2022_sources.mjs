import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const WORK = path.resolve("tmp/jee-main-2022");
const NORMALIZED = path.resolve("scratch/jee2022/examside-normalized");
const ONLY = process.argv[2] || null;
const SUBJECT_RANGES = { Physics: [1, 30], Chemistry: [31, 60], Mathematics: [61, 90] };

async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve(output) : reject(new Error(`${command} exited ${code}`)));
  });
}

function tokens(text) {
  const stop = new Set(["the", "a", "an", "is", "are", "of", "in", "to", "and", "for", "with", "which", "following", "respectively"]);
  return new Set(String(text).toLowerCase().replace(/\\[a-z]+/g, " ").match(/[a-z]{2,}|\d+(?:\.\d+)?/g)?.filter((token) => !stop.has(token)) || []);
}
function similarity(left, right) {
  const a = tokens(left), b = tokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / Math.min(a.size, b.size);
}

function alignOptimal(records, positions, cropText) {
  const n = records.length, m = positions.length;
  const scores = records.map((record) => positions.map((number) => similarity(
    `${record.question} ${record.option_a} ${record.option_b} ${record.option_c} ${record.option_d}`,
    cropText.get(number) || "",
  )));
  // Hungarian assignment: source pages are chapter-grouped, not exam-ordered.
  // Find the maximum-score one-to-one mapping without assuming monotonic order.
  const u = Array(n + 1).fill(0), v = Array(m + 1).fill(0), p = Array(m + 1).fill(0), way = Array(m + 1).fill(0);
  for (let row = 1; row <= n; row += 1) {
    p[0] = row;
    let column0 = 0;
    const minv = Array(m + 1).fill(Number.POSITIVE_INFINITY);
    const used = Array(m + 1).fill(false);
    do {
      used[column0] = true;
      const row0 = p[column0];
      let delta = Number.POSITIVE_INFINITY, column1 = 0;
      for (let column = 1; column <= m; column += 1) if (!used[column]) {
        const current = (1 - scores[row0 - 1][column - 1]) - u[row0] - v[column];
        if (current < minv[column]) { minv[column] = current; way[column] = column0; }
        if (minv[column] < delta) { delta = minv[column]; column1 = column; }
      }
      for (let column = 0; column <= m; column += 1) {
        if (used[column]) { u[p[column]] += delta; v[column] -= delta; }
        else minv[column] -= delta;
      }
      column0 = column1;
    } while (p[column0] !== 0);
    do {
      const column1 = way[column0];
      p[column0] = p[column1];
      column0 = column1;
    } while (column0 !== 0);
  }
  const result = Array(n);
  for (let column = 1; column <= m; column += 1) if (p[column]) {
    const row = p[column] - 1;
    result[row] = { number: positions[column - 1], score: scores[row][column - 1] };
  }
  return result;
}

for (const file of (await fs.readdir(NORMALIZED)).filter((name) => name.endsWith(".json") && (!ONLY || name === `${ONLY}.json`)).sort()) {
  const paperCode = file.replace(/\.json$/, "");
  const officialCropsDir = path.join(WORK, paperCode, "source-crops");
  const usesOfficialCrops = await exists(officialCropsDir);
  const cropsDir = usesOfficialCrops ? officialCropsDir : path.join(WORK, paperCode, "crops");
  const ocrDir = path.join(WORK, paperCode, usesOfficialCrops ? "official-ocr" : "ocr");
  await fs.mkdir(ocrDir, { recursive: true });
  const source = JSON.parse(await fs.readFile(path.join(NORMALIZED, file), "utf8"));
  const cropText = new Map();
  for (let number = 1; number <= 90; number += 1) {
    const image = path.join(cropsDir, `q${number}.png`);
    if (!(await exists(image))) continue;
    const textFile = path.join(ocrDir, `q${number}.txt`);
    let text;
    if (await exists(textFile)) text = await fs.readFile(textFile, "utf8");
    else {
      text = await run("tesseract", [image, "stdout", "--psm", "6"]);
      await fs.writeFile(textFile, text);
    }
    cropText.set(number, text);
  }

  const aligned = [];
  for (const [subject, [subjectStart]] of Object.entries(SUBJECT_RANGES)) {
    for (const questionType of ["MCQ", "NUMERICAL"]) {
    const start = subjectStart + (questionType === "MCQ" ? 0 : 20);
    const end = subjectStart + (questionType === "MCQ" ? 19 : 29);
    const records = source.filter((item) => item.subject === subject && item.question_type === questionType);
    const positions = Array.from({ length: end - start + 1 }, (_, index) => start + index);
    const assignments = alignOptimal(records, positions, cropText);
    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      const best = assignments[index];
      if (!best) {
        aligned.push({ ...record, question_number: null, alignment_score: 0 });
        continue;
      }
      aligned.push({ ...record, question_number: best.number, alignment_score: Number(best.score.toFixed(4)) });
    }
    }
  }
  aligned.sort((a, b) => (a.question_number ?? 999) - (b.question_number ?? 999));
  const report = {
    paper_code: paperCode,
    crop_count: cropText.size,
    source_count: source.length,
    aligned_count: aligned.filter((item) => item.question_number).length,
    weak_count: aligned.filter((item) => item.alignment_score < 0.35).length,
    missing_source_numbers: Array.from({ length: 90 }, (_, index) => index + 1).filter((number) => !aligned.some((item) => item.question_number === number)),
    questions: aligned,
  };
  await fs.writeFile(path.join(WORK, paperCode, "source-alignment.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${paperCode}: crops=${report.crop_count}, aligned=${report.aligned_count}/${report.source_count}, weak=${report.weak_count}`);
}
