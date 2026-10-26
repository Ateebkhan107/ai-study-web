-- Synthetic historical rows and schema metadata only; never application data.
BEGIN;
ALTER TABLE public.tests ADD COLUMN exam text;
ALTER TABLE public.pyq_questions ADD COLUMN exam text;
ALTER TABLE public.pyq_questions ADD COLUMN correct_options jsonb;
ALTER TABLE public.pyq_questions ADD COLUMN numerical_answer numeric;
ALTER TABLE public.pyq_questions ADD COLUMN numerical_min numeric;
ALTER TABLE public.pyq_questions ADD COLUMN numerical_max numeric;
ALTER TABLE public.user_xp ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.badges ADD COLUMN enabled boolean DEFAULT true;
ALTER TABLE public.badges ADD COLUMN requirement_type text;
ALTER TABLE public.badges ADD COLUMN requirement_value numeric;
ALTER TABLE public.daily_goals ADD COLUMN target text DEFAULT 'ALL';
SET LOCAL ROLE postgres;
CREATE TABLE public.formula_books(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
INSERT INTO user_xp(user_id,xp,streak,updated_at) VALUES('synthetic-release-history',900,3,'2026-10-01'),('synthetic-release-tie',900,0,'2026-09-01');
INSERT INTO user_profiles(clerk_user_id,exam,full_name) VALUES('synthetic-release-history','JEE','SYNTHETIC HISTORY');
INSERT INTO questions(id,exam,subject,chapter,difficulty,question_text,correct_option) VALUES('66666666-6666-4666-8666-000000000001','JEE Main','Physics','Synthetic','Medium','SYNTHETIC HISTORICAL QUESTION','A');
INSERT INTO test_sessions(id,user_id,exam,total_questions,duration_minutes) VALUES('66666666-6666-4666-8666-000000000002','synthetic-release-history','JEE Main',1,5);
INSERT INTO test_questions(session_id,question_id) VALUES('66666666-6666-4666-8666-000000000002','66666666-6666-4666-8666-000000000001');
INSERT INTO test_attempts(id,user_id,session_id,total_questions,duration_minutes,attempted,correct_answers,correct,score,accuracy,time_taken_seconds) VALUES
 ('66666666-6666-4666-8666-000000000011','synthetic-release-history','66666666-6666-4666-8666-000000000002',1,5,2,0,1,4,0,21),
 ('66666666-6666-4666-8666-000000000012','synthetic-release-history','66666666-6666-4666-8666-000000000002',1,5,2,1,0,3,85,20);
INSERT INTO user_answers(attempt_id,question_id,selected_option,is_correct) VALUES
 ('66666666-6666-4666-8666-000000000011','66666666-6666-4666-8666-000000000001','A',true),
 ('66666666-6666-4666-8666-000000000012','66666666-6666-4666-8666-000000000001','A',true);
INSERT INTO pyq_questions(id,question_type,correct_option,exam) VALUES
 ('66666666-6666-4666-8666-000000000003','MCQ','A','JEE Main'),('66666666-6666-4666-8666-000000000004','MCQ','B','JEE Main'),('66666666-6666-4666-8666-000000000005','MCQ','A','NEET');
INSERT INTO pyq_attempts(user_id,question_id,selected_option,is_correct) VALUES
 ('synthetic-release-history','66666666-6666-4666-8666-000000000003','A',true),
 ('synthetic-release-history','66666666-6666-4666-8666-000000000003','B',false),
 ('synthetic-release-history','66666666-6666-4666-8666-000000000005','A',true);
INSERT INTO daily_goals(id,goal_type,target_value,xp,target) VALUES
 ('66666666-6666-4666-8666-000000000008','TEST',1,12,'ALL'),
 ('66666666-6666-4666-8666-000000000009','PYQ',2,20,'ALL'),
 ('66666666-6666-4666-8666-000000000010','FORMULA',1,5,'ALL');
INSERT INTO user_daily_goals(user_id,goal_id,goal_date,progress,completed) VALUES('synthetic-release-history','66666666-6666-4666-8666-000000000009',CURRENT_DATE,2,true);
INSERT INTO badges(id,name,xp_reward,enabled,requirement_type,requirement_value) VALUES
 ('66666666-6666-4666-8666-000000000020','SYNTHETIC EXISTING BADGE',9,true,'total_xp',500),
 ('66666666-6666-4666-8666-000000000021','SYNTHETIC HISTORICAL ELIGIBILITY',7,true,'tests_completed',2);
INSERT INTO user_badges(user_id,badge_id) VALUES('synthetic-release-history','66666666-6666-4666-8666-000000000020');
COMMIT;
