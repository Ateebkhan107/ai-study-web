# Phase 5 final integrity hardening — local results

2026-10-22. **Local synthetic acceptance: PASS. Production deployment and Zi activation: NO-GO.** No production connection, SQL, grant change, deployment, AI call or historical cleanup was performed. All pre-existing checkout changes and prior lab evidence remain retained.

The earlier rehearsal demonstrated two real bypasses: direct legacy submission inserts could create duplicate attempts, and absolute XP overwrites could erase a committed reward. The new local contract rejects those operations. This report supersedes those two open findings **only for the tested synthetic contract**, not for the unchanged production database.

## Inventory and implementation

The [pre-change writer inventory](zi-phase5-final-integrity-writer-inventory.md) covers normal/coaching submission branches, compatibility RPCs, generated storage, PYQ, badges, profile initialization, goals, streaks, administrative replacement scripts and archived writers. Read-only analytics/profile consumers were distinguished from mutations. Unknown external jobs and production routine dependencies remain a cutover gate.

- `db/proposals/20261022_final_integrity_staging.sql` is an endpoint-guarded **lab prototype**, deliberately not executable against production. It requires the pre-existing synthetic schema, goal contract and dormant generated-test migration.
- A private session registry has a primary key on `session_id`. A mandatory attempt INSERT trigger reserves that key; conflicting INSERTs fail even when an old table owner bypasses ordinary RLS. Attempt identity cannot change. Registry entries have no cascading dependency that erases the lifetime reservation.
- Every existing non-null session group is reserved as HISTORY, including duplicates. Duplicate groups receive no invented canonical attempt. Complete, unambiguous historical submissions may return their old attempt; incomplete/ambiguous groups stop for review. Existing null-session attempts remain untouched; new null-session submissions are rejected. No unique index is blindly added to historical `test_attempts` rows.
- New normal/coaching submissions grade stored questions in the database and commit the attempt, answers, association, completion, XP, stats, streak and goal delivery in one transaction. The old `zi_commit_bank_submission` RPC delegates to this contract and ignores supplied result counters. Generated sessions remain in their separate storage contract and cannot become normal XP sources.
- A private common receipt key `(user_id, kind, source)` and per-user transaction lock serialize rewards. XP row locks and additive updates prevent lost increments. A private transaction-specific permit authorizes each balance change; client-settable settings cannot create permits. Unreceipted absolute writes fail, including through the tested old owner-definer simulation.
- PYQ uses an immutable request receipt, stored-answer grading and source entitlement independent of the client request key. A fresh key cannot repay an already answered question. Badge claim, badge marker, receipt and XP are transactional. Initialization inserts zero only when absent and never resets an existing profile. Formula capture and goal delivery now share the source transaction. Empty PYQ choices cannot advance XP, goal credits, solved stats or streaks.
- Runtime direct INSERT/UPDATE/DELETE on attempts, answers, XP, PYQ attempts, badge markers and public goal progress is denied, including column grants. Institute session-start INSERT remains available; association UPDATE is confined to the commit RPC. Service reads and approved source-specific RPCs remain available. Effective inherited and SET-only reachable permissions are checked; a surviving mutation grant aborts the proposal.
- Application absolute XP calculations were removed. Clerk ownership checks remain; numeric `addXP` requests are rejected. The new server path is controlled by `PREPZII_INTEGRITY_CONTRACT_ENABLED`, which was not added to any environment file or enabled in a running application. New RPC failure never falls back to direct writes. Legacy direct submission code remains a pre-cutover compatibility branch: after DB cutover it is denied and must not remain an active worker path.

The private NOLOGIN owner is a trusted, narrowly granted definer boundary with BYPASSRLS; browser/service roles cannot inherit or SET it. Existing table RLS was not disabled or weakened. Provisioning that owner on hosted Supabase is **not established** by this local superuser lab and needs separately reviewed platform authority; do not grant broader operator membership to work around a refusal.

## Actual verification

Every database test connection checks exact server `170006`, socket `/tmp/prepzii-phase5-pg17`, port `55436`, TCP disabled, current/session operator `zi_phase5_lab_admin`, database ownership and `/private/tmp/prepzii-pg176.ujiylN/data` before running SQL. Lab, data and socket directories remain owned by local UID 501 with mode 0700. Only `zi_phase5_security17_fixture` was used. PostgreSQL 18 was not contacted.

| Final verification | Result | Evidence / scope |
| --- | --- | --- |
| Final integrity DB suite | **22 scenarios PASS** | `final-integrity-run06.tap`, main parent; fresh run-6 IDs |
| Final catalog/default/rollback suite | **3 scenarios PASS** | Same log, second parent; 27 Node entries total including 2 parents; zero FAIL/SKIPPED |
| Existing plus focused server tests | **198 PASS** | `integrity-app-server.tap`; mocked identity/provider/API boundaries |
| Existing UI rendering tests | **11 PASS** | `integrity-app-ui.tap`; rendering, not live browser E2E |
| Targeted ESLint and whitespace validation | **PASS** | `integrity-targeted-eslint.log`, `integrity-final-tests-eslint.log`; not a full-repository lint claim |
| Fresh isolated production build | **FAIL** | `integrity-offline-build.log`; network intentionally denied, Google Fonts unavailable; later build stages unverified |
| Real Supabase/Clerk/PostgREST, full LMS/browser E2E | **SKIPPED** | No production or remote connections authorized |
| Real private routines/watchers/extensions in hosted environment | **SKIPPED** | Actual private production definitions were not copied/executed in this lab |
| Production cutover/committed disaster recovery | **SKIPPED** | No production action authorized; not inferred from transaction tests |

The 25 final DB scenarios cover historical row/balance preservation; duplicate-group reservation; direct, column, inherited and SET-only bypasses; eight-connection coaching retries; immutable retry payloads; legacy RPC scoring; numerical zero/multiple choice/unanswered marking; PYQ fresh-key replay and failed batches; simultaneous source rewards and initialization; absolute overwrites/fake authorization settings; concurrent badge claims; old badge markers; transaction failure; backend interruption/retry; generated storage isolation; formula replay; frozen historical goal periods; balance conservation; all 16 RLS tables; creator-default ACLs; and rollback without reopening unsafe writes.

For both `postgres` and `supabase_admin`, fresh public table probes retained browser SELECT and service row/maintenance privileges while browser TRUNCATE/MAINTAIN remained absent. Probes were rolled back. All 16 modeled tables retain RLS and browser SELECT; protected write restrictions are intentional. Synthetic role membership reflects PG17 INHERIT/SET distinctions. These are local verification results, not a new production audit.

Failure history is retained rather than hidden:

- Initial installation lacked temporary CREATE authority on the existing private schema; its transaction rolled back. The corrected installation passed.
- Run 1 had a test-harness role allowlist omission (`authenticator`); after correction, run 2 passed all 17 then-present scenarios. Runs 3 and 4 passed their expanded suites.
- A final new regression reproduced empty PYQ choices advancing an existing streak (run 5 expected `0:0`, actual `1:0`). The RPC now requires an answered choice before advancing streaks. Its first replacement attempt rolled back because the private owner correctly lacked public-schema CREATE. The corrected replacement temporarily grants CREATE inside the guarded transaction and revokes it before commit. Run 6 passed all affected and catalog scenarios.
- The offline build remains failed; no font mocking, network credentials, dependency installation or styling substitution was used to manufacture a pass.

## Historical preservation and cutover policy

Opening profiles preserve the exact prior balances and fields. Existing test/PYQ/badge sources and old goal receipts are reserved as consumed, with no retroactive payment. Existing public goal periods are frozen rather than guessed or recomputed; new activity in those reserved periods cannot overwrite progress or pay them again. Later dates can earn under the new verified-event contract.

**Approval is required for these policies:** PYQ base XP once per answered question lifetime (10 correct / 2 wrong, first answer determines entitlement); distinct-question/day PYQ goals; handling of already-open goal periods at cutover; and refusal of ambiguous/incomplete historic session retries. Existing missing historical rewards or previously damaged balances are preserved, not silently repaired. A separately approved reconciliation process would be necessary to change them.

Badge eligibility is now database-derived, but only the tested `tests_completed` badge policy has focused end-to-end claim coverage. The other supported policy types require parity tests. Current prototype stats deliberately exclude ambiguous duplicate sessions and deduplicate PYQ questions; track filtering, leaderboard tie rules, mock-score interpretation and speed rounding need product/compatibility review against the existing display analytics. Do not activate these badge policies on the strength of receipt tests alone.

## Safest deployment order — proposal only

1. Review the writer inventory and policies above. Complete representative private dependency, ACL/column/default-expression/DDL watcher review on fresh authorized catalog evidence. Enumerate external writers and every privileged routine capable of mutating source or ledger tables. Do not infer actual `increment_xp` safety from EXECUTE alone: it is invoker code; the lab demonstrates denied direct XP mutation and an old-definer simulation, not execution of the actual private production implementation.
2. Build a separate, reviewed production migration from this lab prototype. Resolve hosted role authority, exact schema/default/extension dependencies, null/duplicate historical groups and fractional score requirements. Retain immutable opening snapshots, source reservations and receipts. Take a restorable backup and rehearse restore privately. Run a **fresh complete installation/cutover rehearsal**: the retained lab was upgraded incrementally; all 14 final routine bodies are compared to source, but the final expanded source-table lock list has not been tested in a new one-shot install.
3. Prepare the non-AI security release and clients using the source-specific RPCs. Resolve the font/build failure using approved local assets and visual checks. Validate real Clerk ownership, PostgREST schema cache/error handling, profile/leaderboard/badge views, PYQ retakes and coaching enroll/start/submit/review under representative staging credentials. Establish metrics and a durable reconciliation runner for any pre-cutover or bounded-delivery backlog.
4. In an explicitly approved maintenance cutover, drain old workers, background jobs and in-flight writes. The proposed transaction locks sessions/questions/attempts/answers/XP/PYQ/badges/goal progress/institute associations and goal event/credit/progress/receipt tables before snapshot/seeding. Lock timeout aborts; no skipping locked sources or historical cleanup. Install registry/kernel/RPCs, reserve historical entitlements and restrict table/column grants atomically. Abort on inherited/SET/ownership/ACL drift. This is a design, not authorization to execute it.
5. Verify new contracts and permission postconditions before enabling the integrity flag on new workers. Keep Zi generation disabled. Older clients lacking request keys must receive a safe error or be upgraded; old direct writers must fail closed rather than receive old grants back. Monitor receipt conservation, conflicts, errors, pending credits and LMS completion. Stop new writes on an unexplained discrepancy.
6. Treat the 16-table maintenance correction, creator-default correction, all-writer integrity migration and dormant generated-test migration as separately reviewed approval units. Browser maintenance corrections alone do not establish XP or submission integrity. Coordinate final schema ordering; this prototype currently expects dormant generated tables already to exist. Public Zi activation has additional independent gates.

## Rollback and recovery

Before a cutover commit, rollback the whole transaction on any guard/lock/ACL error. After commit, pause affected write entry points and drain workers; preserve the new registry, opening profiles, receipts and balances. Roll back application behavior only to a vetted implementation that still uses the contract, or remain in a read-only/write-paused state. **Do not restore old direct grants, absolute XP upserts or callbacks, drop the registry/receipts, or replay historic rewards.** Prefer a forward repair. Restoring a backup after new writes would require explicit reconciliation and approval; transaction rollback tests do not prove a live committed restore workflow.

Backend termination tests prove recovery from an interrupted database transaction; lost-response retries prove replay safety after commit. Full host crash, backup restore, network partitions and automatic backlog draining remain untested. Exactly-once reward effects depend on durable source keys/receipts and transaction commit, plus retry availability—not an in-memory lock or a claim of exactly-once HTTP delivery.

## Release gates and evidence

| Stage | Decision |
| --- | --- |
| Continue local synthetic development | **GO**; two original bypasses blocked under the tested contract |
| Standalone Clerk/counter security release | **NO-GO for deployment today** pending successful build and coordinated compatibility/earning policy review; can be independent of Zi |
| 16-table/default ACL corrections | **NO-GO for execution** pending separate approval, fresh catalog/authority checks and representative regression validation |
| Submission/XP production cutover | **NO-GO** pending production-ready migration, policy/parity approvals, external-writer closure, fresh complete cutover/restore rehearsal and operational rollout plan |
| Dormant Zi migration / public generation | **NO-GO** for production migration approval; public activation additionally needs provider, quota/cost, abuse, grading and full E2E gates. No generation activated |

Private synthetic evidence remains under `/private/tmp/prepzii-pg176.ujiylN/evidence/phase5-20261022`. Original snapshots/dumps and failed logs remain intact. Final source hashes, function-body comparisons, conservation counters, new private snapshots and separate dumps are retained; no private production definitions or student data are included in this report. No Git commit was made.

Final readback (`integrity-release06-verification.json`) confirms **182 new receipts, 11 reserved historical session groups including 5 duplicate groups, zero new duplicate groups, zero stranded reservations, zero outstanding permits and zero balance-conservation violations**. All 14 prototype routine bodies match the final source. The private owner has no remaining public-schema CREATE privilege. `integrity-release06-snapshot.json` and `integrity-release06.dump` are new artifacts; earlier files were not replaced. `integrity-release06-sha256.json` records source/evidence hashes.

**Next safest step:** review this local contract and approve or revise the historical/PYQ/badge policies, then authorize a fresh representative staging cutover and recovery rehearsal. Production actions require separate explicit approval.
