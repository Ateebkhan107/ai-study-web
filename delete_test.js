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

const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/josaa_cutoffs?institute_name=eq.Test';
const options = {
  method: 'DELETE',
  headers: {
    'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
};

const req = https.request(url, options, (res) => {
  console.log(res.statusCode);
});
req.end();
