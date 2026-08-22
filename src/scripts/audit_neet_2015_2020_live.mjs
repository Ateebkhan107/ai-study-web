import fs from "node:fs/promises";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const config = {
  2015: ["NEET 2015 Code A", "tmp/neet-2015/structured/neet-2015-structured-draft.json"],
  2016: ["NEET 2016 Phase I Code A-P-W", "tmp/neet-2016/structured/neet-2016-structured-draft.json"],
  2017: ["NEET 2017 Code A", "tmp/neet-2017/structured/neet-2017-structured-draft.json"],
  2018: ["NEET 2018 Code AA", "tmp/neet-2018/structured/neet-2018-structured-draft.json"],
  2019: ["NEET 2019 Code P1", "tmp/neet-2019/structured/neet-2019-structured-draft.json"],
  2020: ["NEET 2020 Set E4", "tmp/neet-2020-clean/structured/neet-2020-structured-draft.json"],
};
const fields = ["question", "option_a", "option_b", "option_c", "option_d"];
const report = {};
for (const [yearText, [paper, file]] of Object.entries(config)) {
  const year = Number(yearText);
  const source = JSON.parse(await fs.readFile(file, "utf8"));
  const { data: live, error } = await db.from("pyq_questions").select("question_number,question,option_a,option_b,option_c,option_d,correct_option,explanation").eq("exam", "NEET").eq("year", year).eq("paper_code", paper).order("question_number");
  if (error) throw error;
  const mismatches = [];
  for (let i = 0; i < source.length; i++) {
    const expected = source[i], actual = live[i];
    if (!actual || actual.question_number !== i + 1) { mismatches.push(`Q${i + 1}: sequence`); continue; }
    for (const field of fields) if (actual[field] !== expected[field]) mismatches.push(`Q${i + 1}: ${field}`);
    if (actual.correct_option !== expected.correct_option.toUpperCase()) mismatches.push(`Q${i + 1}: answer`);
    if (!/^\*\*(?:Correct option|Official accepted options|Bonus question)/.test(actual.explanation || "")) mismatches.push(`Q${i + 1}: review`);
  }
  report[year] = { total: live.length, sequence: live.length === 180 && live.every((q, i) => q.question_number === i + 1), exactQuestionOptionAnswerMatches: 180 - new Set(mismatches.map(x => x.split(":")[0])).size, solutions: live.filter(q => String(q.explanation || "").includes("**Solution**")).length, mismatches };
  if (live.length !== 180 || mismatches.length) throw new Error(`${year}: ${JSON.stringify(report[year])}`);
}
console.log(JSON.stringify(report, null, 2));
