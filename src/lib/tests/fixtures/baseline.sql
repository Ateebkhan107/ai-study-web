-- TEST FIXTURE ONLY. Match the inspected Supabase column types/FKs used here.
do $$ begin if current_database() !~ '^zi_phase5_remediation_fixture(_[0-9]+)?$' then raise exception 'Not a fixture database'; end if; end $$;
create schema if not exists public;
do $$ begin
  if not exists(select from pg_roles where rolname='anon') then create role anon; end if;
  if not exists(select from pg_roles where rolname='authenticated') then create role authenticated; end if;
  if not exists(select from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
end $$;
grant usage on schema public to anon,authenticated,service_role;
create table test_sessions(id uuid primary key default gen_random_uuid(),user_id text not null,exam text not null,subjects text[],chapters text[],difficulty text,total_questions integer,duration_minutes integer,score numeric default 0,correct_count integer default 0,wrong_count integer default 0,skipped_count integer default 0,status text default 'in_progress',started_at timestamptz default now(),completed_at timestamptz);
create table questions(id uuid primary key default gen_random_uuid());
create table tests(id uuid primary key default gen_random_uuid());
create table test_attempts(id uuid primary key default gen_random_uuid(),user_id text not null,session_id uuid,test_id uuid references tests(id),score integer default 0,total_marks integer,correct_answers integer default 0,wrong_answers integer default 0,attempted integer default 0,total_questions integer not null,duration_minutes integer not null,time_taken_seconds integer,started_at timestamptz default now(),submitted_at timestamptz,status text default 'in_progress',created_at timestamptz default now());
create table test_questions(id uuid primary key default gen_random_uuid(),question_id uuid references questions(id),session_id uuid,question_order integer,test_attempt_id uuid references test_attempts(id));
create table user_answers(id uuid primary key default gen_random_uuid(),attempt_id uuid not null references test_attempts(id),question_id uuid not null references questions(id),selected_option text,correct_option text,is_correct boolean);
create table institute_test_attempts(id uuid primary key default gen_random_uuid(),user_id text,session_id uuid references test_sessions(id),attempt_id uuid references test_attempts(id),status text,submitted_at timestamptz);
