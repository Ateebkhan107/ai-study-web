import fs from "node:fs/promises";

const file = "tmp/neet-2018/structured/neet-2018-structured-draft.json";
const rows = JSON.parse(await fs.readFile(file, "utf8"));
const failures = [];

for (const row of rows) {
  const fields = ["question", "option_a", "option_b", "option_c", "option_d"];
  for (const field of fields) {
    const value = String(row[field] ?? "");
    if (/(?:CaH|BeH|BaH|NH|CH|NO|SO|CO|Mg|HNO|Cl|BrO)\s+[234](?:\s|$)/.test(value)) {
      failures.push(`Q${row.number} ${field}: detached chemical subscript`);
    }
    if (/(?:\b[A-Za-z]{1,4})\s+(?:[234]\s+){2,}/.test(value)) {
      failures.push(`Q${row.number} ${field}: repeated detached digits`);
    }
    if (/[�□]|[\uE000-\uF8FF]/u.test(value)) {
      failures.push(`Q${row.number} ${field}: unsupported extraction glyph`);
    }
  }
}

if (failures.length) throw new Error(failures.join("\n"));
console.log(JSON.stringify({ total: rows.length, detachedSubscripts: 0, unsupportedGlyphs: 0 }, null, 2));
