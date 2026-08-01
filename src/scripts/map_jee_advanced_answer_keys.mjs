/** Map the supplied JEE Advanced 2023-2025 answer keys onto existing PYQs. */
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const dryRun = process.argv.includes("--dry-run");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase credentials are required");
}

const keys = {
  "JEE-ADV-23-P1": {
    Maths: ["ACD", "AC", "BCD", "C", "A", "B", "A", "3", "8", "1219", "281", "45", "3", "A", "A", "B", "B"],
    Physics: ["ACD", "ACD", "ABCD", "A", "B", "A", "A", "3", "150 or 220", "1", "121", "40", "10", "A", "C", "B", "D"],
    Chemistry: ["BCD", "CD", "B", "C", "A", "B", "B", "222", "100", "5", "7", "8", "28", "D", "D", "B", "D"],
  },
  "JEE-ADV-23-P2": {
    Maths: ["C", "B", "C", "B", "BC", "AB", "ABC", "0", "16", "31", "512", "3780", "2", "1008", "0.25", "24", "0.5"],
    Physics: ["B", "A", "A", "C", "BD", "ABCD", "AD", "30", "4", "5", "25", "16", "2", "648", "8.2", "47.1 or 60.8", "18 or 20"],
    Chemistry: ["C", "A", "B", "A", "CD", "ABD", "CD", "18", "5", "6", "30", "682", "1791", "0.31", "300", "9", "51"],
  },
  "JEE-ADV-24-P1": {
    Maths: ["B", "C", "B", "A", "ACD", "BCD", "ABCD", "8", "20", "16", "665", "5", "42", "C", "C", "C", "C"],
    Physics: ["A", "B", "B", "C", "ABC", "ACD", "AB", "25000", "12", "8", "200", "3", "18", "B", "C", "A", "A"],
    Chemistry: ["D", "A", "B", "C", "ABC", "ABD", "AD", "8120", "3", "18", "1", "909", "1", "C", "B", "A", "C"],
  },
  "JEE-ADV-24-P2": {
    Maths: ["B", "B", "B", "D", "BC", "AC", "AC", "51", "11", "1", "2", "12", "5", "20", "36", "0", "0.25"],
    Physics: ["A", "A", "A", "A", "BD", "ABD", "AB", "3", "2", "3", "12", "171", "96", "601.50", "24.00", "0.75", "4.25"],
    Chemistry: ["B", "D", "D", "B", "AC", "ACD", "BD", "2500", "150", "41", "143", "3", "12", "2", "102018", "2", "3"],
  },
  "JEE-ADV-25-P1": {
    Maths: ["C", "A", "C", "C", "AC", "AD", "AD", "105.00", "1.20", "762.00", "2.40", "96.00", "2.00", "C", "B", "A"],
    Physics: ["A", "D", "A", "C", "BD", "D", "AD", "2.00", "22.98", "3.00", "0.75", "75.60 or 94.50", "72.00", "C", "A", "C"],
    Chemistry: ["A", "A", "B", "B", "BC", "AB", "B", "100.00", "2.23 or 2.24", "-7.10", "29.88", "280", "175.00", "A", "B", "B"],
  },
  "JEE-ADV-25-P2": {
    Maths: ["C", "B", "C", "A", "AB", "AC", "AC", "BCD", "0.75", "6.00", "0.30", "-2.00", "-2.00", "0.25", "3.00", "21.00"],
    Physics: ["B", "C", "C", "B", "ABC", "AB", "A", "ABC", "1.66 to 1.67", "11.80", "1.60", "2.33", "0.20", "1.20", "170.00", "31.19 to 32.27"],
    Chemistry: ["A", "A", "D", "C", "CD", "BD", "AC", "BC", "11.00", "3.95", "15.62 or 16.00", "4.16 to 4.17", "2.49", "105.50", "7.71 to 7.73", "2.00"],
  },
};

function parseAnswer(raw) {
  const compact = raw.replaceAll(",", "").replaceAll(" ", "").toUpperCase();
  if (/^[A-D]+$/.test(compact)) {
    const options = [...new Set([...compact].map(value => value.toLowerCase()))];
    return options.length === 1
      ? { question_type: "MCQ", correct_option: options[0], correct_options: null, numerical_answer: null, numerical_min: null, numerical_max: null }
      : { question_type: "MULTIPLE_CORRECT", correct_option: options[0], correct_options: options, numerical_answer: null, numerical_min: null, numerical_max: null };
  }
  const values = [...raw.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
  if (!values.length) throw new Error(`Unrecognized answer: ${raw}`);
  const isRange = /\bto\b/i.test(raw);
  const hasAlternatives = /\bor\b/i.test(raw);
  return {
    question_type: "NUMERICAL",
    correct_option: "a",
    correct_options: hasAlternatives ? values.map(String) : null,
    numerical_answer: values[0],
    numerical_min: isRange ? Math.min(...values) : null,
    numerical_max: isRange ? Math.max(...values) : null,
  };
}

for (const [paperCode, subjects] of Object.entries(keys)) {
  const expected = paperCode.includes("25-") ? 48 : 51;
  const mapped = Object.entries(subjects).flatMap(([subject, answers]) =>
    answers.map((answer, subjectIndex) => ({ subject, subjectIndex: subjectIndex + 1, answer, ...parseAnswer(answer) })),
  );
  if (mapped.length !== expected) throw new Error(`${paperCode}: expected ${expected} mapped answers; found ${mapped.length}`);

  const { data: questions, error } = await supabase
    .from("pyq_questions")
    .select("id,question_number,subject,question_type,correct_option,correct_options,numerical_answer,numerical_min,numerical_max,explanation")
    .eq("paper_code", paperCode)
    .order("question_number");
  if (error) throw new Error(`${paperCode}: ${error.message}`);
  if (questions.length !== expected) throw new Error(`${paperCode}: expected ${expected} rows; found ${questions.length}`);

  let changed = 0;
  for (let index = 0; index < mapped.length; index += 1) {
    const question = questions[index];
    const answer = mapped[index];
    if (question.question_number !== index + 1 || question.subject !== answer.subject) {
      throw new Error(`${paperCode} Q${index + 1}: expected ${answer.subject}, found ${question.subject}`);
    }
    const payload = {
      question_type: answer.question_type,
      correct_option: answer.correct_option,
      correct_options: answer.correct_options,
      numerical_answer: answer.numerical_answer,
      numerical_min: answer.numerical_min,
      numerical_max: answer.numerical_max,
      explanation: `Supplied JEE Advanced answer key: ${answer.answer}.`,
    };
    const differs = Object.entries(payload).some(([field, value]) => JSON.stringify(question[field]) !== JSON.stringify(value));
    if (!differs) continue;
    changed += 1;
    if (!dryRun) {
      const { error: updateError } = await supabase.from("pyq_questions").update(payload).eq("id", question.id);
      if (updateError) throw new Error(`${paperCode} Q${index + 1}: ${updateError.message}`);
    }
  }
  console.log(JSON.stringify({ paper: paperCode, total: mapped.length, changed, dryRun }));
}
