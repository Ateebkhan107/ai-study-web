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

async function checkAllQuestions() {
  // Get all NEET 2025 questions
  const { data: questions, error: qError } = await supabase
    .from('pyq_questions')
    .select('id, subject, exam_id')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .limit(5);
  
  if (qError) {
    console.error('Error:', qError);
    process.exit(1);
  }
  
//   console.log('Sample NEET 2025 questions:');
  questions.forEach(q => {
//     console.log(`ID: ${q.id}, Subject: ${q.subject}, exam_id: ${q.exam_id}`);
  });
  
  // Get all exams
  const { data: exams, error: eError } = await supabase
    .from('pyq_exams')
    .select('*');
  
  if (eError) {
    console.error('Error:', eError);
  } else {
//     console.log('\nAll exams:');
    exams.forEach(e => {
//       console.log(`ID: ${e.id}, Exam: ${e.exam}, Year: ${e.year}, Status: ${e.status}, is_published: ${e.is_published}`);
    });
  }
  
  // Try query without join first
  const { data: noJoin, error: noJoinError } = await supabase
    .from('pyq_questions')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(3);
  
//   console.log('\nWithout join:', noJoin?.length || 0, 'Physics questions');
  
  // Try with different join syntax
  const { data: withJoin, error: joinError } = await supabase
    .from('pyq_questions')
    .select('*, pyq_exams(*)')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(3);
  
//   console.log('With join (*):', withJoin?.length || 0, 'Physics questions');
  if (withJoin && withJoin.length > 0) {
//     console.log('First question exam data:', withJoin[0].pyq_exams);
  }
}

checkAllQuestions();
