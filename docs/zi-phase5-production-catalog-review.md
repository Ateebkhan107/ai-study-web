# Phase 5 production catalog review — 16 October 2026

> Continued in the [22 October security/deployment review](zi-phase5-security-deployment-readiness-20261022.md), which adds current writer dependencies, fresh manual audits and stage-specific decisions. This document records the original supplied snapshot.

**Decision: NO-GO for production application or activation.** Structural compatibility checks pass against the supplied metadata. The remaining gates below require private review and separately approved deployment work. No production changes, audit execution, duplicate cleanup, rollback execution or generation activation occurred in this review.

## Evidence and scope

Source: the user's pasted `production_catalog_audit`, report `zi-phase52-catalog-single-json-v1`, captured **2026-10-16T10:52:17.583051+00:00**, executor `postgres`, PostgreSQL **17.6** (`170006`). This review used the chat export, not a raw JSON file on disk. Withheld expressions/bodies and omitted catalog categories remain unverified; an absence in this export is interpreted only within its stated scope. Historical data findings remain separate from this catalog-only snapshot.

Reviewed local artifacts:

- [Forward migration, revision 4](../db/migrations/20261016_zi_generated_tests.sql), unapplied to production.
- [Rollback](../db/rollbacks/20261016_zi_generated_tests.sql), never executed.
- [Prepared follow-up catalog query](../db/audits/20261016_zi_phase5_remaining_catalog_checks.sql), not executed.
- [Separate shared-privilege proposal](../db/proposals/zi-phase5-shared-privilege-remediation.md), not executed or approved.

SHA-256 of the exact reviewed SQL:

```text
forward   6f05ae3e8090cff0afba3699ddf4075b123ab8a918b3114b6926b93d11ce45c8
rollback  4c112690d72b95e9c004d6fd87c7dc8faa889cfd1473447d5522386db88895fa
```

## Confirmed compatibility

All six existing target tables are ordinary postgres-owned tables, with RLS enabled, no forced RLS, rewrite rules, partitions or inheritance. The three proposed generated tables and the proposed Zi routines are absent, consistent with an unapplied migration. Required UUID, text, integer, numeric, array, JSON and timestamp columns match the proposed SQL's uses; no identity or generated-column conflict was reported.

The exported target constraints contain primary keys, the institute composite unique constraint and foreign keys; **no CHECK or exclusion constraints** were reported. Target-table triggers are standard internal `pg_catalog.RI_FKey_*` triggers, with no custom table trigger. Thus the previous concern about a CHECK/custom table trigger rejecting practice `duration_minutes=0` or `status='completed'` is resolved by this snapshot. Their ordinary integer/text types permit these values. Defaults still need the private review described below.

Important existing relationships:

| Relationship | Delete action / implication |
| --- | --- |
| `institute_test_attempts.attempt_id → test_attempts.id` | SET NULL; deleting an attempt changes institute linkage |
| `institute_test_attempts.session_id → test_sessions.id` | SET NULL |
| `test_questions.test_attempt_id → test_attempts.id` | NO ACTION; may block attempt deletion |
| `user_answers.attempt_id → test_attempts.id` | CASCADE; deleting attempts deletes answers |
| `test_questions.question_id` and `institute_test_questions.question_id → questions.id` | NO ACTION |
| `user_answers.question_id → questions.id` | CASCADE |
| Shared `test_id` foreign keys → `tests.id` | CASCADE |
| Institute/institute-test foreign keys | CASCADE |

There is no exported FK on `test_attempts.session_id` or `test_questions.session_id`. `UNIQUE(institute_test_id, session_id)` on institute attempts is not global attempt/session uniqueness. `test_attempts` has only its ID primary-key index; no unconditional session uniqueness is present. The migration does not add a unique index on historical shared attempts, so existing duplicates do **not**, by themselves, make its CREATE statements fail. No historical rows should be deleted based on this review.

The verified executor `postgres` owns the shared tables and can CREATE in public. Browser roles, authenticator and service_role cannot CREATE there and are not members of postgres. The reverse membership (postgres being a member of application roles) does not grant application roles postgres ownership. These facts are compatible with the migration's owner guard if execution uses the reviewed role. Platform administrators and roles with global read/BYPASSRLS access remain trusted administrators, not student isolation failures.

## Confirmed privilege risk and local corrections

Both `anon` and `authenticated` have direct/effective SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER and **MAINTAIN** on all six existing tables. Public-schema table defaults for the observed creators `postgres` and `supabase_admin` can recreate these broad grants. Function defaults also grant application EXECUTE.

The empty policy list means ordinary row access is default-denied for non-bypass roles despite table grants. It does not neutralize TRUNCATE or REFERENCES, which RLS does not cover. This is a confirmed capability risk; the catalog does not prove that an existing public HTTP endpoint exposes arbitrary destructive SQL. See [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) and [GRANT](https://www.postgresql.org/docs/17/sql-grant.html).

Revision 4 keeps the explicit ACL reset on the three new private tables and six new functions. It additionally clears explicit nonowner column ACLs on those private tables and rejects effective column access that bypasses table-level checks. Its postcondition now includes PostgreSQL 17+ MAINTAIN, inherited mutation privileges, browser column SELECT, and server column mutation. Direct REVOKE cannot remove an inherited privilege, so verification fails closed when one remains. [PostgreSQL REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html) documents the separate column privilege syntax.

These corrections touch only new private objects. The migration does not silently revoke shared-table privileges, change global defaults or alter platform memberships. The separate proposal provides commented candidate TRUNCATE/MAINTAIN revocations and creator-default remediation for review. Changing supabase_admin defaults requires an appropriately authorized role; postgres authority must not be assumed. Existing row grants/policies must be reviewed against legitimate clients before any broader change.

## Existing routines and submission reliability

`increment_xp(uid text, amount integer)` is a volatile SECURITY INVOKER routine with public/application EXECUTE and no pinned search_path. Its body and `user_xp` permissions/policies are withheld or outside this export. That warrants private reward-path review; it does not establish an arbitrary-XP exploit or prove exactly-once rewards. The proposed migration does not invoke it. The community SECURITY DEFINER routines and trigger-returning `handle_new_user` are not modified here; EXECUTE on an internal/trigger routine is not proof it can run as an ordinary RPC.

Historical evidence remains 21 duplicate groups / 36 excess attempts in the earlier bounded snapshot; this export does not rescan or reconfirm their present counts. Incoming FK actions make blanket deletion unsafe even where earlier bounded checks found no references. Ambiguous historical submissions remain a safe conflict rather than a guessed canonical result.

Activation still requires all shared submission writers to use a durable coordinated commit path. The default-off normal-bank atomic flag and same-worker queue do not coordinate legacy writes across workers. A service-role caller can still bypass an RPC by writing directly. Reward callbacks have no durable attempt-linked ledger/outbox establishing exactly-once effects. Those are release gates, distinct from structural migration compatibility. Live provider quality/quota and generation validation gates also remain outstanding.

## Remaining private verification and approval gates

1. **DDL event triggers:** the original export did not inspect `pg_event_trigger`. Inspect enabled triggers, command tags and privately review any relevant bodies/dependencies before CREATE/GRANT/DROP execution. The absence of custom table triggers does not establish the absence of DDL side effects.
2. **Column ACLs:** inspect explicit/effective column grants omitted from the original query. Revision 4 handles new private objects, but shared-object grants and inherited access still need review.
3. **Defaults actually used by the routines:** privately verify UUID, timestamp, status and counter defaults, including called functions and their dependencies/side effects. Presence/type metadata alone does not validate an expression. The prepared follow-up exposes only dependency names; pinned built-ins may be absent from `pg_depend`, so empty dependencies do not replace expression review. No missing CHECK-body review is requested: none were reported for the target tables.
4. **Shared privilege remediation:** review legitimate consumers and approve exact SQL for the confirmed browser TRUNCATE/MAINTAIN grants and applicable creator defaults. Verify effective permissions after remediation; keep shared-row policy changes separately scoped.
5. **Representative PostgreSQL 17.6 staging:** validate the exact migration with the reviewed schema/defaults/roles/event triggers and normal/institute/generated paths. Local PostgreSQL 18 tests are useful evidence, not an exact production-version rehearsal. Retain explicit production migration approval afterward.

Before activation, also complete writer cutover, durable reward handling/private XP review, and provider-quality gates described above. No Phase 6 work is authorized by this review.

## Rollback review

Rollback drops only the six proposed functions and three private generated tables, with bounded lock/statement timeouts and no CASCADE. It retains **all** shared base sessions, attempts and questions. It permanently destroys private generated questions, validation evidence, saved answers and results; backup and explicit separate approval remain required. Its header now correctly requires both `ZI_GENERATED_TEST_ENGINE_ENABLED` and `ZI_BANK_ATOMIC_SUBMISSIONS_ENABLED` disabled, generation disabled, and active requests drained. No rollback statement was executed.

## Local verification

- Isolated local PostgreSQL 18: **25 passing entries**, including concurrent submissions, atomic reuse/conflicts, generated session behavior and new inherited MAINTAIN / column-only privilege tests. Fixtures were retained; no rollback was run.
- Server suites: **176 passing**; UI suites: **11 passing**. Total: **212 passing entries**, zero failures/skips.
- ESLint passed for the changed database test file. No app source changed in this review, and no new production build is claimed.
- The follow-up audit received static inspection only. No production SQL, application routine or audit query was executed during this review.

Stop here pending the private evidence and separate approval. Migration compatibility does not grant deployment or activation permission.
