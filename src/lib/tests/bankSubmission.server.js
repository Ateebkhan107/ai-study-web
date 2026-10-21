import "server-only";

const conflict = (message) => Object.assign(new Error(message), { status: 409 });

// Independent rollout for normal-test atomic RPCs after migration approval.
// This server-only flag never enables generated starts or AI generation.
export function bankAtomicSubmissionEnabled() {
  return process.env.ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED === "true";
}

// A retry may reuse only an unambiguous attempt with a complete saved answer set.
// Never repair or select a canonical historical duplicate implicitly.
export async function findCompletedBankAttempt({ client, userId, sessionId, questionIds }) {
  const { data, error } = await client.from("test_attempts").select("id,total_questions")
    .eq("session_id", sessionId).eq("user_id", userId)
    .order("created_at", { ascending: true }).order("id", { ascending: true }).limit(2);
  if (error) throw error;
  if (!Array.isArray(data)) throw Object.assign(new Error("Unable to verify the previous submission. Please try again."), { status: 503 });
  if (!data.length) return null;
  if (data.length > 1) throw conflict("This session has conflicting saved attempts. No new attempt was created. Please contact support.");
  const previous = data[0];
  const expected = new Set(questionIds);
  const { data: answers, error: answersError } = await client.from("user_answers").select("question_id")
    .eq("attempt_id", previous.id).limit(questionIds.length + 1);
  if (answersError) throw answersError;
  if (previous.total_questions !== questionIds.length || expected.size !== questionIds.length ||
    !Array.isArray(answers) || answers.length !== expected.size ||
    new Set(answers.map((a) => a.question_id)).size !== expected.size ||
    answers.some((a) => !expected.has(a.question_id))) {
    throw conflict("This session has an incomplete saved submission. No new attempt was created. Please contact support.");
  }
  const { data: instituteAttempts, error: instituteError } = await client.from("institute_test_attempts")
    .select("attempt_id,status").eq("session_id", sessionId).eq("user_id", userId).limit(2);
  if (instituteError) throw instituteError;
  if (!Array.isArray(instituteAttempts) || instituteAttempts.length > 1 ||
    instituteAttempts.some((a) => a.attempt_id !== previous.id || a.status !== "SUBMITTED")) {
    throw conflict("This session has an incomplete institute submission. No new attempt was created. Please contact support.");
  }
  return previous.id;
}

// Same-worker mitigation only. It is NOT a distributed lock or database-level
// uniqueness guarantee; separate workers/legacy writers still need DB protection.
export function createBankSubmissionGuard({ maxSessions = 1000, maxQueuedPerSession = 16 } = {}) {
  const queues = new Map();
  return async function withBankSubmissionLock({ userId, sessionId }, work) {
    const key = JSON.stringify([userId, sessionId]);
    let queue = queues.get(key);
    if ((!queue && queues.size >= maxSessions) || (queue && queue.pending >= maxQueuedPerSession)) {
      throw Object.assign(new Error("Submission is busy. Please retry shortly."), { status: 429 });
    }
    if (!queue) { queue = { tail: Promise.resolve(), pending: 0 }; queues.set(key, queue); }
    queue.pending++;
    const operation = queue.tail.then(work);
    queue.tail = operation.catch(() => {});
    try { return await operation; }
    finally { if (--queue.pending === 0 && queues.get(key) === queue) queues.delete(key); }
  };
}

export const withBankSubmissionLock = createBankSubmissionGuard();
