import { createClient } from "@supabase/supabase-js";
import process from "node:process";

process.loadEnvFile(".env.local");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function wrapLatexIfNeeded(str) {
  if (!str || typeof str !== "string") return str;
  let s = str.trim();
  if (!s) return s;

  // Convert \( ... \) to $ ... $
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$");
  // Convert \[ ... \] to $$ ... $$
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$1$$$$");

  // If already full single math block, return
  if (s.startsWith("$") && s.endsWith("$") && (s.match(/\$/g) || []).length === 2) {
    return s;
  }

  // If the whole string starts with a LaTeX backslash command and contains no $, wrap it
  if (/^\\[a-zA-Z]/.test(s) && !s.includes("$")) {
    return `$${s}$`;
  }
  // If starts with numbers and has \text or \times or \pm or units e.g. "100\text{ m/s}"
  if (/^[0-9\.\s\+\-\*\/]+\\[a-zA-Z]/.test(s) && !s.includes("$")) {
    return `$${s}$`;
  }

  // If contains isolated LaTeX commands outside $...$
  // Example: "Two beams of intensities I and 4I are ... $...$"
  // Check for odd dollar count
  const dollarCount = (s.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    // If odd dollars, check if someone wrote `I and 4I` with an unclosed dollar or literal dollar
    // Let's escape unclosed dollars if any
  }

  return s;
}

async function fixAllLatex() {
  const PAGE_SIZE = 1000;
  let page = 0;
  let totalFixed = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: chunk, error } = await supabase
      .from("pyq_questions")
      .select("id, paper_code, question_number, question, option_a, option_b, option_c, option_d")
      .range(from, to);

    if (error) {
      console.error("Fetch error:", error);
      break;
    }

    if (!chunk || chunk.length === 0) break;

    console.log(`Auditing questions ${from} to ${to}...`);

    for (const q of chunk) {
      let modified = false;
      const updates = {};

      const newQ = wrapLatexIfNeeded(q.question);
      if (newQ !== q.question) {
        updates.question = newQ;
        modified = true;
      }

      for (const opt of ["option_a", "option_b", "option_c", "option_d"]) {
        const val = q[opt];
        const newVal = wrapLatexIfNeeded(val);
        if (newVal !== val) {
          updates[opt] = newVal;
          modified = true;
        }
      }

      if (modified) {
        totalFixed++;
        const { error: updErr } = await supabase
          .from("pyq_questions")
          .update(updates)
          .eq("id", q.id);

        if (updErr) {
          console.error(`Error updating ${q.paper_code} Q${q.question_number}:`, updErr);
        } else {
          console.log(`Fixed ${q.paper_code} Q${q.question_number}`);
        }
      }
    }

    page++;
  }

  console.log(`Done! Total fixed across entire DB: ${totalFixed}`);
}

fixAllLatex();
