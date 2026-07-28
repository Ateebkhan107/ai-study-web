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

async function checkForeignKeyConstraint() {
  // Use PostgreSQL to check foreign key constraints
  const { data, error } = await supabase.rpc('check_foreign_key', {
    table_name: 'pyq_questions',
    column_name: 'exam_id'
  });
  
  if (error) {
    console.error('Error checking foreign key:', error);
//     console.log('The RPC function might not exist. Trying alternative approach...');
    
    // Alternative: Try to manually check by querying information_schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'pyq_questions')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (schemaError) {
      console.error('Error querying schema:', schemaError);
    } else {
//       console.log('Foreign key constraints on pyq_questions:', schemaData);
    }
  } else {
//     console.log('Foreign key check result:', data);
  }
  
  // Try a simpler approach: just query without the join and filter by exam existence
//   console.log('\nAlternative approach: Query questions and check if exam exists separately');
  const { data: questions, error: qError } = await supabase
    .from('pyq_questions')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(3);
  
  if (qError) {
    console.error('Error:', qError);
  } else {
//     console.log('Found', questions.length, 'questions without join');
    
    // Check if their exam_id exists in pyq_exams
    for (const q of questions) {
      const { data: exam, error: eError } = await supabase
        .from('pyq_exams')
        .select('*')
        .eq('id', q.exam_id)
        .single();
      
      if (eError) {
//         console.log(`Question ${q.id}: Exam ${q.exam_id} not found`);
      } else {
//         console.log(`Question ${q.id}: Exam ${q.exam_id} found, status: ${exam.status}`);
      }
    }
  }
}

checkForeignKeyConstraint();
