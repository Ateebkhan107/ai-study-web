import { getQuestions } from "./src/lib/questions.js";
import { supabaseAdmin } from "./src/lib/supabaseAdmin.js";

async function run() {
  const q1 = await getQuestions({ exam: "NEET", subject: "Physics", chapter: "Electrostatics & Capacitance", client: supabaseAdmin });
  console.log("Single chapter count:", q1.length);
  
  const q2 = await getQuestions({ exam: "NEET", subject: "Physics", chapter: "Electrostatics & Capacitance,Current Electricity", client: supabaseAdmin });
  console.log("Multiple chapters count:", q2.length);
}
run();
