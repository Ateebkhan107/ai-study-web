import { createClient } from "@supabase/supabase-js";
import process from "node:process";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanBlanks(text) {
  if (!text || typeof text !== "string") return text;
  let s = text;

  // Replace $\text{____}$ with _____
  // Replace $\text{_____}\text{ unit}$ with _____ $\text{unit}$
  // Replace $\text{_____}\text{gram}$ with _____ $\text{g}$ / _____ $\text{gram}$
  s = s.replace(/\$\\text\{[_–—\.\s]+\}\\text\{([^}]+)\}\$/g, "_____ $\\text{$1}$");
  s = s.replace(/\$\\text\{[_–—\.\s]+\}\$/g, "_____");
  s = s.replace(/\\text\{[_–—\.\s]+\}/g, "_____");

  // Also replace any \text{______} with clean underscores
  s = s.replace(/\$\s*\\text\{_+([^\}]*)\}\s*\$/g, "_____ $1");

  return s;
}

async function fixAllBlanks() {
  let allQs = [];
  let page = 0;
  while (true) {
    const { data } = await supabase
      .from("pyq_questions")
      .select("id, paper_code, question_number, question, option_a, option_b, option_c, option_d")
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    allQs = allQs.concat(data);
    page++;
  }

  console.log(`Auditing ${allQs.length} questions for broken \\text{___} blanks...`);

  let count = 0;
  for (const q of allQs) {
    let modified = false;
    const updates = {};

    const newQ = cleanBlanks(q.question);
    if (newQ !== q.question) {
      updates.question = newQ;
      modified = true;
    }

    for (const opt of ["option_a", "option_b", "option_c", "option_d"]) {
      const val = q[opt];
      const newVal = cleanBlanks(val);
      if (newVal !== val) {
        updates[opt] = newVal;
        modified = true;
      }
    }

    if (modified) {
      count++;
      const { error } = await supabase.from("pyq_questions").update(updates).eq("id", q.id);
      if (error) console.error(`Error updating ${q.paper_code} Q${q.question_number}:`, error);
      else console.log(`Fixed ${q.paper_code} Q${q.question_number}`);
    }
  }

  console.log(`Done! Fixed ${count} questions across entire database.`);
}

fixAllBlanks();
