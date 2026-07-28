import { supabase } from "@/lib/supabaseClient";


// =============================
// GET USER XP PROFILE
// =============================

export async function getUserXP(userId){


const { data, error } = await supabase

.from("user_xp")

.select("*")

.eq(
"user_id",
userId
)

.single();



if(error){


console.log(
"Profile XP error:",
error
);


return null;


}



return data;


}






// =============================
// GET USER GLOBAL RANK
// =============================

export async function getUserRank(userId){


const { data, error } = await supabase

.from("user_xp")

.select(
"user_id,xp"
)

.order(
"xp",
{
ascending:false
}
);



if(error){


console.log(
"Rank error:",
error
);


return null;


}




const index = data.findIndex(

user => user.user_id === userId

);



return index >= 0

?

index + 1

:

null;


}










// =============================
// GET USER PROFILE ANALYTICS
// =============================
export async function getProfileAnalytics(userId, stream = "JEE") {
  if (!userId) return null;

  try {
    // 1. Fetch PYQ Attempts
    const { data: pyqAttemptsRaw, error: pyqError } = await supabase
      .from("pyq_attempts")
      .select("is_correct, pyq_questions(exam)")
      .eq("user_id", userId);

    if (pyqError) throw pyqError;

    const pyqAttempts = (pyqAttemptsRaw || []).filter(a => {
        const ex = a.pyq_questions?.exam;
        if (!ex) return false;
        const trackUpper = stream.toUpperCase();
        return ex.toUpperCase().includes(trackUpper === "JEE" ? "JEE" : "NEET");
    });

    // 2. Fetch Test Attempts
    const { data: testAttemptsRaw, error: testError } = await supabase
      .from("test_attempts")
      .select("attempted, correct_answers, correct, time_taken_seconds, accuracy, score, tests(exam), user_answers(questions(exam))")
      .eq("user_id", userId);

    if (testError) throw testError;

    const testAttempts = (testAttemptsRaw || []).filter(a => {
        let attemptExam = null;
        if (a.tests?.exam) {
            attemptExam = a.tests.exam;
        } else if (a.user_answers && a.user_answers.length > 0) {
            const firstAns = a.user_answers.find(ans => ans.questions?.exam);
            if (firstAns) attemptExam = firstAns.questions.exam;
        }
        
        if (!attemptExam) return false;
        const trackUpper = stream.toUpperCase();
        return attemptExam.toUpperCase().includes(trackUpper === "JEE" ? "JEE" : "NEET");
    });

    // 3. Calculate PYQ metrics
    const pyqTotal = pyqAttempts?.length || 0;
    const pyqCorrect = pyqAttempts?.filter(a => a.is_correct).length || 0;

    // 4. Calculate Test metrics
    const testsCompleted = testAttempts?.length || 0;
    let testTotalQs = 0;
    let testCorrectQs = 0;
    let totalTimeSecs = 0;
    let bestMockScore = 0;

    if (testAttempts && testAttempts.length > 0) {
      testAttempts.forEach(t => {
        testTotalQs += (t.attempted || 0);
        testCorrectQs += (t.correct_answers || t.correct || 0);
        totalTimeSecs += (t.time_taken_seconds || 0);
        const tScore = t.accuracy || t.score || 0;
        if (tScore > bestMockScore) {
          bestMockScore = tScore;
        }
      });
    }

    // 5. Aggregate
    const totalQuestionsAttempted = pyqTotal + testTotalQs;
    const totalCorrect = pyqCorrect + testCorrectQs;
    const accuracy = totalQuestionsAttempted > 0 
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) 
      : 0;

    const avgSolveSeconds = testTotalQs > 0 
      ? Math.round(totalTimeSecs / testTotalQs) 
      : null;

    return {
      testsCompleted,
      totalQuestionsAttempted,
      totalCorrect,
      accuracy,
      avgSolveSeconds,
      bestMockScore,
      pyqSolved: pyqTotal
    };

  } catch (error) {
    console.error("Error fetching profile analytics:", error);
    return {
      testsCompleted: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      accuracy: 0,
      avgSolveSeconds: null,
      bestMockScore: 0,
      pyqSolved: 0
    };
  }
}