/** Publish targeted text/image repairs for 23 Jan 2025 Shift 1. */
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const code = "JEE-MAIN-25-23JAN-S1";
const numbers = [32, 44, 50, 53, 74];
const directory = path.join(process.cwd(), "tmp/jee-main-2025-january-clean", code, "final-diagrams");

for (const number of numbers) {
  const objectPath = `jee-main-2025-jan/${code}/q${number}_diagram.png`;
  const { error: uploadError } = await supabase.storage.from("pyq-images").upload(
    objectPath,
    await fs.readFile(path.join(directory, `q${String(number).padStart(2, "0")}.png`)),
    { contentType: "image/png", cacheControl: "0", upsert: true },
  );
  if (uploadError) throw new Error(`Q${number} upload: ${uploadError.message}`);
  const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  const { error: updateError } = await supabase.from("pyq_questions")
    .update({ question_image: `${publicUrl}?v=20260826-clean3` })
    .eq("paper_code", code).eq("question_number", number);
  if (updateError) throw new Error(`Q${number} update: ${updateError.message}`);
}

// Use separate inline math blocks here. This avoids the legacy renderer path
// that exposed a multiline aligned environment as raw red LaTeX.
const question11 = String.raw`If the system of equations

$(\lambda-1)x+(\lambda-4)y+\lambda z=5,$

$\lambda x+(\lambda-1)y+(\lambda-4)z=7,$

$(\lambda+1)x+(\lambda+2)y-(\lambda+2)z=9$

has infinitely many solutions, then $\lambda^2+\lambda$ is equal to`;
const { error: q11Error } = await supabase.from("pyq_questions").update({ question: question11 })
  .eq("paper_code", code).eq("question_number", 11);
if (q11Error) throw q11Error;

const { data, error } = await supabase.from("pyq_questions")
  .select("question_number,question,question_image")
  .eq("paper_code", code).in("question_number", [11, ...numbers]).order("question_number");
if (error) throw error;
if (data.length !== 6 || data.filter((row) => row.question_number !== 11).some((row) => !row.question_image?.includes("clean3"))) {
  throw new Error("Live repair verification failed");
}
console.log(JSON.stringify(data, null, 2));
