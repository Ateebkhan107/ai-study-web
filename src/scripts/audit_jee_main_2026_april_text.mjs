/** Fail closed on incomplete or visibly broken JEE Main April 2026 manifests. */
import fs from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "tmp", "jee-main-2026-april", "structured");
const files = (await fs.readdir(root)).filter((name) => /^JEE-MAIN-26-.*\.json$/.test(name)).sort();
const failures = [];
const summary = [];
let grandTotal = 0;
for (const filename of files) {
  const manifest = JSON.parse(await fs.readFile(path.join(root, filename), "utf8"));
  const questions = manifest.questions;
  grandTotal += questions.length;
  const subjects = {};
  let questionImages = 0;
  let optionImages = 0;
  if (questions.length !== 75) failures.push(`${manifest.paper_code}: expected 75 questions, found ${questions.length}`);
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const prefix = `${manifest.paper_code} Q${question.number}`;
    subjects[question.subject] = (subjects[question.subject] || 0) + 1;
    if (Number(question.number) !== index + 1) failures.push(`${prefix}: sequence mismatch`);
    if (!String(question.question || "").trim()) failures.push(`${prefix}: empty question`);
    if (/Match (?:the )?(?:LIST|List)/.test(question.question) && !/\|---\|/.test(question.question)) {
      failures.push(`${prefix}: matching list is not a Markdown table`);
    }
    if (/MathonGo|PaperPhodnaHai|www\.mathongo/i.test(JSON.stringify(question))) failures.push(`${prefix}: source branding leaked into structured data`);
    for (const field of ["question", "option_a", "option_b", "option_c", "option_d", "explanation"]) {
      const value = String(question[field] || "");
      if ((value.match(/\$/g) || []).length % 2) failures.push(`${prefix}: unmatched LaTeX delimiter in ${field}`);
      if (/[�□]/.test(value)) failures.push(`${prefix}: unsupported glyph in ${field}`);
      if (/\b(?:F|Cl|Br|I|H|O|N)\s+[2-9]\b/.test(value) && !question[`${field}_image`]) {
        failures.push(`${prefix}: detached chemical subscript in ${field}`);
      }
      if (/\$10\^\{-\d+\}\$/.test(value)) {
        failures.push(`${prefix}: ambiguous scientific exponent/range in ${field}; verify against source`);
      }
      if (/^\s*\d+\s*$/m.test(value)) {
        failures.push(`${prefix}: detached standalone digit in ${field}`);
      }
    }
    if (question.question_type === "MCQ") {
      if (!/^[a-d]$/.test(question.correct_option)) failures.push(`${prefix}: invalid MCQ answer`);
      for (const letter of "abcd") {
        if (!String(question[`option_${letter}`] || "").trim() && !question[`option_${letter}_image`]) {
          failures.push(`${prefix}: missing option ${letter.toUpperCase()}`);
        }
      }
    } else if (typeof question.numerical_answer !== "number" || !Number.isFinite(question.numerical_answer)) {
      failures.push(`${prefix}: invalid numerical answer`);
    }
    for (const field of ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
      if (!question[field]) continue;
      try { await fs.access(question[field]); } catch { failures.push(`${prefix}: missing local image ${field}`); }
      if (field === "question_image") questionImages += 1;
      else optionImages += 1;
    }
  }
  if (JSON.stringify(subjects) !== JSON.stringify({ Mathematics: 25, Physics: 25, Chemistry: 25 })) {
    failures.push(`${manifest.paper_code}: invalid subject distribution ${JSON.stringify(subjects)}`);
  }
  summary.push({ paper_code: manifest.paper_code, total: questions.length, subjects, questionImages, optionImages });
}
if (files.length !== 9) failures.push(`expected 9 papers, found ${files.length}`);
if (grandTotal !== 675) failures.push(`expected 675 questions, found ${grandTotal}`);
console.log(JSON.stringify({ papers: files.length, total: grandTotal, summary, failures }, null, 2));
if (failures.length) process.exitCode = 1;
