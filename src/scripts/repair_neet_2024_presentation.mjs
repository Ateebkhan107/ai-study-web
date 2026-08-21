import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const APPLY = process.argv.includes("--apply");
const OUT_DIR = path.resolve("tmp/neet-2024-clean");
const BACKUP_PATH = path.join(OUT_DIR, "neet-2024-before-presentation-repair.json");
const REPORT_PATH = path.join(OUT_DIR, "presentation-repair-report.json");
const PLACEHOLDER = "Refer to the source image for the complete question and options.";
const FORCE_SOURCE_IMAGE_ONLY = true;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const visualPattern = /figure|diagram|graph|circuit|structure|match list|list i|table|shown below|given below.*image|identify the correct.*structure/i;
const damagedMathPattern = /[□�]|\(\s*\)|\b\d+[A-Za-z][+−-]?\b|[A-Za-z]\d+[A-Za-z]|\d{2,}[A-Za-z]|[A-Za-z]{1,2}\d{2,}|[=×÷∫Σ√⇌→←]|\b(?:sin|cos|tan|log)\b/i;

const exactOverrides = new Map([
  [23, {
    question: "In a vernier calipers, $(N+1)$ divisions of the vernier scale coincide with $N$ divisions of the main scale. If $1\\,\\mathrm{MSD}$ represents $0.1\\,\\mathrm{mm}$, the vernier constant (in cm) is:",
    option_a: "$\\frac{1}{100(N+1)}$",
    option_b: "$\\frac{1}{100N}$",
    option_c: "$\\frac{1}{10(N+1)}$",
    option_d: "$\\frac{1}{10N}$",
    question_image: null,
  }],
]);

function combinedText(row) {
  return [row.question, row.option_a, row.option_b, row.option_c, row.option_d].join(" ");
}

function repairFor(row) {
  const number = Number(row.question_number);
  if (!FORCE_SOURCE_IMAGE_ONLY && exactOverrides.has(number)) return { mode: "structured", ...exactOverrides.get(number) };
  const content = combinedText(row);
  if (FORCE_SOURCE_IMAGE_ONLY || visualPattern.test(content) || damagedMathPattern.test(content)) {
    return {
      mode: "image-only",
      question: PLACEHOLDER,
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      question_image: row.question_image,
    };
  }
  return { mode: "structured", question_image: null };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const { data: rows, error } = await supabase
    .from("pyq_questions")
    .select("*")
    .eq("exam", "NEET")
    .eq("year", 2024)
    .eq("paper_code", "NEET 2024")
    .order("question_number");
  if (error) throw error;
  if (rows.length !== 200) throw new Error(`Expected 200 NEET 2024 rows, found ${rows.length}`);
  try {
    await fs.access(BACKUP_PATH);
  } catch {
    await fs.writeFile(BACKUP_PATH, JSON.stringify(rows, null, 2));
  }

  const originalRows = JSON.parse(await fs.readFile(BACKUP_PATH, "utf8"));
  const originalById = new Map(originalRows.map((row) => [row.id, row]));
  const updates = rows.map((row) => {
    const original = originalById.get(row.id);
    if (!original) throw new Error(`Backup is missing row ${row.id}`);
    return { id: row.id, number: row.question_number, ...repairFor(original) };
  });
  const report = {
    mode: APPLY ? "apply" : "dry-run",
    total: rows.length,
    structuredText: updates.filter((item) => item.mode === "structured").length,
    imageOnlyFallback: updates.filter((item) => item.mode === "image-only").length,
    redundantImagesRemoved: updates.filter((item) => item.mode === "structured").length,
    exactOverrides: FORCE_SOURCE_IMAGE_ONLY ? [] : [...exactOverrides.keys()],
    sourceImageOnly: FORCE_SOURCE_IMAGE_ONLY,
    backupPath: BACKUP_PATH,
  };

  if (APPLY) {
    for (let index = 0; index < updates.length; index += 20) {
      await Promise.all(updates.slice(index, index + 20).map(async ({ id, number, mode, ...patch }) => {
        const { error: updateError } = await supabase.from("pyq_questions").update(patch).eq("id", id);
        if (updateError) throw new Error(`Q${number}: ${updateError.message}`);
      }));
    }
    const { data: verified, error: verifyError } = await supabase
      .from("pyq_questions")
      .select("question_number,question,question_image,option_a,option_b,option_c,option_d")
      .eq("exam", "NEET")
      .eq("year", 2024)
      .eq("paper_code", "NEET 2024")
      .order("question_number");
    if (verifyError) throw verifyError;
    const q23 = verified.find((row) => row.question_number === 23);
    report.verified = {
      total: verified.length,
      structuredWithoutImage: verified.filter((row) => row.question !== PLACEHOLDER && !row.question_image).length,
      imageFallbacks: verified.filter((row) => row.question === PLACEHOLDER && row.question_image).length,
      duplicatedTextAndImage: verified.filter((row) => row.question !== PLACEHOLDER && row.question_image).length,
      q23,
    };
    if (report.verified.total !== 200 || report.verified.duplicatedTextAndImage !== 0) {
      throw new Error("Presentation verification failed");
    }
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
