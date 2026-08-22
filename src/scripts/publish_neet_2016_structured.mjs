import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const APPLY = process.argv.includes("--apply");
const DIR = path.resolve("tmp/neet-2016/structured");
const DATASET = path.join(DIR, "neet-2016-structured-draft.json");
const fields = ["question_image", "option_a_image", "option_b_image", "option_c_image", "option_d_image"];
for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) if (!process.env[key]) throw new Error(`${key} required`);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

function review(q) {
  if (q.bonus) return `**Bonus question**\n\nThe source marks this question as bonus because the chemically correct product, $\\mathrm{CaCN_2}$, is absent from the printed options.${q.explanation ? `\n\n**Solution**\n\n${q.explanation}` : ""}`;
  const accepted = q.accepted_options.map(x => x.toUpperCase());
  if (accepted.length > 1) return `**Official accepted options: ${accepted.join(" and ")}**\n\n${accepted.map(x => `${x}. ${q[`option_${x.toLowerCase()}`]}`).join("\n\n")}${q.explanation ? `\n\n**Solution**\n\n${q.explanation}` : ""}`;
  const key = q.correct_option.toUpperCase();
  return `**Correct option: ${key}**\n\n${q[`option_${q.correct_option}`]}${q[`option_${q.correct_option}_image`] ? `\n\nThe corresponding structure is shown with option ${key}.` : ""}${q.explanation ? `\n\n**Solution**\n\n${q.explanation}` : ""}`;
}
async function upload(file, number, field) {
  const object = `neet-ug-2016/phase-i-code-a-p-w/structured/q${String(number).padStart(3, "0")}-${field.replaceAll("_", "-")}.png`;
  const { error } = await db.storage.from("pyq-images").upload(object, await fs.readFile(file), { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Q${number} ${field}: ${error.message}`);
  return db.storage.from("pyq-images").getPublicUrl(object).data.publicUrl;
}
async function main() {
  const data = JSON.parse(await fs.readFile(DATASET, "utf8"));
  if (data.length !== 180 || data.some((q, i) => q.number !== i + 1)) throw new Error("Expected 1..180");
  const { data: old, error: oldError } = await db.from("pyq_questions").select("*").eq("exam", "NEET").eq("year", 2016).eq("paper_code", "NEET 2016 Phase I Code A-P-W").order("question_number");
  if (oldError) throw oldError;
  if (old.length && !(old.length === 180 && old.every((q, i) => q.question_number === i + 1))) throw new Error(`Existing 2016 set is incomplete (${old.length})`);
  if (old.length) await fs.writeFile(path.join(DIR, "live-backup-before-repair.json"), JSON.stringify(old, null, 2));
  const { data: exam, error: examError } = await db.from("pyq_questions").select("exam_id").eq("exam", "NEET").not("exam_id", "is", null).limit(1).single();
  if (examError) throw examError;
  const rows = [];
  for (const q of data) {
    const row = { exam: "NEET", exam_type: "NEET UG", year: 2016, attempt: "NEET UG 2016 Phase I", shift: "Phase I", paper_code: "NEET 2016 Phase I Code A-P-W", exam_id: exam.exam_id, subject: q.subject, chapter: q.chapter, question_type: "MCQ", question: q.question, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option.toUpperCase(), explanation: review(q), explanation_image: null, marks_positive: 4, marks_negative: -1, question_number: q.number, display_order: q.number, status: "PUBLISHED" };
    for (const field of fields) row[field] = q[field] ? (APPLY ? await upload(q[field], q.number, field) : q[field]) : null;
    rows.push(row);
  }
  await fs.writeFile(path.join(DIR, "neet-2016-structured.csv"), Papa.unparse(rows, { newline: "\n" }));
  const report = { mode: APPLY ? "apply" : "dry-run", operation: old.length ? "update" : "insert", total: 180, subjects: Object.fromEntries(["Physics", "Chemistry", "Biology"].map(s => [s, rows.filter(q => q.subject === s).length])), tables: rows.filter(q => q.question.includes("\n|")).length, questionImages: rows.filter(q => q.question_image).length, optionImages: rows.reduce((n, q) => n + fields.slice(1).filter(f => q[f]).length, 0), bonus: data.filter(q => q.bonus).map(q => q.number) };
  if (APPLY) {
    const payload = old.length ? rows.map((row, i) => ({ ...row, id: old[i].id })) : rows;
    for (let i = 0; i < 180; i += 30) {
      const query = old.length ? db.from("pyq_questions").upsert(payload.slice(i, i + 30), { onConflict: "id" }) : db.from("pyq_questions").insert(payload.slice(i, i + 30));
      const { error } = await query;
      if (error) throw error;
    }
    const { data: live, error } = await db.from("pyq_questions").select("question_number,question,option_a,option_b,option_c,option_d,explanation,explanation_image,question_image,option_a_image,option_b_image,option_c_image,option_d_image").eq("exam", "NEET").eq("year", 2016).eq("paper_code", "NEET 2016 Phase I Code A-P-W").order("question_number");
    if (error) throw error;
    report.verified = { total: live.length, sequence: live.every((q, i) => q.question_number === i + 1), empty: live.filter(q => [q.question, q.option_a, q.option_b, q.option_c, q.option_d].some(x => !String(x || "").trim())).length, badReview: live.filter(q => !/^\*\*(Correct option|Official accepted options|Bonus question)/.test(String(q.explanation || ""))).length, explanationImages: live.filter(q => q.explanation_image).length, questionImages: live.filter(q => q.question_image).length, optionImages: live.reduce((n, q) => n + fields.slice(1).filter(f => q[f]).length, 0) };
    const v = report.verified;
    if (v.total !== 180 || !v.sequence || v.empty || v.badReview || v.explanationImages || v.questionImages !== 4 || v.optionImages !== 4) throw new Error(`Verification failed ${JSON.stringify(v)}`);
  }
  await fs.writeFile(path.join(DIR, "publish-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
