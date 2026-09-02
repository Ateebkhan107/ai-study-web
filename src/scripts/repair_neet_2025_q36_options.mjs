import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const target = {
  exam: "NEET",
  year: 2025,
  question_number: 36,
};

const options = {
  option_a: "$B_z=60\\cos(5x+1.5\\times10^9t)\\,\\mathrm{T}$",
  option_b: "$B_z=60\\sin(5x+1.5\\times10^9t)\\,\\mathrm{T}$",
  option_c: "$B_y=2\\times10^{-7}\\cos(5x+1.5\\times10^9t)\\,\\mathrm{T}$",
  option_d: "$B_x=-2\\times10^{-7}\\cos(5x+1.5\\times10^9t)\\,\\mathrm{T}$",
};

const { data: matches, error: readError } = await supabase
  .from("pyq_questions")
  .select("id,paper_code,correct_option,option_a,option_b,option_c,option_d")
  .match(target);

if (readError) throw readError;
if (matches.length !== 1) {
  throw new Error(`Expected exactly one NEET 2025 Q36 row; found ${matches.length}`);
}

const before = matches[0];
if (before.correct_option?.toLowerCase() !== "c") {
  throw new Error(`Refusing repair: expected answer key C, found ${before.correct_option}`);
}

const { error: updateError } = await supabase
  .from("pyq_questions")
  .update(options)
  .eq("id", before.id);

if (updateError) throw updateError;

const { data: after, error: verifyError } = await supabase
  .from("pyq_questions")
  .select("id,paper_code,correct_option,option_a,option_b,option_c,option_d")
  .eq("id", before.id)
  .single();

if (verifyError) throw verifyError;
if (after.correct_option?.toLowerCase() !== "c") {
  throw new Error("Answer key changed during repair");
}

for (const [field, expected] of Object.entries(options)) {
  if (after[field] !== expected) {
    throw new Error(`Verification failed for ${field}`);
  }
}

console.log(JSON.stringify({ repaired: target, id: after.id, paper_code: after.paper_code, correct_option: after.correct_option, options }, null, 2));
