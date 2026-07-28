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

async function checkExamIdLink() {
  // Check if questions have exam_id set
  const { data, error } = await supabase
    .from('pyq_questions')
    .select('id, exam_id, subject')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
//   console.log('NEET 2025 questions with exam_id:');
  data.forEach(q => {
//     console.log(`ID: ${q.id}, exam_id: ${q.exam_id}, subject: ${q.subject}`);
  });
  
  // Check the exam entry
  const { data: exam, error: examError } = await supabase
    .from('pyq_exams')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .single();
  
  if (examError) {
    console.error('Error fetching exam:', examError);
  } else {
//     console.log('\nExam entry:', exam.id, exam.status);
  }
}

checkExamIdLink();
