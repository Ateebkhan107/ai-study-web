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

async function checkQuestions() {
  const { data, error } = await supabase
    .from('pyq_questions')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
//   console.log('NEET 2025 questions in database:', data.length);
  if (data.length > 0) {
//     console.log('Sample question ID:', data[0].id);
//     console.log('Sample question subject:', data[0].subject);
//     console.log('Sample question chapter:', data[0].chapter);
  } else {
//     console.log('No NEET 2025 questions found in database');
  }
}

checkQuestions();
