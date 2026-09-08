import "server-only";

import { FEATURES, canUseFeature, getProfileAccessProfile, getUserAccessContext, normalizeExamTrack } from "@/lib/accessControl";
import {
  FORMULA_CARD_CHAPTERS,
  FORMULA_CARD_SEED_CARDS,
  FORMULA_CARD_SUBJECTS,
} from "@/lib/formulaCards";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PYQ_STATUS_ALLOWLIST = ["PUBLISHED", "APPROVED", "NEEDS_REVIEW"];

const PYQ_ZI_SELECT = `
  id,
  exam,
  exam_type,
  year,
  subject,
  chapter,
  difficulty,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  question_type,
  correct_option,
  correct_options,
  numerical_answer,
  numerical_min,
  numerical_max,
  explanation,
  status
`;

const FORMULA_CARD_ZI_SELECT = `
  id,
  chapter_id,
  title,
  card_type,
  body,
  formulas,
  variables,
  conditions,
  table_data,
  recall_data,
  importance,
  is_active
`;

const ACTIVE_TEST_QUESTION_SELECT = `
  session_id,
  question_order,
  questions:question_id(
    id,
    exam,
    subject,
    chapter,
    topic,
    difficulty,
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
    marks,
    negative_marks
  )
`;

const TEST_RESULT_SELECT = `
  id,
  user_id,
  session_id,
  score,
  total_marks,
  correct_answers,
  wrong_answers,
  attempted,
  total_questions,
  duration_minutes,
  time_taken_seconds,
  created_at
`;

const TEST_RESULT_ANSWERS_SELECT = `
  id,
  selected_option,
  correct_option,
  is_correct,
  question_id,
  questions:question_id(
    id,
    exam,
    subject,
    chapter,
    topic,
    difficulty,
    question_type,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    explanation,
    marks,
    negative_marks
  )
`;

function cleanText(value, maxLength = 900) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function formatPercent(numerator, denominator) {
  if (!denominator) return "Unavailable";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function formatMaybeJson(value, maxLength = 700) {
  if (!value) return "";
  if (typeof value === "string") return cleanText(value, maxLength);

  try {
    return cleanText(JSON.stringify(value), maxLength);
  } catch {
    return "";
  }
}

function logEntityContextError(scope, error) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[Zi] entity context unavailable: ${scope}`, error?.message || error);
}

async function userCanAccessExam(userId, exam) {
  if (!userId || !exam) return false;

  try {
    const profile = await getProfileAccessProfile(userId);
    return normalizeExamTrack(exam) === profile.examTrack;
  } catch (error) {
    logEntityContextError("exam-access", error);
    return false;
  }
}

async function hasAttemptedPyqQuestion(userId, questionId) {
  try {
    const { data, error } = await supabaseAdmin
      .from("pyq_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .limit(1)
      .maybeSingle();

    if (error) {
      logEntityContextError("pyq-attempt", error);
      return false;
    }

    return Boolean(data?.id);
  } catch (error) {
    logEntityContextError("pyq-attempt", error);
    return false;
  }
}

function formatPyqQuestionContext(question, answerRevealed) {
  const lines = [
    "Trusted current entity context: PYQ question.",
    `Subject: ${cleanText(question.subject, 120) || "Unknown"}`,
    `Chapter: ${cleanText(question.chapter, 160) || "Unknown"}`,
  ];

  const meta = [
    cleanText(question.exam, 24),
    cleanText(question.exam_type, 48),
    cleanText(question.year, 24),
    cleanText(question.difficulty, 48),
  ].filter(Boolean);

  if (meta.length) lines.push(`Metadata: ${meta.join(" | ")}`);
  lines.push(`Question type: ${cleanText(question.question_type, 48) || "MCQ"}`);
  lines.push(`Question: ${cleanText(question.question, 1600) || "Question text is unavailable."}`);

  const options = [
    ["A", question.option_a],
    ["B", question.option_b],
    ["C", question.option_c],
    ["D", question.option_d],
  ]
    .map(([label, value]) => [label, cleanText(value, 500)])
    .filter(([, value]) => value);

  if (options.length) {
    lines.push("Options:");
    for (const [label, value] of options) {
      lines.push(`${label}. ${value}`);
    }
  }

  if (answerRevealed) {
    const answerParts = [
      cleanText(question.correct_option, 80),
      formatMaybeJson(question.correct_options, 160),
      cleanText(question.numerical_answer, 80),
    ].filter(Boolean);
    if (answerParts.length) lines.push(`Revealed answer: ${answerParts.join(", ")}`);
    if (question.numerical_min || question.numerical_max) {
      lines.push(`Accepted numerical range: ${cleanText(question.numerical_min, 80)} to ${cleanText(question.numerical_max, 80)}`);
    }
    const explanation = cleanText(question.explanation, 1200);
    if (explanation) lines.push(`Existing explanation: ${explanation}`);
  } else {
    lines.push("Answer and official explanation are not included because this question has not been revealed for this student. Give hints, concepts, and strategy without revealing the correct answer.");
  }

  return lines.filter(Boolean).join("\n");
}

async function fetchPyqQuestionContext({ userId, id }) {
  try {
    const { data: question, error } = await supabaseAdmin
      .from("pyq_questions")
      .select(PYQ_ZI_SELECT)
      .eq("id", id)
      .in("status", PYQ_STATUS_ALLOWLIST)
      .maybeSingle();

    if (error) {
      logEntityContextError("pyq-question", error);
      return "";
    }
    if (!question) return "";

    const canAccessExam = await userCanAccessExam(userId, question.exam);
    if (!canAccessExam) return "";

    const answerRevealed = await hasAttemptedPyqQuestion(userId, question.id);
    return formatPyqQuestionContext(question, answerRevealed);
  } catch (error) {
    logEntityContextError("pyq-question", error);
    return "";
  }
}

async function fetchDbFormulaCard(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from("formula_cards")
      .select(FORMULA_CARD_ZI_SELECT)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      logEntityContextError("revision-card-db", error);
      return null;
    }

    return data || null;
  } catch (error) {
    logEntityContextError("revision-card-db", error);
    return null;
  }
}

async function userCanAccessRevisionCard(userId, subject) {
  if (!userId || !subject?.exam) return false;

  try {
    const access = await getUserAccessContext({ userId, examTrack: subject.exam });
    const permission = canUseFeature(access, FEATURES.FORMULA_HANDBOOK);
    return Boolean(permission.allowed) && normalizeExamTrack(subject.exam) === access.examTrack;
  } catch (error) {
    logEntityContextError("revision-access", error);
    return false;
  }
}

async function fetchDbFormulaCardLocation(chapterId) {
  if (!chapterId) return { chapter: null, subject: null };

  try {
    const { data: chapter, error } = await supabaseAdmin
      .from("formula_chapters")
      .select("id, subject_id, title, slug, sort_order")
      .eq("id", chapterId)
      .maybeSingle();

    if (error || !chapter) {
      if (error) logEntityContextError("revision-chapter-db", error);
      return { chapter: null, subject: null };
    }

    const { data: subject, error: subjectError } = await supabaseAdmin
      .from("formula_subjects")
      .select("id, name, slug, exam, sort_order")
      .eq("id", chapter.subject_id)
      .maybeSingle();

    if (subjectError) {
      logEntityContextError("revision-subject-db", subjectError);
      return { chapter, subject: null };
    }

    return { chapter, subject: subject || null };
  } catch (error) {
    logEntityContextError("revision-location-db", error);
    return { chapter: null, subject: null };
  }
}

async function findFormulaCardLocation(card) {
  const chapter = FORMULA_CARD_CHAPTERS.find((item) => item.id === card?.chapter_id) || null;
  const subject = FORMULA_CARD_SUBJECTS.find((item) => item.id === chapter?.subject_id) || null;
  if (chapter && subject) return { chapter, subject };

  return fetchDbFormulaCardLocation(card?.chapter_id);
}

function formatRevisionCardContext(card, chapter, subject) {
  const lines = [
    "Trusted current entity context: Revision card.",
    `Subject: ${cleanText(subject?.name, 120) || "Unknown"}`,
    `Exam: ${cleanText(subject?.exam, 24) || "Unknown"}`,
    `Chapter: ${cleanText(chapter?.title, 160) || "Unknown"}`,
    `Title: ${cleanText(card.title, 180) || "Untitled card"}`,
    `Card type: ${cleanText(card.card_type, 80) || "revision"}`,
  ];

  const body = cleanText(card.body, 1200);
  if (body) lines.push(`Content: ${body}`);

  const formulas = formatMaybeJson(card.formulas, 900);
  if (formulas) lines.push(`Formulas: ${formulas}`);

  const variables = formatMaybeJson(card.variables, 700);
  if (variables) lines.push(`Variables: ${variables}`);

  const conditions = formatMaybeJson(card.conditions, 500);
  if (conditions) lines.push(`Conditions: ${conditions}`);

  const tableData = formatMaybeJson(card.table_data, 700);
  if (tableData) lines.push(`Table data: ${tableData}`);

  const recallData = formatMaybeJson(card.recall_data, 700);
  if (recallData) lines.push(`Recall data: ${recallData}`);

  return lines.filter(Boolean).join("\n");
}

async function fetchRevisionCardContext({ userId, id }) {
  const card = (await fetchDbFormulaCard(id)) ||
    FORMULA_CARD_SEED_CARDS.find((item) => item.id === id && item.is_active);

  if (!card) return "";

  const { chapter, subject } = await findFormulaCardLocation(card);
  if (!chapter || !subject) return "";

  const canAccess = await userCanAccessRevisionCard(userId, subject);
  if (!canAccess) return "";

  return formatRevisionCardContext(card, chapter, subject);
}

async function fetchActiveTestQuestionContext({ userId, id }) {
  try {
    const { data: questionLinks, error: linkError } = await supabaseAdmin
      .from("test_questions")
      .select(ACTIVE_TEST_QUESTION_SELECT)
      .eq("question_id", id)
      .order("question_order", { ascending: true })
      .limit(20);

    if (linkError) {
      logEntityContextError("test-question-link", linkError);
      return "";
    }

    const sessionIds = [...new Set((questionLinks || [])
      .map((row) => row.session_id)
      .filter(Boolean))];
    if (!sessionIds.length) return "";

    const [{ data: sessions, error: sessionError }, { data: submittedAttempts, error: attemptError }] =
      await Promise.all([
        supabaseAdmin
          .from("test_sessions")
          .select("id, user_id, exam, subjects, chapters, difficulty, total_questions, duration_minutes, status")
          .eq("user_id", userId)
          .in("id", sessionIds),
        supabaseAdmin
          .from("test_attempts")
          .select("session_id")
          .eq("user_id", userId)
          .in("session_id", sessionIds),
      ]);

    if (sessionError) {
      logEntityContextError("test-question-session", sessionError);
      return "";
    }
    if (attemptError) {
      logEntityContextError("test-question-attempt", attemptError);
      return "";
    }

    const submittedSessionIds = new Set((submittedAttempts || []).map((attempt) => String(attempt.session_id)));
    const activeSession = (sessions || []).find((session) =>
      String(session.status || "").toLowerCase() === "in_progress" &&
      !submittedSessionIds.has(String(session.id))
    );
    if (!activeSession) return "";

    const link = (questionLinks || []).find((row) => String(row.session_id) === String(activeSession.id));
    const question = link?.questions;
    if (!question?.id) return "";

    if (!(await userCanAccessExam(userId, question.exam || activeSession.exam))) {
      return "";
    }

    return formatActiveTestQuestionContext(question, activeSession, link.question_order);
  } catch (error) {
    logEntityContextError("test-question", error);
    return "";
  }
}

function formatActiveTestQuestionContext(question, session, questionOrder) {
  const lines = [
    "Trusted current entity context: Active test question.",
    "The student is currently taking a test. Help with understanding, concepts, hints, and strategy only. Do not reveal, identify, or imply the correct answer.",
    `Question number in session: ${cleanText(questionOrder, 24) || "Unknown"}`,
    `Test exam: ${cleanText(session.exam || question.exam, 80) || "Unknown"}`,
    `Subject: ${cleanText(question.subject, 120) || "Unknown"}`,
    `Chapter: ${cleanText(question.chapter, 160) || "Unknown"}`,
  ];

  const topic = cleanText(question.topic, 160);
  if (topic) lines.push(`Topic: ${topic}`);

  const meta = [
    cleanText(question.question_type, 48),
    cleanText(question.difficulty, 48),
  ].filter(Boolean);
  if (meta.length) lines.push(`Question metadata: ${meta.join(" | ")}`);

  lines.push(`Question: ${cleanText(question.question_text, 1600) || "Question text is unavailable."}`);

  const options = [
    ["A", question.option_a],
    ["B", question.option_b],
    ["C", question.option_c],
    ["D", question.option_d],
  ]
    .map(([label, value]) => [label, cleanText(value, 500)])
    .filter(([, value]) => value);

  if (options.length) {
    lines.push("Options:");
    for (const [label, value] of options) {
      lines.push(`${label}. ${value}`);
    }
  }

  const hasQuestionImage = Boolean(question.question_image);
  const hasOptionImages = [
    question.option_a_image,
    question.option_b_image,
    question.option_c_image,
    question.option_d_image,
  ].some(Boolean);
  if (hasQuestionImage || hasOptionImages) {
    lines.push("Image note: The current question has image-based content in the app, but Zi receives no image URL or visual pixels in this phase.");
  }

  lines.push("Hidden answer fields intentionally omitted: correct answer, solution, explanation, and marking key.");

  return lines.filter(Boolean).join("\n");
}

async function fetchTestResultContext({ userId, id }) {
  try {
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("test_attempts")
      .select(TEST_RESULT_SELECT)
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (attemptError) {
      logEntityContextError("test-result", attemptError);
      return "";
    }
    if (!attempt) return "";

    const [{ data: session, error: sessionError }, { data: answers, error: answersError }] =
      await Promise.all([
        attempt.session_id
          ? supabaseAdmin
            .from("test_sessions")
            .select("id, exam, subjects, chapters, difficulty, total_questions, duration_minutes, status")
            .eq("id", attempt.session_id)
            .eq("user_id", userId)
            .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabaseAdmin
          .from("user_answers")
          .select(TEST_RESULT_ANSWERS_SELECT)
          .eq("attempt_id", attempt.id)
          .limit(200),
      ]);

    if (sessionError) {
      logEntityContextError("test-result-session", sessionError);
    }
    if (answersError) {
      logEntityContextError("test-result-answers", answersError);
      return formatTestResultContext(attempt, session, []);
    }

    const exam = session?.exam || answers?.find((answer) => answer.questions?.exam)?.questions?.exam;
    if (exam && !(await userCanAccessExam(userId, exam))) {
      return "";
    }

    return formatTestResultContext(attempt, session, answers || []);
  } catch (error) {
    logEntityContextError("test-result", error);
    return "";
  }
}

function summarizeBySubject(answers) {
  const bySubject = new Map();
  for (const answer of answers) {
    const subject = cleanText(answer.questions?.subject, 80) || "Unknown";
    const entry = bySubject.get(subject) || { subject, correct: 0, incorrect: 0, skipped: 0, attempted: 0, total: 0 };
    entry.total += 1;

    if (!answer.selected_option) {
      entry.skipped += 1;
    } else {
      entry.attempted += 1;
      if (answer.is_correct) entry.correct += 1;
      else entry.incorrect += 1;
    }

    bySubject.set(subject, entry);
  }

  return [...bySubject.values()].sort((a, b) =>
    (b.incorrect + b.skipped) - (a.incorrect + a.skipped) ||
    b.total - a.total
  );
}

function summarizeByChapter(answers) {
  const byChapter = new Map();
  for (const answer of answers) {
    const chapter = cleanText(answer.questions?.chapter, 120) || "Unknown";
    const subject = cleanText(answer.questions?.subject, 80) || "Unknown";
    const key = `${subject}:${chapter}`;
    const entry = byChapter.get(key) || { subject, chapter, correct: 0, incorrect: 0, skipped: 0, total: 0 };
    entry.total += 1;

    if (!answer.selected_option) entry.skipped += 1;
    else if (answer.is_correct) entry.correct += 1;
    else entry.incorrect += 1;

    byChapter.set(key, entry);
  }

  return [...byChapter.values()]
    .filter((entry) => entry.incorrect > 0 || entry.skipped > 0)
    .sort((a, b) =>
      (b.incorrect + b.skipped) - (a.incorrect + a.skipped) ||
      b.total - a.total
    )
    .slice(0, 6);
}

function formatFocusQuestions(answers) {
  return answers
    .filter((answer) => !answer.is_correct)
    .slice(0, 6)
    .map((answer, index) => {
      const question = answer.questions || {};
      const status = answer.selected_option ? "wrong" : "skipped";
      const parts = [
        `${index + 1}. ${status.toUpperCase()}`,
        `${cleanText(question.subject, 80) || "Unknown subject"} / ${cleanText(question.chapter, 120) || "Unknown chapter"}`,
        `Question: ${cleanText(question.question_text, 420) || "Unavailable"}`,
        answer.selected_option ? `Selected: ${cleanText(answer.selected_option, 80)}` : "Selected: not attempted",
        `Correct: ${cleanText(answer.correct_option, 80) || "Unavailable"}`,
      ];

      const explanation = cleanText(question.explanation, 420);
      if (explanation) parts.push(`Explanation: ${explanation}`);

      return parts.join(" | ");
    });
}

function formatTestResultContext(attempt, session, answers) {
  const totalQuestions = Number(attempt.total_questions) || answers.length || 0;
  const attempted = Number(attempt.attempted) || answers.filter((answer) => answer.selected_option).length;
  const correct = Number(attempt.correct_answers) || 0;
  const wrong = Number(attempt.wrong_answers) || 0;
  const skipped = Math.max(0, totalQuestions - attempted);
  const timeTaken = Number(attempt.time_taken_seconds) || 0;

  const lines = [
    "Trusted current entity context: Completed test result.",
    "The test is completed. Analyze only what this result context supports, and describe patterns as from this attempt only.",
    `Test: ${cleanText(session?.exam, 80) || "Mock Test"}`,
    `Subjects: ${Array.isArray(session?.subjects) ? session.subjects.map((item) => cleanText(item, 80)).filter(Boolean).join(", ") : "Unavailable"}`,
    `Chapters: ${Array.isArray(session?.chapters) ? session.chapters.map((item) => cleanText(item, 120)).filter(Boolean).join(", ") : "Unavailable"}`,
    `Difficulty: ${cleanText(session?.difficulty, 80) || "Unavailable"}`,
    `Score: ${Number(attempt.score) || 0} / ${Number(attempt.total_marks) || 0}`,
    `Accuracy: ${formatPercent(correct, attempted)}`,
    `Correct: ${correct}`,
    `Incorrect: ${wrong}`,
    `Skipped: ${skipped}`,
    `Attempted: ${attempted} / ${totalQuestions}`,
  ];

  if (timeTaken > 0) {
    lines.push(`Time taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`);
    if (attempted > 0) {
      lines.push(`Average time per attempted question: ${Math.round(timeTaken / attempted)}s`);
    }
  } else {
    lines.push("Timing data: Unavailable.");
  }

  const subjectBreakdown = summarizeBySubject(answers);
  if (subjectBreakdown.length) {
    lines.push("Subject breakdown for this test:");
    for (const subject of subjectBreakdown) {
      lines.push(`${subject.subject}: ${subject.correct} correct, ${subject.incorrect} incorrect, ${subject.skipped} skipped, accuracy ${formatPercent(subject.correct, subject.attempted)}.`);
    }
  }

  const chapterBreakdown = summarizeByChapter(answers);
  if (chapterBreakdown.length) {
    lines.push("Areas that cost marks in this test:");
    for (const chapter of chapterBreakdown) {
      lines.push(`${chapter.subject} - ${chapter.chapter}: ${chapter.incorrect} incorrect, ${chapter.skipped} skipped.`);
    }
  }

  const focusQuestions = formatFocusQuestions(answers);
  if (focusQuestions.length) {
    lines.push("Selected wrong/skipped review items from this result:");
    lines.push(...focusQuestions);
  }

  return lines.filter(Boolean).join("\n");
}

export async function buildZiEntityContext({ userId, pageContext }) {
  const entity = pageContext?.entity;
  if (!entity?.type || !entity?.id) return "";

  if (entity.type === "pyq_question" && pageContext.pageType === "pyq") {
    return fetchPyqQuestionContext({ userId, id: entity.id });
  }

  if (entity.type === "revision_card" && pageContext.pageType === "revision") {
    return fetchRevisionCardContext({ userId, id: entity.id });
  }

  if (entity.type === "test_question" && pageContext.pageType === "test") {
    return fetchActiveTestQuestionContext({ userId, id: entity.id });
  }

  if (entity.type === "test_result" && pageContext.pageType === "test") {
    return fetchTestResultContext({ userId, id: entity.id });
  }

  return "";
}
