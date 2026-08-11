const PACKAGE_STATUSES = ["NEEDS_REVIEW", "APPROVED", "PUBLISHED", "REJECTED"];
const REVIEW_STATUSES = new Set(["NEEDS_REVIEW", "REJECTED"]);
const PUBLISHED_STATUSES = new Set(["PUBLISHED"]);
const IMAGE_FIELDS = [
  "question_image",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "explanation_image",
];

export function normalizeStatus(status) {
  return PACKAGE_STATUSES.includes(status) ? status : "NEEDS_REVIEW";
}

export function paperKeyFromExam(exam) {
  return [
    exam.paper_code || "",
    exam.exam_id || exam.id || "",
    exam.exam || "",
    exam.exam_type || "",
    exam.year || "",
    exam.attempt || "",
    exam.shift || "",
    exam.exam_date || "",
  ].join("|");
}

export function paperKeyFromQuestion(question) {
  return [
    question.paper_code || "",
    question.exam_id || "",
    question.exam || "",
    question.exam_type || "",
    question.year || "",
    question.attempt || "",
    question.shift || "",
    question.exam_date || "",
  ].join("|");
}

export function buildPackageName(paper) {
  const examType = paper.exam_type || paper.exam || "PYQ";
  const rawAttempt = String(paper.attempt || "").trim();
  const attempt = rawAttempt.toLowerCase().startsWith(examType.toLowerCase())
    ? rawAttempt.slice(examType.length).trim()
    : rawAttempt;

  return [
    examType,
    paper.year,
    attempt,
    paper.shift,
  ].filter(Boolean).join(" ");
}

export function deriveImageMode(question) {
  const text = String(question.question || "").trim();
  const hasStructuredText = text && !/refer to (the )?(source|question) image/i.test(text);
  if (hasStructuredText && question.question_image) return "TEXT_WITH_REQUIRED_IMAGE";
  if (hasStructuredText) return "TEXT_ONLY";
  return question.question_image ? "IMAGE_ONLY" : "TEXT_ONLY";
}

export function summarizePackage(packageRow, questions = [], paper = null) {
  const reviewedCount = questions.filter((q) => !REVIEW_STATUSES.has(String(q.status || "").toUpperCase())).length;
  const needsReviewCount = questions.filter((q) => REVIEW_STATUSES.has(String(q.status || "").toUpperCase())).length;
  const publishedCount = questions.filter((q) => PUBLISHED_STATUSES.has(String(q.status || "").toUpperCase())).length;
  const imageOnlyCount = questions.filter((q) => deriveImageMode(q) === "IMAGE_ONLY").length;
  const textRequiredImageCount = questions.filter((q) => deriveImageMode(q) === "TEXT_WITH_REQUIRED_IMAGE").length;
  const textOnlyCount = questions.filter((q) => deriveImageMode(q) === "TEXT_ONLY").length;
  const imageReferenceCount = questions.reduce((total, q) => (
    total + IMAGE_FIELDS.filter((field) => Boolean(q[field])).length
  ), 0);

  return {
    ...packageRow,
    exam: paper?.exam || questions[0]?.exam || null,
    exam_type: paper?.exam_type || questions[0]?.exam_type || null,
    year: paper?.year || questions[0]?.year || null,
    attempt: paper?.attempt || questions[0]?.attempt || null,
    exam_date: paper?.exam_date || questions[0]?.exam_date || null,
    shift: paper?.shift || questions[0]?.shift || null,
    paper_code: paper?.paper_code || questions[0]?.paper_code || null,
    total_questions: questions.length,
    reviewed_count: reviewedCount,
    needs_review_count: needsReviewCount,
    published_count: publishedCount,
    image_only_count: imageOnlyCount,
    text_required_image_count: textRequiredImageCount,
    text_only_count: textOnlyCount,
    image_reference_count: imageReferenceCount,
  };
}

export async function fetchAllRows(supabase, table, select, buildQuery = (query) => query) {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const query = buildQuery(supabase.from(table).select(select).range(from, to));
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}
