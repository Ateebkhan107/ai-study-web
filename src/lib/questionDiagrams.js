const NATIVE_QUESTION_DIAGRAMS = new Set([
  "JEE-MAIN-24-27JAN-S1:49",
  "JEE-MAIN-24-27JAN-S1:56",
  "JEE-MAIN-24-27JAN-S1:57",
  "JEE-MAIN-24-27JAN-S1:59",
]);

const NATIVE_QUESTION_DIAGRAM_IDS = new Map([
  ["4dafde95-dbdb-4037-9b87-7a8ffc1f543b", "JEE-MAIN-24-27JAN-S1:49"],
  ["dc467a8c-2b48-4294-89b4-6e0dfa834896", "JEE-MAIN-24-27JAN-S1:56"],
  ["d0e4e7a8-3dc6-4afa-88ed-6686e15317dd", "JEE-MAIN-24-27JAN-S1:57"],
  ["65a71688-82a3-44e5-bf50-d6f6782637b8", "JEE-MAIN-24-27JAN-S1:59"],
]);

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
