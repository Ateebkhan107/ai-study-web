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
LOCK TABLE public.test_sessions,public.test_questions,public.test_attempts,public.user_answers,public.user_xp,public.pyq_attempts,public.user_badges,public.user_daily_goals,public.institute_test_attempts IN ACCESS EXCLUSIVE MODE;
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

RESET ROLE;
DO $cutover_preflight$ DECLARE t record; BEGIN
 IF to_regnamespace('prepzii_integrity') IS NOT NULL THEN RAISE EXCEPTION 'Cutover already installed; never resnapshot a live ledger'; END IF;
 IF to_regclass('public.zi_generated_sessions') IS NULL OR to_regnamespace('prepzii_rewards') IS NULL THEN RAISE EXCEPTION 'Reviewed dormant storage and goal contract prerequisites missing'; END IF;
 FOR t IN SELECT c.oid,c.relowner,c.relrowsecurity,c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname IN ('test_attempts','user_answers','user_xp','pyq_attempts','user_badges','user_daily_goals','institute_test_attempts') LOOP
  IF t.relkind<>'r' OR NOT t.relrowsecurity OR t.relowner<>'postgres'::regrole THEN RAISE EXCEPTION 'Unexpected protected table ownership/kind/RLS'; END IF;
 END LOOP;
 IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('test_attempts','user_answers','user_xp','pyq_attempts','user_badges','user_daily_goals','institute_test_attempts'))<>7 THEN RAISE EXCEPTION 'Missing protected tables'; END IF;
 -- Integer legacy score storage cannot faithfully represent fractional penalties.
 IF EXISTS(SELECT 1 FROM public.questions WHERE COALESCE(is_active,true) AND status='PUBLISHED' AND negative_marks IS NOT NULL AND abs(negative_marks)<>trunc(abs(negative_marks))) THEN RAISE EXCEPTION 'Fractional scoring compatibility requires separate reviewed schema decision'; END IF;
 -- The old API selected the first answer exam without an explicit order. Refuse
 -- mixed JEE/non-JEE histories rather than invent a different historical scope.
 IF EXISTS(SELECT 1 FROM public.test_attempts a LEFT JOIN public.tests historical_test ON historical_test.id=a.test_id
 JOIN public.user_answers u ON u.attempt_id=a.id JOIN public.questions q ON q.id=u.question_id
 WHERE to_jsonb(historical_test)->>'exam' IS NULL AND q.exam IS NOT NULL GROUP BY a.id HAVING count(DISTINCT (q.exam ILIKE '%JEE%'))>1) THEN RAISE EXCEPTION 'Mixed historical badge track requires private review'; END IF;
END $cutover_preflight$;
-- Lock before snapshot/registry seeding. No window for an old writer to slip in.
LOCK TABLE public.test_sessions,public.test_questions,public.test_attempts,public.user_answers,
 public.user_xp,public.pyq_attempts,public.user_badges,public.user_daily_goals,public.institute_test_attempts,
 prepzii_rewards.events,prepzii_rewards.credits,prepzii_rewards.progress,prepzii_rewards.receipts IN ACCESS EXCLUSIVE MODE;
-- Owner is pre-provisioned and validated; this migration never creates or elevates roles.
CREATE SCHEMA prepzii_integrity AUTHORIZATION prepzii_integrity_owner;
REVOKE ALL ON SCHEMA prepzii_integrity FROM PUBLIC,anon,authenticated,service_role,postgres;
GRANT USAGE,CREATE ON SCHEMA public TO prepzii_integrity_owner;
GRANT SELECT ON public.formula_books,public.daily_goals,public.test_sessions,public.test_questions,public.questions,public.pyq_questions,public.badges,public.user_profiles,public.tests,public.zi_generated_sessions TO prepzii_integrity_owner;
GRANT SELECT,INSERT,UPDATE ON public.user_daily_goals,public.user_xp,public.test_attempts,public.user_answers,public.pyq_attempts,public.user_badges,public.institute_test_attempts TO prepzii_integrity_owner;
GRANT UPDATE ON public.test_sessions TO prepzii_integrity_owner;
GRANT USAGE,CREATE ON SCHEMA prepzii_rewards TO prepzii_integrity_owner;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA prepzii_rewards TO prepzii_integrity_owner;
SET LOCAL ROLE prepzii_integrity_owner;
CREATE TABLE prepzii_integrity.opening_profiles(user_id text PRIMARY KEY,profile jsonb NOT NULL);
INSERT INTO prepzii_integrity.opening_profiles SELECT user_id,to_jsonb(x) FROM public.user_xp x;
CREATE TABLE prepzii_integrity.sessions(
 session_id uuid PRIMARY KEY,user_id text,attempt_id uuid,state text NOT NULL CHECK(state IN ('HISTORY','RESERVED','COMMITTED')),
 historical_count integer NOT NULL DEFAULT 0,payload jsonb,created_at timestamptz NOT NULL DEFAULT clock_timestamp());
INSERT INTO prepzii_integrity.sessions(session_id,user_id,attempt_id,state,historical_count)
 SELECT session_id,CASE WHEN count(*)=1 THEN (array_agg(user_id))[1] END,
 CASE WHEN count(*)=1 THEN (array_agg(id))[1] END,'HISTORY',count(*) FROM public.test_attempts WHERE session_id IS NOT NULL GROUP BY session_id;
CREATE TABLE prepzii_integrity.consumed(user_id text NOT NULL,kind text NOT NULL,source text NOT NULL,PRIMARY KEY(user_id,kind,source));
INSERT INTO prepzii_integrity.consumed SELECT DISTINCT user_id,'TEST',session_id::text FROM public.test_attempts WHERE session_id IS NOT NULL;
INSERT INTO prepzii_integrity.consumed SELECT DISTINCT user_id,'PYQ',question_id::text FROM public.pyq_attempts;
INSERT INTO prepzii_integrity.consumed SELECT DISTINCT user_id,'BADGE',badge_id::text FROM public.user_badges;
CREATE TABLE prepzii_integrity.frozen_goals(user_id text NOT NULL,goal_id uuid NOT NULL,goal_date date NOT NULL,PRIMARY KEY(user_id,goal_id,goal_date));
INSERT INTO prepzii_integrity.frozen_goals SELECT user_id,goal_id,goal_date FROM public.user_daily_goals WHERE goal_date IS NOT NULL;
INSERT INTO prepzii_integrity.consumed SELECT user_id,'GOAL',goal_id::text||':'||goal_date::text FROM prepzii_rewards.receipts;
CREATE TABLE prepzii_integrity.receipts(user_id text NOT NULL,kind text NOT NULL,source text NOT NULL,
 delta integer NOT NULL CHECK(delta BETWEEN 0 AND 1000000),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(user_id,kind,source));
CREATE TABLE prepzii_integrity.permits(user_id text PRIMARY KEY,xid bigint NOT NULL,old_xp integer NOT NULL,new_xp integer NOT NULL);
CREATE TABLE prepzii_integrity.pyq_requests(user_id text NOT NULL,request_key text NOT NULL,payload jsonb NOT NULL,result jsonb NOT NULL,PRIMARY KEY(user_id,request_key));
ALTER TABLE prepzii_integrity.opening_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_integrity.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_integrity.consumed ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_integrity.frozen_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_integrity.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_integrity.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepzii_integrity.pyq_requests ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION prepzii_integrity.protect_xp() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE matched integer;
BEGIN
 IF TG_OP='UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'Immutable balance owner'; END IF;
 IF TG_OP='INSERT' AND COALESCE(NEW.xp,0)=0 THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' AND NEW.xp IS NOT DISTINCT FROM OLD.xp THEN RETURN NEW; END IF;
 DELETE FROM prepzii_integrity.permits WHERE user_id=NEW.user_id AND xid=txid_current()
 AND old_xp=CASE WHEN TG_OP='INSERT' THEN 0 ELSE COALESCE(OLD.xp,0) END AND new_xp=NEW.xp;
 GET DIAGNOSTICS matched=ROW_COUNT;
 IF matched<>1 THEN RAISE EXCEPTION 'Unreceipted XP mutation denied' USING ERRCODE='42501'; END IF;
 RETURN NEW;
END $$;
CREATE FUNCTION prepzii_integrity.reserve_session() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.session_id IS DISTINCT FROM OLD.session_id OR NEW.id IS DISTINCT FROM OLD.id THEN
   RAISE EXCEPTION 'Immutable attempt identity' USING ERRCODE='PZ409'; END IF; RETURN NEW;
 END IF;
 IF NEW.session_id IS NULL OR NOT EXISTS(SELECT 1 FROM public.test_sessions WHERE id=NEW.session_id AND user_id=NEW.user_id)
 OR EXISTS(SELECT 1 FROM public.zi_generated_sessions WHERE session_id=NEW.session_id) THEN
  RAISE EXCEPTION 'Owned normal session required' USING ERRCODE='22023'; END IF;
 INSERT INTO prepzii_integrity.sessions(session_id,user_id,attempt_id,state) VALUES(NEW.session_id,NEW.user_id,NEW.id,'RESERVED') ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RAISE EXCEPTION 'Session already reserved, committed or historical' USING ERRCODE='PZ409'; END IF;
 RETURN NEW;
END $$;
CREATE FUNCTION prepzii_integrity.refresh_level(p_user text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE x integer;lvl integer;threshold integer;step integer;
BEGIN
 SELECT COALESCE(xp,0) INTO x FROM public.user_xp WHERE user_id=p_user;
 IF x<500 THEN lvl:=1; ELSIF x<1200 THEN lvl:=2; ELSIF x<2200 THEN lvl:=3; ELSIF x<3500 THEN lvl:=4; ELSIF x<5000 THEN lvl:=5;
 ELSE lvl:=6;threshold:=6500;step:=1500;WHILE x>=threshold LOOP lvl:=lvl+1;step:=step+300;threshold:=threshold+step;END LOOP; END IF;
 UPDATE public.user_xp SET level=lvl,badge=CASE WHEN lvl>=10 THEN 'Grandmaster' WHEN lvl>=8 THEN 'Master' WHEN lvl>=6 THEN 'Elite' WHEN lvl>=4 THEN 'Expert' WHEN lvl>=2 THEN 'Challenger' ELSE 'Explorer' END WHERE user_id=p_user;
END $$;
CREATE FUNCTION prepzii_integrity.pay(p_user text,p_kind text,p_source text,p_delta integer,p_solved integer DEFAULT 0,p_correct integer DEFAULT 0)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE old_balance integer;
BEGIN
 IF p_user IS NULL OR p_user='' OR p_source IS NULL OR p_source='' OR p_delta IS NULL OR p_delta<0 OR p_delta>1000000
 OR p_solved<0 OR p_correct<0 OR p_correct>p_solved THEN RAISE EXCEPTION 'Invalid internal entitlement'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('prepzii-integrity:'||p_user,0));
 IF EXISTS(SELECT 1 FROM prepzii_integrity.consumed WHERE user_id=p_user AND kind=p_kind AND source=p_source) THEN RETURN false; END IF;
 INSERT INTO public.user_xp(user_id,xp,name) VALUES(p_user,0,'Student') ON CONFLICT(user_id) DO NOTHING;
 SELECT COALESCE(xp,0) INTO old_balance FROM public.user_xp WHERE user_id=p_user FOR UPDATE;
 INSERT INTO prepzii_integrity.receipts(user_id,kind,source,delta) VALUES(p_user,p_kind,p_source,p_delta) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO prepzii_integrity.permits VALUES(p_user,txid_current(),old_balance,old_balance+p_delta);
 UPDATE public.user_xp SET xp=COALESCE(xp,0)+p_delta,pyq_solved=COALESCE(pyq_solved,0)+p_solved,correct_answers=COALESCE(correct_answers,0)+p_correct,
 accuracy=CASE WHEN p_solved>0 THEN round(100.0*(COALESCE(correct_answers,0)+p_correct)/(COALESCE(pyq_solved,0)+p_solved)) ELSE accuracy END WHERE user_id=p_user;
 -- Zero-delta updates do not consume a permit; remove that private transient row.
 DELETE FROM prepzii_integrity.permits WHERE user_id=p_user AND xid=txid_current();
 PERFORM prepzii_integrity.refresh_level(p_user);
 RETURN true;
END $$;
CREATE FUNCTION prepzii_integrity.study(p_user text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE today date:=(clock_timestamp() AT TIME ZONE 'UTC')::date;
BEGIN
 UPDATE public.user_xp SET streak=CASE WHEN last_study_date=today THEN streak WHEN last_study_date=today-1 THEN COALESCE(streak,0)+1 ELSE 1 END,last_study_date=today
 WHERE user_id=p_user AND (last_study_date IS NULL OR last_study_date<today);
END $$;
CREATE FUNCTION public.prepzii_init_xp(p_user text,p_name text DEFAULT 'Student') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE result jsonb;
BEGIN
 IF p_user IS NULL OR p_user='' THEN RAISE EXCEPTION 'Verified identity required'; END IF;
 INSERT INTO public.user_xp(user_id,xp,name) VALUES(p_user,0,COALESCE(NULLIF(left(p_name,200),''),'Student')) ON CONFLICT(user_id) DO NOTHING;
 SELECT to_jsonb(x) INTO result FROM public.user_xp x WHERE user_id=p_user; RETURN result;
END $$;
-- Inputs are answers only. Never accepts an XP delta, result counters or reward key.
CREATE FUNCTION public.prepzii_commit_test(p_user text,p_session uuid,p_answers jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE s public.test_sessions; r prepzii_integrity.sessions; canonical jsonb; a jsonb; q public.questions;
 aid uuid; total integer; c integer:=0;w integer:=0;sc integer:=0;marks integer:=0;positive integer;negative integer;chosen text;correct boolean;answered boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('prepzii-integrity:'||p_user,0));
 SELECT * INTO s FROM public.test_sessions WHERE id=p_session AND user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Not found' USING ERRCODE='P0002'; END IF;
 IF EXISTS(SELECT 1 FROM public.zi_generated_sessions WHERE session_id=p_session) THEN RAISE EXCEPTION 'Wrong question source'; END IF;
 IF jsonb_typeof(p_answers) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid answer snapshot'; END IF;
 SELECT count(DISTINCT question_id) INTO total FROM public.test_questions WHERE session_id=p_session;
 IF total<1 OR jsonb_array_length(p_answers)<>total OR (SELECT count(DISTINCT (v->>'question_id')::uuid) FROM jsonb_array_elements(p_answers) v)<>total
 OR EXISTS(SELECT 1 FROM jsonb_array_elements(p_answers) v WHERE NOT EXISTS(SELECT 1 FROM public.test_questions WHERE session_id=p_session AND question_id=(v->>'question_id')::uuid)) THEN RAISE EXCEPTION 'Invalid answer snapshot'; END IF;
 SELECT jsonb_agg(jsonb_build_object('question_id',v->>'question_id','selected_option',v->'selected_option') ORDER BY v->>'question_id') INTO canonical FROM jsonb_array_elements(p_answers) v;
 SELECT * INTO r FROM prepzii_integrity.sessions WHERE session_id=p_session;
 IF FOUND THEN
  IF r.user_id IS DISTINCT FROM p_user OR r.attempt_id IS NULL OR (r.state='HISTORY' AND r.historical_count<>1) OR r.state='RESERVED'
   OR (r.state='COMMITTED' AND r.payload IS DISTINCT FROM canonical) THEN RAISE EXCEPTION 'Historical or conflicting saved submission' USING ERRCODE='PZ409'; END IF;
  IF (SELECT count(*) FROM public.user_answers WHERE attempt_id=r.attempt_id)<>total
   OR (SELECT count(DISTINCT question_id) FROM public.user_answers WHERE attempt_id=r.attempt_id)<>total
   OR EXISTS(SELECT 1 FROM public.user_answers u WHERE u.attempt_id=r.attempt_id AND NOT EXISTS(SELECT 1 FROM public.test_questions WHERE session_id=p_session AND question_id=u.question_id))
   OR EXISTS(SELECT 1 FROM public.institute_test_attempts WHERE session_id=p_session AND (attempt_id IS DISTINCT FROM r.attempt_id OR status<>'SUBMITTED')) THEN RAISE EXCEPTION 'Incomplete saved submission' USING ERRCODE='PZ409'; END IF;
  RETURN jsonb_build_object('attemptId',r.attempt_id,'created',false);
 END IF;
 -- Registry is reserved by the mandatory table trigger in this transaction.
 INSERT INTO public.test_attempts(user_id,session_id,total_questions,duration_minutes,status,submitted_at) VALUES(p_user,p_session,total,COALESCE(s.duration_minutes,0),'completed',clock_timestamp()) RETURNING id INTO aid;
 FOR a IN SELECT value FROM jsonb_array_elements(canonical) LOOP
  SELECT * INTO STRICT q FROM public.questions WHERE id=(a->>'question_id')::uuid;
  chosen:=NULLIF(upper(btrim(a->>'selected_option')),'');answered:=chosen IS NOT NULL;
  IF q.question_type IN ('Numerical','NUMERICAL') THEN
   IF answered AND (chosen !~ '^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)(E[+-]?[0-9]+)?$' OR q.correct_option !~ '^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$') THEN RAISE EXCEPTION 'Invalid numerical answer'; END IF;
   correct:=answered AND abs(chosen::numeric-q.correct_option::numeric)<=0.000000001;
  ELSIF q.question_type IN ('Multiple Correct','MULTIPLE_CORRECT') THEN
   IF answered AND chosen !~ '^[A-D](,[A-D])*$' THEN RAISE EXCEPTION 'Invalid answer option'; END IF;
   correct:=answered AND (SELECT array_agg(DISTINCT v ORDER BY v) FROM unnest(string_to_array(chosen,',')) v)=(SELECT array_agg(DISTINCT v ORDER BY v) FROM unnest(string_to_array(upper(q.correct_option),',')) v);
  ELSE
   IF answered AND chosen !~ '^[A-D]$' THEN RAISE EXCEPTION 'Invalid answer option'; END IF;
   correct:=answered AND chosen=upper(q.correct_option);
  END IF;
  IF q.negative_marks IS NOT NULL AND abs(q.negative_marks)<>trunc(abs(q.negative_marks)) THEN RAISE EXCEPTION 'Fractional marking needs reviewed score schema';END IF;
  positive:=CASE WHEN q.marks>0 THEN q.marks ELSE 4 END;negative:=COALESCE(abs(q.negative_marks)::integer,1);marks:=marks+positive;
  IF answered THEN IF correct THEN c:=c+1;sc:=sc+positive;ELSE w:=w+1;sc:=sc-negative;END IF; END IF;
  INSERT INTO public.user_answers(attempt_id,question_id,selected_option,correct_option,is_correct) VALUES(aid,q.id,chosen,q.correct_option,COALESCE(correct,false));
 END LOOP;
 UPDATE public.test_attempts SET score=sc,total_marks=marks,correct_answers=c,correct=c,wrong_answers=w,wrong=w,attempted=c+w,skipped=total-c-w,
 time_taken_seconds=greatest(0,least(extract(epoch FROM clock_timestamp()-s.started_at)::integer,COALESCE(s.duration_minutes,0)*60)) WHERE id=aid;
 UPDATE public.institute_test_attempts SET attempt_id=aid,status='SUBMITTED',submitted_at=clock_timestamp() WHERE session_id=p_session AND user_id=p_user;
 UPDATE public.test_sessions SET status='completed',completed_at=clock_timestamp() WHERE id=p_session;
 UPDATE prepzii_integrity.sessions SET state='COMMITTED',payload=canonical WHERE session_id=p_session;
 PERFORM prepzii_integrity.pay(p_user,'TEST',p_session::text,c*15,total,c);PERFORM prepzii_integrity.study(p_user);
 PERFORM public.prepzii_deliver_goal_rewards(p_user);
 RETURN jsonb_build_object('attemptId',aid,'created',true);
END $$;

CREATE FUNCTION public.prepzii_commit_pyq(p_user text,p_key text,p_answers jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE canonical jsonb; prior prepzii_integrity.pyq_requests; a jsonb; q jsonb; chosen text; correct boolean; kind text; aid uuid; results jsonb:='[]';result jsonb;
BEGIN
 IF p_user IS NULL OR p_user='' OR p_key IS NULL OR length(p_key) NOT BETWEEN 16 AND 200 OR jsonb_typeof(p_answers) IS DISTINCT FROM 'array'
 OR jsonb_array_length(p_answers) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid PYQ request'; END IF;
 SELECT jsonb_agg(jsonb_build_object('question_id',v->>'question_id','selected_option',v->'selected_option') ORDER BY v->>'question_id') INTO canonical FROM jsonb_array_elements(p_answers) v;
 IF (SELECT count(DISTINCT v->>'question_id') FROM jsonb_array_elements(canonical) v)<>jsonb_array_length(canonical) THEN RAISE EXCEPTION 'Duplicate PYQ source'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('prepzii-integrity:'||p_user,0));
 SELECT * INTO prior FROM prepzii_integrity.pyq_requests WHERE user_id=p_user AND request_key=p_key;
 IF FOUND THEN IF prior.payload IS DISTINCT FROM canonical THEN RAISE EXCEPTION 'Request key payload conflict' USING ERRCODE='PZ409'; END IF;RETURN prior.result;END IF;
 FOR a IN SELECT value FROM jsonb_array_elements(canonical) LOOP
  SELECT to_jsonb(t) INTO q FROM public.pyq_questions t WHERE id=(a->>'question_id')::uuid;
  IF q IS NULL THEN RAISE EXCEPTION 'Unknown PYQ question'; END IF;
  chosen:=NULLIF(upper(btrim(a->>'selected_option')),'');kind:=COALESCE(q->>'question_type','MCQ');
  IF kind='NUMERICAL' THEN
   IF chosen IS NOT NULL AND chosen !~ '^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)(E[+-]?[0-9]+)?$' THEN RAISE EXCEPTION 'Invalid numerical answer'; END IF;
   correct:=chosen IS NOT NULL AND CASE WHEN jsonb_array_length(COALESCE(NULLIF(q->'correct_options','null'::jsonb),'[]'::jsonb))>0 THEN EXISTS(SELECT 1 FROM jsonb_array_elements_text(q->'correct_options') v WHERE v::numeric=chosen::numeric)
    WHEN q->>'numerical_min' IS NOT NULL AND q->>'numerical_max' IS NOT NULL THEN chosen::numeric BETWEEN (q->>'numerical_min')::numeric AND (q->>'numerical_max')::numeric ELSE chosen::numeric=(q->>'numerical_answer')::numeric END;
  ELSE
   IF chosen IS NOT NULL AND chosen !~ '^[A-D](,[A-D])*$' THEN RAISE EXCEPTION 'Invalid answer option'; END IF;
   IF kind='MULTIPLE_CORRECT' THEN
    correct:=chosen IS NOT NULL AND (SELECT array_agg(DISTINCT v ORDER BY v) FROM unnest(string_to_array(chosen,',')) v)=(SELECT array_agg(upper(v) ORDER BY upper(v)) FROM jsonb_array_elements_text(COALESCE(NULLIF(q->'correct_options','null'::jsonb),'[]'::jsonb)) v);
   ELSE
    correct:=chosen IS NOT NULL AND CASE WHEN jsonb_array_length(COALESCE(NULLIF(q->'correct_options','null'::jsonb),'[]'::jsonb))>0 THEN EXISTS(SELECT 1 FROM jsonb_array_elements_text(q->'correct_options') v WHERE upper(v)=chosen) ELSE chosen=upper(q->>'correct_option') END;
   END IF;
  END IF;
  INSERT INTO public.pyq_attempts(user_id,question_id,selected_option,is_correct) VALUES(p_user,(a->>'question_id')::uuid,chosen,COALESCE(correct,false)) RETURNING id INTO aid;
  IF chosen IS NOT NULL THEN PERFORM prepzii_integrity.pay(p_user,'PYQ',a->>'question_id',CASE WHEN correct THEN 10 ELSE 2 END,1,CASE WHEN correct THEN 1 ELSE 0 END); END IF;
  results:=results||jsonb_build_array(jsonb_build_object('id',aid,'question_id',a->>'question_id','selected_option',chosen,'is_correct',COALESCE(correct,false),'correct_option',q->'correct_option','correct_options',q->'correct_options','numerical_answer',q->'numerical_answer','numerical_min',q->'numerical_min','numerical_max',q->'numerical_max','explanation',q->'explanation','explanation_image',q->'explanation_image'));
 END LOOP;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(canonical) v WHERE NULLIF(btrim(v->>'selected_option'),'') IS NOT NULL)
 THEN PERFORM prepzii_integrity.study(p_user); END IF;
 PERFORM public.prepzii_deliver_goal_rewards(p_user);
 SELECT jsonb_build_object('success',true,'xp',COALESCE(xp,0),'results',results) INTO result FROM public.user_xp WHERE user_id=p_user;
 IF result IS NULL THEN result:=jsonb_build_object('success',true,'xp',0,'results',results);END IF;
 INSERT INTO prepzii_integrity.pyq_requests VALUES(p_user,p_key,canonical,result);RETURN result;
END $$;
-- Legacy aggregation is preserved only in the immutable opening basis.
-- Current callers use the historical JEE default; stream-policy changes are deferred.
CREATE FUNCTION prepzii_integrity.legacy_badge_basis(p_user text) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
 WITH ta AS (
  SELECT a.* FROM public.test_attempts a LEFT JOIN public.tests t ON t.id=a.test_id
  LEFT JOIN LATERAL (SELECT q.exam FROM public.user_answers u JOIN public.questions q ON q.id=u.question_id WHERE u.attempt_id=a.id AND q.exam IS NOT NULL ORDER BY u.created_at,u.id LIMIT 1) q ON true
  WHERE a.user_id=p_user AND COALESCE(to_jsonb(t)->>'exam',q.exam) ILIKE '%JEE%'
 ), ts AS (SELECT count(*) tests,COALESCE(sum(attempted),0) solved,
  COALESCE(sum(COALESCE(NULLIF(correct_answers,0),correct,0)),0) correct,
  COALESCE(sum(time_taken_seconds),0) seconds,
  GREATEST(0,COALESCE(max(COALESCE(NULLIF(accuracy,0),score,0)),0)) mock FROM ta),
 pq AS (SELECT count(*) solved,count(*) FILTER(WHERE a.is_correct) correct FROM public.pyq_attempts a JOIN public.pyq_questions q ON q.id=a.question_id WHERE a.user_id=p_user AND (to_jsonb(q)->>'exam') ILIKE '%JEE%')
 SELECT jsonb_build_object('tests_completed',ts.tests,'test_solved',ts.solved,'test_seconds',ts.seconds,
 'test_correct',ts.correct,'pyq_correct',pq.correct,'pyq_completed',pq.solved,'total_questions',ts.solved+pq.solved,
 'accuracy',CASE WHEN ts.solved+pq.solved>0 THEN round(100.0*(ts.correct+pq.correct)/(ts.solved+pq.solved)) ELSE 0 END,
 'mock_tests',ts.mock,'speed_solver',CASE WHEN ts.solved>0 THEN NULLIF(round(ts.seconds::numeric/ts.solved),0) END,
 'total_xp',COALESCE(x.xp,0),'streak',COALESCE(x.streak,0),
 'leaderboard_rank',CASE WHEN x.user_id IS NOT NULL THEN 1+(SELECT count(*) FROM public.user_xp other WHERE other.xp>x.xp OR (other.xp=x.xp AND (to_jsonb(x)->>'updated_at') IS NOT NULL AND (to_jsonb(other)->>'updated_at')::timestamptz<(to_jsonb(x)->>'updated_at')::timestamptz)) END)
 FROM ts CROSS JOIN pq LEFT JOIN public.user_xp x ON x.user_id=p_user;
$$;
CREATE TABLE prepzii_integrity.badge_opening(user_id text PRIMARY KEY,basis jsonb NOT NULL);
ALTER TABLE prepzii_integrity.badge_opening ENABLE ROW LEVEL SECURITY;
INSERT INTO prepzii_integrity.badge_opening
 SELECT user_id,prepzii_integrity.legacy_badge_basis(user_id) FROM (
 SELECT user_id FROM prepzii_integrity.opening_profiles UNION SELECT user_id FROM public.test_attempts
 UNION SELECT user_id FROM public.pyq_attempts UNION SELECT clerk_user_id FROM public.user_profiles WHERE clerk_user_id IS NOT NULL) u;
CREATE TABLE prepzii_integrity.badge_holds(user_id text NOT NULL,badge_id uuid NOT NULL,basis jsonb NOT NULL,PRIMARY KEY(user_id,badge_id));
ALTER TABLE prepzii_integrity.badge_holds ENABLE ROW LEVEL SECURITY;
-- Keep unclaimed pre-cutover eligibility as evidence; do not create badges or pay it.
INSERT INTO prepzii_integrity.badge_holds
 SELECT o.user_id,b.id,o.basis FROM prepzii_integrity.badge_opening o CROSS JOIN public.badges b
 WHERE b.enabled AND b.requirement_type IN ('tests_completed','pyq_completed','total_questions','total_xp','streak','accuracy','leaderboard_rank','mock_tests','speed_solver')
 AND NOT EXISTS(SELECT 1 FROM public.user_badges e WHERE e.user_id=o.user_id AND e.badge_id=b.id)
 AND CASE WHEN b.requirement_type IN ('leaderboard_rank','speed_solver') THEN (o.basis->>b.requirement_type)::numeric<=b.requirement_value
 ELSE (o.basis->>b.requirement_type)::numeric>=b.requirement_value END;
CREATE FUNCTION prepzii_integrity.badge_stats(p_user text) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
 WITH opening AS (SELECT COALESCE((SELECT basis FROM prepzii_integrity.badge_opening WHERE user_id=p_user),'{}'::jsonb) b),
 ta AS (SELECT a.* FROM public.test_attempts a JOIN prepzii_integrity.sessions s ON s.attempt_id=a.id
  JOIN prepzii_integrity.receipts r ON r.user_id=a.user_id AND r.kind='TEST' AND r.source=a.session_id::text
  WHERE a.user_id=p_user AND s.state='COMMITTED' AND EXISTS(SELECT 1 FROM public.user_answers u JOIN public.questions q ON q.id=u.question_id WHERE u.attempt_id=a.id AND q.exam ILIKE '%JEE%')),
 ts AS (SELECT count(*) tests,COALESCE(sum(attempted),0) solved,COALESCE(sum(correct_answers),0) correct,
  COALESCE(sum(time_taken_seconds),0) seconds,GREATEST(0,COALESCE(max(COALESCE(NULLIF(accuracy,0),score,0)),0)) mock FROM ta),
 pq AS (SELECT count(*) solved,count(*) FILTER(WHERE r.delta=10) correct FROM prepzii_integrity.receipts r JOIN public.pyq_questions q ON q.id::text=r.source WHERE r.user_id=p_user AND r.kind='PYQ' AND (to_jsonb(q)->>'exam') ILIKE '%JEE%'),
 sums AS (SELECT COALESCE((b->>'tests_completed')::numeric,0)+ts.tests tests,
  COALESCE((b->>'test_solved')::numeric,0)+ts.solved test_solved,COALESCE((b->>'test_seconds')::numeric,0)+ts.seconds seconds,
  COALESCE((b->>'pyq_completed')::numeric,0)+pq.solved pyqs,
  COALESCE((b->>'test_correct')::numeric,0)+COALESCE((b->>'pyq_correct')::numeric,0)+ts.correct+pq.correct correct,
  GREATEST(COALESCE((b->>'mock_tests')::numeric,0),ts.mock) mock FROM opening CROSS JOIN ts CROSS JOIN pq)
 SELECT jsonb_build_object('tests_completed',s.tests,'pyq_completed',s.pyqs,'total_questions',s.test_solved+s.pyqs,
 'total_xp',COALESCE(x.xp,0),'streak',COALESCE(x.streak,0),'accuracy',CASE WHEN s.test_solved+s.pyqs>0 THEN round(100.0*s.correct/(s.test_solved+s.pyqs)) ELSE 0 END,
 'leaderboard_rank',CASE WHEN x.user_id IS NOT NULL THEN 1+(SELECT count(*) FROM public.user_xp other WHERE other.xp>x.xp OR (other.xp=x.xp AND (to_jsonb(x)->>'updated_at') IS NOT NULL AND (to_jsonb(other)->>'updated_at')::timestamptz<(to_jsonb(x)->>'updated_at')::timestamptz)) END,
 'mock_tests',s.mock,'speed_solver',CASE WHEN s.test_solved>0 THEN NULLIF(round(s.seconds/s.test_solved),0) END)
 FROM sums s LEFT JOIN public.user_xp x ON x.user_id=p_user;
$$;
CREATE FUNCTION public.prepzii_badge_stats(p_user text) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$ SELECT prepzii_integrity.badge_stats(p_user); $$;
CREATE FUNCTION public.prepzii_claim_badge(p_user text,p_badge uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE b jsonb;stats jsonb;kind text;target numeric;actual numeric;eligible boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('prepzii-integrity:'||p_user,0));
 PERFORM public.prepzii_init_xp(p_user);
 IF EXISTS(SELECT 1 FROM public.user_badges WHERE user_id=p_user AND badge_id=p_badge) THEN RETURN jsonb_build_object('earned',true,'created',false); END IF;
 IF EXISTS(SELECT 1 FROM prepzii_integrity.badge_holds WHERE user_id=p_user AND badge_id=p_badge) THEN RETURN jsonb_build_object('earned',false,'created',false,'historicalEligibilityHeld',true); END IF;
 SELECT to_jsonb(t) INTO b FROM public.badges t WHERE id=p_badge;
 IF b IS NULL OR COALESCE((b->>'enabled')::boolean,false) IS NOT true THEN RAISE EXCEPTION 'Badge unavailable'; END IF;
 kind:=b->>'requirement_type';target:=(b->>'requirement_value')::numeric;
 IF kind NOT IN ('tests_completed','pyq_completed','total_questions','total_xp','streak','accuracy','leaderboard_rank','mock_tests','speed_solver') OR target IS NULL OR target<0 THEN RAISE EXCEPTION 'Unsupported badge policy'; END IF;
 stats:=prepzii_integrity.badge_stats(p_user);actual:=(stats->>kind)::numeric;
 eligible:=actual IS NOT NULL AND CASE WHEN kind IN ('leaderboard_rank','speed_solver') THEN actual<=target ELSE actual>=target END;
 IF NOT COALESCE(eligible,false) THEN RETURN jsonb_build_object('earned',false,'created',false); END IF;
 INSERT INTO public.user_badges(user_id,badge_id) VALUES(p_user,p_badge) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN jsonb_build_object('earned',true,'created',false); END IF;
 PERFORM prepzii_integrity.pay(p_user,'BADGE',p_badge::text,(b->>'xp_reward')::integer);
 RETURN jsonb_build_object('earned',true,'created',true);
END $$;
-- Change only local routine owners explicitly; old table owner cannot manufacture
-- a private balance permit through a client-settable GUC or generic XP RPC.
RESET ROLE;
GRANT SELECT,INSERT,UPDATE ON public.user_daily_goals TO prepzii_integrity_owner;
ALTER FUNCTION public.prepzii_record_formula_access(text,text) OWNER TO prepzii_integrity_owner;
ALTER FUNCTION prepzii_rewards.capture(text,text,text,date) OWNER TO prepzii_integrity_owner;
ALTER FUNCTION public.prepzii_deliver_goal_rewards(text) OWNER TO prepzii_integrity_owner;
ALTER FUNCTION public.zi_commit_bank_submission(text,uuid,jsonb,jsonb) OWNER TO prepzii_integrity_owner;
SET LOCAL ROLE prepzii_integrity_owner;

CREATE OR REPLACE FUNCTION prepzii_rewards.capture(p_user text,p_kind text,p_source text,p_day date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE event_id uuid;
BEGIN
 IF p_user IS NULL OR p_user='' OR p_source IS NULL OR p_source='' THEN
  RAISE EXCEPTION 'Missing authoritative source'; END IF;
 IF p_kind='TEST' AND NOT EXISTS(SELECT 1 FROM prepzii_integrity.sessions WHERE session_id=p_source::uuid AND user_id=p_user AND state IN ('RESERVED','COMMITTED')) THEN RETURN; END IF;
 INSERT INTO prepzii_rewards.events(user_id,kind,source_key,activity_date)
 VALUES(p_user,p_kind,p_source,p_day) ON CONFLICT DO NOTHING RETURNING id INTO event_id;
 IF event_id IS NULL THEN RETURN; END IF;
 INSERT INTO prepzii_rewards.credits(event_id,goal_id,target_value,xp)
 SELECT event_id,g.id,g.target_value,g.xp FROM public.daily_goals g
 WHERE g.is_active AND g.goal_type=p_kind AND g.target_value>0 AND g.xp BETWEEN 0 AND 100000
 AND (g.target='ALL' OR g.target=COALESCE((SELECT exam FROM public.user_profiles WHERE clerk_user_id=p_user),'JEE'));
END $$;


CREATE OR REPLACE FUNCTION public.prepzii_deliver_goal_rewards(p_user text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE c record; state prepzii_rewards.progress%ROWTYPE; paid integer; total_paid integer:=0; processed integer:=0;
 new_xp integer; lvl integer; threshold integer; step integer; title text;
BEGIN
 IF p_user IS NULL OR p_user='' THEN RAISE EXCEPTION 'Missing verified identity'; END IF;
 -- Same key across server instances and reconnects; held until transaction end.
 PERFORM pg_advisory_xact_lock(hashtextextended('prepzii-integrity:'||p_user,0));
 FOR c IN SELECT e.user_id,e.activity_date,e.id,cg.goal_id,cg.target_value,cg.xp
 FROM prepzii_rewards.events e JOIN prepzii_rewards.credits cg ON cg.event_id=e.id
 WHERE e.user_id=p_user AND NOT cg.applied
 ORDER BY e.activity_date,e.created_at,e.id,cg.goal_id
 LIMIT 1000 FOR UPDATE OF cg LOOP
  IF EXISTS(SELECT 1 FROM prepzii_integrity.frozen_goals WHERE user_id=p_user AND goal_id=c.goal_id AND goal_date=c.activity_date) THEN
   UPDATE prepzii_rewards.credits SET applied=true WHERE event_id=c.id AND goal_id=c.goal_id;processed:=processed+1;CONTINUE;
  END IF;
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
    PERFORM prepzii_integrity.pay(p_user,'GOAL',c.goal_id::text||':'||c.activity_date::text,state.xp);
    total_paid:=total_paid+state.xp;
   END IF;
  END IF;
  UPDATE prepzii_rewards.credits SET applied=true WHERE event_id=c.id AND goal_id=c.goal_id;
  processed:=processed+1;
 END LOOP;
 RETURN jsonb_build_object('creditsProcessed',processed,'xpAwarded',total_paid,'pendingCredits',
  (SELECT count(*) FROM prepzii_rewards.credits cg JOIN prepzii_rewards.events e ON e.id=cg.event_id WHERE e.user_id=p_user AND NOT cg.applied));
END $$;

CREATE OR REPLACE FUNCTION public.prepzii_record_formula_access(p_user text,p_book text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.formula_books WHERE id::text=p_book) THEN RAISE EXCEPTION 'Unknown book'; END IF;
 PERFORM prepzii_rewards.capture(p_user,'FORMULA',p_book,(statement_timestamp() AT TIME ZONE 'UTC')::date);
 RETURN jsonb_build_object('recorded',true,'delivery',public.prepzii_deliver_goal_rewards(p_user));
END $$;

CREATE OR REPLACE FUNCTION public.zi_commit_bank_submission(p_owner text,p_session uuid,p_result jsonb,p_answers jsonb)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
 SELECT public.prepzii_commit_test(p_owner,p_session,p_answers);
$$;
RESET ROLE;
CREATE TRIGGER prepzii_xp_receipt_guard BEFORE INSERT OR UPDATE ON public.user_xp FOR EACH ROW EXECUTE FUNCTION prepzii_integrity.protect_xp();
CREATE TRIGGER prepzii_lifetime_session_guard BEFORE INSERT OR UPDATE ON public.test_attempts FOR EACH ROW EXECUTE FUNCTION prepzii_integrity.reserve_session();
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.test_attempts,public.user_answers,public.user_xp,public.pyq_attempts,public.user_badges,public.user_daily_goals FROM PUBLIC,anon,authenticated,service_role,authenticator RESTRICT;
REVOKE UPDATE,DELETE,TRUNCATE ON public.institute_test_attempts FROM PUBLIC,anon,authenticated,service_role,authenticator RESTRICT;
-- Remove explicit column grants too; table REVOKE alone is insufficient.
DO $$ DECLARE a record; BEGIN
 FOR a IN SELECT c.oid::regclass tbl,t.attname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_attribute t ON t.attrelid=c.oid
 WHERE n.nspname='public' AND c.relname IN ('test_attempts','user_answers','user_xp','pyq_attempts','user_badges','user_daily_goals','institute_test_attempts') AND t.attnum>0 AND NOT t.attisdropped LOOP
  EXECUTE format('REVOKE INSERT (%1$I), UPDATE (%1$I), REFERENCES (%1$I) ON TABLE %2$s FROM PUBLIC,anon,authenticated,service_role,authenticator RESTRICT',a.attname,a.tbl);
 END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA prepzii_integrity FROM PUBLIC,anon,authenticated,service_role,authenticator,postgres;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA prepzii_integrity FROM PUBLIC,anon,authenticated,service_role,authenticator,postgres;
REVOKE ALL ON FUNCTION public.prepzii_badge_stats(text),public.prepzii_record_formula_access(text,text),public.prepzii_init_xp(text,text),public.prepzii_commit_test(text,uuid,jsonb),public.prepzii_commit_pyq(text,text,jsonb),public.prepzii_claim_badge(text,uuid),public.prepzii_deliver_goal_rewards(text),public.zi_commit_bank_submission(text,uuid,jsonb,jsonb) FROM PUBLIC,anon,authenticated,authenticator,service_role;
GRANT EXECUTE ON FUNCTION public.prepzii_badge_stats(text),public.prepzii_record_formula_access(text,text),public.prepzii_init_xp(text,text),public.prepzii_commit_test(text,uuid,jsonb),public.prepzii_commit_pyq(text,text,jsonb),public.prepzii_claim_badge(text,uuid),public.prepzii_deliver_goal_rewards(text),public.zi_commit_bank_submission(text,uuid,jsonb,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION prepzii_rewards.capture(text,text,text,date) TO postgres;
REVOKE CREATE ON SCHEMA public,prepzii_rewards FROM prepzii_integrity_owner;
DO $integrity_privilege_guard$ DECLARE r record;t record; BEGIN
 FOR r IN SELECT oid,rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','authenticator','postgres') LOOP
  IF pg_has_role(r.oid,'prepzii_integrity_owner'::regrole,'MEMBER') THEN RAISE EXCEPTION 'Unsafe integrity owner reachability'; END IF;
 END LOOP;
 -- Inspect inherited privileges AND SET-only reachable roles (PG17 semantics).
 FOR r IN SELECT DISTINCT reach.oid,reach.rolname FROM pg_roles root CROSS JOIN pg_roles reach
 WHERE root.rolname IN ('anon','authenticated','service_role','authenticator')
 AND (root.oid=reach.oid OR pg_has_role(root.oid,reach.oid,'USAGE') OR pg_has_role(root.oid,reach.oid,'SET')) LOOP
  FOR t IN SELECT c.oid FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('test_attempts','user_answers','user_xp','pyq_attempts','user_badges','user_daily_goals') LOOP
   IF has_table_privilege(r.oid,t.oid,'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER') OR has_any_column_privilege(r.oid,t.oid,'INSERT,UPDATE') THEN RAISE EXCEPTION 'Protected runtime mutation survives'; END IF;
  END LOOP;
  IF has_table_privilege(r.oid,'public.institute_test_attempts','UPDATE,DELETE,TRUNCATE') OR has_any_column_privilege(r.oid,'public.institute_test_attempts','UPDATE')
   THEN RAISE EXCEPTION 'Protected institute mutation survives'; END IF;
 END LOOP;
END $integrity_privilege_guard$;

COMMIT;
