const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const userId = 'user_3FgkqSrzFtkzCpjkbXadl4upu09'; // Test User ID
  
  const res = await fetch(`${supabaseUrl}/rest/v1/pyq_attempts?user_id=eq.${userId}&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  
  const rawAttempts = await res.json();
  console.log("PYQ Response:", JSON.stringify(rawAttempts).substring(0, 500));
}

run();
