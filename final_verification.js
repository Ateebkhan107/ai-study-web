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

async function finalVerification() {
  const subjects = ['Physics', 'Chemistry', 'Biology'];
  
  console.log('Final verification of NEET 2025 questions:\n');
  
  for (const subject of subjects) {
    const { data, error } = await supabase
      .from("pyq_questions")
      .select("*, pyq_exams!inner(status)")
      .eq("pyq_exams.status", "PUBLISHED")
      .eq("exam", "NEET")
      .eq("year", 2025)
      .eq("subject", subject);
    
    if (error) {
      console.error(`${subject} - Error:`, error.message);
    } else {
      console.log(`${subject}: ${data.length} questions`);
    }
  }
  
  // Total count
  const { data: total, error: totalError } = await supabase
    .from("pyq_questions")
    .select("*, pyq_exams!inner(status)")
    .eq("pyq_exams.status", "PUBLISHED")
    .eq("exam", "NEET")
    .eq("year", 2025);
  
  if (totalError) {
    console.error('\nTotal - Error:', totalError.message);
  } else {
    console.log(`\nTotal NEET 2025 questions: ${total.length}`);
  }
  
  // Check exam entry
  const { data: exam, error: examError } = await supabase
    .from('pyq_exams')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('is_published', true)
    .single();
  
  if (examError) {
    console.error('\nExam entry error:', examError.message);
  } else {
    console.log(`\nExam entry: ${exam.id}, Status: ${exam.status}, Published: ${exam.is_published}`);
  }
}

finalVerification();
