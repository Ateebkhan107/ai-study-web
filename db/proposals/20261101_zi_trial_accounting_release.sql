-- PREPARED ONLY: NO SQL EXECUTED. Single-project release candidate.
-- Derived from 20261031_zi_trial_prompt_accounting.sql (core unchanged), with
-- targeted preconditions, bounded locking and effective-ACL guards before COMMIT.
-- Requires separate exact-project/operator/hash approval and offline rehearsal
-- against the freshly observed hosted version/schema/defaults. Not auto-migrated.
BEGIN;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';
SET LOCAL idle_in_transaction_session_timeout = '60s';
-- Blocks preference/counter writers only for this short transaction; does NOT
-- replace the required application pause, version isolation and worker drain.
LOCK TABLE public.zi_preferences IN SHARE ROW EXCLUSIVE MODE;
DO $preflight$
DECLARE rel oid := to_regclass('public.zi_preferences'); r record; target record; priv text;
BEGIN
  IF current_setting('server_version_num')::integer < 170000 THEN
    RAISE EXCEPTION 'Requires reviewed PostgreSQL 17+ compatibility';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid=rel AND relkind='r' AND relrowsecurity
    AND (relowner=current_user::regrole::oid OR EXISTS (
      SELECT 1 FROM pg_roles WHERE rolname=current_user AND (rolbypassrls OR rolsuper)))) THEN
    RAISE EXCEPTION 'Unreviewed preferences kind/RLS or function owner cannot bypass RLS';
  END IF;
  FOREACH priv IN ARRAY ARRAY['SELECT','INSERT','UPDATE'] LOOP
    IF NOT has_table_privilege(current_user,rel,priv) THEN RAISE EXCEPTION 'Migration owner lacks preferences privilege'; END IF;
  END LOOP;
  IF (SELECT count(*) FROM pg_attribute WHERE attrelid=rel AND NOT attisdropped
      AND attname IN ('clerk_user_id','preference_key','preference_value') AND atttypid='text'::regtype AND attnotnull)=3
     AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=rel AND attname='updated_at'
                 AND NOT attisdropped AND atttypid='timestamptz'::regtype AND attgenerated='') THEN
    NULL;
  ELSE RAISE EXCEPTION 'Unexpected preferences column contract'; END IF;
  IF EXISTS (SELECT 1 FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
     WHERE a.attrelid=rel AND a.attnum>0 AND NOT a.attisdropped AND a.attnotnull
       AND a.attname NOT IN ('clerk_user_id','preference_key','preference_value','updated_at')
       AND d.oid IS NULL AND a.attidentity='' AND a.attgenerated='') THEN
    RAISE EXCEPTION 'Additional required preferences column without a default';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid=rel AND i.indisunique
      AND i.indisvalid AND i.indisready AND i.indimmediate AND i.indpred IS NULL
      AND i.indexprs IS NULL AND i.indnkeyatts=2 AND
      (SELECT array_agg(a.attname::text ORDER BY a.attname) FROM unnest(i.indkey) WITH ORDINALITY k(attnum,ord)
       JOIN pg_attribute a ON a.attrelid=rel AND a.attnum=k.attnum WHERE k.ord<=i.indnkeyatts)
        =ARRAY['clerk_user_id','preference_key']) THEN
    RAISE EXCEPTION 'Required immediate unique owner/preference index missing';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid=rel AND NOT tgisinternal)
     OR EXISTS (SELECT 1 FROM pg_rewrite WHERE ev_class=rel)
     OR EXISTS (SELECT 1 FROM pg_policy WHERE polrelid=rel) THEN
    RAISE EXCEPTION 'Unexpected preferences trigger/rule/policy requires a separately reviewed candidate';
  END IF;
  IF EXISTS (SELECT 1 FROM public.zi_preferences WHERE preference_key='zi_free_prompts_used'
      AND (preference_value IS NULL OR preference_value !~ '^[0-9]{1,9}$'
        OR clerk_user_id IS NULL OR length(clerk_user_id) NOT BETWEEN 1 AND 200)) THEN
    RAISE EXCEPTION 'Historical usage requires review; no automatic conversion/reset';
  END IF;
  FOR r IN SELECT oid,rolname FROM pg_roles WHERE rolname IN ('anon','authenticated') LOOP
    FOR target IN SELECT oid,rolname,rolsuper,rolbypassrls FROM pg_roles
      WHERE oid=r.oid OR pg_has_role(r.oid,oid,'USAGE') OR pg_has_role(r.oid,oid,'SET') LOOP
      IF target.rolsuper OR target.rolbypassrls OR pg_has_role(target.oid,(SELECT relowner FROM pg_class WHERE oid=rel),'MEMBER')
        OR has_table_privilege(target.oid,rel,'TRUNCATE') OR has_table_privilege(target.oid,rel,'MAINTAIN') THEN
        RAISE EXCEPTION 'Unsafe browser access to historical usage; no automatic shared privilege changes';
      END IF;
    END LOOP;
  END LOOP;
END $preflight$;

CREATE TABLE public.zi_trial_prompt_reservations (
  request_id uuid PRIMARY KEY,
  owner_id text NOT NULL CHECK (length(owner_id) BETWEEN 1 AND 200),
  usage_floor integer NOT NULL CHECK (usage_floor >= 0),
  state text NOT NULL CHECK (state IN ('reserved', 'dispatched', 'consumed', 'released')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX zi_trial_prompt_owner_pending ON public.zi_trial_prompt_reservations(owner_id)
  WHERE state IN ('reserved', 'dispatched');
CREATE INDEX zi_trial_prompt_owner_floor ON public.zi_trial_prompt_reservations(owner_id, usage_floor DESC);
ALTER TABLE public.zi_trial_prompt_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.zi_trial_prompt_reservations FROM PUBLIC, anon, authenticated, authenticator, service_role;

CREATE FUNCTION public.zi_trial_prompt_usage(p_owner text, p_operation text, p_request uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE used_count integer; pending_count integer; raw_count text; current_state text; admitted boolean := false;
BEGIN
  IF p_owner IS NULL OR length(p_owner) NOT BETWEEN 1 AND 200 OR p_operation IS NULL
     OR p_operation NOT IN ('read','reserve','dispatch','consume','release')
     OR (p_operation <> 'read' AND p_request IS NULL) THEN
    RAISE EXCEPTION 'Invalid usage request' USING ERRCODE='22023';
  END IF;
  -- All workers serialize admission, debit and release for this Clerk owner.
  PERFORM pg_advisory_xact_lock(hashtextextended('zi-trial:' || p_owner, 0));
  SELECT preference_value INTO raw_count FROM public.zi_preferences
    WHERE clerk_user_id=p_owner AND preference_key='zi_free_prompts_used';
  IF raw_count IS NOT NULL AND (raw_count !~ '^[0-9]{1,9}$') THEN
    RAISE EXCEPTION 'Invalid legacy usage' USING ERRCODE='22023';
  END IF;
  SELECT greatest(coalesce(raw_count::integer,0),coalesce(max(usage_floor),0)) INTO used_count
    FROM public.zi_trial_prompt_reservations WHERE owner_id=p_owner;
  SELECT count(*) INTO pending_count FROM public.zi_trial_prompt_reservations
    WHERE owner_id=p_owner AND state IN ('reserved','dispatched');
  IF p_operation <> 'read' THEN
    SELECT state INTO current_state FROM public.zi_trial_prompt_reservations
      WHERE request_id=p_request AND owner_id=p_owner FOR UPDATE;
    IF p_operation='reserve' THEN
      IF current_state IS NOT NULL THEN
        admitted := current_state IN ('reserved','dispatched','consumed');
      ELSIF used_count + pending_count < 3 THEN
        INSERT INTO public.zi_trial_prompt_reservations(request_id,owner_id,state,usage_floor)
          VALUES(p_request,p_owner,'reserved',used_count);
        current_state := 'reserved'; pending_count := pending_count+1; admitted := true;
      END IF;
    ELSIF current_state IS NULL THEN
      RAISE EXCEPTION 'Usage request not found' USING ERRCODE='P0002';
    ELSIF p_operation='dispatch' THEN
      IF current_state NOT IN ('reserved','dispatched') THEN RAISE EXCEPTION 'Invalid dispatch'; END IF;
      UPDATE public.zi_trial_prompt_reservations SET state='dispatched',updated_at=now() WHERE request_id=p_request;
      current_state := 'dispatched';
    ELSIF p_operation='consume' THEN
      IF current_state='dispatched' THEN
        used_count := used_count+1; pending_count := pending_count-1;
        INSERT INTO public.zi_preferences(clerk_user_id,preference_key,preference_value,updated_at)
          VALUES(p_owner,'zi_free_prompts_used',used_count::text,now())
          ON CONFLICT(clerk_user_id,preference_key) DO UPDATE
            SET preference_value=excluded.preference_value,updated_at=excluded.updated_at;
        UPDATE public.zi_trial_prompt_reservations SET state='consumed',usage_floor=used_count,updated_at=now() WHERE request_id=p_request;
        current_state := 'consumed';
      ELSIF current_state <> 'consumed' THEN RAISE EXCEPTION 'Invalid consumption'; END IF;
    ELSIF p_operation='release' AND current_state='reserved' THEN
      UPDATE public.zi_trial_prompt_reservations SET state='released',updated_at=now() WHERE request_id=p_request;
      current_state := 'released'; pending_count := pending_count-1;
    END IF;
  END IF;
  RETURN jsonb_build_object('used',used_count,'pending',pending_count,'limit',3,
    'remaining',greatest(0,3-used_count-pending_count),'allowed',admitted,
    'requestId',p_request,'state',current_state);
END $$;
REVOKE ALL ON FUNCTION public.zi_trial_prompt_usage(text,text,uuid) FROM PUBLIC, anon, authenticated, authenticator;
GRANT EXECUTE ON FUNCTION public.zi_trial_prompt_usage(text,text,uuid) TO service_role;
-- A browser or service role must not be able to assume the privileged owner.
DO $$
DECLARE owner_oid oid := current_user::regrole::oid; r record;
BEGIN
  FOR r IN SELECT oid,rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','authenticator','service_role') LOOP
    IF pg_has_role(r.oid,owner_oid,'MEMBER') THEN RAISE EXCEPTION 'Unsafe accounting owner'; END IF;
  END LOOP;
END $$;

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

COMMIT;
