export const NEET_MAX_SCORE = 720;
export const NEET_TOTAL_QUESTIONS = 180;
export const NEET_SUBJECTS = ["Physics", "Chemistry", "Biology"];

/**
 * Validates NEET input counts for a subject or total exam.
 */
export function validateNEETInputs(correct, incorrect, unanswered, totalExpected = 180) {
  if (correct < 0 || incorrect < 0 || unanswered < 0) {
    return { valid: false, error: "Counts cannot be negative." };
  }
  if (correct + incorrect + unanswered !== totalExpected) {
    return { valid: false, error: `Total questions must be exactly ${totalExpected}.` };
  }
  return { valid: true };
}

/**
 * Calculates raw score based on correct and incorrect answers.
 * +4 for correct, -1 for incorrect.
 */
export function calculateSubjectScore(correct, incorrect) {
  return (correct * 4) - (incorrect * 1);
}

/**
 * Calculates complete NEET scoring metrics from exact numbers.
 */
export function calculateNEETScore(correct, incorrect, unanswered) {
  const score = calculateSubjectScore(correct, incorrect);
  const attempted = correct + incorrect;
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  const percentage = (score / NEET_MAX_SCORE) * 100;
  
  return {
    score: Math.max(-180, Math.min(NEET_MAX_SCORE, score)),
    attempted,
    unanswered,
    correct,
    incorrect,
    accuracy,
    percentage,
    negativeMarks: incorrect * 1,
  };
}
