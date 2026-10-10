import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "parse5";

const ROOT = path.resolve("tmp/jee-main-2022/jeenify");
const MASTIVA = path.resolve("tmp/jee-main-2022/mastiva-shifts.json");
const shifts = JSON.parse(await fs.readFile(MASTIVA, "utf8")).Shifts
  .filter((shift) => shift.Year === 2022 && /^jee-main-2022-(june|july)-/.test(shift.Slug))
  .sort((a, b) => a.Month - b.Month || a.Date - b.Date || a.Shift - b.Shift);

function quizFromHtml(html) {
  const doc = parse(html);
  const scripts = [];
  function walk(node) {
    if (node.nodeName === "script" && (node.attrs || []).some((attr) => attr.name === "type" && attr.value === "application/ld+json")) {
      scripts.push(node.childNodes?.map((child) => child.value || "").join("") || "");
    }
    for (const child of node.childNodes || []) walk(child);
  }
  walk(doc);
  const quizzes = [];
  for (const script of scripts) {
    let data;
    try { data = JSON.parse(script); } catch { continue; }
    const quiz = data?.["@graph"]?.find((item) => item?.["@type"] === "Quiz");
    if (quiz?.hasPart) quizzes.push(quiz);
  }
  if (quizzes.length) return quizzes.sort((a, b) => b.hasPart.length - a.hasPart.length)[0];
  throw new Error("Quiz JSON-LD not found");
}

await fs.mkdir(ROOT, { recursive: true });
for (const [index, shift] of shifts.entries()) {
  const match = shift.Slug.match(/^jee-main-2022-(june|july)-(\d+)-shift-(\d)$/);
  const route = `${match[1]}-${match[2]}-shift-${match[3]}`;
  const htmlFile = path.join(ROOT, `${route}.html`);
  let html;
  try { html = await fs.readFile(htmlFile, "utf8"); } catch {
    const response = await fetch(`https://www.jeenify.com/jee-main-pyq/2022/${route}`, { headers: { "user-agent": "Prepzii JEE 2022 answer-key QA/1.0" } });
    if (response.status === 404) { console.log(`${index + 1}/${shifts.length} ${route}: unavailable`); continue; }
    if (!response.ok) throw new Error(`${route}: ${response.status}`);
    html = await response.text();
    await fs.writeFile(htmlFile, html);
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  const quiz = quizFromHtml(html);
  const questions = quiz.hasPart.map((item, questionIndex) => ({
    order: questionIndex + 1,
    question: item.name,
    answer: item.acceptedAnswer?.text ?? "",
  }));
  await fs.writeFile(path.join(ROOT, `${route}.json`), `${JSON.stringify({ slug: shift.Slug, source_url: quiz.url, questions }, null, 2)}\n`);
  console.log(`${index + 1}/${shifts.length} ${route}: ${questions.length}`);
}
