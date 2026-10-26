# Phase 6.4B — live runner and billing safeguards, offline preparation

Current input/billing gate decision: see [Phase 6.4C](zi-phase64c-final-safety-gate.md). The $0.336 figure below remains a conditional estimate, not a proven maximum charge; live execution remains blocked.

2026-10-24. **GO for dry-run/offline verification. NO-GO for actual Gemini execution.** No inference, token-count, model-list or other Gemini API call was made. Only public official documentation was read. No hosted Supabase, production environment file, database, deployment or feature flag was accessed or changed. No live execution authorization was issued. The existing lab and evidence remain intact.

## Implementation and boundaries

| File | Change |
| --- | --- |
| `scripts/zi-pilot/pipeline.mjs` | Extracted the existing Phase 6.4A one-candidate sequence for reuse: analysis → generation → blind solve → audit, with the existing schemas, originality, rendering, answer and numerical validators |
| `scripts/zi-pilot/run.mjs` | Calls that shared sequence; retains its offline-only behavior and all prior replay/network controls |
| `scripts/zi-pilot/live-policy.mjs` | Fixed model/limits, integer-money admission, environment refusal, manifest/expiry authorization and source-controlled unverified billing gate |
| `scripts/zi-pilot/accounting.mjs` | Private fsynced journal, permanent exclusive run lock, cost reservation before dispatch, usage reconciliation, no refunds/replay and terminal-state refusal |
| `scripts/zi-pilot/gemini-once.mjs` | One-attempt raw HTTPS transport and safe structured-response decoding; no SDK, retry helper, fallback, redirect following or implicit continuation |
| `scripts/zi-pilot/live.mjs` | Separate operator CLI, default dry run, clean application boundary, approval manifest and shared pipeline integration |
| `scripts/zi-pilot/live.test.mjs` | Mocked billing, accounting, HTTP failures, token limits, replay/concurrency/crash, redaction and isolation tests |
| `docs/zi-phase64b-human-review-template.md` | Blank private human-review checklist |

No student route imports these CLIs. They create no listener and have no Supabase/PG client, application SDK, auth substitution or database-write operation. The transport-denial preload blocks HTTP(S), fetch, TLS, TCP/Unix sockets and subprocesses during all CLI execution in this phase. Both local PostgreSQL and hosted databases are unreachable from it. Consequently this phase requires no database connection/reverification; it leaves the exact 17.6 lab untouched. Application/Next/preview/production environments and hosted/database configuration are refused. No normal chat route or public feature flag can authorize this runner.

The existing Phase 6 job contract was reviewed and preserved: 300,000 reservation units/job, up to 25 dispatches, owner/fleet/day admission, durable dispatch before the provider and held unknown outcomes. Those are not monetary limits. This pilot is deliberately more restrictive: four dispatches, one question, a private local journal and monetary reservations. It does not invoke an application job RPC or lower the normal 5–30 question minimum.

## Safe default usage

Use Node 22+ and a clean environment. No secret is needed:

```sh
cd /Users/ateebmazhar/Desktop/ai-study-web
env -i PATH=/usr/bin:/bin /Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin/node --conditions=react-server scripts/zi-pilot/live.mjs
```

This is a **dry run** despite the filename. It prints mode, private evidence root, authorization ID, status, counts and monetary reservations. It performs four deterministic mocked completions and zero Gemini requests. Default allowance is `$0.40`; configure a smaller/larger local estimate with `--max-usd 0.10` or another positive value up to `$1.00`, with at most three decimal places. An insufficient allowance stops before the next dispatch, without increasing it automatically.

Evidence lives in `/private/tmp/prepzii-gemini-pilot-<random>/<authorization-id>/`, directories 0700 and files 0600. Retain the journal and private review artifact. Same root and ID cannot execute twice, including after success, failure, uncertainty or a crash. Existing folders are never cleared. Different roots are separate dry experiments, not permission for more paid calls. A future approval manifest binds the exact root so copying an approval into a fresh root cannot authorize replay.

The dry-run references remain explicitly synthetic; they are not official PYQs or syllabus evidence. No production reference retrieval is performed. The prospective live path is not ready to evaluate official-PYQ quality until a permitted, reviewed reference pack and syllabus material are supplied and bound into a newly reviewed manifest.

## Exact prospective provider configuration

| Item | Fixed policy |
| --- | --- |
| Model | `gemini-3.6-flash`, explicit stable model ID, no `latest` alias or fallback |
| Endpoint | Only `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent` |
| Format/settings | JSON schema, temperature 0.1, `candidateCount:1`, LOW thinking, `includeThoughts:false` |
| Question | Exactly one Easy, single-correct JEE Main Physics Rotational Motion candidate |
| Successful sequence | Four calls total: reference analysis, candidate, answer-blind solve, audit; no repairs/replenishment |
| Attempts/concurrency | One physical request per stage; no retries or SDK; sequential awaits and pending-request ledger guard |
| Input boundary | 16,000 serialized UTF-8 bytes including schema/framing; **16,000 input tokens is a proposed admission ceiling, not a certified consequence of that byte cap** |
| Output boundary | 8,000 configured output tokens per call, including thinking per reviewed documentation; 32,000 over four calls |
| Response size | 262,144 bytes maximum; oversized/invalid responses fail closed |
| Deadlines | 45 seconds per physical request, 240 seconds per run; tests accelerate timeout to 20 ms |
| Quota/error handling | 429/5xx/network/timeout/unknown usage stop; no sleeping retry, fallback, continuation or new run key |
| Token probes/tools | None: no countTokens, models.list, search, files, grounding or tools |

Official documentation reviewed on 2026-10-24:

- [Model specification](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash) lists the stable model, structured-output capability, 1,048,576 input and 65,536 output model limits. Our proposed limits are substantially lower; listing does not establish account access.
- [Thinking configuration and output cutoff](https://ai.google.dev/gemini-api/docs/generate-content/thinking) documents LOW and a combined thinking/output cap. Thought text exclusion does not remove reasoning charges. The raw transport does not use SDK automatic continuations.
- [Standard pricing](https://ai.google.dev/gemini-api/docs/pricing) currently lists $0.75 input / $3.75 output including thinking per million through 2026-12-31, increasing to $1.50 / $7.50 afterward. The local estimator uses the higher figures conservatively and requires pricing review again after 2026-12-31.
- [Token-count API](https://ai.google.dev/api/tokens) describes model-specific counting of the full generation request. It was not called. Introducing token-count requests would require a revised explicitly approved request plan; they cannot be silently added to the four-request limit.

Actual key validity, project ownership, development-project separation, permitted models, region, RPM/TPM/RPD, balance, tier, billing and live schema/model-version behavior remain unverified. Presence of a key or an empty process cooldown establishes none of these.

## Money admission and the hard live blocker

The estimator uses integer nanodollars, $1.50/million input and $7.50/million output/thinking. It reserves the full proposed input/output ceiling **before each dispatch**, not an optimistic estimate of the expected short answer:

`16,000 × $1.50 / 1,000,000 + 8,000 × $7.50 / 1,000,000 = $0.084/request`

Four reservations total **$0.336 pre-tax**, compared with the default configurable **$0.40** allowance. This is a conservative **conditional planning exposure**, not an authoritative maximum bill. With these rates and true aggregate ceilings, four calls imply 64,000 input and 32,000 output/thinking tokens. The present byte heuristic does not certify the input-token bound or all provider overhead. No reliable maximum actual bill is established, so live mode remains blocked.

Missing/noninteger/inconsistent usage, input over 16,000 or output-plus-thoughts over 8,000 leaves the pending dispatch held. Post-response checks detect discrepancies; they cannot reverse a provider charge. Reservations are retained even when reported usage is smaller. A 429/5xx, invalid JSON, timeout, incomplete response or missing usage may leave uncertain charges and must never be treated as free retry permission. No credits are returned automatically, and local limits do not control other clients using the same project. Provider billing/alerts/taxes are separate from this ledger.

`BILLING_PROOF.verified` is deliberately **false in source**. An environment flag, self-declared approval JSON or larger allowance cannot change it. The CLI also retains the all-network-denied preload. This phase prepares and mocks the raw transport but does not open Gemini egress. Removing either barrier is a separate reviewed code/security change, not an execution instruction in this report.

## Separate execution authorization design — not issued

Default is always DRY RUN. A future request for live execution must have all of:

1. Newly reviewed model/docs, source fingerprints, exact reference pack/provenance, scope, limits, price policy and certified billing/input bound.
2. A private 0600 local approval file under the exact private evidence root. It binds version 1, action `one-question-four-requests`, authorization ID, model, four requests, allowance in nanodollars, manifest hash and expiration (at most one hour ahead). The manifest binds mode, root, ID, configuration/reference hashes, selected implementation hashes, limits and prices.
3. Deliberate `--live` plus matching server-process `ZI_PILOT_EXECUTION_AUTHORIZATION`. Neither alone grants permission. Approval/expiry must be checked before every physical request. Real key is read only from server-process `GEMINI_API_KEY` after authorization; never from CLI arguments, files, Next public variables or logs.
4. The existing hard billing gate resolved with reviewed evidence and a separate minimal Gemini-only egress policy. Keep the normal mock application's guard intact. No hosted DB access may be added. Use a fresh explicitly approved execution identity; dry-run records cannot be promoted or erased for reuse.

No valid execution approval was created in this phase. No live startup command is provided because the billing/egress/reference gates are unresolved. Even a syntactically complete mocked authorization is tested to fail on the unproven billing bound. This is an operator-only quality tool, not a replacement for Clerk ownership checks in student endpoints.

## Recovery and human review

Exclusive directory creation is the permanent local replay lock. Journal entries are fsynced before side effects; unknown outcomes keep full reservations. Terminal states cannot dispatch or acknowledge again. Crash after a dispatch without acknowledgement means uncertainty; a crash after validation/artifact write still cannot replay. No automatic deletion, recovery inference or restart rerun exists. Local same-user filesystem integrity is assumed; this is not a distributed production ledger or a sandbox against arbitrary native code.

Review answers privately using [the human-review template](zi-phase64b-human-review-template.md). It covers independent mathematical derivation, key/explanation agreement, originality relative to the actual available pack, current syllabus relevance, difficulty, ambiguous assumptions/options and validation disagreements. Mock agreement is software evidence only. No question is released into a student session and no XP is awarded.

## Verification results

| Check | Actual result |
| --- | --- |
| Phase 6.4B billing/transport/CLI tests | PASS — 21 tests; final implementation rechecked after manifest/source binding changes |
| Existing Phase 6.4A runner regressions | PASS — 26 tests after shared-pipeline extraction |
| Existing server suite | PASS — 230 tests, provider transports mocked/network denied |
| Existing UI suite | PASS — 14 tests |
| ESLint, all pilot scripts | PASS |
| Next.js production build | PASS — separate copied workspace, synthetic environment, no env files copied and network denied |
| Real Gemini, quota/key/schema/token-count probes | SKIPPED — prohibited; no live call |
| Hosted Supabase, new database tests, real browser/auth journey | SKIPPED — no DB/auth/UI changes or remote connection; prior evidence retained |
| Production migration/deployment/public activation | SKIPPED — prohibited |
| Remaining executed-test failures | None |

Pilot logs and retained success-artifact paths: `/private/tmp/prepzii-phase64b-checks-e1jqf3re/pilot.log`; final billing/CLI rerun: `live-final.log`; lint: `lint-final.log`. Build/server/UI evidence: `/private/tmp/prepzii-phase61-build-sQWMaf/evidence/`. All evidence is retained privately. The build and tests used the existing Node 22.23.2 runtime; no dependencies were installed.

**Decision:** offline implementation/verification complete. Live execution remains **NO-GO** because the input-token/billing bound is unproven, exact account quota/billing/model access is unknown, reviewed reference material is absent, the all-network-denied policy remains installed, and no execution authorization has been issued. Public generation and production remain **NO-GO** independently of the pilot. Next safest action is private review of the source/ledger/report and a separately scoped plan to resolve these gates. Do not turn on live execution based on passing mocks or by changing the proof constant without evidence and approval.
