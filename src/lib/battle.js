import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeUsername } from "@/lib/username";

export const BATTLE_QUESTION_COUNT = 10;
export const BATTLE_EXPIRES_MINUTES = 10;

export const SAFE_BATTLE_QUESTION_SELECT = `
  id,
  exam,
  exam_type,
  year,
  subject,
  chapter,
  difficulty,
  question,
  question_image,
  option_a,
  option_b,
  option_c,
  option_d,
  option_a_image,
  option_b_image,
  option_c_image,
  option_d_image,
  question_type,
  question_number,
  display_order,
  marks_positive,
  marks_negative
`;

const SCORING_QUESTION_SELECT = `
  id,
  question_type,
  correct_option,
  correct_options,
  numerical_answer,
  numerical_min,
  numerical_max
`;

const REVIEW_QUESTION_SELECT = `
  ${SAFE_BATTLE_QUESTION_SELECT},
  correct_option,
  correct_options,
  numerical_answer,
  numerical_min,
  numerical_max,
  explanation,
  explanation_image
`;

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

function answerAsArray(value) {
  if (Array.isArray(value)) return value.map(normalizeOption).filter(Boolean).sort();
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(normalizeOption).filter(Boolean).sort() : [];
    } catch {
      return [];
    }
  }
  return String(value || "")
    .split(",")
    .map(normalizeOption)
    .filter(Boolean)
    .sort();
}

function closeEnough(a, b) {
  const left = Number(a);
  const right = Number(b);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
  return Math.abs(left - right) <= 1e-6;
}

export function isAnswerCorrect(question, selectedAnswer) {
  if (!question) return false;
  const answer = parseAnswer(selectedAnswer);
  if (answer === null) return false;

  const type = String(question.question_type || "MCQ").toLowerCase();
  if (type.includes("numerical")) {
    const value = Number(answer);
    if (!Number.isFinite(value)) return false;
    if (question.numerical_min !== null && question.numerical_min !== undefined && question.numerical_max !== null && question.numerical_max !== undefined) {
      return value >= Number(question.numerical_min) && value <= Number(question.numerical_max);
    }
    return closeEnough(value, question.numerical_answer);
  }

  if (Array.isArray(question.correct_options) && question.correct_options.length > 0) {
    const selected = answerAsArray(answer);
    const correct = question.correct_options.map(normalizeOption).filter(Boolean).sort();
    return selected.length === correct.length && selected.every((item, index) => item === correct[index]);
  }

  return normalizeOption(answer) === normalizeOption(question.correct_option);
}

export async function getBattleProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id, clerk_user_id, full_name, username, exam, target_year")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    exam: normalizeExam(data.exam),
    displayName: data.full_name || "PrepZii Student",
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
    .from("pyq_questions")
    .select("id")
    .eq("exam", normalizeExam(exam))
    .in("status", ["PUBLISHED", "APPROVED", "NEEDS_REVIEW"])
    .not("exam_id", "is", null)
    .limit(250);

  if (error) throw error;

  const ids = shuffle((data || []).map((question) => String(question.id))).slice(0, BATTLE_QUESTION_COUNT);
  if (ids.length < BATTLE_QUESTION_COUNT) {
    const battleError = new Error("Not enough published questions for Battle Arena yet.");
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
    .select("id, battle_id, user_id, score, correct_count, wrong_count, skipped_count, completed_at, created_at")
    .eq("battle_id", battleId);
  if (playersError) throw playersError;

  if (!(players || []).some((player) => player.user_id === userId)) {
    const error = new Error("You are not a player in this battle.");
    error.status = 403;
    throw error;
  }

  const playerIds = (players || []).map((player) => player.user_id);
  const [{ data: profiles, error: profileError }, { data: answers, error: answerError }] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id, username, full_name, exam, target_year")
      .in("clerk_user_id", playerIds),
    supabaseAdmin
      .from("battle_answers")
      .select("question_id, selected_answer, answered_at")
      .eq("battle_id", battleId)
      .eq("user_id", userId),
  ]);

  if (profileError) throw profileError;
  if (answerError) throw answerError;

  const selectFields = match.status === "FINISHED" || includeReview
    ? REVIEW_QUESTION_SELECT
    : SAFE_BATTLE_QUESTION_SELECT;
  const { data: questions, error: questionsError } = await supabaseAdmin
    .from("pyq_questions")
    .select(selectFields)
    .in("id", match.question_ids || []);
  if (questionsError) throw questionsError;

  const profileById = new Map((profiles || []).map((profile) => [profile.clerk_user_id, profile]));
  const answerMap = Object.fromEntries((answers || []).map((answer) => [String(answer.question_id), answer.selected_answer]));

  return {
    ...match,
    questions: orderByQuestionIds(questions || [], match.question_ids || []),
    answers: answerMap,
    players: (players || []).map((player) => {
      const profile = profileById.get(player.user_id);
      return {
        ...player,
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

export async function finishBattleForUser({ battleId, userId }) {
  const battle = await getBattleForUser({ battleId, userId });
  if (battle.status !== "ACTIVE") {
    return hydratePlayerProgress(battle);
  }

  const { data: scoringQuestions, error: scoringError } = await supabaseAdmin
    .from("pyq_questions")
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
    const [a, b] = refreshed.players;
    let winnerUserId = null;
    let isDraw = false;

    if (a.score !== b.score) {
      winnerUserId = a.score > b.score ? a.user_id : b.user_id;
    } else {
      const aTime = new Date(a.completed_at).getTime();
      const bTime = new Date(b.completed_at).getTime();
      if (aTime !== bTime) winnerUserId = aTime < bTime ? a.user_id : b.user_id;
      else isDraw = true;
    }

    const { error: finishError } = await supabaseAdmin
      .from("battle_matches")
      .update({
        status: "FINISHED",
        finished_at: new Date().toISOString(),
        winner_user_id: winnerUserId,
      })
      .eq("id", battleId);
    if (finishError) throw finishError;

    await Promise.all(refreshed.players.map((player) => {
      const result = isDraw ? "draw" : player.user_id === winnerUserId ? "win" : "loss";
      return updateBattleStats(player.user_id, result);
    }));
  }

  return hydratePlayerProgress(await getBattleForUser({ battleId, userId }));
}

async function updateBattleStats(userId, result) {
  const defaults = { user_id: userId, wins: 0, losses: 0, draws: 0, total_battles: 0 };
  const { data: current, error: readError } = await supabaseAdmin
    .from("battle_stats")
    .select("user_id, wins, losses, draws, total_battles")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;

  const next = current || defaults;
  next.total_battles += 1;
  if (result === "win") next.wins += 1;
  if (result === "loss") next.losses += 1;
  if (result === "draw") next.draws += 1;

  const { error } = await supabaseAdmin
    .from("battle_stats")
    .upsert({ ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
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
