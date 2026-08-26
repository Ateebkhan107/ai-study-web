import { createClient } from "@supabase/supabase-js";
import process from "node:process";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function sanitizeMathUnderscores(text) {
  if (!text || typeof text !== "string") return text;
  let s = text;

  // Fix: $_____\text{unit}^2$ -> _____ $\text{unit}^2$
  s = s.replace(/\$\s*_{2,}\s*(\\text\{[^\}]+\}(?:\^\{?[0-9a-zA-Z\-\+]+\}?)?)\s*\$/g, "_____ $$$1$$");
  // Fix: $expression = _____$ -> $expression =$ _____
  s = s.replace(/\$([^$]*?)=\s*_{2,}\s*\$/g, "$$$1=$$ _____");
  // Fix: $_____\text{ ... }$ -> _____ $\text{ ... }$
  s = s.replace(/\$\s*_{2,}\s*(\\[a-zA-Z]+[^\$]*)\$/g, "_____ $$$1$$");
  // Fix: $_____$ -> _____
  s = s.replace(/\$\s*_{2,}\s*\$/g, "_____");

  return s;
}

async function fixDatabaseUnderscores() {
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

  console.log(`Auditing ${allQs.length} questions for math underscores...`);
  let fixedCount = 0;

  for (const q of allQs) {
    let modified = false;
    const updates = {};

    const newQ = sanitizeMathUnderscores(q.question);
    if (newQ !== q.question) {
      updates.question = newQ;
      modified = true;
    }

    for (const opt of ["option_a", "option_b", "option_c", "option_d"]) {
      const val = q[opt];
      const newVal = sanitizeMathUnderscores(val);
      if (newVal !== val) {
        updates[opt] = newVal;
        modified = true;
      }
    }

    if (modified) {
      fixedCount++;
      const { error } = await supabase.from("pyq_questions").update(updates).eq("id", q.id);
      if (error) console.error(`Error updating ${q.paper_code} Q${q.question_number}:`, error);
      else console.log(`Fixed ${q.paper_code} Q${q.question_number}`);
    }
  }

  console.log(`Done! Fixed ${fixedCount} questions.`);
}

fixDatabaseUnderscores();
