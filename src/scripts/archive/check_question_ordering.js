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

async function checkQuestionOrdering() {
  const { data, error } = await supabase
    .from('pyq_questions')
    .select('id, question_number, question, subject')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .order('subject')
    .limit(20);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
//   console.log('Current question ordering (first 20):');
  data.forEach((q, i) => {
//     console.log(`${i + 1}. Subject: ${q.subject}, question_number: ${q.question_number}, ID: ${q.id.substring(0, 8)}...`);
  });
  
  // Check if question_number field is populated
  const { data: allQuestions, error: allError } = await supabase
    .from('pyq_questions')
    .select('id, question_number, question')
    .eq('exam', 'NEET')
    .eq('year', 2025);
  
  if (allError) {
    console.error('Error:', allError);
  } else {
//     console.log(`\nTotal questions: ${allQuestions.length}`);
    const withNumber = allQuestions.filter(q => q.question_number !== null).length;
//     console.log(`Questions with question_number: ${withNumber}`);
    
    // Extract question numbers from question text
//     console.log('\nExtracting question numbers from text:');
    allQuestions.slice(0, 10).forEach(q => {
      const match = q.question.match(/^Question\s+(\d+):/i);
      if (match) {
//         console.log(`ID: ${q.id.substring(0, 8)}..., Text number: ${match[1]}, DB number: ${q.question_number}`);
      }
    });
  }
}

checkQuestionOrdering();
