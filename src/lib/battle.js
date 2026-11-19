import "server-only";
import { after } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeUsername } from "@/lib/username";

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

const REVIEW_QUESTION_SELECT = `
  ${SAFE_BATTLE_QUESTION_SELECT},
  correct_answer,
  explanation
`;

export const ARENA_TIERS = [
  { name: "Bronze", key: "bronze", color: "#CD7F32", min: 0, max: 1099, icon: "shield" },
  { name: "Silver", key: "silver", color: "#C0C0C0", min: 1100, max: 1299, icon: "swords" },
  { name: "Gold", key: "gold", color: "#EAB308", min: 1300, max: 1499, icon: "crown" },
  { name: "Platinum", key: "platinum", color: "#00CED1", min: 1500, max: 1699, icon: "gem" },
  { name: "Diamond", key: "diamond", color: "#B9F2FF", min: 1700, max: 1899, icon: "sparkles" },
  { name: "Master", key: "master", color: "#A855F7", min: 1900, max: 2099, icon: "flame" },
  { name: "Grandmaster", key: "grandmaster", color: "#F43F5E", min: 2100, max: 9999, icon: "trophy" },
];

export function getRatingTier(rating = 1000) {
  const safeRating = Math.max(0, Number(rating ?? 1000));
  return (
    ARENA_TIERS.find((tier) => safeRating >= tier.min && safeRating <= tier.max) ||
    ARENA_TIERS[0]
  );
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

function normalizeOption(value) {
  if (value === undefined || value === null) return "";
  const text = String(value).trim().toUpperCase();
  if (/^[0-3]$/.test(text)) return ["A", "B", "C", "D"][Number(text)];
  return text;
}

export async function getBattleProfile(userId) {
  const [{ data: profile, error: profileError }, { data: stats }] = await Promise.all([
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
    throw Object.assign(new Error("Profile not found"), { status: 404 });
  }
  if (!profile.username) {
    throw Object.assign(new Error("Choose a username before using Battle Arena."), { status: 428 });
  }
  return profile;
}

export function battleDatabaseError(error) {
  const statusCode = /^PT([45]\d{2})$/.exec(error.code)?.[1];
  if (!statusCode) return error;
  return Object.assign(new Error(error.message), { status: Number(statusCode) });
}

export async function createBattleForPlayers({ exam, playerAId, playerBId, challengeId }) {
  const { data: id, error } = await supabaseAdmin.rpc("battle_create_match", {
    p_exam: normalizeExam(exam),
    p_first: playerAId,
    p_second: playerBId,
    p_challenge_id: challengeId ?? null,
  });
  if (error) throw battleDatabaseError(error);
  return { id };
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

  let { data: players, error: playersError } = await supabaseAdmin
    .from("battle_players")
    .select("id, battle_id, user_id, score, correct_count, wrong_count, skipped_count, rating_before, rating_after, rating_change, completed_at, created_at")
    .eq("battle_id", battleId);

  if (playersError) {
    const fallback = await supabaseAdmin
      .from("battle_players")
      .select("id, battle_id, user_id, score, correct_count, wrong_count, skipped_count, completed_at, created_at")
      .eq("battle_id", battleId);
    if (!fallback.error) {
      players = fallback.data;
      playersError = null;
    }
  }
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
      .in("user_id", playerIds)
      .then((res) => {
        if (res.error) {
          return supabaseAdmin
            .from("battle_stats")
            .select("user_id")
            .in("user_id", playerIds);
        }
        return res;
      }),
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
  const answerMap = Object.fromEntries(
    (answers || [])
      .filter((answer) => answer.selected_answer !== null && answer.selected_answer !== undefined && answer.selected_answer !== "")
      .map((answer) => [String(answer.question_id), answer.selected_answer])
  );

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
    .select("user_id, question_id, selected_answer")
    .eq("battle_id", battle.id)
    .not("selected_answer", "is", null);

  if (error) throw error;

  const counts = new Map();
  for (const answer of data || []) {
    if (answer.selected_answer !== null && answer.selected_answer !== undefined && answer.selected_answer !== "") {
      counts.set(answer.user_id, (counts.get(answer.user_id) || 0) + 1);
    }
  }

  return {
    ...battle,
    players: battle.players.map((player) => ({
      ...player,
      answeredCount: counts.get(player.user_id) || 0,
    })),
  };
}

export async function finishBattleForUser({ battleId, userId }) {
  const { data: finalized, error } = await supabaseAdmin.rpc("battle_submit", {
    p_battle_id: battleId,
    p_user_id: userId,
  });
  if (error) throw battleDatabaseError(error);

  const battle = await hydratePlayerProgress(await getBattleForUser({ battleId, userId }));
  const winner = battle.players.find((player) => player.user_id === battle.winner_user_id);
  if (finalized && winner) {
    const loser = battle.players.find((player) => player.user_id !== winner.user_id);
    after(async () => {
      try {
        await recordBattleEvent({
          eventType: "match_finish",
          userId: winner.user_id,
          opponentId: loser.user_id,
          message: `${winner.profile.displayName} defeated ${loser.profile.displayName} ${winner.score}–${loser.score}`,
          metadata: { score: `${winner.score}-${loser.score}`, battleId },
        });
        if (winner.win_streak >= 3 && winner.win_streak % 2 !== 0) {
          await recordBattleEvent({
            eventType: "streak",
            userId: winner.user_id,
            opponentId: null,
            message: `${winner.profile.displayName} reached a ${winner.win_streak}-win streak`,
            metadata: { streak: winner.win_streak },
          });
        }
        const tierBefore = getRatingTier(winner.rating_before);
        const tierAfter = getRatingTier(winner.rating_after);
        if (tierAfter.min > tierBefore.min) {
          await recordBattleEvent({
            eventType: "tier_up",
            userId: winner.user_id,
            opponentId: null,
            message: `${winner.profile.displayName} reached ${tierAfter.name} ${tierAfter.icon}`,
            metadata: { tier: tierAfter.name },
          });
        }
      } catch (eventError) {
        console.error("[RECORD_BATTLE_EVENT_ERROR]", eventError);
      }
    });
  }

  return battle;
}

export async function recordBattleEvent({ eventType, userId, opponentId, message, metadata = {} }) {
  const eventPayload = {
    event_type: eventType,
    user_id: userId,
    opponent_id: opponentId,
    message,
    metadata,
  };

  const { data: inserted, error } = await supabaseAdmin
    .from("battle_events")
    .insert(eventPayload)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[RECORD_BATTLE_EVENT_DB_ERROR]", error);
  }

  // Instant broadcast via Supabase Realtime Channel
  try {
    const channel = supabaseAdmin.channel("arena_live_feed_channel");
    await channel.send({
      type: "broadcast",
      event: "arena_event",
      payload: inserted || { ...eventPayload, id: `ev_${Date.now()}`, created_at: new Date().toISOString() },
    });
    supabaseAdmin.removeChannel(channel);
  } catch (bcErr) {
    // Gracefully handle broadcast error
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
