/** Publish the user-reported 21 Jan 2026 Shift 1 image and answer-key repairs. */
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const code = "JEE-MAIN-26-21JAN-S1";
const source = path.join(process.cwd(), "tmp/jee-main-2026-january-clean", code, "structured-dataset.json");
const dataset = JSON.parse(await fs.readFile(source, "utf8"));
const numbers = [38, 39, 43, 44, 46, 47, 55, 57, 60, 61, 70, 74];
const answers = {
  38: { correct_option: "b", numerical_answer: null },
  39: { correct_option: "c", numerical_answer: null },
  43: { correct_option: "c", numerical_answer: null },
  44: { correct_option: "b", numerical_answer: null },
  46: { correct_option: "a", numerical_answer: 17 },
  47: { correct_option: "a", numerical_answer: 1080 },
  55: { correct_option: "c", numerical_answer: null },
  57: { correct_option: "c", numerical_answer: null },
  60: { correct_option: "a", numerical_answer: null },
  61: { correct_option: "a", numerical_answer: null },
  70: { correct_option: "b", numerical_answer: null },
  74: { correct_option: "a", numerical_answer: 20 },
};

const structuralOptions = {
  55: ["Structure A", "Structure B", "Structure C", "Structure D"],
  57: ["Structure A", "Structure B", "Structure C", "Structure D"],
  60: ["Graph A", "Graph B", "Graph C", "Graph D"],
  70: ["Sequence A", "Sequence B", "Sequence C", "Sequence D"],
};

for (const number of numbers) {
  const localImage = path.join(process.cwd(), "tmp/jee-main-2026-january-clean", code, "final-diagrams", `q${number}.png`);
  const object = `jee-main-2026-jan/${code}/q${number}_diagram.png`;
  const { error: uploadError } = await supabase.storage.from("pyq-images").upload(object, await fs.readFile(localImage), {
    contentType: "image/png", cacheControl: "0", upsert: true,
  });
  if (uploadError) throw new Error(`Q${number} image: ${uploadError.message}`);
  const imageUrl = supabase.storage.from("pyq-images").getPublicUrl(object).data.publicUrl + "?v=20260827-clean1";

  const q = dataset.find((item) => item.number === number);
  if (!q) throw new Error(`Missing local data for Q${number}`);
  const payload = {
    question_type: q.question_type,
    question: q.question,
    option_a: q.option_a ?? "",
    option_b: q.option_b ?? "",
    option_c: q.option_c ?? "",
    option_d: q.option_d ?? "",
    question_image: imageUrl,
    ...answers[number],
  };
  if (structuralOptions[number]) {
    [payload.option_a, payload.option_b, payload.option_c, payload.option_d] = structuralOptions[number];
  }
  if (number === 74) {
    payload.question = String.raw`Consider the reaction sequence shown below. The percentage of nitrogen in product $T$ is _____%. (Nearest integer; molar masses in $\mathrm{g\,mol^{-1}}$: H = 1, C = 12, N = 14, O = 16.)`;
  }

  const { error } = await supabase.from("pyq_questions").update(payload)
    .eq("paper_code", code).eq("question_number", number);
  if (error) throw new Error(`Q${number}: ${error.message}`);
}

const { data, error } = await supabase.from("pyq_questions")
  .select("question_number,question_type,correct_option,numerical_answer,question_image,option_a,option_b,option_c,option_d")
  .eq("paper_code", code).in("question_number", numbers).order("question_number");
if (error) throw error;
if (data.length !== numbers.length || data.some((row) => !row.question_image)) throw new Error("Live verification failed");
console.log(JSON.stringify(data, null, 2));
