import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const id = "a0c71fe9-8e3c-4dff-a9f6-65cd30d175f5";
const payload = {
  question: `If the system of equations
$$\\begin{aligned}
2x + 3y - z &= 5 \\\\
x + \\alpha y + 3z &= -4 \\\\
3x - y + \\beta z &= 7
\\end{aligned}$$
has infinitely many solutions, then $13\\alpha\\beta$ is equal to:`,
  option_a: "1110",
  option_b: "1120",
  option_c: "1210",
  option_d: "1220",
};

const { data, error } = await supabase
  .from("pyq_questions")
  .update(payload)
  .eq("id", id)
  .eq("paper_code", "JEE-MAIN-24-01FEB-S1")
  .eq("question_number", 11)
  .select("id,paper_code,question_number,question,option_a,option_b,option_c,option_d,correct_option")
  .single();

if (error) throw error;
if (data.question !== payload.question) throw new Error("Question read-back mismatch");
if ([data.option_a, data.option_b, data.option_c, data.option_d].join(",") !== "1110,1120,1210,1220") {
  throw new Error("Option read-back mismatch");
}
if (String(data.correct_option).toLowerCase() !== "b") throw new Error("Answer key changed unexpectedly");

console.log(JSON.stringify(data, null, 2));
