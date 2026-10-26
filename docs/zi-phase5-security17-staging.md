# Synthetic PostgreSQL 17.6 staging preparation

> Historical preparation/implementation record. The authorized exact-17.6 rehearsal has now run; see [final staging results](zi-phase5-pg176-staging-final-report.md) for actual results, corrected fixture issues and remaining NO-GO gates.

> Authorized rehearsal attempt: [results and blocker](zi-phase5-staging-rehearsal-results.md). Exact 17.6 was unavailable; no database was created and all DB-dependent tests remain SKIPPED. Offline mocked tests and a network-denied build have separate results there. The fixture/proposal execution below remains unperformed.

**Prepared, not executed.** This document authorizes no database command or deployment. The available local psql reports 18.3; no 17.6 server was provisioned or started in this pass. A client version is not a server-version check.

## Prepared assets and boundaries

- [Synthetic foundation](../src/lib/tests/fixtures/security17.sql): fresh local database only; 16 target tables plus minimal referenced institute/test tables, observed role shape, broad initial public defaults/grants, RLS with no policies, relevant uniqueness/FK behavior and synthetic A/B XP rows. It contains no production record or private definition.
- [Opt-in smoke suite](../src/lib/tests/security17.test.mjs): hardcoded Unix socket `/tmp/prepzii-phase5-pg17`, port `55436`, database `zi_phase5_security17_fixture`, bootstrap user `zi_phase5_lab_admin`; strips PG connection environment and fails unless server version is **170006**. It does not read application .env files, remote URLs or service keys.
- [16-table correction, revision 2](../db/proposals/20261022_browser_table_maintenance_privileges.sql): execute as representative non-superuser postgres owner on staging only after review.
- [Two-creator defaults correction](../db/proposals/20261022_public_browser_maintenance_defaults.sql): separate transaction/approval unit; bootstrap administrator in this isolated test represents an operator authorized for both creators. Running it as the nonsuperuser postgres role must fail before any correction.
- Existing revision-4 forward migration and private-data rollback are loaded by the opt-in smoke suite **only on its guarded synthetic endpoint**. The rollback is prepared for a synthetic rehearsal; it has not been executed by this pass.

The synthetic invoker control function is deliberately named `zi_fixture_increment_control`. It is **not** increment_xp's private implementation. A passing control test proves only the direct invoker/RLS mechanism. No DDL watcher is reconstructed from its name, and no private expressions are inferred. Exact defaults, watches, extensions, complete coaching membership/assignment schema, API auth and full production columns still require a second representative integration environment after private review. The smoke suite must never be described as a full Supabase replica or an HTTP regression pass.

## Provisioning contract — later explicit local run

Use an independently verified PostgreSQL **17.6** binary on an isolated disposable cluster. Do not install/upgrade production or reuse the existing PostgreSQL 18 fixture. Initial cluster superuser must be `zi_phase5_lab_admin` so the foundation can create a separate nonsuperuser postgres role and a synthetic supabase_admin role without changing an existing cluster's roles.

Required server configuration: Unix sockets in `/tmp/prepzii-phase5-pg17`, port 55436, TCP listen disabled, local lab-only authentication, no external extensions/services. Create the exact database `zi_phase5_security17_fixture` owned by the bootstrap user. Confirm that the endpoint is local and the database is empty. Do not grant production credentials to this process. Ensure no ZI_PHASE5_SECURITY17_LOCAL opt-in leaks into normal test/CI environments.

After separately authorizing that disposable local run, the prepared command is:

```sh
ZI_PHASE5_SECURITY17_LOCAL=1 node --conditions=react-server --test src/lib/tests/security17.test.mjs
```

Run with a Node version supporting `node:module.registerHooks` for the separate app tests (the reviewed local runtime is Node 24). The database smoke uses psql on PATH and independently checks the server version. No shell command creating, destroying or connecting to a database was executed in this pass. The suite intentionally creates fixture roles/tables/rows, changes fixture grants/defaults and drops fixture generated tables during rollback; it is not a read-only script. The endpoint/operator/name/version guards must remain intact.

Use a **fresh disposable cluster/database for each full run**; role/table collisions fail rather than trigger cleanup. No automatic DROP DATABASE, reset or production-like cleanup is provided. Stop the local server after an approved run; retain failure evidence without private data under the lab policy.

## Smoke acceptance and known failures

| Prepared check | Acceptance / interpretation |
| --- | --- |
| Synthetic direct invoker control as anon/authenticated, targeting B | Zero affected XP rows; no browser owner/role bypass. Service control can update B, confirming why privileged caller authorization matters. Does not assess increment_xp's body. |
| Expanded table correction | All 16 lose browser TRUNCATE/MAINTAIN; other ACL entries unchanged; RLS still denies browser rows; service MAINTAIN remains in this proposal. |
| Inherited dangerous grant injection | Correction aborts and entire injection transaction rolls back. No unrelated membership is silently revoked. |
| Default authority and global drift | Nonsuperuser postgres cannot correct supabase_admin defaults; artificial global-default drift aborts. |
| Creator defaults | New empty tables created by each actual creator lack browser maintenance rights while SELECT and service rights remain. No production CREATE probe is allowed. |
| Dormant migration | Private RLS/ACL postconditions pass; browser keys/answers remain inaccessible; service has SELECT/approved RPC execution but no direct private writes. |
| Normal/coaching commit on 8 DB connections | One complete attempt/answer/institute link for cooperating RPC callers; same receipt. |
| Synthetic legacy direct INSERT | Currently succeeds and creates a duplicate despite the RPC lock. The test then expects safe conflict on RPC retry. This is deliberate **evidence of the activation blocker**, not an acceptable final distributed guarantee. |
| Generated synthetic lifecycle | Cross-owner start denied; concurrent starts/submits stabilize; no shared attempts/answers or XP change. No real AI provider call. |
| Synthetic rollback | Private tables removed; shared session/attempt/answer/XP row counts preserved. This checks retention with synthetic data, not a recoverable production backup. |

## Representative integration matrix — still required

Prepare a second isolated 17.6 integration environment with sanitized DDL/roles/extension versions and the privately reviewed dependencies. Do not commit or log raw function/default dumps. Match the nonsuperuser executor, app SET/INHERIT paths, 16 tables' empty policy state, column ACLs, creator defaults, real incoming FKs and public schema rights. Trace any deliberate differences from production in an operator-held manifest.

| Flow | Synthetic scenarios and acceptance |
| --- | --- |
| Private dependency evaluation | Run the actual privately reviewed increment_xp definition only in staging for A/B under anon/authenticated/service roles. Observe actual row deltas, nested effects and expected errors for no match, wrong owner, NULL/negative/large amount, replay and concurrency. No production mutation/rollback-wrapped probe. |
| DDL watchers/defaults | Load reviewed platform-compatible watcher/default behavior, isolate notifications/external services, rehearse CREATE/ALTER/REVOKE/DROP and lock timeout/rollback. Verify expected schema invalidation without granting broader rights. Names alone are not acceptance. |
| Clerk patch | Signed out, owner, other user, expired/missing/failed Clerk verification; assert no privileged call on rejection. Test both active PYQ-result and formula-book action calls through actual Server Action HTTP dispatch. Authorized flow still completes. |
| Coaching LMS | Create synthetic institutes I/J, teacher/student accounts, published/draft tests, batches, membership/removal and assignments. Author/import/publish, reject cross-institute/unassigned students, launch, submit, retry, teacher results/review; verify association and score links plus correct negative marking. |
| Existing tests/PYQ | Quick/custom/full/daily warmup, zero index answer, numerical/multiple/unanswered, expiry, practice duration 0, history/review/analytics, bookmarks/papers and first-login XP initialization; check Clerk identity and no premature key disclosure. |
| Privilege regressions | Compare every table and column right before/after (including service role), default ACLs for both creators, RLS and owner/SET graph. Public-schema correction must leave platform auth/storage/realtime/community behavior unchanged. |
| Fault injection | Fail answer/institute/session writes, cancel connection before commit, lose ACK, crash after commit and during each reward effect. Same canonical receipt, no partial committed submission, durable retry recovery. |
| Same-user reward fraud/replay | Submit the same verified source event twice and concurrently, switch supplied goal type/amount/date/source, race different events for one user and change day. Final design must produce one permitted effect per unique event; current identity-only action is not expected to pass event-replay acceptance. |
| All-writer enforcement | Two or more independent app workers and DB connections; include old normal handlers, direct service-key INSERT/UPDATE/DELETE, legacy helper without session, PYQ/goal/badge callbacks, imported jobs and nested routines. After final cutover, bypass credentials must be denied, never silently fall back to legacy writes. |
| Reward uniqueness | Badge uniqueness plus XP is atomic; goal completion event and progress/XP atomic; additive XP across test/PYQ; zero-correct tests still have exactly one permitted goal/streak effect. Existing row uniqueness alone is insufficient. |
| Recovery | Rehearse disabling code paths and draining all workers, permission correction rollback from exact baseline, private-data restore after approved synthetic rollback. Never reopen duplicate-prone legacy writes as an automatic fallback. |

Record SQLSTATE, canonical synthetic receipt/event IDs, before/after row and aggregate checks, expected denial and source/routine version. No skipped/unexecuted test is a pass. The old 212 PostgreSQL 18/unit entries and this pass's 14 mocked app entries are distinct from this still-unexecuted 17.6 plan.
