import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const slug = process.argv[2];
const paperCode = process.argv[3];
if (!slug || !paperCode) throw new Error("Usage: node src/scripts/fetch_mastiva_jee_main_2021.mjs <slug> <paper-code>");
const useJina = process.argv.includes("--jina");

const BASE = "https://mastiva.com";
const output = path.join(process.cwd(), "scratch", "jee2021", "local", paperCode, "mastiva-source.json");
const cacheDir = path.join(process.cwd(), "scratch", "jee2021", "local", paperCode, "mastiva-pages");
const indexCache = path.join(cacheDir, "index.html");
const markdownIndexCache = path.join(cacheDir, "index.md");

function decode(value) {
  return value
    .replaceAll("&quot;", '"').replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}

async function get(url, attempt = 0) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Prepzii educational importer" } });
  if ((response.status === 429 || response.status >= 500) && attempt < 7) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(30000, 1500 * (2 ** attempt))));
    return get(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function pyqData(html, url) {
  const match = html.match(/<script id="__PYQ_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`Missing __PYQ_DATA__: ${url}`);
  return JSON.parse(decode(match[1]));
}

function parseMarkdown(markdown, url) {
  const number = Number(markdown.match(/^### Question (\d+)/m)?.[1]);
  const meta = markdown.match(/^([^\n]+) · ([^\n]+) · ([^\n]+)$/m);
  if (!number || !meta) throw new Error(`Could not parse ${url}`);
  const afterMeta = markdown.slice(meta.index + meta[0].length).trim();
  const end = afterMeta.search(/\nThe answer and worked solution|\n\[Register free\]/);
  const body = (end >= 0 ? afterMeta.slice(0, end) : afterMeta).trim();
  const optionStart = body.search(/^1\.\s+/m);
  const question = (optionStart >= 0 ? body.slice(0, optionStart) : body).trim();
  const options = optionStart < 0 ? [] : [...body.slice(optionStart).matchAll(/^\d\.\s+(.+)$/gm)].map((match) => match[1].trim());
  return { code: url.split("/").pop(), source_number: number, subject: meta[1], chapter: meta[2], section: number % 30 > 20 || number % 30 === 0 ? "B" : "A", question_type: meta[3], question, options, images: {} };
}

await fs.mkdir(cacheDir, { recursive: true });
const indexUrl = `${BASE}/pyq/${slug}`;
let indexHtml;
if (useJina) {
  try { indexHtml = await fs.readFile(markdownIndexCache, "utf8"); }
  catch {
    indexHtml = await get(`https://r.jina.ai/http://mastiva.com/pyq/${slug}`);
    await fs.writeFile(markdownIndexCache, indexHtml);
  }
} else {
  try { indexHtml = await fs.readFile(indexCache, "utf8"); }
  catch {
    indexHtml = await get(indexUrl);
    await fs.writeFile(indexCache, indexHtml);
  }
}
const linkPattern = useJina ? /https:\/\/mastiva\.com\/q\/([a-z0-9]+)/g : /href="https:\/\/mastiva\.com\/q\/([a-z0-9]+)"/g;
const links = [...indexHtml.matchAll(linkPattern)].map((match) => match[1]);
const codes = [...new Set(links)];
if (codes.length !== 90) throw new Error(`Expected 90 question links, found ${codes.length}`);

const questions = new Array(codes.length);
let cursor = 0;
async function worker() {
  while (cursor < codes.length) {
    const index = cursor++;
    const code = codes[index];
    const url = `${BASE}/q/${code}`;
    const cache = path.join(cacheDir, `${code}.${useJina ? "md" : "html"}`);
    let html;
    try { html = await fs.readFile(cache, "utf8"); }
    catch {
      html = await get(useJina ? `https://r.jina.ai/http://mastiva.com/q/${code}` : url);
      await fs.writeFile(cache, html);
      await new Promise((resolve) => setTimeout(resolve, useJina ? 50 : 1200));
    }
    if (useJina) {
      questions[index] = parseMarkdown(html, url);
      process.stdout.write(`\rFetched ${questions.filter(Boolean).length}/90`);
      continue;
    }
    const data = pyqData(html, url);
    const raw = data.Questions?.[0];
    if (!raw) throw new Error(`No question object: ${url}`);
    questions[index] = {
      code: raw.Code,
      source_number: Number(raw.QuestionNumber),
      subject: raw.Subject?.Name,
      chapter: raw.Chapter?.Name,
      section: raw.Section,
      question_type: raw.QuestionType?.Name,
      question: raw.QuestionText,
      options: JSON.parse(raw.QuestionChoices || "[]").map((choice) => choice.text),
      images: JSON.parse(raw.ImagesJson || "{}"),
    };
    process.stdout.write(`\rFetched ${questions.filter(Boolean).length}/90`);
  }
}
await Promise.all(Array.from({ length: useJina ? 6 : 1 }, worker));
process.stdout.write("\n");
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(questions, null, 2)}\n`);
console.log(JSON.stringify({ paperCode, questions: questions.length, output }));
