import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const LIVE = process.argv.includes("--live");
const requestedPaper = process.argv.find((arg) => arg.startsWith("--paper="))?.slice(8);
const ROOT = process.cwd();
const WORK = path.join(ROOT, "scratch", "jee2021");
const manifest = JSON.parse(await fs.readFile(path.join(WORK, "source", "manifest.json"), "utf8"));
const forbidden = /(?:e\s*saral|allen|resonance|mathon\s*go|vedantu|fiitjee|telegram|www\.|https?:)/i;
const failures = [];
const report = { papers: manifest.length, questions: 0, images: 0, live: LIVE };

function balanced(value) { return (String(value ?? "").match(/(?<!\\)\$/g) || []).length % 2 === 0; }
function fail(code, message) { failures.push(`${code}: ${message}`); }

for (const paper of manifest.filter((item) => !requestedPaper || item.paper_code === requestedPaper)) {
  let rows = [];
  for (const subject of ["Physics", "Chemistry", "Mathematics"]) {
    const source = path.join(WORK, "transcribed", `${paper.paper_code}_${subject}.json`);
    try { rows.push(...JSON.parse(await fs.readFile(source, "utf8"))); } catch { fail(paper.paper_code, `missing ${subject} transcription`); }
  }
  rows.sort((a, b) => a.question_number - b.question_number);
  report.questions += rows.length;
  if (rows.length !== 90) fail(paper.paper_code, `${rows.length}/90 questions`);
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.question_number !== index + 1) fail(paper.paper_code, `sequence breaks at Q${index + 1}`);
    if (!row.chapter || /^(unmapped|general)$/i.test(row.chapter.trim())) fail(paper.paper_code, `Q${row.question_number} unmapped chapter`);
    for (const field of ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"]) if (!balanced(row[field])) fail(paper.paper_code, `Q${row.question_number} unbalanced $ in ${field}`);
    for (const letter of ["a", "b", "c", "d"]) if (/^(option\s*[a-d]|\(?[1-4a-d]\)?)$/i.test(String(row[`option_${letter}`] ?? "").trim())) fail(paper.paper_code, `Q${row.question_number} dummy option ${letter}`);
    if (row.question_type === "NUMERICAL" && ["a", "b", "c", "d"].some((letter) => row[`option_${letter}`] !== "")) fail(paper.paper_code, `Q${row.question_number} numerical options not empty`);
    for (const field of ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"]) {
      const image = row[field];
      if (!image || /^https?:/.test(image)) continue;
      report.images += 1;
      try {
        const text = execFileSync("/opt/homebrew/bin/tesseract", [image, "stdout"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
        if (forbidden.test(text)) fail(paper.paper_code, `Q${row.question_number} ${field} contains watermark/banner text`);
      } catch (error) { fail(paper.paper_code, `Q${row.question_number} unreadable ${field}: ${error.message}`); }
    }
  }
}

if (LIVE) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const data = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let query = supabase.from("pyq_questions").select("paper_code,question_number,display_order,subject,chapter,question_type,question,option_a,option_b,option_c,option_d,question_image,option_a_image,option_b_image,option_c_image,option_d_image,status,marks_positive,marks_negative").eq("year", 2021).eq("exam_type", "JEE Main").order("paper_code").order("question_number").range(from, from + pageSize - 1);
    if (requestedPaper) query = query.eq("paper_code", requestedPaper);
    const { data: page, error } = await query;
    if (error) throw error;
    data.push(...page);
    if (page.length < pageSize) break;
  }
  for (const paper of manifest.filter((item) => !requestedPaper || item.paper_code === requestedPaper)) {
    const rows = data.filter((row) => row.paper_code === paper.paper_code);
    if (rows.length !== 90) fail(paper.paper_code, `live database has ${rows.length}/90 rows`);
  }
  const liveRows = requestedPaper ? data.filter((row) => row.paper_code === requestedPaper) : data;
  const urls = liveRows.flatMap((row) => [row.question_image, row.option_a_image, row.option_b_image, row.option_c_image, row.option_d_image]).filter(Boolean);
  for (let start = 0; start < urls.length; start += 20) {
    const checks = await Promise.all(urls.slice(start, start + 20).map(async (url, offset) => {
      const response = await fetch(url, { method: "HEAD" });
      return { response, index: start + offset };
    }));
    for (const { response, index } of checks) {
      if (!response.ok) fail("storage", `${response.status} for image ${index + 1}`);
    }
  }
}

await fs.writeFile(path.join(WORK, "reports", LIVE ? "live-audit.json" : "local-audit.json"), `${JSON.stringify({ ...report, failures }, null, 2)}\n`);
if (failures.length) throw new Error(`JEE 2021 audit failed with ${failures.length} issue(s):\n${failures.slice(0, 100).join("\n")}`);
console.log(JSON.stringify({ ...report, failures: 0 }, null, 2));
