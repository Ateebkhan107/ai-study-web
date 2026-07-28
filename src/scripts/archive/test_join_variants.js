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

async function testJoinVariants() {
//   console.log('Testing different join syntaxes:\n');
  
  // Test 1: Using !inner with explicit column
//   console.log('Test 1: pyq_questions!inner(exam_id)');
  const { data: t1, error: e1 } = await supabase
    .from('pyq_questions')
    .select('*, pyq_exams!inner(exam_id)')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(1);
//   console.log('Result:', t1?.length || 0, 'Error:', e1?.message || 'none');
  
  // Test 2: Using !inner on the foreign key column
//   console.log('\nTest 2: pyq_exams!inner(id) on exam_id');
  const { data: t2, error: e2 } = await supabase
    .from('pyq_questions')
    .select('*, pyq_exams!inner(id)')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(1);
//   console.log('Result:', t2?.length || 0, 'Error:', e2?.message || 'none');
  
  // Test 3: Simple select without inner
//   console.log('\nTest 3: pyq_exams(*)');
  const { data: t3, error: e3 } = await supabase
    .from('pyq_questions')
    .select('*, pyq_exams(*)')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(1);
//   console.log('Result:', t3?.length || 0, 'Error:', e3?.message || 'none');
  if (t3 && t3.length > 0) {
//     console.log('Exam data:', JSON.stringify(t3[0].pyq_exams));
  }
  
  // Test 4: Try the exact API query from route.js
//   console.log('\nTest 4: Exact API query from route.js');
  const { data: t4, error: e4 } = await supabase
    .from("pyq_questions")
    .select("*, pyq_exams!inner(status)")
    .eq("pyq_exams.status", "PUBLISHED")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .limit(1);
//   console.log('Result:', t4?.length || 0, 'Error:', e4?.message || 'none');
}

testJoinVariants();
