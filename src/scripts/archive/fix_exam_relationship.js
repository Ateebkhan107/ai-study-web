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

async function fixExamRelationship() {
  // Get all NEET 2025 exam entries
  const { data: exams, error: examsError } = await supabase
    .from('pyq_exams')
    .select('*')
    .eq('exam', 'NEET')
    .eq('year', 2025);
  
  if (examsError) {
    console.error('Error fetching exams:', examsError);
    process.exit(1);
  }
  
//   console.log('NEET 2025 exam entries:', exams.length);
  exams.forEach(e => {
//     console.log(`ID: ${e.id}, Status: ${e.status}, is_published: ${e.is_published}`);
  });
  
  // Delete duplicate exam entries, keep only the one with is_published = true
  const publishedExam = exams.find(e => e.is_published === true);
  const unpublishedExams = exams.filter(e => e.is_published !== true);
  
  if (publishedExam && unpublishedExams.length > 0) {
//     console.log(`\nDeleting ${unpublishedExams.length} unpublished exam entries...`);
    for (const exam of unpublishedExams) {
      const { error: deleteError } = await supabase
        .from('pyq_exams')
        .delete()
        .eq('id', exam.id);
      if (deleteError) {
        console.error('Error deleting exam:', deleteError);
      } else {
//         console.log(`Deleted exam ${exam.id}`);
      }
    }
  }
  
  // Update all questions to use the published exam ID
  if (publishedExam) {
//     console.log(`\nUpdating questions to use published exam ID: ${publishedExam.id}`);
    const { error: updateError } = await supabase
      .from('pyq_questions')
      .update({ exam_id: publishedExam.id })
      .eq('exam', 'NEET')
      .eq('year', 2025);
    
    if (updateError) {
      console.error('Error updating questions:', updateError);
    } else {
//       console.log('Updated all NEET 2025 questions');
    }
  }
  
  // Verify the fix
//   console.log('\nVerifying fix...');
  const { data: verifyData, error: verifyError } = await supabase
    .from("pyq_questions")
    .select("*, pyq_exams!inner(status)")
    .eq("pyq_exams.status", "PUBLISHED")
    .eq("exam", "NEET")
    .eq("year", 2025)
    .eq("subject", "Physics")
    .limit(3);
  
  if (verifyError) {
    console.error('Verification error:', verifyError);
  } else {
//     console.log('Verification successful! Found', verifyData.length, 'Physics questions');
  }
}

fixExamRelationship();
