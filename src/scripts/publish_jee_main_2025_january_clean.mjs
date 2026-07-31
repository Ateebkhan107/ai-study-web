/** Publish the clean Jan-2025 manifests, replacing flawed existing question rows. */
import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const code = process.argv[2];
const match = code?.match(/^JEE-MAIN-25-(\d\d)JAN-S([12])$/);
if (!match) throw new Error("Expected a paper code such as JEE-MAIN-25-22JAN-S1");
const [, day, shift] = match;
const manifest = JSON.parse(await fs.readFile(`tmp/jee-main-2025-january-clean/${code}/manifest.json`, "utf8"));
if (manifest.length !== 75) throw new Error(`${code}: incomplete manifest`);

const exam = {
  exam: "JEE", exam_type: "JEE Main", year: 2025, attempt: `${Number(day)} Jan`, shift: `Shift ${shift}`,
  paper_code: code, exam_date: `2025-01-${day}`, duration_minutes: 180, total_marks: 300,
  status: "PUBLISHED", is_published: true,
};
let { data: currentExam, error: examError } = await supabase.from("pyq_exams").select("id").eq("paper_code", code).maybeSingle();
if (examError) throw examError;
if (currentExam) {
  const { error } = await supabase.from("pyq_exams").update(exam).eq("id", currentExam.id);
  if (error) throw error;
} else {
  const { data, error } = await supabase.from("pyq_exams").insert(exam).select("id").single();
  if (error) throw error;
  currentExam = data;
}

// Retain existing IDs (and therefore student attempts).  The legacy text
// starts with its original question number, which lets us repair each row
// deterministically even though question_number was previously null.
const { data: legacyRows, error: legacyError } = await supabase.from("pyq_questions")
  .select("id, question").eq("paper_code", code);
if (legacyError) throw legacyError;
const legacyByNumber = new Map();
for (const legacy of legacyRows) {
  const number = Number(String(legacy.question || "").match(/^\s*Question\s+(\d+)\s*:/i)?.[1]);
  if (number >= 1 && number <= 75 && !legacyByNumber.has(number)) legacyByNumber.set(number, legacy.id);
}

for (const question of manifest) {
  const objectPath = `jee-main-2025-january-clean/${code}/q${String(question.number).padStart(2, "0")}.png`;
  const { error: uploadError } = await supabase.storage.from("pyq-images").upload(
    objectPath, await fs.readFile(question.image_path), { contentType: "image/png", upsert: true },
  );
  if (uploadError) throw uploadError;
  const questionImage = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  const numerical = question.question_type === "NUMERICAL";
  const answer = String(question.answer);
  const row = {
    exam_id: currentExam.id, exam: exam.exam, exam_type: exam.exam_type, year: exam.year,
    attempt: exam.attempt, shift: exam.shift, paper_code: exam.paper_code,
    question_number: question.number, display_order: question.number,
    subject: question.subject, chapter: "Unmapped", question_type: question.question_type,
    question: `Question ${question.number}: Refer to the source image.`,
    option_a: "Option 1", option_b: "Option 2", option_c: "Option 3", option_d: "Option 4",
    correct_option: numerical ? "a" : "abcd"[Number(answer) - 1] || "a",
    numerical_answer: numerical && answer !== "DROP" ? Number(answer) : null,
    explanation: `Official NTA answer key: ${answer}.`, question_image: questionImage,
    status: "PUBLISHED", marks_positive: 4, marks_negative: numerical ? 0 : 1,
  };
  const legacyId = legacyByNumber.get(question.number);
  const { error } = legacyId
    ? await supabase.from("pyq_questions").update(row).eq("id", legacyId)
    : await supabase.from("pyq_questions").insert(row);
  if (error) throw error;
}
console.log(code);
