import fs from 'fs';
import https from 'https';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  if (line.includes('=')) {
    const [k, ...v] = line.split('=');
    env[k.trim()] = v.join('=').trim();
  }
}

const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/josaa_cutoffs';
const headers = {
  'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'Prefer': 'count=exact'
};

function query(name, qStr) {
  return new Promise((resolve) => {
    https.get(baseUrl + '?' + qStr + '&limit=1', { headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const count = res.headers['content-range'] ? res.headers['content-range'].split('/')[1] : 0;
        console.log(`\nQuery: ${name}`);
        console.log(`Count: ${count}`);
        if (data && data !== '[]') {
          console.log(`Sample:`, JSON.parse(data)[0]);
        }
        resolve();
      });
    });
  });
}

async function run() {
  await query('CSE Programs', 'academic_program_name=ilike.*Computer%20Science*');
  await query('NITs', 'institute_name=ilike.*National%20Institute%20of%20Technology*');
  await query('OBC-NCL', 'seat_type=eq.OBC-NCL');
  await query('OPEN', 'seat_type=eq.OPEN');
  await query('HS Quota', 'quota=eq.HS');
  await query('OS Quota', 'quota=eq.OS');
}

run();
