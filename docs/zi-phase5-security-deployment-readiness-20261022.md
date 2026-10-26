# Phase 5 security and deployment readiness — 22 October 2026

> Superseded catalog status: the [actual production audit review](zi-phase5-actual-production-audit-review.md) verifies the 21 October export, expands the confirmed maintenance-grant scope to 16 tables, and resolves column/global-default/role inventory gaps. Remaining body/staging/activation gates stay explicit there. The six-table and missing-export discussion below is the earlier review record.

**Production remains NO-GO.** This is a review and preparation pass. No production connection/query, SQL application, privilege revocation, record change, duplicate cleanup, rollback execution or AI activation occurred. Existing source changes are preserved. This document separates permission remediation, dormant schema installation and feature activation; approval of one does not authorize another.

## Evidence and limits

Reviewed the [16 October catalog review](zi-phase5-production-catalog-review.md), [shared-privilege proposal](../db/proposals/zi-phase5-shared-privilege-remediation.md), [follow-up audit](../db/audits/20261016_zi_phase5_remaining_catalog_checks.sql), corrected forward migration/rollback, current submission/reward/auth code and earlier integrity proposal. Source checkout at review: `6fbeb80`. The confirmed production evidence is the **user-supplied 16 October 2026 10:52:17 UTC catalog**, PostgreSQL **17.6**; it is six days old. No new catalog output has been supplied. Findings below distinguish that snapshot from today's code inspection.

There is no connected production PostgreSQL execution tool in this session. REST application credentials do not provide catalog SQL execution, and application endpoints are unsuitable substitutes (some GETs award badges). No credential search or application probe was used. Fresh catalog and private-expression checks are **pending**, not passed.

The corrected SQL is unchanged by this review:

| Artifact | SHA-256 |
| --- | --- |
| `db/migrations/20261016_zi_generated_tests.sql` revision 4 | `6f05ae3e8090cff0afba3699ddf4075b123ab8a918b3114b6926b93d11ce45c8` |
| `db/rollbacks/20261016_zi_generated_tests.sql` | `4c112690d72b95e9c004d6fd87c7dc8faa889cfd1473447d5522386db88895fa` |

## Exact excessive grants and their provenance

The following is the complete **confirmed set within the six audited existing tables**, not a claim that the rest of public has been audited:

| Existing public table | Direct grants to **each** of anon/authenticated | Owner | Inherited owner privileges? |
| --- | --- | --- | --- |
| `test_sessions` | SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN | postgres | No |
| `test_attempts` | Same eight | postgres | No |
| `test_questions` | Same eight | postgres | No |
| `user_answers` | Same eight | postgres | No |
| `institute_test_attempts` | Same eight | postgres | No |
| `questions` | Same eight | postgres | No |

These are explicit non-grantable ACL entries granted by postgres and confirmed effective privileges. They do not depend on ownership or an inherited role. The exported membership graph shows no additional inherited grant path for anon/authenticated. `postgres → application-role` membership runs in the opposite direction and does not convey postgres privileges to applications. Fresh column grants and membership evidence are still required.

`service_role` directly has broad table grants and BYPASSRLS, but is not the owner and cannot assume postgres in the supplied snapshot. BYPASSRLS alone does not confer table privileges. `authenticator` has no effective privileges on these tables under its own NOINHERIT identity, but **can SET ROLE** to anon/authenticated/service_role; it is a trusted connection role, not a browser credential. Revoking its direct grants would not remove those role-switch paths. Do not revoke its memberships as a feature fix.

RLS is enabled with no policies reported on the six targets. Normal browser row access is therefore default-denied despite table ACLs. It does not protect whole-table TRUNCATE/REFERENCES. Broad TRUNCATE/MAINTAIN are unnecessary for the inspected application paths and should be removed from browser roles. TRIGGER/REFERENCES are additional least-privilege candidates, but no blanket row-grant removal or permissive policy is proposed. SQL capability does not prove public HTTP exploitability. [PostgreSQL 17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

Owner rights are separate from ACL grants, and effective privileges combine direct, PUBLIC and inherited rights. Revoking only a direct ACL can leave an effective privilege intact. [PostgreSQL privileges](https://www.postgresql.org/docs/17/ddl-priv.html)

## Minimum correction prepared, not applied

[Candidate existing-table correction](../db/proposals/20261022_browser_table_maintenance_privileges.sql) is a separate proposal, not an auto-run migration. It revokes **only TRUNCATE and MAINTAIN** from PUBLIC, anon and authenticated on the six exact tables. It has transaction/timeouts, PostgreSQL 17 and exact-owner/table preflights, RESTRICT behavior, and a postcondition that aborts if either browser role retains dangerous access through inheritance, SET ROLE or owner membership. No CASCADE, row DML, RLS change, service-role revocation or schema ownership change is included. Review fresh provenance before approving it; the postcondition diagnoses surviving inherited access instead of changing unrelated roles silently.

This preserves the privileges used by current Clerk/service-role APIs, PYQ practice, normal tests and institute authoring/results. No inspected runtime path needs these two maintenance privileges. This is a source-based compatibility conclusion, **not** a completed staging guarantee or proof about external jobs. Preserving row grants also preserves any current row-access risks; this is deliberately the smallest first correction.

Default ACL remediation is a **second approval unit**. The supplied snapshot shows public-schema defaults from both postgres and supabase_admin granting the same excessive table privileges. For each creator, the narrow candidate is:

```sql
-- PROPOSAL ONLY; authorized creator/administrator, after fresh audit and staging:
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
--   REVOKE TRUNCATE, MAINTAIN ON TABLES FROM PUBLIC, anon, authenticated;
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
--   REVOKE TRUNCATE, MAINTAIN ON TABLES FROM PUBLIC, anon, authenticated;
```

Schema defaults add to global defaults; a per-schema REVOKE cannot cancel a global grant. The new audit returns **all scopes and creators**, including namespace zero. If a matching global grant exists, stop: assess its other-schema consumers and obtain separate approval for the exact global correction. Do not assume the public-only example solves it. Only the actual creating role's defaults apply at CREATE time; changing postgres defaults does not automatically change objects created by supabase_admin. Defaults do not repair existing objects. Empty default ACL rows do not negate built-in defaults (notably PUBLIC function EXECUTE). [ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html)

Do not revoke all function EXECUTE globally: existing auth/community/platform functions may depend on it. Revision 4 already resets ACLs on its exact new functions/tables, including separate column ACLs, and verifies effective inherited/MAINTAIN privileges before commit. Keep that defense even after default cleanup. Schema ownership, Clerk JWT mapping, Supabase auth/storage/realtime and service-role memberships are unchanged.

## Fresh read-only verification package

Both files are **manual, unexecuted**, PostgreSQL 17.6, one catalog SELECT returning one JSON result. Use an authorized SQL editor/client with read-only access/session settings supplied by the operator. They contain no application calls, application-record scans, role switches, DML or DDL. Permission errors, missing targets and incomplete output mean unresolved evidence; do not substitute a more privileged connection without authorization.

1. [Catalog metadata audit](../db/audits/20261022_zi_security_readiness_catalog.sql): direct/PUBLIC/other-role grant provenance, effective table and per-column privileges, owner membership, USAGE versus SET role paths, role attributes/edges, public schema access, global/per-schema default ACLs for all creators, default dependency metadata, DDL event triggers, table triggers, policy metadata, index/uniqueness metadata and candidate submission/reward routines with effective EXECUTE. Targets include the six confirmed tables plus generated, reward, PYQ, profile and institute dependencies; unreported tables remain outside the conclusion.
2. [Private expressions audit](../db/audits/20261022_zi_security_private_expressions.sql): exact default expressions, policy expressions and definitions of relevant event/table-trigger/default/reward functions. It deparses definitions without evaluating them. Output can contain embedded secrets or personal literals: **inspect privately and share only redacted conclusions**, never commit raw output. Transitive calls, dynamic SQL and dependencies omitted for pinned built-ins need manual follow-through.

Required evidence returned by the reviewer:

| Check | Acceptance evidence | Current state |
| --- | --- | --- |
| Browser table privileges | Per-table direct/PUBLIC/inherited/SET provenance; no TRUNCATE/MAINTAIN after separately approved correction | Excess confirmed on 16 Oct; fresh results pending |
| Column ACLs | Explicit and effective SELECT/INSERT/UPDATE/REFERENCES for each role/column; private objects meet revision-4 postconditions | Pending |
| Defaults | UUID/time/default literal and function identities are appropriate; private review confirms no unexpected application side effects | Presence/type known; exact expressions pending |
| DDL event triggers | None, or each relevant CREATE/ALTER/GRANT/REVOKE/DROP path privately understood and staged | Not covered by original audit; pending |
| Default ACLs | Both observed creators plus any others, global + public scope; privileged operator authority confirmed | Broad public defaults confirmed; fresh global/provenance check pending |
| Routine/reward access | increment_xp body, owner, path, effective callers and reward-table policies/uniqueness reviewed | Invoker/public EXECUTE confirmed; body/effect safety pending |

No target CHECK constraints or custom table triggers existed in the supplied six-table snapshot. Do not revive a nonexistent CHECK-body blocker for practice duration 0/completed status. Fresh schema drift still requires review. These catalog checks do not verify deployed HTTP auth, secret handling or historical reward payments.

## Submission writers and required permissions

The following inventory covers all shared attempt/session insertion sites found by repository search and the proposed RPCs. Current source is not an inventory of old production deployments, imported stored routines, scheduled jobs or manual administrative writers; release needs their operator attestation too. S/I/U/D below mean SELECT/INSERT/UPDATE/DELETE, not a proposed GRANT ALL.

| Writer / entry point | Database principal and required rights | Cutover / compatibility requirement |
| --- | --- | --- |
| POST `/api/test-session`, normal/quick/custom and institute launch | Clerk auth → server `supabaseAdmin`/service_role: S profile/questions/access/institute assignments/membership; I+returning S `test_sessions`; I `test_questions`; institute I `institute_test_attempts` | Launch is currently multi-request persistence; failures can orphan a session. Preserve these rights until a separate launch RPC exists. |
| PUT `/api/test-session`, legacy normal path | Clerk → service_role: S session/questions/attempts/answers/institute association; I+returning S attempts; I answers; U institute attempt | Queue is process-local. Preserve DML until every worker uses the approved replacement; do not revoke service-role DML during a mixed rollout. |
| PUT, atomic normal branch | service_role S for server scoring/reuse and EXECUTE `zi_commit_bank_submission`; postgres definer S/U sessions, S/I attempts/answers, S/U institute attempts, S generated source discriminator | Row lock serializes cooperating callers; payload scoring is trusted server work. Not a browser-callable RPC. Definer ownership must remain unreachable by app roles. |
| `src/lib/testAttempts.js:createTestAttempt` | Anon-key client: I+returning S attempts; omits session_id | No current source caller found; snapshot RLS denies ordinary rows. Retire/migrate old deployed clients; never loosen RLS to resurrect it. |
| `src/services/testSessions.js:createTestSession` | Anon-key client: I+returning S sessions, I question links | No current source caller found. Same old-client check; cannot be considered a cooperating atomic writer. |
| Proposed generated store/start/save/submit | service_role S three private tables; EXECUTE five public entry points. Helper `zi_validate_generated_answers` gets no application EXECUTE. Definer I/U private data and I/U base sessions | Generated results stay private, no shared attempts/answers or XP/goals/PYQ writes. Store creation-key uniqueness and session/test uniqueness are enforced separately. |
| Institute question/test authoring | service_role S/I `questions`, I links/assignments/tests, U tests; batch/member routes additionally use I/U/D on their own tables | Separate from submission, but prevents revoking all shared DML blindly. Results read institute associations and shared attempts. |
| Operational scripts | `dedupe_wiley_chemistry_superseded.mjs` can remap `test_questions` with U and read shared questions/tests; import/maintenance scripts require separately scoped rights | Not executed here. Inventory active schedules/operators; no runtime maintenance grant needed for these REST DML operations. |
| Production DB functions/triggers/external jobs | Unknown until manual audit/private body review and deployed-job inventory | Source-name matching is candidate discovery, not a complete call graph. |

Clerk authenticates API users, and its verified webhook upserts `user_profiles` through service_role. Public-key clients in `supabase.js`/`supabaseClient.js` do not automatically become authenticated merely because Clerk has a session. Community realtime explicitly sets a Clerk token in separate components; do not disturb that integration. Keep user IDs as existing Clerk text IDs; do not replace them with auth.uid UUID assumptions. No account-wide/browser grant removal is prepared.

## Reward writers and distributed idempotency

| Path | Required rights / behavior | Reliability finding |
| --- | --- | --- |
| Test `runPostSubmitProgressUpdates` | service_role S/I/U user_xp, S daily_goals, S/I/U user_daily_goals | `after()` runs after a new commit only; not transactionally enqueued. Crash after commit but before/during callback can lose some/all effects. Reuse returns before reward repair. |
| `addXP`, goal helpers, badge engine | service_role S/I/U XP/progress; S badges/attempt stats; I user_badges | XP read/modify/upsert loses concurrent updates. Goal completion check/write/reward are separate. Even a unique badge row cannot make badge insert + XP atomic: failure between them can lose reward. |
| `/api/profile/badges` GET | Clerk → service-role badge evaluation | Read-looking endpoint can insert badges/award XP; never use as a production read-only audit probe. |
| `/api/pyq-attempts` POST | Clerk → S pyq_questions, I/S pyq_attempts, S/I/U user_xp | Server scores answers, but repeated requests insert/reward again; batch lacks durable operation key. Independent PYQ retakes need explicit attempt-instance identity, not global question deduplication. |
| `/api/update` POST | Clerk → S/I/U user_xp and badge helper | Explicit source=test is rejected, but other client-provided counters remain replayable. Not an alternate secure test reward path. |
| `updateGoalProgress` server action | service_role S goals/progress, I/U progress, XP/badges via addXP | Active callers include formula-book pages and PYQ results. Supplied userId/type/amount need server authorization/validation review; same-day replay and partial-effect hazards remain. `utils/goals.js` is another helper with no caller found. |
| `initUserLeaderboard` | **Active dashboard layout caller**, anon-key client S/I user_xp | Corrects earlier inventory's no-caller claim. Current user_xp ACL/RLS and server-side identity binding are unverified. Keep this table outside the narrow maintenance revocation and test first-login behavior. |
| `utils/streak.js` | Anon-key server action S/U user_xp | No current caller found. Do not assume the `use server` marker authenticates its supplied userId. |
| `increment_xp(uid,amount)` | Public/application EXECUTE, SECURITY INVOKER, actual target rights depend on caller | No repository RPC caller found; body/policies/other callers pending. Public EXECUTE alone does not prove arbitrary XP modification. |

No shared attempt-writer beyond the normal PUT/client helper/proposed RPC was found. Battle code uses separate match/ELO tables and a `battle_xp_events` ledger, not a shared test-attempt writer; its ledger does not protect test/PYQ rewards. XP-table grants must also be assessed with leaderboard/profile initialization and all callers above, not just test submit.

**Current guarantees:** the normal RPC locks the owned base session before checking attempts; one cooperating commit stores attempt, answers, institute linkage and session state transactionally. Multiple/partial historical attempts fail closed. Generated operations lock their rows and store a stable private receipt. The same-worker queue reduces retries only inside one process.

**Missing guarantees:** an old/direct service-role INSERT need not take the session lock and can race the RPC. No new uniqueness is enforced on existing shared session attempts. A global unique index cannot be added over known historical duplicates. Callback rewards lack durable submission-linked evidence and can be lost, replayed by another path, or overwrite concurrent PYQ/test XP. Zero-correct tests still have goal/streak effects requiring a durable event even when correct-answer XP is zero.

Required future design (proposal, **not implemented in this review**): one private unique-per-session submission registry and receipt, plus reward events/outbox inserted in the same commit transaction. Preserve all historical attempts; only unambiguous complete history may be associated explicitly. All authorized writers must use the protocol. Restrict direct attempts/answers DML only after old workers/clients/jobs are drained; keep launch/institute authoring rights separately scoped. If broad service_role must remain, consider a dedicated runtime role and narrowly reviewed owner-only commit surface rather than pretending an application convention is database enforcement.

Consumer requirements: durable unique event keys per submission/source/reward type; worker claiming/retries; each effect and its applied-event marker committed atomically under appropriate row locks/unique constraints; replays return the same receipt without applying effects again. Multiple events for one user must preserve additive XP without last-writer overwrite. Goal date/timezone and badge award scope need explicit policy. An outbox plus nontransactional aggregate updates alone is insufficient. Do not infer historical payouts or subtract XP from the old duplicate counts.

## PostgreSQL 17.6 staging plan

This is a plan, not an executed staging run. Use an isolated **17.6** instance and verify `server_version_num=170006`. Match Supabase role attributes/membership/SET options, extension versions, postgres non-superuser executor/BYPASSRLS behavior, schema owners, default ACLs, RLS, reviewed defaults and relevant event triggers. A generic Docker postgres superuser or the existing reduced baseline is not an adequate production replica. Use only synthetic students/answers, but reproduce required institute fields, all FK delete actions, global/schema defaults, column grants and historical duplicate/partial patterns. Isolate credentials and disable real emails, billing and AI provider calls.

1. Capture target schema, privileges/defaults/roles, file digests and baseline app behavior. Record expected ACL differences; build a reviewed per-object restoration plan. Never copy production student records into the fixture or run the existing fixture baseline against production.
2. Apply the proposed narrow table correction in staging, then the independently reviewed creator-default changes. Check SQL row/column privileges, inherited/SET paths, unchanged service-role rights and unchanged auth/storage/community behavior. Verify simulated new objects as each actual creator do not regain browser maintenance grants; drop only disposable staging objects after the test.
3. Apply the exact revision-4 migration as the representative executor with all three feature flags off. Confirm three private tables, six functions, owner/RLS/path/ACL postconditions and no shared-row changes. Inject unexpected defaults, inherited MAINTAIN, column-only SELECT/UPDATE and app-owner membership; expect a transaction failure with no partial new objects. Test event-trigger side effects on a disposable clone first.
4. Run the existing database suite on fresh local socket fixtures (it is hardcoded to `/tmp:55435` and `zi_phase5_remediation_fixture[_digits]`). The suite creates roles/tables; run only on its isolated cluster. Existing `baseline.sql` lacks full production institute requirements and policies, so retain it as a unit fixture **and add a separate representative-schema integration run**, not a claim that its passing result covers production. Run the existing server/UI suites and an appropriate build only for the later code deployment candidate.
5. Run at least two independent app processes plus distinct DB connections against representative staging. Do not share the in-memory queue. Capture a request/event-to-receipt trace for each synthetic case below. Keep flags off except in the particular isolated test being exercised; AI generation stays off and generated content is injected synthetic fixture data.

| Regression | Required observation |
| --- | --- |
| Clerk signed out, first login/onboarding, returning user, webhook signature and retry | Proper 401/403/identity binding; existing profile/XP initialization behavior unchanged; no browser service key |
| PYQ MCQ/multiple/numerical, bookmark, paper/practice, results, leaderboard | Existing behavior preserved by ACL correction; replay/reward risk documented until separately fixed |
| Normal quick/custom/full/daily warmup, MCQ A/index 0, unanswered/NULL, numerical/multiple, marking/negative score | Correct saved answers/score/history/review/analytics; no answer-key disclosure before permitted review |
| Institute create/import/publish, assignment/batch access, launch and results | Required question/association writes succeed; other-institute/student denial; completed link references correct attempt |
| Concurrent same-session submit from 2+ workers (6–20 requests), lost ACK, refresh/timer/manual overlap | With RPC-only callers: one complete attempt/answer set and stable receipt. With legacy bypass: deliberately expose current gap; do not count it as pass |
| Wrong owner/source, duplicate/partial historical attempt, malformed payload | Denial/conflict without new attempts, rewards, automatic canonicalization or history mutation |
| Fail attempt/answer/institute/session operation; crash before commit/after commit/before callback/mid reward | All-or-nothing submission. Current callback gap must reproduce; future outbox must recover without duplicate effects |
| Concurrent test+PYQ XP, repeated goal completion, badge insert/XP boundary, zero correct | Stable additive aggregates and one effect per event only after durable reward implementation; current code cannot pass this gate |
| Generated fixture start/save/expiry/submit/resume across workers, bad revision, cross-owner | One private session/receipt; deadline server-enforced; no shared attempts, PYQ, XP, goals or official-question writes |
| Old direct insert after future DML restrictions | Denied across all runtime credentials and SET/inherited paths; launch/authoring/analytics still work |
| Lock timeout, migration failure, app rollback and approved private-data restore | Failure aborts cleanly; queued/in-flight requests handled; retained shared history verified |

Do not run TRUNCATE/MAINTAIN against shared staging fixtures merely to prove denial; inspect effective privileges and use disposable objects if a behavioral test is needed. Record observed/expected counts and before/after synthetic snapshots. A failure is a gate, not a reason to delete duplicates or grant broad access.

## Deployment order and per-stage decisions

| Stage | Decision today | Required evidence before promotion | Dependency classification |
| --- | --- | --- | --- |
| 0. Review/manual read-only evidence | **GO for review/manual checks**; no execution by this agent | Authorized operator captures complete fresh outputs and private conclusions | No write permission implied |
| 1. Existing-table maintenance ACL correction | **NO-GO to production**; candidate prepared | Fresh provenance/authority, representative 17.6 regression, exact diff/restore approval | Existing security debt; independent remediation stage |
| 2. Creator-default ACL correction | **NO-GO to production** | Global/schema scope review for each actual creator, authorized operator, cross-feature staging | Prevents recurrence; not a substitute for private-object ACL reset |
| 3. Revision-4 dormant schema install, flags off | **NO-GO to production** | Fresh schema/default/event-trigger/owner checks; private ACL isolation; 17.6 rehearsal; bounded-lock/backups; exact SQL approval | Mandatory migration safety gates |
| 4. Normal-bank atomic activation | **NO-GO** | RPC schema present; all writer deployments coordinated/drained; durable registry/enforcement/rewards or separately approved narrower guarantee | Activation gates; registry/outbox not yet implemented |
| 5. Generated fixture engine pilot | **NO-GO** | Dormant schema verified, private fixture E2E/privacy, rate/quota/access, and normal atomic behavior reviewed because engine flag also selects normal RPC branch | Activation; does not enable provider generation |
| 6. Public AI generation | **NO-GO** | Independent generation approval, provider quality/validation/quota/cost/access, all relevant security/regression gates | Public activation only; not needed to CREATE dormant objects |

Sequence after later approvals: refresh evidence → fix/recheck browser maintenance grants → fix/recheck creator defaults → rehearse exact schema in 17.6 → snapshot/approve/apply dormant migration → re-audit ACLs/owners → deploy compatible code with flags off → coordinate writers and durable reward cutover → independent normal-bank pilot → generated fixture pilot → separately approved public generation. Reassess each gate; no batch approval assumed. `ZI_GENERATED_TEST_ENGINE_ENABLED` also enables the bank RPC branch in the current PUT handler, so it is not an isolated generated-only switch. `ZI_AI_TEST_GENERATION_ENABLED` remains a separate provider gate.

**Mandatory for dormant migration safety:** current compatible schema/absence of name collisions; trusted reachable-role/owner configuration; reviewed DDL event-trigger effects and relevant defaults; effective private table/column/function ACL isolation; exact 17.6 rehearsal and bounded execution/recovery plan. The broad existing grants do not mathematically prevent CREATE of private tables because the migration resets private ACLs; this review retains a conservative release-policy hold until that existing exposure has an approved disposition. Do not confuse that hold with an inherent SQL incompatibility.

**Activation-only gaps:** distributed coordination of every submission writer, durable reward accounting, generated-source/expiry/HTTP E2E, provider quality/quota/cost and product access. Historical duplicates alone do not block this dormant migration (no unique shared index is added); ambiguous sessions must remain rejected rather than cleaned automatically. No duplicate deletion or global session index is part of this deployment order.

## Rollback and recovery strategy

- **Prefer application containment:** turn off provider generation, generated engine and normal atomic flag deliberately; drain in-flight work across every instance. Do not blindly route live traffic back to a race-prone legacy writer after a future DML-restricted cutover. Pause affected submits or roll forward under the reviewed protocol. Preserve canonical receipts and reward events across code rollback.
- **Failed transactional SQL:** rollback on error/timeout. Run post-failure catalog checks; event-trigger review must establish that no uncontrolled external side effect escapes transaction rollback. Do not retry blindly on an unknown state.
- **Privilege correction:** capture grantor/grantee/grant-option/default scope baseline first. Restore only exact approved changes when necessary, using a reviewed operator-specific restoration script. A blanket GRANT ALL would recreate the exposure. Default changes affect future objects only; reverting defaults does not repair objects created in the interval. This review does not generate or execute a broad privilege-restoration script without a fresh baseline.
- **Dormant schema:** prefer retaining disabled private tables/functions. If removal is explicitly approved, the existing rollback drops six routines and three private tables, no CASCADE, retaining all base sessions/attempts/questions. It permanently deletes private generated questions, evidence, answers and results. Export/verify a recoverable private backup first, check callers/dependencies, drain both submission paths, and obtain separate destructive approval. Never use it to roll back shared ACL changes; it does not do that.
- **Rewards/history:** do not undo a release by deleting receipts, attempts or ledger rows or subtracting estimated XP. Durable compensating events require an explicit reconciliation policy and provenance. Existing partial/duplicate history remains intact.

## Verification performed in this review

Read current source and SQL, traced call sites, verified unchanged forward/rollback digests, and statically checked the new audit statements for catalog-only SELECT scope. No SQL script or staging migration was executed. The previously recorded **212 passing entries on 16 October** (including local PostgreSQL 18) are historical evidence, not a new 17.6 result. No new app code or dependency changes were needed, so no new app build/test pass is claimed.

Stop after this review for the user's approval. The review package is ready; production readiness is not established.
