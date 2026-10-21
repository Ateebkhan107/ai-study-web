# Phase 5 migration safety remediation — 2026-10-16

**Historical revision-2 report.** [Phase 5.2](zi-phase52-verification.md) supersedes its migration digest and test count with unapplied revision 3. The rollback digest remains unchanged. No shared application is authorized by either report.

**NO-GO for shared application.** The confirmed local defects are corrected and the final automated suites pass. Production catalog evidence is still unavailable, and production already contains duplicate attempts. No shared migration, rollback, destructive production SQL, index, generation activation, or Phase 6 work was performed.

## Files changed in this pass

Updated:

- `db/migrations/20261016_zi_generated_tests.sql`
- `db/rollbacks/20261016_zi_generated_tests.sql`
- `src/lib/tests/database.test.mjs`
- `src/lib/tests/fixtures/baseline.sql`
- `docs/zi-phase5-verification.md`

Added:

- `db/audits/20261016_zi_phase5_catalog.sql`
- `db/proposals/20261016_test_attempts_session_uniqueness.sql`
- `src/scripts/audit_zi_phase5_metadata.mjs`
- `docs/zi-phase5-production-metadata.json`
- `docs/zi-phase5-safety-remediation.md`

Application/UI/authentication/scoring/provider files were not edited in this pass. Existing uncommitted work was retained. The prior safety-audit findings were supplied in the conversation; no separate prior safety-audit file was found among the Phase 5 documents.

## Corrections to the unapplied migration

The existing versioned filename is retained because the migration has not been applied; its header identifies remediation revision 2. Do not treat this as a replacement for an already applied migration. If any target has applied the earlier version, stop and prepare a separate ALTER migration rather than replaying this CREATE script.

Reviewed SHA-256 digests:

```text
e067cab2a3d741893ebf9c507370024cbe0c50c299c067500c8940d77a7cca40  db/migrations/20261016_zi_generated_tests.sql
fd00dca4fc4a4a7077159ca0413ffab9bf7453520aa171610034bc8a7a26e8e5  db/rollbacks/20261016_zi_generated_tests.sql
```

The named submission-state CHECK now reads:

```sql
constraint zi_generated_sessions_submission_state_check check (
  (submitted_at is null and result is null) or
  (submitted_at is not null and result is not null and jsonb_typeof(result) = 'object')
)
```

SQL NULL, JSON null, arrays and scalars cannot satisfy the submitted branch. Tests also reject an object result without a submission timestamp, and confirm failed writes leave the active record unchanged. Successful submission tests exercise the valid object branch.

The migration explicitly revokes table/function privileges from PUBLIC, anon, authenticated and service_role before intended grants. It also enumerates and clears **all non-owner direct ACL grantees on exactly the three new tables and six exact function signatures**, including grants received through custom default ACLs. It does not change global/default privileges, memberships or privileges on existing application tables/functions. Overloads outside those six signatures are excluded.

Final grants are SELECT on private tables and EXECUTE on five entry points for service_role. The private answer-validation helper has no application-role EXECUTE grant. RLS is enabled on all three private tables, with no browser policies; browser table access is also denied by ACLs. Trusted database owners/superusers remain privileged administrators; RLS does not conceal keys from them or from the intentionally trusted service role.

Direct REVOKEs alone are not the security argument. A preflight rejects migration ownership reachable by anon/authenticated/service_role/authenticator, including membership that permits SET ROLE despite NOINHERIT. It also rejects browser superuser/BYPASSRLS attributes and browser membership in service_role. A postflight checks actual effective privileges, RLS, object ownership, SECURITY DEFINER configuration and required server grants before commit. Unexpected inherited browser access, service DML, or helper execution aborts the transaction. Local tests inject inherited grants and verify this failure behavior. Future role/ACL changes require renewed review; the checks are not continuous monitoring.

All six SECURITY DEFINER functions use `search_path=pg_catalog,pg_temp`. Application tables, composite row types and the private helper are explicitly `public` qualified. Public-schema CREATE trust is therefore removed from name resolution inside these functions; actual production schema CREATE grants still require inspection. The executor becomes the function owner; its actual production identity and privileges have not been verified through REST.

Generated submission additionally checks the base session's owner when updating `test_sessions` and raises on a mismatch. Tests prove that this error rolls back the private result/answers transactionally.

Forward and rollback transactions have `lock_timeout='5s'` and `statement_timeout='60s'`. Statement timeout is per statement, not a total migration deadline. An error must abort the deployment command (`psql -X -v ON_ERROR_STOP=1`, or an equivalently fail-fast migration runner); do not blindly retry lock failures. The forward file contains new-object DDL/grants and function definitions, but invokes no submission/storage function and performs no existing-record cleanup. Existing constraints and triggers still affect future RPC calls and remain a production verification prerequisite.

## Production evidence and inaccessible metadata

The sanitized artifact `docs/zi-phase5-production-metadata.json` records the actual GET-only snapshot at **2026-10-15T20:26:24.176Z** (2026-10-16 in India). No SQL RPC was invoked. Five GET requests retrieved OpenAPI metadata, attempted catalog-profile access, and inspected bounded attempt IDs/counts and session-value counts. Credentials and student identifiers/answers/scores are not persisted in the artifact.

| Check | Observed evidence | Limit |
| --- | --- | --- |
| Existing referenced columns/types | OpenAPI definitions for test_sessions, test_questions, test_attempts, user_answers, institute_test_attempts and questions captured | Does not establish full PostgreSQL constraints, actions, triggers or privileges |
| Catalog access | HTTP **406**, code **PGRST106**, message **Invalid schema: pg_catalog** | REST service credentials do not provide a catalog SQL execution path |
| Duplicate attempts | HTTP 200; **207** non-null-session rows read, matching exact API count; **21** duplicate session groups; **36** excess attempts | Snapshot of visible API records, not an ongoing uniqueness guarantee or approved deduplication plan |
| Practice duration | API count of duration_minutes=0: **0** | No positive example; absence does not prove a CHECK permits zero |
| Completed status | API count of status='completed': **0** | No positive example; absence does not prove a CHECK permits that status |
| Proposed objects | Not advertised in API metadata | Catalog absence is not proven by lack of API visibility |

No direct PostgreSQL connection or Supabase management access token is configured. Existing advertised RPCs do not expose an approved arbitrary catalog-query capability. We did not probe undocumented SQL endpoints or call application RPCs to bypass that boundary.

Still inaccessible in production:

- Existing CHECK definitions/validation status, all incoming/outgoing FK definitions/delete actions, unique constraints and index validity.
- Trigger definitions/bodies and side effects on session/attempt/answer writes.
- Table ACLs, RLS policies, schema ACLs and effective PUBLIC-schema CREATE privileges.
- Default ACLs, function ownership/configuration/ACLs, role attributes/memberships and inherited privileges.
- Definitive compatibility of practice duration zero, completed status, owner role and trusted function execution.

The versioned **read-only** catalog script `db/audits/20261016_zi_phase5_catalog.sql` covers these checks, including aggregate duplicates and effective inherited grants. It was syntax/execution-tested against the local fixture, not production. A catalog-capable authorized operator must obtain and review its production output before a GO recommendation. It reads no question content or answer keys. Trigger function definitions may contain operational details; handle the output privately.

## Duplicate submission and rewards review

All `test_attempts` insertion sites in `src/` were reviewed:

- `/api/test-session` uses `zi_commit_bank_submission` only when the engine flag is enabled. RPC callers lock the same owned base-session row, return the existing attempt, and schedule reward eligibility only for a newly committed attempt. Six concurrent local RPC calls create one attempt and one eligible result.
- The same API's legacy flag-off branch performs separate attempt/answer writes without the RPC lock. Multiple requests or old deployed writers can still create duplicates and schedule repeated reward callbacks. A rolling deployment cannot be declared protected solely by adding the new function.
- `src/lib/testAttempts.js` has a separate client insertion helper that omits session_id. No caller was found in current `src/`; its NULL-session attempts would be outside a proposed partial uniqueness rule. Deployed old clients and external writers cannot be ruled out from repository inspection.
- Generated submissions serialize on the private session row and store a single private result. They do not insert shared attempts or schedule normal rewards. Eight concurrent local submissions produce exactly one created result.

The 21 duplicate production groups confirm that universal session-attempt uniqueness cannot be assumed. A uniqueness index was **not** added to the migration. The separate proposal `db/proposals/20261016_test_attempts_session_uniqueness.sql` contains only commented candidate SQL and prerequisites. Existing duplicates prevent its proposed unique index from building. Retake semantics, dependent answers/institute references, reward reconciliation, writer rollout and error handling require separate decisions and approval; no deletion or deduplication is authorized.

RPC-level idempotency is not a durable reward outbox or proof that historical rewards were unique. Actual existing index/constraint definitions remain inaccessible; observed duplicates establish that a universal valid uniqueness constraint on non-null session_id is not currently preventing those records.

## Safer rollback and deployment ordering

The revised rollback removes the shared `test_sessions` DELETE entirely. It retains every base session, normal attempt, shared question and official PYQ. Dropping the private tables **permanently destroys generated questions, validation evidence, saved answers and results**. Retained generated base-session metadata may affect legacy usage counts after rollback; any reconciliation requires a separate reviewed plan. Unexpected new dependencies make DROP fail rather than cascading through unrelated objects.

The rollback was **not executed**, including against local fixtures, in this remediation pass. Its test is a static safety assertion, not an execution claim. Earlier historical execution of the old rollback does not establish runtime behavior of the new version against undisclosed dependencies.

Required order before any later application:

1. Obtain full production catalog evidence, resolve compatibility/privilege blockers, and plan normal-writer concurrency/reward handling. Do not assume the separate index proposal is approved.
2. Keep engine and generation flags off. Verify target identity, migration history, owner role and a suitable backup/recovery plan. Approve the exact SQL separately.
3. Apply first to an approved representative staging database with fail-fast transaction handling. Verify private ACLs/effective permissions, constraints, practice/completed values and all normal/generated paths.
4. Apply to shared production only after separate explicit approval, using the bounded transaction and verified executor. This pass supplies no such approval or execution.
5. Engine enablement and any public generation release require separate approval. Keep all writers coordinated before claiming duplicate-submission protection. Drain requests before any separately approved rollback and back up private data if retention is required.

## Verification

Final passing results:

| Suite | Passed | Failed/skipped |
| --- | ---: | ---: |
| Existing generator/builder plus Phase 5 service/API regressions | 156 | 0 / 0 |
| Zi and existing engine rendering/KaTeX tests | 11 | 0 / 0 |
| Real local PostgreSQL forward migration/security/concurrency tests | 19 entries (18 scenarios + parent) | 0 / 0 |
| Total | **186** | **0 / 0** |

PostgreSQL tests cover the corrected SQL NULL check, JSON null/scalars/arrays, hostile default ACLs, custom inherited grants, private-helper restrictions, safe owner membership, owner/search-path/RLS assertions, FK/source separation, storage atomicity/order/idempotency, eight concurrent starts, eight generated submissions, six normal commits, revision conflicts, timing expiry, practice mode, negative marking, NULL answers, atomic owner-mismatch failure and static rollback review.

The initial PostgreSQL run had a static-test false positive because a comment contained “DELETE from”; the assertion now strips SQL line comments. It was corrected without running rollback. All reruns used fresh databases, without schema drops or fixture cleanup. The final run used `zi_phase5_remediation_fixture_3` on Unix socket `/tmp`, port 55435; prior fixtures were retained and the local server was stopped afterward. No production connection variables are consumed by this test harness.

Targeted lint: **0 errors**, one pre-existing `@next/next/no-img-element` warning in the reused test question image renderer. Final changed-test/script lint: clean. Production build: **passed** with `next build --webpack`; all 122 static pages generated. Existing Node ESM package-type warnings remain.

Repository-wide `git diff --check` reports pre-existing trailing whitespace in `src/components/battle/BattleRoomClient.jsx:467`. That unrelated file was left untouched.

Reproduction commands use the bundled Node 24 runtime as `node` and require a **fresh** guarded local fixture database:

```sh
node --conditions=react-server --test src/lib/zi/testGenerator/*.test.mjs src/lib/tests/generatedTests.test.mjs src/lib/tests/routes.test.mjs src/lib/tests/quota.test.mjs
node --test src/components/zi/tests/testBuilder.test.mjs src/components/test/tests/engine.test.mjs
ZI_PHASE5_LOCAL_DB=1 ZI_PHASE5_FIXTURE_DB=zi_phase5_remediation_fixture_3 node --conditions=react-server --test src/lib/tests/database.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

No automated fixture provides evidence of live scientific generation quality. Gemini calls: **0**. Shared SQL/migration/rollback executions: **0**. Shared record mutations: **0**. Both engine and public generation flags remain disabled. Production compatibility and public release readiness are not claimed.
