/** Upload locally cropped JEE Main April 2025 question images and create PYQ rows.
 * Usage: node src/scripts/import_jee_april_question_images.mjs 2025-04-02-shift-1
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const paperKey = process.argv[2];
const refreshImages = process.argv.includes("--refresh-images");
if (!/^2025-04-(02|03|04|07|08)-shift-[12]$/.test(paperKey || "")) throw new Error("Pass a paper key such as 2025-04-02-shift-1");
const [date, shiftLabel] = paperKey.split("-shift-");
const shift = `Shift ${shiftLabel}`;
const day = date.slice(-2);
const attempt = `${Number(day)} Apr`;
const paperCode = `JEE-MAIN-25-${day}APR-S${shiftLabel}`;
const paperDir = path.resolve("tmp/jee-main-2025-april", paperKey);
const manifest = JSON.parse(await fs.readFile(path.join(paperDir, "manifest.json"), "utf8"));
if (manifest.length !== 75) throw new Error(`${paperKey} has ${manifest.length}/75 crops; refusing a partial upload.`);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials are required");
const { data: existingExam, error: examLookupError } = await supabase.from("pyq_exams").select("id").eq("paper_code", paperCode).maybeSingle();
if (examLookupError) throw new Error(examLookupError.message);
const examPayload = { exam: "JEE", exam_type: "JEE Main", year: 2025, attempt, shift, paper_code: paperCode, exam_date: date, duration_minutes: 180, total_marks: 300, status: "PUBLISHED", is_published: true };
let examId = existingExam?.id;
if (examId) {
  const { error } = await supabase.from("pyq_exams").update(examPayload).eq("id", examId);
  if (error) throw new Error(error.message);
} else {
  const { data, error } = await supabase.from("pyq_exams").insert(examPayload).select("id").single();
  if (error) throw new Error(error.message);
  examId = data.id;
}
const { count, error: countError } = await supabase.from("pyq_questions").select("id", { count: "exact", head: true }).eq("paper_code", paperCode);
if (countError) throw new Error(countError.message);
if (count && !refreshImages) throw new Error(`${paperCode} already has ${count} rows; refusing to duplicate it.`);

const rows = await Promise.all(manifest.sort((a, b) => a.number - b.number).map(async (item) => {
  const objectPath = `jee-main-2025/${paperKey}/q${String(item.number).padStart(2, "0")}.png`;
  const { error: uploadError } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(item.image_path), { contentType: "image/png", upsert: true });
  if (uploadError) throw new Error(`Q${item.number}: ${uploadError.message}`);
  const questionImage = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  return { exam_id: examId, exam: "JEE", exam_type: "JEE Main", year: 2025, attempt, shift, paper_code: paperCode, subject: item.subject, chapter: "Unmapped", question_type: item.question_type, question: `Question ${item.number}: Refer to the source image.`, option_a: "Option A", option_b: "Option B", option_c: "Option C", option_d: "Option D", correct_option: item.correct_option || "a", numerical_answer: item.numerical_answer, explanation: "Refer to the source image.", question_image: questionImage, status: "PUBLISHED", marks_positive: 4, marks_negative: 1 };
}));
if (!refreshImages) {
  for (let start = 0; start < rows.length; start += 25) {
    const { error } = await supabase.from("pyq_questions").insert(rows.slice(start, start + 25));
    if (error) throw new Error(error.message);
  }
}
console.log(JSON.stringify({ paperCode, examId, questions: refreshImages ? 0 : rows.length, images: rows.length, refreshed: refreshImages }));
