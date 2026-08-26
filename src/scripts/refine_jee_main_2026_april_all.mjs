import fs from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "tmp", "jee-main-2026-april", "structured");
const files = (await fs.readdir(root)).filter((name) => /^JEE-MAIN-26-.*\.json$/.test(name)).sort();

function fixMath(text) {
  if (!text) return "";
  let s = String(text);

  // Convert \( ... \) to $ ... $
  s = s.replace(/\\\((.*?)\\\)/gs, "$$1$");
  // Convert \[ ... \] to $$ ... $$
  s = s.replace(/\\\[(.*?)\\\]/gs, "$$$$1$$$");

  // Fix common exponent/subscript patterns like ^ 2 or _ 1
  s = s.replace(/\^\s*\{?(\d+)\}?/g, "^{$1}");

  // Fix degree symbol
  s = s.replace(/([0-9]+)\s*°\s*C/g, "$1^\\circ\\text{C}");

  // Clean trailing spaces and excessive newlines
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

for (const filename of files) {
  const filePath = path.join(root, filename);
  const data = JSON.parse(await fs.readFile(filePath, "utf8"));

  for (const q of data.questions) {
    q.subject = q.number <= 25 ? "Maths" : q.number <= 50 ? "Physics" : "Chemistry";
    q.question = fixMath(q.question);
    if (q.question_type === "MCQ") {
      q.option_a = fixMath(q.option_a || "");
      q.option_b = fixMath(q.option_b || "");
      q.option_c = fixMath(q.option_c || "");
      q.option_d = fixMath(q.option_d || "");
    }
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Refined ${data.paper_code}: ${data.questions.length} questions`);
}
