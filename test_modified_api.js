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

async function testModifiedAPI() {
  // Test the modified query (same as in the updated route.js)
  let query = supabase
    .from("pyq_questions")
    .select("*")
    .not("exam_id", "is", null)
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .limit(5);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  console.log('Modified API query result:', data.length, 'Physics questions');
  
  if (data.length > 0) {
    console.log('Sample question:', data[0].question.substring(0, 100));
    console.log('Has question_image:', !!data[0].question_image);
  }
  
  // Test all subjects
  const subjects = ['Physics', 'Chemistry', 'Biology'];
  console.log('\nAll subjects:');
  for (const subject of subjects) {
    const { data: subjData, error: subjError } = await supabase
      .from("pyq_questions")
      .select("*")
      .not("exam_id", "is", null)
      .eq("exam", "NEET")
      .eq("year", 2025)
      .eq("subject", subject);
    
    if (subjError) {
      console.error(`${subject} - Error:`, subjError.message);
    } else {
      console.log(`${subject}: ${subjData.length} questions`);
    }
  }
}

testModifiedAPI();
