import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { allocateQuestionCounts, normalizeSubjectName } from "@/lib/questionDistribution";
import { getChapterTargets, getSubjectTargets } from "@/lib/pyqChapterMapping";
import { FEATURES, canUseFeature, getProfileAccessProfile, getUserAccessContext, normalizeExamTrack } from "@/lib/accessControl";

const PYQ_SESSION_SELECT = `
  id,
  exam_id,
  exam,
  exam_type,
  year,
  attempt,
  shift,
  paper_code,
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
  correct_option,
  explanation,
  explanation_image,
  question_type,
  correct_options,
  numerical_answer,
  numerical_min,
  numerical_max,
  question_number,
  display_order,
  marks_positive,
  marks_negative,
  created_at,
  status
`;

const REVEAL_FIELDS = [
  "correct_option",
  "explanation",
  "explanation_image",
  "correct_options",
  "numerical_answer",
  "numerical_min",
  "numerical_max",
];

const ATTEMPT_LOOKUP_CHUNK_SIZE = 100;
const FULL_PAPER_CONFIG = {
  JEE: { total: 75, subjects: ["Physics", "Chemistry", "Maths"] },
  NEET: { total: 180, subjects: ["Physics", "Chemistry", "Biology"] },
};

function sanitizeQuestion(question, attemptedQuestionIds) {
  if (attemptedQuestionIds.has(String(question.id))) {
    return {
      ...question,
      answer_revealed: true,
    };
  }

  const sanitized = {
    ...question,
    answer_revealed: false,
  };

  for (const field of REVEAL_FIELDS) {
    sanitized[field] = null;
  }

  return sanitized;
}

async function getAttemptedQuestionIds(userId, questionIds) {
  if (!userId || questionIds.length === 0) {
    return new Set();
  }

  const attemptedQuestionIds = new Set();
  const uniqueQuestionIds = [...new Set(questionIds.filter(Boolean).map(String))];

  for (let index = 0; index < uniqueQuestionIds.length; index += ATTEMPT_LOOKUP_CHUNK_SIZE) {
    const chunk = uniqueQuestionIds.slice(index, index + ATTEMPT_LOOKUP_CHUNK_SIZE);
    const { data, error } = await supabaseAdmin
      .from("pyq_attempts")
      .select("question_id")
      .eq("user_id", userId)
      .in("question_id", chunk);

    if (error) {
      throw error;
    }

    for (const attempt of data || []) {
      attemptedQuestionIds.add(String(attempt.question_id));
    }
  }

  return attemptedQuestionIds;
}

function shuffleQuestions(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

function sortByDisplayOrder(a, b) {
  const displayA = Number.isFinite(Number(a.display_order)) ? Number(a.display_order) : Number(a.question_number);
  const displayB = Number.isFinite(Number(b.display_order)) ? Number(b.display_order) : Number(b.question_number);
  if (displayA !== displayB) return displayA - displayB;

  const numberA = Number(a.question_number) || 0;
  const numberB = Number(b.question_number) || 0;
  if (numberA !== numberB) return numberA - numberB;

  return new Date(a.created_at) - new Date(b.created_at);
}

function buildBalancedPaper(questions, exam, shuffle = true) {
  const config = FULL_PAPER_CONFIG[exam];
  if (!config) return [];
  const targetCounts = allocateQuestionCounts(exam, config.total, config.subjects);
  const papers = new Map();

  for (const question of questions) {
    if (!config.subjects.includes(question.subject) || !question.exam_id) continue;

    if (!papers.has(question.exam_id)) {
      papers.set(question.exam_id, {
        subjects: new Map(config.subjects.map((subjectName) => [subjectName, []])),
      });
    }

    papers.get(question.exam_id).subjects.get(question.subject).push(question);
  }

  const completePapers = [...papers.entries()].filter(([, paper]) =>
    config.subjects.every(
      (subjectName) => (paper.subjects.get(subjectName) || []).length >= targetCounts[normalizeSubjectName(subjectName)]
    )
  );

  if (completePapers.length === 0) {
    return [];
  }

  const [, selectedPaper] = shuffle
    ? completePapers[Math.floor(Math.random() * completePapers.length)]
    : completePapers[0];

  return config.subjects.flatMap((subjectName) =>
    (shuffle ? shuffleQuestions(selectedPaper.subjects.get(subjectName) || []) : selectedPaper.subjects.get(subjectName) || [])
      .slice(0, targetCounts[normalizeSubjectName(subjectName)])
      .sort(sortByDisplayOrder)
  );
}

async function getBalancedRandomPaperQuestions({ exam, year }) {
  const config = FULL_PAPER_CONFIG[exam];
  if (!config) return [];
  let papersQuery = supabaseAdmin
    .from("pyq_exams")
    .select("id")
    .eq("exam", exam)
    .eq("is_published", true);

  if (year) {
    const years = year.split(",").map((value) => Number(value.trim())).filter(Boolean);
    papersQuery = years.length > 1 ? papersQuery.in("year", years) : papersQuery.eq("year", Number(year));
  }

  const { data: papers, error: papersError } = await papersQuery;

  if (papersError) {
    throw papersError;
  }

  for (const paper of shuffleQuestions(papers || [])) {
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("pyq_questions")
      .select(PYQ_SESSION_SELECT)
      .eq("exam_id", paper.id)
      .in("subject", config.subjects)
      .in("status", ["PUBLISHED", "APPROVED", "NEEDS_REVIEW"]);

    if (questionsError) {
      throw questionsError;
    }

    const randomPaper = buildBalancedPaper(questions || [], exam, true);
    if (randomPaper.length === config.total) {
      return randomPaper;
    }
  }

  return [];
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const { userId } = await auth();

  const exam = searchParams.get("exam");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");
  const chapter = searchParams.get("chapter");
  const mode = searchParams.get("mode") || "full";

  const examType = searchParams.get("exam_type");
  const attempt = searchParams.get("attempt");
  const shift = searchParams.get("shift");
  const paperCode = searchParams.get("paper_code");
  const examId = searchParams.get("exam_id");

  if (userId && exam) {
    const profile = await getProfileAccessProfile(userId);
    if (normalizeExamTrack(exam) !== profile.examTrack) {
      return NextResponse.json(
        { error: "EXAM_TRACK_MISMATCH", message: `Your account has access to ${profile.examTrack} content only.` },
        { status: 403 }
      );
    }
  }

  if (mode === "chapter" || mode === "mistakes") {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getUserAccessContext({ userId, examTrack: exam });
    const feature = mode === "chapter" ? FEATURES.PYQ_CHAPTER : FEATURES.PYQ_MISTAKES;
    const permission = canUseFeature(access, feature);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: "PRO_REQUIRED",
          message: mode === "chapter"
            ? "Chapter Wise PYQ is available with PrepZii Pro."
            : "Mistakes redo is available with PrepZii Pro.",
          upgradeUrl: permission.upgradeUrl || "/pro",
        },
        { status: 403 }
      );
    }
  }

  if (mode === "mistakes") {
    if (!userId) return NextResponse.json([]);

    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("pyq_attempts")
      .select("question_id")
      .eq("user_id", userId)
      .eq("is_correct", false);

    if (attemptsError) {
      console.error("PYQ MISTAKES QUERY ERROR:", attemptsError.message);
      return NextResponse.json({ error: "Failed to load mistake questions" }, { status: 500 });
    }

    const questionIds = [...new Set((attempts || []).map((a) => a.question_id))];

    if (questionIds.length === 0) return NextResponse.json([]);

    let mistakeQuery = supabaseAdmin
      .from("pyq_questions")
      .select(PYQ_SESSION_SELECT)
      .in("status", ["PUBLISHED", "APPROVED", "NEEDS_REVIEW"])
      .not("exam_id", "is", null)
      .in("id", questionIds);

    if (exam) mistakeQuery = mistakeQuery.eq("exam", exam);
    if (examType) mistakeQuery = mistakeQuery.eq("exam_type", examType);
    if (subject) {
      const subjectTargets = subject.split(",").flatMap((value) => getSubjectTargets(value.trim())).filter(Boolean);
      mistakeQuery = subjectTargets.length > 1 ? mistakeQuery.in("subject", subjectTargets) : mistakeQuery.eq("subject", subjectTargets[0]);
    }
    if (year) mistakeQuery = mistakeQuery.eq("year", year);
    if (attempt) mistakeQuery = mistakeQuery.eq("attempt", attempt);
    if (shift) mistakeQuery = mistakeQuery.eq("shift", shift);
    if (paperCode) mistakeQuery = mistakeQuery.eq("paper_code", paperCode);
    if (examId) mistakeQuery = mistakeQuery.eq("exam_id", examId);

    const { data: mistakeQuestions, error: questionsError } = await mistakeQuery;

    if (questionsError) {
      console.error("PYQ MISTAKES QUERY ERROR:", questionsError.message);
      return NextResponse.json({ error: "Failed to load mistake questions" }, { status: 500 });
    }

    const attemptedQuestionIds = new Set(questionIds.map(String));
    return NextResponse.json(
      (mistakeQuestions || []).map((question) => sanitizeQuestion(question, attemptedQuestionIds))
    );
  }

  let result = [];

  if (mode === "random" && FULL_PAPER_CONFIG[exam] && !subject && !examId) {
    try {
      result = await getBalancedRandomPaperQuestions({ exam, year });
    } catch (randomPaperError) {
      console.error("BALANCED RANDOM PYQ QUERY ERROR:", randomPaperError.message);
      return NextResponse.json({ error: "Failed to load PYQ questions" }, { status: 500 });
    }
  } else {
    let query = supabaseAdmin
      .from("pyq_questions")
      .select(PYQ_SESSION_SELECT)
      .in("status", ["PUBLISHED", "APPROVED", "NEEDS_REVIEW"])
      .not("exam_id", "is", null);

    if (examId) query = query.eq("exam_id", examId);
    if (exam) query = query.eq("exam", exam);
    if (subject) {
      const subjectTargets = subject.split(",").flatMap((value) => getSubjectTargets(value.trim())).filter(Boolean);
      query = subjectTargets.length > 1 ? query.in("subject", subjectTargets) : query.eq("subject", subjectTargets[0]);
    }
    if (year) {
      const years = year.split(",").map((value) => value.trim()).filter(Boolean);
      query = years.length > 1 ? query.in("year", years) : query.eq("year", year);
    }

    if (mode === "chapter") {
      // Chapter Wise mode: ONLY filter by chapter (plus exam/subject/year already added above).
      // Do NOT filter by exam_type, attempt, shift, or paper_code.
      if (chapter) {
        const chaptersArray = [
          ...new Set(chapter.split(",").flatMap((c) => getChapterTargets(c.trim())).filter(Boolean)),
        ];
        query = query.in("chapter", chaptersArray);
      }
    } else {
      // Full paper or random mode: apply all paper metadata filters
      if (examType) query = query.eq("exam_type", examType);
      if (attempt) query = query.eq("attempt", attempt);
      if (shift) query = query.eq("shift", shift);
      if (paperCode) query = query.eq("paper_code", paperCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error("PYQ QUERY ERROR:", error.message);
      return NextResponse.json({ error: "Failed to load PYQ questions" }, { status: 500 });
    }

    result = data || [];
    if (mode === "full" && !subject && FULL_PAPER_CONFIG[exam]) {
      result = buildBalancedPaper(result, exam, false);
    }
    result = mode === "random" ? shuffleQuestions(result) : [...result].sort(sortByDisplayOrder);
  }

  try {
    const attemptedQuestionIds = await getAttemptedQuestionIds(
      userId,
      result.map((question) => question.id)
    );

    return NextResponse.json(
      result.map((question) => sanitizeQuestion(question, attemptedQuestionIds))
    );
  } catch (attemptsError) {
    console.error("PYQ ATTEMPTS LOOKUP ERROR:", {
      message: attemptsError.message,
      code: attemptsError.code,
      details: attemptsError.details,
      hint: attemptsError.hint,
    });
    return NextResponse.json(result.map((question) => sanitizeQuestion(question, new Set())));
  }
}
