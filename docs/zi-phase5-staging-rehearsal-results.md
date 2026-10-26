# Phase 5 local rehearsal results — 22 October 2026

**Exact PostgreSQL 17.6 prerequisite: FAIL / runtime unavailable. Database rehearsal: SKIPPED. No PostgreSQL 18 substitute was used.** Offline source tests and a network-denied build were run separately; they are not evidence of a database rehearsal. No production connection, SQL execution, grant change, deployment, activation or student-record modification occurred.

## Runtime evidence and isolation

`postgres --version`, `initdb --version` and `pg_ctl --version` each report **PostgreSQL 18.3 (Homebrew)**. The inspected Homebrew installation contains postgresql@18, not 17.6; standard Postgres.app and /Library/PostgreSQL locations have no available candidate. Neither Docker nor Podman is installed. Exact 17.6 was not found in the inspected runtime locations. An installed client/server-tool version is not proof of a running server; no database connection was made to check a substitute.

Following the user's instruction to report unavailability, no database was initialized/created, no server was started, no existing cluster was reused, no runtime installed/downloaded and no SQL file or rollback executed. `ZI_PHASE5_SECURITY17_LOCAL=1` was **not** set. The prepared local suite still guards server version 170006 and its fixed local socket/database/operator.

Offline test subprocesses received a minimal environment without production database/provider credentials or application dotenv loading. Supabase, Clerk and provider interfaces are mocked. The build used a separate temporary copy of source/public/config, excluded dotenv files and used synthetic credentials/invalid service domains with all three Zi feature flags false. A Node preload denied socket/TLS/DNS/fetch operations in the build and child processes. No network access was enabled to make the build pass. The original checkout's generated build files and configuration were preserved.

## PASS / FAIL / SKIPPED matrix

| Requested verification | Status | Evidence and practical limit |
| --- | --- | --- |
| Exact PostgreSQL 17.6 availability | **FAIL — BLOCKER** | Only 18.3 tools found; no container runtime. No server/client substitution. |
| Create isolated synthetic students/institutes/questions/sessions/XP DB | **SKIPPED** | Requires verified 17.6; prepared foundation was not executed. |
| Actual database anon/authenticated/service permissions and RLS | **SKIPPED** | Catalog/private reviews remain evidence; no new behavioral DB test. |
| 16-table maintenance correction and creator defaults | **SKIPPED** | No grants/defaults changed, even locally. Prepared guarded proposals remain unexecuted. |
| Actual increment_xp own/other targets, invalid amounts and privileged behavior | **SKIPPED** | No routine was invoked. Private implementation/RLS conclusions remain static, not runtime PASS. |
| Actual DDL watcher/default behavior | **SKIPPED** | No DDL/default evaluation or notifications executed. |
| Normal/duplicate/concurrent database commits, legacy writer bypass | **SKIPPED** | Existing mocked bank/route tests passed, but cannot establish DB concurrency or all-writer enforcement. |
| Goal action authentication/authorization | **PASS — mocked behavioral checks** | Six tests cover signed out, cross-user, Clerk failure, missing identity and owned PYQ/FORMULA calls; no real Clerk HTTP/DB test. |
| Same-user goal progress/reward integrity | **FAIL — controlled in-memory reproductions** | Five security criteria fail as detailed below. Assertions intentionally characterize current defects. |
| Real process/database crash recovery and exactly-once effects | **SKIPPED / NO-GO** | Exception-boundary model reproduces lost reward; no process kill/DB rollback/outbox rehearsal. Durable contract is not implemented. |
| Coaching LMS and PrepZii full student regression | **SKIPPED — E2E** | Existing mocked route/UI checks pass; no synthetic DB-backed institute membership/assignment/authoring/Clerk flow. |
| Database rollback/recovery | **SKIPPED** | No rollback executed; synthetic retention/restore remains untested. |
| Automated offline server tests | **PASS — 188 test entries** | Explicit network-free unit/mocked suites, zero failures/skips; includes six reward-characterization assertions. |
| Automated UI tests | **PASS — 11 test entries** | Builder/engine checks, zero failures/skips; not browser/Clerk/database E2E. |
| Targeted ESLint / diff whitespace | **PASS** | Goal action and three relevant test files; not an assertion that repository-wide lint is clean. |
| Isolated webpack build | **FAIL — offline dependency restriction** | Exit 1: next/font Google Font downloads denied by network guard. No successful build claimed; this is not proof of a code compilation regression. |

The 199 passing automated test entries comprise **193 other test entries and six characterization tests**. Five characterization checks confirm reward-security failures, while one confirms the existing sequential completion safeguard. Do not summarize this as “199 security requirements passed” or “staging passed.”

## Newly reproduced reward defects — synthetic mock state only

[goalRewardIntegrity.test.mjs](../src/lib/tests/goalRewardIntegrity.test.mjs) imports the actual local goal action with mocked identity, persistence and XP adapters. It executes no SQL and uses only synthetic A/goal/progress state.

| Security criterion | Observation | Verdict |
| --- | --- | --- |
| Only source-backed activity can complete a goal | Authenticated caller supplies progress reaching the threshold; action awards without source proof | **FAIL** |
| Replay of one asserted activity is ignored | Two identical calls increase progress twice and can reach completion | **FAIL** |
| Failed progress persistence prevents reward | Mock insert returns a Supabase-style error; action still awards XP | **FAIL** |
| Retry recovers an interrupted completion award | Progress marks complete, XP adapter throws; retry sees completion and does not recover the missing XP | **FAIL** |
| Concurrent completion pays once | Two synchronized reads of incomplete progress each update and award; synthetic XP is paid twice | **FAIL** |
| Sequential calls after a stored completion do not pay again | One completion award is retained, although progress continues increasing | **PASS for this narrow safeguard** |

These are source-level, controlled adapter reproductions, not observed exploitation or real database transaction/process behavior. The local Clerk patch blocks cross-user targeting but cannot satisfy these source-event and atomicity requirements. Database row uniqueness would not, by itself, repair all five defects. No broader reward patch was silently implemented in this pass.

## Executed checks and evidence locations

Using the bundled Node 24 runtime with a minimal environment:

- Server: `node --conditions=react-server --test src/lib/zi/testGenerator/*.test.mjs` plus explicit generatedTests/routes/quota/bankSubmission/legacyRewards/submissionClient/goalAuthorization/goalRewardIntegrity files. Database suites were explicitly excluded. Result: **188 pass, 0 fail, 0 skip**.
- UI: `node --test src/components/zi/tests/testBuilder.test.mjs src/components/test/tests/engine.test.mjs`. Result: **11 pass, 0 fail, 0 skip**.
- ESLint: `src/utils/updateGoalProgress.js`, `src/lib/tests/goalAuthorization.test.mjs`, `src/lib/tests/goalRewardIntegrity.test.mjs`, `src/lib/tests/security17.test.mjs`. Exit 0. `git diff --check` also passed.
- Build: Next.js `build --webpack` in the isolated copy; no dotenv or real credentials. Exit 1 on blocked Google Font downloads. No fallback font/source modification or outbound exception was introduced.

Safe synthetic test logs are at `/private/tmp/prepzii-phase5-offline-server-tests.log` and `/private/tmp/prepzii-phase5-offline-ui-tests.log`. Isolated build log: `/private/tmp/prepzii-phase5-offline-build-dp2b7mpa/build.log`. These logs contain no copied private production definitions. Build artifacts remain in that temporary directory; no production artifact was produced or deployed. The ESM package-type warning is informational and was not “fixed” by changing project module semantics.

## Separate GO / NO-GO decisions

| Release unit | Decision | Required next evidence |
| --- | --- | --- |
| Independent Clerk goal-identity patch | **GO for continued narrow local review; NO-GO for production deployment now** | Successful controlled build/preview, real synthetic Clerk Server Action denial/owned-flow checks, exact candidate/base review and separate deployment approval. Reward replay must remain explicitly outside this patch's claim. |
| 16-table browser maintenance correction | **NO-GO production** | Verified 17.6 runtime, exact guarded rehearsal, unchanged row/service/RLS rights, coaching/student regressions, baseline recovery/operator authority and separate SQL approval. |
| Two-creator public default ACL correction | **NO-GO production** | Same runtime gate, dual-creator authority/drift tests and future-object checks; approve independently from existing-table correction. |
| Dormant Zi schema migration | **NO-GO production** | Actual 17.6 migration/watch/default/isolation/rollback evidence and approved backup/recovery plan. Static private review alone is insufficient. |
| Distributed submission/reward contract | **NO-GO / design not implemented** | All-writer enforcement and durable transactional events/effects; replay, race, failure and recovery requirements must pass. |
| Zi AI generation/public activation | **NO-GO** | Database/authorization/HTTP/idempotency gates plus provider validation, quota, access and separate activation approval. No flag changed. |

## Safest next step

Make a verified **exact PostgreSQL 17.6 server runtime** available for the already specified disposable local endpoint, or authorize a separately reviewed local runtime provisioning step. Do not replace it with 18 or connect to production to obtain a version/test result. Then run the guarded synthetic suite, expand to the representative private-dependency/coaching/Clerk environment, and record actual outcomes rather than converting skipped rows into passes.

For the independent code patch, obtain a controlled build/preview setup whose font/assets are available without production database access. Do not remove the no-production boundary to resolve a font download failure. Present the exact candidate and results before asking for deployment approval.

Only a new synthetic characterization test and documentation were added in this pass. Existing source changes/proposals/private files are preserved. Stop here; no production action is proposed for immediate execution. Any later production action needs explicit approval for that exact scope.
