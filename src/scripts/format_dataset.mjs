import fs from "node:fs/promises";
import path from "node:path";

const DATASET_PATH = path.join(process.cwd(), "tmp/jee-main-2025-january-clean/JEE-MAIN-25-22JAN-S1/structured-dataset.json");

function convertMath(text) {
  if (!text) return text;
  let str = String(text);
  // Replace \[ and \] with $$
  str = str.replaceAll("\\[", "$$").replaceAll("\\]", "$$");
  // Replace \( and \) with $
  str = str.replaceAll("\\(", "$").replaceAll("\\)", "$");
  return str;
}

async function main() {
  const raw = await fs.readFile(DATASET_PATH, "utf8");
  const dataset = JSON.parse(raw);

  for (const q of dataset) {
    q.question = convertMath(q.question);
    if (q.option_a) q.option_a = convertMath(q.option_a);
    if (q.option_b) q.option_b = convertMath(q.option_b);
    if (q.option_c) q.option_c = convertMath(q.option_c);
    if (q.option_d) q.option_d = convertMath(q.option_d);
  }

  await fs.writeFile(DATASET_PATH, JSON.stringify(dataset, null, 2), "utf8");
  console.log(`Successfully formatted all ${dataset.length} questions.`);
}

main().catch(console.error);
