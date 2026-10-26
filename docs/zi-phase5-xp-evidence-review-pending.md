# Phase 5 XP review — production export access pending

> Historical pending-evidence record. Export access is now resolved by the [actual production audit review](zi-phase5-actual-production-audit-review.md). It confirms user_xp default-deny RLS and the direct invoker-path barrier, while private body/dependency review remains pending. The local goal fix remains undeployed.

**NO-GO for production deployment, privilege changes, dormant migration or activation.** This pass found and corrected one independent application authorization defect locally. It has **not** reviewed the newly referenced uploaded `zi_security_readiness` JSON: no accessible attachment or matching local export was found. A local path has been requested. The user's export should be treated as actual production evidence once accessible; no current findings are invented or substituted from an older snapshot.

No production SQL, routine invocation, record change, permission revocation, duplicate deletion or AI generation was performed. No private function definition or secret was copied into this document.

## Priority 1: increment_xp — arbitrary-user modification is not established

The user reports anon/authenticated EXECUTE on `public.increment_xp(uid text, amount integer)`. The older 16 October production catalog also reported EXECUTE, SECURITY INVOKER and no routine-level search_path. Its body was withheld, and current `user_xp` row policies/column privileges were not established by that older snapshot. No repository implementation or application `.rpc('increment_xp', …)` caller was found. A browser RPC may still be callable without an in-repository caller if the schema/function is exposed through the API; current API exposure is not verified here.

The new catalog script intentionally returns routine metadata, Boolean source matches and policy metadata, **not** routine implementations or policy predicates. Even a complete export of that script cannot alone prove the function's actual target restrictions. The private-expression export or a private reviewer conclusion is also needed. Its absence must not be filled with a guessed function body.

Required chain of evidence:

1. Privately identify the exact overloaded routine, current body behavior, qualified/unqualified targets, identity/amount checks, nested calls and any definer dependencies. A uid parameter alone is not proof the body trusts it.
2. Establish invoker versus definer semantics and any role switching/caller-controlled resolution paths. SECURITY INVOKER uses caller privileges; it does not automatically gain the postgres owner's rights. A nested SECURITY DEFINER call can change the analysis. [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html)
3. Compare effective SELECT and UPDATE/INSERT privileges for the exact columns/relations the body touches, including direct, PUBLIC, inherited and SET paths. If the body reads the previous XP value, SELECT requirements matter too. No underlying permission can produce an error, rather than a write.
4. Privately inspect current RLS flags, applicable permissive/restrictive policy predicates, USING/WITH CHECK identity binding, target existence, owner/BYPASSRLS paths and nested trigger/function effects. RLS enabled with no applicable policy can make an invoker update affect no rows; a successful RPC response alone does not prove XP changed. Do not transfer the six shared test tables' no-policy finding to `user_xp`. [PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
5. Review verified Clerk claims and the actual API role used by each request. A normal browser cannot be assumed to have service_role credentials. Application server-side service-role writes must be reviewed separately because they can bypass RLS.

Conditional conclusions, pending that evidence:

| Privately verified behavior | Conclusion |
| --- | --- |
| Invoker permissions deny required column access, or applicable RLS denies other-user rows; no privileged dependency bypass | Cross-user RPC write blocked by the identified control; still review self-award/replay and future grants |
| Body accepts arbitrary uid, caller has underlying rights, and policies permit other-user writes or a nested privileged path bypasses isolation | Arbitrary-user XP modification confirmed from the complete authorization chain; prioritize containment |
| Policy/body binds uid to verified caller, but accepts arbitrary amount or repeat operations | Cross-user modification may be blocked while self-award/replay remains unsafe |
| Body/policies/role paths unknown | Unresolved; EXECUTE alone is not an exploit finding |

## Confirmed source finding and minimal local correction

`src/utils/updateGoalProgress.js` is an active `use server` action called by PYQ result and formula-book client pages. Before this local correction, it accepted a supplied userId and used the service-role client to update that user's daily progress and award XP without checking Clerk identity inside the action. This is a concrete source authorization defect separate from increment_xp. Actual deployed action availability and production exploit execution were not tested.

Local correction: authenticate with Clerk before any database access and reject a supplied userId that differs from the authenticated user. Existing same-user PYQ/FORMULA calls retain their signatures and behavior. Four behavioral tests prove signed-out/cross-user requests cause no privileged database work or XP awards, and valid owned calls retain progress/completion rewards. Adjacent reward/submission suites also pass: **12 tests total**, zero failures/skips. These use mocked auth/database adapters and make no production requests.

This correction does **not** establish legitimate activity provenance, restrict repeated same-user rewards, validate all caller-provided goal amounts/types, or make rewards transactional. A later durable source-event contract must replace client-controlled progress assertions. The action fix is local and undeployed; it does not claim existing production is protected.

Other inspected paths: `/api/update` derives its target from Clerk, so its client-supplied counters expose a same-user reward/replay problem rather than by themselves proving arbitrary-user targeting. `/api/pyq-attempts` also binds target identity to Clerk and scores server-side but lacks durable request replay protection. Test reward callbacks use service-role writes and lack transactional enqueue/recovery. Removing EXECUTE from increment_xp would not fix these independent paths.

## Minimal database correction options — proposals only

- Retain the existing six-table TRUNCATE/MAINTAIN proposal pending fresh provenance and authority checks. No blind service-role DML revocation, membership changes or permissive RLS additions.
- If private dependency/client review establishes increment_xp should be server-only, propose exact-overload EXECUTE revocation from PUBLIC, anon and authenticated, preserve only specifically required server execution, and verify effective inherited/SET access afterward. PUBLIC EXECUTE must be addressed; revoking only explicit anon/authenticated grants may leave it effective. This is a proposed containment option, not approved SQL and not proof of an exploit.
- Do not change the routine to SECURITY DEFINER to make a failing invoker call work. Trusted fixed search_path and fully qualified targets are appropriate after privately reviewing the exact implementation, but do not solve arbitrary reward authorization themselves.
- If browser roles can directly mutate XP through table/column grants, restricting the RPC alone is insufficient. Review that exposure and active anon-key XP-profile initialization before proposing exact table/policy corrections; do not break first-login/leaderboard behavior with GRANT/REVOKE guesses.
- Preserve historical attempts. A unique registry plus coordinated writer cutover can enforce new submission identity without a unique index over duplicate history; add durable reward events/outbox in the same transaction under separately reviewed SQL.

## Fresh audit comparison still needed

The latest accessible readiness report identifies the six shared test tables with direct anon/authenticated TRUNCATE/MAINTAIN, postgres ownership, no browser owner membership, authenticator NOINHERIT with SET paths, and broad creator defaults for postgres/supabase_admin. Those are **16 October evidence**, not newly verified facts from the inaccessible upload. The pending comparison must verify per-table direct/PUBLIC/other-role provenance, whether other-role grants are effective now or only reachable through SET, and whether the proposed correction's postcondition catches surviving paths.

For default ACLs, examine global and public-schema rows for each actual creator. Per-schema REVOKE cannot cancel a global grant; revoking function defaults alone does not change existing routine ACLs. Defaults apply for the creating role, not every inherited role's defaults. Do not infer existing `user_xp` privileges from new-object defaults.

PostgreSQL 17.6 supports MAINTAIN, membership INHERIT/SET options and the catalog fields used in the prepared queries. Exact execution/version evidence and a representative 17.6 rehearsal remain pending. The earlier PostgreSQL 18 fixture result is not a 17.6 pass.

Older index evidence shows no unique session protection on shared attempts, and the unchanged revision-4 migration adds none. Its row lock protects cooperating RPC writers only; legacy direct service-role inserts can bypass it. Recheck new `index_metadata`, including validity/readiness, expression/partial predicates and key versus INCLUDE columns. Institute composite uniqueness is not global attempt/session uniqueness. Do not create a shared unique index or delete duplicates to make a check pass.

## Safe verification and decision

Production: only inspect the already prepared manual catalog/private-expression SELECT results; keep raw private outputs outside Git and reports. Do not invoke increment_xp, including a zero-amount or rollback-wrapped probe: unknown triggers/dependencies may have effects, and no production write test is authorized.

Representative PostgreSQL 17.6 staging: use synthetic users A/B and the exact reviewed role/default/policy/function configuration. Test anon/authenticated A/service callers with A/B targets, permitted and denied writes, NULL/malformed/negative/large amounts, same-request replay, no matching row, nested routines, column-only/inherited/SET paths and API exposure. Inspect actual row deltas and privileged side effects on staging, not only HTTP status. Run goal-action signed-out/cross-user tests plus same-user behavior; then multi-worker test/PYQ/reward races, lost acknowledgements, crash recovery and duplicate/partial historical conflicts. No real provider, student or credential data is needed.

Priority order: (1) finish increment_xp body/permission/RLS assessment and review/deploy the independently verified action authorization fix through normal approval; (2) remediate confirmed browser maintenance capability with the narrow staged plan; (3) close self-award/replay, cross-worker submission enforcement and durable reward gaps before activation. A confirmed cross-user RPC path would raise immediate containment priority; current missing evidence must remain explicit.

**Decision:** GO for local review and synthetic verification preparation. NO-GO for production privilege correction, dormant migration and public activation until actual new evidence is accessible, relevant private findings and 17.6 regressions pass, and exact changes receive separate approval. Stop before deployment.
