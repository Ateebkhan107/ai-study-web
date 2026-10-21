-- ONE statement, ONE row, ONE JSON column: production_catalog_audit.
-- Paste the COMPLETE file into Supabase SQL Editor and run once.
-- Strictly catalog-only: no student-table scans, application functions, RPCs,
-- dynamic SQL, settings changes, transaction commands, or modifying CTEs.
-- Function bodies, arbitrary settings, stored expression/default text and trigger
-- arguments are NOT returned. Names below are operational database metadata.
-- Withheld CHECK/policy/index expressions and trigger/function bodies still need
-- a separate private review before migration compatibility can be approved.
-- Prepared and statically reviewed only; not executed by Codex.
WITH
target_names(name, expected_before_migration) AS (
  VALUES
    ('test_sessions', true), ('test_attempts', true),
    ('test_questions', true), ('user_answers', true),
    ('institute_test_attempts', true), ('questions', true),
    ('zi_generated_tests', false), ('zi_generated_questions', false),
    ('zi_generated_sessions', false)
),
relations AS (
  SELECT c.oid, n.nspname, c.relname, c.relowner, c.relkind,
    c.relrowsecurity, c.relforcerowsecurity, c.relhasrules, c.relacl,
    c.relispartition
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  JOIN target_names t ON t.name = c.relname
  WHERE n.nspname = 'public'
),
role_metadata AS (
  SELECT oid, rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb,
    rolcanlogin, rolbypassrls
  FROM pg_catalog.pg_roles
),
application_roles AS (
  SELECT * FROM role_metadata
  WHERE rolname IN ('anon', 'authenticated', 'service_role', 'authenticator')
),
target_triggers AS (
  SELECT t.oid, t.tgrelid, t.tgname, t.tgenabled, t.tgisinternal,
    t.tgfoid, t.tgtype, t.tgnargs, (t.tgqual IS NOT NULL) AS has_when_expression
  FROM pg_catalog.pg_trigger t
  JOIN relations r ON r.oid = t.tgrelid
),
target_functions AS (
  SELECT p.oid, n.nspname, p.proname, p.proowner, p.prosecdef, p.proconfig,
    p.proacl, p.provolatile, p.proleakproof, l.lanname,
    (n.nspname = 'public' AND p.proname IN (
      'zi_store_generated_test', 'zi_start_generated_test',
      'zi_validate_generated_answers', 'zi_save_generated_answers',
      'zi_submit_generated_test', 'zi_commit_bank_submission'
    )) AS proposed_rpc_name,
    (p.prosrc ~* '(test_attempts|user_xp|user_daily_goals|user_badges)')
      AS source_text_matches_attempt_or_reward_names
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_catalog.pg_language l ON l.oid = p.prolang
  WHERE p.prokind = 'f' AND (
    (n.nspname = 'public' AND (
      p.proname IN (
        'zi_store_generated_test', 'zi_start_generated_test',
        'zi_validate_generated_answers', 'zi_save_generated_answers',
        'zi_submit_generated_test', 'zi_commit_bank_submission', 'increment_xp'
      )
      OR p.prosecdef
      OR p.prosrc ~* '(test_attempts|user_xp|user_daily_goals|user_badges)'
    ))
    OR p.oid IN (SELECT tgfoid FROM target_triggers)
  )
),
relation_presence AS (
  SELECT t.name AS table_name, t.expected_before_migration,
    (r.oid IS NOT NULL) AS exists_in_catalog,
    r.relkind AS relation_kind, r.relispartition,
    pg_catalog.pg_get_userbyid(r.relowner) AS owner,
    r.relrowsecurity AS rls_enabled, r.relforcerowsecurity AS force_rls,
    r.relhasrules AS has_rewrite_rules,
    EXISTS (SELECT 1 FROM pg_catalog.pg_inherits h
      WHERE h.inhparent = r.oid OR h.inhrelid = r.oid) AS participates_in_inheritance
  FROM target_names t LEFT JOIN relations r ON r.relname = t.name
),
column_metadata AS (
  SELECT r.relname AS table_name, a.attnum AS ordinal, a.attname AS column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
    a.attnotnull AS not_null, (d.adbin IS NOT NULL) AS has_default,
    a.attidentity AS identity_kind, a.attgenerated AS generated_kind
  FROM relations r JOIN pg_catalog.pg_attribute a ON a.attrelid = r.oid
  LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attnum > 0 AND NOT a.attisdropped
),
constraint_metadata AS (
  SELECT con.oid AS constraint_oid, con.conname AS constraint_name,
    ns.nspname AS table_schema, c.relname AS table_name,
    fns.nspname AS referenced_schema, fc.relname AS referenced_table,
    con.contype AS constraint_type, con.convalidated AS validated,
    con.condeferrable AS deferrable, con.condeferred AS initially_deferred,
    con.connoinherit AS no_inherit,
    ARRAY(SELECT a.attname FROM pg_catalog.unnest(con.conkey)
      WITH ORDINALITY AS k(attnum, position)
      JOIN pg_catalog.pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum
      ORDER BY k.position) AS columns,
    ARRAY(SELECT a.attname FROM pg_catalog.unnest(con.confkey)
      WITH ORDINALITY AS k(attnum, position)
      JOIN pg_catalog.pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.attnum
      ORDER BY k.position) AS referenced_columns,
    CASE con.confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT'
      WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END AS on_delete,
    CASE con.confupdtype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT'
      WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END AS on_update,
    CASE WHEN con.contype IN ('f', 'p', 'u')
      THEN pg_catalog.pg_get_constraintdef(con.oid, true) ELSE NULL END AS structural_definition,
    (con.contype IN ('c', 'x')) AS expression_withheld,
    (con.contype = 'c' AND c.relname = 'test_sessions' AND EXISTS (
      SELECT 1 FROM pg_catalog.pg_attribute a
      WHERE a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
        AND a.attname IN ('status', 'duration_minutes')
    )) AS involves_session_status_or_duration
  FROM pg_catalog.pg_constraint con
  JOIN pg_catalog.pg_class c ON c.oid = con.conrelid
  JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
  LEFT JOIN pg_catalog.pg_class fc ON fc.oid = con.confrelid
  LEFT JOIN pg_catalog.pg_namespace fns ON fns.oid = fc.relnamespace
  WHERE con.conrelid IN (SELECT oid FROM relations)
     OR con.confrelid IN (SELECT oid FROM relations)
),
index_metadata AS (
  SELECT r.relname AS table_name, ic.relname AS index_name,
    i.indisprimary AS primary_index, i.indisunique AS unique_index,
    i.indisvalid AS valid, i.indisready AS ready,
    i.indnkeyatts AS key_column_count, i.indnatts AS total_column_count,
    (pg_catalog.to_jsonb(i) -> 'indnullsnotdistinct') AS nulls_not_distinct,
    ARRAY(SELECT CASE WHEN k.attnum = 0 THEN '[expression withheld]' ELSE a.attname::pg_catalog.text END
      FROM pg_catalog.unnest(i.indkey::pg_catalog.int2[]) WITH ORDINALITY AS k(attnum, position)
      LEFT JOIN pg_catalog.pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
      ORDER BY k.position) AS columns_including_include_columns,
    (i.indexprs IS NOT NULL) AS has_expression,
    (i.indpred IS NOT NULL) AS has_partial_predicate,
    (r.relname = 'test_attempts' AND i.indisunique AND i.indisvalid AND i.indisready
      AND i.indnkeyatts = 1 AND i.indexprs IS NULL AND i.indpred IS NULL
      AND EXISTS (SELECT 1 FROM pg_catalog.pg_attribute a
        WHERE a.attrelid = r.oid AND a.attname = 'session_id' AND a.attnum = i.indkey[0]))
      AS unconditional_unique_attempt_session_key
  FROM pg_catalog.pg_index i JOIN relations r ON r.oid = i.indrelid
  JOIN pg_catalog.pg_class ic ON ic.oid = i.indexrelid
),
trigger_metadata AS (
  SELECT r.relname AS table_name, t.tgname AS trigger_name,
    t.tgenabled AS enabled_mode, t.tgisinternal AS internal_trigger,
    t.tgtype AS event_timing_bitmask, t.tgnargs AS argument_count,
    t.has_when_expression, n.nspname AS function_schema, p.proname AS function_name,
    pg_catalog.pg_get_function_identity_arguments(p.oid) AS identity_arguments,
    pg_catalog.pg_get_userbyid(p.proowner) AS function_owner,
    p.prosecdef AS security_definer, true AS body_and_arguments_withheld
  FROM target_triggers t JOIN relations r ON r.oid = t.tgrelid
  JOIN pg_catalog.pg_proc p ON p.oid = t.tgfoid
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
),
policy_metadata AS (
  SELECT r.nspname AS schema_name, r.relname AS table_name,
    p.polname AS policy_name, p.polpermissive AS permissive, p.polcmd AS command,
    ARRAY(SELECT CASE WHEN role_oid = 0 THEN 'PUBLIC'
      ELSE pg_catalog.pg_get_userbyid(role_oid)::pg_catalog.text END
      FROM pg_catalog.unnest(p.polroles) role_oid) AS roles,
    (p.polqual IS NOT NULL) AS has_using_expression,
    (p.polwithcheck IS NOT NULL) AS has_check_expression,
    true AS expressions_withheld
  FROM pg_catalog.pg_policy p JOIN relations r ON r.oid = p.polrelid
),
table_acl_metadata AS (
  SELECT r.relname AS table_name,
    CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(a.grantee)::pg_catalog.text END AS grantee,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor, a.privilege_type, a.is_grantable,
    (r.relacl IS NULL) AS uses_builtin_default_acl
  FROM relations r
  CROSS JOIN LATERAL pg_catalog.aclexplode(COALESCE(r.relacl, pg_catalog.acldefault('r', r.relowner))) a
  WHERE r.relkind IN ('r', 'p', 'v', 'm', 'f')
),
effective_table_privileges AS (
  SELECT ar.rolname AS role_name, r.relname AS table_name,
    pg_catalog.has_table_privilege(ar.oid, r.oid, 'SELECT') AS can_select,
    pg_catalog.has_table_privilege(ar.oid, r.oid, 'INSERT') AS can_insert,
    pg_catalog.has_table_privilege(ar.oid, r.oid, 'UPDATE') AS can_update,
    pg_catalog.has_table_privilege(ar.oid, r.oid, 'DELETE') AS can_delete,
    pg_catalog.has_table_privilege(ar.oid, r.oid, 'TRUNCATE') AS can_truncate,
    pg_catalog.has_table_privilege(ar.oid, r.oid, 'REFERENCES') AS can_reference,
    pg_catalog.has_table_privilege(ar.oid, r.oid, 'TRIGGER') AS can_trigger,
    pg_catalog.pg_has_role(ar.oid, r.relowner, 'MEMBER') AS member_of_owner,
    pg_catalog.pg_has_role(ar.oid, r.relowner, 'USAGE') AS inherits_owner_now
  FROM application_roles ar CROSS JOIN relations r
  WHERE r.relkind IN ('r', 'p', 'v', 'm', 'f')
),
schema_acl_metadata AS (
  SELECT n.nspname AS schema_name, pg_catalog.pg_get_userbyid(n.nspowner) AS owner,
    CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(a.grantee)::pg_catalog.text END AS grantee,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor, a.privilege_type, a.is_grantable
  FROM pg_catalog.pg_namespace n
  CROSS JOIN LATERAL pg_catalog.aclexplode(COALESCE(n.nspacl, pg_catalog.acldefault('n', n.nspowner))) a
  WHERE n.nspname IN ('public', 'pg_catalog')
),
public_schema_effective AS (
  SELECT r.rolname AS role_name,
    pg_catalog.has_schema_privilege(r.oid, n.oid, 'USAGE') AS can_use,
    pg_catalog.has_schema_privilege(r.oid, n.oid, 'CREATE') AS can_create
  FROM role_metadata r CROSS JOIN pg_catalog.pg_namespace n WHERE n.nspname = 'public'
),
default_acl_metadata AS (
  SELECT pg_catalog.pg_get_userbyid(d.defaclrole) AS object_creator,
    CASE WHEN d.defaclnamespace = 0 THEN '[global]' ELSE n.nspname::pg_catalog.text END AS schema_name,
    d.defaclobjtype AS object_type,
    CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(a.grantee)::pg_catalog.text END AS grantee,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor, a.privilege_type, a.is_grantable
  FROM pg_catalog.pg_default_acl d
  LEFT JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) a
),
role_memberships AS (
  SELECT pg_catalog.pg_get_userbyid(m.roleid) AS granted_role,
    pg_catalog.pg_get_userbyid(m.member) AS member,
    pg_catalog.pg_get_userbyid(m.grantor) AS grantor, m.admin_option,
    pg_catalog.to_jsonb(m) -> 'inherit_option' AS inherit_option,
    pg_catalog.to_jsonb(m) -> 'set_option' AS set_option
  FROM pg_catalog.pg_auth_members m
),
application_role_reachability AS (
  SELECT ar.rolname AS application_role, parent.rolname AS reachable_role,
    pg_catalog.pg_has_role(ar.oid, parent.oid, 'USAGE') AS inherits_now
  FROM application_roles ar CROSS JOIN role_metadata parent
  WHERE pg_catalog.pg_has_role(ar.oid, parent.oid, 'MEMBER')
),
executor_role_reachability AS (
  SELECT ar.rolname AS application_role, executor.rolname AS executor_role,
    pg_catalog.pg_has_role(ar.oid, executor.oid, 'MEMBER') AS member_of_executor,
    pg_catalog.pg_has_role(ar.oid, executor.oid, 'USAGE') AS inherits_executor_now
  FROM application_roles ar CROSS JOIN role_metadata executor
  WHERE executor.rolname = CURRENT_USER
),
function_metadata AS (
  SELECT f.nspname AS schema_name, f.proname AS function_name,
    pg_catalog.pg_get_function_identity_arguments(f.oid) AS identity_arguments,
    pg_catalog.pg_get_userbyid(f.proowner) AS owner,
    f.prosecdef AS security_definer, f.provolatile AS volatility,
    f.proleakproof AS leakproof, f.lanname AS language,
    ARRAY(SELECT setting FROM pg_catalog.unnest(f.proconfig) setting
      WHERE setting LIKE 'search_path=%') AS search_path_settings,
    f.proposed_rpc_name, f.source_text_matches_attempt_or_reward_names,
    true AS body_and_other_settings_withheld
  FROM target_functions f
),
function_acl_metadata AS (
  SELECT f.nspname AS schema_name, f.proname AS function_name,
    pg_catalog.pg_get_function_identity_arguments(f.oid) AS identity_arguments,
    CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_catalog.pg_get_userbyid(a.grantee)::pg_catalog.text END AS grantee,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor, a.privilege_type, a.is_grantable,
    (f.proacl IS NULL) AS uses_builtin_default_acl
  FROM target_functions f
  CROSS JOIN LATERAL pg_catalog.aclexplode(COALESCE(f.proacl, pg_catalog.acldefault('f', f.proowner))) a
),
effective_function_privileges AS (
  SELECT ar.rolname AS role_name, f.nspname AS schema_name, f.proname AS function_name,
    pg_catalog.pg_get_function_identity_arguments(f.oid) AS identity_arguments,
    pg_catalog.has_function_privilege(ar.oid, f.oid, 'EXECUTE') AS can_execute,
    pg_catalog.pg_has_role(ar.oid, f.proowner, 'MEMBER') AS member_of_owner,
    pg_catalog.pg_has_role(ar.oid, f.proowner, 'USAGE') AS inherits_owner_now
  FROM application_roles ar CROSS JOIN target_functions f
)
SELECT pg_catalog.jsonb_build_object(
  'report_version', 'zi-phase52-catalog-single-json-v1',
  'captured_at', pg_catalog.statement_timestamp(),
  'executor_role', CURRENT_USER,
  'server_version_num', pg_catalog.current_setting('server_version_num'),
  'scope', pg_catalog.jsonb_build_object(
    'catalog_only', true, 'application_records_read', false,
    'application_functions_executed', false, 'database_changes_requested', false,
    'student_identifiers_or_answers_returned', false,
    'bodies_and_sensitive_expressions_withheld', true
  ),
  'relations', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_name) FROM relation_presence x), '[]'::pg_catalog.jsonb),
  'columns', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_name, x.ordinal) FROM column_metadata x), '[]'::pg_catalog.jsonb),
  'constraints_including_incoming_foreign_keys', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_schema, x.table_name, x.constraint_name) FROM constraint_metadata x), '[]'::pg_catalog.jsonb),
  'indexes', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_name, x.index_name) FROM index_metadata x), '[]'::pg_catalog.jsonb),
  'triggers', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_name, x.trigger_name) FROM trigger_metadata x), '[]'::pg_catalog.jsonb),
  'rls_policies_metadata', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_name, x.policy_name) FROM policy_metadata x), '[]'::pg_catalog.jsonb),
  'table_acl_grants', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_name, x.grantee, x.privilege_type) FROM table_acl_metadata x), '[]'::pg_catalog.jsonb),
  'effective_application_table_privileges', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.table_name, x.role_name) FROM effective_table_privileges x), '[]'::pg_catalog.jsonb),
  'schema_acl_grants', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.schema_name, x.grantee, x.privilege_type) FROM schema_acl_metadata x), '[]'::pg_catalog.jsonb),
  'public_schema_effective_privileges', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.role_name) FROM public_schema_effective x), '[]'::pg_catalog.jsonb),
  'default_privilege_grants', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.object_creator, x.schema_name, x.object_type, x.grantee, x.privilege_type) FROM default_acl_metadata x), '[]'::pg_catalog.jsonb),
  'role_attributes', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.rolname) FROM role_metadata x), '[]'::pg_catalog.jsonb),
  'role_memberships', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.member, x.granted_role) FROM role_memberships x), '[]'::pg_catalog.jsonb),
  'application_role_reachability', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.application_role, x.reachable_role) FROM application_role_reachability x), '[]'::pg_catalog.jsonb),
  'application_access_to_executor_role', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.application_role) FROM executor_role_reachability x), '[]'::pg_catalog.jsonb),
  'functions', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.schema_name, x.function_name, x.identity_arguments) FROM function_metadata x), '[]'::pg_catalog.jsonb),
  'function_acl_grants', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.schema_name, x.function_name, x.identity_arguments, x.grantee) FROM function_acl_metadata x), '[]'::pg_catalog.jsonb),
  'effective_application_function_privileges', COALESCE((SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x) ORDER BY x.schema_name, x.function_name, x.identity_arguments, x.role_name) FROM effective_function_privileges x), '[]'::pg_catalog.jsonb),
  'limitations', pg_catalog.jsonb_build_array(
    'Metadata findings do not constitute migration approval.',
    'CHECK, policy, index and default expression text, trigger arguments and function bodies are withheld to avoid embedded secrets or personal literals.',
    'Practice duration and completed-status compatibility still require private review of the relevant CHECK and trigger logic.',
    'Function source-name matching identifies review candidates, not proof that a routine modifies records.',
    'Role membership, inheritance and effective privileges are reported separately; membership does not always imply permission to SET ROLE on every server version.',
    'An empty default-ACL array means no explicit default ACL rows were returned, not that built-in default privileges are absent.',
    'This query does not rescan attempts, duplicates, rewards or reference counts; the separately observed data findings remain separate.',
    'Permission errors must be reported rather than bypassed.'
  )
) AS production_catalog_audit;
