import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const dryRun = process.argv.includes("--dry-run");
const PDFTOTEXT = execFileSync("which", ["pdftotext"], { encoding: "utf8" }).trim();

const PAPERS = [
  {
    year: 2026,
    number: 1,
    date: "2026-05-17",
    pdf: "tmp/jee-advanced-2026/p1_solutions_final.pdf",
    paperCode: "JEE-ADV-26-P1",
    shift: "Paper 1",
    sections: [
      { subject: "Maths", firstPage: 1, lastPage: 11, expected: 16 },
      { subject: "Physics", firstPage: 12, lastPage: 25, expected: 16 },
      { subject: "Chemistry", firstPage: 26, lastPage: 35, expected: 16 },
    ],
  },
  {
    year: 2026,
    number: 2,
    date: "2026-05-17",
    pdf: "tmp/jee-advanced-2026/p2_solutions_final.pdf",
    paperCode: "JEE-ADV-26-P2",
    shift: "Paper 2",
    sections: [
      { subject: "Maths", firstPage: 1, lastPage: 9, expected: 18 },
      { subject: "Physics", firstPage: 10, lastPage: 20, expected: 18 },
      { subject: "Chemistry", firstPage: 21, lastPage: 30, expected: 18 },
    ],
  },
];

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase credentials are required");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function extractText(pdf, firstPage, lastPage) {
  return execFileSync(
    PDFTOTEXT,
    ["-f", String(firstPage), "-l", String(lastPage), pdf, "-"],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  );
}

function cleanText(text) {
  return text
    .replace(/\f/g, "\n")
    .replace(/^JEE \(Advanced\) 2026\s+Paper [12]\s*$/gm, "")
    .replace(/^\s*Paper [12]\s*$/gm, "")
    .replace(/^\s*\d+\/\d+\s*$/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compact(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeQuestionBody(text) {
  return compact(
    text
      .replace(/^\s*Q\.\d+\s*/i, "")
      .replace(/\s+_/g, " ___")
      .replace(/[\u00a0]/g, " ")
  );
}

function parseAnswer(raw) {
  const answer = compact(raw).replace(/^Answer Q\d+:\s*/i, "");
  const numericMatch = answer.match(/^\[(.+)\]$/);
  if (numericMatch) {
    const inner = numericMatch[1].trim();
    const values = [...inner.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
    const hasRange = /\bto\b/i.test(inner);
    const hasAlternatives = /\bor\b/i.test(inner);
    return {
      answerLabel: answer,
      questionType: "NUMERICAL",
      correctOption: null,
      correctOptions: hasAlternatives ? values.map(String) : null,
      numericalAnswer: values[0] ?? null,
      numericalMin: hasRange && values.length ? Math.min(...values) : null,
      numericalMax: hasRange && values.length ? Math.max(...values) : null,
    };
  }

  const choices = [...answer.toUpperCase().matchAll(/[A-D]/g)].map((match) => match[0].toLowerCase());
  const unique = [...new Set(choices)];
  if (!unique.length) {
    throw new Error(`Could not parse answer token: ${raw}`);
  }
  return {
    answerLabel: answer,
    questionType: unique.length > 1 ? "MULTIPLE_CORRECT" : "MCQ",
    correctOption: unique[0],
    correctOptions: unique.length > 1 ? unique : null,
    numericalAnswer: null,
    numericalMin: null,
    numericalMax: null,
  };
}

function marksForQuestion(paperNumber, localQuestionNumber) {
  if (paperNumber === 1) {
    if (localQuestionNumber <= 4) return { positive: 3, negative: 1 };
    if (localQuestionNumber <= 8) return { positive: 4, negative: 1 };
    if (localQuestionNumber <= 12) return { positive: 4, negative: 0 };
    return { positive: 4, negative: 1 };
  }

  if (localQuestionNumber <= 4) return { positive: 3, negative: 1 };
  if (localQuestionNumber <= 9) return { positive: 4, negative: 1 };
  if (localQuestionNumber <= 14) return { positive: 4, negative: 0 };
  return { positive: 2, negative: 0 };
}

function parseStemMap(text) {
  const stems = new Map();
  const stemRegex = /Question Stem for Question Nos\.\s*(\d+)\s*and\s*(\d+)/g;
  const qRegex = /^\s*Q\.(\d+)\b/gm;
  const questions = [...text.matchAll(qRegex)];
  const stemMatches = [...text.matchAll(stemRegex)];

  for (const match of stemMatches) {
    const start = match.index;
    const nextQuestion = questions.find((question) => question.index > match.index);
    if (!nextQuestion) continue;
    const stemText = compact(text.slice(start, nextQuestion.index));
    stems.set(Number(match[1]), stemText);
    stems.set(Number(match[2]), stemText);
  }

  return stems;
}

function parseOptions(body) {
  const optionRegex = /\([A-D]\)/g;
  const markers = [...body.matchAll(optionRegex)];
  if (markers.length !== 4) {
    return { questionText: compact(body), options: null };
  }

  const questionText = compact(body.slice(0, markers[0].index));
  const labels = ["A", "B", "C", "D"];
  const options = {};

  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index];
    const start = marker.index + marker[0].length;
    const end = index + 1 < markers.length ? markers[index + 1].index : body.length;
    options[labels[index]] = compact(body.slice(start, end));
  }

  return { questionText, options };
}

function parseQuestions(text, section, paperNumber) {
  const cleaned = cleanText(text);
  const stems = parseStemMap(cleaned);
  const qRegex = /^\s*Q\.(\d+)\b/gm;
  const matches = [...cleaned.matchAll(qRegex)];
  const rows = [];

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const block = cleaned.slice(current.index, next ? next.index : cleaned.length).trim();
    const localQuestionNumber = Number(current[1]);
    const answerMatch = block.match(new RegExp(`Answer Q${localQuestionNumber}:\\s*([^\\n\\r]+)`, "i"));
    if (!answerMatch) {
      throw new Error(`${section.subject} Q${localQuestionNumber}: answer line not found`);
    }

    const answerInfo = parseAnswer(answerMatch[1]);
    const body = normalizeQuestionBody(block.slice(0, answerMatch.index));
    const { questionText, options } = parseOptions(body);
    const stemText = stems.get(localQuestionNumber);
    const finalQuestion = compact([stemText, questionText].filter(Boolean).join("\n\n"));
    const marks = marksForQuestion(paperNumber, localQuestionNumber);

    rows.push({
      localQuestionNumber,
      subject: section.subject,
      question: finalQuestion,
      questionType: answerInfo.questionType,
      optionA: options?.A || null,
      optionB: options?.B || null,
      optionC: options?.C || null,
      optionD: options?.D || null,
      correctOption: answerInfo.correctOption,
      correctOptions: answerInfo.correctOptions,
      numericalAnswer: answerInfo.numericalAnswer,
      numericalMin: answerInfo.numericalMin,
      numericalMax: answerInfo.numericalMax,
      explanation: `Official JEE Advanced 2026 final answer key: ${answerInfo.answerLabel}.`,
      marksPositive: marks.positive,
      marksNegative: marks.negative,
    });
  }

  if (rows.length !== section.expected) {
    throw new Error(`${section.subject}: expected ${section.expected} questions, found ${rows.length}`);
  }

  return rows;
}

async function upsertExam(paper) {
  const payload = {
    exam: "JEE",
    exam_type: "JEE Advanced",
    year: paper.year,
    attempt: "JEE Advanced",
    shift: paper.shift,
    paper_code: paper.paperCode,
    exam_date: paper.date,
    duration_minutes: 180,
    total_marks: paper.number === 1 ? 180 : 188,
    status: "PUBLISHED",
    is_published: true,
  };

  const { data: existing, error: lookupError } = await supabase
    .from("pyq_exams")
    .select("id")
    .eq("paper_code", paper.paperCode)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);

  if (existing) {
    const { error } = await supabase.from("pyq_exams").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return existing.id;
  }

  const { data, error } = await supabase.from("pyq_exams").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function upsertQuestions(paper, examId, rows) {
  const { data: existing, error } = await supabase
    .from("pyq_questions")
    .select("id,question_number")
    .eq("paper_code", paper.paperCode)
    .order("question_number");
  if (error) throw new Error(error.message);

  const existingByNumber = new Map((existing || []).map((row) => [Number(row.question_number), row.id]));
  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const payload = {
      exam_id: examId,
      exam: "JEE",
      exam_type: "JEE Advanced",
      year: paper.year,
      attempt: "JEE Advanced",
      shift: paper.shift,
      paper_code: paper.paperCode,
      question_number: row.question_number,
      display_order: row.display_order,
      subject: row.subject,
      chapter: "Unmapped",
      topic: "Unmapped",
      difficulty: "Medium",
      question_type: row.questionType,
      question: row.question,
      option_a: row.questionType === "NUMERICAL" ? "" : (row.optionA || "Option extraction needs review"),
      option_b: row.questionType === "NUMERICAL" ? "" : (row.optionB || "Option extraction needs review"),
      option_c: row.questionType === "NUMERICAL" ? "" : (row.optionC || "Option extraction needs review"),
      option_d: row.questionType === "NUMERICAL" ? "" : (row.optionD || "Option extraction needs review"),
      correct_option: row.correctOption || "a",
      correct_options: row.correctOptions,
      numerical_answer: row.numericalAnswer,
      numerical_min: row.numericalMin,
      numerical_max: row.numericalMax,
      explanation: row.explanation,
      explanation_image: null,
      question_image: null,
      marks_positive: row.marksPositive,
      marks_negative: row.marksNegative,
      status: "PUBLISHED",
      confidence_score: 1,
    };

    const existingId = existingByNumber.get(row.question_number);
    if (existingId) {
      const { error: updateError } = await supabase.from("pyq_questions").update(payload).eq("id", existingId);
      if (updateError) throw new Error(`${paper.paperCode} Q${row.question_number}: ${updateError.message}`);
      updated += 1;
    } else {
      const { error: insertError } = await supabase.from("pyq_questions").insert(payload);
      if (insertError) throw new Error(`${paper.paperCode} Q${row.question_number}: ${insertError.message}`);
      inserted += 1;
    }
  }

  return { inserted, updated };
}

for (const paper of PAPERS) {
  const parsed = paper.sections.flatMap((section) => parseQuestions(extractText(paper.pdf, section.firstPage, section.lastPage), section, paper.number));
  const rows = parsed.map((row, index) => ({
    ...row,
    question_number: index + 1,
    display_order: index + 1,
  }));
  const missingOptionCount = rows.filter((row) =>
    row.questionType !== "NUMERICAL" && [row.optionA, row.optionB, row.optionC, row.optionD].some((option) => !option)
  ).length;

  const summary = {
    paper: paper.paperCode,
    totalQuestions: rows.length,
    subjects: Object.fromEntries(paper.sections.map((section) => [section.subject, rows.filter((row) => row.subject === section.subject).length])),
    questionTypes: rows.reduce((acc, row) => ({ ...acc, [row.questionType]: (acc[row.questionType] || 0) + 1 }), {}),
    missingOptionCount,
  };

  if (dryRun) {
    console.log(JSON.stringify({ ...summary, dryRun: true }));
    continue;
  }

  const examId = await upsertExam(paper);
  const result = await upsertQuestions(paper, examId, rows);
  console.log(JSON.stringify({ ...summary, examId, ...result }));
}
