import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

process.loadEnvFile(".env.local");

const PAPER_CODES = [
  "JEE-MAIN-23-06APR-S1",
  "JEE-MAIN-23-06APR-S2",
  "JEE-MAIN-23-08APR-S1",
  "JEE-MAIN-23-08APR-S2",
  "JEE-MAIN-23-10APR-S1",
  "JEE-MAIN-23-10APR-S2",
  "JEE-MAIN-23-11APR-S1",
  "JEE-MAIN-23-11APR-S2",
  "JEE-MAIN-23-12APR-S1",
  "JEE-MAIN-23-15APR-S1",
];

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceKey) {
  throw new Error("Supabase environment variables are required");
}

const manifest = [];

for (const paperCode of PAPER_CODES) {
  const url = `${baseUrl}/rest/v1/pyq_questions?paper_code=eq.${paperCode}&select=id,paper_code,question_number,question_image,status&order=question_number.asc`;
  const response = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${paperCode}: HTTP ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  if (rows.length !== 90) {
    throw new Error(`${paperCode}: expected 90 rows, found ${rows.length}`);
  }

  manifest.push(...rows);
}

const outputPath = path.join(process.cwd(), "tmp", "jee-main-2023-april-question-image-manifest.json");
await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ outputPath, rows: manifest.length, papers: PAPER_CODES.length }, null, 2));
