import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const UPDATES = [
  {
    paper_code: "JEE-MAIN-13-09APR",
    question_number: 47,
    question_text: "Electrode potentials ($E^\\circ$) are given below :\n$$\\begin{aligned}\nE^\\circ_{\\text{Cu}^+/\\text{Cu}} &= +0.52\\text{ V}, & E^\\circ_{\\text{Fe}^{3+}/\\text{Fe}^{2+}} &= +0.77\\text{ V} \\\\\nE^\\circ_{\\frac{1}{2}\\text{I}_2(s)/\\text{I}^-} &= +0.54\\text{ V}, & E^\\circ_{\\text{Ag}^+/\\text{Ag}} &= +0.88\\text{ V}\n\\end{aligned}$$\nBased on the above potentials, strongest oxidizing agent will be :",
    option_a: "$\\text{Cu}^+$",
    option_b: "$\\text{Fe}^{3+}$",
    option_c: "$\\text{Ag}^+$",
    option_d: "$\\text{I}_2$",
  },
  {
    paper_code: "JEE-MAIN-13-07APR",
    question_number: 54,
    question_text: "Given :\n$$\\begin{aligned}\nE^\\circ_{\\text{Cr}^{3+}/\\text{Cr}} &= -0.74\\text{ V}, & E^\\circ_{\\text{MnO}_4^-/\\text{Mn}^{2+}} &= +1.51\\text{ V} \\\\\nE^\\circ_{\\text{Cr}_2\\text{O}_7^{2-}/\\text{Cr}^{3+}} &= +1.33\\text{ V}, & E^\\circ_{\\text{Cl}_2/\\text{Cl}^-} &= +1.36\\text{ V}\n\\end{aligned}$$\nBased on the data given above, strongest oxidising agent will be :",
  },
  {
    paper_code: "JEE-MAIN-13-07APR",
    question_number: 80,
    question_text: "The number of values of $k$, for which the system of equations :\n$$\\begin{aligned}\n(k + 1)x + 8y &= 4k \\\\\nkx + (k + 3)y &= 3k - 1\n\\end{aligned}$$\nhas no solution, is :",
  },
  {
    paper_code: "JEE-MAIN-13-23APR",
    question_number: 45,
    question_text: "Given :\n$$\\begin{aligned}\nE^0_{\\frac{1}{2}\\text{Cl}_2/\\text{Cl}^-} &= +1.36\\text{ V}, & E^0_{\\text{Cr}^{3+}/\\text{Cr}} &= -0.74\\text{ V} \\\\\nE^0_{\\text{Cr}_2\\text{O}_7^{2-}/\\text{Cr}^{3+}} &= +1.33\\text{ V}, & E^0_{\\text{MnO}_4^-/\\text{Mn}^{2+}} &= +1.51\\text{ V}\n\\end{aligned}$$\nThe correct order of reducing power of the species ($\\text{Cr}$, $\\text{Cr}^{3+}$, $\\text{Mn}^{2+}$ and $\\text{Cl}^-$) will be :",
  },
  {
    paper_code: "JEE-MAIN-13-23APR",
    question_number: 67,
    question_text: "If two lines $L_1$ and $L_2$ in space, are defined by\n$$\\begin{aligned}\nL_1 &= \\{x = \\sqrt{\\lambda}y + (\\sqrt{\\lambda} - 1), \\quad z = (\\sqrt{\\lambda} - 1)y + \\sqrt{\\lambda}\\} \\\\\nL_2 &= \\{x = \\sqrt{\\mu}y + (1 - \\sqrt{\\mu}), \\quad z = (1 - \\sqrt{\\mu})y + \\sqrt{\\mu}\\}\n\\end{aligned}$$\nthen $L_1$ is perpendicular to $L_2$, for all nonnegative reals $\\lambda$ and $\\mu$, such that :",
  },
  {
    paper_code: "JEE-MAIN-13-23APR",
    question_number: 78,
    question_text: "**Statement-1:** The system of linear equations\n$$\\begin{aligned}\nx + (\\sin\\alpha)y + (\\cos\\alpha)z &= 0 \\\\\nx + (\\cos\\alpha)y + (\\sin\\alpha)z &= 0 \\\\\nx - (\\sin\\alpha)y - (\\cos\\alpha)z &= 0\n\\end{aligned}$$\nhas a non-trivial solution for only one value of $\\alpha$ lying in the interval $\\left(0, \\frac{\\pi}{2}\\right)$.\n\n**Statement-2:** The equation in $\\alpha$\n$$\\begin{vmatrix} \\cos\\alpha & \\sin\\alpha & \\cos\\alpha \\\\ \\sin\\alpha & \\cos\\alpha & \\sin\\alpha \\\\ \\cos\\alpha & -\\sin\\alpha & -\\cos\\alpha \\end{vmatrix} = 0$$\nhas only one solution lying in the interval $\\left(0, \\frac{\\pi}{2}\\right)$.",
  },
];

async function applyUpdates() {
  const datasetPath = path.join(process.cwd(), "scratch/complete_clean_jee_2013.json");
  const dataset = JSON.parse(await fs.readFile(datasetPath, "utf8"));

  for (const u of UPDATES) {
    const item = dataset.find(
      (q) => q.paper_code === u.paper_code && q.question_number === u.question_number
    );
    if (item) {
      item.question_text = u.question_text;
      if (u.option_a) item.option_a = u.option_a;
      if (u.option_b) item.option_b = u.option_b;
      if (u.option_c) item.option_c = u.option_c;
      if (u.option_d) item.option_d = u.option_d;

      // Update pyq_questions
      const payload = { question: u.question_text };
      if (u.option_a) payload.option_a = u.option_a;
      if (u.option_b) payload.option_b = u.option_b;
      if (u.option_c) payload.option_c = u.option_c;
      if (u.option_d) payload.option_d = u.option_d;

      await supabase
        .from("pyq_questions")
        .update(payload)
        .eq("paper_code", u.paper_code)
        .eq("question_number", u.question_number);

      // Update questions table
      const qPayload = { question_text: u.question_text };
      if (u.option_a) qPayload.option_a = u.option_a;
      if (u.option_b) qPayload.option_b = u.option_b;
      if (u.option_c) qPayload.option_c = u.option_c;
      if (u.option_d) qPayload.option_d = u.option_d;

      await supabase
        .from("questions")
        .update(qPayload)
        .eq("exam", "JEE Main")
        .eq("source_type", "PREPZII_PRACTICE")
        .eq("chapter", item.chapter)
        .eq("correct_option", item.correct_option.toLowerCase());

      console.log(`Updated aligned layout for ${u.paper_code} Q${u.question_number}`);
    }
  }

  await fs.writeFile(datasetPath, JSON.stringify(dataset, null, 2), "utf8");
  console.log("Successfully updated aligned formatting in database!");
}

applyUpdates().catch(console.error);
