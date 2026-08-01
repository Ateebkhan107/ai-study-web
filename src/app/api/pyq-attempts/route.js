import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLevelFromXP } from "@/utils/levelEngine";

function normalizeSelectedOption(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim().toUpperCase()).sort().join(",");
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().toUpperCase();
}

function evaluateAttempt(question, selectedOption) {
  const type = question.question_type || "MCQ";

  if (!selectedOption) {
    return false;
  }

  if (type === "MCQ") {
    return String(question.correct_option).toLowerCase() === String(selectedOption).toLowerCase();
  }

  if (type === "MULTIPLE_CORRECT") {
    if (!Array.isArray(question.correct_options)) {
      return false;
    }

    const selectedSorted = String(selectedOption)
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
      .sort()
      .join(",");
    const correctSorted = [...question.correct_options]
      .map((value) => String(value).trim().toLowerCase())
      .sort()
      .join(",");

    return selectedSorted === correctSorted;
  }

  if (type === "NUMERICAL") {
    const numericValue = Number(selectedOption);

    if (Number.isNaN(numericValue)) {
      return false;
    }

    if (Array.isArray(question.correct_options) && question.correct_options.length > 0) {
      return question.correct_options.some((answer) => numericValue === Number(answer));
    }

    if (
      question.numerical_min !== null &&
      question.numerical_min !== undefined &&
      question.numerical_max !== null &&
      question.numerical_max !== undefined
    ) {
      return numericValue >= Number(question.numerical_min) && numericValue <= Number(question.numerical_max);
    }

    return numericValue === Number(question.numerical_answer);
  }

  return false;
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

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    const name = user?.firstName || user?.username || "Student";
    const body = await req.json();

    const rawAttempts = Array.isArray(body.attempts)
      ? body.attempts
      : [
          {
            question_id: body.question_id,
            selected_option: body.selected_option,
            chapter: body.chapter,
            subject: body.subject,
            exam: body.exam,
          },
        ];

    const attemptsToProcess = rawAttempts
      .filter((attempt) => attempt?.question_id)
      .map((attempt) => ({
        question_id: attempt.question_id,
        selected_option: normalizeSelectedOption(attempt.selected_option),
        chapter: attempt.chapter,
        subject: attempt.subject,
        exam: attempt.exam,
      }));

    if (attemptsToProcess.length === 0) {
      return NextResponse.json({ error: "No attempts provided" }, { status: 400 });
    }

    const questionIds = attemptsToProcess.map((attempt) => attempt.question_id);
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("pyq_questions")
      .select(`
        id,
        question_type,
        correct_option,
        correct_options,
        numerical_answer,
        numerical_min,
        numerical_max,
        explanation,
        explanation_image
      `)
      .in("id", questionIds);

    if (questionsError) {
      throw questionsError;
    }

    const questionMap = new Map((questions || []).map((question) => [question.id, question]));
    const resolvedAttempts = attemptsToProcess
      .map((attempt) => {
        const question = questionMap.get(attempt.question_id);

        if (!question) {
          return null;
        }

        return {
          ...attempt,
          is_correct: evaluateAttempt(question, attempt.selected_option),
          reveal: {
            correct_option: question.correct_option,
            correct_options: question.correct_options,
            numerical_answer: question.numerical_answer,
            numerical_min: question.numerical_min,
            numerical_max: question.numerical_max,
            explanation: question.explanation,
            explanation_image: question.explanation_image,
          },
        };
      })
      .filter(Boolean);

    if (resolvedAttempts.length === 0) {
      return NextResponse.json({ error: "No matching questions found" }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from("pyq_attempts").insert(
      resolvedAttempts.map((attempt) => ({
        user_id: userId,
        question_id: attempt.question_id,
        selected_option: attempt.selected_option,
        is_correct: attempt.is_correct,
      }))
    );

    if (insertError) {
      throw insertError;
    }

    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("pyq_attempts")
      .select("*")
      .eq("user_id", userId);

    if (attemptsError) {
      throw attemptsError;
    }

    const solved = attempts.length;
    const correct = attempts.filter((attempt) => attempt.is_correct).length;
    const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : 0;
    const attemptXP = resolvedAttempts.reduce(
      (total, attempt) => total + (attempt.is_correct ? 10 : 2),
      0
    );

    const xpResult = await addXpWithAdmin(userId, attemptXP, name, {
      pyq_solved: solved,
      correct_answers: correct,
      accuracy,
    });

    return NextResponse.json({
      success: true,
      xp: xpResult?.xp || attemptXP,
      results: resolvedAttempts.map((attempt) => ({
        question_id: attempt.question_id,
        selected_option: attempt.selected_option,
        is_correct: attempt.is_correct,
        ...attempt.reveal,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}
