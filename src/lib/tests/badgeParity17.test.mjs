import test from 'node:test';
import assert from 'node:assert/strict';
import {sql} from './pg176ReleaseLab.mjs';
const enabled=process.env.ZI_PHASE5_RELEASE_CONTRACT_LOCAL==='1';
const q='66666666-6666-4666-8666-000000000003';
const basis=async user=>JSON.parse(await sql(`SELECT prepzii_integrity.badge_stats('${user}');`));
const qualifies=(type,value,s)=>type==='speed_solver'?Boolean(s[type])&&s[type]<=value:['leaderboard_rank'].includes(type)?s[type]!==null&&s[type]<=value:s[type]>=value;
test('all badge eligibility rules preserve historical basis and verified new activity',{skip:!enabled},async t=>{
 await t.test('all nine historical metrics match original JEE aggregation including duplicates, falsy fallback, rounding and ties',async()=>{
  const s=await basis('synthetic-release-history');
  assert.deepEqual(s,{tests_completed:2,pyq_completed:2,total_questions:6,total_xp:900,streak:3,accuracy:50,leaderboard_rank:2,mock_tests:85,speed_solver:10});
  const original=JSON.parse(await sql("SELECT prepzii_integrity.legacy_badge_basis('synthetic-release-history');"));
  for(const key of Object.keys(s))assert.equal(s[key],original[key],key);
 });
 await t.test('historical unclaimed eligibility is held without badges or retroactive XP; earned markers remain',async()=>{
  const result=JSON.parse(await sql("SELECT prepzii_claim_badge('synthetic-release-history','66666666-6666-4666-8666-000000000021');",'service_role'));
  assert.equal(result.historicalEligibilityHeld,true);assert.equal(result.created,false);
  assert.equal(await sql("SELECT xp FROM user_xp WHERE user_id='synthetic-release-history';"),'900');
  assert.equal(await sql("SELECT count(*) FROM user_badges WHERE user_id='synthetic-release-history';"),'1');
 });
 await t.test('fresh-key PYQ replay cannot inflate badge eligibility or stats',async()=>{
  const answers=JSON.stringify([{question_id:q,selected_option:'A'}]);
  for(const key of ['synthetic-release-parity-one','synthetic-release-parity-two'])await sql(`SELECT prepzii_commit_pyq('synthetic-release-parity','${key}','${answers}');`,'service_role');
  const s=await basis('synthetic-release-parity');assert.equal(s.pyq_completed,1);assert.equal(s.total_questions,1);assert.equal(s.accuracy,100);
  assert.deepEqual(JSON.parse(await sql("SELECT prepzii_badge_stats('synthetic-release-parity');",'service_role')),s);
  await assert.rejects(sql("SELECT prepzii_badge_stats('synthetic-release-parity');",'authenticated'),/permission denied/);
 });
 await t.test('all nine threshold comparisons and opposite boundaries use the original comparator direction',async()=>{
  const u='synthetic-release-rules';
  await sql(`INSERT INTO test_sessions(id,user_id,exam,total_questions,duration_minutes,started_at) VALUES('66666666-6666-4666-8666-000000000030','${u}','JEE Main',1,5,now()-interval '21 seconds');
   INSERT INTO test_questions(session_id,question_id) VALUES('66666666-6666-4666-8666-000000000030','66666666-6666-4666-8666-000000000001');`,'service_role');
  await sql(`SELECT prepzii_commit_test('${u}','66666666-6666-4666-8666-000000000030','[{"question_id":"66666666-6666-4666-8666-000000000001","selected_option":"A"}]');`,'service_role');
  await sql(`SELECT prepzii_commit_pyq('${u}','synthetic-release-all-rules','${JSON.stringify([{question_id:q,selected_option:'A'}])}');`,'service_role');
  const s=await basis(u);let n=100;
  for(const type of Object.keys(s)){
   assert.ok(s[type]>0,type);const smallBetter=['leaderboard_rank','speed_solver'].includes(type);
   for(const [target,expected] of [[s[type],true],[s[type]+(smallBetter?-1:1),false]]){
    const id=`66666666-6666-4666-8666-${String(n++).padStart(12,'0')}`;
    await sql(`INSERT INTO badges(id,name,xp_reward,enabled,requirement_type,requirement_value) VALUES('${id}','SYNTHETIC RULE',0,true,'${type}',${target});`);
    const result=JSON.parse(await sql(`SELECT prepzii_claim_badge('${u}','${id}');`,'service_role'));
    assert.equal(qualifies(type,target,s),expected,type);assert.equal(result.earned,expected,type);
   }
  }
 });
 await t.test('no-data speed and missing rank cannot satisfy inverted requirements',async()=>{
  const s=await basis('synthetic-release-no-data');assert.equal(s.speed_solver,null);assert.equal(s.leaderboard_rank,null);
 });
});
