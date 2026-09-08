import "server-only";

export const ZI_PLAN_ACTIVITIES = [
  "revision",
  "pyq_practice",
  "practice_test",
  "mistake_review",
  "rapid_recall",
  "concept_review",
  "break",
];

const ALLOWED_SUBJECTS = new Set([
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Maths",
  "General",
  "Mixed",
]);

const PLAN_KEYS = new Set([
  "type",
  "title",
  "durationMinutes",
  "reason",
  "steps",
]);

const STEP_KEYS = new Set([
  "order",
  "activity",
  "subject",
  "chapter",
  "durationMinutes",
  "questionCount",
  "goal",
]);

const MAX_PLAN_DURATION_MINUTES = 180;
const MIN_STEP_DURATION_MINUTES = 5;
const MAX_STEPS = 6;
const MAX_TITLE_LENGTH = 90;
const MAX_REASON_LENGTH = 180;
const MAX_LABEL_LENGTH = 100;
const MAX_GOAL_LENGTH = 180;
const MIN_QUESTION_COUNT = 5;
const MAX_QUESTION_COUNT = 30;

function hasOnlyAllowedKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeSubject(subject) {
  const text = cleanText(subject, MAX_LABEL_LENGTH);
  if (!text) return null;

  const lower = text.toLowerCase();
  if (["math", "maths", "mathematics"].includes(lower)) return "Mathematics";
  if (lower === "physics") return "Physics";
  if (lower === "chemistry") return "Chemistry";
  if (lower === "biology") return "Biology";
  if (["general", "mixed"].includes(lower)) {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  return null;
}

function normalizeDuration(value) {
  const duration = Number(value);
  if (!Number.isInteger(duration)) return null;
  if (duration < MIN_STEP_DURATION_MINUTES) return null;
  if (duration > MAX_PLAN_DURATION_MINUTES) return null;
  return duration;
}

function normalizeQuestionCount(value) {
  if (value === undefined || value === null || value === "") return null;
  const count = Number(value);
  if (!Number.isInteger(count)) return null;
  if (count < MIN_QUESTION_COUNT || count > MAX_QUESTION_COUNT) return null;
  return count;
}

function inferDurationFromText(text) {
  const value = cleanText(text, 500).toLowerCase();
  if (!value) return null;

  const numericMatch = value.match(/\b(\d{1,4})\s*(m|min|mins|minute|minutes)\b/);
  if (numericMatch) return Math.min(Number(numericMatch[1]), MAX_PLAN_DURATION_MINUTES + 1);

  const hourMatch = value.match(/\b(\d{1,2})\s*(h|hr|hrs|hour|hours)\b/);
  if (hourMatch) return Math.min(Number(hourMatch[1]) * 60, MAX_PLAN_DURATION_MINUTES + 1);

  if (/\b(quick|short|before class)\b/.test(value)) return 20;
  if (/\btonight\b/.test(value)) return 90;

  return null;
}

export function inferRequestedPlanDuration(messages) {
  const latestUserMessage = [...(messages || [])]
    .reverse()
    .find((message) => message?.role === "user" && message?.content);

  return inferDurationFromText(latestUserMessage?.content);
}

export function validateZiStudyPlanAction(actionObj, options = {}) {
  if (!actionObj || typeof actionObj !== "object" || Array.isArray(actionObj)) {
    return null;
  }
  if (actionObj.type !== "study_plan") return null;

  const plan = actionObj.plan && typeof actionObj.plan === "object"
    ? actionObj.plan
    : actionObj;

  if (!plan || Array.isArray(plan) || !hasOnlyAllowedKeys(plan, PLAN_KEYS)) {
    return null;
  }

  const durationMinutes = normalizeDuration(plan.durationMinutes);
  const title = cleanText(plan.title, MAX_TITLE_LENGTH);
  const reason = cleanText(plan.reason, MAX_REASON_LENGTH);
  if (!durationMinutes || !title || !reason || !Array.isArray(plan.steps)) {
    return null;
  }
  if (plan.steps.length < 1 || plan.steps.length > MAX_STEPS) return null;

  const steps = [];
  for (const rawStep of plan.steps) {
    if (!rawStep || typeof rawStep !== "object" || Array.isArray(rawStep)) return null;
    if (!hasOnlyAllowedKeys(rawStep, STEP_KEYS)) return null;

    const activity = ZI_PLAN_ACTIVITIES.includes(rawStep.activity)
      ? rawStep.activity
      : null;
    const stepDuration = normalizeDuration(rawStep.durationMinutes);
    const goal = cleanText(rawStep.goal, MAX_GOAL_LENGTH);
    const subject = normalizeSubject(rawStep.subject) || "General";
    const chapter = cleanText(rawStep.chapter, MAX_LABEL_LENGTH) || null;
    const questionCount = normalizeQuestionCount(rawStep.questionCount);

    if (!activity || !stepDuration || !goal) return null;
    if (!ALLOWED_SUBJECTS.has(subject)) return null;
    if (rawStep.questionCount !== undefined && questionCount === null) return null;

    const step = {
      order: steps.length + 1,
      activity,
      subject,
      chapter,
      durationMinutes: stepDuration,
      goal,
    };
    if (questionCount) step.questionCount = questionCount;

    steps.push(step);
  }

  const stepTotal = steps.reduce((total, step) => total + step.durationMinutes, 0);
  if (stepTotal > MAX_PLAN_DURATION_MINUTES) return null;
  if (Math.abs(stepTotal - durationMinutes) > 5) return null;

  const requestedDuration = options.requestedDurationMinutes;
  if (requestedDuration && requestedDuration > MAX_PLAN_DURATION_MINUTES) return null;
  if (
    requestedDuration &&
    stepTotal > requestedDuration + 5
  ) {
    return null;
  }

  return {
    type: "study_plan",
    plan: {
      type: "study_plan",
      title,
      durationMinutes: stepTotal,
      reason,
      steps,
    },
  };
}
