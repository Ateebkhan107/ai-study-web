import "server-only";

import { getFormulaChaptersForSubject, getFormulaSubjectsForExam } from "@/lib/formulaCards";
import { getCanonicalChaptersForSubject, normalizeChapterName } from "@/lib/pyqChapterMapping";

const TEST_QUESTION_MIN = 5;
const TEST_QUESTION_MAX = 30;

function getStudentExam(studentContext) {
  return studentContext?.profile?.exam || studentContext?.exam || "JEE";
}

function normalizePyqSubject(subjectName) {
  const subject = String(subjectName || "").trim();
  const lower = subject.toLowerCase();
  if (["mathematics", "math", "maths"].includes(lower)) return "Maths";
  const normalized = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
  return ["Physics", "Chemistry", "Biology", "Maths"].includes(normalized)
    ? normalized
    : null;
}

function toChapterId(chapter) {
  return String(chapter || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function findCanonicalChapter(chapters, requestedChapter) {
  const requested = String(requestedChapter || "").trim();
  const canonicalRequested = normalizeChapterName(requested);
  if (!requested || !canonicalRequested) return null;

  return chapters.find((chapter) => {
    const chapterName = typeof chapter === "string" ? chapter : chapter?.name;
    if (!chapterName) return false;
    if (chapterName.toLowerCase() === requested.toLowerCase()) return true;
    const canonicalChapter = normalizeChapterName(chapterName);
    return canonicalChapter.toLowerCase() === canonicalRequested.toLowerCase() && canonicalChapter !== "";
  }) || null;
}

export async function resolveRevisionDestination({ exam, subject, chapter }) {
  const subjectName = String(subject || "").trim();
  if (!subjectName) return null;

  const subjects = await getFormulaSubjectsForExam(exam);
  const matchedSubject = subjects.find((item) => {
    const itemName = item.name.toLowerCase();
    const requested = subjectName.toLowerCase();
    return (
      itemName === requested ||
      (requested === "maths" && itemName === "mathematics") ||
      (requested === "mathematics" && itemName === "maths")
    );
  });

  if (!matchedSubject) return null;

  if (chapter) {
    const chapters = await getFormulaChaptersForSubject(matchedSubject.slug, exam);
    const matchedChapter = findCanonicalChapter(chapters, chapter);

    if (matchedChapter) {
      return {
        type: "open_revision_chapter",
        subject: matchedSubject.name,
        chapter: matchedChapter.name,
        trustedRoute: `/formula-cards/${matchedSubject.slug}/${matchedChapter.slug}`,
      };
    }
  }

  return {
    type: "open_revision_subject",
    subject: matchedSubject.name,
    trustedRoute: `/formula-cards/${matchedSubject.slug}`,
  };
}

export function resolvePyqDestination({ exam, subject, chapter }) {
  const normalizedSubject = normalizePyqSubject(subject);
  if (!normalizedSubject) return null;

  const pyqChapters = getCanonicalChaptersForSubject(normalizedSubject);
  if (!pyqChapters || pyqChapters.length === 0) return null;

  if (chapter) {
    const matchedChapter = findCanonicalChapter(pyqChapters, chapter);
    if (matchedChapter) {
      return {
        type: "open_pyq_chapter",
        subject: normalizedSubject,
        chapter: matchedChapter,
        trustedRoute: `/pyq/session?mode=chapter&exam=${encodeURIComponent(exam)}&subjects=${encodeURIComponent(normalizedSubject)}&chapter=${encodeURIComponent(matchedChapter)}`,
      };
    }
  }

  return {
    type: "open_pyq_subject",
    subject: normalizedSubject,
    trustedRoute: `/pyq/session?mode=random&exam=${encodeURIComponent(exam)}&subjects=${encodeURIComponent(normalizedSubject)}`,
  };
}

function deriveQuestionCount(step) {
  if (Number.isInteger(step.questionCount)) {
    return Math.max(TEST_QUESTION_MIN, Math.min(TEST_QUESTION_MAX, step.questionCount));
  }

  const duration = Number(step.durationMinutes) || 10;
  return Math.max(TEST_QUESTION_MIN, Math.min(TEST_QUESTION_MAX, Math.round(duration / 2)));
}

function resolvePreparedCustomTestAction({ exam, step }) {
  const normalizedSubject = normalizePyqSubject(step.subject);
  const subjects = normalizedSubject
    ? [{ id: normalizedSubject.toLowerCase(), name: normalizedSubject }]
    : [{ id: "mixed", name: "Mixed Subjects" }];

  const chapters = [];
  if (normalizedSubject && step.chapter) {
    const matchedChapter = findCanonicalChapter(
      getCanonicalChaptersForSubject(normalizedSubject) || [],
      step.chapter
    );
    if (matchedChapter) {
      chapters.push({
        id: toChapterId(matchedChapter),
        name: matchedChapter,
        subject: normalizedSubject,
      });
    }
  }

  return {
    type: "prepared_custom_test",
    questionCount: deriveQuestionCount(step),
    subjects,
    chapters,
    exam,
    source: "study_plan",
  };
}

function resolveMistakeReviewAction({ pageContext, entityContext }) {
  if (
    pageContext?.pageType !== "test" ||
    pageContext?.entity?.type !== "test_result" ||
    !pageContext.entity.id ||
    !String(entityContext || "").includes("Current completed test result")
  ) {
    return null;
  }

  return {
    type: "open_test_review",
    trustedRoute: `/test/review/${encodeURIComponent(pageContext.entity.id)}`,
  };
}

export async function resolveStudyPlanStepAction({
  step,
  studentContext,
  pageContext,
  entityContext,
}) {
  const exam = getStudentExam(studentContext);

  if (["revision", "rapid_recall", "concept_review"].includes(step.activity)) {
    if (!step.subject || step.subject === "General" || step.subject === "Mixed") return null;
    return resolveRevisionDestination({
      exam,
      subject: step.subject,
      chapter: step.chapter,
    });
  }

  if (step.activity === "pyq_practice") {
    if (!step.subject || step.subject === "General" || step.subject === "Mixed") return null;
    return resolvePyqDestination({
      exam,
      subject: step.subject,
      chapter: step.chapter,
    });
  }

  if (step.activity === "practice_test") {
    return resolvePreparedCustomTestAction({ exam, step });
  }

  if (step.activity === "mistake_review") {
    return resolveMistakeReviewAction({ pageContext, entityContext });
  }

  return null;
}

export async function attachStudyPlanStepActions({
  planAction,
  studentContext,
  pageContext,
  entityContext,
}) {
  if (planAction?.type !== "study_plan" || !planAction.plan?.steps?.length) {
    return planAction;
  }

  const steps = await Promise.all(
    planAction.plan.steps.map(async (step) => {
      const action = await resolveStudyPlanStepAction({
        step,
        studentContext,
        pageContext,
        entityContext,
      }).catch((error) => {
        console.error("[ZI_PLAN_ACTION_RESOLVE_ERROR]", {
          activity: step.activity,
          subject: step.subject,
          chapter: step.chapter,
          message: error?.message,
        });
        return null;
      });

      return action ? { ...step, action } : step;
    })
  );

  return {
    ...planAction,
    plan: {
      ...planAction.plan,
      steps,
    },
  };
}
