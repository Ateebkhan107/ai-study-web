# PrepZii Zi — Phase 3.1 stabilization and verification

Date: 16 October 2026 (India time).

**Outcome: stabilization implemented; automated checks pass. Live five-question
verification is BLOCKED by a reproduced Gemini daily request quota. This report
does not claim production readiness or a live acceptance-rate improvement.**

## 429 diagnosis: observed evidence, not an assumed cause

One minimal diagnostic request was sent to the configured Gemini model. It
returned HTTP 429 / RESOURCE_EXHAUSTED with:

```json
{
  "requestedModel": "gemini-3.5-flash",
  "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_requests",
  "quotaId": "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
  "quotaValue": 20,
  "reportedQuotaModel": "gemini-3.6-flash",
  "location": "global",
  "retryInfoDelay": "17345s",
  "httpRetryAfter": null
}
```

The observed blocker is the **project/model free-tier daily request quota**, not
an observed per-minute request or token limit. The response's requested and
reported model names differ; both are preserved rather than assuming an alias
mapping or changing models. The message contains generic advice about checking
billing, but the structured violation does not establish a billing failure.
Account billing state was not inspected. The older Phase 3 reports discarded
quota details, so their exact historic cause cannot be proven retrospectively.

Google documents separate RPM, input TPM and RPD limits, applied per project,
and notes RPD resets at midnight Pacific time. It also documents possible
spend-based restrictions. HTTP 429 alone therefore does not identify the cause.
The structured violation above supplies the evidence for this reproduced failure.

Sources: [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits),
[Gemini troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting).
The 17,345-second hint is the value at the diagnostic observation, not a promise
that quota is available now or a scheduled retry. No waiting job was created.

## Retry stabilization

New server-only `src/lib/zi/geminiRetry.server.js`:

- Classifies daily request/token quotas, zero model quota, explicit billing
  restrictions, minute request/token throttling, retry-hinted throttling,
  transient HTTP/network failures and unknown resource exhaustion.
- Daily/zero quotas and explicit billing restrictions are not retried, even when
  the response also supplies a short retry hint. An unknown 429 without sufficient
  retry evidence fails closed rather than assuming it is RPM throttling.
- Transient failures have at most **three physical attempts per logical task**.
  Equal-jitter exponential delays start at 250–500 ms, doubling between attempts,
  capped at 4 seconds before provider hints. Retry-After seconds/HTTP dates and
  structured RetryInfo are lower bounds; the larger provider hint wins.
- A provider delay outside the 45-second task deadline is returned as deferred,
  never truncated into an early retry. Cancellation interrupts waits. Permanent
  bad requests, credentials and permission failures are not repeatedly retried.
- Existing availability fallback is retained for 404/503 only. **429 never causes
  model/key switching.** Hard restrictions establish a bounded process-local
  cooldown keyed by a SHA-256 credential/model fingerprint; subsequent calls in
  that worker fail without another provider request. This is not distributed
  quota enforcement and is not persisted across workers or restarts.
- Only allowlisted quota IDs/metrics/values/model/location, retry policy and
  attempt counts are retained. No raw service messages, keys, project/account
  identifiers, private prompts or arbitrary headers enter returned diagnostics.

`src/lib/zi/provider.js` keeps tutor streaming on its unchanged Gemini SDK path.
For structured tasks, the installed SDK dropped retry headers from ApiError;
the adapter now uses the **same Gemini REST endpoint**, configured model, key
and existing fallback list to preserve both HTTP and structured retry details.
No provider, model preference or dependency was replaced. Phase 2's public
`{data, model}` return contract remains unchanged.

## Cost optimization without merging independent checks

Combining generation and blind solve would expose the generator's key or remove
the independent answer-free solve. Combining blind solve and audit would remove
the separate critical check of the proposed explanation. Those request mergers
were rejected.

Instead:

- Candidate, blind-solve and audit batches now support **five** questions. A
  successful five-question run uses **three logical question tasks instead of
  six**, excluding optional pattern analysis and physical retry attempts. This
  50% nominal request reduction is verified with deterministic mocks, not a new
  live acceptance measurement.
- Maximum batches are `ceil(requestedCount / 5) + 2`: three for five requested
  questions and eight for thirty. Each task remains capped at 8,000 output tokens,
  three physical attempts and the existing task/run deadlines and token budgets.
  A five-question run therefore has at most nine logical question tasks / 27
  physical attempts, plus context analysis. This is a request ceiling, not a
  prediction of normal usage or a billing guarantee.
- Biology generation/blind prompts omit the irrelevant rotational formula catalog;
  unsupported numerical questions are still rejected. Audit receives the full
  reference comparisons and questions but omits a redundant pattern-summary copy.
  Earlier-candidate comparisons retain IDs/statements/options without repeated
  metadata already known from configuration.
- Numeric candidates whose fixed model is already below the requested reasoning
  depth are rejected before spending an audit request. The final gate still
  applies the same substantive-step threshold.
- Structured response metadata is constrained to the exact configuration through
  per-request schema enums. Local strict Zod validation is unchanged.
- Pattern-analysis request counts and tokens, previously absent from generation
  accounting, now flow through an internal telemetry callback. Question-call
  counts preserve zero-request cooldown hits. Input-token heuristics include the
  private system instruction and every physical attempt; reported usage is kept
  separate from estimates. Context usage now participates in the token guard.

Scientific checks remain at `zi-questions-v1.1`: strict structure/rendering,
originality comparisons and semantic review, blind solving without keys,
fixed-formula/units/givens verification, separate skeptical audit, scope/difficulty
gates and student-safe allowlists. No unsupported numerical model is guessed.

## Rejection investigation and prevention

The historical first run recorded these question-level rejection codes:

| Exam | Code | Count |
| --- | --- | ---: |
| JEE Main | ANSWER_DISAGREEMENT_OR_AMBIGUITY | 1 |
| JEE Main | UNBOUND_GEOMETRY | 1 |
| JEE Main | UNRENDERABLE_CONTENT | 6 |
| NEET | CONFIGURATION_MISMATCH | 8 |

Main also had one provider/budget failure event, which is not a rejected question.
The old reports did not retain raw rejected questions or enough field-level
detail to prove the exact notation/metadata mistakes. No reconstructed rejected
questions or invented explanations are presented as evidence.

Prevention instructions now explicitly require copied canonical metadata,
plain SI numeric givens/options, balanced formula delimiters, literal shape and
axis/rest/no-slip evidence, independently calculated options, concise substantive
explanations and application/mechanism reasoning for medium Biology. Known
metadata fields are constrained in the wire schema; new mismatch diagnostics
identify the field without exposing raw private prompts. Validators were not
relaxed to increase acceptance.

Every parsed candidate receives a server UUID before validation. Accounting now
separates generated, accepted and rejected/unverified candidate counts from
provider/response failure events. A provider failure during verification marks
pending candidates `UNVERIFIED_INTERRUPTED_VALIDATION`; they never enter the
student-safe result. Already accepted questions remain available in partial results.
Malformed envelopes are counted as response failures, not invented candidate counts.

## Automated verification versus live verification

Automated checks use deterministic mocks, fake clocks and intercepted HTTP;
they do not use real credentials or generate billable test questions.

- **77 tests passed**, including all Phase 2/3 regressions.
- Targeted ESLint passed for all changed executable files.
- Production `next build --webpack` passed.
- Added coverage includes daily/zero/token/minute quota classification; generic
  billing-text ambiguity; Retry-After seconds/dates and RetryInfo precedence;
  exponential jitter; three-attempt exhaustion; hard-quota cooldown; cancellation;
  long retry deferral; no quota-driven model switching; sanitized diagnostics;
  partial results with unverified candidates; exact metadata constraints; and
  the three-task five-question flow.

Live facts for **this Phase 3.1 pass**:

| Requested live case | Requested | Actually generated | Accepted | Rejected questions | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| JEE Main Physics — Rotational Motion, medium | 5 | 0 | 0 | 0 | Not run: daily quota blocker |
| NEET Biology — Human Physiology, medium | 5 | 0 | 0 | 0 | Not run: same configured-provider blocker |

Exactly **one diagnostic Gemini HTTP request** was made; it received the daily
quota error above. There were **zero generation/blind/audit requests**, zero quota
retries, and zero model/key switches. No token usage metadata was returned for
that failure, so actual/billed tokens are **unknown**, not asserted to be zero.
The diagnostic's 25-character user instruction has a rough chars/3 estimate of
9 input tokens before request framing; this is not a provider tokenizer or bill.
There are no new live questions or solutions to display and no new live acceptance
rate to report. Historical 1/5 Main and 3/5 NEET outcomes are not reused as current
verification. Live calls stopped rather than waiting/retrying exhausted quota.

The controlled CLI now stops on a provider blocker before running remaining cases.
When the provider restriction is resolved, an explicitly authorized rerun can use:

```sh
node --conditions=react-server --env-file=.env.local src/scripts/verify_zi_question_generation.mjs --output /tmp/prepzii-phase31-live-review.md
```

No automatic monitor/retry job or Phase 4 work was started.

## Changed files and preserved boundaries

- New: `src/lib/zi/geminiRetry.server.js`,
  `src/lib/zi/testGenerator/retry.test.mjs`, this report.
- Updated: `src/lib/zi/provider.js`; Phase 2 analysis/context telemetry; generation
  orchestration/schema/prompts; field-level structural diagnostics; generation
  and provider tests; the controlled verification script; directory README.
- No changes to Zi UI, authentication, Supabase schema/RLS, official PYQs, test
  engine/scoring, student persistence or analytics. Existing unrelated working-tree
  changes were preserved. No secrets or private prompts were put in this report.

**Stopped after Phase 3.1. Phase 4 requires approval.**
