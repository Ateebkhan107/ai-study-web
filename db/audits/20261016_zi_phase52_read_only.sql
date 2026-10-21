-- PHASE 5.2 READ ONLY — paste this complete script into Supabase SQL Editor
-- or use an authorized PostgreSQL connection. No migration/RPC execution.
-- Keep output private: catalog function definitions can contain operational details.
-- Does not execute migration functions, disclose answer keys, or change records.
begin isolation level repeatable read read only;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
set local search_path = pg_catalog, pg_temp;

select current_database(),current_user,version(),current_setting('transaction_read_only') read_only;
select n.nspname,c.relname,a.attname,pg_catalog.format_type(a.atttypid,a.atttypmod) type,
  a.attnotnull,pg_catalog.pg_get_expr(d.adbin,d.adrelid) default_expression
from pg_catalog.pg_attribute a join pg_catalog.pg_class c on c.oid=a.attrelid
join pg_catalog.pg_namespace n on n.oid=c.relnamespace
left join pg_catalog.pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
where n.nspname='public' and c.relname in ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions')
  and a.attnum>0 and not a.attisdropped order by c.relname,a.attnum;

-- Includes all incoming AND outgoing FKs, their delete actions, and CHECK/unique definitions.
select con.oid,con.conname,con.conrelid::regclass table_name,con.confrelid::regclass referenced_table,
  con.contype,con.convalidated,con.condeferrable,con.condeferred,
  pg_catalog.pg_get_constraintdef(con.oid,true) definition
from pg_catalog.pg_constraint con
where con.conrelid in (select oid from pg_catalog.pg_class where relnamespace='public'::regnamespace
  and relname in ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions','zi_generated_tests','zi_generated_questions','zi_generated_sessions'))
or con.confrelid in (select oid from pg_catalog.pg_class where relnamespace='public'::regnamespace
  and relname in ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions','zi_generated_tests','zi_generated_questions','zi_generated_sessions'));
select t.tgrelid::regclass table_name,t.tgname,t.tgenabled,t.tgisinternal,
  pg_catalog.pg_get_triggerdef(t.oid,true) definition,
  pg_catalog.pg_get_functiondef(t.tgfoid) function_definition
from pg_catalog.pg_trigger t where t.tgrelid in
 (select oid from pg_catalog.pg_class where relnamespace='public'::regnamespace and relname in
 ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','zi_generated_tests','zi_generated_questions','zi_generated_sessions'));
select c.relname,pg_catalog.pg_get_userbyid(c.relowner) owner,c.relrowsecurity,c.relforcerowsecurity,c.relacl
from pg_catalog.pg_class c where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v')
and c.relname in ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','zi_generated_tests','zi_generated_questions','zi_generated_sessions');
select * from pg_catalog.pg_policies where schemaname='public' and tablename in
 ('test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','zi_generated_tests','zi_generated_questions','zi_generated_sessions');
select nspname,pg_catalog.pg_get_userbyid(nspowner) owner,nspacl from pg_catalog.pg_namespace where nspname in ('public','pg_catalog');
select pg_catalog.pg_get_userbyid(defaclrole) owner,defaclnamespace::regnamespace schema_name,defaclobjtype,defaclacl from pg_catalog.pg_default_acl;
select oid::regprocedure function_name,pg_catalog.pg_get_userbyid(proowner) owner,prosecdef,proconfig,proacl
from pg_catalog.pg_proc where pronamespace='public'::regnamespace and proname in
 ('zi_store_generated_test','zi_start_generated_test','zi_validate_generated_answers','zi_save_generated_answers','zi_submit_generated_test','zi_commit_bank_submission');

-- No passwords: inspect role attributes, direct membership, and transitive membership.
select oid,rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolbypassrls from pg_catalog.pg_roles;
select roleid::regrole granted_role,member::regrole member,grantor::regrole grantor,admin_option,
 to_jsonb(m)->'inherit_option' inherit_option,to_jsonb(m)->'set_option' set_option from pg_catalog.pg_auth_members m;
select app.rolname application_role,parent.rolname reachable_role,
  pg_catalog.pg_has_role(app.oid,parent.oid,'USAGE') inherits_now
from pg_catalog.pg_roles app cross join pg_catalog.pg_roles parent
where app.rolname in ('anon','authenticated','service_role','authenticator')
and pg_catalog.pg_has_role(app.oid,parent.oid,'MEMBER');
select rolname,pg_catalog.has_schema_privilege(oid,'public','USAGE') public_usage,
 pg_catalog.has_schema_privilege(oid,'public','CREATE') public_create from pg_catalog.pg_roles;
select r.rolname,c.relname,
 pg_catalog.has_table_privilege(r.oid,c.oid,'SELECT') can_select,
 pg_catalog.has_table_privilege(r.oid,c.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') can_mutate
from pg_catalog.pg_roles r cross join pg_catalog.pg_class c
where r.rolname in ('anon','authenticated','service_role','authenticator')
and c.relnamespace='public'::regnamespace and c.relname in
 ('test_sessions','test_attempts','zi_generated_tests','zi_generated_questions','zi_generated_sessions');
select r.rolname,p.oid::regprocedure,pg_catalog.has_function_privilege(r.oid,p.oid,'EXECUTE') can_execute
from pg_catalog.pg_roles r cross join pg_catalog.pg_proc p
where r.rolname in ('anon','authenticated','service_role','authenticator') and p.pronamespace='public'::regnamespace
and p.proname in ('zi_store_generated_test','zi_start_generated_test','zi_validate_generated_answers','zi_save_generated_answers','zi_submit_generated_test','zi_commit_bank_submission');
select i.indrelid::regclass table_name,i.indisunique,i.indisvalid,i.indisready,
 pg_catalog.pg_get_indexdef(i.indexrelid) definition from pg_catalog.pg_index i
where i.indrelid in (select oid from pg_catalog.pg_class where relnamespace='public'::regnamespace and relname in
 ('test_attempts','test_sessions','user_answers','test_questions','institute_test_attempts','zi_generated_tests','zi_generated_questions','zi_generated_sessions'));
select count(*) duplicate_session_groups,coalesce(sum(n-1),0) excess_attempts from
 (select count(*) n from public.test_attempts where session_id is not null group by session_id having count(*)>1) d;
select count(*) filter(where duration_minutes=0) zero_duration_sessions,
 count(*) filter(where status='completed') completed_sessions from public.test_sessions;
-- Counts are observations; inspect CHECKs and trigger bodies above to establish compatibility.

-- All publicly defined DB-side attempt/reward writers, beyond the proposed RPCs.
-- prosrc is inspected as TEXT only; no discovered function is invoked.
select p.oid::regprocedure function_name,pg_get_userbyid(p.proowner) owner,
 p.prosecdef,p.proconfig,p.proacl,pg_get_functiondef(p.oid) definition
from pg_catalog.pg_proc p where p.pronamespace='public'::regnamespace and p.prokind='f'
 and (p.prosrc ~* '(test_attempts|user_xp|user_daily_goals|user_badges)' or p.proname='increment_xp');
select n.nspname,case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end grantee,
 a.privilege_type,a.is_grantable from pg_catalog.pg_namespace n
 cross join lateral aclexplode(coalesce(n.nspacl,acldefault('n',n.nspowner))) a where n.nspname='public';
select r.rolname,p.oid::regprocedure function_name,pg_get_userbyid(p.proowner) owner,
 pg_has_role(r.oid,p.proowner,'MEMBER') owner_membership,
 pg_has_role(r.oid,p.proowner,'USAGE') owner_inherited
from pg_catalog.pg_roles r cross join pg_catalog.pg_proc p
where r.rolname in ('anon','authenticated','service_role','authenticator')
 and p.pronamespace='public'::regnamespace and p.prosecdef;
select status,case when duration_minutes is null then 'NULL' when duration_minutes<0 then 'negative'
 when duration_minutes=0 then 'zero' else 'positive' end duration_class,count(*) sessions
from public.test_sessions group by 1,2 order by 1,2;

-- Privacy-safe duplicate grouping: no raw user IDs, session IDs or scores.
-- Fingerprints match docs/zi-phase52-duplicate-evidence.json.
with ranked as (
 select a.*,lag(a.created_at) over(partition by session_id order by created_at,id) previous_created
 from public.test_attempts a where session_id is not null
), grouped as (
 select a.session_id,count(*) attempts,count(distinct a.user_id) distinct_students,
  count(distinct a.score) distinct_nonnull_scores,count(*) filter(where a.score is null) missing_scores,
  bool_and(a.user_id=s.user_id) owners_match,
  extract(epoch from max(a.created_at)-min(a.created_at)) span_seconds,
  min(extract(epoch from a.created_at-previous_created)) min_gap_seconds,
  max(extract(epoch from a.created_at-previous_created)) max_gap_seconds,
  count(*) filter(where a.submitted_at is not null) submitted_timestamps
 from ranked a left join public.test_sessions s on s.id=a.session_id
 group by a.session_id having count(*)>1
)
select substr(md5(session_id::text),1,12) session_fingerprint,attempts,distinct_students,
 distinct_nonnull_scores,missing_scores,owners_match,span_seconds,min_gap_seconds,max_gap_seconds,submitted_timestamps
from grouped order by session_fingerprint;

-- Known incoming references from actual REST metadata. The catalog query above
-- identifies additional incoming FKs, if any; inspect logical/JSON references separately.
with duplicate_ids as (
 select id from public.test_attempts where session_id in
 (select session_id from public.test_attempts where session_id is not null group by session_id having count(*)>1)
)
select 'user_answers.attempt_id' reference,count(*) rows,count(distinct attempt_id) attempts_referenced
from public.user_answers where attempt_id in(select id from duplicate_ids)
union all
select 'test_questions.test_attempt_id',count(*),count(distinct test_attempt_id)
from public.test_questions where test_attempt_id in(select id from duplicate_ids)
union all
select 'institute_test_attempts.attempt_id',count(*),count(distinct attempt_id)
from public.institute_test_attempts where attempt_id in(select id from duplicate_ids);

-- To locate a fingerprint privately, an authorized operator may separately run:
-- SELECT id FROM public.test_sessions WHERE substr(md5(id::text),1,12)='paste_fingerprint';
-- Never paste raw student records into a public report. No automatic cleanup.
commit;
