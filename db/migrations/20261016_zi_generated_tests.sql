-- Production-catalog remediation revision 4 (unapplied). EXPLICIT SHARED-DATABASE APPROVAL REQUIRED.
-- No writes to official PYQs or the shared question bank. Transactional DDL.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = pg_catalog, pg_temp;

-- Fail closed: the executor becomes the SECURITY DEFINER owner. Browser and
-- connection roles must not be able to assume that owner, even via NOINHERIT.
do $owner_guard$
declare r record; owner_oid oid := current_user::regrole::oid;
begin
  for r in select oid,rolname,rolsuper,rolbypassrls from pg_catalog.pg_roles
    where rolname in ('anon','authenticated','service_role','authenticator') loop
    if pg_catalog.pg_has_role(r.oid,owner_oid,'MEMBER') then
      raise exception 'Unsafe migration owner: application role % can assume owner',r.rolname;
    end if;
    if r.rolname in ('anon','authenticated') and
      (r.rolsuper or r.rolbypassrls or pg_catalog.pg_has_role(r.oid,'service_role'::regrole,'MEMBER')) then
      raise exception 'Unsafe browser role membership/attributes: %',r.rolname;
    end if;
  end loop;
end $owner_guard$;


create table public.zi_generated_tests (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  owner_id text not null,
  creation_key text not null check (length(creation_key) between 16 and 200),
  config jsonb not null check (jsonb_typeof(config) = 'object'),
  validation_version text not null,
  question_count integer not null check (question_count between 5 and 30),
  mode text not null check (mode in ('timed','practice')),
  duration_minutes integer,
  status text not null default 'READY' check (status = 'READY'),
  created_at timestamptz not null default now(),
  unique (owner_id, creation_key), unique (id, owner_id),
  check ((mode = 'timed' and duration_minutes is not null and duration_minutes between 5 and 180) or (mode = 'practice' and duration_minutes is null)),
  check (coalesce(config->>'exam' in ('JEE Main','NEET'),false)),
  check (coalesce(config->>'subject' in ('Physics','Chemistry','Mathematics','Biology'),false)),
  check (not (config->>'exam'='NEET' and config->>'subject'='Mathematics') and not (config->>'exam'='JEE Main' and config->>'subject'='Biology'))
);
create table public.zi_generated_questions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  test_id uuid not null references public.zi_generated_tests(id) on delete cascade,
  question_order integer not null check (question_order between 1 and 30),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  validation jsonb not null check (coalesce(validation->>'status'='passed_implemented_checks',false)),
  unique (test_id, question_order), unique (test_id, id),
  check (coalesce(content->>'sourceType' = 'AI_GENERATED',false)),
  check (coalesce(content->>'questionType' = 'MCQ',false)),
  check (jsonb_typeof(content->'options') = 'array' and jsonb_array_length(content->'options') = 4 and content ? 'options'),
  check (jsonb_typeof(content->'correctAnswer') = 'number' and content->>'correctAnswer' ~ '^[0-3]$' and content ? 'correctAnswer'),
  check (jsonb_typeof(content->'explanation') = 'array' and jsonb_array_length(content->'explanation') >= 2 and content ? 'explanation'),
  check (coalesce(length(content->>'statement') >= 30,false)),
  check (coalesce(length(content->>'topic') >= 2,false))
);
create table public.zi_generated_sessions (
  session_id uuid primary key references public.test_sessions(id) on delete cascade,
  test_id uuid not null unique,
  owner_id text not null,
  started_at timestamptz not null,
  deadline_at timestamptz,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  revision integer not null default 0 check (revision >= 0),
  submitted_at timestamptz,
  result jsonb,
  foreign key (test_id, owner_id) references public.zi_generated_tests(id, owner_id),
  check (deadline_at is null or deadline_at > started_at),
  constraint zi_generated_sessions_submission_state_check check (
    (submitted_at is null and result is null) or
    (submitted_at is not null and result is not null and jsonb_typeof(result) = 'object')
  )
);
create index zi_generated_sessions_owner_idx on public.zi_generated_sessions(owner_id);
alter table public.zi_generated_tests enable row level security;
alter table public.zi_generated_questions enable row level security;
alter table public.zi_generated_sessions enable row level security;
-- Server DAL only. No browser role can read answer keys or write scores.
revoke all on public.zi_generated_tests, public.zi_generated_questions, public.zi_generated_sessions from public, anon, authenticated, service_role;
grant select on public.zi_generated_tests, public.zi_generated_questions, public.zi_generated_sessions to service_role;

create function public.zi_store_generated_test(p_owner text, p_key text, p_config jsonb, p_mode text, p_duration integer, p_version text, p_questions jsonb)
returns uuid language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
declare tid uuid; q jsonb; ord integer := 0;
begin
  if p_owner is null or length(p_owner) = 0 or jsonb_typeof(p_questions) is distinct from 'array'
     or jsonb_array_length(p_questions) not between 5 and 30
     or (p_config->>'questionCount')::integer is distinct from jsonb_array_length(p_questions)
     or p_version is distinct from 'zi-questions-v1.1' then raise exception 'Invalid validated test' using errcode='22023'; end if;
  -- Serialize the same creation key before any write. A retry returns the saved test.
  perform pg_advisory_xact_lock(hashtextextended(p_owner || ':' || p_key, 0));
  select id into tid from public.zi_generated_tests where owner_id = p_owner and creation_key = p_key;
  if found then return tid; end if;
  insert into public.zi_generated_tests(owner_id,creation_key,config,mode,duration_minutes,validation_version,question_count)
    values(p_owner,p_key,p_config,p_mode,p_duration,p_version,jsonb_array_length(p_questions)) returning id into tid;
  for q in select value from jsonb_array_elements(p_questions) loop
    if q->'validation'->>'status' is distinct from 'passed_implemented_checks'
       or q->'validation'->>'validationVersion' is distinct from p_version
       or q->>'exam' is distinct from p_config->>'exam'
       or q->>'subject' is distinct from p_config->>'subject' then raise exception 'Unvalidated question' using errcode='22023'; end if;
    ord := ord + 1;
    -- Evidence stays in a separate private column, never in a session DTO.
    insert into public.zi_generated_questions(test_id,question_order,content,validation) values(tid,ord,q - 'validation' - 'id',q->'validation');
  end loop;
  return tid;
end $$;

create function public.zi_start_generated_test(p_owner text, p_test uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
declare t public.zi_generated_tests; s public.zi_generated_sessions; sid uuid; stamp timestamptz;
begin
  select * into t from public.zi_generated_tests where id=p_test and owner_id=p_owner for update;
  if not found then raise exception 'Not found' using errcode='P0002'; end if;
  select * into s from public.zi_generated_sessions where test_id=t.id;
  if not found then
    if t.status <> 'READY' or (select count(*) from public.zi_generated_questions where test_id=t.id) <> t.question_count then
      raise exception 'Test is incomplete' using errcode='22023'; end if;
    stamp := clock_timestamp();
    insert into public.test_sessions(user_id,exam,subjects,chapters,difficulty,total_questions,duration_minutes,status,started_at)
      values(p_owner,t.config->>'exam',array[t.config->>'subject'],array[coalesce(t.config->>'chapter',t.config->>'topic')],t.config->>'difficulty',t.question_count,coalesce(t.duration_minutes,0),'in_progress',stamp) returning id into sid;
    insert into public.zi_generated_sessions(session_id,test_id,owner_id,started_at,deadline_at)
      values(sid,t.id,p_owner,stamp,case when t.mode='timed' then stamp + make_interval(mins=>t.duration_minutes) end) returning * into s;
  end if;
  return to_jsonb(s) || jsonb_build_object('server_now',clock_timestamp());
end $$;

create function public.zi_validate_generated_answers(p_test uuid, p_answers jsonb)
returns void language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  if jsonb_typeof(p_answers) is distinct from 'object' then raise exception 'Invalid answers' using errcode='22023'; end if;
  if exists(select 1 from jsonb_each(p_answers) a where
    not exists(select 1 from public.zi_generated_questions q where q.test_id=p_test and q.id::text=a.key)
    or (a.value <> 'null'::jsonb and (jsonb_typeof(a.value) <> 'number' or a.value::text !~ '^[0-3]$')))
    then raise exception 'Invalid answers' using errcode='22023'; end if;
end $$;

create function public.zi_save_generated_answers(p_owner text, p_session uuid, p_revision integer, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
declare s public.zi_generated_sessions;
begin
  select * into s from public.zi_generated_sessions where session_id=p_session and owner_id=p_owner for update;
  if not found then raise exception 'Not found' using errcode='P0002'; end if;
  if s.submitted_at is not null then return jsonb_build_object('submitted',true,'revision',s.revision); end if;
  if s.deadline_at is not null and clock_timestamp() >= s.deadline_at then
    return jsonb_build_object('expired',true,'revision',s.revision); end if;
  if p_revision is distinct from s.revision then raise exception 'Stale revision' using errcode='40001'; end if;
  perform public.zi_validate_generated_answers(s.test_id,p_answers);
  update public.zi_generated_sessions set answers=p_answers,revision=revision+1 where session_id=p_session returning * into s;
  return jsonb_build_object('revision',s.revision);
end $$;

create function public.zi_submit_generated_test(p_owner text, p_session uuid, p_revision integer, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
declare s public.zi_generated_sessions; q record; selected integer; c integer := 0; w integer := 0; total integer := 0;
  elapsed integer; stamp timestamptz; topics jsonb := '{}'; topic text; perf jsonb; v_result jsonb;
begin
  select * into s from public.zi_generated_sessions where session_id=p_session and owner_id=p_owner for update;
  if not found then raise exception 'Not found' using errcode='P0002'; end if;
  if s.submitted_at is not null then return jsonb_build_object('attemptId',s.session_id,'created',false); end if;
  stamp := clock_timestamp();
  -- Late final snapshots are ignored. Only server-saved pre-deadline answers count.
  if s.deadline_at is null or stamp < s.deadline_at then
    if p_revision is distinct from s.revision then raise exception 'Stale revision' using errcode='40001'; end if;
    perform public.zi_validate_generated_answers(s.test_id,p_answers);
    s.answers := p_answers;
  end if;
  elapsed := greatest(0, floor(extract(epoch from (least(stamp,coalesce(s.deadline_at,stamp))-s.started_at)))::integer);
  for q in select id,content from public.zi_generated_questions where test_id=s.test_id order by question_order loop
    total := total+1; selected := (s.answers->>q.id::text)::integer;
    topic := q.content->>'topic';
    perf := coalesce(topics->topic,'{"total":0,"correct":0,"incorrect":0,"unanswered":0}'::jsonb);
    perf := jsonb_set(perf,'{total}',to_jsonb((perf->>'total')::integer+1));
    if selected is null then
      perf := jsonb_set(perf,'{unanswered}',to_jsonb((perf->>'unanswered')::integer+1));
    elsif selected = (q.content->>'correctAnswer')::integer then
      c := c+1; perf := jsonb_set(perf,'{correct}',to_jsonb((perf->>'correct')::integer+1));
    else w := w+1; perf := jsonb_set(perf,'{incorrect}',to_jsonb((perf->>'incorrect')::integer+1)); end if;
    topics := jsonb_set(topics,array[topic],perf);
  end loop;
  v_result := jsonb_build_object('id',s.session_id,'session_id',s.session_id,'sourceType','AI_GENERATED',
    'score',c*4-w,'total_marks',total*4,'correct_answers',c,'wrong_answers',w,'attempted',c+w,
    'total_questions',total,'unanswered',total-c-w,'accuracy',case when c+w=0 then 0 else round(100.0*c/(c+w),2) end,
    'time_taken_seconds',elapsed,'topic_performance',topics,'submitted_at',stamp);
  update public.zi_generated_sessions set answers=s.answers,submitted_at=stamp,result=v_result where session_id=s.session_id;
  update public.test_sessions set status='completed',completed_at=stamp,score=c*4-w,correct_count=c,wrong_count=w,skipped_count=total-c-w where id=s.session_id and user_id=p_owner;
  if not found then raise exception 'Session ownership mismatch' using errcode='P0002'; end if;
  -- No user_xp, official PYQ counters, goals, or shared analytics writes.
  return jsonb_build_object('attemptId',s.session_id,'created',true);
end $$;

-- Normal-test commit: preserve existing marking, but serialize submissions and
-- atomically save answers/attempt/session. No deduplication or deletion of old data.
create function public.zi_commit_bank_submission(p_owner text, p_session uuid, p_result jsonb, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
declare s public.test_sessions; aid uuid; prior_count integer; prior_questions integer; expected integer;
begin
  select * into s from public.test_sessions where id=p_session and user_id=p_owner for update;
  if not found then raise exception 'Not found' using errcode='P0002'; end if;
  if exists(select 1 from public.zi_generated_sessions where session_id=p_session) then raise exception 'Wrong question source' using errcode='22023'; end if;
  if jsonb_typeof(p_answers) is distinct from 'array' then raise exception 'Invalid answer snapshot' using errcode='22023'; end if;
  expected := jsonb_array_length(p_answers);
  if expected < 1 or expected is distinct from (p_result->>'total_questions')::integer
    or (select count(distinct (a->>'question_id')::uuid) from jsonb_array_elements(p_answers) a) <> expected then
    raise exception 'Invalid answer snapshot' using errcode='22023'; end if;
  -- Existing legacy duplicates/partial writes must never be silently canonicalized.
  select count(*) into prior_count from public.test_attempts where session_id=p_session;
  if prior_count > 1 then raise exception 'Conflicting saved submissions' using errcode='PZ409'; end if;
  if prior_count = 1 then
    select id,total_questions into aid,prior_questions from public.test_attempts where session_id=p_session and user_id=p_owner;
    if not found then raise exception 'Session ownership mismatch' using errcode='P0002'; end if;
    if prior_questions is distinct from expected
      or (select count(*) from public.user_answers where attempt_id=aid) <> expected
      or (select count(distinct question_id) from public.user_answers where attempt_id=aid) <> expected
      or exists(select 1 from public.user_answers u where u.attempt_id=aid and not exists
        (select 1 from jsonb_array_elements(p_answers) a where (a->>'question_id')::uuid=u.question_id))
      or (select count(*) from public.institute_test_attempts where session_id=p_session and user_id=p_owner) > 1
      or exists(select 1 from public.institute_test_attempts where session_id=p_session and user_id=p_owner
        and (attempt_id is distinct from aid or status is distinct from 'SUBMITTED')) then
      raise exception 'Incomplete saved submission' using errcode='PZ409'; end if;
    return jsonb_build_object('attemptId',aid,'created',false);
  end if;
  insert into public.test_attempts(user_id,session_id,score,total_marks,correct_answers,wrong_answers,attempted,total_questions,duration_minutes,time_taken_seconds,status,submitted_at)
    values(p_owner,p_session,(p_result->>'score')::integer,(p_result->>'total_marks')::integer,(p_result->>'correct_answers')::integer,(p_result->>'wrong_answers')::integer,(p_result->>'attempted')::integer,(p_result->>'total_questions')::integer,coalesce(s.duration_minutes,0),
      greatest(0,least(extract(epoch from clock_timestamp()-s.started_at)::integer,coalesce(s.duration_minutes,0)*60)),'completed',clock_timestamp()) returning id into aid;
  insert into public.user_answers(attempt_id,question_id,selected_option,correct_option,is_correct)
    select aid,(a->>'question_id')::uuid,a->>'selected_option',a->>'correct_option',(a->>'is_correct')::boolean from jsonb_array_elements(p_answers) a;
  update public.institute_test_attempts set attempt_id=aid,status='SUBMITTED',submitted_at=clock_timestamp() where session_id=p_session and user_id=p_owner;
  update public.test_sessions set status='completed',completed_at=clock_timestamp() where id=p_session;
  return jsonb_build_object('attemptId',aid,'created',true);
end $$;

-- Remove ALL non-owner grants inherited from default ACLs on these objects.
-- This does not change global defaults, base tables, role memberships or schema ACLs.
do $reset_acl$
declare r record;
begin
  for r in
    select c.oid,c.relowner owner_oid,a.grantee,'TABLE' kind,
      pg_catalog.format('%I.%I',n.nspname,c.relname) identity
    from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
    cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
    where n.nspname='public' and c.relname in ('zi_generated_tests','zi_generated_questions','zi_generated_sessions')
    union all
    select p.oid,p.proowner,a.grantee,'FUNCTION',p.oid::regprocedure::text
    from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
    cross join lateral pg_catalog.aclexplode(coalesce(p.proacl,pg_catalog.acldefault('f',p.proowner))) a
    where n.nspname='public' and p.oid in ('public.zi_store_generated_test(text,text,jsonb,text,integer,text,jsonb)'::regprocedure,'public.zi_start_generated_test(text,uuid)'::regprocedure,'public.zi_validate_generated_answers(uuid,jsonb)'::regprocedure,'public.zi_save_generated_answers(text,uuid,integer,jsonb)'::regprocedure,'public.zi_submit_generated_test(text,uuid,integer,jsonb)'::regprocedure,'public.zi_commit_bank_submission(text,uuid,jsonb,jsonb)'::regprocedure)
  loop
    if r.owner_oid <> current_user::regrole::oid then raise exception 'Unexpected object owner'; end if;
    if r.grantee <> r.owner_oid then
      execute pg_catalog.format('REVOKE ALL PRIVILEGES ON %s %s FROM %s',r.kind,r.identity,
        case when r.grantee=0 then 'PUBLIC' else pg_catalog.quote_ident(pg_catalog.pg_get_userbyid(r.grantee)) end);
    end if;
  end loop;
  -- Table-level REVOKE does not clear separate column grants. Restrict this
  -- reset to columns of the three new private tables, never shared tables.
  for r in
    select c.relowner owner_oid,n.nspname,c.relname,col.attname,a.grantee
    from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
    join pg_catalog.pg_attribute col on col.attrelid=c.oid
    cross join lateral pg_catalog.aclexplode(col.attacl) a
    where n.nspname='public' and c.relname in ('zi_generated_tests','zi_generated_questions','zi_generated_sessions')
      and col.attnum>0 and not col.attisdropped
  loop
    if r.owner_oid <> current_user::regrole::oid then raise exception 'Unexpected column owner'; end if;
    if r.grantee <> r.owner_oid then
      execute pg_catalog.format('REVOKE ALL PRIVILEGES (%I) ON TABLE %I.%I FROM %s',
        r.attname,r.nspname,r.relname,
        case when r.grantee=0 then 'PUBLIC' else pg_catalog.quote_ident(pg_catalog.pg_get_userbyid(r.grantee)) end);
    end if;
  end loop;
end $reset_acl$;
revoke all on public.zi_generated_tests, public.zi_generated_questions, public.zi_generated_sessions from public, anon, authenticated, service_role;
grant select on public.zi_generated_tests, public.zi_generated_questions, public.zi_generated_sessions to service_role;

revoke all on function public.zi_store_generated_test(text,text,jsonb,text,integer,text,jsonb), public.zi_start_generated_test(text,uuid), public.zi_validate_generated_answers(uuid,jsonb), public.zi_save_generated_answers(text,uuid,integer,jsonb), public.zi_submit_generated_test(text,uuid,integer,jsonb), public.zi_commit_bank_submission(text,uuid,jsonb,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.zi_store_generated_test(text,text,jsonb,text,integer,text,jsonb), public.zi_start_generated_test(text,uuid), public.zi_save_generated_answers(text,uuid,integer,jsonb), public.zi_submit_generated_test(text,uuid,integer,jsonb), public.zi_commit_bank_submission(text,uuid,jsonb,jsonb) to service_role;
-- Direct REVOKEs do not remove privileges obtained through other roles.
-- Verify effective privileges and owners before committing any DDL.
do $verify_acl$
declare obj record; r record; helper boolean;
  forbidden_table_privileges text := 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER' ||
    case when pg_catalog.current_setting('server_version_num')::integer >= 170000 then ',MAINTAIN' else '' end;
begin
  for obj in select c.oid,c.relowner,c.relrowsecurity from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public'
    and c.relname in ('zi_generated_tests','zi_generated_questions','zi_generated_sessions') loop
    if obj.relowner <> current_user::regrole::oid or not obj.relrowsecurity then raise exception 'Unsafe table owner/RLS'; end if;
    for r in select rolname from pg_catalog.pg_roles where rolname in ('anon','authenticated','service_role','authenticator') loop
      if pg_catalog.has_table_privilege(r.rolname,obj.oid,forbidden_table_privileges)
        or pg_catalog.has_any_column_privilege(r.rolname,obj.oid,'INSERT,UPDATE,REFERENCES')
        or (r.rolname in ('anon','authenticated') and
          (pg_catalog.has_table_privilege(r.rolname,obj.oid,'SELECT')
            or pg_catalog.has_any_column_privilege(r.rolname,obj.oid,'SELECT'))) then
        raise exception 'Unexpected effective table privileges for %',r.rolname;
      end if;
    end loop;
    if not pg_catalog.has_table_privilege('service_role',obj.oid,'SELECT') then raise exception 'Missing server SELECT'; end if;
  end loop;
  for obj in select p.oid,p.proname,p.proowner,p.prosecdef,p.proconfig from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
    and p.oid in ('public.zi_store_generated_test(text,text,jsonb,text,integer,text,jsonb)'::regprocedure,'public.zi_start_generated_test(text,uuid)'::regprocedure,'public.zi_validate_generated_answers(uuid,jsonb)'::regprocedure,'public.zi_save_generated_answers(text,uuid,integer,jsonb)'::regprocedure,'public.zi_submit_generated_test(text,uuid,integer,jsonb)'::regprocedure,'public.zi_commit_bank_submission(text,uuid,jsonb,jsonb)'::regprocedure) loop
    if obj.proowner <> current_user::regrole::oid or not obj.prosecdef
      or not coalesce('search_path=pg_catalog, pg_temp'=any(obj.proconfig),false) then
      raise exception 'Unsafe function owner/search_path'; end if;
    helper := obj.proname='zi_validate_generated_answers';
    for r in select rolname from pg_catalog.pg_roles where rolname in ('anon','authenticated','service_role','authenticator') loop
      if (helper or r.rolname in ('anon','authenticated')) and pg_catalog.has_function_privilege(r.rolname,obj.oid,'EXECUTE') then
        raise exception 'Unexpected effective function privileges for %',r.rolname;
      end if;
    end loop;
    if not helper and not pg_catalog.has_function_privilege('service_role',obj.oid,'EXECUTE') then raise exception 'Missing server EXECUTE'; end if;
  end loop;
end $verify_acl$;
commit;
