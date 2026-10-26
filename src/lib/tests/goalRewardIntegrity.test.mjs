import test from "node:test";
import assert from "node:assert/strict";
import { reconcileGoalRewards, recordFormulaAccess } from "../goalRewards.mjs";
const saved = process.env.GOAL_REWARDS_TRANSACTIONAL;
test.beforeEach(() => { process.env.GOAL_REWARDS_TRANSACTIONAL="true"; });
test.after(() => { if(saved===undefined) delete process.env.GOAL_REWARDS_TRANSACTIONAL; else process.env.GOAL_REWARDS_TRANSACTIONAL=saved; });
// These are application-boundary tests. Transactionality/replay/concurrency are
// tested against real SQL in goalRewards17.test.mjs, not an in-memory DB model.
test("delivery API cannot transmit fabricated progress or reward amount", async () => {
 const calls=[]; const db={ rpc:async (...args)=>{calls.push(args); return {data:{xpAwarded:0}};} };
 await reconcileGoalRewards(db,"synthetic-A",{amount:999999,goalType:"PYQ",source:"fabricated"});
 assert.deepEqual(calls,[["prepzii_deliver_goal_rewards",{p_user:"synthetic-A"}]]);
});
test("persistence failure is propagated without a separate XP write", async () => {
 let calls=0; const db={rpc:async()=>{calls++;return {error:{message:"synthetic failure"}};},from(){assert.fail("direct XP fallback");}};
 await assert.rejects(reconcileGoalRewards(db,"synthetic-A"),/pending/); assert.equal(calls,1);
});
test("lost response can be retried with the same database delivery identity", async () => {
 const calls=[]; const db={rpc:async (...args)=>{calls.push(args);if(calls.length===1)throw Error("lost response");return {data:{xpAwarded:0}};}};
 await assert.rejects(reconcileGoalRewards(db,"synthetic-A"),/lost response/);
 await reconcileGoalRewards(db,"synthetic-A"); assert.deepEqual(calls[0],calls[1]);
});
test("parallel requests delegate to durable database arbitration, not process locks", async () => {
 const calls=[]; const db={rpc:async (...args)=>{calls.push(args);return {data:{xpAwarded:0}};}};
 await Promise.all(Array.from({length:8},()=>reconcileGoalRewards(db,"synthetic-A")));
 assert.equal(calls.length,8); assert.ok(calls.every(c=>c[0]==="prepzii_deliver_goal_rewards" && c[1].p_user==="synthetic-A"));
});
test("missing database migration fails closed; flag defaults off", async () => {
 delete process.env.GOAL_REWARDS_TRANSACTIONAL;
 assert.deepEqual(await reconcileGoalRewards({rpc(){assert.fail("disabled RPC");}},"synthetic-A"),{status:"pending_migration"});
 process.env.GOAL_REWARDS_TRANSACTIONAL="true";
 await assert.rejects(reconcileGoalRewards({rpc:async()=>({error:{code:"PGRST202"}})},"synthetic-A"),/pending/);
});
test("formula source accepts a resource identity, never client progress", async () => {
 const calls=[]; await recordFormulaAccess({rpc:async(...a)=>{calls.push(a);return {data:{recorded:true}};}},"synthetic-A","book-1");
 assert.deepEqual(calls,[["prepzii_record_formula_access",{p_user:"synthetic-A",p_book:"book-1"}]]);
});
test("missing verified owner/resource is rejected before an RPC", async()=>{
 const db={rpc(){assert.fail("invalid call");}};
 await assert.rejects(reconcileGoalRewards(db,null),/identity/);
 await assert.rejects(recordFormulaAccess(db,"synthetic-A",null),/resource/);
});
