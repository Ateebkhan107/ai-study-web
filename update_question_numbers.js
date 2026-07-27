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
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function updateQuestionNumbers() {
  // Get all NEET 2025 questions
  const { data: questions, error } = await supabase
    .from('pyq_questions')
    .select('id, question')
    .eq('exam', 'NEET')
    .eq('year', 2025);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log(`Found ${questions.length} questions to update`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const q of questions) {
    // Extract question number from text
    const match = q.question.match(/^Question\s+(\d+):/i);
    if (match) {
      const questionNumber = parseInt(match[1], 10);
      
      // Update the question_number field
      const { error: updateError } = await supabase
        .from('pyq_questions')
        .update({ question_number: questionNumber })
        .eq('id', q.id);
      
      if (updateError) {
        console.error(`Error updating question ${q.id}:`, updateError);
        errorCount++;
      } else {
        updatedCount++;
        if (updatedCount % 20 === 0) {
          console.log(`Updated ${updatedCount} questions...`);
        }
      }
    }
  }
  
  console.log(`\nCompleted: ${updatedCount} questions updated, ${errorCount} errors`);
}

updateQuestionNumbers();
