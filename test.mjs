import { createClient } from "@supabase/supabase-js";
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket;
import process from "node:process";
process.loadEnvFile(".env.local");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb.rpc('exec_sql', { query: 'SELECT routine_name FROM information_schema.routines WHERE routine_schema = \'public\'' });
console.log("Routines via exec_sql:", data, error);
const { data: d2, error: e2 } = await sb.rpc('execute_sql', { sql: 'SELECT 1' });
console.log("execute_sql:", d2, e2);

