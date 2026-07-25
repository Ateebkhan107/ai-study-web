import { supabase } from "./supabase";

// ===============================
// GET ALL BOOKMARKED QUESTION IDS
// ===============================

export async function getBookmarks(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("pyq_bookmarks")
    .select("question_id")
    .eq("user_id", userId);

  if (error) {
    console.log("GET BOOKMARKS ERROR");
    console.log(JSON.stringify(error, null, 2));
    return [];
  }

  return data.map((b) => Number(b.question_id));
}

// ===============================
// CHECK BOOKMARK
// ===============================

export async function isBookmarked(userId, questionId) {
  if (!userId) return false;

  questionId = Number(questionId);

  const { data, error } = await supabase
    .from("pyq_bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (error) {
    console.log("CHECK BOOKMARK ERROR");
    console.log(JSON.stringify(error, null, 2));
    return false;
  }

  return !!data;
}

// ===============================
// SAVE BOOKMARK
// ===============================

export async function saveBookmark(userId, questionId) {
  if (!userId) return false;

  questionId = Number(questionId);

  console.log("Saving bookmark:", {
    user_id: userId,
    question_id: questionId,
    type: typeof questionId,
  });

  const { error } = await supabase
    .from("pyq_bookmarks")
    .insert([
      {
        user_id: userId,
        question_id: questionId,
      },
    ]);

  if (error) {
    console.log("SAVE BOOKMARK ERROR");
    console.log(JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

// ===============================
// REMOVE BOOKMARK
// ===============================

export async function removeBookmark(userId, questionId) {
  if (!userId) return false;

  questionId = Number(questionId);

  const { error } = await supabase
    .from("pyq_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("question_id", questionId);

  if (error) {
    console.log("REMOVE BOOKMARK ERROR");
    console.log(JSON.stringify(error, null, 2));
    return false;
  }

  return true;
}

// ===============================
// TOGGLE BOOKMARK
// ===============================

export async function toggleBookmark(userId, questionId) {
  if (!userId) return false;

  questionId = Number(questionId);

  console.log("Toggle:", {
    user_id: userId,
    question_id: questionId,
    type: typeof questionId,
  });

  const bookmarked = await isBookmarked(userId, questionId);

  if (bookmarked) {
    await removeBookmark(userId, questionId);
    return false;
  } else {
    await saveBookmark(userId, questionId);
    return true;
  }
}