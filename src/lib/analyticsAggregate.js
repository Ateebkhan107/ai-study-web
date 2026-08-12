import { examMatchesTrack, normalizeTrack } from "./analyticsHelpers.js";

const MIN_CHAPTER_ATTEMPTS = 3;
const RECENT_TREND_LIMIT = 8;
const WEAK_CHAPTER_LIMIT = 6;
const HEATMAP_DAYS = 56;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const UNMAPPED_CHAPTERS = new Set(["unmapped", "unknown", "invalid", "n/a", "na", "none", "null", "-"]);
const SUBJECT_COLORS = {
  physics: "#6366F1",
  chemistry: "#10B981",
  mathematics: "#F59E0B",
  maths: "#F59E0B",
  biology: "#EC4899",
};

function percent(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}

function cleanText(value) {
  return String(value || "").trim();
}

function isValidChapter(value) {
  const chapter = cleanText(value);
  return Boolean(chapter) && !UNMAPPED_CHAPTERS.has(chapter.toLowerCase());
}

function getAttemptExam(attempt) {
  if (attempt?.tests?.exam) return attempt.tests.exam;
  const answerWithExam = attempt?.user_answers?.find((answer) => answer?.questions?.exam);
  return answerWithExam?.questions?.exam || null;
}

function getCompletedTestMaxMarks(attempt) {
  const totalMarks = Number(attempt.total_marks);
  if (Number.isFinite(totalMarks) && totalMarks > 0) return totalMarks;

  const totalQuestions = Number(attempt.total_questions);
  return Number.isFinite(totalQuestions) && totalQuestions > 0 ? totalQuestions * 4 : 0;
}

function getTestScorePercent(attempt) {
  return percent(Number(attempt.score) || 0, getCompletedTestMaxMarks(attempt));
}

function getChapterStatus(accuracy) {
  if (accuracy <= 49) {
    return {
      key: "critical",
      label: "Critical",
      className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
    };
  }

  if (accuracy <= 64) {
    return {
      key: "needs_work",
      label: "Needs Work",
      className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
    };
  }

  if (accuracy <= 79) {
    return {
      key: "improving",
      label: "Improving",
      className: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-300",
    };
  }

  return {
    key: "strong",
    label: "Strong",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  };
}

function buildChapterKey(subject, chapter) {
  return `${cleanText(subject).toLowerCase()}::${cleanText(chapter).toLowerCase()}`;
}

function normalizeSubject(subject) {
  const value = cleanText(subject);
  if (!value) return "General";
  if (value.toLowerCase() === "maths") return "Mathematics";
  return value;
}

function getSubjectColor(subject) {
  return SUBJECT_COLORS[cleanText(subject).toLowerCase()] || "#8B5CF6";
}

function buildTrendPoint(attempt, index) {
  const scorePercent = getTestScorePercent(attempt);
  if (scorePercent === null) return null;

  return {
    label: `Test ${index + 1}`,
    date: attempt.created_at,
    accuracy: scorePercent,
    type: "Mock Test",
  };
}

function buildPyqTrend(pyqAttempts) {
  const grouped = new Map();

  for (const attempt of pyqAttempts) {
    const dateValue = attempt.attempted_at;
    if (!dateValue) continue;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) continue;

    const bucket = date.toISOString().slice(0, 10);
    if (!grouped.has(bucket)) {
      grouped.set(bucket, {
        date: bucket,
        label: bucket.slice(5),
        correct: 0,
        attempted: 0,
        type: "PYQ Practice",
      });
    }

    const entry = grouped.get(bucket);
    entry.attempted += 1;
    if (attempt.is_correct) entry.correct += 1;
  }

  return [...grouped.values()]
    .filter((entry) => entry.attempted > 0)
    .map((entry) => ({ ...entry, accuracy: percent(entry.correct, entry.attempted) }))
    .filter((entry) => entry.accuracy !== null);
}

function aggregateReadiness({ pyqAccuracy, speedScore, mockTestScore }) {
  const components = [
    { key: "pyqAccuracy", label: "PYQ Accuracy", value: pyqAccuracy, color: "#378ADD", source: "pyq_attempts.is_correct" },
    { key: "speed", label: "Speed", value: speedScore, color: "#BA7517", source: "test_attempts.time_taken_seconds / attempted" },
    { key: "mockScore", label: "Mock Test Score", value: mockTestScore, color: "#D4537E", source: "test_attempts.score / total_marks" },
  ];
  const available = components.filter((item) => item.value !== null);

  return {
    status: available.length === 0 ? "insufficient_data" : "ready",
    overall: available.length > 0 ? Math.round(available.reduce((sum, item) => sum + item.value, 0) / available.length) : null,
    components,
    availableCount: available.length,
  };
}

function buildSpeedAnalytics(testAttempts) {
  const timed = testAttempts
    .map((attempt) => {
      const seconds = Number(attempt.time_taken_seconds);
      const answered = Number(attempt.attempted);
      if (!Number.isFinite(seconds) || seconds <= 0 || !Number.isFinite(answered) || answered <= 0) return null;

      const secondsPerQuestion = seconds / answered;
      return {
        date: attempt.created_at,
        seconds,
        answered,
        secondsPerQuestion,
        questionsPerMinute: answered / (seconds / 60),
      };
    })
    .filter(Boolean);

  if (timed.length === 0) {
    return { status: "insufficient_data", averageSecondsPerQuestion: null, questionsPerMinute: null, recent: [] };
  }

  const totalSeconds = timed.reduce((sum, item) => sum + item.seconds, 0);
  const totalAnswered = timed.reduce((sum, item) => sum + item.answered, 0);

  return {
    status: "ready",
    averageSecondsPerQuestion: Number((totalSeconds / totalAnswered).toFixed(1)),
    questionsPerMinute: Number((totalAnswered / (totalSeconds / 60)).toFixed(2)),
    recent: timed.slice(-RECENT_TREND_LIMIT).map((item, index) => ({
      label: `Test ${index + 1}`,
      secondsPerQuestion: Math.round(item.secondsPerQuestion),
      questionsPerMinute: Number(item.questionsPerMinute.toFixed(2)),
    })),
  };
}

function buildHeatmap(answeredQuestions, testAttempts, nowMs) {
  const end = new Date(nowMs);
  end.setHours(0, 0, 0, 0);
  const startMs = end.getTime() - (HEATMAP_DAYS - 1) * ONE_DAY_MS;
  const activityByDate = new Map();

  for (let index = 0; index < HEATMAP_DAYS; index += 1) {
    const day = new Date(startMs + index * ONE_DAY_MS).toISOString().slice(0, 10);
    activityByDate.set(day, { date: day, questions: 0, tests: 0, total: 0, intensity: 0 });
  }

  for (const question of answeredQuestions) {
    const timestamp = new Date(question.date).getTime();
    if (!Number.isFinite(timestamp) || timestamp < startMs || timestamp > end.getTime() + ONE_DAY_MS) continue;
    const day = new Date(timestamp);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().slice(0, 10);
    const entry = activityByDate.get(key);
    if (!entry) continue;
    entry.questions += 1;
    entry.total += 1;
  }

  for (const attempt of testAttempts) {
    const timestamp = new Date(attempt.created_at).getTime();
    if (!Number.isFinite(timestamp) || timestamp < startMs || timestamp > end.getTime() + ONE_DAY_MS) continue;
    const day = new Date(timestamp);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().slice(0, 10);
    const entry = activityByDate.get(key);
    if (!entry) continue;
    entry.tests += 1;
    entry.total += 1;
  }

  const maxActivity = Math.max(...[...activityByDate.values()].map((entry) => entry.total), 0);

  return [...activityByDate.values()].map((entry) => {
    let intensity = 0;
    if (entry.total > 0 && maxActivity > 0) {
      intensity = Math.max(1, Math.min(3, Math.ceil((entry.total / maxActivity) * 3)));
    }
    return { ...entry, intensity };
  });
}

function buildSubjectAnalytics(answeredQuestions) {
  const subjectMap = new Map();

  for (const question of answeredQuestions) {
    const subject = normalizeSubject(question.subject);
    if (!subject) continue;

    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, { subject, attempted: 0, correct: 0, color: getSubjectColor(subject) });
    }

    const entry = subjectMap.get(subject);
    entry.attempted += 1;
    if (question.isCorrect) entry.correct += 1;
  }

  const totalAttempted = [...subjectMap.values()].reduce((sum, item) => sum + item.attempted, 0);

  return [...subjectMap.values()]
    .map((entry) => ({
      ...entry,
      pct: percent(entry.attempted, totalAttempted),
      accuracy: percent(entry.correct, entry.attempted),
    }))
    .sort((a, b) => b.attempted - a.attempted);
}

function getNextAction({ weakChapters, testsCompleted, questionsPracticed }) {
  const weakest = weakChapters[0];

  if (weakest) {
    return {
      title: `Improve ${weakest.chapter}`,
      description: `${weakest.accuracy}% accuracy across ${weakest.attempted} answered questions.`,
      href: `/pyq?subject=${encodeURIComponent(weakest.subject || "")}&chapter=${encodeURIComponent(weakest.chapter)}`,
      cta: "Practice PYQs",
      reason: "weak_chapter",
    };
  }

  if (testsCompleted === 0) {
    return {
      title: "Take your first test",
      description: "Complete a test to start building your performance profile.",
      href: "/test",
      cta: "Start Test",
      reason: "no_tests",
    };
  }

  if (questionsPracticed === 0) {
    return {
      title: "Practice PYQs",
      description: "Answer PYQs so PrepZii can identify chapter-level strengths and weaknesses.",
      href: "/pyq",
      cta: "Practice PYQs",
      reason: "no_practice",
    };
  }

  return {
    title: "Build a focused test",
    description: "Keep practicing to reveal stronger chapter-level recommendations.",
    href: "/test",
    cta: "Build a Test",
    reason: "keep_practicing",
  };
}

export function aggregateAnalytics({
  track = "JEE",
  testAttemptsRaw = [],
  pyqAttemptsRaw = [],
  nowMs = Date.now(),
} = {}) {
  const normalizedTrack = normalizeTrack(track);
  const testAttempts = (testAttemptsRaw || []).filter((attempt) => examMatchesTrack(getAttemptExam(attempt), normalizedTrack));
  const pyqAttempts = (pyqAttemptsRaw || []).filter((attempt) => examMatchesTrack(attempt.pyq_questions?.exam, normalizedTrack));

  const answeredTestQuestions = testAttempts.flatMap((attempt) =>
    (attempt.user_answers || [])
      .filter((answer) => answer?.selected_option !== null && answer?.selected_option !== undefined && String(answer.selected_option).trim() !== "")
      .map((answer) => ({
        source: "test",
        date: answer.created_at || attempt.created_at,
        subject: answer.questions?.subject,
        chapter: answer.questions?.chapter,
        isCorrect: Boolean(answer.is_correct),
      }))
  );

  const answeredPyqQuestions = pyqAttempts
    .filter((attempt) => attempt.selected_option !== null && attempt.selected_option !== undefined && String(attempt.selected_option).trim() !== "")
    .map((attempt) => ({
      source: "pyq",
      date: attempt.attempted_at,
      subject: attempt.pyq_questions?.subject,
      chapter: attempt.pyq_questions?.chapter,
      isCorrect: Boolean(attempt.is_correct),
    }));

  const answeredQuestions = [...answeredTestQuestions, ...answeredPyqQuestions];
  const questionsPracticed = answeredQuestions.length;
  const correctAnswered = answeredQuestions.filter((question) => question.isCorrect).length;
  const overallAccuracy = percent(correctAnswered, questionsPracticed);
  const questionsPracticedThisWeek = answeredQuestions.filter((question) => {
    const timestamp = new Date(question.date).getTime();
    return Number.isFinite(timestamp) && nowMs - timestamp <= ONE_WEEK_MS;
  }).length;

  const completedTests = testAttempts.length;
  const testScorePercents = testAttempts.map(getTestScorePercent).filter((value) => value !== null);
  const averageScore = testScorePercents.length > 0
    ? Math.round(testScorePercents.reduce((sum, value) => sum + value, 0) / testScorePercents.length)
    : null;

  const pyqCorrect = answeredPyqQuestions.filter((question) => question.isCorrect).length;
  const pyqAccuracy = percent(pyqCorrect, answeredPyqQuestions.length);

  const timedTests = testAttempts.filter((attempt) => {
    const timeTaken = Number(attempt.time_taken_seconds);
    const attempted = Number(attempt.attempted);
    return Number.isFinite(timeTaken) && timeTaken > 0 && Number.isFinite(attempted) && attempted > 0;
  });
  const averageSecondsPerQuestion = timedTests.length > 0
    ? timedTests.reduce((sum, attempt) => sum + (Number(attempt.time_taken_seconds) / Number(attempt.attempted)), 0) / timedTests.length
    : null;
  const speedScore = averageSecondsPerQuestion !== null
    ? Math.max(0, Math.min(100, Math.round((120 / Math.max(averageSecondsPerQuestion, 30)) * 100)))
    : null;

  const totalTestScore = testAttempts.reduce((sum, attempt) => sum + (Number(attempt.score) || 0), 0);
  const totalTestMarks = testAttempts.reduce((sum, attempt) => sum + getCompletedTestMaxMarks(attempt), 0);
  const mockTestScore = percent(totalTestScore, totalTestMarks);

  const chapterMap = new Map();
  for (const question of answeredQuestions) {
    if (!isValidChapter(question.chapter)) continue;
    const chapter = cleanText(question.chapter);
    const subject = cleanText(question.subject) || "General";
    const key = buildChapterKey(subject, chapter);

    if (!chapterMap.has(key)) {
      chapterMap.set(key, { chapter, subject, attempted: 0, correct: 0, incorrect: 0 });
    }

    const entry = chapterMap.get(key);
    entry.attempted += 1;
    if (question.isCorrect) entry.correct += 1;
    else entry.incorrect += 1;
  }

  const chapterPerformance = [...chapterMap.values()]
    .map((chapter) => {
      const accuracy = percent(chapter.correct, chapter.attempted);
      const status = getChapterStatus(accuracy);
      return {
        ...chapter,
        accuracy,
        status: status.key,
        statusLabel: status.label,
        statusClassName: status.className,
        hasMinimumSample: chapter.attempted >= MIN_CHAPTER_ATTEMPTS,
      };
    })
    .sort((a, b) => {
      if (a.hasMinimumSample !== b.hasMinimumSample) return a.hasMinimumSample ? -1 : 1;
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.attempted - a.attempted;
    });

  const weakChapters = chapterPerformance
    .filter((chapter) => chapter.hasMinimumSample && chapter.status !== "strong")
    .slice(0, WEAK_CHAPTER_LIMIT);

  const subjectAnalytics = buildSubjectAnalytics(answeredQuestions);

  const recentTrend = [...testAttempts.map(buildTrendPoint).filter(Boolean), ...buildPyqTrend(pyqAttempts)]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-RECENT_TREND_LIMIT)
    .map((item, index) => ({ ...item, label: item.type === "Mock Test" ? `Test ${index + 1}` : item.label }));

  return {
    track: normalizedTrack,
    config: { minimumChapterAttempts: MIN_CHAPTER_ATTEMPTS },
    overview: {
      questionsPracticed,
      questionsPracticedThisWeek,
      overallAccuracy,
      testsCompleted: completedTests,
      averageScore,
    },
    counts: {
      answeredQuestions: questionsPracticed,
      correctAnswered,
      answeredTestQuestions: answeredTestQuestions.length,
      answeredPyqQuestions: answeredPyqQuestions.length,
      completedTests,
    },
    examReadiness: aggregateReadiness({ pyqAccuracy, speedScore, mockTestScore }),
    performanceTrend: {
      status: recentTrend.length >= 2 ? "ready" : "insufficient_data",
      points: recentTrend,
    },
    heatmap: {
      status: questionsPracticed > 0 || completedTests > 0 ? "ready" : "insufficient_data",
      days: buildHeatmap(answeredQuestions, testAttempts, nowMs),
    },
    subjectDistribution: {
      status: subjectAnalytics.length > 0 ? "ready" : "insufficient_data",
      items: subjectAnalytics.map(({ subject, attempted, pct, color }) => ({ subject, attempted, pct, color })),
    },
    subjectPerformance: {
      status: subjectAnalytics.some((item) => item.accuracy !== null) ? "ready" : "insufficient_data",
      items: subjectAnalytics.map(({ subject, attempted, correct, accuracy, color }) => ({ subject, attempted, correct, accuracy, color })),
    },
    chapterPerformance: {
      status: chapterPerformance.some((chapter) => chapter.hasMinimumSample) ? "ready" : "insufficient_data",
      weakest: chapterPerformance.filter((chapter) => chapter.hasMinimumSample).slice(0, WEAK_CHAPTER_LIMIT),
      strongest: chapterPerformance
        .filter((chapter) => chapter.hasMinimumSample && chapter.status === "strong")
        .sort((a, b) => b.accuracy - a.accuracy || b.attempted - a.attempted)
        .slice(0, 3),
    },
    weakChapters: {
      status: weakChapters.length > 0 ? "ready" : "insufficient_data",
      items: weakChapters,
      allCount: chapterPerformance.filter((chapter) => chapter.hasMinimumSample).length,
    },
    timeAnalytics: buildSpeedAnalytics(testAttempts),
    nextAction: getNextAction({ weakChapters, testsCompleted: completedTests, questionsPracticed }),
  };
}
