import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
let failure=false;
const stats={tests_completed:0,pyq_completed:1,total_questions:1,total_xp:10,streak:1,accuracy:100,leaderboard_rank:1,mock_tests:0,speed_solver:null};
globalThis.__badgeParity={from(table){const result=()=>({data:table==='badges'?[{id:'synthetic-badge',requirement_type:'pyq_completed',requirement_value:2,xp_reward:5}]:table==='user_xp'?{xp:10,name:'Synthetic'}:table==='pyq_attempts'?Array.from({length:3},()=>({is_correct:true,pyq_questions:{exam:'JEE Main'}})):[],count:0,error:null});
 return {select(){return this;},eq(){return this;},order(){return this;},or(){return this;},single:async()=>result(),then(resolve,reject){return Promise.resolve(result()).then(resolve,reject);}};},
 rpc:async(name)=>{if(failure)return {error:{code:'XX000'}};if(name==='prepzii_badge_stats')return {data:stats};if(name==='prepzii_claim_badge')return {data:{earned:false,created:false}};throw Error('Unexpected RPC');}};
const hooks=registerHooks({resolve(specifier,context,next){if(specifier==='@/lib/supabaseAdmin')return {url:'data:text/javascript,export const supabaseAdmin=globalThis.__badgeParity;',shortCircuit:true};if(specifier==='@/lib/integrity.server.mjs')return next(new URL('../integrity.server.mjs',import.meta.url).href,context);return next(specifier,context);}});
const {getUserBadgeProgress}=await import('../../utils/badgeEngine.js');
test.beforeEach(()=>{failure=false;process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED='true';});
test('badge display uses the same verified distinct counts as the database claim',async()=>{
 const result=await getUserBadgeProgress('synthetic-user');assert.equal(result[0].detail,'1/2 PYQs');assert.equal(result[0].earned,false);
});
test('badge stats RPC failure does not fall back to inflated legacy display counts',async()=>{
 failure=true;await assert.rejects(getUserBadgeProgress('synthetic-user'),/Activity persistence unavailable/);
});
test.after(()=>{hooks.deregister();delete globalThis.__badgeParity;delete process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED;});
