-- SYNTHETIC LOCAL FIXTURE ONLY. Not a production migration or schema dump.
-- PREPARED, NOT EXECUTED. Fresh disposable PostgreSQL 17.6 cluster required.
BEGIN;
DO $guard$
BEGIN
  IF current_database() <> 'zi_phase5_security17_fixture'
    OR CURRENT_USER <> 'zi_phase5_lab_admin'
    OR pg_catalog.inet_server_addr() IS NOT NULL
    OR pg_catalog.current_setting('port') <> '55436'
    OR pg_catalog.current_setting('server_version_num') <> '170006'
 OR current_setting('data_directory')<>'/private/tmp/prepzii-pg176.ujiylN/data'
 OR current_setting('listen_addresses')<>''
 OR current_setting('unix_socket_directories')<>'/tmp/prepzii-phase5-pg17'
 OR session_user<>'zi_phase5_lab_admin'
 OR (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname=current_database())<>'zi_phase5_lab_admin' THEN
    RAISE EXCEPTION 'Wrong synthetic local fixture endpoint/version/operator';
  END IF;
END $guard$;
-- initdb must use zi_phase5_lab_admin, so these role names are fresh.
CREATE ROLE supabase_admin SUPERUSER NOLOGIN;
CREATE ROLE postgres NOSUPERUSER LOGIN BYPASSRLS CREATEROLE CREATEDB;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE ROLE authenticator LOGIN NOINHERIT;
GRANT anon, authenticated, service_role TO authenticator WITH INHERIT FALSE, SET TRUE;
GRANT anon, authenticated, service_role, authenticator TO postgres WITH ADMIN TRUE, INHERIT TRUE, SET TRUE;
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO postgres, supabase_admin;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
SET LOCAL ROLE postgres;
CREATE TABLE public.institutes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL);
CREATE TABLE public.tests(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.questions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), exam text NOT NULL,subject text NOT NULL,
  chapter text NOT NULL,difficulty text NOT NULL,topic text,question_type text DEFAULT 'MCQ',
  question_text text NOT NULL,correct_option text NOT NULL,option_a text,option_b text,option_c text,option_d text,
  marks integer DEFAULT 4,negative_marks numeric DEFAULT -1,is_active boolean DEFAULT true,
  source_type text NOT NULL DEFAULT 'PRACTICE',status text NOT NULL DEFAULT 'PUBLISHED',created_at timestamptz DEFAULT now());
CREATE TABLE public.test_sessions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL,exam text NOT NULL,
  subjects text[],chapters text[],difficulty text,total_questions integer,duration_minutes integer,
  score numeric DEFAULT 0,correct_count integer DEFAULT 0,wrong_count integer DEFAULT 0,skipped_count integer DEFAULT 0,
  status text DEFAULT 'in_progress',started_at timestamptz DEFAULT now(),completed_at timestamptz);
CREATE TABLE public.test_attempts(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL,session_id uuid,
  test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE,mode text DEFAULT 'custom',subject text,difficulty text,
  score integer DEFAULT 0,total_marks integer,correct_answers integer DEFAULT 0,wrong_answers integer DEFAULT 0,
  correct integer DEFAULT 0,wrong integer DEFAULT 0,skipped integer DEFAULT 0,accuracy numeric(5,2) DEFAULT 0,
  attempted integer DEFAULT 0,total_questions integer NOT NULL,duration_minutes integer NOT NULL,
  time_taken_seconds integer,started_at timestamptz DEFAULT now(),submitted_at timestamptz,
  status text DEFAULT 'in_progress',created_at timestamptz DEFAULT now());
CREATE TABLE public.test_questions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id),session_id uuid,question_order integer,
  test_attempt_id uuid REFERENCES public.test_attempts(id),exam text,created_at timestamptz DEFAULT now());
CREATE TABLE public.user_answers(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),attempt_id uuid NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option text,correct_option text,is_correct boolean,time_spent_seconds integer DEFAULT 0,created_at timestamptz DEFAULT now());
CREATE TABLE public.institute_tests(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  title text NOT NULL,status text NOT NULL DEFAULT 'DRAFT');
CREATE TABLE public.institute_test_questions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),institute_test_id uuid NOT NULL REFERENCES public.institute_tests(id) ON DELETE CASCADE,
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id),question_order integer);
CREATE TABLE public.institute_test_attempts(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  institute_test_id uuid NOT NULL REFERENCES public.institute_tests(id) ON DELETE CASCADE,user_id text NOT NULL,
  session_id uuid REFERENCES public.test_sessions(id) ON DELETE SET NULL,
  attempt_id uuid REFERENCES public.test_attempts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'IN_PROGRESS',started_at timestamptz NOT NULL DEFAULT now(),submitted_at timestamptz,
  UNIQUE(institute_test_id,session_id));
CREATE TABLE public.pyq_questions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),question_type text,correct_option text);
CREATE TABLE public.pyq_attempts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL,
  question_id uuid REFERENCES public.pyq_questions(id),selected_option text,is_correct boolean);
CREATE TABLE public.user_profiles(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),clerk_user_id text UNIQUE,exam text,full_name text);
CREATE TABLE public.user_xp(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text UNIQUE NOT NULL,
  xp integer DEFAULT 0,name text,level integer DEFAULT 1,badge text,streak integer DEFAULT 0,last_study_date date,
  pyq_solved integer DEFAULT 0,correct_answers integer DEFAULT 0,accuracy numeric DEFAULT 0);
CREATE TABLE public.badges(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text,xp_reward integer DEFAULT 0);
CREATE TABLE public.daily_goals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_type text,target_value integer,xp integer,is_active boolean DEFAULT true);
CREATE TABLE public.user_badges(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL,
  badge_id uuid REFERENCES public.badges(id),UNIQUE(user_id,badge_id));
CREATE TABLE public.user_daily_goals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL,
  goal_id uuid REFERENCES public.daily_goals(id),goal_date date,progress integer,completed boolean,completed_at timestamptz,
  UNIQUE(user_id,goal_id),UNIQUE(user_id,goal_id,goal_date));
DO $rls$
DECLARE target text;
BEGIN
  FOREACH target IN ARRAY ARRAY['test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions',
    'badges','daily_goals','institute_test_questions','institute_tests','pyq_attempts','pyq_questions',
    'user_badges','user_daily_goals','user_profiles','user_xp'] LOOP
    EXECUTE pg_catalog.format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',target);
  END LOOP;
END $rls$;
INSERT INTO public.user_xp(user_id,xp) VALUES ('synthetic-A',0),('synthetic-B',0);
-- Deliberately synthetic control, NOT a reconstruction of increment_xp.
-- Demonstrates invoker RLS only; cannot establish the private routine's safety.
CREATE FUNCTION public.zi_fixture_increment_control(target text, delta integer)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,pg_temp AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.user_xp SET xp=xp+delta WHERE user_id=target;
  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected;
END $$;
COMMIT;
