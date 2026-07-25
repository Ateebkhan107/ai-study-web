const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const userId = 'user_3FgkqSrzFtkzCpjkbXadl4upu09'; // Test User ID
  
  const res = await fetch(`${supabaseUrl}/rest/v1/user_xp?user_id=eq.${userId}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  
  const rows = await res.json();
  console.log("Rows for user:", rows.length);
  console.log(rows.map(r => ({ id: r.id, xp: r.xp, updated_at: r.updated_at })));
}

run();
