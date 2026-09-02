const NATIVE_QUESTION_DIAGRAMS = new Set([]);

const NATIVE_QUESTION_DIAGRAM_IDS = new Map([]);

function normalizePaperCode(question) {
  const explicitCode = question?.paper_code || question?.paperCode;
  if (explicitCode) return String(explicitCode);

  const isJeeMain2024 =
    (question?.exam === "JEE" || question?.exam === "JEE Main") &&
    Number(question?.year) === 2024 &&
    String(question?.attempt || "").toLowerCase().includes("27") &&
    String(question?.shift || "").toLowerCase().includes("1");

  return isJeeMain2024 ? "JEE-MAIN-24-27JAN-S1" : null;
}

function normalizeQuestionNumber(question) {
  const explicitNumber =
    question?.question_number ??
    question?.questionNumber ??
    question?.display_order ??
    question?.displayOrder ??
    question?.number;

  if (explicitNumber !== undefined && explicitNumber !== null && explicitNumber !== "") {
    return Number(explicitNumber);
  }

  const match = String(question?.question || "").match(/^\s*Question\s+(\d+)\s*:/i);
  return match ? Number(match[1]) : null;
}

export function getQuestionDiagramKey(question) {
  const idKey = NATIVE_QUESTION_DIAGRAM_IDS.get(String(question?.id || ""));
  if (idKey) return idKey;

  const paperCode = normalizePaperCode(question);
  const questionNumber = normalizeQuestionNumber(question);
  if (!paperCode || !questionNumber) return null;

  const key = `${paperCode}:${questionNumber}`;
  return NATIVE_QUESTION_DIAGRAMS.has(key) ? key : null;
}

export function hasNativeQuestionDiagram(question) {
  return Boolean(getQuestionDiagramKey(question));
}
