# Zi question generation and validation — Phase 3

## Scope and files

Server-only JEE Main/NEET single-correct MCQs; 5–30 requested questions; Easy,
Medium, Hard or Mixed. No public endpoint, UI, authentication, test-engine,
scoring, analytics, migration, official-PYQ write or student-table write.

New files under `src/lib/zi/testGenerator/`:

- `generation.server.js`: bounded orchestration, partial results and safe errors.
- `generationContext.server.js`: server-issued immutable Phase 2 context.
- `questionSchema.server.js`: strict configuration, question, blind-solve and audit schemas.
- `questionPrompts.server.js`: private generation/verification instructions.
- `questionValidation.server.js`: structure, scope, rendering and acceptance gates.
- `originality.server.js`: normalized exact, number-masked and near-duplicate checks.
- `numericalValidation.server.js`: fixed formula catalog, SI units and input binding.
- `questionSerializers.server.js`: separate student and internal allowlists.
- `generation.test.mjs`: deterministic mocked generation and validation tests.

Modified `src/lib/zi/provider.js`: reuse its structured Gemini implementation for
question tasks, retaining the configured primary model, existing availability
fallback, tutor stream and exact Phase 2 return contract. Question calls additionally
return token/request metadata. Updated the directory README. No new dependencies.

New CLI: `src/scripts/verify_zi_question_generation.mjs`.
Local review artifacts: `docs/zi-phase3-live-review.md` (historical first-run
questions and solutions) and `docs/zi-phase3-live-review-final.md` (later quota-blocked
verification). These are private local review artifacts, not student persistence.

## Internal API

```js
import { prepareQuestionGenerationContext } from "@/lib/zi/testGenerator/generationContext.server";
import { generateAIQuestions } from "@/lib/zi/testGenerator/generation.server";
import { serializeStudentGeneration } from "@/lib/zi/testGenerator/questionSerializers.server";

const configuration = {
  exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion",
  difficulty: "Medium", questionCount: 5,
};
const context = await prepareQuestionGenerationContext(configuration, { signal });
const internalResult = await generateAIQuestions(configuration, { context, signal });
const studentSafeResult = serializeStudentGeneration(internalResult);
```

`generateAIQuestions` prepares context itself if none is supplied. A supplied
context must be the original immutable object issued by the preparation service
for the same configuration; arbitrary/serialized browser analysis objects are
rejected. Internal dependency injection is for tests and trusted CLI tooling only.
Future public callers must enforce authentication, authorization and quotas;
this phase deliberately creates no such caller.

Preparation reuses Phase 2 analysis, then makes one additional bounded retrieval
to obtain originals and check the reference fingerprint, IDs, scope and count
against the analysis. This costs four bounded read queries for an analyzable
context (up to 240 returned rows including overlaps), or two for insufficient
references. It does not read the entire bank or silently broaden the exam/topic.
Successful Phase 2 summary caching still applies.

## Validation pipeline

1. Generate at most three candidates from the compact pattern summary, not raw
   database records. The server assigns temporary UUIDs. Validate strict Zod
   fields, four options, one zero-based answer index, explanations, metadata,
   aliases, difficulty and explicit Markdown/KaTeX. Reject unsafe/invalid notation,
   placeholders, controls, duplicate options and explicit answer contradictions.
2. Compare against all retrieved reference statements and every previously
   proposed structurally valid candidate in this run, including rejected ones.
   Exact, numeric-substitution and high-overlap variants fail before further AI calls.
3. Independently solve the public statement/options **without** the generator's
   answer, explanation, concepts, formulas or validation reasoning. Require one
   matching answer, sufficient information, scientific soundness and no uncertainty.
4. For arithmetic, recompute a supported fixed physical model. Every numeric input
   must match an exact numeric/unit substring of the question, with compatible SI
   dimensions. Geometry also needs literal evidence. Check all option values,
   units and uniqueness of the numerical answer. Never run generated code or
   model-supplied executable formulas.
5. A separate skeptical Gemini audit independently checks answers, explanation,
   full-model applicability, assumptions, units, semantic originality against the
   complete supplied reference set and other candidates, scope and exam level.
   Require high confidence, all flags true, no issues, and one matching option.
   Medium requires at least two substantive reasoning steps; Hard at least three.
   Padding/substitution/rearrangement alone are not counted as extra concepts.
   Numerical models also have a fixed minimum reasoning-depth classification;
   single-equation substitutions cannot pass the Medium numerical gate.

Only accepted candidates enter `questions`. No answer-key repairs or unchecked
fallbacks are inserted. `status` is complete, partial, insufficient_references or
error. Partial results explicitly report requested and accepted counts, safe
rejection codes and operational limits. `AI_RATE_LIMITED` ends a run without
trying to route around quotas. Validation version: `zi-questions-v1.1`.

Student serialization excludes answer keys, explanations, formulas, concepts,
prompts, references and validation records. The internal serializer is only for
local review or future authorized post-submission use. There is no premature
answer-reveal endpoint in this phase.

## Numerical coverage and scientific limits

The fixed catalog covers torque/acceleration, standard-body inertia, rotational
energy, angular momentum, constant angular acceleration, parallel axes, conserved
angular momentum, rolling speed, torque-driven spin-up energy, braking angle,
instantaneous spin-up power, conserved-momentum energy changes, stationary attached
point masses, and total rolling energy. Catalog formulas and output units have
independently worked regression examples. Rod/shape axes, rolling assumptions and
whether the full problem actually fits the catalog also require independent review.

Unsupported numerical families, symbolic options, unsupported units or unbound
givens are rejected. Initial deterministic breadth outside rotational Physics is
therefore limited; other subjects can produce conceptual MCQs. Conceptual science,
semantic originality and difficulty still rely on separate AI reviews from the
same provider. They are not formal proofs or guarantees. Historical reference
patterns do not certify current syllabus inclusion. Originality is checked against
the bounded retrieved sample and the current run, not all published questions.

## Bounded execution and cost

There are `ceil(questionCount / 3) + 2` batch attempts: 4 for five requested
questions, 12 for thirty. Each usable batch has at most three logical AI tasks:
generation, blind solve and audit. Empty/invalid/rejected batches skip later tasks.
At most two provider attempts per task use Zi's existing availability fallback;
the SDK's implicit retries are disabled. No rate-limit fallback is attempted.

For five requested questions, an ordinary two-batch success uses six logical
question calls (6–12 physical provider requests), plus 0–1 Phase 2 analysis calls
depending on cache. Worst-case four batches allow twelve question tasks (up to
24 physical requests), plus analysis. Thirty requested questions normally use
30 logical question tasks, with a maximum of 36 due to the two extra batches.

Each task has a 45-second combined timeout and 8,000 output-token cap. Prompt
size is capped at 80,000 characters. The run has a 210–360-second deadline for
5–30 questions, bounded by an absolute 600-second cap in the implementation.
Generation token budgets range from 80,000 to 300,000, using a conservative
preflight estimate and actual provider usage. These are safeguards rather than
an exact billing cap: a single call can exceed a preflight estimate. Reported
question-call usage excludes Phase 2 context analysis and potentially billable
failed/cancelled requests. No dollar estimate is invented without verified model
rates and the account's billing tier.

## Verification on 16 October 2026 (India time)

- All 58 targeted tests and targeted lint pass, including Phase 2 regressions.
- Production build: `next build --webpack` (the repository's existing fonts
  require network or an already populated font cache).
- Initial live run: Main Rotational Motion requested 5, accepted 1; NEET Human
  Physiology requested 5, accepted 3; nonexistent topic accepted 0 and made no
  generation calls. Rejected candidates were not padded into either result.
- That first run used 8 physical question-provider requests / 17,407 reported
  tokens for Main and 11 / 15,075 for NEET, excluding Phase 2 analysis and failed
  request billing. Rejections included answer disagreement, unbound geometry,
  notation and chapter metadata mismatches.
- After alias/rendering compatibility fixes and stronger substantive-difficulty
  validation, the final live rerun hit Gemini **HTTP 429 in Phase 2 context
  preparation** for both exams. It returned no generated questions; the
  insufficient-topic case still succeeded without a generation call.
- **The final strengthened validator has NOT completed live end-to-end
  verification.** Historical examples are labeled review-only. In particular,
  the initial one-step Physics example would now be rejected as Medium.
  Deterministic mocked tests cover the final gates, partial results and rate limits.

Commands (Node 22+, credentials loaded only for live verification):

```sh
node --conditions=react-server --test src/lib/zi/testGenerator/*.test.mjs
node node_modules/eslint/bin/eslint.js src/lib/zi/testGenerator src/lib/zi/provider.js src/scripts/verify_zi_question_generation.mjs
node --conditions=react-server --env-file=.env.local src/scripts/verify_zi_question_generation.mjs --output /tmp/prepzii-phase3-review.md
# Optional --case 0|1|2 to run only one case after provider quota is available.
node node_modules/next/dist/bin/next build --webpack
```

Phase 3 stops here. No Phase 4 chat configuration or test integration is enabled.
