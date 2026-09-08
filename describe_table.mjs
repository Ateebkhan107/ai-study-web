import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function run() {
  const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
  if (error) console.error(error);
  else console.log("user_profiles:", Object.keys(data[0] || {}));
  
  const { data: d2, error: e2 } = await supabase.from('user_settings').select('*').limit(1);
  if (e2) console.error("user_settings:", e2.message);
  else console.log("user_settings:", Object.keys(d2[0] || {}));
}
run();
