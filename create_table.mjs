import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_string: `
      CREATE TABLE IF NOT EXISTS zi_preferences (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        clerk_user_id text NOT NULL,
        preference_key text NOT NULL,
        preference_value text NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(clerk_user_id, preference_key)
      );
      ALTER TABLE zi_preferences ENABLE ROW LEVEL SECURITY;
    `
  });
  if (error) {
    console.error("RPC exec_sql failed:", error);
  } else {
    console.log("Success:", data);
  }
}
run();
