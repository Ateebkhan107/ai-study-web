# Phase 6.4C — final input-token and billing gate

Completed 2026-10-25, Asia/Kolkata; official documentation reviewed during the 2026-10-24/25 assessment. **NO-GO for real execution.** A reliable offline bound of 16,000 billed input tokens per request could not be established. This requirement remains unresolved; the runner refuses live admission rather than treating bytes or mocked usage as a token certificate. Zero Gemini requests, token probes, paid calls or database connections were made. No allowance, credentials, application route, public flag, production data, lab or deployment was changed.

## What is established

The fixed model is `gemini-3.6-flash`. Google's [model specification](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash) lists an input limit of **1,048,576 tokens** and output limit of **65,536 tokens**. The pilot requests only **8,000 output tokens**, one candidate, LOW thinking, four sequential requests maximum, with no SDK retry/fallback/continuation. Google's [thinking documentation](https://ai.google.dev/gemini-api/docs/generate-content/thinking) describes the configured output limit as covering thinking and response tokens. Hiding thought text does not remove its cost.

Google's [token guidance](https://ai.google.dev/gemini-api/docs/tokens) describes approximately four characters per token. It does not certify a conversion from UTF-8 bytes to complete-request tokens. System instructions count as input. The runner must also account for generated question context, blind/audit prompts and schema/framing; post-response usage is too late to establish a pre-request spending ceiling. No verified Gemini tokenizer is available in the inspected installation. A different model's tokenizer would not prove this model's count.

The [Standard pricing table](https://ai.google.dev/gemini-api/docs/pricing) currently lists **$0.75/million input and $3.75/million output including thinking through 2026-12-31**, then **$1.50/$7.50**. The policy retains the higher rates as conservative planning figures and expires its pricing review after 2026-12-31. Account tier, billing configuration and model access remain unverified. Published pricing and model limits do not constitute a project-wide hard billing cap.

## Enforced local boundaries and fail-closed result

Only the following narrow request envelope is accepted at request construction, ledger admission and transport entry:

- One system text part and one user text part. No files, media, tools, extra contexts, caching fields or caller-supplied token claims.
- The exact configured generation settings: JSON schema, one candidate, temperature 0.1, LOW thinking, no thought text and 8,000 maximum output tokens.
- **16,000 bytes of the entire serialized UTF-8 request**, including escaped context, system instructions, schema and framing. Exact boundary is accepted; one byte beyond is rejected before any provider I/O. This is a byte limit, **not a verified 16,000-token limit**.

`assertRequestBoundary` explicitly reports `certifiedInputTokens:null`. `assertLiveInputBound` refuses every unproven live request. It is enforced independently in the live ledger before reservation/dispatch and again at the live transport before provider I/O. Thus the current enforceable live exposure is **zero requests**, not an assumed $0.336 ceiling. A previous request's usage, a guessed count, an approval file or a changed global proof flag cannot establish the next request's input bound. Source-controlled global refusal and the offline network-denial preload also remain in place.

Dry-run fixtures continue using conditional 16,000-input/8,000-output planning units to exercise accounting. Their successful completion is not evidence of real token usage or real billing safety.

## Recalculated exposure and allowance

At the retained conservative $1.50/$7.50 per-million rates:

| Calculation | Per request | Four requests | Status |
| --- | ---: | ---: | --- |
| Assumed 16,000 input + configured 8,000 output/thinking | $0.084 | $0.336 | Conditional estimate only; input assumption unproven |
| Entire published 1,048,576-input-token window + configured 8,000 output/thinking | $1.632864 | **$6.531456** | Broad model-envelope diagnostic, not an approved local input policy or guaranteed invoice maximum |

The full-context figure accounts broadly for all tokenized input components by reserving the model's whole published input window rather than guessing their tokenization. It is not proof of the runner's smaller 16,000-token cap. Nor does it establish charging behavior for rejected requests, future model/pricing drift or other project clients. It is deliberately not used to mark billing proof verified.

The unchanged default **$0.40** allowance covers only the conditional $0.336 plan. It does **not** cover the $6.531456 full-context envelope; the existing configurable maximum **$1.00** does not cover it either. No allowance was raised automatically. Merely approving a larger allowance would not establish the requested small input-token bound or remove other safety gates.

Before each dry-run dispatch, integer-nanodollar accounting validates the entire request, validates reserved/allowance values and requires enough remaining allowance for the full conditional per-request reservation. Exact remaining funds pass; one nanodollar short fails. Reservations are never refunded automatically. Missing input/thought/total usage, inconsistent totals or overflow leaves the pending request held and prevents replay. These checks detect discrepancies after responses; they cannot undo a charge, which is why unproven live admission remains refused.

## Minimal changes

- `scripts/zi-pilot/live-policy.mjs`: shared complete-request shape/byte enforcement, explicit unproven input gate, reusable cost admission and published-model-envelope diagnostic.
- `scripts/zi-pilot/accounting.mjs`: applies request/cost admission before recording dispatch; live mode refuses unproven input independently of the CLI gate.
- `scripts/zi-pilot/gemini-once.mjs`: applies the same request boundary before mocked/real I/O and the independent live-input gate before real transport.
- `scripts/zi-pilot/live.test.mjs`: existing transport/ledger fixtures now pass valid bounded request envelopes so failure tests exercise their intended paths.
- `scripts/zi-pilot/token-boundary.test.mjs`: nine focused offline boundary tests. No pipeline, auth, RLS, submission, XP or application limit refactor.

## Offline verification

| Check | Actual result |
| --- | --- |
| New boundary suite | **PASS — 9 tests** |
| Existing Phase 6.4A/B pilot regressions | **PASS — 47 tests** |
| Combined execution | **56 PASS, 0 FAIL, 0 skipped** |
| ESLint on pilot scripts | **PASS** |
| Proof of a pre-request 16,000-token live bound | **UNRESOLVED — live admission blocked** |
| Allowance sufficient for the broad full-context envelope | **NO — allowance unchanged** |
| Live Gemini / countTokens / quota / billing verification | **SKIPPED — prohibited** |
| Build / full app / browser / database suites | **SKIPPED — narrow CLI safety changes; prior Phase 6.4B build/app evidence retained, not rerun** |

Boundary coverage includes exact 16,000-byte admission and one-byte overflow; Chinese/Hindi/emoji/combining text and JSON escaping; system/context/schema size limits; forbidden media/tools/token claims/output drift; live ledger refusal before any dispatch; exact/exhausted/invalid budgets; absent usage components; token overflow; and transport refusal before mocked I/O. Existing tests retain duplicate/concurrency/crash/timeout, error, accounting, redaction and network-denial coverage.

Private logs: `/private/tmp/prepzii-phase64c-checks-84qedzyo/pilot.log` and `lint.log`. New synthetic artifacts and all older evidence were retained. No dependency or tokenizer was installed.

## Final execution checklist — all required before separate approval

1. **Input proof: NOT READY.** Supply a model-specific, reviewed pre-request counting/bounding method covering the complete system/context/validation/schema request. It must bind each actual dynamic payload and model version, not just the initial question prompt. Re-run multibyte, overhead and boundary tests against that method. Do not flip a proof flag based on heuristics.
2. **Request policy: UNCHANGED.** Four total generation/analysis/validation requests, single attempts, no fallback or concurrency. No token-count API call is authorized. Any proposed online counting would require a separately reviewed request/authorization plan; four additional counts cannot be silently appended to four generation calls.
3. **Cost admission: NOT READY FOR LIVE.** Recalculate with verified ceilings and current reviewed rates; prove allowance sufficiency before every request and decide whether full-run reservation is needed. Do not replace the smaller cap with the full model window or increase spending without review.
4. **Unknown outcomes: REQUIRED.** Verify missing metadata, timeout, crash and lost acknowledgement hold reservations permanently for reconciliation; never mint a new identity or erase evidence to retry.
5. **Preserved external gates: STILL REQUIRED.** Exact development project/key/model access and billing verification, permitted reference pack/provenance and syllabus review, private human quality review, unchanged local/database isolation, and separately reviewed Gemini-only egress. Current references remain synthetic and no network exception was added.
6. **Execution authority: NOT ISSUED.** Bind reviewed source/input hashes, root, model, allowance and expiry to a fresh deliberate approval. Keep all current gates closed until a separate explicit user authorization. No normal route, public flag or hosted database may be used for this pilot.

**Decision: NO-GO for the real pilot.** Offline safety verification passed, but the requested reliable small input-token/billing bound was not established under the no-provider-call restriction. The safest next step is to review the available bounding options and their request/budget implications; this report does not authorize counting probes, a wider input window, a larger allowance or real execution.
