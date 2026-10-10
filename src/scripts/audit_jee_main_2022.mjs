import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const WORK = path.join(ROOT, "scratch", "jee2022");
const TRANSCRIBED = path.join(WORK, "transcribed");
const REPORTS = path.join(WORK, "reports");
const ONLY = process.argv.find((argument) => argument.startsWith("--paper="))?.slice(8);
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];
const expected = [
  ...[24, 25, 26, 27, 28, 29].flatMap((day) => [1, 2].map((shift) => `JEE-MAIN-22-${day}JUN-S${shift}`)),
  "JEE-MAIN-22-30JUN-S1",
  ...[25, 26, 27, 28, 29].flatMap((day) => [1, 2].map((shift) => `JEE-MAIN-22-${day}JUL-S${shift}`)),
  "JEE-MAIN-22-30JUL-S2",
];
const paperCodes = expected.filter((paperCode) => !ONLY || paperCode === ONLY);
const failures = [];
const papers = [];

function fail(paperCode, message) {
  failures.push(`${paperCode}: ${message}`);
}
function balanced(value) {
  return (String(value ?? "").match(/(?<!\\)\$/g) || []).length % 2 === 0;
}
async function readable(file) {
  if (!file || /^https?:/i.test(file)) return true;
  try { await fs.access(file); return true; } catch { return false; }
}

for (const paperCode of paperCodes) {
  const rows = [];
  for (const subject of SUBJECTS) {
    const file = path.join(TRANSCRIBED, `${paperCode}_${subject.toLowerCase()}.json`);
    try {
      const subjectRows = JSON.parse(await fs.readFile(file, "utf8"));
      if (subjectRows.length !== 30) fail(paperCode, `${subject} has ${subjectRows.length}/30 questions`);
      rows.push(...subjectRows);
    } catch {
      fail(paperCode, `missing ${subject} transcription`);
    }
  }
  rows.sort((left, right) => left.question_number - right.question_number);
  const paper = { paper_code: paperCode, questions: rows.length, images: 0, failures: 0 };
  const before = failures.length;
  if (rows.length !== 90) fail(paperCode, `${rows.length}/90 total questions`);
  rows.forEach((row, index) => {
    const number = index + 1;
    if (row.question_number !== number) fail(paperCode, `question sequence breaks at ${number}`);
    if (row.subject !== SUBJECTS[Math.floor((number - 1) / 30)]) fail(paperCode, `Q${number} has incorrect subject ${row.subject}`);
    if (!String(row.question || "").trim()) fail(paperCode, `Q${number} has empty question text`);
    if (!String(row.chapter || "").trim() || /^(general|unmapped)$/i.test(String(row.chapter).trim())) fail(paperCode, `Q${number} has unmapped chapter`);
    if (!String(row.correct_option || "").trim()) fail(paperCode, `Q${number} has no answer`);
    for (const field of ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"]) {
      if (!balanced(row[field])) fail(paperCode, `Q${number} has unbalanced $ in ${field}`);
    }
    const numerical = number % 30 > 20 || number % 30 === 0;
    if (numerical && row.question_type !== "NUMERICAL") fail(paperCode, `Q${number} must be NUMERICAL`);
    if (numerical && ["a", "b", "c", "d"].some((letter) => String(row[`option_${letter}`] ?? "") !== "")) fail(paperCode, `Q${number} numerical options are not empty`);
    if (!numerical) {
      if (row.question_type !== "MCQ") fail(paperCode, `Q${number} must be MCQ`);
      for (const letter of ["a", "b", "c", "d"]) {
        const text = String(row[`option_${letter}`] ?? "").trim();
        const image = row[`option_${letter}_image`];
        if (!text && !image) fail(paperCode, `Q${number} option ${letter} has neither text nor image`);
        if (/^(?:option\s*[a-d]|\([1-4a-d]\))$/i.test(text)) fail(paperCode, `Q${number} option ${letter} is a placeholder`);
      }
    }
  });
  for (const row of rows) {
    for (const field of ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
      if (!row[field]) continue;
      paper.images += 1;
      if (!(await readable(row[field]))) fail(paperCode, `Q${row.question_number} has unreadable ${field}`);
    }
  }
  paper.failures = failures.length - before;
  papers.push(paper);
}

const report = {
  expected_papers: expected.length,
  audited_papers: paperCodes.length,
  questions: papers.reduce((sum, paper) => sum + paper.questions, 0),
  images: papers.reduce((sum, paper) => sum + paper.images, 0),
  failures,
  papers,
};
await fs.mkdir(REPORTS, { recursive: true });
await fs.writeFile(path.join(REPORTS, "local-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
