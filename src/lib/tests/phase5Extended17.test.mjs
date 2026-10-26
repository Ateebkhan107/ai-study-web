import test from "node:test";
import assert from "node:assert/strict";
import { sql as labSql, snapshot } from "./pg176Lab.mjs";
const run=Number(process.env.ZI_PHASE5_EXTENDED17_RUN || 1);
if(!Number.isInteger(run)||run<1||run>99)throw Error("Unsafe synthetic run identifier");
const sql=(statement,...args)=>labSql(statement.replaceAll("synthetic-",`r${run}-synthetic-`),...args);
const id=n=>`33333333-3333-4333-8333-${String(333333333300+run*10000+n).padStart(12,"0")}`;
const enabled=process.env.ZI_PHASE5_EXTENDED17_LOCAL==="1";
const q=id(1);
const institute=id(2);
const instituteTest=id(3);
const book=id(4);
const session=n=>id(n);
const delivery=u=>`SELECT public.prepzii_deliver_goal_rewards('${u}');`;
const xp=u=>sql(`SELECT COALESCE((SELECT xp FROM user_xp WHERE user_id='${u}'),0);`);
const events=u=>sql(`SELECT count(*) FROM prepzii_rewards.events WHERE user_id='${u}' AND kind='TEST';`);
const activity=u=>`INSERT INTO pyq_attempts(user_id,question_id,selected_option,is_correct) VALUES('${u}','11111111-1111-4111-8111-111111111111','A',true),('${u}','22222222-2222-4222-8222-222222222222','A',true);`;
async function setupSession(user,n,coaching=false) {
 const sid=session(n);
 await sql(`INSERT INTO test_sessions(id,user_id,exam,total_questions,duration_minutes) VALUES('${sid}','${user}','JEE Main',1,5);
 INSERT INTO test_questions(session_id,question_id,question_order) VALUES('${sid}','${q}',1);`);
 if(coaching) await sql(`INSERT INTO institute_test_attempts(institute_id,institute_test_id,user_id,session_id) VALUES('${institute}','${instituteTest}','${user}','${sid}');`);
 return sid;
}
const commit=(u,s)=>`SELECT zi_commit_bank_submission('${u}','${s}','{"score":4,"total_marks":4,"correct_answers":1,"wrong_answers":0,"attempted":1,"total_questions":1}',
 '[{"question_id":"${q}","selected_option":"A","correct_option":"A","is_correct":true}]');`;
async function sleeping(application) {
 for(let i=0;i<100;i++){
  if(await sql(`SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND application_name='${application}' AND wait_event='PgSleep');`)==="t")return;
  await new Promise(r=>setTimeout(r,10));
 }
 throw Error("Synthetic barrier not reached");
}

test("extended PostgreSQL 17.6 source and recovery acceptance",{skip:!enabled},async t=>{
 await sql(`INSERT INTO questions(id,exam,subject,chapter,difficulty,question_text,correct_option) VALUES('${q}','JEE Main','Physics','Synthetic','Medium','SYNTHETIC EXTENDED QUESTION','A');
 INSERT INTO institutes(id,name) VALUES('${institute}','SYNTHETIC LMS');
 INSERT INTO institute_tests(id,institute_id,title,status) VALUES('${instituteTest}','${institute}','SYNTHETIC LMS TEST','PUBLISHED');
 INSERT INTO formula_books(id) VALUES('${book}');
 `);
 if(await sql("SELECT count(*) FROM daily_goals WHERE goal_type='TEST';")==="0")
  await sql("INSERT INTO daily_goals(goal_type,target_value,xp,target) VALUES('TEST',1,12,'ALL');");
 assert.equal(await sql("SELECT count(*) FROM daily_goals WHERE goal_type='TEST' AND target_value=1 AND xp=12;"),"1");
 await t.test("browser row operations remain denied; maintenance cannot truncate XP",async()=>{
  const before=await sql("SELECT sum(xp) FROM user_xp;");
  for(const role of ["anon","authenticated"]){
   assert.equal(await sql("SELECT count(*) FROM user_xp;",role),"0");
   assert.equal(await sql("WITH d AS(DELETE FROM user_xp RETURNING id) SELECT count(*) FROM d;",role),"0");
   await assert.rejects(sql("TRUNCATE public.user_xp;",role),/permission denied/);
   assert.equal(await sql(`SELECT has_table_privilege('${role}','user_xp','MAINTAIN');`),"f");
   assert.equal(await sql(`SELECT has_column_privilege('${role}','user_xp','xp','UPDATE');`),"t");
  }
  assert.equal(await sql("SELECT sum(xp) FROM user_xp;"),before);
 });
 await t.test("formula event replay and unknown-resource checks",async()=>{
  await assert.rejects(sql(`SELECT prepzii_record_formula_access('synthetic-formula','${session(999)}');`,"service_role"),/Unknown book/);
  for(let i=0;i<2;i++)await sql(`SELECT prepzii_record_formula_access('synthetic-formula','${book}');`,"service_role");
  await sql(delivery("synthetic-formula"),"service_role");
  assert.equal(await xp("synthetic-formula"),"5");
  assert.equal(await sql("SELECT count(*) FROM prepzii_rewards.events WHERE user_id='synthetic-formula';"),"1");
  await assert.rejects(sql(`SELECT prepzii_record_formula_access('synthetic-formula','${book}');`,"authenticated"),/permission denied/);
 });
 await t.test("normal/coaching RPC retries capture one TEST goal after complete association",async()=>{
  const sid=await setupSession("synthetic-lms",301,true);
  const receipts=await Promise.all(Array.from({length:8},()=>sql(commit("synthetic-lms",sid),"service_role")));
  assert.equal(new Set(receipts.map(r=>JSON.parse(r).attemptId)).size,1);
  assert.equal(await events("synthetic-lms"),"1");
  await sql(delivery("synthetic-lms"),"service_role");await sql(delivery("synthetic-lms"),"service_role");
  assert.equal(await xp("synthetic-lms"),"12");
  assert.equal(await sql(`SELECT count(*) FROM institute_test_attempts WHERE session_id='${sid}' AND status='SUBMITTED' AND attempt_id IS NOT NULL;`),"1");
  await assert.rejects(sql(commit("synthetic-other",sid),"service_role"),/Not found|not found/);
 });
 for(const first of ["answers","institute"])await t.test(`parallel legacy ${first}-first commits do not lose coaching goal activity`,async()=>{
  const u=`synthetic-order-${first}`,sid=await setupSession(u,first==="answers"?302:303,true);
  const aid=await sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('${u}','${sid}',1,5) RETURNING id;`,"service_role");
  const answers=`INSERT INTO user_answers(attempt_id,question_id,selected_option,is_correct) VALUES('${aid}','${q}','A',true);`;
  const association=`UPDATE institute_test_attempts SET attempt_id='${aid}',status='SUBMITTED' WHERE session_id='${sid}';`;
  const application=`prepzii-order-${first}`;
  const pending=sql(`BEGIN;${first==="answers"?answers:association}SELECT pg_sleep(0.4);COMMIT;`,"service_role",application);
  await sleeping(application);
  await sql(first==="answers"?association:answers,"service_role");await pending;
  assert.equal(await events(u),"1");await sql(delivery(u),"service_role");assert.equal(await xp(u),"12");
 });
 await t.test("partial answers and wrong-owner sessions cannot mint TEST events",async()=>{
  const sid=await setupSession("synthetic-partial",304,true);
  const aid=await sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('synthetic-partial','${sid}',1,5) RETURNING id;`);
  await sql(`UPDATE institute_test_attempts SET attempt_id='${aid}',status='SUBMITTED' WHERE session_id='${sid}';`);
  assert.equal(await events("synthetic-partial"),"0");
  const wrong=await sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('synthetic-wrong','${sid}',1,5) RETURNING id;`);
  await sql(`INSERT INTO user_answers(attempt_id,question_id,selected_option,is_correct) VALUES('${wrong}','${q}','A',true);`);
  assert.equal(await events("synthetic-wrong"),"0");
 });
 await t.test("legacy attempt bypass remains possible but cannot replay the TEST goal",async()=>{
  const sid=await setupSession("synthetic-lifetime",305,false);
  await sql(commit("synthetic-lifetime",sid),"service_role");
  const aid=await sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('synthetic-lifetime','${sid}',1,5) RETURNING id;`,"service_role");
  await sql(`INSERT INTO user_answers(attempt_id,question_id,selected_option,is_correct) VALUES('${aid}','${q}','A',true);`,"service_role");
  assert.equal(await sql(`SELECT count(*) FROM test_attempts WHERE session_id='${sid}';`),"2");
  assert.equal(await events("synthetic-lifetime"),"1");await sql(delivery("synthetic-lifetime"),"service_role");assert.equal(await xp("synthetic-lifetime"),"12");
 });
 await t.test("terminating one delivery backend rolls back effects; durable source retries exactly once",async()=>{
  await sql(`CREATE FUNCTION public.synthetic_pause_xp() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
   IF NEW.user_id='synthetic-killed' THEN PERFORM pg_sleep(15); END IF; RETURN NEW; END $$;
   CREATE TRIGGER synthetic_pause_xp BEFORE INSERT OR UPDATE ON user_xp FOR EACH ROW EXECUTE FUNCTION public.synthetic_pause_xp();${activity("synthetic-killed")}`);
  const app="prepzii-kill-only-this-worker";
  const pending=sql(delivery("synthetic-killed"),"service_role",app).then(data=>({data}),error=>({error}));
  await sleeping(app);
  assert.equal(await sql(`SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND application_name='${app}' AND usename='zi_phase5_lab_admin' AND client_addr IS NULL;`),"1");
  assert.equal(await sql(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=current_database() AND application_name='${app}' AND usename='zi_phase5_lab_admin' AND client_addr IS NULL AND pid<>pg_backend_pid();`),"t");
  assert.ok((await pending).error);
  assert.equal(await xp("synthetic-killed"),"0");
  assert.equal(await sql("SELECT count(*) FROM prepzii_rewards.receipts WHERE user_id='synthetic-killed';"),"0");
  assert.equal(await sql("SELECT count(*) FROM user_daily_goals WHERE user_id='synthetic-killed';"),"0");
  await sql("DROP TRIGGER synthetic_pause_xp ON user_xp;DROP FUNCTION public.synthetic_pause_xp();");
  await sql(delivery("synthetic-killed"),"service_role");await sql(delivery("synthetic-killed"),"service_role");assert.equal(await xp("synthetic-killed"),"20");
 });
 await t.test("characterization: unrestricted legacy XP overwrite can erase a committed goal reward",async()=>{
  await sql(activity("synthetic-overwrite"));
  const stale=Number(await xp("synthetic-overwrite"));
  await sql(delivery("synthetic-overwrite"),"service_role");assert.equal(await xp("synthetic-overwrite"),"20");
  await sql(`INSERT INTO user_xp(user_id,xp) VALUES('synthetic-overwrite',${stale+7}) ON CONFLICT(user_id) DO UPDATE SET xp=EXCLUDED.xp;`,"service_role");
  assert.equal(await xp("synthetic-overwrite"),"7");
  assert.equal(await sql("SELECT sum(xp) FROM prepzii_rewards.receipts WHERE user_id='synthetic-overwrite';"),"20");
 });
 await snapshot(`extended-run${run}-final`);
});
