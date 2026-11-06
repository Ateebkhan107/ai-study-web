-- REVIEW ONLY. Do not add to automatic migrations or execute without approval.
-- Deploy this transaction BEFORE application code. Preserves the existing counter.
BEGIN;
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
COMMIT;
