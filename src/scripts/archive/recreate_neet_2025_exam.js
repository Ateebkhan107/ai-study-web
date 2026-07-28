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

async function recreateNEET2025Exam() {
  // First, clear exam_id from questions
  const { error: clearError } = await supabase
    .from('pyq_questions')
    .update({ exam_id: null })
    .eq('exam', 'NEET')
    .eq('year', 2025);
  
  if (clearError) {
    console.error('Error clearing exam_id:', clearError);
  } else {
//     console.log('Cleared exam_id from NEET 2025 questions');
  }
  
  // Create exam entry
  const { data: examData, error: examError } = await supabase
    .from('pyq_exams')
    .insert({
      exam: 'NEET',
      exam_type: 'NEET UG',
      year: 2025,
      exam_date: '2025-05-04',
      paper_code: 'Narmada 48',
      attempt: 'NEET 2025 Official',
      shift: 'Shift 1',
      status: 'PUBLISHED',
      is_published: true
    })
    .select()
    .single();
  
  if (examError) {
    console.error('Error creating exam entry:', examError);
    process.exit(1);
  }
  
//   console.log('Created exam entry:', examData.id, examData.status, examData.is_published);
  
  // Update questions to link to this exam
  const { error: updateError } = await supabase
    .from('pyq_questions')
    .update({ exam_id: examData.id })
    .eq('exam', 'NEET')
    .eq('year', 2025);
  
  if (updateError) {
    console.error('Error updating questions:', updateError);
    process.exit(1);
  }
  
//   console.log('Updated NEET 2025 questions to link to exam entry');
  
  // Verify
  const { data: verifyData, error: verifyError } = await supabase
    .from('pyq_exams')
    .select('*');
  
  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
//     console.log('Total exams in table:', verifyData.length);
    verifyData.forEach(e => {
//       console.log(`Exam: ${e.exam}, Year: ${e.year}, Status: ${e.status}, is_published: ${e.is_published}`);
    });
  }
}

recreateNEET2025Exam();
