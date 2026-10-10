import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

process.loadEnvFile(".env.local");
if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

const paperCode = process.argv[2];
const subjectArg = process.argv[3]?.toLowerCase();
const auditMode = process.argv.includes("--audit");
if (!paperCode || !["physics", "chemistry", "mathematics"].includes(subjectArg)) {
  throw new Error("Usage: node src/scripts/transcribe_jee_main_2022_pdf.mjs PAPER_CODE physics|chemistry|mathematics");
}

const source = path.resolve("tmp/jee-main-2022/sources", paperCode, `${subjectArg}.pdf`);
const subject = subjectArg === "mathematics" ? "Mathematics" : `${subjectArg[0].toUpperCase()}${subjectArg.slice(1)}`;
const output = path.resolve("scratch/jee2022/transcribed", `${paperCode}_${subject.toLowerCase()}.json`);
const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function parseJson(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const value = JSON.parse(cleaned);
  return Array.isArray(value) ? value : value.questions;
}

let draft = null;
if (auditMode) {
  draft = JSON.parse(await fs.readFile(output, "utf8"));
}

const prompt = `${auditMode ? "AUDIT AND CORRECT the supplied draft by comparing every character against" : "Transcribe the ORIGINAL EXAM QUESTIONS from"} this JEE Main 2022 ${subject} solution PDF. The PDF contains exactly 30 original questions followed by worked solutions. Ignore all worked-solution prose. Section A contains local questions 1-20 (MCQ). Section B contains local questions 21-30 (numerical), although the PDF may print them as a restarted 1-10 sequence.

Return one JSON array with exactly 30 objects in local question order. Schema:
{
  "local_number": 1,
  "question_type": "MCQ" or "NUMERICAL",
  "chapter": "standard NCERT/JEE chapter name",
  "question": "complete question in clean text with every mathematical expression, variable, exponent, unit expression, matrix, and chemical formula wrapped in balanced $...$ KaTeX",
  "option_a": "complete option text/KaTeX or empty string",
  "option_b": "complete option text/KaTeX or empty string",
  "option_c": "complete option text/KaTeX or empty string",
  "option_d": "complete option text/KaTeX or empty string",
  "correct_option": "a/b/c/d for MCQ, exact integer or decimal answer string for NUMERICAL",
  "requires_question_image": true or false,
  "requires_option_images": true or false
}

Rules:
- Preserve every condition, assertion/reason statement, match-list entry, reaction reagent, sign, power, subscript, limit, integral, and unit.
- Use standard KaTeX inside balanced dollar delimiters. Use \\text{} for chemical element symbols or words inside math.
- MCQ option fields must contain the real options; never placeholders such as Option A, (1), or (A).
- Numerical option_a through option_d must all be empty strings.
- For graphic/structural options set requires_option_images=true and all four option strings empty.
- requires_question_image is true only when a diagram/graph/circuit/reaction/table is essential and cannot be represented faithfully as text/KaTeX.
- The answer must come from the PDF's “Official Ans. by NTA” line, not from inference.
- Do not include solution text.
- Do not use General, Unmapped, or empty chapters.
- Return JSON only.`;

const bytes = await fs.readFile(source);
let lastError;
for (let attempt = 0; attempt < 9; attempt += 1) {
  const modelName = models[attempt % models.length];
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    });
    const response = await model.generateContent([
      prompt,
      ...(draft ? [`DRAFT TO AUDIT:\n${JSON.stringify(draft)}`] : []),
      { inlineData: { data: bytes.toString("base64"), mimeType: "application/pdf" } },
    ]);
    const questions = parseJson(response.response.text());
    if (!Array.isArray(questions) || questions.length !== 30) {
      throw new Error(`Expected 30 questions, received ${questions?.length ?? "invalid"}`);
    }
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, `${JSON.stringify(questions, null, 2)}\n`);
    console.log(JSON.stringify({ paperCode, subject, auditMode, model: modelName, questions: questions.length, output }));
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.error(`${modelName} attempt ${attempt + 1}: ${error.message}`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(30_000, 3_000 * (attempt + 1))));
  }
}
throw lastError;
