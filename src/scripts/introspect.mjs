const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const tables = ['pyq_attempts', 'test_attempts', 'questions', 'pyq_questions', 'tests', 'user_answers'];
  for (const table of tables) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });
    
    if (!res.ok) {
      console.log(`Table ${table} error:`, await res.text());
    } else {
      const data = await res.json();
      console.log(`Table ${table} columns:`, data.length > 0 ? Object.keys(data[0]).join(', ') : 'Empty table');
    }
  }
}
run();
