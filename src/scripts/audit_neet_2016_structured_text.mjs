import fs from "node:fs/promises";

const file = "tmp/neet-2016/structured/neet-2016-structured-draft.json";
const rows = JSON.parse(await fs.readFile(file, "utf8"));
const failures = [];
const fields = ["question", "option_a", "option_b", "option_c", "option_d"];
if (rows.length !== 180 || rows.some((q, i) => q.number !== i + 1)) failures.push("Question sequence must be exactly 1..180");
for (const row of rows) {
  if (!/^[a-d]$/.test(row.correct_option)) failures.push(`Q${row.number}: invalid answer`);
  for (const field of fields) {
    const value = String(row[field] ?? "");
    if (!value.trim()) failures.push(`Q${row.number} ${field}: empty`);
    if (/www\.vedantu|Solution:|Rate Time/i.test(value)) failures.push(`Q${row.number} ${field}: source contamination`);
    if (/[�□]|[\uE000-\uF8FF]|[𝐀-𝑿]/u.test(value)) failures.push(`Q${row.number} ${field}: unsupported OCR glyph`);
    if ((value.match(/\$/g) || []).length % 2) failures.push(`Q${row.number} ${field}: unmatched LaTeX delimiter`);
    if (/(?:CH|NH|HClO|MnO|CO|HNO|SO|NO|Ca|Ba|Be|XeF|XeO|GA|FADH)\s+[2346](?:\s|$)/.test(value)) failures.push(`Q${row.number} ${field}: detached subscript`);
  }
  for (const field of ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
    if (row[field]) await fs.access(row[field]);
  }
}
const report = {
  total: rows.length,
  subjects: Object.fromEntries(["Physics", "Chemistry", "Biology"].map(s => [s, rows.filter(q => q.subject === s).length])),
  tables: rows.filter(q => q.question.includes("\n|")).length,
  questionImages: rows.filter(q => q.question_image).length,
  optionImages: rows.reduce((n, q) => n + [q.option_a_image, q.option_b_image, q.option_c_image, q.option_d_image].filter(Boolean).length, 0),
  bonus: rows.filter(q => q.bonus).map(q => q.number),
  failures,
};
if (report.tables !== 4 || report.questionImages !== 4 || report.optionImages !== 4 || report.bonus.join() !== "71") failures.push("Expected visual/table/bonus counts do not match");
if (failures.length) throw new Error(failures.join("\n"));
console.log(JSON.stringify(report, null, 2));
