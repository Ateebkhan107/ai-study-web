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

async function recreateAndLink() {
  // Get the exam_id from questions
  const { data: questions, error: qError } = await supabase
    .from('pyq_questions')
    .select('exam_id')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .limit(1);
  
  if (qError || !questions || questions.length === 0) {
    console.error('Error getting question exam_id:', qError);
    process.exit(1);
  }
  
  const existingExamId = questions[0].exam_id;
//   console.log('Existing exam_id in questions:', existingExamId);
  
  // Check if this exam exists
  const { data: existingExam, error: eError } = await supabase
    .from('pyq_exams')
    .select('*')
    .eq('id', existingExamId);
  
  if (eError) {
    console.error('Error checking existing exam:', eError);
  } else {
//     console.log('Existing exam found:', existingExam?.length || 0);
    if (existingExam && existingExam.length > 0) {
//       console.log('Exam details:', existingExam[0]);
    }
  }
  
  // Create the exam entry with the exact ID that questions reference
  const { data: newExam, error: createError } = await supabase
    .from('pyq_exams')
    .insert({
      id: existingExamId, // Use the existing ID
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
  
  if (createError) {
    console.error('Error creating exam:', createError);
    process.exit(1);
  }
  
//   console.log('Created/recreated exam entry:', newExam.id, newExam.status, newExam.is_published);
  
  // Verify the join works now
  const { data: verify, error: verifyError } = await supabase
    .from('pyq_questions')
    .select('*, pyq_exams(*)')
    .eq('exam', 'NEET')
    .eq('year', 2025)
    .eq('subject', 'Physics')
    .limit(1);
  
  if (verifyError) {
    console.error('Verification error:', verifyError);
  } else {
//     console.log('Verification - joined exam data:', verify[0].pyq_exams);
  }
}

recreateAndLink();
