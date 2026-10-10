import fs from "node:fs/promises";
import path from "node:path";

const TRANSCRIBED = path.resolve("scratch/jee2022/transcribed");
const WORK = path.resolve("tmp/jee-main-2022");
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
function tokens(text) {
  const stop = new Set(["the", "a", "an", "is", "are", "of", "in", "to", "and", "for", "with", "which", "following"]);
  return new Set(String(text).toLowerCase().replace(/\\[a-z]+/g, " ").match(/[a-z]{2,}|\d+(?:\.\d+)?/g)?.filter((token) => !stop.has(token)) || []);
}
function similarity(left, right) {
  const a = tokens(left), b = tokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / Math.min(a.size, b.size);
}
function normalized(text) {
  return String(text).toLowerCase().replace(/\$|\\(?:mathrm|text)\b|[{}()[\],.:;\s]/g, "").replace(/\\/g, "");
}
function optionFromAnswer(row, answer) {
  const explicit = String(answer).match(/\boption\s*([1-4a-d])\b/i)?.[1]?.toLowerCase();
  if (explicit) return /[1-4]/.test(explicit) ? "abcd"[Number(explicit) - 1] : explicit;
  const fields = ["option_a", "option_b", "option_c", "option_d"];
  const target = normalized(answer);
  const exact = fields.findIndex((field) => normalized(row[field]) === target && target);
  if (exact >= 0) return "abcd"[exact];
  const scores = fields.map((field) => similarity(answer, row[field]));
  const best = Math.max(...scores);
  return best >= 0.5 ? "abcd"[scores.indexOf(best)] : "";
}
function alignJeenify(rows, questions) {
  const edges = [];
  questions.forEach((source, sourceIndex) => rows.forEach((row, rowIndex) => {
    edges.push({ sourceIndex, rowIndex, score: similarity(source.question, row.question) });
  }));
  edges.sort((a, b) => b.score - a.score);
  const usedSources = new Set(), usedRows = new Set(), assignments = [];
  for (const edge of edges) {
    if (edge.score < 0.35 || usedSources.has(edge.sourceIndex) || usedRows.has(edge.rowIndex)) continue;
    usedSources.add(edge.sourceIndex); usedRows.add(edge.rowIndex);
    assignments.push({ row: rows[edge.rowIndex], source: questions[edge.sourceIndex], score: edge.score });
  }
  return assignments;
}

const july30Source = [
  2,3,1,3,3,4,3,2,2,1,2,2,3,4,2,3,2,4,1,4,
  711,40,100,8,3,16,942,15,8,40,3,1,1,4,"2 or 4",1,4,2,3,2,4,2,1,2,1,4,2,1,3,2,
  4,3,271,42,1,3,1,4,9,2,
  4,4,3,4,2,3,3,3,4,1,2,3,4,1,2,3,2,1,1,2,0,34,26,27,47,4,75,118,2,68,
].map(String);

const paperCodes = [...new Set((await fs.readdir(TRANSCRIBED)).map((name) => name.match(/^(JEE-MAIN-22-\d+(?:JUN|JUL)-S\d)_/)?.[1]).filter(Boolean))].sort();
const report = [];
for (const code of paperCodes) {
  const rows = [];
  for (const subject of SUBJECTS) {
    const file = path.join(TRANSCRIBED, `${code}_${subject.toLowerCase()}.json`);
    if (await exists(file)) rows.push(...JSON.parse(await fs.readFile(file, "utf8")));
  }
  rows.sort((a, b) => a.question_number - b.question_number);
  const candidates = new Map(rows.map((row) => [row.question_number, []]));

  const alignmentFile = path.join(WORK, code, "source-alignment.json");
  if (await exists(alignmentFile)) {
    const alignment = JSON.parse(await fs.readFile(alignmentFile, "utf8"));
    for (const item of alignment.questions) if (item.question_number && item.correct_option) {
      candidates.get(item.question_number)?.push({ source: "ExamSIDE", answer: String(item.correct_option).toLowerCase() });
    }
  }

  const officialFile = path.join(WORK, code, "official-answers.json");
  if (await exists(officialFile)) {
    const official = JSON.parse(await fs.readFile(officialFile, "utf8"));
    for (const audit of official.audit) {
      if (audit.answers !== 30) continue;
      const offset = audit.subject === "physics" ? 0 : audit.subject === "chemistry" ? 30 : 60;
      for (let local = 1; local <= 30; local += 1) {
        const answer = official.answers[String(offset + local)];
        if (answer != null) candidates.get(offset + local)?.push({ source: "eSaral official NTA label", answer: String(answer).toLowerCase() });
      }
    }
  }

  const codeMatch = code.match(/JEE-MAIN-22-(\d+)(JUN|JUL)-S(\d)/);
  const route = `${codeMatch[2] === "JUN" ? "june" : "july"}-${codeMatch[1]}-shift-${codeMatch[3]}`;
  const jeenifyFile = path.join(WORK, "jeenify", `${route}.json`);
  if (await exists(jeenifyFile)) {
    const jeenify = JSON.parse(await fs.readFile(jeenifyFile, "utf8"));
    for (const { row, source, score } of alignJeenify(rows, jeenify.questions)) {
      if (!source.answer || /see solution/i.test(source.answer)) continue;
      const answer = row.question_type === "MCQ" ? optionFromAnswer(row, source.answer) : source.answer;
      if (answer) candidates.get(row.question_number)?.push({ source: "Jeenify answer text", answer: String(answer).toLowerCase(), score });
    }
  }

  if (code === "JEE-MAIN-22-30JUL-S2") {
    july30Source.forEach((answer, index) => candidates.get(index + 1)?.push({ source: "NTA provisional final key", answer: /^[1-4]$/.test(answer) && (index % 30) < 20 ? "abcd"[Number(answer) - 1] : answer }));
  }

  const conflicts = [];
  for (const row of rows) {
    const values = candidates.get(row.question_number) || [];
    const unique = [...new Set(values.map((item) => item.answer))];
    if (unique.length > 1) conflicts.push({ question_number: row.question_number, candidates: values });
    const official = values.find((item) => item.source.startsWith("eSaral") || item.source.startsWith("NTA"));
    const selected = official || values.find((item) => item.source === "Jeenify answer text") || values.find((item) => item.source === "ExamSIDE") || values[0];
    row.correct_option = selected?.answer || "";
  }
  for (const subject of SUBJECTS) {
    const file = path.join(TRANSCRIBED, `${code}_${subject.toLowerCase()}.json`);
    await fs.writeFile(file, `${JSON.stringify(rows.filter((row) => row.subject === subject), null, 2)}\n`);
  }
  report.push({ paper_code: code, question_count: rows.length, answers_filled: rows.filter((row) => row.correct_option).length, missing_answers: rows.filter((row) => !row.correct_option).map((row) => row.question_number), conflicts });
}
await fs.writeFile(path.join(TRANSCRIBED, "answer-merge-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
for (const item of report) console.log(`${item.paper_code}: ${item.answers_filled}/${item.question_count} answers, conflicts=${item.conflicts.length}`);
