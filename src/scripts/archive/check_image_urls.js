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

async function checkImageUrls() {
  const { data, error } = await supabase
    .from('pyq_questions')
    .select('id, question, image_url, image_path')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
//   console.log('Sample NEET 2025 questions with image data:');
  data.forEach((q, i) => {
//     console.log(`\nQuestion ${i + 1}:`);
//     console.log('ID:', q.id);
//     console.log('Question:', q.question.substring(0, 50) + '...');
//     console.log('image_url:', q.image_url);
//     console.log('image_path:', q.image_path);
  });
}

checkImageUrls();
