const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSchema() {
  const pyqRes = await fetch(`${supabaseUrl}/rest/v1/pyq_attempts?select=*&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  console.log("PYQ:", await pyqRes.json());

  const testRes = await fetch(`${supabaseUrl}/rest/v1/test_attempts?select=*&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  console.log("TEST:", await testRes.json());
}

checkSchema();
