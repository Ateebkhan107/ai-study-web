-- RELEASE CANDIDATE. Prepared only; production execution requires separate approval.
-- Supply reviewed endpoint/operator/policy settings in this session; no credentials in SQL.
BEGIN;
SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='120s';
DO $release_guard$ BEGIN
 IF current_setting('server_version_num')<>'170006'
 OR current_database() IS DISTINCT FROM current_setting('prepzii.release_database',true)
 OR current_user IS DISTINCT FROM current_setting('prepzii.release_operator',true)
 OR session_user IS DISTINCT FROM current_setting('prepzii.release_operator',true)
 OR current_setting('data_directory') IS DISTINCT FROM current_setting('prepzii.release_data_directory',true)
 OR current_setting('port') IS DISTINCT FROM current_setting('prepzii.release_port',true)
 OR COALESCE(inet_server_addr()::text,'unix-socket') IS DISTINCT FROM current_setting('prepzii.release_endpoint',true)
 OR current_setting('prepzii.release_policy',true) IS DISTINCT FROM 'preserve-opening-no-retro-v1'
 THEN RAISE EXCEPTION 'PHASE5_RELEASE_ENDPOINT_OR_POLICY_GUARD_FAILED'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='prepzii_integrity_owner' AND NOT rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolinherit AND rolbypassrls)
 OR NOT pg_has_role(current_user,'prepzii_integrity_owner','SET') THEN RAISE EXCEPTION 'Approved isolated definer owner/operator authority required'; END IF;
 IF EXISTS(SELECT 1 FROM pg_roles r WHERE r.rolname IN ('anon','authenticated','service_role','authenticator','postgres') AND pg_has_role(r.oid,'prepzii_integrity_owner'::regrole,'MEMBER')) THEN RAISE EXCEPTION 'Unsafe owner membership'; END IF;
END $release_guard$;
-- Bootstrap operator creates only the dedicated schema under its intended owner.
-- The representative nonsuperuser need not receive database-wide CREATE.
CREATE SCHEMA prepzii_rewards AUTHORIZATION postgres;
SET LOCAL ROLE postgres;
REVOKE ALL ON SCHEMA prepzii_rewards FROM PUBLIC,anon,authenticated,service_role;
CREATE TABLE prepzii_rewards.events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id text NOT NULL,
 kind text NOT NULL CHECK(kind IN ('PYQ','TEST','FORMULA')), source_key text NOT NULL,
 activity_date date NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(user_id,kind,source_key,activity_date)
);
-- Snapshot eligible goal policy when authoritative activity commits. Creating a
-- goal later cannot retroactively reward old events. No arbitrary client counts.
CREATE TABLE prepzii_rewards.credits (
 event_id uuid NOT NULL REFERENCES prepzii_rewards.events(id), goal_id uuid NOT NULL REFERENCES public.daily_goals(id),
 target_value integer NOT NULL CHECK(target_value>0), xp integer NOT NULL CHECK(xp BETWEEN 0 AND 100000),
 applied boolean NOT NULL DEFAULT false, PRIMARY KEY(event_id,goal_id)
);
CREATE TABLE prepzii_rewards.progress (
 user_id text NOT NULL,goal_id uuid NOT NULL,goal_date date NOT NULL,
 progress integer NOT NULL DEFAULT 0,target_value integer NOT NULL,xp integer NOT NULL,
 PRIMARY KEY(user_id,goal_id,goal_date)
);
CREATE TABLE prepzii_rewards.receipts (
 user_id text NOT NULL,goal_id uuid NOT NULL,goal_date date NOT NULL,
 xp integer NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(user_id,goal_id,goal_date)
);
ALTER TABLE prepzii_rewards.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_rewards.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_rewards.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_rewards.receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA prepzii_rewards FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION prepzii_rewards.capture(p_user text,p_kind text,p_source text,p_day date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE event_id uuid;
BEGIN
 IF p_user IS NULL OR p_user='' OR p_source IS NULL OR p_source='' THEN
  RAISE EXCEPTION 'Missing authoritative source'; END IF;
 INSERT INTO prepzii_rewards.events(user_id,kind,source_key,activity_date)
 VALUES(p_user,p_kind,p_source,p_day) ON CONFLICT DO NOTHING RETURNING id INTO event_id;
 IF event_id IS NULL THEN RETURN; END IF;
 INSERT INTO prepzii_rewards.credits(event_id,goal_id,target_value,xp)
 SELECT event_id,g.id,g.target_value,g.xp FROM public.daily_goals g
 WHERE g.is_active AND g.goal_type=p_kind AND g.target_value>0 AND g.xp BETWEEN 0 AND 100000
 AND (g.target='ALL' OR g.target=COALESCE((SELECT exam FROM public.user_profiles WHERE clerk_user_id=p_user),'JEE'));
END $$;

CREATE FUNCTION public.prepzii_deliver_goal_rewards(p_user text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE c record; state prepzii_rewards.progress%ROWTYPE; paid integer; total_paid integer:=0; processed integer:=0;
 new_xp integer; lvl integer; threshold integer; step integer; title text;
BEGIN
 IF p_user IS NULL OR p_user='' THEN RAISE EXCEPTION 'Missing verified identity'; END IF;
 -- Same key across server instances and reconnects; held until transaction end.
 PERFORM pg_advisory_xact_lock(hashtextextended('prepzii-goal:'||p_user,0));
 FOR c IN SELECT e.user_id,e.activity_date,e.id,cg.goal_id,cg.target_value,cg.xp
 FROM prepzii_rewards.events e JOIN prepzii_rewards.credits cg ON cg.event_id=e.id
 WHERE e.user_id=p_user AND NOT cg.applied
 ORDER BY e.activity_date,e.created_at,e.id,cg.goal_id
 LIMIT 1000 FOR UPDATE OF cg LOOP
  INSERT INTO prepzii_rewards.progress(user_id,goal_id,goal_date,target_value,xp)
  VALUES(p_user,c.goal_id,c.activity_date,c.target_value,c.xp) ON CONFLICT DO NOTHING;
  UPDATE prepzii_rewards.progress SET progress=LEAST(progress+1,target_value)
  WHERE user_id=p_user AND goal_id=c.goal_id AND goal_date=c.activity_date RETURNING * INTO state;
  -- Public table's old unique(user_id,goal_id) is intentionally respected.
  INSERT INTO public.user_daily_goals(user_id,goal_id,goal_date,progress,completed,completed_at)
  VALUES(p_user,c.goal_id,c.activity_date,state.progress,state.progress>=state.target_value,
   CASE WHEN state.progress>=state.target_value THEN clock_timestamp() END)
  ON CONFLICT(user_id,goal_id) DO UPDATE SET goal_date=EXCLUDED.goal_date,progress=EXCLUDED.progress,
   completed=EXCLUDED.completed,completed_at=CASE WHEN user_daily_goals.goal_date=EXCLUDED.goal_date
   THEN COALESCE(user_daily_goals.completed_at,EXCLUDED.completed_at) ELSE EXCLUDED.completed_at END
  WHERE user_daily_goals.goal_date IS NULL OR user_daily_goals.goal_date<=EXCLUDED.goal_date;
  IF state.progress>=state.target_value THEN
   INSERT INTO prepzii_rewards.receipts(user_id,goal_id,goal_date,xp)
   VALUES(p_user,c.goal_id,c.activity_date,state.xp) ON CONFLICT DO NOTHING;
   GET DIAGNOSTICS paid=ROW_COUNT;
   IF paid=1 THEN
    -- Receipt, progress, additive XP and applied marker share this transaction.
    INSERT INTO public.user_xp(user_id,xp) VALUES(p_user,state.xp)
    ON CONFLICT(user_id) DO UPDATE SET xp=COALESCE(user_xp.xp,0)+EXCLUDED.xp RETURNING xp INTO new_xp;
    IF new_xp<500 THEN lvl:=1; ELSIF new_xp<1200 THEN lvl:=2;
    ELSIF new_xp<2200 THEN lvl:=3; ELSIF new_xp<3500 THEN lvl:=4;
    ELSIF new_xp<5000 THEN lvl:=5;
    ELSE lvl:=6; threshold:=6500; step:=1500;
     WHILE new_xp>=threshold LOOP lvl:=lvl+1; step:=step+300; threshold:=threshold+step; END LOOP;
    END IF;
    title:=CASE WHEN lvl>=10 THEN 'Grandmaster' WHEN lvl>=8 THEN 'Master' WHEN lvl>=6 THEN 'Elite'
     WHEN lvl>=4 THEN 'Expert' WHEN lvl>=2 THEN 'Challenger' ELSE 'Explorer' END;
    UPDATE public.user_xp SET level=lvl,badge=title WHERE user_id=p_user;
    total_paid:=total_paid+state.xp;
   END IF;
  END IF;
  UPDATE prepzii_rewards.credits SET applied=true WHERE event_id=c.id AND goal_id=c.goal_id;
  processed:=processed+1;
 END LOOP;
 RETURN jsonb_build_object('creditsProcessed',processed,'xpAwarded',total_paid,'pendingCredits',
  (SELECT count(*) FROM prepzii_rewards.credits cg JOIN prepzii_rewards.events e ON e.id=cg.event_id WHERE e.user_id=p_user AND NOT cg.applied));
END $$;

-- Database triggers capture source records atomically; losing an HTTP callback
-- cannot lose the pending credit. Owner/service writers are trusted boundaries.
CREATE FUNCTION prepzii_rewards.capture_pyq()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 IF NEW.selected_option IS NOT NULL AND btrim(NEW.selected_option)<>''
 AND EXISTS(SELECT 1 FROM public.pyq_questions WHERE id=NEW.question_id) THEN
  -- Policy proposal: one answered distinct question / UTC day, NOT page views
  -- or batches. Recreated attempt IDs for the same question cannot mint credit.
  PERFORM prepzii_rewards.capture(NEW.user_id,'PYQ',NEW.question_id::text,(statement_timestamp() AT TIME ZONE 'UTC')::date);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER prepzii_capture_pyq AFTER INSERT ON public.pyq_attempts
FOR EACH ROW EXECUTE FUNCTION prepzii_rewards.capture_pyq();

CREATE FUNCTION prepzii_rewards.capture_bank_attempt(p_attempt uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE a record;
BEGIN
 SELECT t.* INTO a FROM public.test_attempts t JOIN public.test_sessions s ON s.id=t.session_id
 WHERE t.id=p_attempt AND s.user_id=t.user_id;
 IF NOT FOUND OR a.total_questions<=0 THEN RETURN; END IF;
 -- Both answer and institute hooks lock this same source row. With READ COMMITTED
 -- the subsequent checks see the preceding source transaction's commit.
 PERFORM 1 FROM public.test_sessions WHERE id=a.session_id FOR UPDATE;
 IF (SELECT count(*) FROM public.user_answers WHERE attempt_id=a.id)=a.total_questions
 AND (SELECT count(DISTINCT question_id) FROM public.user_answers WHERE attempt_id=a.id)=a.total_questions
 AND (SELECT count(DISTINCT question_id) FROM public.test_questions WHERE session_id=a.session_id)=a.total_questions
 AND NOT EXISTS(SELECT 1 FROM public.user_answers u WHERE u.attempt_id=a.id AND NOT EXISTS
  (SELECT 1 FROM public.test_questions q WHERE q.session_id=a.session_id AND q.question_id=u.question_id))
 AND NOT EXISTS(SELECT 1 FROM public.institute_test_attempts i WHERE i.session_id=a.session_id
  AND (i.user_id<>a.user_id OR i.attempt_id IS DISTINCT FROM a.id OR i.status<>'SUBMITTED')) THEN
  IF NOT EXISTS(SELECT 1 FROM prepzii_rewards.events WHERE user_id=a.user_id AND kind='TEST' AND source_key=a.session_id::text) THEN
   PERFORM prepzii_rewards.capture(a.user_id,'TEST',a.session_id::text,(statement_timestamp() AT TIME ZONE 'UTC')::date);
  END IF;
 END IF;
END $$;
CREATE FUNCTION prepzii_rewards.capture_test()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 PERFORM prepzii_rewards.capture_bank_attempt(NEW.attempt_id);
 RETURN NEW;
END $$;
-- Lifetime session key survives duplicate attempt IDs and cross-day retries.
CREATE UNIQUE INDEX prepzii_test_source_once ON prepzii_rewards.events(user_id,kind,source_key) WHERE kind='TEST';
CREATE TRIGGER prepzii_capture_test AFTER INSERT ON public.user_answers
FOR EACH ROW EXECUTE FUNCTION prepzii_rewards.capture_test();
CREATE TRIGGER prepzii_capture_institute AFTER INSERT OR UPDATE OF attempt_id,status ON public.institute_test_attempts
FOR EACH ROW EXECUTE FUNCTION prepzii_rewards.capture_test();

CREATE FUNCTION public.prepzii_record_formula_access(p_user text,p_book text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 -- Only trusted server route may call after Clerk and entitlement checks.
 IF NOT EXISTS(SELECT 1 FROM public.formula_books WHERE id::text=p_book) THEN RAISE EXCEPTION 'Unknown book'; END IF;
 PERFORM prepzii_rewards.capture(p_user,'FORMULA',p_book,(statement_timestamp() AT TIME ZONE 'UTC')::date);
 RETURN jsonb_build_object('recorded',true);
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA prepzii_rewards FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.prepzii_deliver_goal_rewards(text),public.prepzii_record_formula_access(text,text)
 FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.prepzii_deliver_goal_rewards(text),public.prepzii_record_formula_access(text,text) TO service_role;
COMMIT;
