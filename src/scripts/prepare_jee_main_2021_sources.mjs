import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const WORK = path.join(ROOT, "scratch", "jee2021");
const INDEX = path.join(WORK, "source", "index.html");
const MANIFEST = path.join(WORK, "source", "manifest.json");
const PDF_ROOT = path.join(WORK, "source", "pdfs");
const download = process.argv.includes("--download");

const monthInfo = {
  feb: { number: "02", label: "February", code: "FEB" },
  march: { number: "03", label: "March", code: "MAR" },
  july: { number: "07", label: "July", code: "JUL" },
  aug: { number: "08", label: "August", code: "AUG" },
  sep: { number: "09", label: "August", code: "SEP" },
};

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function parseIndex(html) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
  const papers = [];
  for (const row of rows) {
    const text = stripTags(row);
    const date = text.match(/(\d{1,2})(?:st|nd|rd|th)\s+(Feb|March|July|Aug|Sep)\s+2021\s*-\s*Shift\s*([12])/i);
    if (!date) continue;
    const day = String(Number(date[1])).padStart(2, "0");
    const monthKey = date[2].toLowerCase();
    const month = monthInfo[monthKey];
    const shift = Number(date[3]);
    const links = {};
    for (const anchor of row.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const label = stripTags(anchor[2]).toLowerCase();
      const subject = label.includes("math") ? "mathematics" : label.includes("phys") ? "physics" : label.includes("chem") ? "chemistry" : null;
      if (subject) links[subject] = decodeHtml(anchor[1]);
    }
    if (Object.keys(links).length !== 3) throw new Error(`Expected three subject PDFs for ${text}`);
    const paperCode = `JEE-MAIN-21-${day}${month.code}-S${shift}`;
    papers.push({
      paper_code: paperCode,
      exam_date: `2021-${month.number}-${day}`,
      session: month.label,
      attempt: `${monthCode === "SEP" ? "September" : month.label} ${Number(day)} - Shift ${shift}`,
      shift: `Shift ${shift}`,
      sources: links,
    });
  }
  return papers;
}

async function downloadFile(url, destination) {
  try {
    const stat = await fs.stat(destination);
    if (stat.size > 10_000) return { cached: true, bytes: stat.size };
  } catch {}
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error(`Not a PDF: ${url}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, bytes);
  return { cached: false, bytes: bytes.length };
}

async function pool(items, concurrency, worker) {
  let cursor = 0;
  const results = [];
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }));
  return results;
}

const html = await fs.readFile(INDEX, "utf8");
const papers = parseIndex(html);
if (papers.length !== 26) throw new Error(`Expected 26 papers, found ${papers.length}`);
if (new Set(papers.map((paper) => paper.paper_code)).size !== 26) throw new Error("Duplicate paper codes found");
await fs.writeFile(MANIFEST, `${JSON.stringify(papers, null, 2)}\n`);
console.log(`Wrote ${MANIFEST} with ${papers.length} papers and ${papers.length * 3} subject PDFs.`);

if (download) {
  const jobs = papers.flatMap((paper) => Object.entries(paper.sources).map(([subject, url]) => ({ paper, subject, url })));
  const results = await pool(jobs, 6, async ({ paper, subject, url }, index) => {
    const destination = path.join(PDF_ROOT, paper.paper_code, `${subject}.pdf`);
    const result = await downloadFile(url, destination);
    console.log(`${index + 1}/${jobs.length} ${paper.paper_code} ${subject}: ${result.cached ? "cached" : "downloaded"} (${result.bytes} bytes)`);
    return { ...result, destination };
  });
  const tooSmall = results.filter((result) => result.bytes <= 10_000);
  if (results.length !== 78 || tooSmall.length) throw new Error(`PDF validation failed: ${results.length}/78 files, ${tooSmall.length} too small`);
  console.log("Validated all 78 source PDFs.");
}
