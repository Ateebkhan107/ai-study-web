import fs from "node:fs/promises";
import path from "node:path";

const BASE = "https://questions.examside.com/past-years/year-wise/jee/jee-main";
const ROOT = path.resolve("tmp/jee-main-2022/examside");
const ONLY = process.argv[2] || null;

const ordinals = new Map([
  [24, "24th"], [25, "25th"], [26, "26th"], [27, "27th"],
  [28, "28th"], [29, "29th"], [30, "30th"],
]);

const papers = [];
for (const day of [24, 25, 26, 27, 28, 29]) {
  for (const shift of [1, 2]) papers.push({ day, month: "june", shift });
}
papers.push({ day: 30, month: "june", shift: 1 });
for (const day of [25, 26, 27, 28, 29]) {
  for (const shift of [1, 2]) papers.push({ day, month: "july", shift });
}

for (const paper of papers) {
  paper.paperCode = `JEE-MAIN-22-${paper.day}${paper.month === "june" ? "JUN" : "JUL"}-S${paper.shift}`;
  paper.slug = `jee-main-2022-online-${ordinals.get(paper.day)}-${paper.month}-${paper.shift === 1 ? "morning" : "evening"}-shift`;
}

function unflatten(values) {
  const result = Array(values.length);
  const completed = new Set();
  function hydrate(index) {
    if (index === -1) return undefined;
    if (index === -2) return Number.NaN;
    if (index === -3) return Number.POSITIVE_INFINITY;
    if (index === -4) return Number.NEGATIVE_INFINITY;
    if (index === -5) return -0;
    if (completed.has(index)) return result[index];
    const value = values[index];
    if (value === null || typeof value !== "object") {
      result[index] = value;
      completed.add(index);
      return value;
    }
    const output = Array.isArray(value) ? [] : {};
    result[index] = output;
    completed.add(index);
    if (Array.isArray(value)) {
      for (const child of value) output.push(hydrate(child));
    } else {
      for (const [key, child] of Object.entries(value)) output[key] = hydrate(child);
    }
    return output;
  }
  return hydrate(0);
}

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

async function fetchText(url, attempts = 5) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "Prepzii source QA/1.0" } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError;
}

async function getCached(url, file) {
  if (await exists(file)) return fs.readFile(file, "utf8");
  const text = await fetchText(url);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text);
  return text;
}

function decodeData(text) {
  const payload = JSON.parse(text);
  return payload.nodes.filter((node) => node?.data).map((node) => unflatten(node.data));
}

for (const paper of papers.filter((item) => !ONLY || item.paperCode === ONLY)) {
  const directory = path.join(ROOT, paper.paperCode);
  const paperUrl = `${BASE}/${paper.slug}`;
  const landingHtml = await getCached(paperUrl, path.join(directory, "index.html"));
  const escapedSlug = paper.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ids = [...landingHtml.matchAll(new RegExp(`${escapedSlug}/([a-z0-9]+)`, "g"))]
    .map((match) => match[1]).filter((id, index, all) => all.indexOf(id) === index);
  if (!ids.length) throw new Error(`${paper.paperCode}: no question links found`);

  const questions = new Map();
  let metadata = null;
  for (let cursor = 0; cursor < ids.length; cursor += 4) {
    const id = ids[cursor];
    const dataText = await getCached(`${paperUrl}/${id}/__data.json`, path.join(directory, "data", `${id}.json`));
    const nodes = decodeData(dataText);
    const page = nodes.find((node) => Array.isArray(node.questions));
    const index = nodes.find((node) => Array.isArray(node.groups));
    if (!page) throw new Error(`${paper.paperCode}/${id}: missing question payload`);
    metadata ??= index;
    for (const question of page.questions) questions.set(question.question_id, question);
    process.stdout.write(`\r${paper.paperCode}: ${questions.size}/${ids.length}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const ordered = ids.map((id) => questions.get(id)).filter(Boolean);
  const output = {
    paper_code: paper.paperCode,
    slug: paper.slug,
    source_url: paperUrl,
    source_question_count: ids.length,
    fetched_question_count: ordered.length,
    subjects: metadata?.subjects ?? [],
    groups: metadata?.groups ?? [],
    questions: ordered,
  };
  await fs.writeFile(path.join(directory, "questions.json"), `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(`\r${paper.paperCode}: ${ordered.length}/${ids.length}\n`);
}

await fs.writeFile(path.join(ROOT, "paper-map.json"), `${JSON.stringify(papers, null, 2)}\n`);
