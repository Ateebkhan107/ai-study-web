import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { getProfileAnalytics, getUserXP } from "@/utils/profile";
import { getUserRank } from "@/utils/leaderboard";
import { addXP } from "@/utils/xp";

export async function evaluateUserBadges(userId) {
  if (!userId) return;

  try {
    // 1. Fetch all enabled badges
    const { data: badges, error: badgesError } = await supabase
      .from("badges")
      .select("*")
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
    const analytics = await getProfileAnalytics(userId);
    const xpData = await getUserXP(userId);
    const rankData = await getUserRank(userId);

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
    .select("*")
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
  const analytics = await getProfileAnalytics(userId);
  const xpData = await getUserXP(userId);
  const rankData = await getUserRank(userId);
  
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
