import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) env[key] = rest.join('=');
});

async function run() {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_profiles?limit=1`;
  const res = await fetch(url, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }});
  
  const d = await res.json();
//   console.log('user_profiles:', d.length ? Object.keys(d[0]) : 'No data');
}
run();
