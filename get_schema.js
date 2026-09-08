import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://vyqcciooigmnfmzrwtpp.supabase.co", process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
  console.log(data);
}
run();
