import { supabase } from "@/lib/supabase";
import {
  calculateStudyStreak,
  examMatchesTrack,
  normalizeTrack,
} from "@/lib/analyticsHelpers";

function getAttemptExam(attempt) {
  if (attempt?.tests?.exam) return attempt.tests.exam;

  const answerWithExam = attempt?.user_answers?.find((answer) => answer?.questions?.exam);
  return answerWithExam?.questions?.exam || null;
}

function groupPyqTrend(pyqAttempts) {
  const grouped = new Map();

  pyqAttempts.forEach((attempt) => {
    const date = attempt.attempted_at || attempt.created_at;
    if (!date) return;

    const bucket = new Date(date).toISOString().split("T")[0];
    const positive = Number(attempt.pyq_questions?.marks_positive);
    const negative = Number(attempt.pyq_questions?.marks_negative);
    const maxScore = Number.isFinite(positive) && positive > 0 ? positive : 4;
    const penalty = Number.isFinite(negative) ? Math.abs(negative) : 1;
    const scoreDelta = attempt.is_correct ? maxScore : -penalty;

    if (!grouped.has(bucket)) {
      grouped.set(bucket, { date: bucket, score: 0, maxScore: 0, count: 0 });
    }

    const entry = grouped.get(bucket);
    entry.score += scoreDelta;
    entry.maxScore += maxScore;
    entry.count += 1;
  });

  return [...grouped.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      date: item.date,
      label: `PYQ ${item.date}`,
      score: item.maxScore > 0 ? Math.max(0, Math.round((item.score / item.maxScore) * 100)) : 0,
    }));
}

export async function getUserAnalytics(userId, stream = "JEE") {
  const track = normalizeTrack(stream);

  const [{ data: rawAttempts, error: testError }, { data: pyqAttemptsRaw, error: pyqError }] = await Promise.all([
    supabase
      .from("test_attempts")
      .select(`
        created_at,
        score,
        total_marks,
        total_questions,
        correct_answers,
        attempted,
        time_taken_seconds,
        tests ( exam ),
        user_answers (
          selected_option,
          is_correct,
          created_at,
          questions (
            exam,
            subject,
            chapter
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("pyq_attempts")
      .select(`
        is_correct,
        attempted_at,
        pyq_questions (
          exam,
          subject,
          chapter,
          marks_positive,
          marks_negative
        )
      `)
      .eq("user_id", userId)
      .order("attempted_at", { ascending: true }),
  ]);

  if (testError) throw new Error(testError.message || JSON.stringify(testError));
  if (pyqError) throw new Error(pyqError.message || JSON.stringify(pyqError));

  const allTestAttempts = rawAttempts || [];
  const allPyqAttempts = pyqAttemptsRaw || [];

  const attempts = allTestAttempts.filter((attempt) => examMatchesTrack(getAttemptExam(attempt), track));
  const pyqAttempts = allPyqAttempts.filter((attempt) => examMatchesTrack(attempt.pyq_questions?.exam, track));

  const totalMockTests = attempts.length;
  const totalPyqSolved = pyqAttempts.length;
  const totalActivities = totalMockTests + totalPyqSolved;

  const totalScoreFromTests = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
  const totalMarksFromTests = attempts.reduce((sum, attempt) => {
    const totalMarks = Number(attempt.total_marks);
    const totalQuestions = Number(attempt.total_questions);
    return sum + (Number.isFinite(totalMarks) && totalMarks > 0 ? totalMarks : Math.max(totalQuestions, 0) * 4);
  }, 0);

  const totalScoreFromPyq = pyqAttempts.reduce((sum, attempt) => {
    const positive = Number(attempt.pyq_questions?.marks_positive);
    const negative = Number(attempt.pyq_questions?.marks_negative);
    const maxScore = Number.isFinite(positive) && positive > 0 ? positive : 4;
    const penalty = Number.isFinite(negative) ? Math.abs(negative) : 1;
    return sum + (attempt.is_correct ? maxScore : -penalty);
  }, 0);

  const totalMarksFromPyq = pyqAttempts.reduce((sum, attempt) => {
    const positive = Number(attempt.pyq_questions?.marks_positive);
    return sum + (Number.isFinite(positive) && positive > 0 ? positive : 4);
  }, 0);

  const totalScore = totalScoreFromTests + totalScoreFromPyq;
  const totalMarks = totalMarksFromTests + totalMarksFromPyq;
  const averageScore = totalMarks > 0 ? Math.max(0, Math.round((totalScore / totalMarks) * 100)) : 0;

  const totalCorrectFromTests = attempts.reduce((sum, attempt) => sum + (attempt.correct_answers || 0), 0);
  const totalAttemptedFromTests = attempts.reduce((sum, attempt) => sum + (attempt.attempted || 0), 0);
  const totalCorrectFromPyq = pyqAttempts.filter((attempt) => attempt.is_correct).length;
  const totalAttemptedFromPyq = pyqAttempts.length;

  const totalCorrect = totalCorrectFromTests + totalCorrectFromPyq;
  const totalAttempted = totalAttemptedFromTests + totalAttemptedFromPyq;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const testQuestionAttempts = attempts.flatMap((attempt) =>
    (attempt.user_answers || [])
      .filter((answer) => answer?.selected_option)
      .map((answer) => ({
        is_correct: Boolean(answer.is_correct),
        created_at: answer.created_at || attempt.created_at,
        subject: answer.questions?.subject,
        chapter: answer.questions?.chapter,
      }))
  );

  const pyqQuestionAttempts = pyqAttempts.map((attempt) => ({
    is_correct: Boolean(attempt.is_correct),
    created_at: attempt.attempted_at || attempt.created_at,
    subject: attempt.pyq_questions?.subject,
    chapter: attempt.pyq_questions?.chapter,
  }));

  const combinedQuestionAttempts = [...testQuestionAttempts, ...pyqQuestionAttempts];

  const chapterMap = {};
  const subjectMap = {};

  combinedQuestionAttempts.forEach((attempt) => {
    const chapter = attempt.chapter;
    const subject = attempt.subject;

    if (!chapter) return;

    if (!chapterMap[chapter]) {
      chapterMap[chapter] = { topic: chapter, subject, total: 0, correct: 0 };
    }
    chapterMap[chapter].total += 1;
    if (attempt.is_correct) chapterMap[chapter].correct += 1;

    if (subject) {
      if (!subjectMap[subject]) {
        subjectMap[subject] = { subject, total: 0, correct: 0 };
      }
      subjectMap[subject].total += 1;
      if (attempt.is_correct) subjectMap[subject].correct += 1;
    }
  });

  const weakTopics = Object.values(chapterMap)
    .map((chapter) => {
      const chapterAccuracy = chapter.total > 0 ? Math.round((chapter.correct / chapter.total) * 100) : 0;
      return {
        topic: chapter.topic,
        subject: chapter.subject,
        accuracy: chapterAccuracy,
        total: chapter.total,
        severity: chapterAccuracy < 50 ? "critical" : chapterAccuracy < 70 ? "warn" : "good",
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  const SUBJECT_COLORS = {
    Physics: "#378ADD",
    Chemistry: "#1D9E75",
    Maths: "#BA7517",
    Mathematics: "#BA7517",
    Biology: "#D4537E",
    Botany: "#2CAA6E",
    Zoology: "#D4537E",
  };

  const totalQuestionsAnswered = combinedQuestionAttempts.length;
  const subjectDistribution = Object.values(subjectMap)
    .map((subject) => ({
      subject: subject.subject,
      pct: totalQuestionsAnswered > 0 ? Math.round((subject.total / totalQuestionsAnswered) * 100) : 0,
      color: SUBJECT_COLORS[subject.subject] || "#6366F1",
      accuracy: subject.total > 0 ? Math.round((subject.correct / subject.total) * 100) : 0,
      total: subject.total,
    }))
    .sort((a, b) => b.pct - a.pct);

  const topChapters = Object.values(chapterMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const radarLabels = topChapters.map((chapter) => chapter.topic);
  const radarYou = topChapters.map((chapter) => chapter.total > 0 ? Math.round((chapter.correct / chapter.total) * 100) : 0);
  const radarTopper = topChapters.map(() => 85);

  const performanceTrend = [
    ...attempts.map((attempt, index) => {
      const totalMarks = Number(attempt.total_marks);
      const totalQuestions = Number(attempt.total_questions);
      const maxMarks = Number.isFinite(totalMarks) && totalMarks > 0 ? totalMarks : Math.max(totalQuestions, 0) * 4;
      return {
        date: attempt.created_at,
        label: `Test ${index + 1}`,
        score: maxMarks > 0 ? Math.max(0, Math.round(((attempt.score || 0) / maxMarks) * 100)) : 0,
      };
    }),
    ...groupPyqTrend(pyqAttempts),
  ]
    .sort((a, b) => String(a.date || a.label).localeCompare(String(b.date || b.label)))
    .map(({ label, score }) => ({ label, score }));

  const heatmapValues = [];
  const now = new Date();
  for (let week = 7; week >= 0; week -= 1) {
    for (let day = 0; day < 7; day += 1) {
      const target = new Date(now);
      target.setDate(target.getDate() - (week * 7 + (6 - day)));
      const dateStr = target.toISOString().split("T")[0];

      const testsOnDay = attempts.filter((attempt) => {
        const createdAt = attempt.created_at ? new Date(attempt.created_at).toISOString().split("T")[0] : "";
        return createdAt === dateStr;
      }).length;

      const questionAttemptsOnDay = combinedQuestionAttempts.filter((attempt) => {
        const createdAt = attempt.created_at ? new Date(attempt.created_at).toISOString().split("T")[0] : "";
        return createdAt === dateStr;
      }).length;

      const activity = testsOnDay + Math.floor(questionAttemptsOnDay / 5);
      heatmapValues.push(activity >= 3 ? 3 : activity >= 2 ? 2 : activity >= 1 ? 1 : 0);
    }
  }

  const chaptersAttempted = Object.keys(chapterMap).length;
  const conceptCoverage = Math.min(Math.round((chaptersAttempted / Math.max(chaptersAttempted, 30)) * 100), 100);

  const pyqAccuracy = totalAttemptedFromPyq > 0 ? Math.round((totalCorrectFromPyq / totalAttemptedFromPyq) * 100) : 0;
  const attemptsWithTime = attempts.filter((attempt) => attempt.time_taken_seconds && attempt.total_questions);
  let speedScore = 69;

  if (attemptsWithTime.length > 0) {
    const avgTimePerQuestion = attemptsWithTime.reduce(
      (sum, attempt) => sum + (attempt.time_taken_seconds / attempt.total_questions),
      0
    ) / attemptsWithTime.length;
    speedScore = Math.min(100, Math.round((120 / Math.max(avgTimePerQuestion, 30)) * 75));
  }

  const mockTestScore = totalMarksFromTests > 0 ? Math.max(0, Math.round((totalScoreFromTests / totalMarksFromTests) * 100)) : 0;

  const readinessBreakdown = [
    { label: "Concept coverage", pct: conceptCoverage, color: "#1D9E75" },
    { label: "PYQ accuracy", pct: pyqAccuracy, color: "#378ADD" },
    { label: "Speed (q/min)", pct: speedScore, color: "#BA7517" },
    { label: "Mock test score", pct: mockTestScore, color: "#D4537E" },
  ];

  const overallReadiness = Math.round(
    readinessBreakdown.reduce((sum, item) => sum + item.pct, 0) / readinessBreakdown.length
  );

  const pyqInsights = weakTopics.slice(0, 4).map((topic) => ({
    topic: topic.topic,
    note: `${topic.total} attempted across tests and PYQs in ${topic.subject || "mixed subjects"}`,
    accuracy: topic.accuracy,
    status: topic.accuracy < 50 ? "weak" : topic.accuracy < 70 ? "avg" : "strong",
  }));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayHours = [0, 0, 0, 0, 0, 0, 0];

  attempts.forEach((attempt) => {
    if (!attempt.time_taken_seconds) return;
    const dayIndex = new Date(attempt.created_at).getDay();
    dayHours[dayIndex] += attempt.time_taken_seconds / 3600;
  });

  const timeByDayOrdered = [...dayNames.map((day, index) => ({
    day,
    hours: Math.round(dayHours[index] * 10) / 10,
  })).slice(1), ...dayNames.map((day, index) => ({
    day,
    hours: Math.round(dayHours[index] * 10) / 10,
  })).slice(0, 1)];

  const topicWeakness = weakTopics.slice(0, 6).map((topic) => ({
    topic: topic.topic,
    accuracy: topic.accuracy,
    severity: topic.severity,
  }));

  const streak = calculateStudyStreak([
    ...allTestAttempts.map((attempt) => attempt.created_at),
    ...allPyqAttempts.map((attempt) => attempt.attempted_at || attempt.created_at),
  ]);

  return {
    totalTests: totalActivities,
    totalActivities,
    testsCompleted: totalMockTests,
    pyqSolved: totalPyqSolved,
    averageScore,
    accuracy,
    performanceTrend,
    weakTopics,
    subjectDistribution,
    radarLabels,
    radarYou,
    radarTopper,
    heatmapValues,
    readinessBreakdown,
    overallReadiness,
    pyqInsights,
    timeByDay: timeByDayOrdered,
    topicWeakness,
    totalQuestionsAnswered,
    chaptersAttempted,
    streak,
  };
}
