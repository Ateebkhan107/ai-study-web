import fs from 'fs';
import https from 'https';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  if (line.includes('=')) {
    const [k, v] = line.split('=');
    env[k.trim()] = v.trim();
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/josaa_cutoffs';
const payload = JSON.stringify([{
  year: 2026,
  round: 5,
  institute_name: "Test",
  academic_program_name: "Test",
  quota: "AI",
  seat_type: "OPEN",
  gender_pool: "Test",
  opening_rank: 1,
  closing_rank: 2,
  is_preparatory: false
}]);

const options = {
  method: 'POST',
  headers: {
    'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

const req = https.request(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(res.statusCode, data);
  });
});
req.write(payload);
req.end();
