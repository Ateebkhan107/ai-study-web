import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("tmp/jee-main-2022/zollege-pdfs");
const WORK = path.resolve("tmp/jee-main-2022");
const OUT = path.resolve("scratch/jee2022/transcribed");
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

function normalize(text) {
  return String(text || "").replace(/\f/g, "\n").replace(/-\n(?=[a-z])/g, "")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function tokens(text) {
  const stop = new Set(["the", "a", "an", "is", "are", "of", "in", "to", "and", "for", "with", "which", "following"]);
  return new Set(String(text).toLowerCase().match(/[a-z]{2,}|\d+(?:\.\d+)?/g)?.filter((token) => !stop.has(token)) || []);
}
function similarity(left, right) {
  const a = tokens(left), b = tokens(right); if (!a.size || !b.size) return 0;
  let intersection = 0; for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / Math.min(a.size, b.size);
}
function assignOptimal(records, positions, cropText) {
  const n = records.length, m = positions.length;
  const scores = records.map((record) => positions.map((number) => similarity(
    `${record.question} ${record.option_a} ${record.option_b} ${record.option_c} ${record.option_d}`, cropText.get(number) || "",
  )));
  const u = Array(n + 1).fill(0), v = Array(m + 1).fill(0), p = Array(m + 1).fill(0), way = Array(m + 1).fill(0);
  for (let row = 1; row <= n; row += 1) {
    p[0] = row; let c0 = 0; const minv = Array(m + 1).fill(Infinity), used = Array(m + 1).fill(false);
    do {
      used[c0] = true; const r0 = p[c0]; let delta = Infinity, c1 = 0;
      for (let c = 1; c <= m; c += 1) if (!used[c]) {
        const current = (1 - scores[r0 - 1][c - 1]) - u[r0] - v[c];
        if (current < minv[c]) { minv[c] = current; way[c] = c0; }
        if (minv[c] < delta) { delta = minv[c]; c1 = c; }
      }
      for (let c = 0; c <= m; c += 1) used[c] ? (u[p[c]] += delta, v[c] -= delta) : (minv[c] -= delta);
      c0 = c1;
    } while (p[c0] !== 0);
    do { const c1 = way[c0]; p[c0] = p[c1]; c0 = c1; } while (c0 !== 0);
  }
  for (let c = 1; c <= m; c += 1) {
    const row = p[c] - 1; records[row].question_number = positions[c - 1]; records[row].alignment_score = Number(scores[row][c - 1].toFixed(4));
  }
}
function locateQuestions(text, label) {
  const starts = [];
  const answers = [...text.matchAll(/Correct Answer:/g)].map((match) => match.index);
  if (answers.length !== 90) throw new Error(`expected 90 answer markers, found ${answers.length}`);
  for (let number = 1; number <= 90; number += 1) {
    const pattern = new RegExp(`(?:^|[\\n\\f])\\s*${number}\\.\\s*`);
    const from = number === 1 ? text.indexOf("General Instructions") : answers[number - 2] + 15;
    const segment = text.slice(from, answers[number - 1]);
    const matches = [...segment.matchAll(new RegExp(pattern.source, "g"))];
    if (!matches.length) throw new Error(`${label}: missing q${number}`);
    const match = matches.at(-1); const prefix = match[0].match(/^[\n\f]/)?.[0]?.length || 0;
    starts.push(from + match.index + prefix);
  }
  return starts;
}
function parseBody(body, numerical) {
  if (numerical) return { question: normalize(body), options: ["", "", "", ""] };
  const markers = [...body.matchAll(/(?:^|\n)\s*\(([A-D])\)\s*/g)];
  if (markers.length < 4) return { question: normalize(body), options: ["", "", "", ""] };
  return {
    question: normalize(body.slice(0, markers[0].index)),
    options: markers.slice(0, 4).map((marker, index) => normalize(body.slice(marker.index + marker[0].length, markers[index + 1]?.index ?? body.length))),
  };
}

await fs.mkdir(OUT, { recursive: true });
const audits = [];
for (const entry of (await fs.readdir(ROOT)).filter((name) => name.endsWith(".txt")).sort()) {
  const code = entry.replace(/\.txt$/, ""); const text = await fs.readFile(path.join(ROOT, entry), "utf8");
  const starts = locateQuestions(text, code); const cropText = new Map();
  for (let q = 1; q <= 90; q += 1) cropText.set(q, await fs.readFile(path.join(WORK, code, "official-ocr", `q${q}.txt`), "utf8"));
  const rows = [];
  for (let index = 0; index < 90; index += 1) {
    const sourceNumber = index + 1, local = index % 30 + 1, numerical = local > 20;
    const answerAt = text.indexOf("Correct Answer:", starts[index]);
    const rawBody = text.slice(starts[index], answerAt).replace(new RegExp(`^\\s*${sourceNumber}\\.\\s*`), "");
    const parsed = parseBody(rawBody, numerical);
    const answerLine = text.slice(answerAt + 15, text.indexOf("\n", answerAt + 15)).trim();
    rows.push({ source_question_number: sourceNumber, source_group: Math.floor(index / 30), question_number: null, subject: null, chapter: "", question_type: numerical ? "NUMERICAL" : "MCQ", question: parsed.question,
      option_a: parsed.options[0], option_b: parsed.options[1], option_c: parsed.options[2], option_d: parsed.options[3],
      correct_option: numerical ? answerLine.replace(/^\(?[A-D]\)?\s*/i, "").trim() : (answerLine.match(/^\(([A-D])\)/i)?.[1]?.toLowerCase() || ""),
      question_image: null, option_a_image: null, option_b_image: null, option_c_image: null, option_d_image: null });
  }
  const availableSubjects = new Set(SUBJECTS);
  for (let group = 0; group < 3; group += 1) {
    const groupRows = rows.filter((row) => row.source_group === group);
    let bestSubject = null, bestScore = -1;
    for (const subject of availableSubjects) {
      const offset = SUBJECTS.indexOf(subject) * 30;
      const score = groupRows.reduce((sum, row, i) => sum + similarity(`${row.question} ${row.option_a} ${row.option_b}`, cropText.get(offset + i + 1)), 0);
      if (score > bestScore) { bestScore = score; bestSubject = subject; }
    }
    availableSubjects.delete(bestSubject); groupRows.forEach((row) => { row.subject = bestSubject; });
  }
  for (const subject of SUBJECTS) {
    const offset = SUBJECTS.indexOf(subject) * 30;
    for (const [type, from, to] of [["MCQ", 1, 20], ["NUMERICAL", 21, 30]]) {
      assignOptimal(rows.filter((row) => row.subject === subject && row.question_type === type), Array.from({ length: to - from + 1 }, (_, i) => offset + from + i), cropText);
    }
  }
  rows.sort((a, b) => a.question_number - b.question_number);
  for (const row of rows) { row.paper_code = code; delete row.source_group; }
  for (const subject of SUBJECTS) await fs.writeFile(path.join(OUT, `${code}_${subject.toLowerCase()}.json`), `${JSON.stringify(rows.filter((row) => row.subject === subject), null, 2)}\n`);
  audits.push({ paper_code: code, count: rows.length, subject_counts: Object.fromEntries(SUBJECTS.map((s) => [s, rows.filter((r) => r.subject === s).length])), empty_mcq_options: rows.filter((r) => r.question_type === "MCQ" && [r.option_a,r.option_b,r.option_c,r.option_d].some((x) => !x)).map((r) => r.question_number), min_alignment: Math.min(...rows.map((r) => r.alignment_score)) });
}
await fs.writeFile(path.join(OUT, "zollege-normalization-audit.json"), `${JSON.stringify(audits, null, 2)}\n`);
console.log(JSON.stringify(audits, null, 2));
