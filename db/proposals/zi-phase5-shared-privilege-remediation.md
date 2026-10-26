# Shared privilege remediation — proposal only, not approved for execution

> Local preparation update: the [hardening plan](../../docs/zi-phase5-local-hardening-plan.md) expands the existing-table candidate to **revision 2, all 16 confirmed tables**, and adds a [separate defaults proposal](20261022_public_browser_maintenance_defaults.sql). Both remain unexecuted and require their own staging/authority/production approval. Private dependencies and representative PostgreSQL 17.6 verification remain pending.

> 22 October follow-up: [current staged review](../../docs/zi-phase5-security-deployment-readiness-20261022.md) and [guarded existing-table candidate](20261022_browser_table_maintenance_privileges.sql). Default ACL changes remain separate: audit global as well as per-schema scope; per-schema REVOKE cannot cancel a global default grant. No SQL has been applied.

The user-supplied production catalog snapshot (2026-10-21 22:45:09 UTC,
PostgreSQL 17.6) confirms direct/effective TRUNCATE and MAINTAIN privileges for
anon/authenticated on all 16 audited public tables. RLS is enabled with
no policies; ordinary row reads/writes are default-denied, but table-wide
TRUNCATE is not covered by RLS. These grants are an existing capability risk,
not proof that a public HTTP endpoint currently exposes destructive SQL.

No shared privilege or production record was changed. This proposal is separate
from the new private-table migration so it cannot silently change existing app
behavior or Supabase platform roles/defaults.

Before a separate approved privilege migration:

1. Confirm legitimate direct clients and maintenance jobs. Audit all callable
   SQL/RPC and event-trigger paths, column grants and inherited grants.
2. Revoke browser/PUBLIC TRUNCATE and MAINTAIN privileges on the 16 named tables;
   verify effective permissions afterward, including via other roles.
3. Prevent the same privileges being reintroduced by public-schema defaults for
   both observed object creators, postgres and supabase_admin. Only an authorized
   role can change another creator's defaults; do not assume postgres can alter
   supabase_admin defaults. Preserve server/admin privileges deliberately.
4. Review browser TRIGGER/REFERENCES grants separately for least privilege. Do not
   indiscriminately change row-level privileges or add permissive RLS policies.
5. Verify on representative staging and obtain approval for the exact SQL.

Candidate SQL below is intentionally commented and **not executable as a file**:

```sql
-- REVOKE TRUNCATE, MAINTAIN ON TABLE
--   public.test_sessions, public.test_attempts, public.test_questions,
--   public.user_answers, public.institute_test_attempts, public.questions
--   , public.badges, public.daily_goals, public.institute_test_questions, public.institute_tests
--   , public.pyq_attempts, public.pyq_questions, public.user_badges, public.user_daily_goals
--   , public.user_profiles, public.user_xp
-- FROM PUBLIC, anon, authenticated;
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
--   REVOKE TRUNCATE, MAINTAIN ON TABLES FROM PUBLIC, anon, authenticated;
-- ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
--   REVOKE TRUNCATE, MAINTAIN ON TABLES FROM PUBLIC, anon, authenticated;
```

This does not solve duplicate submissions: the service role can still insert
shared attempts directly. Normal submission writer cutover and the separately
reviewed registry/commit/reward design remain necessary for activation. Existing
duplicates must remain intact unless an explicit archival/reconciliation plan is
approved. No unique index or cleanup is included here.
