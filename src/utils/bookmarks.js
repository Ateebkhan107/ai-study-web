function normalizeQuestionId(questionId) {
  if (questionId === null || questionId === undefined || questionId === "") {
    return null;
  }

  return String(questionId);
}

// ===============================
// GET ALL BOOKMARKED QUESTION IDS
// ===============================

export async function getBookmarks(userId) {
  if (!userId) return [];

  try {
    const res = await fetch("/api/pyq-bookmarks", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load bookmarks");
    }

    const data = await res.json();
    return data?.questionIds || [];
  } catch {
    return [];
  }
}

// ===============================
// CHECK BOOKMARK
// ===============================

export async function isBookmarked(userId, questionId) {
  if (!userId) return false;

  questionId = normalizeQuestionId(questionId);
  if (!questionId) return false;

  try {
    const params = new URLSearchParams({ questionId });
    const res = await fetch(`/api/pyq-bookmarks?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to check bookmark");
    }

    const data = await res.json();
    return Boolean(data?.bookmarked);
  } catch {
    return false;
  }
}

// ===============================
// SAVE BOOKMARK
// ===============================

export async function saveBookmark(userId, questionId) {
  if (!userId) return false;

  questionId = normalizeQuestionId(questionId);
  if (!questionId) return false;

  try {
    const res = await fetch("/api/pyq-bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionId }),
    });

    if (!res.ok) {
      throw new Error("Failed to save bookmark");
    }

    return true;
  } catch {
    return false;
  }
}

// ===============================
// REMOVE BOOKMARK
// ===============================

export async function removeBookmark(userId, questionId) {
  if (!userId) return false;

  questionId = normalizeQuestionId(questionId);
  if (!questionId) return false;

  try {
    const res = await fetch("/api/pyq-bookmarks", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionId }),
    });

    if (!res.ok) {
      throw new Error("Failed to remove bookmark");
    }

    return true;
  } catch {
    return false;
  }
}

// ===============================
// TOGGLE BOOKMARK
// ===============================

export async function toggleBookmark(userId, questionId) {
  if (!userId) return false;

  questionId = normalizeQuestionId(questionId);
  if (!questionId) return false;

  const bookmarked = await isBookmarked(userId, questionId);

  if (bookmarked) {
    const removed = await removeBookmark(userId, questionId);
    return removed ? false : true;
  }

  return (await saveBookmark(userId, questionId)) ? true : false;
}
