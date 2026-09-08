import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

async function run() {
  const { data, error } = await supabase.from('zi_preferences').select('*').limit(1);
  if (error) console.error("Error:", error);
  else console.log("Success! Data:", data);
}
run();
