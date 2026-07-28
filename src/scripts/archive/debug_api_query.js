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

async function debugQuery() {
//   console.log('Test 1: Simple query without join');
  const { data: data1, error: error1 } = await supabase
    .from("pyq_questions")
    .select("*")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .limit(3);
//   console.log('Result:', data1?.length || 0, 'questions');
  if (error1) console.log('Error:', error1.message);
  
//   console.log('\nTest 2: Query with exam_id');
  const { data: data2, error: error2 } = await supabase
    .from("pyq_questions")
    .select("*")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .not("exam_id", "is", null)
    .limit(3);
//   console.log('Result:', data2?.length || 0, 'questions with exam_id');
  if (error2) console.log('Error:', error2.message);
  
//   console.log('\nTest 3: Query with join');
  const { data: data3, error: error3 } = await supabase
    .from("pyq_questions")
    .select("*, pyq_exams!inner(status)")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .limit(3);
//   console.log('Result:', data3?.length || 0, 'questions with join');
  if (error3) console.log('Error:', error3.message);
  
//   console.log('\nTest 4: Query with join and status filter');
  const { data: data4, error: error4 } = await supabase
    .from("pyq_questions")
    .select("*, pyq_exams!inner(status)")
    .eq("pyq_exams.status", "PUBLISHED")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .limit(3);
//   console.log('Result:', data4?.length || 0, 'questions with join and status');
  if (error4) console.log('Error:', error4.message);
}

debugQuery();
