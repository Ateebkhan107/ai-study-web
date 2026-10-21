# Official PYQ retrieval and pattern analysis (Phase 2)

All executable modules in this directory are server-only. There is no new API
route, UI, question generator, migration, or test-engine integration.

**Phase 3 update:** a server-only generation/validation service now exists in
`generation.server.js`; the Phase 2 API below is preserved. There is still no
public endpoint, student UI integration, scoring change or database write. See
`docs/zi-question-generation-phase3.md` for its contract and verification limits.

**Phase 3.1 stabilization:** structured Gemini requests now classify quota
violations, preserve Retry-After, use bounded exponential backoff with jitter
only for transient failures, and suppress repeated hard-quota calls within the
process. Batches are capped at five; blind solving and auditing remain separate.
`docs/zi-phase31-verification.md` supersedes historical Phase 3 cost/attempt counts
and records the live daily-quota blocker and automated verification separately.

```js
import { analyzePYQPatterns } from "@/lib/zi/testGenerator/analysis.server";

const analysis = await analyzePYQPatterns({
  exam: "JEE Main", // explicit JEE Main, JEE Advanced, or NEET
  subject: "Physics",
  chapter: "Rotational Motion",
  // topic: "exact database topic label", // optional additional strict filter
  sampleSize: 16, // 12–20; default 16
}, { signal });
```

The future caller must authenticate, authorize, and enforce AI usage limits
before invoking this service. This phase deliberately exposes no public endpoint.
The optional `client`, `complete`, and `useCache` dependencies are internal test
controls, not accepted request fields.

## Retrieval contract

- Read `pyq_questions`, inner-joined to `pyq_exams`. Require a published parent
  paper, PUBLISHED/APPROVED paper and question status, and matching exam family
  **and** explicit exam type on both records. Never mix Main and Advanced.
- Resolve chapter aliases within the requested subject. Do not use the existing
  test loader's broad legacy chapter fallbacks. Preserve combined chapter labels
  containing commas as a single value. Unknown chapters are literal filters.
- A supplied topic is literal case-insensitive equality, with wildcard escaping;
  it never falls back to the entire chapter. Topic-only queries are supported.
  This phase has no fuzzy/semantic topic search.
- Run two queries, each limited to 60 rows: newest and oldest year windows,
  with deterministic ID ordering. **At most 120 rows are returned per retrieval**,
  including overlapping rows. This is a response/prompt bound, not a guarantee
  about database query-planner scan cost. No count-all query is issued.
- Reject incomplete/placeholder text, missing or duplicate options, invalid
  answer-key formats, unrecognized question formats, attached question/option
  images, native media blocks, and identifiable figure/layout dependencies.
- Dedupe IDs and normalized statements, then greedily diversify by paper, year,
  chapter/topic, answer format, difficulty and available worked explanations.
  Select at most the requested sample size, subject to a 60,000-character
  reference budget. Do not truncate statements/options to fit the prompt.
- Difficulty casing and known format aliases are normalized. Missing difficulty
  remains `Unknown`; answer-key-only explanations are not treated as solutions.

The status is `insufficient_references` below five usable references: Gemini is
not called, `patternSummary` is null, and `numberOfQuestionsAnalyzed` is zero.
Available IDs are still reported as retrieved evidence, not analyzed evidence.
Five to eleven references produce `limited_references` if analysis succeeds;
twelve or more produce `analyzed`. The target is 12–20, never a silent promise.

## Analysis and cache contract

Use the existing Gemini provider, configured `ZI_AI_MODEL`, and its existing
fallback model list. Each analysis has a 45-second combined deadline, at most
two provider attempts for availability failures, no implicit SDK retries, and
an 8,000-token output cap. Invalid JSON, truncated responses, schema violations,
unknown citations, missing/duplicate classifications, unsupported numerical
distractor claims and long verbatim question prose are rejected, not repaired
with fabricated data. Raw SDK errors and prompts are not logged.

Gemini receives a structural JSON-schema subset; complete Zod constraints are
enforced locally. Each reference is classified exactly once. Concepts, formulas,
structures, reasoning patterns, distractors, multi-concept combinations and
difficulty observations cite only supplied reference IDs. Concept counts,
proportions, answer-format counts, nature counts and difficulty-label counts are
computed in code, rather than trusted from model-generated totals.

Successful nonpersonal summaries are cached for 15 minutes, with 32 entries per
process. Keys include analysis version, configured model and a SHA-256 fingerprint
of scope and complete selected reference content. **References are re-retrieved
before cache lookup**, so changed/withdrawn references invalidate summaries.
Results are cloned; failures and student information are not cached. Concurrent
identical requests without caller cancellation are coalesced. This cache is an
optimization, not a distributed quota or durable store.

## Limits

Source approval does not prove scientific accuracy. The analysis explicitly
labels reasoning as inferred and difficulty as uncalibrated metadata. Combined
chapter aliases and incorrect source topic labels can affect coverage. Image
exclusion is conservative and reduces coverage. Oldest/newest windows are not
an unbiased sample and can miss intervening years. Sample frequencies must not
be represented as exam-wide probabilities or current syllabus verification.
There is no fallback to invented references or unverified syllabus content.

## Verification

Requires Node 22+; the system's default Node 20 is unsuitable for the installed
Supabase runtime. Unit tests do not load credentials or contact external services.

```sh
node --conditions=react-server --test src/lib/zi/testGenerator/*.test.mjs
node node_modules/eslint/bin/eslint.js src/lib/zi/testGenerator src/lib/zi/provider.js src/scripts/verify_zi_pyq_patterns.mjs
node --conditions=react-server --env-file=.env.local src/scripts/verify_zi_pyq_patterns.mjs
# Billable live analysis, plus same-process cache verification:
node --conditions=react-server --env-file=.env.local src/scripts/verify_zi_pyq_patterns.mjs --analyze
# Repeat just one case: 0 Main, 1 Advanced, 2 NEET, 3 nonexistent topic
node --conditions=react-server --env-file=.env.local src/scripts/verify_zi_pyq_patterns.mjs --analyze --case 2
```
