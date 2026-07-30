/** Upload verified scanned worked-solution crops for a prepared April paper.
 * Usage: node src/scripts/upload_jee_april_solutions.mjs 2025-04-02-shift-1
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const paperKey = process.argv[2];
if (!/^2025-04-(02|03|04|07|08)-shift-[12]$/.test(paperKey || "")) throw new Error("Pass a valid April paper key");
const [date, shift] = paperKey.split("-shift-");
const paperCode = `JEE-MAIN-25-${date.slice(-2)}APR-S${shift}`;
const manifest = JSON.parse(await fs.readFile(path.resolve("tmp/jee-main-2025-april", paperKey, "manifest.json"), "utf8"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: rows, error } = await supabase.from("pyq_questions").select("id,question").eq("paper_code", paperCode);
if (error) throw new Error(error.message);
const byNumber = new Map(rows.map((row) => [Number(row.question.match(/^Question (\d+):/)?.[1]), row.id]));
const candidates = (await Promise.all(manifest.map(async (item) => ({ item, exists: item.solution_path && await fs.stat(item.solution_path).then(() => true).catch(() => false) })))).filter(({ exists }) => exists);
await Promise.all(candidates.map(async ({ item }) => {
  const objectPath = `jee-main-2025/${paperKey}/solutions/q${String(item.number).padStart(2, "0")}.png`;
  const { error: uploadError } = await supabase.storage.from("pyq-images").upload(objectPath, await fs.readFile(item.solution_path), { contentType: "image/png", upsert: true });
  if (uploadError) throw new Error(`Q${item.number}: ${uploadError.message}`);
  const explanationImage = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  const { error: updateError } = await supabase.from("pyq_questions").update({ explanation: "Worked solution is provided below.", explanation_image: explanationImage }).eq("id", byNumber.get(item.number));
  if (updateError) throw new Error(`Q${item.number}: ${updateError.message}`);
}));
console.log(JSON.stringify({ paperCode, uploaded: candidates.length }));
