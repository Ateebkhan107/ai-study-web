# PrepZii Phase 5 — PostgreSQL 17.6 staging results

2026-10-22 (Asia/Kolkata). **Synthetic database rehearsal completed. Overall production recommendation: NO-GO.** PostgreSQL compatibility and the cooperating goal-delivery protocol passed the executed checks. Two unrestricted legacy-writer paths still violate the intended system-wide guarantees.

No production connection, production SQL/grant change, PostgreSQL 18 database connection, deployment or AI generation activation occurred. All database writes were inside the explicitly approved isolated lab. Existing application edits were retained. No lab, fixture database or evidence was deleted.

## Verified endpoint and execution boundary

| Check | Actual result |
| --- | --- |
| Server | PostgreSQL 17.6; `server_version_num=170006` |
| Operator / session identity | `zi_phase5_lab_admin` |
| Data directory | `/private/tmp/prepzii-pg176.ujiylN/data` |
| Socket / port | `/tmp/prepzii-phase5-pg17` / 55436 |
| TCP | `listen_addresses=''`; verification connection address NULL |
| Filesystem owner / modes | Current OS user UID 501; lab/data/socket directories 0700; socket 0700 |
| Fixture database | `zi_phase5_security17_fixture`, owned by `zi_phase5_lab_admin` |

Before creation, the lab had only initdb's postgres/template databases and the bootstrap role. A read-only endpoint check passed before creating this one synthetic database. Every harness connection now guards version, data directory, socket, port, TCP isolation, current/session operator and database ownership **before** switching to a synthetic test role or running test SQL. The fixture/prototype SQL also has the stronger lab checks. All clients use the absolute lab psql binary and sanitized connection environments; no application .env, remote URL, password or service file is loaded.

The sandbox initially refused local socket access. The same read-only verification succeeded with local access permission; no endpoint mismatch occurred and no fixture ran before verification. `/dev/null` password-file warnings remain harmless diagnostics from the approved safeguard; local trust authentication does not use a password. Neither the PostgreSQL 18 endpoint nor production was used.

## Actual results and counts

The final successful DB runs contain **26 scenario passes**, represented by **29 Node test entries including three parent entries**, with zero failures/skips in those runs. Application coverage adds **189 server tests and 11 UI tests passing**. Parent entries are not extra security scenarios.

| Executed group | Final result | Limits |
| --- | --- | --- |
| Security/privilege/migration suite | **9 scenarios PASS** (10 entries) | Reduced catalog-shaped synthetic foundation |
| Goal acceptance suite, corrected run 2 | **8 scenarios PASS** (9 entries) | Cooperating delivery plus trusted source writers |
| Extended source/recovery suite, corrected run 2 | **9 scenarios PASS** (10 entries) | Includes two characterizations proving unacceptable legacy behavior |
| Existing server application tests | **189 PASS** | Mocked Clerk/Supabase/provider boundaries; no live HTTP identity service |
| Existing UI rendering tests | **11 PASS** after corrected invocation | Isolated React rendering, not browser end-to-end |
| Targeted ESLint and diff whitespace check | **PASS** | Changed harness/tests; no full-repository lint claim |

A passing characterization assertion is **not acceptance of the unsafe behavior**. In particular, the duplicate-attempt and XP-overwrite tests intentionally demonstrate product failures. They remain NO-GO conditions despite green test assertions.

## Confirmed database findings

### RLS and browser maintenance corrections

- All **16** targeted tables remain owned by synthetic postgres with RLS enabled. Browser direct/derived row permissions were preserved; policy absence still denies row visibility/mutation. Effective column UPDATE permission can be true while RLS blocks rows; ACL capability is not proof of accessible student data.
- After applying the existing table proposal unchanged, **0** of the 32 browser/table combinations has either TRUNCATE or MAINTAIN. Actual browser TRUNCATE attempts fail. Other table ACL entries match their pre-correction snapshot. Service-role maintenance remains available on all **16** tables, as this proposal intends.
- The seeded browser maintenance rights were direct grants from the synthetic owner. The injected inherited MAINTAIN path causes the correction/postcondition to abort, and its entire injection transaction rolls back. No hidden inheritance is silently revoked.
- The creator-default proposal applied unchanged for both postgres and supabase_admin. Probe tables created by each creator retain browser SELECT and service maintenance, without browser TRUNCATE/MAINTAIN. Unauthorized creator administration and artificial global-default drift correctly abort.
- Final explicit column ACL count on the target 16 tables is **0**, matching this fixture's observed production shape. No RLS policy was added or weakened to make a test pass.

These are exact-17.6 engine results against a synthetic model, not evidence that Supabase Auth/Storage/Realtime, Clerk sessions or all production dependencies have been exercised.

### Five goal-integrity defects: implemented path

| Defect | Executed result |
| --- | --- |
| Fabricated progress | **PASS at tested boundaries:** browser RPC/direct private-event writes denied; client action tests transmit only Clerk-verified owner identity, never supplied counts. No persisted event means no award. |
| Replayed activity | **PASS:** recreated PYQ attempt IDs for the same question/day create one event; formula book/day replay pays once; TEST source key survives duplicate attempt IDs. |
| Reward after failed persistence | **PASS:** source rollback leaves no event/XP; injected public-progress or XP-write failure rolls back progress, receipt and delivery effects. Retry succeeds once. |
| Missing reward after interruption | **PASS for recoverability:** durable source survives an omitted callback, explicit transaction rollback and termination of one in-flight delivery backend. A later delivery call awards once. Automatic retry/drainer availability remains untested/unconfigured. |
| Duplicate concurrent rewards | **PASS for cooperating delivery:** eight independent database connections produce one completion receipt and XP delta. |

The killed connection was selected by this fixture database, a dedicated synthetic application name, bootstrap connection user and NULL network address; exactly one matching backend was verified before termination. The server process itself was not killed or restarted. After its transaction aborted, the target balance, public progress and receipts were absent; retry produced exactly 20 XP and repeated delivery added nothing.

The source model proves accepted stored activity, not learning. Proposed policy remains one distinct answered PYQ question/day, one authorized formula-book access/day and one complete owned TEST session. Formula entitlement is enforced by the application route, not independently by the trusted service RPC. Goal-policy/cutover approval is still required before enabling this path for existing students.

### Normal submissions, generated storage and coaching subset

- Eight concurrent normal/coaching submission RPCs returned one attempt identity and one complete submitted institute association. Retry reused the result. Wrong-owner RPC calls were denied.
- With reward hooks installed, normal/coaching completion captured one TEST event and paid one 12-XP goal. Both independently committed legacy orders—answers first and institute association first—captured the event without losing it. Partial answers and wrong-owner sessions did not mint TEST events.
- The corrected Zi migration installed private tables/RPCs under the intended synthetic owner. Browser column access and direct service mutation of generated storage were denied. Four concurrent starts and four concurrent submissions stabilized; cross-owner start was denied. Synthetic literal MCQs were stored; no AI provider was called. Generated storage did not change normal shared attempts/answers or XP in that lifecycle test.
- Rollback SQL was rehearsed **inside an outer transaction**, where the three generated tables disappeared. The outer transaction then rolled back, restoring private objects/data; shared counts stayed unchanged. Before/after snapshots were saved. This tests transactional rollback statements and retention, not a committed production rollback followed by restore.

### Confirmed remaining failures

1. **FAIL — lifetime submission uniqueness across all writers.** A direct service-role INSERT still creates a second attempt for the same session despite the cooperating RPC lock. The subsequent RPC refuses the conflict safely. Final catalog still has **no unconditional unique session key on test_attempts**. Duplicate synthetic attempts were retained as evidence; none were deleted. The new TEST-event uniqueness prevents another goal payment but does not prevent duplicate submissions or base-reward replay.
2. **FAIL — global reward/balance integrity across all writers.** After a 20-XP goal receipt committed, a simulated legacy absolute upsert set the same synthetic user's balance to **7**, while receipts still recorded **20**. Final evidence retains this discrepancy. The cooperating reward function is additive/transactional, but legacy read/modify/upsert writers can erase its effect. Row-level uniqueness and a goal ledger alone cannot prevent this.

These failures require an all-writer cutover: authoritative submission registry/uniqueness, transactional base/test/PYQ/badge rewards, atomic balance updates, and restricted credentials that cannot bypass the permitted functions. Adding a unique index blindly is unsafe in the presence of retained historic duplicates; a separately reviewed resolution/cutover strategy is necessary. No historical cleanup or production privilege change was attempted.

## Failures investigated and safe local corrections

| Earlier run | Cause | Correction and rerun |
| --- | --- | --- |
| Goal run 1: installation FAIL before its eight scenarios | Representative nonsuperuser lacked database CREATE for the new private schema | Staging-only proposal now has the guarded bootstrap operator create that one schema `AUTHORIZATION postgres`, then switches to its owner. No database-wide CREATE grant was added. Goal run 2: all eight PASS. |
| Extended run 1: formula scenario FAIL | Harness refactor created formula_books under bootstrap, so the postgres-owned RPC could not read it | Synthetic table ownership corrected to postgres with existing rows retained; future fixture creation explicitly uses postgres. This is a model correction, not proof of production formula table ownership. Extended run 2 used fresh synthetic IDs, retained run 1 and passed all nine. |
| Combined application invocation: two UI files FAIL at import | React server condition used for both server tests and react-dom rendering tests | Reran UI files without the server-only condition: 11 PASS. The original invocation's 189 server tests passed. No React application workaround was added. |

All original failure logs and rows remain available. The initial failure totals are not hidden or relabeled as skips. Schema/ownership fixes changed only local staging SQL/harness code. The corrected Zi forward migration, rollback, 16-table correction and creator-default proposal remained byte-for-byte unchanged during this rehearsal.

Additional harness work: absolute pinned psql; full endpoint/owner guard; explicit manifest-based foundation reuse instead of recreating cluster roles; distinct synthetic run IDs; private snapshots before rollback; and recovery from an explicitly terminated synthetic worker without treating that expected termination as a changed endpoint. No fixture reset or database deletion was used.

## SKIPPED / not established

These are outside the executed assertions and must not be described as PASS:

- Actual private increment_xp implementation, real DDL watchers and the full production default-expression/extension set were **not loaded/executed**. The invoker control routine only tested RLS behavior; its passing result does not establish the actual routine's safety. Prior private static-review conclusions remain separate.
- Full Clerk HTTP/Server Action authentication, Supabase JWT/PostgREST role switching/schema reload, platform Auth/Storage/Realtime and Linux/ICU behavior.
- Full coaching membership, assignment, teacher/batch isolation, publish/import, review/analytics and browser navigation. Only the documented storage/submission association subset ran.
- Scheduled backlog draining, delivery SLA, cross-day/timezone/policy changes, very large backlog, all level thresholds, and existing-user reward receipt seeding/cutover.
- All-writer enforcement, production-like old-worker drain, complete base/test/PYQ/badge reward replay and atomicity. Two bypasses were demonstrated instead of fixed by narrowing the tests.
- Full-server crash/power-loss/restart, committed destructive rollback plus restored backup, or restoring the custom-format dump into another database. The dump is retained but restore was not claimed.
- A fresh offline production build in this turn. No production application code changed during this rehearsal; the last isolated build remains blocked by Google Fonts acquisition. Font assets/visual parity plan remains outstanding. No provider/network workaround was used.

## Evidence retained

Private directory: `/private/tmp/prepzii-pg176.ujiylN/evidence/phase5-20261022`.

Contains preflight, initial/final source hashes, both failed and successful TAP runs, before/after rollback snapshots, all final synthetic rows, final ACL/role/default metadata, application/UI logs, a **custom-format synthetic database backup** and SHA-256 manifest. Files were set to 0600 inside the private lab. The backup contains only this fixture's synthetic records and locally authored function definitions; no private production routine body or student export was loaded. It is not committed to Git.

Final catalog: 16 expected owners/RLS-enabled tables, 0 browser maintenance combinations, 16 service maintenance tables, 0 explicit target column ACLs, 0 lifetime session unique indexes; overwritten synthetic balance 7 versus goal receipts 20. Expected private-schema and formula-fixture owners are postgres. Final endpoint verification still matched the approved lab.

The lab/server and database are retained. Do not delete, reset or auto-rerun foundation creation. Each existing run is stateful evidence. Any further targeted rerun must use explicit foundation/setup reuse and fresh synthetic case IDs, with guarded endpoint checks. The approved plan's separate cleanup approval remains required.

## GO / NO-GO gates and next step

| Stage | Recommendation |
| --- | --- |
| Isolated PostgreSQL 17.6 runtime and executed synthetic compatibility checks | **GO — verified** |
| Further local hardening and synthetic rehearsal | **GO** |
| 16-table and creator-default corrections | **Synthetic engine gate PASS; production NO-GO until target-platform regression/rollout review and separate approval** |
| Standalone Clerk/counter security patch | **NO-GO for deployment yet:** coordinate older clients and explicitly accept paused goal earning with the new flag off; resolve build/release validation. It can remain independent of Zi. |
| Transactional goal rewards for existing students | **NO-GO:** remove XP overwrite/bypass writers, approve policy/history cutover, provide durable draining and representative integration coverage |
| Shared/dormant Zi migration to production | **NO-GO pending remaining target-platform safety/release review and approval.** Synthetic private ACL/DDL checks now pass; this is progress, not production approval. |
| Zi AI generation/public activation | **NO-GO:** global submission uniqueness, all-writer reward integrity and remaining authorization/integration gates unresolved |

Maintenance-only privilege proposals do not depend on enabling AI or resolving historical goal receipts. Conversely, a maintenance revoke cannot supply lifetime submission uniqueness or transactional rewards. Keep those rollout units separate. Duplicate/XP-writer failures block the corresponding submission/reward enablement; if a release claims all-writer protection, they are mandatory safety blockers for that release.

**Safest next step:** review the two retained bypass proofs, then implement the database-enforced submission registry and all-XP-writer transactional cutover locally, including credential restrictions and historical cutover design. Run those acceptance tests in this same isolated lab with fresh synthetic IDs. Separately arrange representative Supabase/Clerk/LMS integration and offline font/build validation. No production action is authorized by this report.
