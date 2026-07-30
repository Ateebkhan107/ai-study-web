/** Publish the validated text-first JEE Main January 2024 manifests. */
import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials are required");

const papers = [
  ["27JAN", 1], ["27JAN", 2], ["29JAN", 1], ["29JAN", 2], ["30JAN", 1],
  ["30JAN", 2], ["31JAN", 1], ["31JAN", 2], ["01FEB", 1], ["01FEB", 2],
];
const dateFor = day => `2024-${day.endsWith("FEB") ? "02" : "01"}-${day.slice(0, 2)}`;
const labelFor = day => `${Number(day.slice(0, 2))} ${day.endsWith("FEB") ? "Feb" : "Jan"}`;
const safeText = value => String(value ?? "").replace(/\u0000/g, "");

for (const [day, shiftNumber] of papers) {
  const code = `JEE-MAIN-24-${day}-S${shiftNumber}`;
  const manifest = JSON.parse(await fs.readFile(`tmp/jee-main-2024-january/jee-main-24-${day}-s${shiftNumber}.json`, "utf8"));
  if (manifest.length !== 90) throw new Error(`${code}: expected 90 questions`);
  const exam = { exam: "JEE", exam_type: "JEE Main", year: 2024, attempt: labelFor(day), shift: `Shift ${shiftNumber}`, paper_code: code, exam_date: dateFor(day), duration_minutes: 180, total_marks: 300, status: "PUBLISHED", is_published: true };
  const { data: oldExam, error: examLookupError } = await supabase.from("pyq_exams").select("id").eq("paper_code", code).maybeSingle();
  if (examLookupError) throw new Error(examLookupError.message);
  let examId = oldExam?.id;
  if (examId) { const { error } = await supabase.from("pyq_exams").update(exam).eq("id", examId); if (error) throw new Error(error.message); }
  else { const { data, error } = await supabase.from("pyq_exams").insert(exam).select("id").single(); if (error) throw new Error(error.message); examId = data.id; }
  const { count, error: countError } = await supabase.from("pyq_questions").select("id", { count: "exact", head: true }).eq("paper_code", code);
  if (countError) throw new Error(countError.message);
  if (count) { if (count !== 90) throw new Error(`${code} has incomplete existing data (${count})`); console.log(JSON.stringify({ code, existing: count })); continue; }
  const rows = manifest.map(item => {
    const numerical = item.question_type === "NUMERICAL";
    const answer = String(item.answer).replace(/,/g, "").trim();
    if (!numerical && !/^[1-4]$/.test(answer)) throw new Error(`${code} Q${item.number}: invalid MCQ key ${answer}`);
    if (numerical && !/^-?\d+(?:\.\d+)?$/.test(answer)) throw new Error(`${code} Q${item.number}: invalid numerical key ${answer}`);
    return { exam_id: examId, exam: "JEE", exam_type: "JEE Main", year: 2024, attempt: labelFor(day), shift: `Shift ${shiftNumber}`, paper_code: code, question_number: item.number, display_order: item.number, subject: item.subject, chapter: "Unmapped", topic: "Unmapped", difficulty: "Medium", question_type: item.question_type, question: safeText(`Question ${item.number}: ${item.question}`), option_a: safeText(item.options["1"] || "Not applicable"), option_b: safeText(item.options["2"] || "Not applicable"), option_c: safeText(item.options["3"] || "Not applicable"), option_d: safeText(item.options["4"] || "Not applicable"), correct_option: numerical ? "a" : "abcd"[Number(answer) - 1], numerical_answer: numerical ? Number(answer) : null, explanation: `Official answer key: ${item.answer}.`, question_image: null, explanation_image: null, marks_positive: 4, marks_negative: numerical ? 0 : 1, status: "PUBLISHED", confidence_score: 1 };
  });
  for (let start = 0; start < rows.length; start += 30) { const { error } = await supabase.from("pyq_questions").insert(rows.slice(start, start + 30)); if (error) throw new Error(`${code}: ${error.message}`); }
  console.log(JSON.stringify({ code, uploaded: rows.length }));
}
