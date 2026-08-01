import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getQuestions } from "@/lib/questions";
import { getLevelFromXP } from "@/utils/levelEngine";
import { getQuestionMarking } from "@/lib/analyticsHelpers";

const LETTERS = ["A", "B", "C", "D"];

function shuffleQuestions(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

async function addXpWithAdmin(userId, amount, name = "Student", stats = {}) {
  if (!userId || amount <= 0) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("user_xp")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const newXP = (data?.xp || 0) + amount;
  const levelStats = getLevelFromXP(newXP);

  const badgeTitle =
    levelStats.currentLevel >= 10
      ? "Grandmaster"
      : levelStats.currentLevel >= 8
      ? "Master"
      : levelStats.currentLevel >= 6
      ? "Elite"
      : levelStats.currentLevel >= 4
      ? "Expert"
      : levelStats.currentLevel >= 2
      ? "Challenger"
      : "Explorer";

  const { error: updateError } = await supabaseAdmin
    .from("user_xp")
    .upsert(
      {
        user_id: userId,
        name: data?.name || name,
        xp: newXP,
        level: levelStats.currentLevel,
        badge: badgeTitle,
        ...stats,
      },
      {
        onConflict: "user_id",
      }
    );

  if (updateError) {
    throw updateError;
  }

  return {
    xp: newXP,
    level: levelStats.currentLevel,
    badge: badgeTitle,
  };
}

async function updateStreakWithAdmin(userId) {
  if (!userId) return;

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const { data: userData, error } = await supabaseAdmin
    .from("user_xp")
    .select("streak, last_study_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const currentStreak = userData?.streak || 0;
  const lastStudyDate = userData?.last_study_date;

  if (lastStudyDate === todayString) {
    return;
  }

  let newStreak = 1;

  if (lastStudyDate) {
    const last = new Date(lastStudyDate);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = currentStreak + 1;
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("user_xp")
    .upsert(
      {
        user_id: userId,
        streak: newStreak,
        last_study_date: todayString,
      },
      {
        onConflict: "user_id",
      }
    );

  if (updateError) {
    throw updateError;
  }
}

async function updateGoalProgressWithAdmin(userId, goalType, amount, name) {
  if (!userId || !goalType) return;

  const today = new Date().toISOString().split("T")[0];

  const { data: goals, error } = await supabaseAdmin
    .from("daily_goals")
    .select("*")
    .eq("is_active", true)
    .eq("goal_type", goalType);

  if (error) {
    throw error;
  }

  for (const goal of goals || []) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("user_daily_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("goal_id", goal.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    let newProgress = amount;
    let isNewDay = false;

    if (existing) {
      if (existing.goal_date === today) {
        newProgress = (existing.progress || 0) + amount;
      } else {
        isNewDay = true;
      }
    }

    const completed = newProgress >= goal.target_value;

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from("user_daily_goals")
        .update({
          goal_date: today,
          progress: newProgress,
          completed,
          completed_at:
            completed && (!existing.completed || isNewDay)
              ? new Date().toISOString()
              : existing.completed_at,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("user_daily_goals")
        .insert({
          user_id: userId,
          goal_id: goal.id,
          goal_date: today,
          progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        });

      if (insertError) {
        throw insertError;
      }
    }

    if (completed && (!existing?.completed || isNewDay)) {
      await addXpWithAdmin(userId, goal.xp, name);
    }
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      duration = 30,
      count = 20,
      subject = "Mixed Subjects",
      chapter = "All Chapters",
      difficulty = "Mixed",
    } = body;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("exam")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const track = profile?.exam || "JEE";
    const exam = track === "NEET" ? "NEET" : "JEE Main";

    const fetchedQuestions = await getQuestions({
      exam,
      subject,
      chapter,
      difficulty,
      limit: count,
      client: supabaseAdmin,
    });

    if (!fetchedQuestions.length) {
      return NextResponse.json({ questions: [] });
    }

    const questions = shuffleQuestions(fetchedQuestions);

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("test_sessions")
      .insert({
        user_id: userId,
        exam,
        subjects: [subject],
        chapters: [chapter],
        difficulty,
        total_questions: questions.length,
        duration_minutes: duration,
        status: "in_progress",
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    const testQuestionRows = questions.map((question, index) => ({
      session_id: session.id,
      question_id: question.id,
      question_order: index + 1,
    }));

    const { error: testQuestionsError } = await supabaseAdmin
      .from("test_questions")
      .insert(testQuestionRows);

    if (testQuestionsError) {
      throw testQuestionsError;
    }

    const safeQuestions = questions.map((question) => ({
      id: question.id,
      exam: question.exam,
      subject: question.subject,
      chapter: question.chapter,
      difficulty: question.difficulty,
      text: question.text,
      question_image: question.question_image,
      options: question.options,
      option_images: question.option_images,
      marks: question.marks,
      negative_marks: question.negative_marks,
    }));

    return NextResponse.json({
      track,
      sessionId: session.id,
      questions: safeQuestions,
    });
  } catch (error) {
    console.error("[TEST_SESSION_START_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const name = clerkUser?.firstName || clerkUser?.username || "Student";

    const body = await request.json();
    const { sessionId, answers = {}, timeTakenSeconds = 0 } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("test_sessions")
      .select("id, duration_minutes")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: sessionQuestions, error: questionsError } = await supabaseAdmin
      .from("test_questions")
      .select(`
        question_order,
        question_id,
        questions(
          id,
          exam,
          correct_option,
          marks,
          negative_marks
        )
      `)
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    const questionRows = (sessionQuestions || [])
      .map((row) => ({
        id: row.question_id,
        exam: row.questions?.exam,
        correct_option: row.questions?.correct_option,
        marks: row.questions?.marks,
        negative_marks: row.questions?.negative_marks,
      }))
      .filter((row) => row.id && row.correct_option);

    if (!questionRows.length) {
      return NextResponse.json(
        { error: "No questions found for session" },
        { status: 400 }
      );
    }

    let correct = 0;
    let wrong = 0;
    let attempted = 0;
    let score = 0;
    let totalMarks = 0;

    const answerRows = questionRows.map((question) => {
      const rawSelectedIndex = answers[String(question.id)];
      const selectedIndex = Number(rawSelectedIndex);
      const attemptedQuestion =
        Number.isInteger(selectedIndex) &&
        selectedIndex >= 0 &&
        selectedIndex < LETTERS.length;
      const selectedOption = attemptedQuestion ? LETTERS[selectedIndex] : null;
      const isCorrect = attemptedQuestion && selectedOption === question.correct_option;
      const marking = getQuestionMarking(
        {
          marks: question.marks,
          negative_marks: question.negative_marks,
        },
        question.exam
      );

      totalMarks += marking.positive;

      if (attemptedQuestion) {
        attempted += 1;

        if (isCorrect) {
          correct += 1;
          score += marking.positive;
        } else {
          wrong += 1;
          score -= marking.negative;
        }
      }

      return {
        attempt_id: null,
        question_id: question.id,
        selected_option: selectedOption,
        correct_option: question.correct_option,
        is_correct: isCorrect,
      };
    });

    const safeTimeTakenSeconds = Math.max(
      0,
      Math.min(Number(timeTakenSeconds) || 0, (session.duration_minutes || 0) * 60)
    );

    const { data: xpRowBefore, error: xpRowBeforeError } = await supabaseAdmin
      .from("user_xp")
      .select("pyq_solved, correct_answers")
      .eq("user_id", userId)
      .maybeSingle();

    if (xpRowBeforeError) {
      throw xpRowBeforeError;
    }

    const newSolved = (xpRowBefore?.pyq_solved || 0) + questionRows.length;
    const newCorrect = (xpRowBefore?.correct_answers || 0) + correct;
    const newAccuracy = newSolved > 0 ? Math.round((newCorrect / newSolved) * 100) : 0;

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("test_attempts")
      .insert({
        user_id: userId,
        session_id: sessionId,
        score,
        total_marks: totalMarks,
        correct_answers: correct,
        wrong_answers: wrong,
        attempted,
        total_questions: questionRows.length,
        duration_minutes: session.duration_minutes || 0,
        time_taken_seconds: safeTimeTakenSeconds,
      })
      .select()
      .single();

    if (attemptError) {
      throw attemptError;
    }

    const finalAnswerRows = answerRows.map((row) => ({
      ...row,
      attempt_id: attempt.id,
    }));

    const { error: answersError } = await supabaseAdmin
      .from("user_answers")
      .insert(finalAnswerRows);

    if (answersError) {
      throw answersError;
    }

    await updateStreakWithAdmin(userId);

    await addXpWithAdmin(userId, correct * 15, name, {
      pyq_solved: newSolved,
      correct_answers: newCorrect,
      accuracy: newAccuracy,
    });

    await updateGoalProgressWithAdmin(userId, "TEST", 1, name);

    return NextResponse.json({
      attemptId: attempt.id,
    });
  } catch (error) {
    console.error("[TEST_SESSION_SUBMIT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
