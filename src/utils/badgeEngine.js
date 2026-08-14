import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { addXP } from "@/utils/xp";

async function getUserXPWithAdmin(userId) {
  const { data, error } = await supabase
    .from("user_xp")
    .select("xp, streak, name")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.log("Profile XP error:", error);
    return null;
  }

  return data;
}

async function getUserRankWithAdmin(userId) {
  const { data: userData, error: userError } = await supabase
    .from("user_xp")
    .select("xp, updated_at")
    .eq("user_id", userId)
    .single();

  if (userError || !userData) {
    console.log("Rank error:", userError);
    return null;
  }

  const rankFilter = userData.updated_at
    ? `xp.gt.${userData.xp},and(xp.eq.${userData.xp},updated_at.lt.${userData.updated_at})`
    : `xp.gt.${userData.xp}`;
  const { count, error } = await supabase
    .from("user_xp")
    .select("id", { count: "exact", head: true })
    .or(rankFilter);

  if (error) {
    console.log("Rank error:", error);
    return null;
  }

  return { rank: (count || 0) + 1 };
}

async function getProfileAnalyticsWithAdmin(userId, stream = "JEE") {
  if (!userId) return null;

  try {
    const { data: pyqAttemptsRaw, error: pyqError } = await supabase
      .from("pyq_attempts")
      .select("is_correct, pyq_questions(exam)")
      .eq("user_id", userId);

    if (pyqError) throw pyqError;

    const pyqAttempts = (pyqAttemptsRaw || []).filter((attempt) => {
      const exam = attempt.pyq_questions?.exam;
      if (!exam) return false;
      const trackUpper = stream.toUpperCase();
      return exam.toUpperCase().includes(trackUpper === "JEE" ? "JEE" : "NEET");
    });

    const { data: testAttemptsRaw, error: testError } = await supabase
      .from("test_attempts")
      .select("attempted, correct_answers, correct, time_taken_seconds, accuracy, score, tests(exam), user_answers(questions(exam))")
      .eq("user_id", userId);

    if (testError) throw testError;

    const testAttempts = (testAttemptsRaw || []).filter((attempt) => {
      let attemptExam = null;

      if (attempt.tests?.exam) {
        attemptExam = attempt.tests.exam;
      } else if (attempt.user_answers && attempt.user_answers.length > 0) {
        const firstAnswer = attempt.user_answers.find((answer) => answer.questions?.exam);
        if (firstAnswer) {
          attemptExam = firstAnswer.questions.exam;
        }
      }

      if (!attemptExam) return false;
      const trackUpper = stream.toUpperCase();
      return attemptExam.toUpperCase().includes(trackUpper === "JEE" ? "JEE" : "NEET");
    });

    const pyqTotal = pyqAttempts.length;
    const pyqCorrect = pyqAttempts.filter((attempt) => attempt.is_correct).length;

    const testsCompleted = testAttempts.length;
    let testTotalQs = 0;
    let testCorrectQs = 0;
    let totalTimeSecs = 0;
    let bestMockScore = 0;

    testAttempts.forEach((attempt) => {
      testTotalQs += attempt.attempted || 0;
      testCorrectQs += attempt.correct_answers || attempt.correct || 0;
      totalTimeSecs += attempt.time_taken_seconds || 0;
      const score = attempt.accuracy || attempt.score || 0;
      if (score > bestMockScore) {
        bestMockScore = score;
      }
    });

    const totalQuestionsAttempted = pyqTotal + testTotalQs;
    const totalCorrect = pyqCorrect + testCorrectQs;
    const accuracy =
      totalQuestionsAttempted > 0
        ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
        : 0;
    const avgSolveSeconds =
      testTotalQs > 0
        ? Math.round(totalTimeSecs / testTotalQs)
        : null;

    return {
      testsCompleted,
      totalQuestionsAttempted,
      totalCorrect,
      accuracy,
      avgSolveSeconds,
      bestMockScore,
      pyqSolved: pyqTotal,
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
      pyqSolved: 0,
    };
  }
}

export async function evaluateUserBadges(userId) {
  if (!userId) return;

  try {
    // 1. Fetch all enabled badges
    const { data: badges, error: badgesError } = await supabase
      .from("badges")
      .select("id, requirement_type, requirement_value, xp_reward")
      .eq("enabled", true);

    if (badgesError || !badges?.length) return;

    // 2. Fetch user's currently earned badges
    const { data: earnedBadges, error: earnedError } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    if (earnedError) throw earnedError;

    const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);

    // 3. Fetch user stats
    const [analytics, xpData, rankData] = await Promise.all([
      getProfileAnalyticsWithAdmin(userId),
      getUserXPWithAdmin(userId),
      getUserRankWithAdmin(userId),
    ]);

    // 4. Map stats to requirement types
    const stats = {
      tests_completed: analytics?.testsCompleted || 0,
      pyq_completed: analytics?.pyqSolved || 0,
      total_questions: analytics?.totalQuestionsAttempted || 0,
      total_xp: xpData?.xp || 0,
      streak: xpData?.streak || 0,
      accuracy: analytics?.accuracy || 0,
      leaderboard_rank: rankData?.rank || Infinity,
      mock_test_ace: analytics?.bestMockScore || 0, // Using this for high mock score
      speed_solver: analytics?.avgSolveSeconds || Infinity,
    };

    // 5. Evaluate unearned badges
    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let requirementMet = false;
      const type = badge.requirement_type;
      const val = badge.requirement_value;

      switch (type) {
        case 'tests_completed':
          requirementMet = stats.tests_completed >= val;
          break;
        case 'pyq_completed':
          requirementMet = stats.pyq_completed >= val;
          break;
        case 'total_questions':
          requirementMet = stats.total_questions >= val;
          break;
        case 'total_xp':
          requirementMet = stats.total_xp >= val;
          break;
        case 'streak':
          requirementMet = stats.streak >= val;
          break;
        case 'accuracy':
          requirementMet = stats.accuracy >= val;
          break;
        case 'leaderboard_rank':
          // Rank lower is better. e.g. Rank 10 is <= Top 100.
          requirementMet = stats.leaderboard_rank <= val;
          break;
        case 'mock_tests':
          requirementMet = stats.mock_test_ace >= val;
          break;
        case 'speed_solver':
          // Lower time is better, but must not be Infinity
          requirementMet = stats.speed_solver !== Infinity && stats.speed_solver <= val;
          break;
        default:
          requirementMet = false;
      }

      // Award badge if met
      if (requirementMet) {
        const { error: insertError } = await supabase
          .from("user_badges")
          .insert({
            user_id: userId,
            badge_id: badge.id
          });

        if (!insertError) {
          earnedBadgeIds.add(badge.id);
          // Award XP
          if (badge.xp_reward > 0) {
            await addXP(userId, badge.xp_reward, xpData?.name || "Student", true);
          }
        }
      }
    }
  } catch (error) {
    console.error("Badge Evaluation Error:", error);
  }
}

export async function getUserBadgeProgress(userId) {
  if (!userId) return [];
  
  // 1. Evaluate first to ensure anything new is awarded
  await evaluateUserBadges(userId);
  
  // 2. Fetch all enabled badges
  const { data: badges } = await supabase
    .from("badges")
    .select("id, name, description, icon, color, requirement_type, requirement_value, xp_reward")
    .eq("enabled", true)
    .order("display_order", { ascending: true });
    
  if (!badges || !badges.length) return [];
  
  // 3. Fetch earned badges
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", userId);
    
  const earnedMap = new Map(earnedBadges?.map(b => [b.badge_id, b]) || []);
  
  // 4. Fetch user stats
  const [analytics, xpData, rankData] = await Promise.all([
    getProfileAnalyticsWithAdmin(userId),
    getUserXPWithAdmin(userId),
    getUserRankWithAdmin(userId),
  ]);
  
  const stats = {
    tests_completed: analytics?.testsCompleted || 0,
    pyq_completed: analytics?.pyqSolved || 0,
    total_questions: analytics?.totalQuestionsAttempted || 0,
    total_xp: xpData?.xp || 0,
    streak: xpData?.streak || 0,
    accuracy: analytics?.accuracy || 0,
    leaderboard_rank: rankData?.rank || Infinity,
    mock_tests: analytics?.bestMockScore || 0,
    speed_solver: analytics?.avgSolveSeconds || Infinity,
  };
  
  // 5. Build UI array
  return badges.map(badge => {
    const isEarned = earnedMap.has(badge.id);
    const type = badge.requirement_type;
    const val = badge.requirement_value;
    const currentVal = stats[type] || 0;
    
    let detailText = "";
    
    if (type === 'tests_completed') detailText = `${currentVal}/${val} tests`;
    else if (type === 'pyq_completed') detailText = `${currentVal}/${val} PYQs`;
    else if (type === 'total_questions') detailText = `${currentVal}/${val} Qs`;
    else if (type === 'total_xp') detailText = `${currentVal}/${val} XP`;
    else if (type === 'streak') detailText = `${currentVal}/${val} days`;
    else if (type === 'accuracy') detailText = `${currentVal}%/${val}%`;
    else if (type === 'leaderboard_rank') detailText = `Rank #${currentVal}`;
    else if (type === 'mock_tests') detailText = `${currentVal}%/${val}%`;
    else if (type === 'speed_solver') {
      detailText = currentVal === Infinity ? `No data yet` : `${currentVal}s avg`;
    }
    
    // If earned, we can show maxed out
    if (isEarned) {
      if (type === 'tests_completed') detailText = `${val}/${val} tests`;
      if (type === 'pyq_completed') detailText = `${val}/${val} PYQs`;
      if (type === 'streak') detailText = `${val}/${val} days`;
    }
    
    return {
      id: badge.id,
      title: badge.name,
      description: badge.description,
      iconName: badge.icon,
      color: badge.color,
      earned: isEarned,
      detail: detailText,
      xp_reward: badge.xp_reward
    };
  });
}
