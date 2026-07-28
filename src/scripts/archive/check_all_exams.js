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

async function checkAllExams() {
  const { data, error } = await supabase
    .from('pyq_exams')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
//   console.log('All exams in pyq_exams table:', data.length);
  data.forEach(exam => {
//     console.log(`ID: ${exam.id}, Exam: ${exam.exam}, Year: ${exam.year}, Status: ${exam.status}, is_published: ${exam.is_published}`);
  });
}

checkAllExams();
