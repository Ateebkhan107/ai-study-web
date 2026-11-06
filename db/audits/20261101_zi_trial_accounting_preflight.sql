-- PREPARED ONLY: not executed. Manual approval for the exact project/operator required.
-- Read-only catalogs plus aggregate legacy-usage counts. No IDs, preference text,
-- credentials, role switching, application RPCs, DDL or DML are returned/executed.
-- Keep operational metadata private. A timeout/permission error is a failed check.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

SELECT current_database() AS database_name, current_user AS operator,
       session_user, current_setting('server_version_num') AS server_version_num,
       inet_server_addr()::text AS server_address, inet_server_port() AS server_port;

SELECT n.nspname, c.relname, c.relkind, pg_get_userbyid(c.relowner) AS owner,
       c.relrowsecurity, c.relforcerowsecurity, c.relacl
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname IN ('zi_preferences','zi_trial_prompt_reservations');

SELECT a.attname, format_type(a.atttypid,a.atttypmod) AS data_type,
       a.attnotnull, a.attidentity, a.attgenerated,
       pg_get_expr(d.adbin,d.adrelid) AS default_expression, a.attacl
FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
WHERE a.attrelid=to_regclass('public.zi_preferences') AND a.attnum>0 AND NOT a.attisdropped
ORDER BY a.attnum;

SELECT conname, contype, convalidated, condeferrable, pg_get_constraintdef(oid) AS definition
FROM pg_constraint WHERE conrelid=to_regclass('public.zi_preferences');
SELECT i.indexrelid::regclass::text AS index_name, i.indisvalid, i.indisready, i.indisunique,
       pg_get_indexdef(i.indexrelid) AS definition
FROM pg_index i WHERE i.indrelid=to_regclass('public.zi_preferences');

SELECT t.tgname, t.tgenabled, t.tgisinternal, pg_get_triggerdef(t.oid) AS definition,
       p.oid::regprocedure::text AS routine
FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
WHERE t.tgrelid=to_regclass('public.zi_preferences');
SELECT r.rulename, pg_get_ruledef(r.oid) AS definition
FROM pg_rewrite r WHERE r.ev_class=to_regclass('public.zi_preferences');
SELECT polname, polcmd, polpermissive, polroles,
       pg_get_expr(polqual,polrelid) AS using_expression,
       pg_get_expr(polwithcheck,polrelid) AS check_expression
FROM pg_policy WHERE polrelid=to_regclass('public.zi_preferences');

SELECT rolname, rolcanlogin, rolsuper, rolbypassrls, rolinherit
FROM pg_roles WHERE rolname IN (current_user,'postgres','supabase_admin','anon','authenticated','authenticator','service_role');
-- Includes inherited privileges and SET-role reachability, not just direct grants.
SELECT app.rolname AS application_role, target.rolname AS reachable_role,
       pg_has_role(app.oid,target.oid,'USAGE') AS inherits_now,
       pg_has_role(app.oid,target.oid,'SET') AS can_set_role,
       target.rolsuper, target.rolbypassrls
FROM pg_roles app CROSS JOIN pg_roles target
WHERE app.rolname IN ('anon','authenticated','authenticator','service_role')
  AND (app.oid=target.oid OR pg_has_role(app.oid,target.oid,'MEMBER'));

-- Targeted effective access on the existing counter table, including roles a
-- browser can SET. Authenticator's trusted service-role path is reviewed separately.
SELECT app.rolname AS browser_role, target.rolname AS reachable_role,
       has_table_privilege(target.oid,to_regclass('public.zi_preferences'),'TRUNCATE') AS can_truncate,
       has_table_privilege(target.oid,to_regclass('public.zi_preferences'),'MAINTAIN') AS can_maintain,
       pg_has_role(app.oid,target.oid,'SET') AS can_set_role
FROM pg_roles app CROSS JOIN pg_roles target
WHERE app.rolname IN ('anon','authenticated')
  AND (app.oid=target.oid OR pg_has_role(app.oid,target.oid,'USAGE') OR pg_has_role(app.oid,target.oid,'SET'));

-- Inspect both global and public-schema creator defaults, including custom grantees.
SELECT pg_get_userbyid(d.defaclrole) AS creator,
       CASE WHEN d.defaclnamespace=0 THEN '(global)' ELSE n.nspname END AS schema_name,
       d.defaclobjtype, d.defaclacl
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace
WHERE d.defaclnamespace=0 OR n.nspname='public';
SELECT e.evtname,e.evtevent,e.evtenabled,e.evttags,p.oid::regprocedure::text AS routine
FROM pg_event_trigger e JOIN pg_proc p ON p.oid=e.evtfoid;
-- Review relevant trigger/default/rule routine bodies privately if present;
-- previously reviewed definitions are evidence only if their current hashes match.

-- Any existing object/signature means STOP: do not rerun, overwrite or drop it.
SELECT p.oid::regprocedure::text AS routine, pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef,p.proconfig,p.proacl,md5(p.prosrc) AS body_fingerprint
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname='zi_trial_prompt_usage';

-- Data requirements: the proposal's parser accepts only 1-9 ASCII digits.
-- Unlike parseInt, whitespace, signs, decimals and trailing text are rejected.
WITH counters AS (
  SELECT clerk_user_id,preference_value,
         CASE WHEN preference_value ~ '^[0-9]{1,9}$' THEN preference_value::integer END AS used
  FROM public.zi_preferences WHERE preference_key='zi_free_prompts_used'
)
SELECT count(*) AS counter_rows,
       count(*) FILTER (WHERE used IS NULL) AS incompatible_counters,
       count(*) FILTER (WHERE used=0) AS used_zero,
       count(*) FILTER (WHERE used=1) AS used_one,
       count(*) FILTER (WHERE used=2) AS used_two,
       count(*) FILTER (WHERE used>=3) AS exhausted_preserved,
       count(*) FILTER (WHERE clerk_user_id IS NULL OR length(clerk_user_id) NOT BETWEEN 1 AND 200) AS invalid_owner_rows
FROM counters;
SELECT count(*) AS duplicate_usage_key_groups FROM (
  SELECT clerk_user_id,preference_key FROM public.zi_preferences
  WHERE preference_key='zi_free_prompts_used'
  GROUP BY clerk_user_id,preference_key HAVING count(*)>1
) duplicates;
ROLLBACK;
