const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const userId = 'user_3FgkqSrzFtkzCpjkbXadl4upu09'; // Test User ID
  const stream = "JEE";
  
  const res = await fetch(`${supabaseUrl}/rest/v1/test_attempts?select=*,tests(exam),user_answers(questions(exam))&user_id=eq.${userId}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  
  const rawAttempts = await res.json();
  console.log("Raw Attempts count:", rawAttempts.length);
  
  const trackUpper = stream.toUpperCase();
  const attempts = rawAttempts.filter(a => {
    let attemptExam = null;
    if (a.tests?.exam) {
      attemptExam = a.tests.exam;
    } else if (a.user_answers && a.user_answers.length > 0) {
      const firstAns = a.user_answers.find(ans => ans.questions && ans.questions.exam);
      if (firstAns) attemptExam = firstAns.questions.exam;
    }
    
    if (!attemptExam) return false;
    return attemptExam.toUpperCase().includes(trackUpper === "JEE" ? "JEE" : "NEET");
  });
  
  console.log("Filtered Attempts for", stream, ":", attempts.length);
  
  const neetAttempts = rawAttempts.filter(a => {
    let attemptExam = null;
    if (a.tests?.exam) {
      attemptExam = a.tests.exam;
    } else if (a.user_answers && a.user_answers.length > 0) {
      const firstAns = a.user_answers.find(ans => ans.questions && ans.questions.exam);
      if (firstAns) attemptExam = firstAns.questions.exam;
    }
    
    if (!attemptExam) return false;
    return attemptExam.toUpperCase().includes("NEET");
  });
  console.log("Filtered Attempts for NEET:", neetAttempts.length);
}

run();
