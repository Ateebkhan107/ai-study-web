import test from "node:test";
import assert from "node:assert/strict";
import { sql as labSql, read, foundationOnce, snapshot } from "./pg176Lab.mjs";
const prefix=process.env.ZI_GOAL_REWARDS17_CASE_PREFIX || "";
if(!/^[a-z0-9-]{0,24}$/.test(prefix)) throw Error("Unsafe synthetic case prefix");
const sql=(statement,...args)=>labSql(statement.replaceAll("synthetic-",`${prefix}synthetic-`),...args);
const enabled=process.env.ZI_GOAL_REWARDS17_LOCAL==="1";
const q1="11111111-1111-4111-8111-111111111111",q2="22222222-2222-4222-8222-222222222222";
const activity=(user,q=q1)=>`INSERT INTO public.pyq_attempts(user_id,question_id,selected_option,is_correct) VALUES('${user}','${q}','A',true);`;
const deliver=user=>sql(`SELECT public.prepzii_deliver_goal_rewards('${user}');`,"service_role");
const xp=user=>sql(`SELECT COALESCE((SELECT xp FROM public.user_xp WHERE user_id='${user}'),0);`);

test("PostgreSQL 17.6 transactional goal acceptance",{skip:!enabled},async t=>{
 await foundationOnce(process.env.ZI_PHASE5_REUSE_FOUNDATION === "1");
 if(process.env.ZI_GOAL_REWARDS17_REUSE_SETUP === "1") {
  assert.equal(await sql("SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_goals' AND column_name='target';"),"1");
  assert.equal(await sql("SELECT count(*) FROM public.daily_goals WHERE (goal_type='PYQ' AND target_value=2 AND xp=20) OR (goal_type='FORMULA' AND target_value=1 AND xp=5);"),"2");
 } else {
 await sql(`ALTER TABLE public.daily_goals ADD COLUMN target text DEFAULT 'ALL';
 CREATE TABLE public.formula_books(id uuid PRIMARY KEY);
 INSERT INTO public.pyq_questions(id) VALUES('${q1}'),('${q2}');
 INSERT INTO public.daily_goals(goal_type,target_value,xp,is_active) VALUES('PYQ',2,20,true),('FORMULA',1,5,true);`,"postgres");
 }
 await sql(read("../../../db/proposals/20261022_goal_reward_staging.sql"),"zi_phase5_lab_admin");
 await t.test("fabricated progress and browser RPC/direct-table access are denied",async()=>{
  for(const role of ["anon","authenticated"]) {
   await assert.rejects(sql("SELECT public.prepzii_deliver_goal_rewards('synthetic-fabricated');",role),/permission denied/);
   await assert.rejects(sql("INSERT INTO prepzii_rewards.events(user_id,kind,source_key,activity_date) VALUES('synthetic-fabricated','PYQ','fake',CURRENT_DATE);",role),/permission denied/);
  }
  await deliver("synthetic-fabricated");assert.equal(await xp("synthetic-fabricated"),"0");
 });
 await t.test("recreated source IDs cannot replay the same question today",async()=>{
  await sql(activity("synthetic-replay")+activity("synthetic-replay"));await deliver("synthetic-replay");
  assert.equal(await xp("synthetic-replay"),"0");
  assert.equal(await sql("SELECT count(*) FROM prepzii_rewards.events WHERE user_id='synthetic-replay';"),"1");
  await sql(activity("synthetic-replay",q2));await deliver("synthetic-replay");await deliver("synthetic-replay");
  assert.equal(await xp("synthetic-replay"),"20");
 });
 await t.test("source persistence rollback cannot create progress or XP",async()=>{
  await sql(`BEGIN;${activity("synthetic-rollback")}${activity("synthetic-rollback",q2)}ROLLBACK;`);
  await deliver("synthetic-rollback");assert.equal(await xp("synthetic-rollback"),"0");
  assert.equal(await sql("SELECT count(*) FROM prepzii_rewards.events WHERE user_id='synthetic-rollback';"),"0");
 });
 await t.test("XP persistence failure rolls back receipt, applied marker and public progress",async()=>{
  await sql(`CREATE FUNCTION public.synthetic_xp_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
   IF NEW.user_id='synthetic-fail' THEN RAISE EXCEPTION 'synthetic XP persistence failure'; END IF; RETURN NEW; END $$;
   CREATE TRIGGER synthetic_xp_failure BEFORE INSERT OR UPDATE ON public.user_xp FOR EACH ROW EXECUTE FUNCTION public.synthetic_xp_failure();
   ${activity("synthetic-fail")}${activity("synthetic-fail",q2)}`);
  await assert.rejects(deliver("synthetic-fail"),/synthetic XP persistence failure/);
  assert.equal(await sql("SELECT count(*) FROM prepzii_rewards.receipts WHERE user_id='synthetic-fail';"),"0");
  assert.equal(await sql("SELECT count(*) FROM public.user_daily_goals WHERE user_id='synthetic-fail';"),"0");
  await sql("DROP TRIGGER synthetic_xp_failure ON public.user_xp; DROP FUNCTION public.synthetic_xp_failure();");
  await deliver("synthetic-fail");assert.equal(await xp("synthetic-fail"),"20");
 });
 await t.test("failed public progress persistence cannot award XP",async()=>{
  await sql(`CREATE FUNCTION public.synthetic_progress_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
   IF NEW.user_id='synthetic-progress-fail' THEN RAISE EXCEPTION 'synthetic progress persistence failure'; END IF; RETURN NEW; END $$;
   CREATE TRIGGER synthetic_progress_failure BEFORE INSERT OR UPDATE ON public.user_daily_goals FOR EACH ROW EXECUTE FUNCTION public.synthetic_progress_failure();
   ${activity("synthetic-progress-fail")}${activity("synthetic-progress-fail",q2)}`);
  await assert.rejects(deliver("synthetic-progress-fail"),/synthetic progress persistence failure/);
  assert.equal(await xp("synthetic-progress-fail"),"0");
  assert.equal(await sql("SELECT count(*) FROM prepzii_rewards.receipts WHERE user_id='synthetic-progress-fail';"),"0");
  await sql("DROP TRIGGER synthetic_progress_failure ON public.user_daily_goals; DROP FUNCTION public.synthetic_progress_failure();");
  await deliver("synthetic-progress-fail");assert.equal(await xp("synthetic-progress-fail"),"20");
 });
 await t.test("lost HTTP callback and rolled-back worker recover from durable credits",async()=>{
  await sql(activity("synthetic-interrupted")+activity("synthetic-interrupted",q2));
  await sql("BEGIN;SELECT public.prepzii_deliver_goal_rewards('synthetic-interrupted');ROLLBACK;","service_role");
  assert.equal(await xp("synthetic-interrupted"),"0");
  await deliver("synthetic-interrupted");await deliver("synthetic-interrupted");assert.equal(await xp("synthetic-interrupted"),"20");
 });
 await t.test("eight independent connections deliver one receipt and one XP delta",async()=>{
  await sql(activity("synthetic-concurrent")+activity("synthetic-concurrent",q2));
  await Promise.all(Array.from({length:8},()=>deliver("synthetic-concurrent")));
  assert.equal(await xp("synthetic-concurrent"),"20");
  assert.equal(await sql("SELECT count(*) FROM prepzii_rewards.receipts WHERE user_id='synthetic-concurrent';"),"1");
 });
 await t.test("service caller is trusted for identities; no browser owner escalation",async()=>{
  assert.equal(await sql("SELECT has_function_privilege('service_role','public.prepzii_deliver_goal_rewards(text)','EXECUTE');"),"t");
  assert.equal(await sql("SELECT has_schema_privilege('service_role','prepzii_rewards','USAGE');"),"f");
 });
 await snapshot(`goal-acceptance-${prefix || "initial"}final`);
});
