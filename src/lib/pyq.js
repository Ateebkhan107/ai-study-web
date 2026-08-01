import { fetchJsonCached, invalidateFetchCache } from "@/lib/fetchCache";

function isStablePyqMode(mode) {
  return mode !== "mistakes" && mode !== "random";
}

// =============================
// GET PYQ QUESTIONS
// =============================

export async function getPYQ(exam, subject, options = {}) {
  const params = new URLSearchParams();

  params.set("exam", exam);
  params.set("subject", subject);

  if (options.year) params.set("year", options.year);
  if (options.chapter) params.set("chapter", options.chapter);
  if (options.mode) params.set("mode", options.mode);
  if (options.userId) params.set("userId", options.userId);
  if (options.examType) params.set("exam_type", options.examType);
  if (options.attempt) params.set("attempt", options.attempt);
  if (options.shift) params.set("shift", options.shift);
  if (options.examId) params.set("exam_id", options.examId);

  return fetchJsonCached(`/api/pyq?${params.toString()}`, {
    ttlMs: isStablePyqMode(options.mode) ? 30_000 : 0,
    key: `pyq:${params.toString()}`,
  });
}

// =============================
// SAVE PYQ ATTEMPT + XP UPDATE
// =============================

export async function savePYQAttempt(attempt) {
  const res = await fetch("/api/pyq-attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question_id: attempt.question_id,
      selected_option: attempt.selected_option,
      is_correct: attempt.is_correct,
      chapter: attempt.chapter,
      subject: attempt.subject,
      exam: attempt.exam,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.log("SAVE ATTEMPT ERROR:", error);
    throw new Error(error.error || "Failed to save attempt");
  }

  const attemptData = await res.json();

  invalidateFetchCache((key) =>
    String(key).startsWith("pyq:") ||
    String(key).startsWith("pyq-analytics:") ||
    String(key).startsWith("pyq-overview:")
  );

  return attemptData;
}

export async function savePYQAttempts(attempts) {
  const res = await fetch("/api/pyq-attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attempts,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.log("SAVE ATTEMPTS ERROR:", error);
    throw new Error(error.error || "Failed to save attempts");
  }

  const attemptData = await res.json();

  invalidateFetchCache((key) =>
    String(key).startsWith("pyq:") ||
    String(key).startsWith("pyq-analytics:") ||
    String(key).startsWith("pyq-overview:")
  );

  return attemptData;
}

// =============================
// GET PYQ ANALYTICS
// =============================

export async function getPYQAnalytics(track = "JEE") {
  return fetchJsonCached(`/api/pyq/analytics?track=${track}`, {
    ttlMs: 15_000,
    key: `pyq-analytics:${track}`,
  });
}

// =============================
// GET PYQ OVERVIEW
// =============================

export async function getPYQOverview(track) {
  return fetchJsonCached(`/api/pyq/overview?track=${track}`, {
    ttlMs: 5 * 60 * 1000,
    key: `pyq-overview:${track}`,
  });
}
