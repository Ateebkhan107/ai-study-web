import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) env[key] = rest.join('=');
});

async function run() {
  const url1 = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pyq_attempts?limit=1`;
  const url2 = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/test_attempts?limit=1`;
  const res1 = await fetch(url1, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }});
  const res2 = await fetch(url2, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }});
  
  const d1 = await res1.json();
  const d2 = await res2.json();
//   console.log('pyq_attempts:', d1.length ? Object.keys(d1[0]) : 'No data');
//   console.log('test_attempts:', d2.length ? Object.keys(d2[0]) : 'No data');
}
run();
