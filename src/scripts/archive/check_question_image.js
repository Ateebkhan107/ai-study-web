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

async function checkQuestionImage() {
  const { data, error } = await supabase
    .from('pyq_questions')
    .select('id, question_number, question_image')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
//   console.log('NEET 2025 questions with question_image field:');
  data.forEach((q) => {
//     console.log(`Question ${q.question_number}: question_image = ${q.question_image}`);
  });
  
  const { count } = await supabase
    .from('pyq_questions')
    .select('*', { count: 'exact', head: true })
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .not('question_image', 'is', null);
  
//   console.log(`\nQuestions with question_image populated: ${count}`);
}

checkQuestionImage();
