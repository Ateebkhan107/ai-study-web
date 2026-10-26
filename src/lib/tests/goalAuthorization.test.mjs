import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
let actor, calls;
globalThis.__goalAuthorizationFixture = {
 auth: async () => { if (actor instanceof Error) throw actor; return { userId: actor }; },
 client: { rpc: async (...args) => { calls.push(args); return { data: { xpAwarded: 0 }, error: null }; },
 from() { throw new Error("Unexpected direct write"); } },
};
const data = source => `data:text/javascript,${encodeURIComponent(source)}`;
const rewardsUrl = new URL("../goalRewards.mjs", import.meta.url).href;
const hooks = registerHooks({ resolve(specifier, context, next) {
 const mocks = {
  "@clerk/nextjs/server": "export const auth=()=>globalThis.__goalAuthorizationFixture.auth();",
  "@/lib/supabaseAdmin": "export const supabaseAdmin=globalThis.__goalAuthorizationFixture.client;",
 };
 if (specifier === "@/lib/goalRewards.mjs") return next(rewardsUrl, context);
 return mocks[specifier] ? { url: data(mocks[specifier]), shortCircuit: true } : next(specifier, context);
} });
const { updateGoalProgress } = await import("../../utils/updateGoalProgress.js");
const previousFlag = process.env.GOAL_REWARDS_TRANSACTIONAL;
test.beforeEach(() => { actor="fixture-owner"; calls=[]; process.env.GOAL_REWARDS_TRANSACTIONAL="true"; });
test("signed-out goal action cannot perform privileged reads or rewards", async () => {
 actor=null; await assert.rejects(updateGoalProgress("fixture-owner","PYQ",999), /Unauthorized/); assert.equal(calls.length,0);
});
test("caller cannot deliver another user's rewards", async () => {
 await assert.rejects(updateGoalProgress("fixture-other","PYQ",1), /Forbidden/); assert.equal(calls.length,0);
});
test("Clerk failure cannot fall back to supplied identity", async () => {
 actor=new Error("identity verification failure"); await assert.rejects(updateGoalProgress("fixture-owner"), /identity verification failure/); assert.equal(calls.length,0);
});
test("missing target identity is rejected", async () => {
 await assert.rejects(updateGoalProgress(undefined), /Forbidden/); assert.equal(calls.length,0);
});
for (const type of ["PYQ","FORMULA"]) test(`owned ${type} request delivers only existing credits`, async () => {
 await updateGoalProgress("fixture-owner",type,1000000);
 assert.deepEqual(calls,[["prepzii_deliver_goal_rewards",{p_user:"fixture-owner"}]]);
});
test.after(() => { hooks.deregister(); delete globalThis.__goalAuthorizationFixture;
 if(previousFlag===undefined) delete process.env.GOAL_REWARDS_TRANSACTIONAL; else process.env.GOAL_REWARDS_TRANSACTIONAL=previousFlag;
});
