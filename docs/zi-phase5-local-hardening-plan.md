# Phase 5 local hardening preparation and approval gates

> Rehearsal update: [current results](zi-phase5-staging-rehearsal-results.md) record the unavailable exact 17.6 runtime, 199 offline passing test entries (including characterization of five failing reward-security criteria), and the blocked-font build failure. No database rehearsal or production action occurred.

> Private evidence update: [redacted private review conclusions](zi-phase5-private-review-conclusions.md) now inspect the supplied increment_xp body, relevant watchers and 71 defaults. The missing-private-export statements below record the earlier preparation state and are superseded for that reviewed scope. No staging or production execution has occurred.

**Completed locally:** 16-table proposal expansion, separate creator-default correction, synthetic 17.6 fixture/smoke preparation, goal-fix regression review and database enforcement design. **Private definition inspection remains blocked on the private export.** No production action is approved. No SQL was executed, database server provisioned, grants changed, code deployed, student data changed or generation flag enabled in this pass.

## Evidence and private inspection status

The verified production evidence remains the 21 October 2026 22:45:09 UTC `zi_security_readiness` export on PostgreSQL **17.6 / 170006**, SHA-256 `b749dbe4c11f72e91b8f9cb59656885accc383e91432f81d11115e15df634364`. The [actual production review](zi-phase5-actual-production-audit-review.md) confirms 16 direct browser maintenance-grant targets, no explicit target column ACLs/policies, no explicit global default ACL rows, six DDL events and increment_xp invoker metadata.

A bounded local inventory found only that metadata export, not `zi_private_expression_review`. The SQL query script is not its result. No repository implementation of increment_xp or platform watcher bodies is available. The private path has been requested. Missing bodies have not been fabricated, fetched from production or reconstructed from names.

| Dependency | Known evidence | Missing private acceptance evidence |
| --- | --- | --- |
| increment_xp(text,integer) | Invoker; app EXECUTE; no routine path; user_xp default-deny RLS, no table triggers; browser cannot reach owner/BYPASSRLS | Exact targets/resolution, identity/amount checks, nested privileged calls, existing function ACL origin and deployed API callers |
| pgrst_ddl_watch / pgrst_drop_watch | Enabled untagged command/drop events, invoker, supabase_admin-owned, empty path | Bodies/transitive calls and expected invalidation/notification behavior for proposed commands; isolated staging recovery |
| Four extension-tagged events | Only CREATE/DROP EXTENSION tags | Proposed changes do not create/drop extensions; review if scope changes, never disable them as a workaround |
| UUID/time/status/counter defaults | 91 defaults; two extensions.uuid_generate_v4 dependencies; other recorded lists empty | Exact relevant expressions/calls; pinned built-ins may be missing from pg_depend |

**Proof boundary:** direct ordinary user_xp writes by browser roles through an invoker routine face confirmed default-deny RLS. Arbitrary-user modification through increment_xp is **not proven**, and nested paths remain unresolved. The goal action's missing identity check was a **confirmed source defect**, independent of EXECUTE grants; deployed revision and historical exploitation are untested.

Private output must stay outside Git/reports/logs. Share only redacted behavioral conclusions. Trace dynamic SQL/transitive calls privately; names and source matching are not complete dependency proofs. Existing manual audit SELECTs remain unexecuted by this agent; local authorization does not authorize obtaining new production output.

## Concrete prepared changes

1. [Table proposal, revision 2](../db/proposals/20261022_browser_table_maintenance_privileges.sql): all **16 exact targets**, owner/ordinary-table/count and exact 170006 preflights, only browser/PUBLIC TRUNCATE/MAINTAIN revoked with RESTRICT, effective inherited/SET/owner postcondition. No row/column/service grant changes, RLS weakening, platform membership change, CASCADE or ALL TABLES scope.
2. [Separate defaults proposal](../db/proposals/20261022_public_browser_maintenance_defaults.sql): removes only public table-default browser maintenance rights for **postgres and supabase_admin** in one transaction. Requires authority for both creators; postgres alone must fail. Stops on explicit global table-default drift or surviving inherited rights. Existing objects, routine defaults, service defaults and platform schemas are untouched. [PostgreSQL default privileges](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html)
3. [Staging plan](zi-phase5-security17-staging.md), [synthetic foundation](../src/lib/tests/fixtures/security17.sql) and [opt-in smoke suite](../src/lib/tests/security17.test.mjs): prepared only. Reduced smoke schema is not a production replica or a substitute for private definitions.
4. Two new goal tests cover Clerk verification failure and missing identity. No additional production-source behavior was changed beyond the prior local Clerk fix.
5. [Durable submission/reward contract](zi-phase5-durable-submission-reward-contract.md): immutable receipts/source events, atomic effects, all-writer privilege cutover and recovery. Design only, not installed DDL.

Forward revision-4 migration and rollback are preserved. No dependency was installed; unrelated changes remain intact.

## Independent goal authorization patch path

The active goal Server Action serves PYQ-result and formula-book pages, independent of Zi generation:

1. A future patch review should contain only `src/utils/updateGoalProgress.js` and `src/lib/tests/goalAuthorization.test.mjs`, with the exact deployment base/dependencies reviewed. Do not stage all unrelated local work. No commit, PR or deployment is created now.
2. Installed Next.js documents Server Actions as independent untrusted entry points; page authentication is insufficient. The patch authenticates Clerk before queries, rejects a target mismatch and preserves same-user signatures. Missing-user calls now fail rather than silently returning, intentionally.
3. Run the six local checks plus actual Clerk preview/Server Action HTTP cases: signed out, A→B, missing/failed/expired identity cause no privileged DB work; legitimate A→A PYQ/FORMULA continues. Verify no privileged code/key enters client bundles.
4. Build/preview the **narrow candidate**, then request separate patch deployment approval. No SQL migration, ACL correction or Zi flag is a dependency of this check. Actual catalog evidence confirms why service-role bypass requires action-level authorization.
5. Confirm the deployed revision only after approval. State-changing synthetic-account production probes require explicit authorization; this review does not authorize awarding live XP.
6. If a regression appears, prefer pausing the goal action or rolling forward. Rolling back the identity check reopens the known source defect; do not use that as an automatic fallback.

**Remaining limitations:** caller-selected goal type/amount/activity, same-user replay, concurrent completion and separate progress/badge/XP writes are not secured. Some progress-write errors are not checked before XP. Existing unique row keys are insufficient. Error checks alone do not create transactional idempotency; do not label this patch a complete reward fix.

## Prioritized plan and acceptance gates

| Unit | Acceptance | Current decision |
| --- | --- | --- |
| P1 independent action patch | Six auth/owned-flow tests; actual preview Clerk HTTP checks; narrow candidate build; PYQ/formula regression | GO local review/preparation; **NO-GO production without separate patch approval** |
| P1 browser maintenance | 16 targets lose browser maintenance, all other ACLs/RLS/service rights unchanged, inherited/SET injections fail; coaching/PYQ/Clerk/profile regressions | Prepared; **NO-GO production** |
| P1 future defaults | Authorized dual-creator operator; no global drift; new disposable objects for both creators; other defaults preserved; exact recovery baseline | Separate proposal; **NO-GO production** |
| Private dependencies | Redacted increment_xp/watcher/default conclusions and transitive review; actual staging target/role/DDL effects observed | **Blocked on private export**; no full exploit/safe verdict |
| Representative 17.6 | Exact version/role/schema differences recorded; migration/ACL/default/rollback, private isolation and existing submission/LMS/auth HTTP checks pass | Preparation complete; **not executed** |
| All-writer submission contract | New registry/receipt transaction; old service/new runtime/browser/indirect bypass denied; 20 multi-worker submits yield one receipt; historical conflicts preserved | Design only, **not implemented** |
| Transactional rewards | Verified source events, atomic effect+marker, replay/crash/day/badge/zero-correct and additive test/PYQ XP tests pass | Design only, **not implemented** |
| Dormant Zi schema | Private dependencies, owner/ACL isolation, exact 17.6 rehearsal and backup/timeout/recovery scope approved | **NO-GO production** |
| Public generation | Security/idempotency/HTTP/provider quality/quota/access gates plus separate activation approval | **NO-GO; unchanged** |

Priorities do not imply execution permission. Private dependencies block SQL safety signoff, not preparation of the independent Clerk patch. Historical duplicates do not inherently prevent private CREATE statements; ambiguous sessions stay rejected. No duplicate cleanup/shared unique index is included.

## Recovery and separate approval packages

- Table/default changes need exact grantor/grantee/grant-option/column/scope baseline and expected deltas; restore only separately approved exact rights, never GRANT ALL. Default rollback does not repair objects created in the interval. Approve these units independently.
- Prefer disabled retention for dormant private schema. Existing rollback permanently drops private questions/evidence/answers/results and requires verified backup plus separate destructive approval. Drain normal atomic/generated users and keep generation off. A prepared synthetic rollback rehearsal does not approve production execution.
- Future receipts/events/constraints must survive code rollback. Roll forward or pause mutations; never reopen bypass DML automatically or subtract estimated XP/delete history. Administrators remain a trusted controlled boundary.

Before any production action, present the **exact files/digests, private redacted conclusions, representative passed tests, consumer/credential matrix, operator authority and recovery plan for that action**, then request explicit approval. Do not bundle patch deployment, table ACLs, creator defaults, dormant migration and activation into implied consent.

## Verification performed

**14 local mocked tests passed**, zero failures/skips: six goal checks and adjacent legacy-reward/bank checks. ESLint passed. The prepared staging suite passes JavaScript syntax checking only; no database or rollback was executed. SQL scope is statically inspected, not PostgreSQL-parsed/runtime-verified. No new app build or 17.6 pass is claimed.

**Next safest step:** provide the local private-export path or redacted reviewer conclusions, finish private dependency assessment, and review the isolated staging setup. Stop here; no production action is ready for immediate execution.
