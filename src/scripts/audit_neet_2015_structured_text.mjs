import fs from "node:fs/promises";

const file = "tmp/neet-2015/structured/neet-2015-structured-draft.json";
const rows = JSON.parse(await fs.readFile(file, "utf8"));
const failures = [];
const textFields = ["question", "option_a", "option_b", "option_c", "option_d"];
const imageFields = ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"];

if (rows.length !== 180 || rows.some((q, i) => q.number !== i + 1)) failures.push("Question sequence must be exactly 1..180");
for (const row of rows) {
  if (!/^[a-d]$/.test(row.correct_option)) failures.push(`Q${row.number}: invalid answer`);
  if (row.accepted_options.length !== 1 || row.accepted_options[0] !== row.correct_option) failures.push(`Q${row.number}: invalid accepted answers`);
  for (const field of textFields) {
    const value = String(row[field] ?? "");
    if (!value.trim()) failures.push(`Q${row.number} ${field}: empty`);
    if (/www\.vedantu|Solution:|Answer Key:|Rate Time|LIVE ONLINE TUTORING/i.test(value)) failures.push(`Q${row.number} ${field}: source contamination`);
    if (/[�□]|[\uE000-\uF8FF]|[𝐀-𝑿]/u.test(value)) failures.push(`Q${row.number} ${field}: unsupported OCR glyph`);
    if ((value.match(/\$/g) || []).length % 2) failures.push(`Q${row.number} ${field}: unmatched LaTeX delimiter`);
    if (/(?:CH|NH|HClO|MnO|CO|HNO|SO|NO|Ca|Ba|Be|XeF|XeO|FADH)\s+[2346](?:\s|$)/.test(value)) failures.push(`Q${row.number} ${field}: detached subscript`);
  }
  for (const field of imageFields) if (row[field]) await fs.access(row[field]);
}

const report = {
  total: rows.length,
  subjects: Object.fromEntries(["Physics", "Chemistry", "Biology"].map(subject => [subject, rows.filter(q => q.subject === subject).length])),
  tables: rows.filter(q => q.question.includes("\n|")).length,
  questionImages: rows.filter(q => q.question_image).length,
  optionImages: rows.reduce((sum, q) => sum + imageFields.slice(1).filter(field => q[field]).length, 0),
  bonus: rows.filter(q => q.bonus).map(q => q.number),
  failures,
};
if (JSON.stringify(report.subjects) !== JSON.stringify({ Physics: 45, Chemistry: 45, Biology: 90 })) failures.push("Subject counts do not match");
if (report.tables !== 2 || report.questionImages !== 5 || report.optionImages !== 12 || report.bonus.length) failures.push("Expected table/image/bonus counts do not match");
if (failures.length) throw new Error(failures.join("\n"));
console.log(JSON.stringify(report, null, 2));
