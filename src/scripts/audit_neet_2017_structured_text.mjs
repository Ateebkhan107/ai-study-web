import fs from "node:fs/promises";

const rows = JSON.parse(await fs.readFile("tmp/neet-2017/structured/neet-2017-structured-draft.json", "utf8"));
const failures = [];
for (const row of rows) {
  for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) {
    const value = String(row[field] ?? "");
    if (/(?:HgCl|Ag C O|ZnSO|CuSO|KMnO|FADH|CO|NH|CH|NCl|BCl|ClF)\s+[234](?:\s|$)/.test(value)) failures.push(`Q${row.number} ${field}: detached subscript`);
    if (/\b(?:n|t|l|R|K|V|I|r|m|p|q|x|y)\s?[234]\b/.test(value) && !value.includes("$")) failures.push(`Q${row.number} ${field}: detached exponent`);
    if (/[�□]|[\uE000-\uF8FF]/u.test(value)) failures.push(`Q${row.number} ${field}: unsupported glyph`);
  }
}
if (failures.length) throw new Error(failures.join("\n"));
console.log(JSON.stringify({total:rows.length,detachedSubscripts:0,detachedExponents:0,unsupportedGlyphs:0},null,2));
