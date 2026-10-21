-- OPTIONAL FOLLOW-UP, NOT EXECUTED: one catalog-only SELECT, one JSON result.
-- Covers gaps in the user-supplied audit (not student records).
-- No body/default-expression/trigger-argument text or arbitrary settings returned.
WITH targets AS (
  SELECT c.oid,c.relname,c.relowner FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN
    ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts',
     'questions','zi_generated_tests','zi_generated_questions','zi_generated_sessions')
    AND c.relkind IN ('r','p','v','m','f')
), apps AS (
  SELECT oid,rolname FROM pg_catalog.pg_roles
  WHERE rolname IN ('anon','authenticated','service_role','authenticator')
), events AS (
  SELECT e.evtname AS event_trigger,e.evtevent AS event_type,e.evtenabled AS enabled_mode,
    e.evttags AS command_tags,pg_catalog.pg_get_userbyid(e.evtowner) AS trigger_owner,
    n.nspname AS function_schema,p.proname AS function_name,
    pg_catalog.pg_get_function_identity_arguments(p.oid) AS identity_arguments,
    pg_catalog.pg_get_userbyid(p.proowner) AS function_owner,p.prosecdef AS security_definer,
    l.lanname AS language,
    ARRAY(SELECT setting FROM pg_catalog.unnest(p.proconfig) setting
      WHERE setting LIKE 'search_path=%') AS search_path_settings,
    true AS body_withheld
  FROM pg_catalog.pg_event_trigger e
  JOIN pg_catalog.pg_proc p ON p.oid=e.evtfoid
  JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
  JOIN pg_catalog.pg_language l ON l.oid=p.prolang
), column_grants AS (
  SELECT t.relname AS table_name,a.attname AS column_name,
    CASE WHEN acl.grantee=0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(acl.grantee)::pg_catalog.text END AS grantee,
    pg_catalog.pg_get_userbyid(acl.grantor) AS grantor,acl.privilege_type,acl.is_grantable
  FROM targets t JOIN pg_catalog.pg_attribute a ON a.attrelid=t.oid
  CROSS JOIN LATERAL pg_catalog.aclexplode(a.attacl) acl
  WHERE a.attnum>0 AND NOT a.attisdropped
), effective_columns AS (
  SELECT ar.rolname AS role_name,t.relname AS table_name,
    pg_catalog.has_any_column_privilege(ar.oid,t.oid,'SELECT') AS any_column_select,
    pg_catalog.has_any_column_privilege(ar.oid,t.oid,'INSERT,UPDATE,REFERENCES') AS any_column_mutation,
    CASE WHEN pg_catalog.current_setting('server_version_num')::integer>=170000
      THEN pg_catalog.has_table_privilege(ar.oid,t.oid,'MAINTAIN') ELSE NULL END AS can_maintain,
    pg_catalog.has_table_privilege(ar.oid,t.oid,'TRUNCATE') AS can_truncate
  FROM apps ar CROSS JOIN targets t
), defaults_metadata AS (
  SELECT t.relname AS table_name,a.attname AS column_name,
    pg_catalog.format_type(a.atttypid,a.atttypmod) AS data_type,
    ARRAY(SELECT ns.nspname::pg_catalog.text || '.' || p.proname::pg_catalog.text
      FROM pg_catalog.pg_depend dep JOIN pg_catalog.pg_proc p ON p.oid=dep.refobjid
      JOIN pg_catalog.pg_namespace ns ON ns.oid=p.pronamespace
      WHERE dep.classid='pg_catalog.pg_attrdef'::pg_catalog.regclass
        AND dep.objid=d.oid AND dep.refclassid='pg_catalog.pg_proc'::pg_catalog.regclass
      ORDER BY ns.nspname,p.proname) AS recorded_function_dependencies,
    true AS expression_withheld
  FROM targets t JOIN pg_catalog.pg_attribute a ON a.attrelid=t.oid
  JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
  WHERE a.attnum>0 AND NOT a.attisdropped
)
SELECT pg_catalog.jsonb_build_object(
  'captured_at',pg_catalog.statement_timestamp(),
  'server_version_num',pg_catalog.current_setting('server_version_num'),
  'executor_role',CURRENT_USER,
  'ddl_event_triggers',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) ORDER BY e.event_trigger) FROM events e),'[]'::pg_catalog.jsonb),
  'explicit_column_acl_grants',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) ORDER BY c.table_name,c.column_name,c.grantee,c.privilege_type) FROM column_grants c),'[]'::pg_catalog.jsonb),
  'effective_column_and_maintenance_privileges',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) ORDER BY c.table_name,c.role_name) FROM effective_columns c),'[]'::pg_catalog.jsonb),
  'default_dependency_metadata',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(d) ORDER BY d.table_name,d.column_name) FROM defaults_metadata d),'[]'::pg_catalog.jsonb),
  'limitations',pg_catalog.jsonb_build_array(
    'DDL event-trigger bodies must be reviewed privately before applying DDL; metadata does not prove that a trigger has no side effects.',
    'Recorded default-function dependencies can omit pinned built-in dependencies. An empty dependency list is not proof that a default contains no function.',
    'Exact UUID/timestamp/status/count default expressions require separate private review; they are not evaluated or disclosed here.',
    'No student tables are scanned, and no default, event-trigger or application function is executed.'
  )
) AS remaining_catalog_checks;
