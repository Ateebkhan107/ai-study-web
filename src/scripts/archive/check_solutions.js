import { createClient } from "@supabase/supabase-js";
import process from "node:process";
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket;
process.loadEnvFile(".env.local");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb.from("pyq_questions").select("year, count", { count: "exact", head: false });

// We want to group by year and check how many have explanation_image
const { data: qData } = await sb.from("pyq_questions").select("id, year, explanation_image");

const stats = {};
for (const q of qData) {
  if (!stats[q.year]) {
    stats[q.year] = { total: 0, withImage: 0 };
  }
  stats[q.year].total++;
  if (q.explanation_image) stats[q.year].withImage++;
}
// console.log(stats);
