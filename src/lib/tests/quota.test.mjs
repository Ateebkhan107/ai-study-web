import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

let generatedReads = 0;
const data = (code) => `data:text/javascript,${encodeURIComponent(code)}`;
globalThis.__phase5QuotaClient = { from(table) {
  const q = { select() { return q; }, eq() { return q; }, gte() { return q; }, lt() { return q; },
    then(resolve, reject) {
      if (table === "zi_generated_sessions") generatedReads++;
      const rows = table === "test_sessions" ? ["normal", "institute", "generated"].map((id) => ({ id, chapters: ["Rotational Motion"] }))
        : [{ session_id: table === "institute_test_attempts" ? "institute" : "generated" }];
      return Promise.resolve({ data: rows }).then(resolve, reject);
    } };
  return q;
} };
const hooks = registerHooks({ resolve(specifier, context, next) {
  const mocks = { "@/lib/supabaseAdmin": "export const supabaseAdmin=globalThis.__phase5QuotaClient;",
    "@clerk/nextjs/server": "export const clerkClient=()=>{};", "@/lib/auth": 'export const ACCOUNT_TYPES={STUDENT:"STUDENT",INSTITUTE_ADMIN:"INSTITUTE_ADMIN"};' };
  if (mocks[specifier]) return { url: data(mocks[specifier]), shortCircuit: true };
  return next(specifier, context);
} });
const { getPersonalCustomTestUsage, canUseFeature, FEATURES, getZiFreePromptsUsage } = await import("../accessControl.js");
test("Zi accounting failure cannot grant trial access or affect premium entitlement", async () => {
  const usage = await getZiFreePromptsUsage("owner");
  assert.equal(usage.available, false);
  assert.equal(usage.remaining, 0);
  assert.equal(canUseFeature({ ziFreeUsage: usage }, FEATURES.ZI_ACCESS).allowed, false);
  assert.equal(canUseFeature({}, FEATURES.ZI_ACCESS).allowed, false);
  assert.equal(canUseFeature({ isAiMode: true, ziFreeUsage: usage }, FEATURES.ZI_ACCESS).allowed, true);
});
test("generated sessions do not consume the normal custom-test quota", async () => {
  process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true";
  try { assert.equal((await getPersonalCustomTestUsage("owner")).used, 1); assert.equal(generatedReads, 1); }
  finally { delete process.env.ZI_GENERATED_TEST_ENGINE_ENABLED; }
});
test("unmigrated deployments never query new tables", async () => {
  const before = generatedReads; await getPersonalCustomTestUsage("owner"); assert.equal(generatedReads, before);
});
test.after(() => { hooks.deregister(); delete globalThis.__phase5QuotaClient; });
