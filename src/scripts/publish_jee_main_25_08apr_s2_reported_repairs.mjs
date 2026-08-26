/** Correct the eight user-reported, mismatched 8 Apr 2025 Shift 2 rows. */
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const code = "JEE-MAIN-25-08APR-S2";

const corrections = {
  42: {
    question_type: "MCQ",
    question: String.raw`Two harmonic travelling waves are given by $y_1(x,t)=4\sin(kx-\omega t)$ and $y_2(x,t)=2\sin(kx-\omega t+2\pi/3)$. If their superposition is written as $A\sin(kx-\omega t+\phi)$, the pair $[A,\phi]$ is:`,
    option_a: String.raw`$[6,2\pi/3]$`, option_b: String.raw`$[6,\pi/3]$`, option_c: String.raw`$[\sqrt3,\pi/6]$`, option_d: String.raw`$[2\sqrt3,\pi/6]$`,
    correct_option: "d", numerical_answer: null, question_image: null,
  },
  45: {
    question_type: "MCQ",
    question: String.raw`A block of mass $2\,\mathrm{kg}$ is attached to a massless spring fixed to a wall and moves on a frictionless horizontal table. The spring has natural length $2\,\mathrm m$ and spring constant $200\,\mathrm{N\,m^{-1}}$. The block is released when the spring length is $1\,\mathrm m$. At distance $x\,\mathrm m$ from the wall $(x<2)$, its speed is:`,
    option_a: String.raw`$10[1-(2-x)^2]^{3/2}\,\mathrm{m\,s^{-1}}$`, option_b: String.raw`$10[1-(2-x)^2]^{1/2}\,\mathrm{m\,s^{-1}}$`, option_c: String.raw`$10[1-(2-x)^2]\,\mathrm{m\,s^{-1}}$`, option_d: String.raw`$10[1-(2-x)^2]^2\,\mathrm{m\,s^{-1}}$`,
    correct_option: "b", numerical_answer: null, question_image: null,
  },
  49: {
    question_type: "NUMERICAL",
    question: String.raw`A thin solid disc of mass $1\,\mathrm{kg}$ rotates about a diameter at $1800\,\mathrm{rpm}$. An external torque of $25\pi\,\mathrm{N\,m}$ is applied for $40\,\mathrm s$, increasing its speed to $2100\,\mathrm{rpm}$. The diameter of the disc is _____ $\mathrm m$.`,
    option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a", numerical_answer: 40, question_image: null,
  },
  57: {
    question_type: "MCQ",
    question: "The atomic number of the element having the lowest first ionisation enthalpy among the following is:",
    option_a: "$32$", option_b: "$35$", option_c: "$87$", option_d: "$19$", correct_option: "c", numerical_answer: null, question_image: null,
  },
  63: {
    question_type: "MCQ",
    question: String.raw`On combustion, $0.210\,\mathrm g$ of an organic compound containing carbon, hydrogen and oxygen gives $0.127\,\mathrm g$ of $\mathrm{H_2O}$ and $0.307\,\mathrm g$ of $\mathrm{CO_2}$. The percentages of hydrogen and oxygen in the compound, respectively, are:`,
    option_a: String.raw`$53.41,\ 39.6$`, option_b: String.raw`$6.72,\ 53.41$`, option_c: String.raw`$7.55,\ 43.85$`, option_d: String.raw`$6.72,\ 39.87$`, correct_option: "b", numerical_answer: null, question_image: null,
  },
  64: {
    question_type: "MCQ",
    question: String.raw`Valine is placed in solutions of $\mathrm{pH}=2$ and $\mathrm{pH}=10$ to form structures A and B, respectively. Choose the correct pair shown below:`,
    option_a: "Structure pair (1)", option_b: "Structure pair (2)", option_c: "Structure pair (3)", option_d: "Structure pair (4)", correct_option: "a", numerical_answer: null,
  },
  67: {
    question_type: "MCQ",
    question: String.raw`Match List-I with List-II.

| List-I (Reagent) | List-II (Functional group detected) |
|---|---|
| A. Sodium bicarbonate solution | I. Double bond/unsaturation |
| B. Neutral ferric chloride | II. Carboxylic acid |
| C. Ceric ammonium nitrate | III. Phenolic $-\mathrm{OH}$ |
| D. Alkaline $\mathrm{KMnO_4}$ | IV. Alcoholic $-\mathrm{OH}$ |`,
    option_a: "A-II, B-III, C-IV, D-I", option_b: "A-II, B-III, C-I, D-IV", option_c: "A-III, B-II, C-IV, D-I", option_d: "A-II, B-IV, C-III, D-I", correct_option: "a", numerical_answer: null, question_image: null,
  },
  69: {
    question_type: "MCQ",
    question: String.raw`Match List-I with List-II.

| List-I (Complex/species) | List-II (Shape and magnetic moment) |
|---|---|
| A. $[\mathrm{Ni(CO)_4}]$ | I. Tetrahedral, $2.8\,\mathrm{BM}$ |
| B. $[\mathrm{Ni(CN)_4}]^{2-}$ | II. Square planar, $0\,\mathrm{BM}$ |
| C. $[\mathrm{NiCl_4}]^{2-}$ | III. Tetrahedral, $0\,\mathrm{BM}$ |
| D. $[\mathrm{MnBr_4}]^{2-}$ | IV. Tetrahedral, $5.9\,\mathrm{BM}$ |`,
    option_a: "A-III, B-IV, C-II, D-I", option_b: "A-I, B-II, C-III, D-IV", option_c: "A-III, B-II, C-I, D-IV", option_d: "A-IV, B-I, C-III, D-II", correct_option: "c", numerical_answer: null, question_image: null,
  },
};

const q64Object = `jee-main-2025-apr/${code}/q64_diagram.png`;
const q64File = path.join(process.cwd(), "tmp/jee-main-2025-april/2025-04-08-shift-2/final-diagrams/q64.png");
const { error: uploadError } = await supabase.storage.from("pyq-images").upload(q64Object, await fs.readFile(q64File), {
  contentType: "image/png", cacheControl: "0", upsert: true,
});
if (uploadError) throw uploadError;
const q64Url = supabase.storage.from("pyq-images").getPublicUrl(q64Object).data.publicUrl + "?v=20260826-correct4";

for (const [numberText, payload] of Object.entries(corrections)) {
  const number = Number(numberText);
  if (number === 64) payload.question_image = q64Url;
  const { error } = await supabase.from("pyq_questions").update(payload).eq("paper_code", code).eq("question_number", number);
  if (error) throw new Error(`Q${number}: ${error.message}`);
}

const numbers = Object.keys(corrections).map(Number);
const { data, error } = await supabase.from("pyq_questions").select("question_number,question_type,question,correct_option,numerical_answer,question_image")
  .eq("paper_code", code).in("question_number", numbers).order("question_number");
if (error) throw error;
if (data.length !== numbers.length || data.some((row) => row.question_number !== 64 && row.question_image !== null)) throw new Error("Live verification failed");
console.log(JSON.stringify(data, null, 2));
