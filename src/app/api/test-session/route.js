import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getQuestions } from "@/lib/questions";
import { getLevelFromXP } from "@/utils/levelEngine";
import { getQuestionMarking } from "@/lib/analyticsHelpers";
import { getInstituteContext } from "@/lib/instituteAuth";
import { FEATURES, canUseFeature, getUserAccessContext } from "@/lib/accessControl";
import { getFirstNameFromClaims } from "@/lib/auth";

const LETTERS = ["A", "B", "C", "D"];

function normalizeOptionSet(value) {
  return String(value || "")
    .split(",")
    .map((option) => option.trim().toUpperCase())
    .filter((option) => LETTERS.includes(option))
    .sort()
    .join(",");
}

function shuffleQuestions(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

function mapQuestionRow(q) {
  if (!q?.id) return null;

  return {
    id: q.id,
    exam: q.exam,
    subject: q.subject,
    chapter: q.chapter,
    difficulty: q.difficulty,
    topic: q.topic,
    question_type: q.question_type || "MCQ",
    text: q.question_text,
    question_image: q.question_image,
    options: [q.option_a, q.option_b, q.option_c, q.option_d],
    option_images: [
      q.option_a_image,
      q.option_b_image,
      q.option_c_image,
      q.option_d_image,
    ],
    correct: ["A", "B", "C", "D"].indexOf(q.correct_option),
    correct_value: q.correct_option,
    marks: q.marks || 4,
    negative_marks: q.negative_marks || -1,
  };
}

async function loadInstituteTest({ slug, testId, userId }) {
  const context = await getInstituteContext(slug);
  if (context.error) {
    return { errorResponse: context.error };
  }

  if (context.actor.userId !== userId) {
    return {
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: test, error: testError } = await supabaseAdmin
    .from("institute_tests")
    .select("*")
    .eq("id", testId)
    .eq("institute_id", context.institute.id)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (testError) throw testError;
  if (!test) {
    return { errorResponse: NextResponse.json({ error: "Test not found" }, { status: 404 }) };
  }

  const { data: assignments, error: assignmentError } = await supabaseAdmin
    .from("institute_test_assignments")
    .select("batch_id")
    .eq("institute_id", context.institute.id)
    .eq("institute_test_id", test.id);

  if (assignmentError) throw assignmentError;

  const assignedBatchIds = (assignments || []).map((row) => row.batch_id);
  if (!assignedBatchIds.length || !context.member?.id) {
    return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const { data: batchMember, error: batchMemberError } = await supabaseAdmin
    .from("institute_batch_members")
    .select("id")
    .eq("institute_id", context.institute.id)
    .eq("member_id", context.member.id)
    .in("batch_id", assignedBatchIds)
    .maybeSingle();

  if (batchMemberError) throw batchMemberError;
  if (!batchMember) {
    return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const { data: testQuestions, error: questionsError } = await supabaseAdmin
    .from("institute_test_questions")
    .select(`
      question_order,
      questions:question_id(
        id,
        exam,
        subject,
        chapter,
        difficulty,
        topic,
        question_type,
        question_text,
        question_image,
        option_a,
        option_b,
        option_c,
        option_d,
        option_a_image,
        option_b_image,
        option_c_image,
        option_d_image,
        correct_option,
        marks,
        negative_marks
      )
    `)
    .eq("institute_id", context.institute.id)
    .eq("institute_test_id", test.id)
    .order("question_order", { ascending: true });

  if (questionsError) throw questionsError;

  return {
    institute: context.institute,
    test,
    questions: (testQuestions || []).map((row) => mapQuestionRow(row.questions)).filter(Boolean),
  };
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

  const badgeTitle = levelStats.title;

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
    const { userId, sessionClaims } = await auth();

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
      mode = "custom",
      label = "",
      sourceType,
      instituteSlug,
      instituteTestId,
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
    const exam = String(track).toUpperCase().startsWith("NEET") ? "NEET" : "JEE Main";
    const normalizedSourceType = sourceType === "PREPZII_PRACTICE" ? sourceType : null;
    const normalizedMode = String(mode || "custom").toLowerCase();
    const normalizedLabel = String(label || "").trim().toLowerCase();
    const numericCount = Number(count);
    const numericDuration = Number(duration);
    const isDailyWarmup =
      normalizedMode === "quick" &&
      normalizedLabel === "daily warmup" &&
      numericCount <= 10 &&
      numericDuration <= 10;

    let instituteTest = null;
    let fetchedQuestions = [];
    let sessionMeta = {
      exam,
      subject,
      chapter,
      difficulty,
      duration,
    };

    if (instituteSlug && instituteTestId) {
      instituteTest = await loadInstituteTest({
        slug: instituteSlug,
        testId: instituteTestId,
        userId,
      });

      if (instituteTest.errorResponse) {
        return instituteTest.errorResponse;
      }

      fetchedQuestions = instituteTest.questions;
      sessionMeta = {
        exam: instituteTest.test.exam === "NEET" ? "NEET" : "JEE Main",
        subject: instituteTest.test.subject,
        chapter: (instituteTest.test.chapters || []).join(","),
        difficulty: instituteTest.test.difficulty,
        duration: instituteTest.test.duration_minutes,
      };
    } else {
      const access = await getUserAccessContext({ userId });

      if (normalizedMode === "custom") {
        const permission = canUseFeature(access, FEATURES.CUSTOM_TEST);

        if (!permission.allowed) {
          return NextResponse.json(
            {
              error: "CUSTOM_TEST_LIMIT_REACHED",
              message: "You’ve used your 2 free custom tests this month.",
              upgradeUrl: permission.upgradeUrl || "/pro",
              usage: permission.usage,
            },
            { status: 403 }
          );
        }
      }

      if (normalizedMode === "quick") {
        const permission = canUseFeature(access, isDailyWarmup ? FEATURES.DAILY_WARMUP : FEATURES.QUICK_TEST);

        if (!permission.allowed) {
          return NextResponse.json(
            {
              error: "PRO_REQUIRED",
              message: "Quick tests are available with PrepZii Pro. Daily Warmup stays free.",
              upgradeUrl: permission.upgradeUrl || "/pro",
            },
            { status: 403 }
          );
        }
      }

      fetchedQuestions = await getQuestions({
        exam,
        subject,
        chapter,
        difficulty,
        limit: count,
        client: supabaseAdmin,
        sourceType: normalizedSourceType,
        status: normalizedSourceType ? "PUBLISHED" : undefined,
        activeOnly: Boolean(normalizedSourceType),
        strictFilters: Boolean(normalizedSourceType),
      });
    }

    if (fetchedQuestions.length !== Number(count)) {
      return NextResponse.json(
        { error: "Not enough questions are available in the required subject ratio." },
        { status: 422 }
      );
    }

    let questions = instituteTest ? fetchedQuestions : shuffleQuestions(fetchedQuestions);

    if (!instituteTest && (exam === "JEE" || exam === "JEE Main" || exam === "NEET")) {
      const SUBJECT_ORDER = { "Physics": 1, "Chemistry": 2, "Maths": 3, "Mathematics": 3, "Biology": 3, "Botany": 3, "Zoology": 4 };
      questions.sort((a, b) => {
        const subjA = SUBJECT_ORDER[a.subject] || 99;
        const subjB = SUBJECT_ORDER[b.subject] || 99;
        if (subjA !== subjB) return subjA - subjB;

        const typeA = String(a.question_type || "MCQ").toLowerCase() === "numerical" ? 2 : 1;
        const typeB = String(b.question_type || "MCQ").toLowerCase() === "numerical" ? 2 : 1;
        return typeA - typeB;
      });
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("test_sessions")
      .insert({
        user_id: userId,
        exam: sessionMeta.exam,
        subjects: [sessionMeta.subject],
        chapters: [sessionMeta.chapter],
        difficulty: sessionMeta.difficulty,
        total_questions: questions.length,
        duration_minutes: sessionMeta.duration,
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

    if (instituteTest) {
      const { error: instituteAttemptError } = await supabaseAdmin
        .from("institute_test_attempts")
        .insert({
          institute_id: instituteTest.institute.id,
          institute_test_id: instituteTest.test.id,
          user_id: userId,
          session_id: session.id,
          status: "IN_PROGRESS",
        });

      if (instituteAttemptError) {
        throw instituteAttemptError;
      }
    }

    const safeQuestions = questions.map((question) => ({
      id: question.id,
      exam: question.exam,
      subject: question.subject,
      chapter: question.chapter,
      topic: question.topic,
      question_type: question.question_type,
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
      institute: instituteTest ? {
        slug: instituteTest.institute.slug,
        name: instituteTest.institute.name,
        testId: instituteTest.test.id,
        title: instituteTest.test.title,
      } : null,
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
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const name = getFirstNameFromClaims(sessionClaims) || "Student";

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
          question_type,
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
        question_type: row.questions?.question_type || "MCQ",
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
      const rawAnswer = answers[String(question.id)];
      const isNumerical = question.question_type === "Numerical";
      const isMultipleCorrect = question.question_type === "Multiple Correct";
      const selectedIndex = Number(rawAnswer);
      const attemptedQuestion = isNumerical
        ? rawAnswer !== undefined && String(rawAnswer).trim() !== ""
        : isMultipleCorrect
        ? Array.isArray(rawAnswer) && rawAnswer.length > 0 && rawAnswer.every(
            (index) => Number.isInteger(index) && index >= 0 && index < LETTERS.length
          )
        : Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < LETTERS.length;
      const selectedOption = !attemptedQuestion
        ? null
        : isNumerical
        ? String(rawAnswer).trim()
        : isMultipleCorrect
        ? rawAnswer.map((index) => LETTERS[index]).sort().join(",")
        : LETTERS[selectedIndex];
      const selectedNumber = Number(selectedOption);
      const correctNumber = Number(question.correct_option);
      const isCorrect = attemptedQuestion && (isNumerical
        ? (Number.isFinite(selectedNumber) && Number.isFinite(correctNumber)
          ? Math.abs(selectedNumber - correctNumber) <= 1e-9
          : selectedOption === String(question.correct_option).trim())
        : isMultipleCorrect
        ? normalizeOptionSet(selectedOption) === normalizeOptionSet(question.correct_option)
        : selectedOption === question.correct_option);
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

    const { error: instituteAttemptError } = await supabaseAdmin
      .from("institute_test_attempts")
      .update({
        attempt_id: attempt.id,
        status: "SUBMITTED",
        submitted_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .eq("user_id", userId);

    if (instituteAttemptError) {
      throw instituteAttemptError;
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
