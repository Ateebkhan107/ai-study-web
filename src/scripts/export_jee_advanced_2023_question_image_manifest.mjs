import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

process.loadEnvFile(".env.local");

const PAPER_CODES = ["JEE-ADV-23-P1", "JEE-ADV-23-P2"];
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
  if (rows.length !== 51) {
    throw new Error(`${paperCode}: expected 51 rows, found ${rows.length}`);
  }

  manifest.push(...rows);
}

const outputPath = path.join(process.cwd(), "tmp", "jee-advanced-2023-question-image-manifest.json");
await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ outputPath, rows: manifest.length, papers: PAPER_CODES.length }, null, 2));
