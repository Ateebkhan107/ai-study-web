const PLACEHOLDER_PATTERNS = [
  /refer to the source image/i,
  /refer to the question image/i,
];

const STUDENT_TEXT_STATUSES = new Set(["APPROVED", "PUBLISHED"]);

export function hasStructuredQuestionText(questionText) {
  const text = String(questionText || "").trim();
  if (!text) return false;

  return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text));
}

export function canShowStructuredQuestionText(question) {
  return hasStructuredQuestionText(question?.question) && STUDENT_TEXT_STATUSES.has(String(question?.status || "").toUpperCase());
}

export function shouldShowQuestionImageFallback(question) {
  return Boolean(question?.question_image) && !canShowStructuredQuestionText(question);
}

export function shouldShowRequiredQuestionImage(question) {
  return Boolean(question?.question_image) && canShowStructuredQuestionText(question);
}
