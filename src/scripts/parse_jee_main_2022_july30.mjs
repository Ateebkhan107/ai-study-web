import fs from "node:fs/promises";
import path from "node:path";

const CODE = "JEE-MAIN-22-30JUL-S2";
const SOURCE = path.resolve(`tmp/jee-main-2022/sources/${CODE}/zollege-solved.txt`);
const OUT = path.resolve("scratch/jee2022/transcribed");

// NTA's final-key order is the official on-screen order for this exceptional paper.
const answers = [
  2,3,1,3,3,4,3,2,2,1,2,2,3,4,2,3,2,4,1,4,
  711,40,100,8,3,16,942,15,8,40,3,1,1,4,"2 or 4",1,4,2,3,2,4,2,1,2,1,4,2,1,3,2,
  4,3,271,42,1,3,1,4,9,2,
  4,4,3,4,2,3,3,3,4,1,2,3,4,1,2,3,2,1,1,2,0,34,26,27,47,4,75,118,2,68,
].map(String);

function normalize(text) {
  return text
    .replace(/\f/g, "\n")
    .replace(/-\n(?=[a-z])/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function locateQuestions(text) {
  const starts = [];
  let cursor = text.indexOf("General Instructions");
  for (let number = 1; number <= 90; number += 1) {
    const pattern = new RegExp(`(?:^|[\\n\\f])${number}\\.\\s`);
    const relative = text.slice(cursor).search(pattern);
    if (relative < 0) throw new Error(`Could not locate question ${number}`);
    const match = text.slice(cursor + relative).match(pattern);
    const start = cursor + relative + (/^[\n\f]/.test(match[0]) ? 1 : 0);
    starts.push(start);
    const answerAt = text.indexOf("Correct Answer:", start);
    if (answerAt < 0 && number <= 90) throw new Error(`Question ${number} has no keyed-answer marker`);
    cursor = answerAt > 0 ? answerAt + 15 : start + match[0].length;
  }
  return starts;
}

function parseMcq(body) {
  const markers = [...body.matchAll(/(?:^|\n)\(([A-D])\)\s*/g)];
  if (markers.length < 4) return { question: normalize(body), options: ["", "", "", ""] };
  const question = normalize(body.slice(0, markers[0].index));
  const options = markers.slice(0, 4).map((marker, index) => {
    const from = marker.index + marker[0].length;
    const to = markers[index + 1]?.index ?? body.length;
    return normalize(body.slice(from, to));
  });
  return { question, options };
}

const text = await fs.readFile(SOURCE, "utf8");
const starts = locateQuestions(text);
const rows = [];
for (let index = 0; index < 90; index += 1) {
  const number = index + 1;
  const answerAt = text.indexOf("Correct Answer:", starts[index]);
  const rawBody = text.slice(starts[index], answerAt).replace(new RegExp(`^${number}\\.\\s*`), "");
  const local = index % 30 + 1;
  const numerical = local > 20;
  const parsed = numerical ? { question: normalize(rawBody), options: ["", "", "", ""] } : parseMcq(rawBody);
  const subject = number <= 30 ? "Physics" : number <= 60 ? "Chemistry" : "Mathematics";
  rows.push({
    paper_code: CODE,
    question_number: number,
    source_question_number: number,
    subject,
    chapter: "",
    question_type: numerical ? "NUMERICAL" : "MCQ",
    question: parsed.question,
    option_a: parsed.options[0], option_b: parsed.options[1], option_c: parsed.options[2], option_d: parsed.options[3],
    correct_option: numerical ? answers[index] : (answers[index] === "2 or 4" ? "b,d" : "abcd"[Number(answers[index]) - 1]),
    question_image: null,
    option_a_image: null, option_b_image: null, option_c_image: null, option_d_image: null,
  });
}

await fs.mkdir(OUT, { recursive: true });
for (const subject of ["Physics", "Chemistry", "Mathematics"]) {
  const file = path.join(OUT, `${CODE}_${subject.toLowerCase()}.json`);
  await fs.writeFile(file, `${JSON.stringify(rows.filter((row) => row.subject === subject), null, 2)}\n`);
}

const incompleteMcq = rows.filter((row) => row.question_type === "MCQ" && [row.option_a, row.option_b, row.option_c, row.option_d].some((value) => !value));
console.log(JSON.stringify({ count: rows.length, subjects: Object.fromEntries(["Physics", "Chemistry", "Mathematics"].map((s) => [s, rows.filter((r) => r.subject === s).length])), incomplete_mcq: incompleteMcq.map((row) => row.question_number) }, null, 2));
