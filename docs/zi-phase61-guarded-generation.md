# Phase 6.1 — guarded generation orchestration

2026-10-22. **Local implementation and synthetic validation: GO. Hosted installation, paid provider execution, deployment and public activation: NO-GO.** No production connection, real AI request, deployment, existing grant correction, XP policy change or lab deletion occurred.

## Implemented contract

The existing builder still confirms an encrypted, Clerk-bound, one-hour draft without generating anything. Its public `generationEnabled` value remains false. New pilot controls require all of: explicit pilot flag, exact Clerk user allowlist, and the existing generated-engine flag. No environment files or feature flags were changed. Executing a reserved job additionally requires an independent provider-approval flag; none was enabled outside injected test environments.

`POST /api/zi/generation-jobs` accepts **only** the encrypted confirmed token. Identity comes from Clerk, entitlement is revalidated, configuration comes from the decrypted server-issued draft, and a server-derived SHA-256 draft key ignores re-sealing/re-confirmation revisions. Clients cannot supply owner, creation key, questions, answer keys, validation results or budgets. The key and configuration are immutable through application RPCs; duplicate reservation returns the existing job, while changed-payload key reuse conflicts.

`GET /api/zi/generation-jobs` resumes the newest owned job; `GET /api/zi/generation-jobs/{id}` reads a specific owned job. Responses are no-store and expose only status, safe progress, retry eligibility and an owned Start route after confirmed storage. Neither route invokes an AI provider. Reads can reconcile committed storage or mark an expired running job held.

`POST /api/zi/generation-jobs/{id}/execute` is a separate awaited Node function with `maxDuration=300`, a 240-second orchestration signal and a 270-second database claim deadline. The chat route remains unchanged at 60 seconds. No detached promise, queue dependency, in-process background scheduler or fire-and-forget dispatch was added. The host must actually support the declared duration before enabling this mechanism. A deployment requiring a shorter execution limit must keep this pilot disabled and provide a reviewed execution adapter.

The existing PYQ retrieval/analysis, context fingerprint checks, generation, originality comparison, blind solver, deterministic numerical verifier, audit, complete-set validation and private storage wrapper are reused. The orchestrator bypasses the process-local analysis cache to account for all its own provider requests. Storage uses `zi-job:{job UUID}` as its stable creation key. Existing session ownership, answer-free test delivery, server deadlines/grading and generated-test exclusion from XP remain unchanged.

## Durable admission and uncertain outcomes

Candidate migration: `db/migrations/20261022_zi_generation_jobs.sql`, SHA-256 `4e6a6510ccfdf7c46d44a9e067334c6f1b35f148aa13b294ef4a8ba497463edb`. Applied only to new synthetic databases. New private RLS-enabled job/policy tables are inaccessible to browser and service roles directly; a hardened service-only RPC performs state transitions. Existing objects/grants are not changed by this migration. Hosted owner authority and dependency/watchers review remain prerequisites.

- Admission is serialized in PostgreSQL across instances. Candidate pilot defaults: two reservations per user per UTC day, 600,000 token admission units/day, one outstanding job per user and two outstanding jobs fleet-wide. Each job reserves 300,000 units without automatic refund.
- A claim is granted only once. Running/held jobs are never re-leased, including after a crash or deadline expiry. Duplicate Execute requests do not repeat generation.
- Before every provider request, the execution token authorizes a durable dispatch receipt. No next dispatch is allowed while an earlier receipt remains unresolved. Limits: 25 physical calls/job and 300,000 reserved request units/job. Request units reserve full prompt UTF-8 bytes plus the existing 8,000 output-token allowance; reported usage cannot exceed that request reservation.
- Job calls force the existing provider adapter to one physical attempt. Existing tutor/retry defaults remain unchanged. An uncertain failure, malformed/incomplete provider response, missing/nonpositive usage, unexpected physical-request count, over-reservation usage or unknown acknowledgement aborts further dispatch and holds the job. Raw prompts/errors/answers are not returned or logged by orchestration.
- Known, fully accounted validation failures may use the existing bounded candidate-generation loop. A partial or failed accepted set cannot be stored. Failed jobs cannot be retried in place; a newly reviewed draft still faces the same daily budget.
- Storage commit with a lost acknowledgement is recovered by looking up the owned stable creation key and matching configuration, mode, duration, validation version and question count. No provider request is needed. Output lost before storage is **not** automatically regenerated.

These limits are conservative admission/request controls, **not a guaranteed currency spending ceiling or proof of provider billing**. Provider output/thinking-token semantics, model availability, pricing and billing attribution still require separately approved verification. Unknown/held jobs keep their capacity and budget reservations; abandoned unstarted reservations also retain capacity until continued or reviewed. This intentionally favors stopping over spending again. Policy numbers require review before any hosted pilot.

## Recovery and rollback boundaries

The UI polls every three seconds while reserved/running, provides Resume status, and allows Continue reserved job only before execution has been claimed. After reload, the student can resume the latest owned status independently of draft expiry. A running/held job is never offered as a safe generation retry. There is no automated held-job reset/refund endpoint.

For a held job, first read/reconcile storage. If no matching committed test exists, retain receipts and inspect the provider outcome privately. Do not reset to reserved, clear receipts or refund the reservation merely because the HTTP response was lost. Any operator resolution/replacement job needs an explicit approved procedure; unknown billing remains held until reconciled. This is at-most-once dispatch with quarantine, not a claim that a remote non-idempotent provider offers exactly-once execution.

Before hosted work, review migration order: generated-storage prerequisite **before** the Phase 5 integrity release candidate; the new job migration afterward. Do not reinstall the old generated-storage migration over the Phase 5 compatibility RPCs. On a job-migration failure, transactional DDL rolls back. For a later application rollback, disable pilot/provider admission, preserve job/storage/receipt tables and evidence, and allow private reconciliation of in-flight claims. Do not drop jobs or replay uncertain work as rollback. No production rollback action is authorized here.

## Actual verification

| Check | Result | Scope |
| --- | --- | --- |
| Server tests | PASS — 227 | Existing server regressions plus draft, route, admission, provider single-attempt, concurrent execution, cancellation, unknown usage/acknowledgement and storage-reconciliation tests; Gemini mocked |
| UI rendering tests | PASS — 14 | Existing builder/session rendering plus public control suppression, explicit confirmed pilot controls and no premature Start link |
| PostgreSQL 17.6 | PASS — 16 scenarios (17 Node test entries including parent) | Fresh synthetic database with full Phase 5 release candidate installed first; actual browser/service roles, private access, reservations, independent-process claims, execution fencing, budgets, rollback and recovery |
| Phase 5 preservation | PASS | Job migration leaves Phase 5 routine bodies/owners/ACLs unchanged; generated-job scenarios leave existing synthetic XP balances and receipt count unchanged; service direct XP UPDATE remains denied |
| Lint/whitespace | PASS | Changed application/test modules and Git whitespace checks |
| Offline production build | PASS | Fresh temporary source copy, no env files, synthetic keys only, Node network connections/fetch denied |
| Hosted Supabase/Clerk/PostgREST, real LMS, full browser recovery | SKIPPED | Requires separate staging approval and credentials; rendering tests do not prove interactive browser behavior |
| Live Gemini/model quality, quota and billing | SKIPPED | No real/paid AI calls authorized or made |
| Real host termination/duration behavior | SKIPPED | Crash boundary tested using durable claim/dispatch state and synthetic expiry; not a real Vercel process-termination experiment |

The database acceptance uses real SQL reservations/storage, with deterministic synthetic generation output. The unit orchestration suite separately runs the real question-generation/validation pipeline with mocked structured Gemini responses. This is not a live provider or hosted end-to-end PASS.

Earlier attempts: sandbox socket access was denied before SQL; the first authorized fresh fixture installation then stopped on missing database CREATE authority for the synthetic `postgres` operator. That fixture setup was corrected with a grant scoped only to the newly created synthetic database, and subsequent runs passed. Earlier databases/evidence were retained; no reset/deletion or production role change was performed.

Final database evidence: `/private/tmp/prepzii-pg176.ujiylN/evidence/phase61/zi_phase61_jobs_1792681906988/`. The original Phase 5 databases and evidence are untouched. Server/UI/build logs: `/private/tmp/prepzii-phase61-build-z2QCDC/evidence/`.

Reproduction (local synthetic only; no environment-file loading): Node 22.23.2, `node src/lib/tests/phase61LocalChecks.mjs`; database suite `ZI_PHASE61_DB_LOCAL=1 node --conditions=react-server --test src/lib/tests/jobs17.test.mjs`. The latter verifies socket, exact `170006`, operator, database ownership, port, data directory, no TCP listeners and filesystem ownership/mode before every SQL batch. Each run creates a new database and preserves it.

## Release gates

Local guarded orchestration is ready for review. Public generation and production remain NO-GO. Still required: all Phase 5 closure gates, hosted owner/default/watcher/private-routine verification, approved pilot quota/entitlement policy, host runtime verification, actual Clerk/Supabase/LMS and interactive mobile/browser acceptance, private held-job operations/monitoring, and a separately authorized bounded paid quality/billing pilot. Numerical scope, sample-bounded originality and same-provider auditing retain their existing limitations. Generated history and session-save recovery work from the Phase 6 audit are not claimed complete in Phase 6.1.
