const TRACK_EXAM_MATCHERS = {
  JEE: ["JEE"],
  NEET: ["NEET", "AIPMT"],
};

export function normalizeTrack(track = "JEE") {
  const value = String(track || "JEE").trim().toUpperCase();
  return value === "NEET" ? "NEET" : "JEE";
}

export function examMatchesTrack(exam, track = "JEE") {
  if (!exam) return false;

  const examLabel = String(exam).toUpperCase();
  const normalizedTrack = normalizeTrack(track);
  const matchers = TRACK_EXAM_MATCHERS[normalizedTrack] || TRACK_EXAM_MATCHERS.JEE;

  return matchers.some((matcher) => examLabel.includes(matcher));
}

export function calculateStudyStreak(activityDates = []) {
  const validDates = activityDates
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b - a);

  if (validDates.length === 0) return 0;

  const uniqueDays = [...new Set(validDates.map((date) => {
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    return localDate.getTime();
  }))].sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDay = uniqueDays[0];
  if (mostRecentDay !== today.getTime() && mostRecentDay !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  let expectedPrevDay = new Date(mostRecentDay);
  expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);

  for (let index = 1; index < uniqueDays.length; index += 1) {
    if (uniqueDays[index] !== expectedPrevDay.getTime()) break;
    streak += 1;
    expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
  }

  return streak;
}

export function getDefaultMarkingForExam(exam = "JEE Main") {
  const examLabel = String(exam || "").toUpperCase();

  if (examLabel.includes("NEET") || examLabel.includes("AIPMT")) {
    return { positive: 4, negative: 1 };
  }

  if (examLabel.includes("JEE")) {
    return { positive: 4, negative: 1 };
  }

  return { positive: 4, negative: 1 };
}

export function getQuestionMarking(question, exam) {
  const defaults = getDefaultMarkingForExam(exam || question?.exam);
  const positive = Number(question?.marks ?? question?.marks_positive);
  const negative = Number(question?.negative_marks ?? question?.marks_negative);

  return {
    positive: Number.isFinite(positive) && positive > 0 ? positive : defaults.positive,
    negative: Number.isFinite(negative) ? Math.abs(negative) : defaults.negative,
  };
}

export function calculateQuestionScore(question, selectedOption, exam) {
  const { positive, negative } = getQuestionMarking(question, exam);
  const attempted = selectedOption !== undefined && selectedOption !== null;
  const isCorrect = attempted && selectedOption === question?.correct;

  return {
    attempted,
    isCorrect,
    positive,
    negative,
    maxScore: positive,
    scoreDelta: !attempted ? 0 : isCorrect ? positive : -negative,
  };
}
