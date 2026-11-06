import "server-only";
import { findCompletedBankAttempt } from "../tests/bankSubmission.server.js";

const GENERAL = "general";
const REVEALED = "revealed";
const PROTECTED = "protected";
const UNKNOWN = "unknown";
const MAX_OPEN_SESSIONS = 24;

export function ziVisualsAllowed(decision) {
  return decision === GENERAL || decision === REVEALED;
}

async function list(query) {
  const { data, error } = await query;
  if (error || !Array.isArray(data)) throw Error("Unverified assessment records");
  return data;
}

async function one(query) {
  const { data, error } = await query.maybeSingle();
  if (error) throw Error("Unverified assessment record");
  return data;
}

function sameTrack(exam, track) {
  if (exam === "NEET" || exam === "NEET UG") return track === "NEET";
  return ["JEE", "JEE Main", "JEE Advanced"].includes(exam) && track === "JEE";
}

async function completedBankAttempt(client, userId, session) {
  if (!session || !["completed", "in_progress"].includes(session.status) ||
    !Number.isInteger(session.total_questions) || session.total_questions < 1 ||
    session.total_questions > 200) return null;
  const { id, total_questions: totalQuestions } = session;
  const links = await list(client.from("test_questions").select("question_id")
    .eq("session_id", id).limit(totalQuestions + 1));
  if (links.length !== totalQuestions || links.some((link) => !link.question_id)) return null;
  return findCompletedBankAttempt({ client, userId, sessionId: id, questionIds: links.map((link) => link.question_id) });
}

async function openGeneratedSession(client, userId) {
  const { data, error } = await client.from("zi_generated_sessions").select("session_id")
    .eq("owner_id", userId).is("submitted_at", null).limit(1);
  // The optional generated-test migration can be absent on installations
  // where the engine is off. Its writers also require a shared test_sessions row.
  if (error && error.code === "42P01" &&
    process.env.ZI_GENERATED_TEST_ENGINE_ENABLED !== "true") return false;
  if (error || !Array.isArray(data)) throw Error("Unverified generated sessions");
  return data.length > 0;
}

async function globalAssessmentState(client, userId) {
  const [sessions, institute, generated] = await Promise.all([
    list(client.from("test_sessions").select("id,status,total_questions")
      .eq("user_id", userId).or("status.is.null,status.neq.completed").limit(MAX_OPEN_SESSIONS + 1)),
    list(client.from("institute_test_attempts").select("session_id")
      .eq("user_id", userId).or("status.is.null,status.neq.SUBMITTED,submitted_at.is.null").limit(1)),
    openGeneratedSession(client, userId),
  ]);
  if (institute.length || generated) return PROTECTED;
  if (sessions.length > MAX_OPEN_SESSIONS) return UNKNOWN;
  for (const session of sessions) {
    if (!await completedBankAttempt(client, userId, session)) {
      return session.status === "in_progress" ? PROTECTED : UNKNOWN;
    }
  }
  return GENERAL;
}

async function bankReview(client, userId, entity, examTrack) {
  const answer = entity.type === "test_review_question"
    ? await one(client.from("user_answers").select("attempt_id,question_id").eq("id", entity.id))
    : null;
  const attemptId = entity.type === "test_result" ? entity.id : answer?.attempt_id;
  if (!attemptId) return UNKNOWN;
  const attempt = await one(client.from("test_attempts").select("id,session_id")
    .eq("id", attemptId).eq("user_id", userId));
  if (!attempt?.session_id) return UNKNOWN;
  const session = await one(client.from("test_sessions").select("id,exam,status,total_questions")
    .eq("id", attempt.session_id).eq("user_id", userId));
  if (!session || !sameTrack(session.exam, examTrack)) return UNKNOWN;
  return await completedBankAttempt(client, userId, session) === attempt.id ? REVEALED : UNKNOWN;
}

async function generatedReview(client, userId, entity, examTrack) {
  const session = await one(client.from("test_sessions").select("id,exam,status")
    .eq("id", entity.sessionId).eq("user_id", userId));
  if (!session || !sameTrack(session.exam, examTrack)) return UNKNOWN;
  if (session.status !== "completed") return PROTECTED;
  const saved = await one(client.from("zi_generated_sessions").select("test_id,submitted_at")
    .eq("session_id", session.id).eq("owner_id", userId).not("result", "is", null));
  if (!saved?.submitted_at || !saved.test_id) return UNKNOWN;
  const item = await one(client.from("zi_generated_questions").select("id")
    .eq("test_id", saved.test_id).eq("id", entity.id));
  return item ? REVEALED : UNKNOWN;
}

async function pyqReveal(client, userId, id, examTrack) {
  const [question, attempts] = await Promise.all([
    one(client.from("pyq_questions").select("id,exam").eq("id", id)),
    list(client.from("pyq_attempts").select("id").eq("user_id", userId).eq("question_id", id).limit(1)),
  ]);
  if (!question || !sameTrack(question.exam, examTrack)) return UNKNOWN;
  return attempts.length ? REVEALED : PROTECTED;
}

export async function resolveZiVisualReveal({ client, userId, examTrack, pageContext }) {
  if (!userId || !["NEET", "JEE"].includes(examTrack)) return UNKNOWN;
  try {
    // Run even if the caller claims to be on the dashboard or omits page context.
    const globalState = await globalAssessmentState(client, userId);
    if (globalState !== GENERAL) return globalState;
    const entity = pageContext?.entity;
    if (entity?.type === "test_review_question" || entity?.type === "test_result") {
      return await bankReview(client, userId, entity, examTrack);
    }
    if (entity?.type === "generated_test_review_question") return await generatedReview(client, userId, entity, examTrack);
    if (entity?.type === "pyq_question") return await pyqReveal(client, userId, entity.id, examTrack);
    if (["test", "pyq", "arena"].includes(pageContext?.pageType)) return UNKNOWN;
    return GENERAL;
  } catch {
    return UNKNOWN;
  }
}

export const ZI_PROTECTED_CONCEPT_REPLY =
  "Zi can offer general study guidance here. Identify the principle being tested, list the known quantities, and check units or definitions before trying a similar example. For a worked explanation of the question, return to its review after answers are available.";
