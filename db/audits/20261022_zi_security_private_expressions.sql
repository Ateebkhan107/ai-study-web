-- MANUAL PRIVATE REVIEW ONLY. PostgreSQL 17.6; NOT EXECUTED by Codex.
-- One catalog SELECT; deparses definitions without evaluating defaults or bodies.
-- Output MAY contain embedded secrets or personal literals. Inspect privately;
-- return conclusions/redacted findings, not raw output, to chat or source control.
-- Permission errors must be reported, never bypassed.
WITH targets AS (
  SELECT c.oid,c.relname FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN
    ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions',
     'zi_generated_tests','zi_generated_questions','zi_generated_sessions',
     'user_xp','user_daily_goals','user_badges','daily_goals','badges','pyq_attempts')
), defaults AS (
  SELECT t.relname,a.attname,d.oid,pg_catalog.pg_get_expr(d.adbin,d.adrelid,false) AS expression
  FROM targets t JOIN pg_catalog.pg_attribute a ON a.attrelid=t.oid
  JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
  WHERE a.attnum>0 AND NOT a.attisdropped
), candidates AS (
  SELECT e.evtfoid AS oid FROM pg_catalog.pg_event_trigger e
  UNION
  SELECT tr.tgfoid FROM targets t JOIN pg_catalog.pg_trigger tr ON tr.tgrelid=t.oid
    WHERE NOT tr.tgisinternal
  UNION
  SELECT dep.refobjid FROM defaults d JOIN pg_catalog.pg_depend dep ON dep.objid=d.oid
    WHERE dep.classid='pg_catalog.pg_attrdef'::pg_catalog.regclass
      AND dep.refclassid='pg_catalog.pg_proc'::pg_catalog.regclass
  UNION
  SELECT p.oid FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND p.prokind IN ('f','p')
      AND (p.proname='increment_xp'
        OR p.prosrc ~* '(test_attempts|user_answers|test_sessions|institute_test_attempts|user_xp|user_daily_goals|user_badges)')
), bodies AS (
  SELECT n.nspname,p.proname,pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
    pg_catalog.pg_get_functiondef(p.oid) AS definition
  FROM candidates c JOIN pg_catalog.pg_proc p ON p.oid=c.oid
  JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND p.prokind IN ('f','p')
)
SELECT pg_catalog.jsonb_build_object(
  'captured_at',pg_catalog.statement_timestamp(),
  'server_version_num',pg_catalog.current_setting('server_version_num'),
  'defaults',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(d) ORDER BY relname,attname) FROM defaults d),'[]'::jsonb),
  'routine_definitions',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(b) ORDER BY nspname,proname,arguments) FROM bodies b),'[]'::jsonb),
  'policy_expressions',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('table',t.relname,'policy',p.polname,'using',pg_catalog.pg_get_expr(p.polqual,p.polrelid,false),'check',pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid,false)) ORDER BY t.relname,p.polname) FROM targets t JOIN pg_catalog.pg_policy p ON p.polrelid=t.oid),'[]'::jsonb),
  'limitations',pg_catalog.jsonb_build_array(
    'PRIVATE output: redact literals and bodies before sharing.',
    'No expression or application routine is executed. Review owner/search_path and called dependencies manually.',
    'Pinned built-ins may have no dependency row. Dynamic SQL and transitive function calls require further private inspection.',
    'This is not an exhaustive scan of external deployments, job schedulers or privileged writers.'
  )
) AS zi_private_expression_review;
