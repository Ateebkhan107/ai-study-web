import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("tmp/jee-main-2022/structured");
const SHIFTS_FILE = path.resolve("tmp/jee-main-2022/mastiva-shifts.json");
const BASE = "https://mastiva.com";
const CONCURRENCY = Number(process.env.JEE2022_FETCH_CONCURRENCY || 2);
const REQUEST_DELAY_MS = Number(process.env.JEE2022_FETCH_DELAY_MS || 350);
const ONLY_SLUGS = new Set(process.argv.slice(2));

function extractPayload(html) {
  const match = html.match(/<script id="__PYQ_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Page has no __PYQ_DATA__ payload");
  return JSON.parse(match[1]);
}

async function fetchText(url, attempts = 12) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "Prepzii JEE 2022 migration QA/1.0" },
      });
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const waitMs = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : Math.min(60_000, 5_000 * attempt);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function mapLimit(items, limit, task) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await task(items[index], index);
    }
  });
  await Promise.all(workers);
}

const shiftsPayload = await readJson(SHIFTS_FILE);
const shifts = shiftsPayload.Shifts.filter(
  (shift) => shift.Year === 2022
    && /^jee-main-2022-(june|july)-/.test(shift.Slug)
    && (ONLY_SLUGS.size === 0 || ONLY_SLUGS.has(shift.Slug)),
).sort((a, b) => a.Month - b.Month || a.Date - b.Date || a.Shift - b.Shift);

if (ONLY_SLUGS.size && shifts.length !== ONLY_SLUGS.size) {
  const found = new Set(shifts.map((shift) => shift.Slug));
  const missing = [...ONLY_SLUGS].filter((slug) => !found.has(slug));
  throw new Error(`Unknown shift slug(s): ${missing.join(", ")}`);
}

await fs.mkdir(ROOT, { recursive: true });

for (const [shiftIndex, shift] of shifts.entries()) {
  const shiftDir = path.join(ROOT, shift.Slug);
  const indexFile = path.join(shiftDir, "index.json");
  let index;
  try {
    index = await readJson(indexFile);
  } catch {
    const html = await fetchText(`${BASE}/pyq/${shift.Slug}`);
    index = extractPayload(html);
    await writeJson(indexFile, index);
  }

  if (index.Questions.length !== 90) {
    throw new Error(`${shift.Slug}: expected 90 index questions, got ${index.Questions.length}`);
  }

  let completed = 0;
  await mapLimit(index.Questions, CONCURRENCY, async (question) => {
    const file = path.join(shiftDir, "questions", `${question.Code}.json`);
    try {
      const cached = await readJson(file);
      if (cached.Questions?.[0]?.ID === question.ID) {
        completed += 1;
        return;
      }
    } catch {
      // Missing or invalid cache: refetch below.
    }

    const html = await fetchText(`${BASE}/q/${question.Code}`);
    const payload = extractPayload(html);
    if (payload.Questions?.length !== 1 || payload.Questions[0].ID !== question.ID) {
      throw new Error(`${shift.Slug}/${question.Code}: unexpected question payload`);
    }
    await writeJson(file, payload);
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    completed += 1;
    if (completed % 15 === 0 || completed === 90) {
      process.stdout.write(`\r${shiftIndex + 1}/${shifts.length} ${shift.Slug}: ${completed}/90`);
    }
  });
  process.stdout.write(`\r${shiftIndex + 1}/${shifts.length} ${shift.Slug}: 90/90\n`);
}

console.log(`Downloaded ${shifts.length} structured papers (${shifts.length * 90} questions).`);
