const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase
    .from('pyq_questions')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  if (data.length > 0) {
    console.log('Columns in pyq_questions table:');
    console.log(Object.keys(data[0]));
  }
}

checkSchema();
