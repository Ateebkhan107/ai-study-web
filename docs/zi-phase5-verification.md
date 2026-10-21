# Zi Phase 5 — private generated-test engine integration

**Latest follow-up:** [Phase 5.2 investigation and local corrections](zi-phase52-verification.md). The verification counts below describe the earlier remediation; Phase 5.2 records current counts and migration revision 3. Shared approval remains NO-GO.

**Current recommendation: NO-GO for shared application.** Local safety corrections and verification are complete; full production catalogs remain inaccessible and the read-only snapshot found existing duplicate attempts. See [the remediation report](zi-phase5-safety-remediation.md) and [sanitized production evidence](zi-phase5-production-metadata.json). The migration is unapplied. Engine activation and public AI generation remain disabled; separate explicit migration approval is required.

## Architecture inspected

Inspected the Phase 3 generator, schemas, independent-answer audits, numerical validation, originality checks and safe serializers; Phase 4 encrypted owner-bound drafts and confirmed handoff; existing `/test/session` page, creation/submission APIs, question/palette/timer components, result/review APIs/pages; Clerk ownership checks, marking helpers, usage/reward logic and Supabase schema.

The actual Supabase PostgREST/OpenAPI metadata was retrieved read-only with the existing server credentials. Only table definitions were printed; no student records or secrets were printed or changed. Confirmed:

| Existing table | Relevant inspected columns / references |
| --- | --- |
| `test_sessions` | UUID primary key; text `user_id`, `exam`, `status`; integer duration/count; timestamptz `started_at`, `completed_at`; score/count fields |
| `test_questions` | UUID `question_id` FK → `questions.id`; UUID `session_id`; integer order. OpenAPI did not advertise a session FK. |
| `test_attempts` | UUID PK, text `user_id`, UUID `session_id`, integer scores/counts/duration/elapsed, submission/status timestamps |
| `user_answers` | Required UUID attempt FK → `test_attempts`; required UUID question FK → shared `questions`; text selected/correct option and boolean correctness |
| `questions` | Shared question bank with scalar/structured content, publication/source metadata, option/answer/explanation fields |
| `user_profiles` | UUID PK and text Clerk identity/exam; ownership continues to use authenticated Clerk IDs |

Generated questions cannot use the existing bank-question FKs without polluting the shared bank. The integration therefore adds private storage and a source adapter while reusing the existing UI, question components, navigation, selection, review marks and result paths.

OpenAPI does not expose all PostgreSQL checks, triggers, policies or grants. The local baseline reproduces inspected types and relevant FKs, not an exact production dump. Shared-database preflight remains required. No direct database/admin URL was present in the inspected environment; applying DDL requires an authorized SQL/admin execution path, not just the REST service key.

## Exact migration plan — awaiting approval

Forward SQL: [`db/migrations/20261016_zi_generated_tests.sql`](../db/migrations/20261016_zi_generated_tests.sql).

Rollback SQL: [`db/rollbacks/20261016_zi_generated_tests.sql`](../db/rollbacks/20261016_zi_generated_tests.sql).

The forward file is unapplied remediation revision 2, tested locally, wrapped in one transaction with 5-second lock and 60-second statement timeouts. It creates **three tables and six functions**. It does not alter official PYQs, shared question-bank data, existing foreign keys, authentication or historical attempts.

1. `zi_generated_tests`: private owner, durable creation key, configuration, validation version, count, timed/practice mode, duration, READY status and creation time. Unique `(owner_id, creation_key)`; count 5–30; timed duration 5–180; practice duration NULL; supported exam/subject constraints.
2. `zi_generated_questions`: private question content, separate validation evidence, order and explicit test FK. Unique order per test; source `AI_GENERATED`, single-correct MCQ structure, four options, one integer answer index, statement/explanation/topic checks. No reference to shared `questions` or official PYQ tables.
3. `zi_generated_sessions`: explicit FK to the existing `test_sessions` UUID, unique generated-test association, composite test/owner FK, database-owned start/deadline, revision, answer snapshot, submission timestamp and stored result. One attempt/session per generated test; reopening resumes that session.
4. RLS enabled on all new tables. All non-owner object ACLs (including default grants to custom roles) are reset before intended grants. There is no browser-read or browser-write policy. The server role receives SELECT and execute on five entry-point RPCs only; direct DML is revoked. Owner reachability and effective inherited privileges are checked before commit. A sixth private answer-validation helper is callable by the function owner. Every relevant RPC checks the server-supplied owner. All SECURITY DEFINER functions pin `search_path=pg_catalog,pg_temp` and qualify application relations, row types and helper calls with `public`. Submitted results require a non-NULL JSON object, closing the SQL UNKNOWN loophole.
5. Atomic functions: `zi_store_generated_test`, `zi_start_generated_test`, `zi_save_generated_answers`, `zi_submit_generated_test`; helper `zi_validate_generated_answers`; `zi_commit_bank_submission` for atomic normal-test submission after activation.

New functions are not invoked by the migration. They write session/attempt records only when explicitly used afterward. No shared database migration command, seed, fixture insertion or feature-flag change has been performed.

Apply only after approving this file and checking its prerequisites against the target database. Keep flags off during application. Re-run verification against an approved staging database before any engine release. Public generation requires a separate later approval and successful live/security validation.

Rollback requires disabling the engine flag and draining requests first. It removes only the six new functions and three private tables. **It permanently destroys generated questions, validation evidence, saved answers and results.** All shared `test_sessions` rows are retained, including base metadata for generated sessions; any cleanup or usage reconciliation requires separate review. Normal attempts, shared questions and official PYQs are retained. The corrected rollback was reviewed statically and was NOT executed during this pass. The earlier rollback execution described in the historical Phase 5 run does not validate this revised file.

## Source adapter and existing engine

`questionSource.server.js` provides one allowlisted session DTO for `QUESTION_BANK` and `AI_GENERATED`. Normal questions retain their previous shape and marking. Generated questions map statement/options into the same renderer shape, with +4/−1 marking, no image dependencies and an explicit AI source label. Active payloads omit answer keys, explanations, concepts/formulas and private verification evidence.

Existing `/api/test-session` accepts a strict generated start request containing only source and saved generated-test ID. The existing page loads it using:

```text
/test/session?sourceType=AI_GENERATED&generatedTestId=<saved UUID>
```

The page reuses its existing MCQ/math renderer, palette, navigation, selection, clear and mark-for-review controls. It resumes server-saved answers/revision and retains its existing browser review-mark storage. It supports timed and untimed practice modes. No immediate answer reveal was added.

PATCH saves serialized answer snapshots using optimistic revisions. PUT submits. Database row locks make concurrent starts/submissions idempotent. Duplicate starts resume the original start/deadline; submissions return the same attempt ID. Lost/conflicting save acknowledgements block final submission until reload/resume rather than overwriting uncertain state.

The generated attempt is represented by the submitted private session; its ID is the existing session UUID. It is not inserted into `test_attempts` or `user_answers`, avoiding legacy analytics and official-PYQ/reward contamination.

## Timing, scoring and security

- Every generated load/save/submit/result/review route authenticates with existing Clerk auth and checks ownership through the private DAL/RPCs.
- Generated starts take configuration and question ordering exclusively from saved private records, not URL duration/counts.
- Start, deadline, expiry and elapsed time come from PostgreSQL. The client uses the database `server_now` snapshot plus a monotonic display clock; it supplies no authoritative elapsed time.
- Before deadline, a matching-revision final snapshot may be submitted. At/after deadline, final client changes and late autosaves are ignored; only answers saved before expiry are scored. The UI states that saved answers count on expiry.
- Practice mode has no deadline. Elapsed time still comes from the database.
- Scoring uses stored answer indices; NULL/missing answers remain unanswered. Correct +4, incorrect −1, unanswered 0. Count/accuracy/total marks and topic counts are stored atomically.
- Results/review require a submitted record. The existing result/review APIs understand the explicit AI source; review maps private questions/solutions into their existing shape only after submission. Correct, incorrect, unanswered, accuracy, time, marks and topic breakdown are available.
- No AI-generated official-PYQ attempts, XP, streak/goal rewards or shared analytics records are written. A small usage-helper change excludes generated sessions from normal custom-test quotas once the migration-dependent engine is enabled.
- Existing normal scoring now rejects NULL/blank/boolean/array coercion to option A and treats numerical zero as an actual answer. Normal elapsed time uses the stored server start, not browser input.
- With the migration-dependent engine flag enabled, normal submissions use an atomic RPC: lock session → reuse existing attempt if present → insert attempt/answers → update session/institute association. Only the first commit schedules existing reward eligibility. This prevents duplicate-submission reward callbacks only among writers using that RPC. The inactive legacy branch and rolling old deployments can still insert attempts without its lock. Production has existing duplicate session attempts; no index or cleanup is applied. Existing attempts are not rewritten/deleted.

## Generation handoff and activation gates

`storeGenerationForConfirmedDraft` decrypts/verifies the Phase 4 confirmation and separates generation settings from session settings. `storeValidatedGeneration` accepts only complete Phase 3 results of the confirmed count/version, with reference provenance and validation evidence. It rechecks structural/scope/rendering validation, within-batch originality, answer agreement and supported deterministic calculations before atomic private storage. Unsupported numerical families remain rejected. Partial output is refused; a smaller test requires a freshly confirmed configuration and a matching complete generation result.

Official-reference originality analysis remains Phase 3's responsibility; persistence does not rerun AI analysis or claim additional scientific proof. Private audit evidence is retained separately from question content.

Only successful storage returns a saved test ID/start route. There is no student-facing storage or generation endpoint, no new Test Ready action in Zi, and no student-controlled acceptance of generated content.

`ZI_GENERATED_TEST_ENGINE_ENABLED` defaults false. All new public engine operations fail closed while false. This also prevents queries against unapplied tables. After an approved migration, the flag can be used for controlled engine verification independently of public question generation. It is **not** an AI-generation flag.

The existing Phase 4 `ZI_AI_TEST_GENERATION_ENABLED` remains fail-closed. No new code invokes Gemini from student requests, changes its model/provider, probes quota or runs the generator. A future approved worker can pass existing Phase 3 output into the saved-draft handoff; no such worker was activated.

## Files created

- `db/migrations/20261016_zi_generated_tests.sql`
- `db/rollbacks/20261016_zi_generated_tests.sql`
- `src/lib/tests/questionSource.server.js`
- `src/lib/tests/generatedTests.server.js`
- `src/lib/tests/answers.js`
- `src/lib/tests/generatedSessionClient.js`
- `src/lib/tests/generatedTests.test.mjs`
- `src/lib/tests/routes.test.mjs`
- `src/lib/tests/quota.test.mjs`
- `src/lib/tests/database.test.mjs`
- `src/lib/tests/fixtures/baseline.sql`
- `src/lib/tests/fixtures/generated.mjs`
- `src/components/test/tests/engine.test.mjs`
- `docs/zi-phase5-verification.md`

## Files modified

- `src/app/api/test-session/route.js`: source branch, private start/save/submit adapter, safe DTO reuse, normal NULL/elapsed fixes and migration-gated atomic normal commit.
- `src/app/api/test-attempts/[id]/route.js`: owned generated result branch.
- `src/app/api/test-attempts/[id]/review/route.js`: post-submission generated review branch.
- `src/app/(dashboard)/test/session/page.js`: generated loading/resume, revisioned saves, database-deadline display, untimed mode and source-aware result routing; existing engine controls reused.
- `src/app/(dashboard)/test/result/[id]/page.js`: source-aware loading/review route, AI label and topic counts; generated results do not expose an unsupported Zi-review action. Correct the existing 404 loading-state issue.
- `src/app/(dashboard)/test/review/[id]/page.js`: source-aware loading/back route and AI label; existing solutions UI reused.
- `src/lib/accessControl.js`: exclude generated sessions from normal custom-test usage only after migration-dependent engine activation; authentication is unchanged.

Unrelated pre-existing changes (battle, formula cards, Zi Phases 2–4, provider/retry files, scripts and reports) were retained. No dependencies were added.

## Verification results

**186 passing automated test entries**: 156 server/service/API tests (including all 124 existing generator/builder server tests), 11 rendering tests (7 existing Zi tests plus 4 engine/KaTeX tests), and 19 local PostgreSQL entries (18 database scenarios plus the parent test). No skipped tests in these executed commands.

The corrected forward migration ran only in fresh local PostgreSQL databases on Unix socket `/tmp`, port 55435; the final passing run used `zi_phase5_remediation_fixture_3`. No rollback SQL ran. The test runner fixes the local socket/port, validates a strict fixture database name, never reads Supabase/production connection variables, and guards the baseline with the same name pattern. Setup no longer drops schemas or existing fixture data. Each run requires a fresh database; earlier fixtures are retained. Fixture questions are synthetic and test-only; no fixtures were sent to Supabase or student data.

Local SQL scenarios cover RLS/grants/FKs/constraints, atomic storage and ordering, creation-key idempotency, malformed-question rollback, ownership, eight concurrent starts, resume, NULL versus option A, stale/invalid saves, eight concurrent submissions, negative marking/unanswered/topic counts, late snapshot rejection, untimed elapsed time, six concurrent normal commits with one reward-eligibility result, source separation, SQL NULL/result-state regression, hostile default ACLs, inherited privilege detection, unsafe owner membership, atomic owner mismatch failure, and static rollback safety checks. Rollback preservation is reviewed from SQL, not claimed as an executed test.

The API tests invoke the real route handlers with deterministic Clerk/database/provider boundaries. Rendering tests use the existing question panel/palette and actual MathText/KaTeX renderer; they do not add test components to production page exports. Automated fixtures are not scientific validation evidence for live Gemini output.

Commands using the bundled Node 24 runtime:

```sh
node --conditions=react-server --test src/lib/zi/testGenerator/*.test.mjs src/lib/tests/generatedTests.test.mjs src/lib/tests/routes.test.mjs src/lib/tests/quota.test.mjs
node --test src/components/zi/tests/testBuilder.test.mjs src/components/test/tests/engine.test.mjs
ZI_PHASE5_LOCAL_DB=1 ZI_PHASE5_FIXTURE_DB=zi_phase5_remediation_fixture_3 node --conditions=react-server --test src/lib/tests/database.test.mjs
node node_modules/eslint/bin/eslint.js src/lib/tests/ src/lib/accessControl.js src/components/test/tests/engine.test.mjs src/app/api/test-session/route.js 'src/app/api/test-attempts/[id]/route.js' 'src/app/api/test-attempts/[id]/review/route.js' 'src/app/(dashboard)/test/session/page.js' 'src/app/(dashboard)/test/result/[id]/page.js' 'src/app/(dashboard)/test/review/[id]/page.js'
node node_modules/next/dist/bin/next build --webpack
```

Targeted lint passed with **one existing `no-img-element` warning** in the reused question image renderer. Production webpack build passed. Node's pre-existing ESM package-type warning remains.

Live Gemini calls: **0**. Shared database writes/migration applications: **0**. No quota bypass or provider changes.

## Remaining limitations / release boundary

- Shared catalog verification remains blocked: REST rejects `pg_catalog` with HTTP 406/PGRST106. The observed 207 non-null-session attempt rows include 21 duplicate session groups and 36 excess attempts. No duplicate records were changed and no uniqueness index was added. See the separate proposal and remediation report.
- Shared migration application is awaiting explicit approval. The engine flag remains off. NULL-answer and normal elapsed-time fixes do not require new tables; migration-dependent atomic normal commits remain inactive until activation, preserving existing deployments during review.
- No authenticated browser end-to-end or staging-database deployment was performed. Local SQL tests verify actual SQL behavior against a metadata-derived baseline, not undisclosed production constraints/triggers. Both require follow-up after migration approval.
- Strict saved-before-deadline scoring can lose an unacknowledged last-moment selection during network delay. Save errors instruct reload/resume; expired final snapshots are never silently accepted.
- Normal bank tests retain their existing client-driven expiry/submission behavior; the new strict persisted-answer cutoff applies to generated tests. Their recorded elapsed time is now server-derived. Existing normal Start requests retain their existing semantics; generated Start is idempotent per saved test.
- Normal reward callbacks are at-most-once eligibility after a committed submission, not a durable reward outbox. A process crash can lose a callback; this phase does not redesign rewards.
- One attempt per generated test; retakes require a new saved test. No generated-test history listing, analytics dashboard ingestion or Zi performance follow-up has been added. Generated results/review are reached through their source-aware existing URLs.
- Live scientific quality still requires the previously blocked Gemini validation. Storage revalidation does not prove scientific correctness or guaranteed originality. Public AI generation remains disabled pending separate live/security approval.
- No Phase 6 work or student-facing generation activation was performed.
