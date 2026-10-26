-- PROPOSAL ONLY: not approved or executed. Review fresh catalog evidence first.
-- Revision 2: confirmed 16-table scope. PostgreSQL 17.6.
-- Minimum existing-table correction; no row DML or RLS changes.
-- Defaults are a SEPARATE approval unit; see the companion readiness review.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, pg_temp;
DO $preflight$
DECLARE target record; found_count integer := 0;
BEGIN
  FOR target IN
    SELECT c.relowner,c.relkind FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname IN
      ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions',
       'badges','daily_goals','institute_test_questions','institute_tests','pyq_attempts','pyq_questions',
       'user_badges','user_daily_goals','user_profiles','user_xp')
  LOOP
    found_count := found_count+1;
    IF target.relkind <> 'r' OR target.relowner <> CURRENT_USER::regrole::oid THEN
      RAISE EXCEPTION 'Unexpected target kind/owner; stop and review';
    END IF;
  END LOOP;
  IF found_count <> 16 OR current_setting('server_version_num')::integer <> 170006 THEN
    RAISE EXCEPTION 'Expected sixteen reviewed tables on PostgreSQL 17.6';
  END IF;
END $preflight$;
REVOKE TRUNCATE, MAINTAIN ON TABLE
  public.test_sessions, public.test_attempts, public.test_questions,
  public.user_answers, public.institute_test_attempts, public.questions,
  public.badges, public.daily_goals, public.institute_test_questions, public.institute_tests,
  public.pyq_attempts, public.pyq_questions, public.user_badges, public.user_daily_goals,
  public.user_profiles, public.user_xp
FROM PUBLIC, anon, authenticated RESTRICT;
-- REVOKE is additive-permission aware only through this explicit verification:
-- surviving inherited/SET ROLE grants cause the entire transaction to abort.
DO $postcondition$
DECLARE item record;
BEGIN
  FOR item IN
    SELECT app.rolname AS app_role,reachable.rolname AS reachable_role,c.oid,c.relowner
    FROM pg_catalog.pg_roles app CROSS JOIN pg_catalog.pg_roles reachable
    CROSS JOIN pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE app.rolname IN ('anon','authenticated')
      AND (pg_catalog.pg_has_role(app.oid,reachable.oid,'USAGE')
        OR pg_catalog.pg_has_role(app.oid,reachable.oid,'SET'))
      AND n.nspname='public' AND c.relname IN
        ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions',
         'badges','daily_goals','institute_test_questions','institute_tests','pyq_attempts','pyq_questions',
         'user_badges','user_daily_goals','user_profiles','user_xp')
  LOOP
    IF pg_catalog.has_table_privilege(item.reachable_role,item.oid,'TRUNCATE,MAINTAIN')
      OR pg_catalog.pg_has_role(item.reachable_role,item.relowner,'MEMBER') THEN
      RAISE EXCEPTION 'Unsafe remaining maintenance/owner path for % via %',item.app_role,item.reachable_role;
    END IF;
  END LOOP;
END $postcondition$;
COMMIT;
