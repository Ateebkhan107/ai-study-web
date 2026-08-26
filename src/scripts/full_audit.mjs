import { createClient } from "@supabase/supabase-js";
import process from "node:process";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fullAudit() {
  const { data: exams } = await supabase.from("pyq_exams").select("paper_code, year").order("year", { ascending: false });
  console.log(`Auditing all ${exams.length} papers in DB...`);

  let totalIssues = 0;
  for (const exam of exams) {
    let allQs = [];
    let page = 0;
    while (true) {
      const { data: chunk } = await supabase
        .from("pyq_questions")
        .select("question_number, question, option_a, option_b, option_c, option_d, question_type")
        .eq("paper_code", exam.paper_code)
        .range(page * 1000, (page + 1) * 1000 - 1);
      if (!chunk || chunk.length === 0) break;
      allQs = allQs.concat(chunk);
      page++;
    }

    let paperIssues = 0;
    for (const q of allQs) {
      const text = [q.question, q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean).join(" ");
      const withoutMath = text.replace(/\$\$[\s\S]*?\$\$/g, "").replace(/\$[^\$]*?\$/g, "");
      const hasRawLatex = /\\[a-zA-Z]+/.test(withoutMath);
      const oddDollars = (text.match(/\$/g) || []).length % 2 !== 0;

      if (hasRawLatex || oddDollars) {
        paperIssues++;
        totalIssues++;
        console.log(`[ISSUE in ${exam.paper_code} Q${q.question_number}]: oddDollars=${oddDollars}, text: ${withoutMath.slice(0, 60)}`);
      }
    }

    if (paperIssues === 0) {
      console.log(`[PASS] ${exam.paper_code}: ${allQs.length} questions clean.`);
    }
  }

  console.log(`\nAUDIT COMPLETE: ${totalIssues} total issues remaining across all exams.`);
}

fullAudit();
