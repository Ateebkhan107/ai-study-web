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

async function checkForeignKey() {
  // Get a sample question with its exam_id
  const { data: question, error: qError } = await supabase
    .from('pyq_questions')
    .select('id, exam_id, subject')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(1)
    .single();
  
  if (qError) {
    console.error('Error fetching question:', qError);
    process.exit(1);
  }
  
  console.log('Sample question exam_id:', question.exam_id);
  
  // Get the exam entry
  const { data: exam, error: eError } = await supabase
    .from('pyq_exams')
    .select('*')
    .eq('id', question.exam_id)
    .single();
  
  if (eError) {
    console.error('Error fetching exam:', eError);
  } else {
    console.log('Exam entry found:', exam.id, exam.status);
  }
  
  // Try a different join syntax
  console.log('\nTest with explicit join on id:');
  const { data: joined, error: joinError } = await supabase
    .from('pyq_questions')
    .select('*, pyq_exams(*)')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(1);
  
  if (joinError) {
    console.error('Join error:', joinError);
  } else {
    console.log('Join result:', joined.length);
    if (joined.length > 0) {
      console.log('Joined exam data:', joined[0].pyq_exams);
    }
  }
}

checkForeignKey();
