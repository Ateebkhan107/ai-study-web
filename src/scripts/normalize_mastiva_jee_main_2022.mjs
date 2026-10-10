import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("tmp/jee-main-2022/structured");
const OUT = path.resolve("scratch/jee2022/transcribed");
const WORK = path.resolve("tmp/jee-main-2022");

function paperCode(slug) {
  const match = slug.match(/^jee-main-2022-(june|july)-(\d+)-shift-(\d)$/);
  if (!match) throw new Error(`Unexpected shift slug: ${slug}`);
  return `JEE-MAIN-22-${match[2]}${match[1] === "june" ? "JUN" : "JUL"}-S${match[3]}`;
}
function subjectName(name) {
  return name === "Maths" ? "Mathematics" : name;
}
function tokens(text) {
  const stop = new Set(["the", "a", "an", "is", "are", "of", "in", "to", "and", "for", "with", "which", "following"]);
  return new Set(String(text).toLowerCase().replace(/\\[a-z]+/g, " ").match(/[a-z]{2,}|\d+(?:\.\d+)?/g)?.filter((token) => !stop.has(token)) || []);
}
function similarity(left, right) {
  const a = tokens(left), b = tokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / Math.min(a.size, b.size);
}
function assignOptimal(records, positions, cropText) {
  const n = records.length, m = positions.length;
  if (n !== m) throw new Error(`Expected a complete ${m}-question section, found ${n}`);
  const scores = records.map((record) => positions.map((number) => similarity(
    `${record.question} ${record.option_a} ${record.option_b} ${record.option_c} ${record.option_d}`,
    cropText.get(number) || "",
  )));
  const u = Array(n + 1).fill(0), v = Array(m + 1).fill(0), p = Array(m + 1).fill(0), way = Array(m + 1).fill(0);
  for (let row = 1; row <= n; row += 1) {
    p[0] = row;
    let column0 = 0;
    const minv = Array(m + 1).fill(Number.POSITIVE_INFINITY), used = Array(m + 1).fill(false);
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
        if (used[column]) { u[p[column]] += delta; v[column] -= delta; } else minv[column] -= delta;
      }
      column0 = column1;
    } while (p[column0] !== 0);
    do { const column1 = way[column0]; p[column0] = p[column1]; column0 = column1; } while (column0 !== 0);
  }
  for (let column = 1; column <= m; column += 1) {
    const row = p[column] - 1;
    records[row].question_number = positions[column - 1];
    records[row].alignment_score = Number(scores[row][column - 1].toFixed(4));
  }
}
function cleanLatex(text) {
  return String(text || "")
    .replace(/\\includegraphics(?:\[[^\]]*\])?\{[^}]+\}/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
function embeddedImages(text) {
  return [...String(text || "").matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g)].map((match) => match[1]);
}
async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }

await fs.mkdir(OUT, { recursive: true });
const audit = [];
for (const entry of (await fs.readdir(ROOT, { withFileTypes: true })).filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  const indexFile = path.join(ROOT, entry.name, "index.json");
  if (!(await exists(indexFile))) continue;
  const index = JSON.parse(await fs.readFile(indexFile, "utf8"));
  const code = paperCode(entry.name);
  const rows = [];
  const missing = [];
  for (const item of index.Questions) {
    const file = path.join(ROOT, entry.name, "questions", `${item.Code}.json`);
    if (!(await exists(file))) { missing.push(item.QuestionNumber); continue; }
    const payload = JSON.parse(await fs.readFile(file, "utf8"));
    const raw = payload.Questions?.[0];
    if (!raw) { missing.push(item.QuestionNumber); continue; }
    const subject = subjectName(raw.Subject.Name);
    const numerical = ["Numerical", "FIB"].includes(raw.QuestionType.Name);
    const choices = numerical ? [] : JSON.parse(raw.QuestionChoices || "[]");
    const images = embeddedImages(raw.QuestionText);
    rows.push({
      paper_code: code,
      question_number: null,
      source_question_number: Number(raw.QuestionNumber),
      source_code: raw.Code,
      subject,
      chapter: raw.Chapter.Name,
      section: raw.Section,
      question_type: numerical ? "NUMERICAL" : "MCQ",
      question: cleanLatex(raw.QuestionText),
      option_a: numerical ? "" : cleanLatex(choices[0]?.text),
      option_b: numerical ? "" : cleanLatex(choices[1]?.text),
      option_c: numerical ? "" : cleanLatex(choices[2]?.text),
      option_d: numerical ? "" : cleanLatex(choices[3]?.text),
      correct_option: "",
      embedded_image_sources: images,
      question_image: null,
      option_a_image: null,
      option_b_image: null,
      option_c_image: null,
      option_d_image: null,
    });
  }
  if (rows.length === 90) {
    const cropText = new Map();
    for (let number = 1; number <= 90; number += 1) {
      const file = path.join(WORK, code, "official-ocr", `q${number}.txt`);
      cropText.set(number, await fs.readFile(file, "utf8"));
    }
    for (const [subject, offset] of [["Physics", 0], ["Chemistry", 30], ["Mathematics", 60]]) {
      for (const [type, localStart, localEnd] of [["MCQ", 1, 20], ["NUMERICAL", 21, 30]]) {
        const records = rows.filter((row) => row.subject === subject && row.question_type === type);
        const positions = Array.from({ length: localEnd - localStart + 1 }, (_, index) => offset + localStart + index);
        assignOptimal(records, positions, cropText);
      }
    }
  } else {
    audit.push({ paper_code: code, count: rows.length, missing_source_numbers: missing.map(Number), duplicate_numbers: [], subject_counts: {} });
    continue;
  }
  rows.sort((a, b) => a.question_number - b.question_number);
  const duplicateNumbers = rows.map((row) => row.question_number).filter((number, index, all) => all.indexOf(number) !== index);
  const subjectCounts = Object.fromEntries(["Physics", "Chemistry", "Mathematics"].map((subject) => [subject, rows.filter((row) => row.subject === subject).length]));
  for (const subject of ["Physics", "Chemistry", "Mathematics"]) {
    await fs.writeFile(path.join(OUT, `${code}_${subject.toLowerCase()}.json`), `${JSON.stringify(rows.filter((row) => row.subject === subject), null, 2)}\n`);
  }
  audit.push({ paper_code: code, count: rows.length, missing_source_numbers: missing.map(Number), duplicate_numbers: duplicateNumbers, subject_counts: subjectCounts });
}
await fs.writeFile(path.join(OUT, "mastiva-normalization-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
for (const item of audit) console.log(`${item.paper_code}: ${item.count}/90 ${JSON.stringify(item.subject_counts)}`);
