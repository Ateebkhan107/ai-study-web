-- PREPARED ONLY: NOT EXECUTED. This is a guard, not a standalone migration.
-- Include immediately BEFORE COMMIT inside the original proposal transaction.
-- Never run the proposal's COMMIT and then treat these checks as precommit checks.
-- The final assembled transaction/hash needs its own review/approval/rehearsal.
DO $guard$
DECLARE table_oid oid := to_regclass('public.zi_trial_prompt_reservations');
        routine_oid oid := to_regprocedure('public.zi_trial_prompt_usage(text,text,uuid)');
        app record; reachable record; privilege_name text;
BEGIN
  IF table_oid IS NULL OR routine_oid IS NULL THEN RAISE EXCEPTION 'Accounting objects missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid=table_oid AND relkind='r' AND relrowsecurity
                 AND relowner=current_user::regrole::oid) THEN RAISE EXCEPTION 'Unexpected ledger owner/RLS'; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polrelid=table_oid) THEN RAISE EXCEPTION 'Unexpected ledger policy'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=routine_oid AND prosecdef
                 AND proowner=current_user::regrole::oid AND proconfig=ARRAY['search_path=pg_catalog, public']) THEN
    RAISE EXCEPTION 'Unexpected accounting function security/search path';
  END IF;
  -- New objects only: reject unexpected default/custom grants rather than
  -- changing project-wide privileges or relying solely on named-role REVOKEs.
  IF EXISTS (SELECT 1 FROM pg_class c CROSS JOIN LATERAL
    aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
    WHERE c.oid=table_oid AND a.grantee<>c.relowner) THEN
    RAISE EXCEPTION 'Unexpected non-owner ledger ACL';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_attribute c CROSS JOIN LATERAL aclexplode(c.attacl) a
    WHERE c.attrelid=table_oid AND a.grantee<>current_user::regrole::oid) THEN
    RAISE EXCEPTION 'Unexpected non-owner ledger column ACL';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p CROSS JOIN LATERAL
    aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
    WHERE p.oid=routine_oid AND a.grantee NOT IN (p.proowner,'service_role'::regrole::oid)) THEN
    RAISE EXCEPTION 'Unexpected non-service accounting function ACL';
  END IF;
  IF (SELECT count(*) FROM pg_roles WHERE rolname IN ('anon','authenticated','authenticator','service_role'))<>4 THEN
    RAISE EXCEPTION 'Expected application roles missing';
  END IF;
  FOR app IN SELECT oid,rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','authenticator','service_role') LOOP
    IF pg_has_role(app.oid,current_user::regrole::oid,'MEMBER') THEN RAISE EXCEPTION 'Application role can assume owner'; END IF;
    FOR reachable IN SELECT oid,rolname FROM pg_roles
      WHERE oid=app.oid OR pg_has_role(app.oid,oid,'USAGE') OR pg_has_role(app.oid,oid,'SET') LOOP
      FOREACH privilege_name IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] LOOP
        IF has_table_privilege(reachable.oid,table_oid,privilege_name) THEN
          RAISE EXCEPTION 'Unexpected ledger table privilege for % via %: %',app.rolname,reachable.rolname,privilege_name;
        END IF;
      END LOOP;
      FOREACH privilege_name IN ARRAY ARRAY['SELECT','INSERT','UPDATE','REFERENCES'] LOOP
        IF has_any_column_privilege(reachable.oid,table_oid,privilege_name) THEN
          RAISE EXCEPTION 'Unexpected ledger column privilege for % via %',app.rolname,reachable.rolname;
        END IF;
      END LOOP;
      IF app.rolname IN ('anon','authenticated') AND has_function_privilege(reachable.oid,routine_oid,'EXECUTE') THEN
        RAISE EXCEPTION 'Browser accounting execution reachable';
      END IF;
    END LOOP;
  END LOOP;
  -- The trusted PostgREST authenticator may legitimately SET ROLE service_role;
  -- do not change this platform membership. It must not inherit direct RPC access.
  IF has_function_privilege('authenticator',routine_oid,'EXECUTE') THEN
    RAISE EXCEPTION 'Unexpected direct/inherited authenticator execution';
  END IF;
  IF NOT has_function_privilege('service_role',routine_oid,'EXECUTE') THEN RAISE EXCEPTION 'Service RPC grant missing'; END IF;
END $guard$;
