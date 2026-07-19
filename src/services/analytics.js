import { supabase } from "@/lib/supabase";

export async function getUserAnalytics(userId) {

  /* =========================
     TEST ATTEMPTS ANALYTICS
  ========================= */

  const { data: attempts, error } = await supabase
    .from("test_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const totalTests = attempts.length;

  const totalScore = attempts.reduce(
    (sum, test) => sum + (test.score || 0), 0
  );

  const totalMarks = attempts.reduce(
    (sum, test) => {
      const marks = test.total_marks || ((test.total_questions || 0) * 4);
      return sum + marks;
    }, 0
  );

  const averageScore = totalMarks > 0
    ? Math.round((totalScore / totalMarks) * 100)
    : 0;

  const totalCorrect = attempts.reduce(
    (sum, test) => sum + (test.correct_answers || 0), 0
  );

  const totalAttempted = attempts.reduce(
    (sum, test) => sum + (test.attempted || 0), 0
  );

  const accuracy = totalAttempted > 0
    ? Math.round((totalCorrect / totalAttempted) * 100)
    : 0;


  /* =========================
     PERFORMANCE TREND
  ========================= */

  const performanceTrend = attempts.map((test, index) => {
    let maxMarks = test.total_marks;
    if (!maxMarks) {
      maxMarks = (test.total_questions || 0) * 4;
    }
    const percentage = maxMarks > 0
      ? Math.round(((test.score || 0) / maxMarks) * 100)
      : 0;
    return { label: `Test ${index + 1}`, score: percentage };
  });


  /* =========================
     WEAK TOPICS ANALYTICS
  ========================= */

  const { data: answers, error: answerError } = await supabase
    .from("user_answers")
    .select(`
      is_correct,
      questions(
        subject,
        chapter
      )
    `)
    .eq("user_id", userId);

  if (answerError) throw answerError;

  const chapterMap = {};
  const subjectMap = {};

  answers.forEach((item) => {
    const chapter = item.questions?.chapter;
    const subject = item.questions?.subject;

    if (!chapter) return;

    // Chapter-level tracking
    if (!chapterMap[chapter]) {
      chapterMap[chapter] = { topic: chapter, subject: subject, total: 0, correct: 0 };
    }
    chapterMap[chapter].total++;
    if (item.is_correct) chapterMap[chapter].correct++;

    // Subject-level tracking
    if (subject) {
      if (!subjectMap[subject]) {
        subjectMap[subject] = { subject, total: 0, correct: 0 };
      }
      subjectMap[subject].total++;
      if (item.is_correct) subjectMap[subject].correct++;
    }
  });

  const weakTopics = Object.values(chapterMap)
    .map((chapter) => {
      const chapterAccuracy = chapter.total > 0
        ? Math.round((chapter.correct / chapter.total) * 100)
        : 0;
      return {
        topic: chapter.topic,
        subject: chapter.subject,
        accuracy: chapterAccuracy,
        total: chapter.total,
        severity: chapterAccuracy < 50 ? "critical"
          : chapterAccuracy < 70 ? "warn"
          : "good"
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);


  /* =========================
     SUBJECT DISTRIBUTION
  ========================= */

  const SUBJECT_COLORS = {
    "Physics": "#378ADD",
    "Chemistry": "#1D9E75",
    "Maths": "#BA7517",
    "Mathematics": "#BA7517",
    "Biology": "#D4537E",
    "Botany": "#2CAA6E",
    "Zoology": "#D4537E",
  };

  const totalQuestionsAnswered = answers.length;
  const subjectDistribution = Object.values(subjectMap)
    .map((s) => ({
      subject: s.subject,
      pct: totalQuestionsAnswered > 0
        ? Math.round((s.total / totalQuestionsAnswered) * 100)
        : 0,
      color: SUBJECT_COLORS[s.subject] || "#6366F1",
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      total: s.total,
    }))
    .sort((a, b) => b.pct - a.pct);


  /* =========================
     SKILL RADAR
  ========================= */

  // Pick top 5 subjects/chapters for radar
  const topChapters = Object.values(chapterMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const radarLabels = topChapters.map((c) => c.topic);
  const radarYou = topChapters.map((c) =>
    c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0
  );
  // Topper benchmark: assume 85% baseline
  const radarTopper = topChapters.map(() => 85);


  /* =========================
     STUDY HEATMAP (from test_attempts dates)
  ========================= */

  const heatmapValues = [];
  const now = new Date();
  for (let week = 7; week >= 0; week--) {
    for (let day = 0; day < 7; day++) {
      const target = new Date(now);
      target.setDate(target.getDate() - (week * 7 + (6 - day)));
      const dateStr = target.toISOString().split("T")[0];
      const testsOnDay = attempts.filter((a) => {
        const aDate = new Date(a.created_at).toISOString().split("T")[0];
        return aDate === dateStr;
      }).length;
      const answersOnDay = answers.filter((a) => {
        if (!a.created_at) return false;
        const aDate = new Date(a.created_at).toISOString().split("T")[0];
        return aDate === dateStr;
      }).length;
      const activity = testsOnDay + Math.floor(answersOnDay / 5);
      heatmapValues.push(activity >= 3 ? 3 : activity >= 2 ? 2 : activity >= 1 ? 1 : 0);
    }
  }


  /* =========================
     EXAM READINESS
  ========================= */

  // Concept coverage: how many chapters attempted out of total unique
  const chaptersAttempted = Object.keys(chapterMap).length;
  const conceptCoverage = Math.min(Math.round((chaptersAttempted / Math.max(chaptersAttempted, 30)) * 100), 100);

  // PYQ accuracy — from the user_answers
  const pyqAccuracy = accuracy;

  // Speed score — approximate from time_taken_seconds if available
  const attemptsWithTime = attempts.filter((a) => a.time_taken_seconds && a.total_questions);
  let speedScore = 69; // default
  if (attemptsWithTime.length > 0) {
    const avgTimePerQ = attemptsWithTime.reduce((sum, a) => sum + (a.time_taken_seconds / a.total_questions), 0) / attemptsWithTime.length;
    // Ideal time: 2 min per Q = 120s. If faster, higher score
    speedScore = Math.min(100, Math.round((120 / Math.max(avgTimePerQ, 30)) * 75));
  }

  const mockTestScore = averageScore;

  const readinessBreakdown = [
    { label: "Concept coverage", pct: conceptCoverage, color: "#1D9E75" },
    { label: "PYQ accuracy", pct: pyqAccuracy, color: "#378ADD" },
    { label: "Speed (q/min)", pct: speedScore, color: "#BA7517" },
    { label: "Mock test score", pct: mockTestScore, color: "#D4537E" },
  ];

  const overallReadiness = Math.round(
    readinessBreakdown.reduce((sum, r) => sum + r.pct, 0) / readinessBreakdown.length
  );


  /* =========================
     PYQ INTELLIGENCE
  ========================= */

  const pyqInsights = weakTopics.slice(0, 4).map((t) => ({
    topic: t.topic,
    note: `${t.total} questions attempted in ${t.subject}`,
    accuracy: t.accuracy,
    status: t.accuracy < 50 ? "weak" : t.accuracy < 70 ? "avg" : "strong",
  }));


  /* =========================
     TIME ANALYTICS (from test_attempts)
  ========================= */

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayHours = [0, 0, 0, 0, 0, 0, 0];
  attempts.forEach((a) => {
    if (a.time_taken_seconds) {
      const dayIdx = new Date(a.created_at).getDay();
      dayHours[dayIdx] += a.time_taken_seconds / 3600;
    }
  });
  const timeByDay = dayNames.map((day, idx) => ({
    day,
    hours: Math.round(dayHours[idx] * 10) / 10,
  }));
  // Reorder to start from Mon
  const timeByDayOrdered = [...timeByDay.slice(1), timeByDay[0]];


  /* =========================
     TOPIC WEAKNESS (for chart)
  ========================= */

  const topicWeakness = weakTopics.slice(0, 6).map((t) => ({
    topic: t.topic,
    accuracy: t.accuracy,
    severity: t.severity,
  }));


  console.log("ANALYTICS DATA 👉", {
    totalTests, averageScore, accuracy, performanceTrend, weakTopics
  });


  return {
    totalTests,
    averageScore,
    accuracy,
    performanceTrend,
    weakTopics,

    // NEW live data
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
  };
}