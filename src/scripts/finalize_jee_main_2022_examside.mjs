import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const paperCode = process.argv.find((argument) => argument.startsWith("--paper="))?.slice(8);
if (!paperCode) throw new Error("Usage: node src/scripts/finalize_jee_main_2022_examside.mjs --paper=PAPER_CODE");

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");
const IMAGE_DIR = path.join(ROOT, "scratch", "jee2022", "images", paperCode);
const alignmentFile = path.join(ROOT, "tmp", "jee-main-2022", paperCode, "source-alignment.json");
const alignment = JSON.parse(await fs.readFile(alignmentFile, "utf8"));
const rows = [];
for (const subject of SUBJECTS) {
  rows.push(...JSON.parse(await fs.readFile(path.join(TRANSCRIBED, `${paperCode}_${subject.toLowerCase()}.json`), "utf8")));
}
const byNumber = new Map(rows.map((row) => [row.question_number, row]));
await fs.mkdir(IMAGE_DIR, { recursive: true });

function clean(text) {
  return String(text ?? "")
    .replace(/\[IMAGE_\d+\]/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
function cleanOption(text) {
  const value = clean(text);
  return /^[+\-]?\d+(?:\.\d+)?$/.test(value) ? `$${value}$` : value;
}
function extension(url) {
  const value = path.extname(new URL(url).pathname).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp"].includes(value) ? value : ".png";
}
async function download(url, destination) {
  try {
    await fs.access(destination);
    return;
  } catch {
    // Download below.
  }
  const response = await fetch(url, { headers: { "user-agent": "Prepzii JEE 2022 migration QA/1.0" } });
  if (!response.ok) throw new Error(`${response.status} downloading ${url}`);
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

let merged = 0;
let downloaded = 0;
for (const source of alignment.questions) {
  const row = byNumber.get(source.question_number);
  if (!row) continue;
  row.question = clean(source.question) || row.question;
  row.chapter = source.chapter || row.chapter;
  row.correct_option = String(source.correct_option || row.correct_option || "").toLowerCase();
  row.source_url = source.source_url;
  for (const letter of ["a", "b", "c", "d"]) {
    const images = source[`option_${letter}_images`] || [];
    row[`option_${letter}`] = cleanOption(source[`option_${letter}`]);
    row[`option_${letter}_image`] = null;
    if (images[0]?.source_url) {
      const destination = path.join(IMAGE_DIR, `q${row.question_number}_opt_${letter}${extension(images[0].source_url)}`);
      await download(images[0].source_url, destination);
      row[`option_${letter}_image`] = destination;
      downloaded += 1;
    }
  }
  const questionImages = source.question_images || [];
  row.question_image = null;
  if (questionImages[0]?.source_url) {
    const destination = path.join(IMAGE_DIR, `q${row.question_number}${extension(questionImages[0].source_url)}`);
    await download(questionImages[0].source_url, destination);
    row.question_image = destination;
    downloaded += 1;
  }
  merged += 1;
}

for (const row of rows) {
  if (row.question_type !== "MCQ") continue;
  for (const letter of ["a", "b", "c", "d"]) row[`option_${letter}`] = cleanOption(row[`option_${letter}`]);
}
rows.sort((left, right) => left.question_number - right.question_number);
for (const subject of SUBJECTS) {
  await fs.writeFile(
    path.join(TRANSCRIBED, `${paperCode}_${subject.toLowerCase()}.json`),
    `${JSON.stringify(rows.filter((row) => row.subject === subject), null, 2)}\n`,
  );
}
console.log(JSON.stringify({ paper_code: paperCode, merged, downloaded }, null, 2));
