import "server-only";

function normalized(text, maskNumbers = false) {
  let value = String(text).normalize("NFKC").toLowerCase().replace(/\\(?:mathrm|text|left|right|,|;|!)/g, " ");
  if (maskNumbers) value = value.replace(/[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?/g, " number ");
  return value.replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function shingles(text, width = 3) {
  const tokens = text.split(" ");
  return new Set(tokens.slice(0, Math.max(0, tokens.length - width + 1)).map((_, i) => tokens.slice(i, i + width).join(" ")));
}
function similarity(a, b) {
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((v) => b.has(v)).length;
  return 2 * intersection / (a.size + b.size);
}

export function checkQuestionOriginality(question, comparisonQuestions) {
  const statement = normalized(question.statement);
  const masked = normalized(question.statement, true);
  for (const other of comparisonQuestions) {
    if (statement === normalized(other.statement)) return { passed: false, code: "EXACT_DUPLICATE", comparisonId: other.id };
    const otherMasked = normalized(other.statement, true);
    if (masked === otherMasked) return { passed: false, code: "NUMERICAL_REWRITE", comparisonId: other.id };
    const score = similarity(shingles(masked), shingles(otherMasked));
    const wordsA = new Set(masked.split(" "));
    const wordsB = new Set(otherMasked.split(" "));
    if (score >= 0.72 || similarity(wordsA, wordsB) >= 0.88) return { passed: false, code: "NEAR_DUPLICATE", comparisonId: other.id };
  }
  return { passed: true, code: null };
}
