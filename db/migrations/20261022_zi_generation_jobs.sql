-- Phase 6.1 candidate. UNAPPLIED outside synthetic staging. Install AFTER generated storage.
-- New objects only; no student records, reward policy or existing grants changed.
BEGIN;
SET LOCAL search_path = pg_catalog, pg_temp;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
DO $$ BEGIN
 IF current_setting('server_version_num')::integer / 10000 <> 17 THEN RAISE EXCEPTION 'PostgreSQL 17 required'; END IF;
 IF to_regclass('public.zi_generated_tests') IS NULL THEN RAISE EXCEPTION 'Generated storage prerequisite missing'; END IF;
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','authenticator')
   AND pg_has_role(oid,current_user::regrole,'MEMBER')) THEN RAISE EXCEPTION 'Unsafe job routine owner'; END IF;
END $$;
CREATE SCHEMA zi_generation;
REVOKE ALL ON SCHEMA zi_generation FROM PUBLIC, anon, authenticated, service_role;
CREATE TABLE zi_generation.policy (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 daily_jobs integer NOT NULL CHECK(daily_jobs BETWEEN 1 AND 10),
 daily_tokens integer NOT NULL CHECK(daily_tokens BETWEEN 300000 AND 3000000),
 fleet_active integer NOT NULL CHECK(fleet_active BETWEEN 1 AND 10)
);
-- Conservative admission units, not a statement of provider billing. Never refunded automatically.
INSERT INTO zi_generation.policy VALUES(true,2,600000,2);
CREATE TABLE zi_generation.jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text NOT NULL CHECK(length(owner_id) BETWEEN 1 AND 200),
 draft_key text NOT NULL CHECK(draft_key ~ '^[a-f0-9]{64}$'),
 config_hash text NOT NULL CHECK(config_hash ~ '^[a-f0-9]{64}$'), configuration jsonb NOT NULL,
 expected_config jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 budget_day date NOT NULL DEFAULT (clock_timestamp() AT TIME ZONE 'UTC')::date,
 reserved_tokens integer NOT NULL DEFAULT 300000 CHECK(reserved_tokens=300000),
 state text NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','running','ready','failed','held')),
 stage text NOT NULL DEFAULT 'reserved' CHECK(stage IN ('reserved','analysis','generation','blind','audit','storage','complete','review_required','quality_failed','quota_blocked')),
 accepted integer NOT NULL DEFAULT 0 CHECK(accepted BETWEEN 0 AND 30),
 execution_token uuid, deadline_at timestamptz, test_id uuid REFERENCES public.zi_generated_tests(id),
 requests jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(requests)='array'),
 committed_tokens integer NOT NULL DEFAULT 0 CHECK(committed_tokens BETWEEN 0 AND 300000),
 UNIQUE(owner_id,draft_key), CHECK((state='ready')=(test_id IS NOT NULL))
);
CREATE INDEX jobs_owner_day ON zi_generation.jobs(owner_id,budget_day);
ALTER TABLE zi_generation.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zi_generation.policy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA zi_generation FROM PUBLIC, anon, authenticated, service_role;

-- One service-only RPC; identity/config come from authenticated server DAL, never browser claims.
CREATE FUNCTION public.zi_generation_job(p_op text,p_owner text,p_id uuid DEFAULT NULL,p_data jsonb DEFAULT '{}')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE j zi_generation.jobs; pol zi_generation.policy; tid uuid; claimed boolean:=false;
BEGIN
 IF p_owner IS NULL OR length(p_owner) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid owner' USING ERRCODE='22023'; END IF;
 -- Shared admission lock also serializes budget/concurrency decisions across instances.
 PERFORM pg_advisory_xact_lock(610122061);
 IF p_op='reserve' THEN
   SELECT * INTO j FROM zi_generation.jobs WHERE owner_id=p_owner AND draft_key=p_data->>'draftKey' FOR UPDATE;
   IF FOUND THEN
     IF j.configuration IS DISTINCT FROM p_data->'configuration' OR j.config_hash IS DISTINCT FROM p_data->>'configHash'
       OR j.expected_config IS DISTINCT FROM p_data->'expectedConfig' THEN RAISE EXCEPTION 'Idempotency conflict' USING ERRCODE='40001'; END IF;
   ELSE
     SELECT * INTO STRICT pol FROM zi_generation.policy WHERE singleton;
     IF (SELECT count(*) FROM zi_generation.jobs WHERE owner_id=p_owner AND budget_day=(clock_timestamp() AT TIME ZONE 'UTC')::date)>=pol.daily_jobs
       OR (SELECT coalesce(sum(reserved_tokens),0) FROM zi_generation.jobs WHERE owner_id=p_owner AND budget_day=(clock_timestamp() AT TIME ZONE 'UTC')::date)+300000>pol.daily_tokens
       THEN RAISE EXCEPTION 'Generation budget exhausted' USING ERRCODE='P0001'; END IF;
     IF EXISTS(SELECT 1 FROM zi_generation.jobs WHERE owner_id=p_owner AND state IN ('reserved','running','held'))
       OR (SELECT count(*) FROM zi_generation.jobs WHERE state IN ('reserved','running','held'))>=pol.fleet_active
       THEN RAISE EXCEPTION 'Generation capacity unavailable' USING ERRCODE='P0001'; END IF;
     IF jsonb_typeof(p_data->'configuration') IS DISTINCT FROM 'object' OR jsonb_typeof(p_data->'expectedConfig') IS DISTINCT FROM 'object'
       OR NOT coalesce((p_data->'expectedConfig'->>'questionCount')::integer BETWEEN 5 AND 30,false)
       THEN RAISE EXCEPTION 'Invalid configuration' USING ERRCODE='22023'; END IF;
     INSERT INTO zi_generation.jobs(owner_id,draft_key,config_hash,configuration,expected_config)
       VALUES(p_owner,p_data->>'draftKey',p_data->>'configHash',p_data->'configuration',p_data->'expectedConfig') RETURNING * INTO j;
   END IF;
 ELSE
   IF p_id IS NULL AND p_op='read' THEN
     SELECT * INTO j FROM zi_generation.jobs WHERE owner_id=p_owner ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
   ELSE
     SELECT * INTO j FROM zi_generation.jobs WHERE id=p_id AND owner_id=p_owner FOR UPDATE;
   END IF;
   IF NOT FOUND THEN RAISE EXCEPTION 'Job not found' USING ERRCODE='P0002'; END IF;
   -- Reconcile only committed storage, never regenerate an uncertain provider outcome.
   IF j.state IN ('running','held') THEN
     SELECT id INTO tid FROM public.zi_generated_tests WHERE owner_id=p_owner AND creation_key='zi-job:'||j.id
       AND config=j.expected_config AND mode=j.configuration->'sessionConfig'->>'mode'
       AND duration_minutes IS NOT DISTINCT FROM (j.configuration->'sessionConfig'->>'durationMinutes')::integer
       AND validation_version='zi-questions-v1.1' AND question_count=(j.expected_config->>'questionCount')::integer;
     IF tid IS NOT NULL THEN
       UPDATE zi_generation.jobs SET state='ready',stage='complete',test_id=tid,accepted=(j.expected_config->>'questionCount')::integer WHERE id=j.id RETURNING * INTO j;
     ELSIF j.deadline_at<=clock_timestamp() THEN
       UPDATE zi_generation.jobs SET state='held',stage='review_required' WHERE id=j.id RETURNING * INTO j;
     END IF;
   END IF;
   IF p_op='claim' THEN
     IF j.state='reserved' THEN
       UPDATE zi_generation.jobs SET state='running',stage='analysis',execution_token=gen_random_uuid(),
         deadline_at=clock_timestamp()+interval '270 seconds' WHERE id=j.id RETURNING * INTO j;
       claimed:=true;
     END IF;
   ELSIF p_op IN ('progress','finish','dispatch','ack') THEN
     IF j.state='running' AND j.execution_token IS NOT DISTINCT FROM (p_data->>'executionToken')::uuid AND j.deadline_at>clock_timestamp() THEN
       IF p_op='dispatch' THEN
         IF jsonb_array_length(j.requests)>=25 OR NOT coalesce((p_data->>'tokens')::integer BETWEEN 1 AND 300000,false)
           OR j.committed_tokens+(p_data->>'tokens')::integer>j.reserved_tokens
           OR EXISTS(SELECT 1 FROM jsonb_array_elements(j.requests) r WHERE r->>'state'<>'complete')
           THEN RAISE EXCEPTION 'Request budget or prior outcome unresolved' USING ERRCODE='P0001'; END IF;
         UPDATE zi_generation.jobs SET committed_tokens=committed_tokens+(p_data->>'tokens')::integer,
           requests=requests||jsonb_build_array(jsonb_build_object('id',p_data->>'requestId','state','dispatched','tokens',(p_data->>'tokens')::integer))
           WHERE id=j.id RETURNING * INTO j;
       ELSIF p_op='ack' THEN
         IF j.requests->-1->>'id' IS DISTINCT FROM p_data->>'requestId' OR j.requests->-1->>'state' IS DISTINCT FROM 'dispatched'
           THEN RAISE EXCEPTION 'Request acknowledgement conflict' USING ERRCODE='40001'; END IF;
         UPDATE zi_generation.jobs SET requests=jsonb_set(requests,ARRAY[(jsonb_array_length(requests)-1)::text],
           (requests->-1)||jsonb_build_object('state',CASE WHEN p_data->>'known'='true' THEN 'complete' ELSE 'unknown' END,
             'reportedTokens',(p_data->>'reportedTokens')::integer)) WHERE id=j.id RETURNING * INTO j;
       ELSIF p_op='progress' THEN
         UPDATE zi_generation.jobs SET stage=p_data->>'stage',accepted=greatest(accepted,(p_data->>'accepted')::integer) WHERE id=j.id RETURNING * INTO j;
       ELSIF p_data->>'state' IN ('failed','held') THEN
         UPDATE zi_generation.jobs SET state=p_data->>'state',stage=p_data->>'stage' WHERE id=j.id RETURNING * INTO j;
       ELSE RAISE EXCEPTION 'Storage commit not confirmed' USING ERRCODE='40001'; END IF;
     ELSIF j.state<>'ready' THEN RAISE EXCEPTION 'Execution claim lost' USING ERRCODE='40001'; END IF;
   ELSIF p_op<>'read' THEN RAISE EXCEPTION 'Invalid operation' USING ERRCODE='22023'; END IF;
 END IF;
 RETURN to_jsonb(j)||jsonb_build_object('claimed',claimed);
END $$;
REVOKE ALL ON FUNCTION public.zi_generation_job(text,text,uuid,jsonb) FROM PUBLIC,anon,authenticated,authenticator;
GRANT EXECUTE ON FUNCTION public.zi_generation_job(text,text,uuid,jsonb) TO service_role;
COMMIT;
