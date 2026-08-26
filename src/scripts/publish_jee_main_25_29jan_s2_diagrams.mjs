/** Replace only the six diagram assets reported for 29 Jan 2025 Shift 2. */
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const code = "JEE-MAIN-25-29JAN-S2";
const numbers = [26, 31, 34, 36, 41, 43];
const directory = path.join(process.cwd(), "tmp/jee-main-2025-january-clean", code, "final-diagrams");

for (const number of numbers) {
  const objectPath = `jee-main-2025-jan/${code}/q${number}_diagram.png`;
  const image = await fs.readFile(path.join(directory, `q${String(number).padStart(2, "0")}.png`));
  const { error: uploadError } = await supabase.storage.from("pyq-images").upload(objectPath, image, {
    contentType: "image/png",
    cacheControl: "0",
    upsert: true,
  });
  if (uploadError) throw new Error(`Q${number} upload: ${uploadError.message}`);
  const publicUrl = supabase.storage.from("pyq-images").getPublicUrl(objectPath).data.publicUrl;
  const { error: updateError } = await supabase.from("pyq_questions")
    .update({ question_image: `${publicUrl}?v=20260826-clean2` })
    .eq("paper_code", code)
    .eq("question_number", number);
  if (updateError) throw new Error(`Q${number} update: ${updateError.message}`);
}

const { data, error } = await supabase.from("pyq_questions")
  .select("question_number,question,question_image")
  .eq("paper_code", code)
  .in("question_number", numbers)
  .order("question_number");
if (error) throw error;
if (data.length !== numbers.length || data.some((row) => !row.question_image?.includes("clean2"))) {
  throw new Error("Live diagram verification failed");
}
console.log(JSON.stringify(data, null, 2));
