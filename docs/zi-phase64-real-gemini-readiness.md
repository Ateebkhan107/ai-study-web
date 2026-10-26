# Phase 6.4 — controlled Gemini pilot readiness

Assessment: 2026-10-24. **NO-GO for real execution today; GO for review of the local-only pilot preparation below.** No inference, model-list, token-count or other Gemini API request was made. Public Google documentation was consulted without credentials. No hosted Supabase connection, application SQL write, environment change, server startup or deployment was performed. Only this report was added; existing changes and lab evidence remain intact.

## Confirmed configuration and isolation

Secret values were classified in memory and are omitted here. `.env.local` contains a Gemini key and `ZI_AI_MODEL=gemini-3.5-flash`, Clerk development-key prefixes, and a hosted Supabase target. Key presence does not prove validity, project ownership, billing, restrictions or quota. The actual generation flags `ZI_GENERATION_PILOT_ENABLED`, `ZI_GENERATED_TEST_ENGINE_ENABLED`, `ZI_GENERATION_PROVIDER_APPROVED`, and pilot allowlist are unset. No relevant provider/model/generation shell overrides were present in the inspection process. This says nothing about a deployed environment.

**Do not enable generation in the repository's normal environment:** its hosted database is outside the approved boundary. Do not copy or source that environment into a pilot.

The retained isolated workspace `/private/tmp/prepzii-zi-local-rAn09g` has no application env files, substitutes the deterministic provider, and rejects the presence of a Gemini key. Its launcher reads only the reviewed Clerk test credentials, constructs a clean child environment, installs the guarded local SQL adapter, and supplies synthetic Supabase placeholders. Its network guard permits loopback and reviewed Clerk HTTPS destinations; Gemini and hosted Supabase transports are denied. Production/preview/build use is rejected. The mock provider-approval flag reaches only the substituted mock module. It is not approval for live execution. Do not relax these guards or repurpose this workspace for live generation.

Fresh fixed-endpoint, read-only verification succeeded through the retained workspace's pinned helper, including its filesystem mode/UID and database owner guards:

| Property | Observed |
| --- | --- |
| Server version number | `170006` — exactly PostgreSQL 17.6 |
| Session/current operator | `zi_phase5_lab_admin`, verified by helper |
| Data directory | `/private/tmp/prepzii-pg176.ujiylN/data` |
| Socket directory / port | `/tmp/prepzii-phase5-pg17` / `55436` |
| TCP listening | `listen_addresses=''`; server IP is NULL |
| Database | Retained pinned synthetic database; owner guard passed |

The sandbox initially denied socket access; the identical guarded read-only check succeeded after explicit tool approval. No alternate endpoint was attempted. Nothing was installed, restarted or deleted. No listener was observed on localhost port 3463, so no live app journey was reverified today.

Source inspection supports local-only generation/storage/session routing **in that mock workspace**. It does not prove isolation for a future live runner that does not exist yet. Any such runner must reverify endpoint, operator, exact version, owner and data directory before each SQL batch, import only the local adapter, reject all hosted credentials and URLs, and deny hosted egress. A localhost URL alone proves none of this.

## Model and adapter compatibility

`src/lib/zi/provider.js` uses server-only REST `v1beta/models/<model>:generateContent` for structured tasks. The key is sent in a header. Tutor streaming uses the installed Google SDK separately; tutor execution is outside this pilot.

The configured model string is accepted by the code, but it is not validated against a model registry. Google now documents `gemini-3.5-flash` as deprecated with automatic routing to `gemini-3.6-flash`. Recommend explicitly selecting `gemini-3.6-flash` for the proposed pilot rather than depending on an alias. Google documents structured outputs, thinking, and LOW thinking support for that model. This establishes documented compatibility, not successful account access or successful handling of every generated JSON schema. The API supports a subset of JSON Schema. Offline fixture success does not prove live schema acceptance. Sources: [3.5 migration notice](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5), [3.6 model](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash), [thinking](https://ai.google.dev/gemini-api/docs/thinking), [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).

Unverified: key's project/restrictions, enabled Gemini API, account tier/region, remaining RPM/TPM/RPD, billing/prepaid balance, model access, and actual returned model version. Inspect these privately in the owner's console; do not run a probe or paste credentials into a report. `getZiGenerationQuotaStatus()` reports only process-local cooldown state, not the project's remaining quota. An empty cooldown is not readiness evidence.

## Existing limits and failure handling

| Layer | Implemented behavior and limits |
| --- | --- |
| Structured provider | JSON schema, temperature 0.1, 8,000 maximum output tokens, LOW thinking on primary model, no thought text requested; 45-second deadline |
| Generic adapter | Up to three attempts by default; bounded retry/backoff; availability fallback includes a mutable `latest` model alias. Do not call this default path unwrapped in the pilot. |
| Durable jobs | `trackedComplete` forces `maxAttempts:1`; durable dispatch precedes external call; expects exactly one request with valid positive total usage; missing/unknown outcome is held, not automatically rerun |
| Job execution | 240-second bound; 270-second database deadline; separate route with 300-second declared runtime; chat remains 60 seconds |
| Admission | One outstanding job per owner; default policy two jobs/day, 600,000 reservation units/day, fleet active capacity two; reserved/running/held jobs retain capacity |
| Job request budget | Fixed 300,000 reservation units/job; at most 25 durable dispatch records; no automatic refund/release of uncertain work |
| Pipeline | Batches of up to five; at most `ceil(questionCount/5)+2` batches; numeric token threshold `min(300000,30000+questionCount*10000)`; analysis prompt 65,000 chars and subsequent payloads 80,000 chars maximum |
| Storage | Only a complete accepted set; immutable `zi-job:<id>` storage key; read reconciles committed storage after lost acknowledgement; private answers excluded from student DTOs |

The existing pipeline can replace rejected candidates in later batches. For five questions it can reach 10 physical calls (one analysis plus three stages across three batches); for ten, 13. These are not appropriate first-pilot limits. Generic adapter calls outside the durable wrapper can retry and fall back; never assume the same usage bound there.

Budget units are not currency. Job admission uses prompt + system UTF-8 bytes plus 8,000, excluding the response schema and other request framing. Pipeline estimates divide characters by three. Actual total usage is checked after the external side effect. Neither is a certified maximum dollar charge. `includeThoughts:false` hides thought text; it does not disable reasoning or its billing. The adapter preserves `totalTokenCount` but does not expose `thoughtsTokenCount` separately; candidate-output totals alone are insufficient for cost reporting. Unknown or over-budget usage must remain held even if the provider may have charged it. See [usage fields and thinking configuration](https://ai.google.dev/api/generate-content).

## Minimum pilot and exact proposed changes — not applied

The existing configuration schema, generation jobs and private test storage require **5–30 questions**. A one-question full application job is invalid. Do not submit a fake five-question configuration, generate five and discard four, lower shared database constraints, or bypass validation to claim the requested pilot succeeded.

Propose a small separately reviewed local quality runner, reusing retrieval, schemas, provider adapter and validation functions. This first exercise validates one candidate, not an entire student test/session. Keep the accepted mock browser journey unchanged. The runner needs an isolated local durable pilot reservation/dispatch record using the existing hold-on-unknown contract, one immutable run key and single-run concurrency enforcement; do not call Gemini directly without durable accounting. Validate its single-candidate scope explicitly without weakening normal job/storage minimums. Prepare and test this runner offline before seeking permission to execute it.

| Setting/boundary | Exact proposed value |
| --- | --- |
| Scope | JEE Main; Physics; Rotational Motion; Easy; one single-correct MCQ; numeric SI options |
| Supported calculation | `torque_acceleration` (`alpha = torque / inertia`), quantities explicitly stated and bound to the statement; no unsupported symbolic calculation |
| Execution | One local operator invocation, one durable run, one allowlisted real Clerk development owner; no public route or tutor inference |
| Model override | `ZI_AI_MODEL=gemini-3.6-flash`, supplied only to a fresh private runner process |
| Credential | Dedicated reviewed development-project `GEMINI_API_KEY`, supplied privately only to that process; never browser-exposed, logged or committed; do not source `.env.local` |
| Global flags | Existing app flags remain unset/disabled; existing mock provider/network/Clerk guards unchanged |
| Egress | Separate runner guard: only HTTPS 443 to `generativelanguage.googleapis.com`, exact selected-model generateContent POST path, no redirects; no other provider tools, fallback, search, files, caching or hosted database transports |
| Database | Fixed verified Unix-socket lab above only; separate synthetic pilot evidence/ledger, never normal hosted clients |
| Physical requests | At most four total: reference analysis, candidate generation, answer-blind solve, answer/explanation audit; stop early on any failure |
| Retries | `maxAttempts:1` for every stage; no fallback, repair batch, continuation, restart replay or automatic retry after quota/error/timeout |
| Output | Existing cap 8,000 per request; four configured caps total 32,000; LOW thinking, no thought text |
| Time | 45 seconds per request, 240 seconds for the entire run; abort does not prove the provider did not charge |
| Input | Proposed local preflight cap: 16,000 UTF-8 bytes for each fully serialized request, including schema/system/reference material. Reject before dispatch if it cannot fit; no silent truncation or increased cap. Token/billing bound must also be validated before live approval. |
| Results | Private local artifact, mode 0600 in a private lab folder, with schema/quality results, redacted usage/model and immutable evidence hash. No generated test/session release or XP payment from this initial candidate pilot. |

These are proposed execution controls, not new working environment variables or an executable command. No safe live startup command exists yet. The normal mock launcher intentionally cannot accept a Gemini key. A later complete live five-question test needs separate approval after this one-candidate check passes.

The retained mock workspace's 12 reference records are explicitly synthetic optical-alignment examples, not official rotational-dynamics PYQs. They exercise integration only. **Do not send them as official evidence to the real analysis prompt.** Before the pilot, prepare at least five relevant, authorized-to-use, independently checked local reference records and a reviewed current-syllabus extract; remove all student/account data. No production retrieval is permitted. The new reference pack, provenance, fingerprints and compact request schemas must pass offline preflight. If that material is unavailable, the proposed four-stage pilot remains blocked.

## Maximum usage and spending approval

Current assessment consumed **zero Gemini API requests**. Proposed pilot ceiling is **four physical generation requests**, at most one candidate, with four 8,000-token configured output caps. No model-list/countTokens/health probe is included in that permission. Every paid attempt counts even if invalid JSON, rejected science, quota/error response, timeout or interrupted execution prevents a usable result. A held request requires manual reconciliation and new approval, not a fresh run key to evade the ceiling.

Google currently lists Standard text input at $0.75/million and output including thinking at $3.75/million through 2026-12-31 for 3.6 Flash. Sources: [pricing](https://ai.google.dev/gemini-api/docs/pricing), [thinking limits](https://ai.google.dev/gemini-api/docs/thinking). Under a **validated** aggregate ceiling of 64,000 billed input tokens and 32,000 billed output/thinking tokens, the planning envelope is $0.048 + $0.120 = **$0.168 USD before tax**. This is conditional arithmetic, **not a currently enforced maximum charge**: byte caps are not a model-specific token certificate, schema accounting must be included, and the exact selected REST/model output-budget semantics and billing tier must be signed off. No tools/caches are proposed, so their charges are outside the permitted request shape, not an extra allowance.

Suggested owner approval cap: $0.20 pre-tax for this one run **only after** the offline cost-admission proof fits beneath it and account pricing is privately confirmed. If the bound cannot be established, remain NO-GO or request a revised explicit budget; do not advertise $0.20 as a platform hard spending limit. Billing alerts and timeouts alone are not spending caps. Shared-project usage by other clients is not limited by this runner.

## Quality acceptance checklist

- Correctness: independent human Physics review; correct torque/inertia relationship, stated axis, SI dimensions, signs, nonzero positive inertia and unambiguous assumptions. Recompute without the proposed answer; numerical verifier must bind every input to statement text and find exactly one matching option.
- Syllabus/relevance: reviewer checks the supplied current JEE Main syllabus and Rotational Motion scope; historical PYQ metadata alone cannot certify current relevance. Easy difficulty must be credible, not a disguised Medium/Hard item.
- Answer: exactly four distinct options and one defensible correct answer; blind solve receives only student-safe question data; solver and audit must agree without uncertainty. Disagreement, missing calculation or unsupported family means failure, not release.
- Explanation: coherent human-readable steps from givens through formula/substitution to units and selected answer; no reliance on hidden assumptions, contradictory rounding or a memorized option letter. LaTeX/rendering must remain usable.
- Originality: normalized comparison and semantic audit against the reviewed reference pack; no copied/rephrased reference, number-only substitution or duplicate scenario. Passing a small sample does not establish universal originality.
- Safety/provenance: no personal data, secrets or Clerk identifiers in provider prompts; references treated as untrusted data; no model-generated code execution; schema validation and safe serializers retained. Same-provider blind/audit calls are separate checks, not independent scientific proof. Human acceptance remains mandatory.
- Failure/recovery: mocked tests prove four-request cap across retries/restarts, concurrent duplicate run refusal, held unknown dispatch, missing usage, cutoff, incomplete/unsafe output, no hosted egress, no account/XP writes, and no artifact release before all checks pass.

## Evidence status and approval gates

| Check | This assessment |
| --- | --- |
| Secret-redacted configuration / source / local mock isolation inspection | PASS |
| Fixed lab endpoint, operator, owner, filesystem, exact 17.6 and no TCP | PASS — fresh guarded read-only check |
| Official documentation compatibility review | PASS at documentation level; project-specific access remains unknown |
| One-question support through existing full job/store contract | FAIL — minimum five; no change applied |
| Suitable real PYQ reference pack in retained mock fixture | FAIL — deliberately synthetic |
| Live-runner egress, durable four-call ceiling and certified cost bound | BLOCKED — proposed only |
| Key validity, actual quota/billing/model schema acceptance | SKIPPED — no provider or private-console access |
| New automated/build/browser/live-quality tests | SKIPPED — assessment only; prior mock PASS evidence retained, not rerun |
| Hosted/production integration | SKIPPED and NO-GO; Phase 5/6.3 release gates remain open |

Next safest approval unit: **local-only offline preparation** of the small single-candidate runner, isolated ledger, reviewed reference pack and mocked failure tests, preserving every existing app guard. After reviewing its exact commands, payload fingerprints, model/project classification, token bounds and test evidence, request a **separate explicit approval** for one run, at most four Gemini requests, agreed monetary ceiling, and exact local data boundary. No current instruction authorizes that real run. Public generation, deployment, hosted database use, larger question sets and production changes remain NO-GO.
