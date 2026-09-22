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

const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/josaa_cutoffs';
const headers = {
  'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const rawData = JSON.parse(fs.readFileSync('src/data/admission/josaa/2026/round-5.json', 'utf8')).data;

// Validation & Metrics
let validRows = [];
let institutes = new Set();
let programs = new Set();
let seatTypes = new Set();
let quotas = new Set();
let genders = new Set();
let prepCount = 0;
let duplicateCount = 0;
let invalidCount = 0;
const seen = new Set();

for (const row of rawData) {
    if (!row.institute_name || !row.academic_program_name || !row.seat_type || !row.quota || !row.gender_pool) {
        invalidCount++;
        continue;
    }
    
    // Check ranks (missing ranks are allowed if JoSAA didn't provide them, but we'll flag them)
    if (row.opening_rank === null && !row.is_preparatory) {
        // usually perfectly fine if josaa had blank data
    }
    
    const sig = `${row.institute_name}|${row.academic_program_name}|${row.quota}|${row.seat_type}|${row.gender_pool}`;
    if (seen.has(sig)) {
        duplicateCount++;
        continue;
    }
    seen.add(sig);
    
    validRows.push(row);
    institutes.add(row.institute_name);
    programs.add(row.academic_program_name);
    seatTypes.add(row.seat_type);
    quotas.add(row.quota);
    genders.add(row.gender_pool);
    if (row.is_preparatory) prepCount++;
}

async function uploadChunk(chunk) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(chunk);
        const options = {
            method: 'POST',
            headers: headers
        };
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.statusCode);
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log(`Starting import of ${validRows.length} rows...`);
    const chunkSize = 1000;
    let inserted = 0;
    for (let i = 0; i < validRows.length; i += chunkSize) {
        const chunk = validRows.slice(i, i + chunkSize);
        console.log(`Uploading chunk ${i} to ${i + chunk.length}...`);
        try {
            await uploadChunk(chunk);
            inserted += chunk.length;
        } catch (e) {
            console.error("Upload failed on chunk:", e.message);
            process.exit(1);
        }
    }
    
    console.log(`\n--- IMPORT REPORT ---`);
    console.log(`Total rows inserted: ${inserted}`);
    console.log(`Unique institutes: ${institutes.size}`);
    console.log(`Unique programs: ${programs.size}`);
    console.log(`Unique seat types: ${seatTypes.size}`);
    console.log(`Unique quotas: ${quotas.size}`);
    console.log(`Unique gender pools: ${genders.size}`);
    console.log(`Preparatory records: ${prepCount}`);
    console.log(`Duplicates ignored: ${duplicateCount}`);
    console.log(`Invalid records: ${invalidCount}`);
}

run();
