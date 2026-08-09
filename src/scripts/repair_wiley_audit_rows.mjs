import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const chapter13 = require("../../tmp/wiley-jee-main-mathematics/offline-chapter-13.json");
const q32 = chapter13.find((question) => question.number === 22);
const { error: updateError } = await supabase.from("questions").update({
  topic: q32.topic,
  question_type: q32.question_type,
  option_a: q32.options[0],
  option_b: q32.options[1],
  option_c: q32.options[2],
  option_d: q32.options[3],
  correct_option: q32.correct_option,
  explanation: q32.explanation,
}).eq("id", "d488df5d-7f1d-4b24-9eed-dd5507b040c6");
if (updateError) throw updateError;

const duplicateIds = [];
let deleted = [];
if (duplicateIds.length) {
  const result = await supabase.from("questions").delete().in("id", duplicateIds).select("id");
  if (result.error) throw result.error;
  deleted = result.data;
  if (deleted.length !== duplicateIds.length) throw new Error(`Expected to delete ${duplicateIds.length} duplicate rows, deleted ${deleted.length}`);
}

console.log(JSON.stringify({ updated: 1, deletedDuplicates: deleted.length }));
