const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: d1, error: e1 } = await supabase.from('pyq_bookmarks').select('*').limit(1);
  if (e1) console.error("pyq_bookmarks error:", e1.message);
  else console.log("pyq_bookmarks exists:", d1);

  const { data: d2, error: e2 } = await supabase.from('saved_questions').select('*').limit(1);
  if (e2) console.error("saved_questions error:", e2.message);
  else console.log("saved_questions exists:", d2);
}
check();
