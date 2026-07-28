import { createClient } from '@supabase/supabase-js';
import process from 'process';

process.loadEnvFile('.env.local');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from("user_xp")
    .upsert(
      {
        user_id: "test_duplicate",
        name: "Test",
        xp: 0,
        level: 1,
        badge: "Explorer"
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  if (error) {
    console.error("UPSERT ERROR:", error);
  } else {
//     console.log("UPSERT SUCCESS");
  }
}
run();
