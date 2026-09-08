import { supabaseAdmin } from "./src/lib/supabaseAdmin.js";

async function run() {
  const { data, error } = await supabaseAdmin.rpc('get_tables_custom'); 
  // Probably won't work if RPC doesn't exist.
  // Instead, let's just make a query to user_answers and test_attempts which we know exist, and then figure out the revision schema.
  const { data: cards, error: err2 } = await supabaseAdmin.from('formula_card_progress').select('*').limit(1);
  console.log("formula_card_progress:", err2 ? err2.message : "exists");
  
  const { data: rev, error: err3 } = await supabaseAdmin.from('revision_progress').select('*').limit(1);
  console.log("revision_progress:", err3 ? err3.message : "exists");
  
  const { data: rec, error: err4 } = await supabaseAdmin.from('revision_recall').select('*').limit(1);
  console.log("revision_recall:", err4 ? err4.message : "exists");
  
  const { data: at, error: err5 } = await supabaseAdmin.from('formula_card_attempts').select('*').limit(1);
  console.log("formula_card_attempts:", err5 ? err5.message : "exists");
}
run();
