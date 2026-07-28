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

async function verifyAPI() {
  // Simulate the API call that the frontend makes
  const { data, error } = await supabase
    .from("pyq_questions")
    .select("*, pyq_exams!inner(status)")
    .eq("pyq_exams.status", "PUBLISHED")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .limit(5);
  
  if (error) {
    console.error('API Error:', error);
    process.exit(1);
  }
  
//   console.log('NEET 2025 Physics questions via API:', data.length);
  if (data.length > 0) {
//     console.log('Sample question:', data[0].question.substring(0, 100));
//     console.log('Exam status:', data[0].pyq_exams?.status);
  } else {
//     console.log('No questions returned - still an issue');
  }
}

verifyAPI();
