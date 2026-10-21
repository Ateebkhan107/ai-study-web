import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

let userId = "owner", reads = 0, awards = [];
globalThis.__phase52Rewards = {
  auth: () => ({ userId, sessionClaims: {} }),
  client: { from() { reads++; return { select() { return this; }, eq() { return this; }, single: async () => ({ data: { pyq_solved: 0, correct_answers: 0 } }) }; } },
  addXP: (...args) => awards.push(args),
};
const data = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
const hooks = registerHooks({ resolve(specifier, context, next) {
  const mocks = {
    "next/server": "export const NextResponse=Response;",
    "@clerk/nextjs/server": "export const auth=async()=>globalThis.__phase52Rewards.auth();",
    "@/lib/supabaseAdmin": "export const supabaseAdmin=globalThis.__phase52Rewards.client;",
    "@/utils/xp": "export const addXP=async(...args)=>globalThis.__phase52Rewards.addXP(...args);",
    "@/lib/auth": "export const getFirstNameFromClaims=()=>\"Fixture\";",
  };
  return mocks[specifier] ? { url: data(mocks[specifier]), shortCircuit: true } : next(specifier, context);
} });
const { POST } = await import("../../app/api/update/route.js");
const request = (source) => new Request("https://prepzii.invalid/api/update", { method: "POST", body: JSON.stringify({ source, correctAnswers: 2, totalQuestions: 5 }), headers: { "Content-Type": "application/json" } });
test.beforeEach(() => { userId = "owner"; reads = 0; awards = []; });
test("legacy reward endpoint rejects repeated client-supplied test rewards before any writes", async () => {
  for (let i = 0; i < 2; i++) assert.equal((await POST(request("test"))).status, 409);
  assert.equal(reads, 0); assert.equal(awards.length, 0);
});
test("legacy reward endpoint retains existing non-test behavior", async () => {
  assert.equal((await POST(request("pyq"))).status, 200);
  assert.equal(awards.length, 1); assert.equal(awards[0][1], 20);
});
test("unauthenticated legacy reward requests are denied", async () => {
  userId = null; assert.equal((await POST(request("test"))).status, 401);
  assert.equal(reads, 0); assert.equal(awards.length, 0);
});
test.after(() => { hooks.deregister(); delete globalThis.__phase52Rewards; });
