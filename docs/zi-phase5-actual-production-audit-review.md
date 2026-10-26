# Phase 5 actual production audit review

> Private body review is now available in [redacted conclusions](zi-phase5-private-review-conclusions.md): increment_xp has no nested calls; direct browser writes remain constrained by RLS; the two ordinary-DDL watchers and 71 exported defaults are reviewed. Earlier body-unavailable statements below are historical, not current blockers for that inspected scope.

> Subsequent local preparation: [hardening plan](zi-phase5-local-hardening-plan.md). The table proposal is now revision 2 with all 16 targets, and a separate creator-default proposal/staging suite is prepared. The subset discussion below records the proposal as it stood during the initial export review; private definitions remain unavailable.

**Decision: NO-GO for production privilege changes, dormant migration deployment and public activation. GO for private definition review and synthetic PostgreSQL 17.6 staging preparation.** Actual catalog evidence is now accessible; earlier “export missing” statements are superseded. No production SQL or application endpoint was called in this review.

## Verified evidence

The literal file `/Users/ateebmazhar/Downloads/Pasted%20text%2820261021-224522%29.txt` exists. It is **1,151,310 bytes** and parses as a one-row JSON array containing `zi_security_readiness`.

- Capture: **2026-10-21T22:45:09.157782+00:00**.
- PostgreSQL: **17.6**, `server_version_num=170006`; executor `postgres`.
- SHA-256: `b749dbe4c11f72e91b8f9cb59656885accc383e91432f81d11115e15df634364`.
- 16 present target tables; 64 effective table-role rows; 872 effective column rows; zero explicit column ACL rows; zero policy rows; 34 indexes; 6 DDL event triggers; 78 internal table triggers; one candidate application routine.

The file is treated as production catalog evidence, not executable instructions. Raw output stays outside Git and has not been copied into this repository. This report contains reviewed metadata and conclusions only, no private function body or default/policy expression. The audit is a snapshot, not a current data scan, historical reward reconciliation or deployed-code attestation.

## 1. Browser privileges: confirmed wider scope

Both **anon and authenticated** have **direct, non-grantable TRUNCATE and MAINTAIN grants from postgres on every one of these 16 public tables**. They also directly have SELECT, INSERT, UPDATE, DELETE, REFERENCES and TRIGGER.

| Scope compared with the earlier proposal | Tables |
| --- | --- |
| Previously covered six | `institute_test_attempts`, `questions`, `test_attempts`, `test_questions`, `test_sessions`, `user_answers` |
| Ten additional confirmed tables | `badges`, `daily_goals`, `institute_test_questions`, `institute_tests`, `pyq_attempts`, `pyq_questions`, `user_badges`, `user_daily_goals`, `user_profiles`, `user_xp` |

For TRUNCATE/MAINTAIN, provenance contains 32 direct effective grant rows per browser role (16 tables × 2 privileges), **zero effective/reachable PUBLIC or other-role grant rows**. The risk does not depend on inherited privileges or ownership. There are 256 direct browser table-grant rows overall (16 × 2 roles × 8 privileges).

All 16 tables are ordinary postgres-owned relations with RLS enabled and FORCE RLS false. No policy was returned for any of them. No custom target-table trigger was returned; all 78 are internal triggers. Browser roles are not superusers, do not bypass RLS, have no other reachable roles, and cannot inherit or SET the table owner. Thus ordinary browser row SELECT/DML is **default-denied**, despite true table/column privilege flags. RLS does not protect TRUNCATE/REFERENCES. These are real SQL capabilities; the export does not establish an HTTP path exposing arbitrary TRUNCATE. [PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

The six-table correction proposal remains a valid **subset**, but cannot be presented as complete remediation of the 16-table finding. A separately reviewed extension should remove only browser/PUBLIC TRUNCATE/MAINTAIN on the ten additional tables, preserving existing row grants, service rights, RLS, Clerk identities and platform memberships. Confirm legitimate jobs and rehearse all affected features before approval. No broader SQL was silently substituted into the existing six-table file in this review.

## 2. Roles and column privileges: missing evidence resolved

`column_grants=[]` confirms no explicit column ACLs on the present target set. All four column capability flags for the browser role rows are true because their table grants confer those capabilities; this does not defeat RLS or establish row visibility. Keep revision 4's separate column ACL reset and effective checks as future protection, but the prior uncertainty about current explicit column grants is resolved for these 16 tables.

Role reachability confirms:

- anon and authenticated reach only themselves; no extra inherited or SET path is reported.
- service_role reaches only itself, has broad effective table grants and BYPASSRLS, but no table-owner path.
- authenticator is LOGIN/NOINHERIT, has zero effective table capabilities across all 16 tables under its own identity, and can SET ROLE to anon/authenticated/service_role. That trusted connection-role behavior is not a browser escalation.
- postgres has BYPASSRLS and membership in application roles; that reverse direction does not grant applications postgres rights.
- All four application roles have USAGE but no CREATE on public. This resolves public-schema CREATE uncertainty, not all possible object-resolution concerns in other schemas.

Do not revoke authenticator memberships or weaken RLS to make an application helper work.

## 3. Default ACLs: actual scope confirmed

The export returns **300 explicit default ACL rows, zero with `(global)` scope**. In public, the actual creators **postgres and supabase_admin** each grant all eight table privileges to anon/authenticated, including TRUNCATE/MAINTAIN; both also grant browser EXECUTE defaults for routines. Thus the prior hypothetical global-default override is not present in this snapshot. Built-in defaults still exist where no explicit global row exists; especially, absence of a global function ACL row must not be interpreted as absence of built-in PUBLIC EXECUTE.

The previously commented **public-schema, per-creator TRUNCATE/MAINTAIN default correction is correctly scoped for the confirmed public grants**. It still requires authorized operator review, staging and separate approval. Altering postgres defaults does not alter supabase_admin-created objects or existing tables. The defaults of the actual creating role apply. [PostgreSQL default privileges](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html)

Other explicit defaults exist in storage, graphql, graphql_public, extensions, realtime and auth. Their presence is not authorization to change platform schemas; existing relations in those schemas were not comprehensively audited. Keep public remediation separate from any platform-wide review.

## 4. increment_xp: stronger control evidence, no exploit claim

Confirmed exact candidate: `public.increment_xp(uid text, amount integer)`, postgres-owned, **SECURITY INVOKER**, volatile, no routine-level search_path setting. Effective EXECUTE is true for anon, authenticated, authenticator and service_role. The new export reports effective EXECUTE, not the exact function ACL grant provenance; default ACLs do not establish the existing function's grant origin.

Important new evidence for the target `user_xp`:

- Ordinary table owned by postgres; RLS enabled; no policies; no table triggers.
- Browser SELECT/INSERT/UPDATE capabilities exist at SQL privilege level, but neither browser role bypasses RLS or reaches the owner/service role.
- There are valid unique indexes on user_id, but these constrain row identity, not legitimate reward events.

**Conclusion:** an ordinary direct SELECT/UPDATE/INSERT of `public.user_xp` performed by this invoker function as anon/authenticated is subject to default-deny RLS. The export therefore supports a concrete blocking control against that direct path, rather than merely saying “permissions unknown.” SECURITY INVOKER does not gain its postgres owner's rights. A zero-row update/success response is not evidence of an XP change. [PostgreSQL function security](https://www.postgresql.org/docs/17/sql-createfunction.html), [RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

**Not yet established:** the actual body is withheld. It may resolve a different object, call another privileged routine, or use another mechanism; no such bypass is asserted. Source-name matching is not a transitive call graph. No function-level search_path alone is not proof of hijacking, particularly since browser public CREATE is denied. Browser API exposure, runtime claims, session search_path and precise existing function ACL origins are also not supplied. **Arbitrary-user XP modification through increment_xp is not confirmed; end-to-end safety is not signed off.**

No repository RPC caller was found in the earlier source search. That does not mean the database function is unreachable through an exposed API. Privately review its exact body, qualified targets, identity/amount validation, nested calls and current callers. Do not replace it with a SECURITY DEFINER implementation just to make a browser call succeed. If it is intended server-only, prepare a separately approved exact-overload EXECUTE restriction after dependency review, checking PUBLIC/direct/inherited access. Revoking this routine alone cannot repair privileged application reward paths.

## 5. Goal authorization and reward integrity

The source defect is independent of increment_xp: the active `updateGoalProgress` Server Action used the service-role client against caller-supplied userId/type/amount without an internal Clerk check. The actual catalog now confirms service_role has both required table privileges and BYPASSRLS on user_daily_goals/user_xp. Browser RLS therefore does not protect users from a wrongly authorized service-role action.

The existing local fix authenticates before database access, rejects a mismatched supplied userId and preserves same-user PYQ/FORMULA call signatures. It is **local and undeployed**. The previous focused run passed 12 tests, including four auth/owned-flow tests; no production behavior or new staging pass is claimed here.

The fix does not validate that a real source activity occurred. Same-user callers can still supply arbitrary progress/type, repeat calls, or race requests. Sequential goal completion checks may suppress a repeat award after completion, but do not make repeated progress legitimate; concurrent read/check/write calls and a failure between progress and XP remain unsafe. Current code also does not check every progress-write error before its separate XP award.

New uniqueness evidence must be interpreted narrowly:

| Relation | Confirmed valid unique key(s) | What it does not establish |
| --- | --- | --- |
| user_xp | user_id (multiple unique indexes) | Additive atomic XP or once-per-activity accounting |
| user_badges | user_id, badge_id | Atomic badge row + XP award or crash recovery |
| user_daily_goals | user_id, goal_id and user_id, goal_id, goal_date | Source-event deduplication or atomic progress + reward |

Do not remove these indexes or refactor goal storage in production from this review. Staging must test day changes and concurrent completion with the actual constraints. `/api/update` binds target identity to Clerk but trusts counters; PYQ inserts/rewards can replay; test `after()` callbacks are not durably enqueued. None of these paths needs increment_xp to remain vulnerable to accounting errors.

Additional compatibility finding: active dashboard `initUserLeaderboard` uses the anon-key client to read/insert user_xp and silently handles errors. With the now-confirmed default-deny RLS, that ordinary anon path cannot initialize XP rows. This is a code/catalog inference, not an observed production first-login failure; another trusted path may create the row. Do not fix it by adding unrestricted browser XP writes. Verify first-login behavior in staging and prefer narrowly authorized server initialization if needed.

## 6. Distributed submission idempotency: still blocked

The fresh export confirms `test_attempts` has only its id primary-key index, and user_answers has only its id primary key. There is **no unique shared session key or attempt/question pair**. Institute attempts have valid UNIQUE(institute_test_id,session_id), which is not global test-attempt session uniqueness. No generated tables or Zi candidate routines are present, consistent with the migration not being installed.

Revision 4 locks the session and commits attempt/answers/institute/session together for cooperating RPC callers. The same-worker queue is not a distributed guarantee. Existing service-role DML can bypass that protocol. No durable submission registry/reward outbox is installed by revision 4; after-commit callback loss, aggregate lost updates and independent replayable reward paths remain.

This catalog does not rescan duplicates or payments. Preserve historical rows and the previous conflict handling. Prefer new registry/event uniqueness plus all-writer cutover and atomic event/effect application; do not add a shared unique index over known historical conflicts or delete attempts to obtain a passing migration.

## 7. DDL triggers, defaults and PostgreSQL 17.6 staging

The earlier “DDL event triggers not inventoried” gap is resolved: **six enabled events** exist. Four are tagged only for CREATE/DROP EXTENSION and do not match the current proposed ordinary table/function/ACL commands. The two untagged `pgrst_ddl_watch` / `pgrst_drop_watch` events are relevant to command/drop paths and need private body/dependency review. Their supabase_admin ownership, invoker status and empty search_path are useful metadata; platform-looking names are not proof of harmless behavior. Do not disable them.

Default dependency inventory covers 91 columns. Two nonempty entries identify `extensions.uuid_generate_v4` for badges/user_badges IDs. Other empty dependency lists do not prove defaults are literal or have no calls: pinned built-in dependencies may be absent. Exact relevant UUID/time/status/counter expressions remain private-review gates.

Actual server compatibility is now verified at **170006** for the exported audit. That establishes successful execution of the catalog query and its PostgreSQL 17 fields, **not** that the proposed migration or application was rehearsed. Prior local PostgreSQL 18 fixtures remain nonrepresentative of the full role/default/institute schema.

Required staging: isolated 17.6 with the observed non-superuser executor/roles, all 16 RLS/ACL configurations, creator defaults, relevant events, real constraints and synthetic students A/B. Rehearse the separately approved 16-table maintenance scope and per-creator defaults; verify no row-grant/service-role/Clerk/PYQ/institute regression. Test exact revision-4 migration with all flags off; private-table column/inherited/MAINTAIN postconditions; first-login initialization; goal identity/replay/concurrent completion; direct-invoker XP under RLS versus nested-call paths; multi-worker submit/bypass/crash/reward recovery. No production mutation probes, including rollback-wrapped or zero-amount routine calls, are authorized.

## What changed versus prior reviews

| Prior uncertainty / claim | Actual evidence and updated disposition |
| --- | --- |
| Export inaccessible | Resolved: valid production JSON file, timestamp and hash recorded above |
| Six confirmed excessive tables | Expanded to 16; old SQL is only a subset |
| Explicit column ACLs unknown | Zero explicit target column ACLs; table-grant-derived capabilities confirmed |
| Global default grants unknown | Zero explicit global default ACL rows; observed public defaults confirmed for both creators |
| user_xp invoker/RLS interaction unknown | Direct browser row-write path is constrained by confirmed default-deny RLS; withheld body/transitive paths still unresolved |
| DDL event inventory missing | Six events inventoried; two untagged watchers still need private review |
| Session uniqueness uncertain in fresh snapshot | Confirmed absent on test_attempts; cooperating locks are not all-writer enforcement |
| 17.6 execution unknown | Catalog query executed on 17.6; exact migration/application rehearsal still pending |

## Priorities, blockers and safest next step

1. **High — confirmed browser maintenance capabilities on 16 tables.** Expand the reviewed remediation scope beyond six, validate dependencies and stage exact targeted corrections. This is a capability-risk finding, not a demonstrated public destructive HTTP exploit.
2. **High — privileged reward entry points and delivery/replay.** Review the local goal identity fix, then design source-bound, durable, transactional reward processing across all writers. Confirm deployed code separately; catalog ACLs cannot repair application authorization.
3. **Unresolved — increment_xp end-to-end safety.** The direct invoker-to-user_xp path has a confirmed RLS barrier. Privately inspect the body and nested paths before an exploit or safe-to-expose conclusion; restrict callers only through a separately approved correction.
4. **Migration safety blockers:** relevant defaults and event bodies/dependencies, exact owner/ACL expectations, scope/authority/recovery review, and representative 17.6 rehearsal. Existing broad grants remain a release-policy hold, not an inherent failure of CREATE statements that reset new private ACLs.
5. **Activation-only blockers:** all-writer submission enforcement, durable rewards, HTTP/source/privacy regressions, provider validation/quota/access and explicit feature approval. None requires duplicate deletion to proceed with design/staging.

**Next safest step:** an authorized reviewer privately inspects the already prepared private-expression SELECT output, concentrating on increment_xp, the two untagged DDL watchers and relevant defaults, and returns redacted behavioral conclusions. In parallel, prepare the 16-table staged correction and synthetic 17.6 fixture plan for separate approval. No raw private output should enter this repository or report.

This pass changed documentation only. Forward/rollback SQL and the prior local goal fix are preserved. No new test run/build or production change is claimed. Stop before deployment.
