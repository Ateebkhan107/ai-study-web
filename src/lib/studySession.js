import { supabase } from "@/lib/supabase";

// =========================
// START SESSION
// =========================

export async function startStudySession({
  userId,
  exam,
  subject,
  chapter,
  studyMode,
  timerType,
  shift = "Morning",
}) {

  const { data, error } = await supabase

    .from("study_sessions")

    .insert({

      user_id: userId,

      exam,

      subject,

      chapter,

      study_mode: studyMode,

      timer_type: timerType,

      shift,

      started_at: new Date(),

      duration_seconds: 0,

    })

    .select()

    .single();

  if (error) {

    console.error(error);

    return null;

  }

  return data;

}

// =========================
// FINISH SESSION
// =========================

export async function finishStudySession(
  sessionId,
  duration
) {

  const { error } = await supabase

    .from("study_sessions")

    .update({

      ended_at: new Date(),

      duration_seconds: duration,

    })

    .eq("id", sessionId);

  if (error) {

    console.error(error);

  }

}