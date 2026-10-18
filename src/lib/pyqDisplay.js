import { hasNativeQuestionDiagram } from "@/lib/questionDiagrams";

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
  return Boolean(question?.question_image) && !hasNativeQuestionDiagram(question) && !canShowStructuredQuestionText(question);
}

export function shouldShowRequiredQuestionImage(question) {
  return Boolean(question?.question_image) && !hasNativeQuestionDiagram(question) && canShowStructuredQuestionText(question);
}

const MONTH_ORDER_MAP = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

export function getAttemptMonthNumber(label) {
  if (!label) return 999;
  const match = String(label)
    .toLowerCase()
    .match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/);
  return match && MONTH_ORDER_MAP[match[1]] ? MONTH_ORDER_MAP[match[1]] : 999;
}

export function getAttemptSessionNumber(label) {
  if (!label) return 999;
  const match = String(label).toLowerCase().match(/\b(?:session|attempt|phase|paper)\s*(\d+)\b/);
  if (match) return Number(match[1]);
  const romanMatch = String(label).toLowerCase().match(/\b(?:session|attempt|phase|paper)\s*(i{1,3}|iv|v|vi{0,3})\b/);
  if (romanMatch) {
    const roman = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };
    return roman[romanMatch[1]] || 999;
  }
  return 999;
}

export function compareAttemptLabels(aLabel, bLabel, aDate, bDate) {
  const strA = String(aLabel || "");
  const strB = String(bLabel || "");
  if (strA === strB) return 0;

  const aMonth = getAttemptMonthNumber(strA);
  const bMonth = getAttemptMonthNumber(strB);
  if (aMonth !== bMonth) {
    if (aMonth !== 999 && bMonth !== 999) return aMonth - bMonth;
    if (aMonth !== 999) return -1;
    if (bMonth !== 999) return 1;
  }

  const aSession = getAttemptSessionNumber(strA);
  const bSession = getAttemptSessionNumber(strB);
  if (aSession !== bSession) {
    if (aSession !== 999 && bSession !== 999) return aSession - bSession;
    if (aSession !== 999) return -1;
    if (bSession !== 999) return 1;
  }

  if (aDate && bDate && aDate !== bDate) {
    return String(aDate).localeCompare(String(bDate), undefined, { numeric: true });
  }

  return strA.localeCompare(strB, undefined, { numeric: true });
}

