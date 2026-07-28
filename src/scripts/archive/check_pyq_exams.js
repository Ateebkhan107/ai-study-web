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

async function checkPYQExams() {
  const { data, error } = await supabase
    .from('pyq_exams')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
//   console.log('NEET 2025 entries in pyq_exams table:', data.length);
  if (data.length > 0) {
    data.forEach(exam => {
//       console.log(`ID: ${exam.id}, Status: ${exam.status}, Exam Type: ${exam.exam_type}, Attempt: ${exam.attempt}`);
    });
  } else {
//     console.log('No NEET 2025 exam entries found in pyq_exams table');
  }
}

checkPYQExams();
