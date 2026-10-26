import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
import {sql as labSql,evidence} from "./pg176Lab.mjs";
const enabled=process.env.ZI_FINAL_INTEGRITY17_LOCAL==="1";
const run=Number(process.env.ZI_FINAL_INTEGRITY17_RUN||1);
if(!Number.isInteger(run)||run<1||run>99)throw Error("Unsafe run");
const user=label=>`final-r${run}-${label}`;
const id=n=>`55555555-5555-4555-8555-${String(run*100000+n).padStart(12,'0')}`;
const literal=x=>`'${JSON.stringify(x).replaceAll("'","''")}'::jsonb`;
const q=id(1),pq=id(2),pq2=id(3),iid=id(4),itid=id(5),bid=id(6);
const sql=labSql;
const xp=u=>sql(`SELECT COALESCE((SELECT xp FROM public.user_xp WHERE user_id='${u}'),0);`);
const init=u=>sql(`SELECT prepzii_init_xp('${u}','Synthetic');`,"service_role");
const answers=choice=>literal([{question_id:q,selected_option:choice}]);
const commit=(u,s,choice='A')=>sql(`SELECT prepzii_commit_test('${u}','${s}',${answers(choice)});`,"service_role");
async function session(u,n,coaching=false){const s=id(n);await sql(`INSERT INTO test_sessions(id,user_id,exam,total_questions,duration_minutes) VALUES('${s}','${u}','JEE Main',1,5);
 INSERT INTO test_questions(session_id,question_id,question_order) VALUES('${s}','${q}',1);`,"service_role");if(coaching)await sql(`INSERT INTO institute_test_attempts(institute_id,institute_test_id,user_id,session_id) VALUES('${iid}','${itid}','${u}','${s}');`,"service_role");return s;}
const pyq=(u,key,rows=[{question_id:pq,selected_option:'A'}])=>sql(`SELECT prepzii_commit_pyq('${u}','${key}',${literal(rows)});`,"service_role");
async function barrier(app){for(let i=0;i<100;i++){if(await sql(`SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND application_name='${app}' AND wait_event='PgSleep');`)==='t')return;await new Promise(r=>setTimeout(r,10));}throw Error('Worker barrier not reached');}

test('final PostgreSQL 17.6 all-writer integrity contract',{skip:!enabled},async t=>{
 await sql(`INSERT INTO questions(id,exam,subject,chapter,difficulty,question_text,correct_option) VALUES('${q}','JEE Main','Physics','Synthetic','Medium','SYNTHETIC FINAL INTEGRITY QUESTION','A');
 INSERT INTO pyq_questions(id,question_type,correct_option) VALUES('${pq}','MCQ','A'),('${pq2}','MCQ','B');
 INSERT INTO institutes(id,name) VALUES('${iid}','SYNTHETIC FINAL LMS');
 INSERT INTO institute_tests(id,institute_id,title,status) VALUES('${itid}','${iid}','SYNTHETIC FINAL EXAM','PUBLISHED');`);
 await t.test('installation preserves every historical balance, progress and attempt row',async()=>{
  const before=JSON.parse(readFileSync(`${evidence}/integrity-before-install.json`));
  for(const table of ['user_xp','test_attempts','user_answers','pyq_attempts','user_daily_goals','user_badges']){
   for(const row of before[`public.${table}`])assert.equal(await sql(`SELECT to_jsonb(t)=${literal(row)} FROM public.${table} t WHERE id='${row.id}';`),'t',`${table}:${row.id}`);
  }
  assert.ok(Number(await sql("SELECT count(*) FROM prepzii_integrity.sessions WHERE historical_count>1;"))>0);
 });
 await t.test('historical duplicate groups are reserved, unchanged and cannot receive a new attempt',async()=>{
  const r=JSON.parse(await sql("SELECT json_build_object('s',s.session_id,'u',(SELECT user_id FROM test_attempts WHERE session_id=s.session_id LIMIT 1),'n',s.historical_count) FROM prepzii_integrity.sessions s WHERE historical_count>1 LIMIT 1;"));
  await assert.rejects(sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('${r.u}','${r.s}',1,5);`,"postgres"),/Session already/);
  const qs=JSON.parse(await sql(`SELECT json_agg(json_build_object('question_id',question_id,'selected_option','A')) FROM test_questions WHERE session_id='${r.s}';`));
  await assert.rejects(sql(`SELECT prepzii_commit_test('${r.u}','${r.s}',${literal(qs)});`,"service_role"),/Historical or conflicting/);
  assert.equal(await sql(`SELECT count(*) FROM test_attempts WHERE session_id='${r.s}';`),String(r.n));
 });
 await t.test('runtime roles cannot directly mutate protected tables or execute the receipt kernel',async()=>{
  for(const role of ['anon','authenticated','service_role','authenticator']){
   for(const table of ['test_attempts','user_answers','user_xp','pyq_attempts','user_badges','user_daily_goals'])
    assert.equal(await sql(`SELECT has_table_privilege('${role}','${table}','INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER') OR has_any_column_privilege('${role}','${table}','INSERT,UPDATE');`),'f');
   assert.equal(await sql(`SELECT pg_has_role('${role}','prepzii_integrity_owner','SET');`),'f');
   await assert.rejects(sql("SELECT prepzii_integrity.pay('fake','TEST','fake',999);",role),/permission denied/);
  }
  await assert.rejects(sql(`INSERT INTO test_attempts(user_id,total_questions,duration_minutes) VALUES('${user('null')}',1,5);`,"postgres"),/Owned normal session/);
 });
 await t.test('cutover postcondition rejects inherited, SET-only and column privilege bypasses',async()=>{
  const proposal=readFileSync(new URL('../../../db/proposals/20261022_final_integrity_staging.sql',import.meta.url),'utf8');
  const verifier=proposal.match(/DO \$integrity_privilege_guard\$[\s\S]*?END \$integrity_privilege_guard\$;/)?.[0];
  assert.ok(verifier);await sql(verifier);
  for(const grant of ['GRANT UPDATE ON public.user_xp TO synthetic_reachable;', 'GRANT UPDATE(xp) ON public.user_xp TO synthetic_reachable;', 'GRANT UPDATE ON public.institute_test_attempts TO synthetic_reachable;']){
   for(const inherit of ['TRUE','FALSE'])await assert.rejects(sql(`BEGIN; CREATE ROLE synthetic_reachable NOLOGIN;GRANT synthetic_reachable TO authenticated WITH INHERIT ${inherit}, SET TRUE;${grant}${verifier}COMMIT;`),/Protected.*mutation survives/);
  }
  assert.equal(await sql("SELECT count(*) FROM pg_roles WHERE rolname='synthetic_reachable';"),'0');
 });
 await t.test('normal/coaching eight-connection retries create one attempt, base reward, goal and streak',async()=>{
  const u=user('coaching'),s=await session(u,11,true);const results=await Promise.all(Array.from({length:8},()=>commit(u,s)));
  assert.equal(new Set(results.map(r=>JSON.parse(r).attemptId)).size,1);assert.equal(await xp(u),'27');
  assert.equal(await sql(`SELECT count(*) FROM test_attempts WHERE session_id='${s}';`),'1');
  assert.equal(await sql(`SELECT count(*) FROM prepzii_integrity.receipts WHERE user_id='${u}';`),'2');
  assert.equal(await sql(`SELECT streak FROM user_xp WHERE user_id='${u}';`),'1');
  assert.equal(await sql(`SELECT count(*) FROM institute_test_attempts WHERE session_id='${s}' AND status='SUBMITTED' AND attempt_id IS NOT NULL;`),'1');
  await assert.rejects(commit(u,s,'B'),/conflicting/);await assert.rejects(commit(user('other'),s),/Not found/);
 });
 await t.test('legacy RPC uses DB marking; legacy table inserts and altered attempt identities fail',async()=>{
  const u=user('legacy'),s=await session(u,12);await sql(`SELECT zi_commit_bank_submission('${u}','${s}','{"score":999999,"correct_answers":999999}',${answers('A')});`,"service_role");
  assert.equal(await sql(`SELECT score FROM test_attempts WHERE session_id='${s}';`),'4');assert.equal(await xp(u),'27');
  await assert.rejects(sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('${u}','${s}',1,5);`,"service_role"),/permission denied/);
  await assert.rejects(sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('${u}','${s}',1,5);`,"postgres"),/Session already/);
  await assert.rejects(sql(`UPDATE test_attempts SET session_id=NULL WHERE session_id='${s}';`,"postgres"),/Immutable attempt/);
 });
 await t.test('DB marking handles numerical zero, multiple choices, wrong and unanswered answers; fractional scores fail closed',async()=>{
  const u=user('grading');let n=700;
  for(const [type,key,choice,expected,penalty] of [['Numerical','0','0',4,-1],['Multiple Correct','A,B','B,A',4,-1],['MCQ','A','B',-1,-1],['Numerical','0',null,0,-1],['MCQ','A','B',null,-0.25]]){
   const qid=id(n++),s=id(n++);
   await sql(`INSERT INTO questions(id,exam,subject,chapter,difficulty,question_type,question_text,correct_option,negative_marks) VALUES('${qid}','JEE Main','Physics','Synthetic','Medium','${type}','SYNTHETIC MARKING','${key}',${penalty});
    INSERT INTO test_sessions(id,user_id,exam,total_questions,duration_minutes) VALUES('${s}','${u}','JEE Main',1,5);
    INSERT INTO test_questions(session_id,question_id) VALUES('${s}','${qid}');`,"service_role");
   const submit=()=>sql(`SELECT prepzii_commit_test('${u}','${s}',${literal([{question_id:qid,selected_option:choice}])});`,"service_role");
   if(expected===null){await assert.rejects(submit(),/Fractional marking/);assert.equal(await sql(`SELECT count(*) FROM prepzii_integrity.sessions WHERE session_id='${s}';`),'0');}
   else {await submit();assert.equal(await sql(`SELECT score FROM test_attempts WHERE session_id='${s}';`),String(expected));}
  }
 });
 await t.test('PYQ same-key replay, fresh-key farming and conflicting retries are controlled',async()=>{
  const u=user('pyq');const key=`synthetic-final-pyq-${run}`;const r=await Promise.all(Array.from({length:8},()=>pyq(u,key)));
  assert.equal(new Set(r).size,1);assert.equal(await xp(u),'10');
  await assert.rejects(pyq(u,key,[{question_id:pq,selected_option:'B'}]),/payload conflict/);
  await pyq(u,key+'-retake');assert.equal(await xp(u),'10');
  await pyq(u,key+'-two',[{question_id:pq2,selected_option:'B'}]);assert.equal(await xp(u),'40');
  assert.equal(await sql(`SELECT count(*) FROM prepzii_integrity.receipts WHERE user_id='${u}' AND kind='PYQ';`),'2');
 });
 await t.test('PYQ partial batch failure rolls back attempts, events, receipts and XP before retry',async()=>{
  const u=user('pyq-fault'),key=`synthetic-pyq-fault-${run}`;
  await assert.rejects(pyq(u,key,[{question_id:pq,selected_option:'A'},{question_id:id(9999),selected_option:'A'}]),/Unknown PYQ/);
  assert.equal(await xp(u),'0');
  for(const table of ['public.pyq_attempts','prepzii_integrity.receipts','prepzii_integrity.pyq_requests','prepzii_rewards.events'])assert.equal(await sql(`SELECT count(*) FROM ${table} WHERE user_id='${u}';`),'0');
  await pyq(u,key);await pyq(u,key);assert.equal(await xp(u),'10');
 });
 await t.test('empty PYQ choices cannot advance an initialized user streak, stats, goals or XP',async()=>{
  const u=user('pyq-empty');await init(u);
  await pyq(u,`synthetic-pyq-empty-${run}`,[{question_id:pq,selected_option:null}]);
  assert.equal(await xp(u),'0');assert.equal(await sql(`SELECT COALESCE(streak,0)||':'||COALESCE(pyq_solved,0) FROM user_xp WHERE user_id='${u}';`),'0:0');
  assert.equal(await sql(`SELECT count(*) FROM prepzii_rewards.events WHERE user_id='${u}';`),'0');
 });
 await t.test('PYQ database marking supports multiple answers, numerical zero and numerical ranges',async()=>{
  await sql(`ALTER TABLE pyq_questions ADD COLUMN IF NOT EXISTS correct_options jsonb;ALTER TABLE pyq_questions ADD COLUMN IF NOT EXISTS numerical_answer numeric;
   ALTER TABLE pyq_questions ADD COLUMN IF NOT EXISTS numerical_min numeric;ALTER TABLE pyq_questions ADD COLUMN IF NOT EXISTS numerical_max numeric;
   INSERT INTO pyq_questions(id,question_type,correct_options) VALUES('${id(800)}','MULTIPLE_CORRECT','["A","B"]');
   INSERT INTO pyq_questions(id,question_type,numerical_answer) VALUES('${id(801)}','NUMERICAL',0);
   INSERT INTO pyq_questions(id,question_type,numerical_min,numerical_max) VALUES('${id(802)}','NUMERICAL',1,2);`);
  const u=user('pyq-grading');await pyq(u,`synthetic-pyq-grading-${run}`,[{question_id:id(800),selected_option:'B,A'},{question_id:id(801),selected_option:'0'},{question_id:id(802),selected_option:'1.5'}]);
  assert.equal(await sql(`SELECT count(*) FROM pyq_attempts WHERE user_id='${u}' AND is_correct;`),'3');assert.equal(await xp(u),'50');
 });
 await t.test('concurrent different-source rewards add; profile initialization cannot reset earned XP',async()=>{
  const u=user('sum'),s=await session(u,13);await init(u);
  await Promise.all([commit(u,s),pyq(u,`synthetic-final-sum-${run}`),...Array.from({length:8},()=>init(u))]);
  assert.equal(await xp(u),'37');assert.equal(await sql(`SELECT pyq_solved||':'||correct_answers FROM user_xp WHERE user_id='${u}';`),'2:2');
  await init(u);assert.equal(await xp(u),'37');
 });
 await t.test('absolute overwrites, fake GUCs and an old owner-definer XP routine cannot erase receipts',async()=>{
  const u=user('protected'),s=await session(u,14);await commit(u,s);
  await assert.rejects(sql(`UPDATE user_xp SET xp=7 WHERE user_id='${u}';`,"service_role"),/permission denied/);
  await assert.rejects(sql(`SET prepzii.integrity_authorized='true';UPDATE user_xp SET xp=7 WHERE user_id='${u}';`,"postgres"),/Unreceipted XP/);
  await sql(`CREATE FUNCTION public.synthetic_old_xp_${run}(uid text,amount integer) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$ UPDATE public.user_xp SET xp=amount WHERE user_id=uid $$;GRANT EXECUTE ON FUNCTION public.synthetic_old_xp_${run}(text,integer) TO service_role;`,"postgres");
  await assert.rejects(sql(`SELECT synthetic_old_xp_${run}('${u}',7);`,"service_role"),/Unreceipted XP/);
  assert.equal(await xp(u),'27');
 });
 await t.test('badge eligibility and unique badge plus XP receipt are one transaction',async()=>{
  const u=user('badge'),s=await session(u,15);await commit(u,s);
  await sql(`INSERT INTO badges(id,name,xp_reward,enabled,requirement_type,requirement_value) VALUES('${bid}','SYNTHETIC VERIFIED BADGE',9,true,'tests_completed',1);`);
  const responses=await Promise.all(Array.from({length:8},()=>sql(`SELECT prepzii_claim_badge('${u}','${bid}');`,"service_role")));
  assert.equal(responses.filter(r=>JSON.parse(r).created).length,1);assert.equal(await xp(u),'36');
  const empty=user('not-eligible');await sql(`SELECT prepzii_claim_badge('${empty}','${bid}');`,"service_role");assert.equal(await xp(empty),'0');
 });
 await t.test('old badge rows are never retroactively paid and initialization preserves old balances',async()=>{
  const u=user('old-badge');await init(u);await sql(`INSERT INTO user_badges(user_id,badge_id) VALUES('${u}','${bid}');`);
  await sql(`SELECT prepzii_claim_badge('${u}','${bid}');`,"service_role");assert.equal(await xp(u),'0');
  const old=JSON.parse(await sql("SELECT profile FROM prepzii_integrity.opening_profiles LIMIT 1;"));
  await init(old.user_id);assert.equal(await xp(old.user_id),String(old.xp||0));
 });
 await t.test('transaction failure rolls back session reservation, answers, receipts and XP',async()=>{
  const u=user('rollback'),s=await session(u,16);
  await assert.rejects(sql(`BEGIN;SELECT prepzii_commit_test('${u}','${s}',${answers('A')});SELECT 1/0;COMMIT;`,"service_role"),/division by zero/);
  assert.equal(await xp(u),'0');assert.equal(await sql(`SELECT count(*) FROM prepzii_integrity.sessions WHERE session_id='${s}';`),'0');
  assert.equal(await sql(`SELECT count(*) FROM test_attempts WHERE session_id='${s}';`),'0');await commit(u,s);assert.equal(await xp(u),'27');
 });
 await t.test('badge XP failure cannot leave an earned marker without payment',async()=>{
  const u=user('badge-fault'),s=await session(u,17);await commit(u,s);
  await sql(`CREATE FUNCTION public.synthetic_badge_fail_${run}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.user_id='${u}' THEN RAISE EXCEPTION 'synthetic balance failure';END IF;RETURN NEW;END $$;
   CREATE TRIGGER synthetic_badge_fail_${run} BEFORE UPDATE ON user_xp FOR EACH ROW EXECUTE FUNCTION public.synthetic_badge_fail_${run}();`);
  await assert.rejects(sql(`SELECT prepzii_claim_badge('${u}','${bid}');`,"service_role"),/synthetic balance failure/);
  assert.equal(await sql(`SELECT count(*) FROM user_badges WHERE user_id='${u}';`),'0');assert.equal(await xp(u),'27');
  await sql(`DROP TRIGGER synthetic_badge_fail_${run} ON user_xp;DROP FUNCTION public.synthetic_badge_fail_${run}();`);
  await sql(`SELECT prepzii_claim_badge('${u}','${bid}');`,"service_role");assert.equal(await xp(u),'36');
 });
 await t.test('terminated worker leaves no partial submission and retry commits exactly once',async()=>{
  const u=user('killed'),s=await session(u,18);await init(u);
  await sql(`CREATE FUNCTION public.synthetic_integrity_pause_${run}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.user_id='${u}' THEN PERFORM pg_sleep(15);END IF;RETURN NEW;END $$;
   CREATE TRIGGER synthetic_integrity_pause_${run} BEFORE UPDATE ON user_xp FOR EACH ROW EXECUTE FUNCTION public.synthetic_integrity_pause_${run}();`);
  const app='prepzii-kill-only-this-worker';const pending=sql(`SELECT prepzii_commit_test('${u}','${s}',${answers('A')});`,"service_role",app).then(data=>({data}),error=>({error}));
  await barrier(app);assert.equal(await sql(`SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND application_name='${app}' AND usename='zi_phase5_lab_admin' AND client_addr IS NULL;`),'1');
  await sql(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=current_database() AND application_name='${app}' AND usename='zi_phase5_lab_admin' AND client_addr IS NULL AND pid<>pg_backend_pid();`);
  assert.ok((await pending).error);assert.equal(await xp(u),'0');assert.equal(await sql(`SELECT count(*) FROM test_attempts WHERE session_id='${s}';`),'0');
  await sql(`DROP TRIGGER synthetic_integrity_pause_${run} ON user_xp;DROP FUNCTION public.synthetic_integrity_pause_${run}();`);
  await commit(u,s);await commit(u,s);assert.equal(await xp(u),'27');
 });
 await t.test('generated storage remains separate and cannot be used as a normal XP source',async()=>{
  const u=user('generated');const config={exam:'JEE Main',subject:'Physics',chapter:'Synthetic',difficulty:'Medium',questionCount:5};
  const qs=Array.from({length:5},(_,i)=>({statement:`SYNTHETIC FINAL GENERATED STORAGE QUESTION ${i} for integrity testing only.`,exam:'JEE Main',subject:'Physics',chapter:'Synthetic',topic:'Synthetic topic',questionType:'MCQ',sourceType:'AI_GENERATED',options:['A','B','C','D'],correctAnswer:0,explanation:['Synthetic one.','Synthetic two.'],validation:{status:'passed_implemented_checks',validationVersion:'zi-questions-v1.1'}}));
  const tid=await sql(`SELECT zi_store_generated_test('${u}','synthetic-final-generation-${run}',${literal(config)},'practice',NULL,'zi-questions-v1.1',${literal(qs)});`,"service_role");
  const s=JSON.parse(await sql(`SELECT zi_start_generated_test('${u}','${tid}');`,"service_role")).session_id;
  await assert.rejects(commit(u,s),/Wrong question source/);
  await sql(`SELECT zi_submit_generated_test('${u}','${s}',0,'{}');`,"service_role");assert.equal(await xp(u),'0');
 });
 await t.test('formula access and reward delivery commit atomically and replay once',async()=>{
  const u=user('formula'),book=id(50);await sql(`INSERT INTO formula_books(id) VALUES('${book}');`);
  await Promise.all(Array.from({length:8},()=>sql(`SELECT prepzii_record_formula_access('${u}','${book}');`,"service_role")));
  assert.equal(await xp(u),'5');assert.equal(await sql(`SELECT count(*) FROM prepzii_integrity.receipts WHERE user_id='${u}';`),'1');
 });
 await t.test('a reserved legacy goal period keeps its progress and cannot be paid again',async()=>{
  const u=user('frozen');const gid=await sql("SELECT id FROM daily_goals WHERE goal_type='PYQ' AND target_value=2 LIMIT 1;");
  await sql(`INSERT INTO user_daily_goals(user_id,goal_id,goal_date,progress,completed) VALUES('${u}','${gid}',(clock_timestamp() AT TIME ZONE 'UTC')::date,2,true);
  INSERT INTO prepzii_integrity.frozen_goals VALUES('${u}','${gid}',(clock_timestamp() AT TIME ZONE 'UTC')::date);`);
  await pyq(u,`synthetic-frozen-goal-${run}`,[{question_id:pq,selected_option:'A'},{question_id:pq2,selected_option:'B'}]);
  assert.equal(await xp(u),'20');assert.equal(await sql(`SELECT progress||':'||completed FROM user_daily_goals WHERE user_id='${u}';`),'2:true');
 });
 await t.test('all balances equal preserved opening balances plus exactly-once new receipts',async()=>{
  assert.equal(await sql(`SELECT count(*) FROM public.user_xp x LEFT JOIN prepzii_integrity.opening_profiles b USING(user_id)
   WHERE COALESCE(x.xp,0)<>COALESCE((b.profile->>'xp')::integer,0)+COALESCE((SELECT sum(delta) FROM prepzii_integrity.receipts r WHERE r.user_id=x.user_id),0);`),'0');
  assert.equal(await sql('SELECT count(*) FROM prepzii_integrity.permits;'),'0');
  assert.equal(await sql("SELECT count(*) FROM prepzii_integrity.sessions WHERE state='RESERVED';"),'0');
 });
 const counts=await sql("SELECT jsonb_build_object('receipts',(SELECT count(*) FROM prepzii_integrity.receipts),'reserved_history',(SELECT count(*) FROM prepzii_integrity.sessions WHERE state='HISTORY'),'committed',(SELECT count(*) FROM prepzii_integrity.sessions WHERE state='COMMITTED'));" );
 writeFileSync(`${evidence}/final-integrity-run${run}-counts.json`,counts,{flag:'wx',mode:0o600});
});
