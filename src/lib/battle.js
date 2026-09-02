import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeUsername } from "@/lib/username";

export const BATTLE_QUESTION_COUNT = 10;
export const BATTLE_EXPIRES_MINUTES = 10;

export const SAFE_BATTLE_QUESTION_SELECT = `
  id,
  exam,
  subject,
  chapter,
  question_text,
  options,
  difficulty,
  expected_time_seconds
`;

const SCORING_QUESTION_SELECT = `
  id,
  correct_answer
`;

const REVIEW_QUESTION_SELECT = `
  ${SAFE_BATTLE_QUESTION_SELECT},
  correct_answer,
  explanation
`;

// ==========================================
// RATING & ELO CALCULATIONS
// ==========================================

export const ARENA_TIERS = [
  { name: "Bronze", key: "bronze", color: "#CD7F32", min: 0, max: 1099, icon: "🛡️" },
  { name: "Silver", key: "silver", color: "#C0C0C0", min: 1100, max: 1299, icon: "⚔️" },
  { name: "Gold", key: "gold", color: "#EAB308", min: 1300, max: 1499, icon: "👑" },
  { name: "Platinum", key: "platinum", color: "#00CED1", min: 1500, max: 1699, icon: "💎" },
  { name: "Diamond", key: "diamond", color: "#B9F2FF", min: 1700, max: 1899, icon: "✨" },
  { name: "Master", key: "master", color: "#A855F7", min: 1900, max: 2099, icon: "🔥" },
  { name: "Grandmaster", key: "grandmaster", color: "#F43F5E", min: 2100, max: 9999, icon: "🏆" },
];

export function getRatingTier(rating = 1000) {
  const safeRating = Math.max(0, Number(rating) || 1000);
  return (
    ARENA_TIERS.find((tier) => safeRating >= tier.min && safeRating <= tier.max) ||
    ARENA_TIERS[0]
  );
}

/**
 * Calculates Elo rating change for two players.
 * @param {number} ratingA - Player A's current rating
 * @param {number} ratingB - Player B's current rating
 * @param {number} scoreA - 1 for A win, 0.5 for draw, 0 for A loss
 * @param {number} kFactor - K-factor (default 32)
 * @returns {{ changeA: number, changeB: number, newRatingA: number, newRatingB: number }}
 */
export function calculateEloChange(ratingA = 1000, ratingB = 1000, scoreA = 1, kFactor = 32) {
  const ra = Math.max(100, Number(ratingA) || 1000);
  const rb = Math.max(100, Number(ratingB) || 1000);

  const expectedA = 1 / (1 + Math.pow(10, (rb - ra) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ra - rb) / 400));
  const scoreB = 1 - scoreA;

  let changeA = Math.round(kFactor * (scoreA - expectedA));
  let changeB = Math.round(kFactor * (scoreB - expectedB));

  // Minimum +/- 1 on definitive outcome to avoid static zero delta
  if (scoreA === 1 && changeA <= 0) changeA = 1;
  if (scoreA === 0 && changeA >= 0) changeA = -1;
  if (scoreB === 1 && changeB <= 0) changeB = 1;
  if (scoreB === 0 && changeB >= 0) changeB = -1;

  const newRatingA = Math.max(100, ra + changeA);
  const newRatingB = Math.max(100, rb + changeB);

  return { changeA, changeB, newRatingA, newRatingB };
}

// ==========================================
// SEASONS ARCHITECTURE
// ==========================================

export function getCurrentSeasonId(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getSeasonName(seasonId) {
  if (!seasonId) return "Arena Season";
  const [yearStr, monthStr] = seasonId.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const mIndex = parseInt(monthStr, 10) - 1;
  const monthName = monthNames[mIndex] || monthStr;
  return `${monthName} ${yearStr} Season`;
}

export async function ensureSeason(seasonId = getCurrentSeasonId()) {
  const [yearStr, monthStr] = seasonId.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  const startedAt = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).toISOString();
  const endsAt = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
  const name = getSeasonName(seasonId);

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("battle_seasons")
    .select("id, name, is_active")
    .eq("id", seasonId)
    .maybeSingle();

  if (checkError) {
    // If table not migrated yet, gracefully continue
    return { id: seasonId, name };
  }

  if (existing) return existing;

  const { data: created, error: insertError } = await supabaseAdmin
    .from("battle_seasons")
    .insert({
      id: seasonId,
      name,
      started_at: startedAt,
      ends_at: endsAt,
      is_active: true,
    })
    .select("id, name, is_active")
    .single();

  if (insertError) {
    console.error("[ENSURE_SEASON_INSERT_ERROR]", insertError);
    return { id: seasonId, name };
  }

  return created;
}

// ==========================================
// CORE HELPERS
// ==========================================

function isExpired(expiresAt) {
  return expiresAt && new Date(expiresAt).getTime() <= Date.now();
}

function normalizeExam(exam) {
  return String(exam || "").toUpperCase() === "NEET" ? "NEET" : "JEE";
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function orderByQuestionIds(questions, questionIds) {
  const byId = new Map((questions || []).map((question) => [String(question.id), question]));
  return questionIds.map((id) => byId.get(String(id))).filter(Boolean);
}

function mapBattleQuestionForClient(question, revealAnswers = false) {
  const options = Array.isArray(question?.options) ? question.options : [];
  const mapped = {
    id: question.id,
    exam: question.exam,
    subject: question.subject,
    chapter: question.chapter,
    difficulty: question.difficulty,
    expected_time_seconds: question.expected_time_seconds,
    question: question.question_text,
    question_text: question.question_text,
    question_image: null,
    question_type: "MCQ",
    option_a: options[0] || "",
    option_b: options[1] || "",
    option_c: options[2] || "",
    option_d: options[3] || "",
    option_a_image: null,
    option_b_image: null,
    option_c_image: null,
    option_d_image: null,
    marks_positive: 4,
    marks_negative: -1,
  };

  if (revealAnswers) {
    mapped.correct_answer = normalizeOption(question.correct_answer);
    mapped.correct_option = mapped.correct_answer;
    mapped.explanation = question.explanation || "";
    mapped.explanation_image = null;
  }

  return mapped;
}

function parseAnswer(value) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

function normalizeOption(value) {
  if (value === undefined || value === null) return "";
  const text = String(value).trim().toUpperCase();
  if (/^[0-3]$/.test(text)) return ["A", "B", "C", "D"][Number(text)];
  return text;
}

export function isAnswerCorrect(question, selectedAnswer) {
  if (!question) return false;
  const answer = parseAnswer(selectedAnswer);
  if (answer === null) return false;
  return normalizeOption(answer) === normalizeOption(question.correct_answer);
}

export async function getBattleProfile(userId) {
  const [{ data: profile, error: profileError }, { data: stats, error: statsError }] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("id, clerk_user_id, full_name, username, exam, target_year")
      .eq("clerk_user_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("battle_stats")
      .select("arena_rating, peak_rating, win_streak, best_streak, wins, losses, draws, total_battles")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (profileError) throw profileError;
  if (!profile) return null;

  const currentRating = stats?.arena_rating ?? 1000;
  const tier = getRatingTier(currentRating);

  return {
    ...profile,
    exam: normalizeExam(profile.exam),
    displayName: profile.full_name || "PrepZii Student",
    arena_rating: currentRating,
    peak_rating: stats?.peak_rating ?? currentRating,
    win_streak: stats?.win_streak ?? 0,
    best_streak: stats?.best_streak ?? 0,
    wins: stats?.wins ?? 0,
    losses: stats?.losses ?? 0,
    draws: stats?.draws ?? 0,
    total_battles: stats?.total_battles ?? 0,
    tier,
  };
}

export async function requireBattleProfile(userId) {
  const profile = await getBattleProfile(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.status = 404;
    throw error;
  }
  if (!profile.username) {
    const error = new Error("Choose a username before using Battle Arena.");
    error.status = 428;
    throw error;
  }
  return profile;
}

export async function selectBattleQuestionIds(exam) {
  const { data, error } = await supabaseAdmin
    .from("battle_questions")
    .select("id")
    .eq("exam", normalizeExam(exam))
    .eq("is_active", true)
    .limit(250);

  if (error) throw error;

  const ids = shuffle((data || []).map((question) => String(question.id))).slice(0, BATTLE_QUESTION_COUNT);
  if (ids.length < BATTLE_QUESTION_COUNT) {
    const battleError = new Error("Not enough active Battle Arena questions yet.");
    battleError.status = 503;
    throw battleError;
  }
  return ids;
}

export async function createBattleForPlayers({ exam, playerAId, playerBId }) {
  if (!playerAId || !playerBId || playerAId === playerBId) {
    const error = new Error("Battle requires two different players.");
    error.status = 400;
    throw error;
  }

  const questionIds = await selectBattleQuestionIds(exam);

  const { data: match, error: matchError } = await supabaseAdmin
    .from("battle_matches")
    .insert({
      exam: normalizeExam(exam),
      status: "ACTIVE",
      question_ids: questionIds,
    })
    .select("id, exam, status, question_ids, started_at, created_at")
    .single();

  if (matchError) throw matchError;

  const { error: playersError } = await supabaseAdmin
    .from("battle_players")
    .insert([
      { battle_id: match.id, user_id: playerAId },
      { battle_id: match.id, user_id: playerBId },
    ]);

  if (playersError) throw playersError;

  await supabaseAdmin.from("battle_queue").delete().in("user_id", [playerAId, playerBId]);
  return match;
}

export async function getBattleForUser({ battleId, userId, includeReview = false }) {
  const { data: match, error: matchError } = await supabaseAdmin
    .from("battle_matches")
    .select("id, exam, status, question_ids, started_at, finished_at, winner_user_id, created_at")
    .eq("id", battleId)
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) {
    const error = new Error("Battle not found");
    error.status = 404;
    throw error;
  }

  const { data: players, error: playersError } = await supabaseAdmin
    .from("battle_players")
    .select("id, battle_id, user_id, score, correct_count, wrong_count, skipped_count, rating_before, rating_after, rating_change, completed_at, created_at")
    .eq("battle_id", battleId);
  if (playersError) throw playersError;

  if (!(players || []).some((player) => player.user_id === userId)) {
    const error = new Error("You are not a player in this battle.");
    error.status = 403;
    throw error;
  }

  const playerIds = (players || []).map((player) => player.user_id);
  const [{ data: profiles, error: profileError }, { data: answers, error: answerError }, { data: statsList }] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, username, full_name, exam, target_year")
      .in("clerk_user_id", playerIds),
    supabaseAdmin
      .from("battle_answers")
      .select("question_id, selected_answer, answered_at")
      .eq("battle_id", battleId)
      .eq("user_id", userId),
    supabaseAdmin
      .from("battle_stats")
      .select("user_id, arena_rating, win_streak")
      .in("user_id", playerIds),
  ]);

  if (profileError) throw profileError;
  if (answerError) throw answerError;

  const selectFields = match.status === "FINISHED" || includeReview
    ? REVIEW_QUESTION_SELECT
    : SAFE_BATTLE_QUESTION_SELECT;
  const { data: questions, error: questionsError } = await supabaseAdmin
    .from("battle_questions")
    .select(selectFields)
    .in("id", match.question_ids || []);
  if (questionsError) throw questionsError;

  const profileById = new Map((profiles || []).map((profile) => [profile.clerk_user_id, profile]));
  const statsById = new Map((statsList || []).map((s) => [s.user_id, s]));
  const answerMap = Object.fromEntries((answers || []).map((answer) => [String(answer.question_id), answer.selected_answer]));

  return {
    ...match,
    questions: orderByQuestionIds(questions || [], match.question_ids || [])
      .map((question) => mapBattleQuestionForClient(question, match.status === "FINISHED" || includeReview)),
    answers: answerMap,
    players: (players || []).map((player) => {
      const profile = profileById.get(player.user_id);
      const playerStats = statsById.get(player.user_id);
      const rating = player.rating_after ?? playerStats?.arena_rating ?? 1000;
      return {
        ...player,
        rating_before: player.rating_before ?? rating,
        rating_after: player.rating_after ?? rating,
        rating_change: player.rating_change ?? 0,
        arena_rating: rating,
        win_streak: playerStats?.win_streak ?? 0,
        tier: getRatingTier(rating),
        answeredCount: null,
        profile: {
          username: profile?.username || null,
          displayName: profile?.full_name || "PrepZii Student",
          exam: normalizeExam(profile?.exam),
          targetYear: profile?.target_year || null,
        },
      };
    }),
  };
}

export async function hydratePlayerProgress(battle) {
  const { data, error } = await supabaseAdmin
    .from("battle_answers")
    .select("user_id, question_id")
    .eq("battle_id", battle.id);

  if (error) throw error;

  const counts = new Map();
  for (const answer of data || []) {
    counts.set(answer.user_id, (counts.get(answer.user_id) || 0) + 1);
  }

  return {
    ...battle,
    players: battle.players.map((player) => ({
      ...player,
      answeredCount: counts.get(player.user_id) || 0,
    })),
  };
}

// ==========================================
// MATCH FINISH & DETERMINISTIC ELO PROCESSING
// ==========================================

export async function finishBattleForUser({ battleId, userId }) {
  const battle = await getBattleForUser({ battleId, userId });
  if (battle.status !== "ACTIVE") {
    return hydratePlayerProgress(battle);
  }

  const { data: scoringQuestions, error: scoringError } = await supabaseAdmin
    .from("battle_questions")
    .select(SCORING_QUESTION_SELECT)
    .in("id", battle.question_ids || []);
  if (scoringError) throw scoringError;

  const { data: answers, error: answerError } = await supabaseAdmin
    .from("battle_answers")
    .select("question_id, selected_answer")
    .eq("battle_id", battleId)
    .eq("user_id", userId);
  if (answerError) throw answerError;

  const answerByQuestion = new Map((answers || []).map((answer) => [String(answer.question_id), answer.selected_answer]));
  const questionById = new Map((scoringQuestions || []).map((question) => [String(question.id), question]));
  let correctCount = 0;
  let wrongCount = 0;

  for (const questionId of battle.question_ids || []) {
    const selectedAnswer = answerByQuestion.get(String(questionId));
    if (selectedAnswer === undefined || selectedAnswer === null || selectedAnswer === "") continue;
    if (isAnswerCorrect(questionById.get(String(questionId)), selectedAnswer)) {
      correctCount++;
    } else {
      wrongCount++;
    }
  }

  const skippedCount = Math.max(0, (battle.question_ids || []).length - correctCount - wrongCount);
  const score = correctCount * 4 - wrongCount;

  const { error: updatePlayerError } = await supabaseAdmin
    .from("battle_players")
    .update({
      score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      skipped_count: skippedCount,
      completed_at: new Date().toISOString(),
    })
    .eq("battle_id", battleId)
    .eq("user_id", userId)
    .is("completed_at", null);
  if (updatePlayerError) throw updatePlayerError;

  const refreshed = await getBattleForUser({ battleId, userId });
  const bothFinished = refreshed.players.length === 2 && refreshed.players.every((player) => player.completed_at);

  if (bothFinished && refreshed.status === "ACTIVE") {
    const [pA, pB] = refreshed.players;
    let winnerUserId = null;
    let isDraw = false;

    if (pA.score !== pB.score) {
      winnerUserId = pA.score > pB.score ? pA.user_id : pB.user_id;
    } else {
      const aTime = new Date(pA.completed_at).getTime();
      const bTime = new Date(pB.completed_at).getTime();
      if (aTime !== bTime) winnerUserId = aTime < bTime ? pA.user_id : pB.user_id;
      else isDraw = true;
    }

    // Fetch existing stats for Elo calculations
    const { data: statsRows } = await supabaseAdmin
      .from("battle_stats")
      .select("user_id, arena_rating, peak_rating, win_streak, best_streak")
      .in("user_id", [pA.user_id, pB.user_id]);

    const statsMap = new Map((statsRows || []).map((s) => [s.user_id, s]));
    const ratingA = statsMap.get(pA.user_id)?.arena_rating ?? 1000;
    const ratingB = statsMap.get(pB.user_id)?.arena_rating ?? 1000;

    const scoreForA = isDraw ? 0.5 : pA.user_id === winnerUserId ? 1 : 0;
    const { changeA, changeB, newRatingA, newRatingB } = calculateEloChange(ratingA, ratingB, scoreForA);

    // Update match status and winner
    const { error: finishError } = await supabaseAdmin
      .from("battle_matches")
      .update({
        status: "FINISHED",
        finished_at: new Date().toISOString(),
        winner_user_id: winnerUserId,
      })
      .eq("id", battleId);
    if (finishError) throw finishError;

    // Update match player rating deltas
    await Promise.all([
      supabaseAdmin
        .from("battle_players")
        .update({
          rating_before: ratingA,
          rating_after: newRatingA,
          rating_change: changeA,
        })
        .eq("battle_id", battleId)
        .eq("user_id", pA.user_id),
      supabaseAdmin
        .from("battle_players")
        .update({
          rating_before: ratingB,
          rating_after: newRatingB,
          rating_change: changeB,
        })
        .eq("battle_id", battleId)
        .eq("user_id", pB.user_id),
    ]);

    // Ensure current season is registered
    const seasonId = getCurrentSeasonId();
    await ensureSeason(seasonId).catch(() => {});

    // Update all-time & seasonal stats for both players
    const resultA = isDraw ? "draw" : pA.user_id === winnerUserId ? "win" : "loss";
    const resultB = isDraw ? "draw" : pB.user_id === winnerUserId ? "win" : "loss";

    const [updatedStatsA, updatedStatsB] = await Promise.all([
      updateBattleStats(pA.user_id, resultA, changeA),
      updateBattleStats(pB.user_id, resultB, changeB),
      updateSeasonBattleStats(seasonId, pA.user_id, resultA, changeA),
      updateSeasonBattleStats(seasonId, pB.user_id, resultB, changeB),
    ]);

    // Record Live Feed Events
    try {
      const winner = pA.user_id === winnerUserId ? pA : pB;
      const loser = pA.user_id === winnerUserId ? pB : pA;

      if (!isDraw && winner) {
        await recordBattleEvent({
          eventType: "match_finish",
          userId: winner.user_id,
          opponentId: loser.user_id,
          message: `${winner.profile.displayName} defeated ${loser.profile.displayName} ${winner.score}–${loser.score}`,
          metadata: { score: `${winner.score}-${loser.score}`, battleId },
        });

        const winningStats = winner.user_id === pA.user_id ? updatedStatsA : updatedStatsB;
        if (winningStats && winningStats.win_streak >= 3 && winningStats.win_streak % 2 !== 0) {
          await recordBattleEvent({
            eventType: "streak",
            userId: winner.user_id,
            opponentId: null,
            message: `${winner.profile.displayName} reached a ${winningStats.win_streak}-win streak 🔥`,
            metadata: { streak: winningStats.win_streak },
          });
        }

        const tierBefore = getRatingTier(winner.user_id === pA.user_id ? ratingA : ratingB);
        const tierAfter = getRatingTier(winner.user_id === pA.user_id ? newRatingA : newRatingB);
        if (tierAfter.min > tierBefore.min) {
          await recordBattleEvent({
            eventType: "tier_up",
            userId: winner.user_id,
            opponentId: null,
            message: `${winner.profile.displayName} reached ${tierAfter.name} ${tierAfter.icon}`,
            metadata: { tier: tierAfter.name },
          });
        }
      }
    } catch (eventErr) {
      console.error("[RECORD_BATTLE_EVENT_ERROR]", eventErr);
    }
  }

  return hydratePlayerProgress(await getBattleForUser({ battleId, userId }));
}

async function updateBattleStats(userId, result, ratingChange = 0) {
  const defaults = {
    user_id: userId,
    wins: 0,
    losses: 0,
    draws: 0,
    total_battles: 0,
    arena_rating: 1000,
    peak_rating: 1000,
    win_streak: 0,
    best_streak: 0,
  };

  const { data: current, error: readError } = await supabaseAdmin
    .from("battle_stats")
    .select("user_id, wins, losses, draws, total_battles, arena_rating, peak_rating, win_streak, best_streak")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw readError;

  const next = current || defaults;
  next.total_battles += 1;
  if (result === "win") {
    next.wins += 1;
    next.win_streak = (next.win_streak || 0) + 1;
    next.best_streak = Math.max(next.best_streak || 0, next.win_streak);
  } else if (result === "loss") {
    next.losses += 1;
    next.win_streak = 0;
  } else if (result === "draw") {
    next.draws += 1;
  }

  next.arena_rating = Math.max(100, (next.arena_rating || 1000) + ratingChange);
  next.peak_rating = Math.max(next.peak_rating || 1000, next.arena_rating);

  const { error } = await supabaseAdmin
    .from("battle_stats")
    .upsert({ ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;

  return next;
}

async function updateSeasonBattleStats(seasonId, userId, result, ratingChange = 0) {
  const defaults = {
    season_id: seasonId,
    user_id: userId,
    arena_rating: 1000,
    peak_rating: 1000,
    wins: 0,
    losses: 0,
    draws: 0,
    win_streak: 0,
    best_streak: 0,
    total_battles: 0,
  };

  const { data: current, error: readError } = await supabaseAdmin
    .from("battle_season_stats")
    .select("season_id, user_id, arena_rating, peak_rating, wins, losses, draws, win_streak, best_streak, total_battles")
    .eq("season_id", seasonId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    // If season stats table not ready, safely skip
    return null;
  }

  const next = current || defaults;
  next.total_battles += 1;
  if (result === "win") {
    next.wins += 1;
    next.win_streak = (next.win_streak || 0) + 1;
    next.best_streak = Math.max(next.best_streak || 0, next.win_streak);
  } else if (result === "loss") {
    next.losses += 1;
    next.win_streak = 0;
  } else if (result === "draw") {
    next.draws += 1;
  }

  next.arena_rating = Math.max(100, (next.arena_rating || 1000) + ratingChange);
  next.peak_rating = Math.max(next.peak_rating || 1000, next.arena_rating);

  const { error } = await supabaseAdmin
    .from("battle_season_stats")
    .upsert(
      { ...next, updated_at: new Date().toISOString() },
      { onConflict: "season_id,user_id" }
    );

  if (error) {
    console.error("[UPDATE_SEASON_BATTLE_STATS_ERROR]", error);
  }

  return next;
}

export async function recordBattleEvent({ eventType, userId, opponentId, message, metadata = {} }) {
  const { error } = await supabaseAdmin.from("battle_events").insert({
    event_type: eventType,
    user_id: userId,
    opponent_id: opponentId,
    message,
    metadata,
  });
  if (error) {
    console.error("[RECORD_BATTLE_EVENT_DB_ERROR]", error);
  }
}

export async function findProfileByUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("clerk_user_id, username, full_name, exam, target_year")
    .eq("username", normalized)
    .maybeSingle();
  if (error) throw error;
  return data ? { ...data, exam: normalizeExam(data.exam), displayName: data.full_name || "PrepZii Student" } : null;
}

export function challengeIsExpired(challenge) {
  return isExpired(challenge?.expires_at);
}
