-- MANUAL READ-ONLY AUDIT. PostgreSQL 17.6; NOT EXECUTED by Codex.
-- Exactly one catalog-only SELECT. No role switch, DDL, DML or application calls.
-- Missing permissions are a failed check: report the error; do not bypass it.
-- Output contains operational role/object names; keep it private.
WITH targets AS (
  SELECT c.oid,c.relname,c.relowner,c.relkind,c.relrowsecurity,c.relforcerowsecurity,c.relacl
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN
    ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions',
     'zi_generated_tests','zi_generated_questions','zi_generated_sessions',
     'user_xp','user_daily_goals','user_badges','daily_goals','badges','user_profiles',
     'pyq_attempts','pyq_questions','institute_tests','institute_test_questions')
), apps AS (
  SELECT oid,rolname FROM pg_catalog.pg_roles
  WHERE rolname IN ('anon','authenticated','authenticator','service_role')
), reach AS (
  SELECT a.rolname AS application_role,r.oid,r.rolname,
    pg_catalog.pg_has_role(a.oid,r.oid,'MEMBER') AS member,
    pg_catalog.pg_has_role(a.oid,r.oid,'USAGE') AS inherits_now,
    pg_catalog.pg_has_role(a.oid,r.oid,'SET') AS can_set_role
  FROM apps a CROSS JOIN pg_catalog.pg_roles r
  WHERE pg_catalog.pg_has_role(a.oid,r.oid,'MEMBER')
), grants AS (
  SELECT t.oid,t.relname AS table_name,t.relowner,a.grantee,a.grantor,a.privilege_type,a.is_grantable
  FROM targets t CROSS JOIN LATERAL
    pg_catalog.aclexplode(COALESCE(t.relacl,pg_catalog.acldefault('r',t.relowner))) a
), provenance AS (
  SELECT app.rolname AS application_role,g.table_name,g.privilege_type,
    CASE WHEN g.grantee=0 THEN 'PUBLIC'
      WHEN g.grantee=app.oid THEN 'direct' ELSE 'other_role' END AS grant_origin,
    CASE WHEN g.grantee=0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(g.grantee)::text END AS grantee,
    pg_catalog.pg_get_userbyid(g.grantor) AS grantor,g.is_grantable,
    CASE WHEN g.grantee=0 THEN true ELSE pg_catalog.pg_has_role(app.oid,g.grantee,'USAGE') END AS effective_now,
    CASE WHEN g.grantee=0 THEN true ELSE pg_catalog.pg_has_role(app.oid,g.grantee,'SET') END AS reachable_via_set
  FROM apps app CROSS JOIN grants g
), column_grants AS (
  SELECT t.relname AS table_name,c.attname AS column_name,
    CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(a.grantee)::text END AS grantee,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor,a.privilege_type,a.is_grantable
  FROM targets t JOIN pg_catalog.pg_attribute c ON c.attrelid=t.oid
  CROSS JOIN LATERAL pg_catalog.aclexplode(c.attacl) a
  WHERE c.attnum>0 AND NOT c.attisdropped
), column_effective AS (
  SELECT app.rolname AS application_role,t.relname AS table_name,c.attname AS column_name,
    pg_catalog.has_column_privilege(app.oid,t.oid,c.attnum,'SELECT') AS can_select,
    pg_catalog.has_column_privilege(app.oid,t.oid,c.attnum,'INSERT') AS can_insert,
    pg_catalog.has_column_privilege(app.oid,t.oid,c.attnum,'UPDATE') AS can_update,
    pg_catalog.has_column_privilege(app.oid,t.oid,c.attnum,'REFERENCES') AS can_reference
  FROM apps app CROSS JOIN targets t JOIN pg_catalog.pg_attribute c ON c.attrelid=t.oid
  WHERE c.attnum>0 AND NOT c.attisdropped
), effective_tables AS (
  SELECT app.rolname AS application_role,t.relname AS table_name,
    pg_catalog.pg_get_userbyid(t.relowner) AS owner,t.relkind,t.relrowsecurity,t.relforcerowsecurity,
    pg_catalog.pg_has_role(app.oid,t.relowner,'MEMBER') AS member_of_owner,
    pg_catalog.pg_has_role(app.oid,t.relowner,'USAGE') AS inherits_owner,
    pg_catalog.pg_has_role(app.oid,t.relowner,'SET') AS can_set_owner,
    pg_catalog.has_table_privilege(app.oid,t.oid,'SELECT') AS can_select,
    pg_catalog.has_table_privilege(app.oid,t.oid,'INSERT') AS can_insert,
    pg_catalog.has_table_privilege(app.oid,t.oid,'UPDATE') AS can_update,
    pg_catalog.has_table_privilege(app.oid,t.oid,'DELETE') AS can_delete,
    pg_catalog.has_table_privilege(app.oid,t.oid,'TRUNCATE') AS can_truncate,
    pg_catalog.has_table_privilege(app.oid,t.oid,'MAINTAIN') AS can_maintain,
    pg_catalog.has_table_privilege(app.oid,t.oid,'TRIGGER') AS can_trigger,
    pg_catalog.has_table_privilege(app.oid,t.oid,'REFERENCES') AS can_reference
  FROM apps app CROSS JOIN targets t
), defaults_acl AS (
  SELECT pg_catalog.pg_get_userbyid(d.defaclrole) AS creator,
    CASE WHEN d.defaclnamespace=0 THEN '(global)' ELSE n.nspname::text END AS schema_scope,
    d.defaclobjtype AS object_type,
    CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(a.grantee)::text END AS grantee,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor,a.privilege_type,a.is_grantable
  FROM pg_catalog.pg_default_acl d LEFT JOIN pg_catalog.pg_namespace n ON n.oid=d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) a
), defaults_meta AS (
  SELECT t.relname AS table_name,a.attname AS column_name,
    pg_catalog.format_type(a.atttypid,a.atttypmod) AS data_type,
    ARRAY(SELECT ns.nspname::text||'.'||p.proname::text
      FROM pg_catalog.pg_depend dep JOIN pg_catalog.pg_proc p ON p.oid=dep.refobjid
      JOIN pg_catalog.pg_namespace ns ON ns.oid=p.pronamespace
      WHERE dep.classid='pg_catalog.pg_attrdef'::pg_catalog.regclass AND dep.objid=d.oid
        AND dep.refclassid='pg_catalog.pg_proc'::pg_catalog.regclass
      ORDER BY ns.nspname,p.proname) AS recorded_function_dependencies,
    true AS expression_withheld
  FROM targets t JOIN pg_catalog.pg_attribute a ON a.attrelid=t.oid
  JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
  WHERE a.attnum>0 AND NOT a.attisdropped
), events AS (
  SELECT e.evtname,e.evtevent,e.evtenabled,e.evttags,
    pg_catalog.pg_get_userbyid(e.evtowner) AS event_owner,
    n.nspname AS function_schema,p.proname,
    pg_catalog.pg_get_userbyid(p.proowner) AS function_owner,p.prosecdef,l.lanname,
    ARRAY(SELECT setting FROM pg_catalog.unnest(p.proconfig) setting WHERE setting LIKE 'search_path=%') AS search_path
  FROM pg_catalog.pg_event_trigger e JOIN pg_catalog.pg_proc p ON p.oid=e.evtfoid
  JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
  JOIN pg_catalog.pg_language l ON l.oid=p.prolang
), functions AS (
  SELECT p.oid,n.nspname,p.proname,pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
    pg_catalog.pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.provolatile,
    ARRAY(SELECT setting FROM pg_catalog.unnest(p.proconfig) setting WHERE setting LIKE 'search_path=%') AS search_path,
    p.prosrc ~* '(test_attempts|user_answers|test_sessions|institute_test_attempts|user_xp|user_daily_goals|user_badges)' AS source_name_match
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND p.prokind IN ('f','p')
    AND (p.proname LIKE 'zi_%' OR p.proname='increment_xp'
      OR p.prosrc ~* '(test_attempts|user_answers|test_sessions|institute_test_attempts|user_xp|user_daily_goals|user_badges)')
), function_access AS (
  SELECT f.nspname,f.proname,f.arguments,app.rolname,
    pg_catalog.has_function_privilege(app.oid,f.oid,'EXECUTE') AS can_execute
  FROM functions f CROSS JOIN apps app
), indexes AS (
  SELECT t.relname AS table_name,ic.relname AS index_name,i.indisunique,i.indisprimary,
    i.indisvalid,i.indisready,i.indnullsnotdistinct,
    i.indpred IS NOT NULL AS partial,i.indexprs IS NOT NULL AS expression,
    i.indnkeyatts,
    ARRAY(SELECT a.attname FROM pg_catalog.unnest(i.indkey) WITH ORDINALITY k(attnum,ord)
      LEFT JOIN pg_catalog.pg_attribute a ON a.attrelid=t.oid AND a.attnum=k.attnum
      ORDER BY k.ord) AS columns_including_include
  FROM targets t JOIN pg_catalog.pg_index i ON i.indrelid=t.oid
  JOIN pg_catalog.pg_class ic ON ic.oid=i.indexrelid
)
SELECT pg_catalog.jsonb_build_object(
  'captured_at',pg_catalog.statement_timestamp(),'server_version_num',pg_catalog.current_setting('server_version_num'),
  'executor',CURRENT_USER,
  'public_schema_access',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('role',a.rolname,'usage',pg_catalog.has_schema_privilege(a.oid,n.oid,'USAGE'),'create',pg_catalog.has_schema_privilege(a.oid,n.oid,'CREATE'),'owner',pg_catalog.pg_get_userbyid(n.nspowner)) ORDER BY a.rolname) FROM apps a CROSS JOIN pg_catalog.pg_namespace n WHERE n.nspname='public'),'[]'::jsonb),
  'present_targets',COALESCE((SELECT pg_catalog.jsonb_agg(relname ORDER BY relname) FROM targets),'[]'::jsonb),
  'role_attributes',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('role',rolname,'superuser',rolsuper,'bypass_rls',rolbypassrls,'inherit',rolinherit,'login',rolcanlogin,'createrole',rolcreaterole) ORDER BY rolname) FROM pg_catalog.pg_roles),'[]'::jsonb),
  'membership_edges',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('member',pg_catalog.pg_get_userbyid(member),'role',pg_catalog.pg_get_userbyid(roleid),'grantor',pg_catalog.pg_get_userbyid(grantor),'inherit',inherit_option,'set',set_option,'admin',admin_option) ORDER BY member,roleid) FROM pg_catalog.pg_auth_members),'[]'::jsonb),
  'role_reachability',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(r) ORDER BY application_role,rolname) FROM reach r),'[]'::jsonb),
  'table_grant_provenance',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(g) ORDER BY application_role,table_name,privilege_type,grantee) FROM provenance g),'[]'::jsonb),
  'effective_tables',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) ORDER BY application_role,table_name) FROM effective_tables e),'[]'::jsonb),
  'column_grants',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) ORDER BY table_name,column_name,grantee) FROM column_grants c),'[]'::jsonb),
  'effective_columns',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) ORDER BY application_role,table_name,column_name) FROM column_effective c),'[]'::jsonb),
  'default_acl_rows_all_scopes',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(d) ORDER BY creator,schema_scope,object_type,grantee,privilege_type) FROM defaults_acl d),'[]'::jsonb),
  'default_dependencies',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(d) ORDER BY table_name,column_name) FROM defaults_meta d),'[]'::jsonb),
  'ddl_event_triggers',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) ORDER BY evtname) FROM events e),'[]'::jsonb),
  'target_table_triggers',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('table',t.relname,'trigger',tr.tgname,'enabled',tr.tgenabled,'internal',tr.tgisinternal,'function',tr.tgfoid::pg_catalog.regprocedure::text) ORDER BY t.relname,tr.tgname) FROM targets t JOIN pg_catalog.pg_trigger tr ON tr.tgrelid=t.oid),'[]'::jsonb),
  'policy_metadata',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('table',t.relname,'policy',p.polname,'command',p.polcmd,'permissive',p.polpermissive,'role_oids',p.polroles) ORDER BY t.relname,p.polname) FROM targets t JOIN pg_catalog.pg_policy p ON p.polrelid=t.oid),'[]'::jsonb),
  'function_candidates',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(f) ORDER BY nspname,proname,arguments) FROM functions f),'[]'::jsonb),
  'function_access',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(f) ORDER BY nspname,proname,arguments,rolname) FROM function_access f),'[]'::jsonb),
  'index_metadata',COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(i) ORDER BY table_name,index_name) FROM indexes i),'[]'::jsonb),
  'limitations',pg_catalog.jsonb_build_array(
    'Catalog snapshot only: no student records, defaults evaluated, application calls, or data modifications.',
    'Privilege functions report SQL capabilities, not RLS row visibility or HTTP exposure.',
    'Other-role ACL rows may be unrelated: use effective_now/reachable_via_set and role edges; do not label every ACL as inherited.',
    'Default ACL absence does not remove built-in defaults; global and schema defaults combine and only the actual creator defaults apply.',
    'Use the private-expressions companion to inspect exact defaults and relevant bodies; dependency/source-name matching is incomplete.',
    'Missing target names, roles or permission errors are unresolved evidence, not a pass.'
  )
) AS zi_security_readiness;
