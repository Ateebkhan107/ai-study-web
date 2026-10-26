-- PROPOSAL ONLY. Not approved/applied to production. PostgreSQL 17.6.
-- Separate approval unit from existing-table correction; changes future public
-- table defaults for exactly two creators. No row/RLS/function/platform-schema changes.
-- One authorized operator must be able to manage BOTH creator defaults.
-- postgres is NOT assumed to be a member of supabase_admin. Never grant membership
-- or switch to a stronger operator to bypass a failure without separate approval.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, pg_temp;
DO $preflight$
DECLARE creator record; found_count integer := 0;
BEGIN
  IF pg_catalog.current_setting('server_version_num')::integer <> 170006 THEN
    RAISE EXCEPTION 'Expected reviewed PostgreSQL 17.6';
  END IF;
  FOR creator IN SELECT oid,rolname FROM pg_catalog.pg_roles
    WHERE rolname IN ('postgres','supabase_admin')
  LOOP
    found_count := found_count+1;
    IF NOT pg_catalog.pg_has_role(CURRENT_USER,creator.oid,'SET') THEN
      RAISE EXCEPTION 'Operator lacks reviewed authority for creator %',creator.rolname;
    END IF;
  END LOOP;
  IF found_count <> 2 THEN RAISE EXCEPTION 'Missing reviewed creators'; END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_roles WHERE rolname IN ('anon','authenticated')) <> 2 THEN
    RAISE EXCEPTION 'Missing browser roles';
  END IF;
  -- Snapshot had no explicit global defaults. Stop on drift; a public-only
  -- REVOKE must not pretend it can cancel a global grant.
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_default_acl d
    WHERE d.defaclnamespace=0 AND d.defaclobjtype='r'
      AND d.defaclrole IN ('postgres'::regrole,'supabase_admin'::regrole)) THEN
    RAISE EXCEPTION 'Global table-default drift; review before correction';
  END IF;
END $preflight$;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, MAINTAIN ON TABLES FROM PUBLIC, anon, authenticated RESTRICT;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE TRUNCATE, MAINTAIN ON TABLES FROM PUBLIC, anon, authenticated RESTRICT;
DO $postcondition$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_default_acl d
    CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) a
    CROSS JOIN pg_catalog.pg_roles app
    WHERE d.defaclobjtype='r'
      AND d.defaclrole IN ('postgres'::regrole,'supabase_admin'::regrole)
      AND d.defaclnamespace IN (0,(SELECT oid FROM pg_catalog.pg_namespace WHERE nspname='public'))
      AND a.privilege_type IN ('TRUNCATE','MAINTAIN')
      AND app.rolname IN ('anon','authenticated')
      AND CASE WHEN a.grantee=0 THEN true
        ELSE pg_catalog.pg_has_role(app.oid,a.grantee,'USAGE')
          OR pg_catalog.pg_has_role(app.oid,a.grantee,'SET') END
  ) THEN RAISE EXCEPTION 'Browser maintenance defaults remain via PUBLIC/direct/role path'; END IF;
END $postcondition$;
COMMIT;
