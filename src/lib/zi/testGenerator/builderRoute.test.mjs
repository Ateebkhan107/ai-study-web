import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));
globalThis.__builderRouteTest = { userId: "route-student", allowed: true, charged: 0, providerCalls: 0 };
process.env.ZI_TEST_BUILDER_SECRET = "route-test-secret-only";
const data = (code) => `data:text/javascript,${encodeURIComponent(code)}`;
const unused = (names) => names.map((name) => `export const ${name}=()=>{throw new Error("Unexpected unrelated service call")};`).join("\n");
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === "next/server") return next("next/server.js", context);
  const mocks = {
    "@clerk/nextjs/server": 'export const auth=async()=>({userId:globalThis.__builderRouteTest.userId});',
    "@/lib/accessControl": 'export const getUserAccessContext=async({userId})=>({userId,examTrack:"JEE",proTracks:[],plan:"FREE",isAiMode:false,ziFreeUsage:{remaining:0}}); export const canUseFeature=()=>false; export const incrementZiFreePromptsUsage=async()=>{globalThis.__builderRouteTest.charged++};',
    "@/lib/zi/rateLimit": 'export const checkZiRateLimit=()=>({allowed:globalThis.__builderRouteTest.allowed,remaining:0,resetMs:2000});',
    "@/lib/zi/provider": 'export const streamZiResponse=()=>{globalThis.__builderRouteTest.providerCalls++;throw new Error("Provider must not run")};',
    "@/lib/zi/actionResolver.server": unused(["attachStudyPlanStepActions"]),
    "@/lib/zi/entityContext.server": unused(["buildZiEntityContext"]),
    "@/lib/zi/memories.server": unused(["getZiLearningMemories", "validateZiLearningMemoryAction"]),
    "@/lib/zi/studentContext.server": unused(["getZiStudentContext"]),
    "@/lib/zi/prompt": unused(["buildZiSystemPrompt"]),
    "@/lib/zi/studyPlan.server": unused(["inferRequestedPlanDuration", "validateZiStudyPlanAction"]),
    "@/lib/zi/visuals.server": unused(["validateZiVisualAction"]),
    "@/lib/formulaCards": unused(["getFormulaSubjectsForExam", "getFormulaChaptersForSubject"]),
    "@/lib/questions": unused(["getQuestions"]),
    "@/lib/supabaseAdmin": 'export const supabaseAdmin = new Proxy({}, {get(){throw new Error("No database writes or reads expected")}});',
  };
  if (mocks[specifier]) return { url: data(mocks[specifier]), shortCircuit: true };
  if (specifier.startsWith("@/")) {
    const filename = path.join(root, specifier.slice(2));
    if (existsSync(`${filename}.js`)) return next(pathToFileURL(`${filename}.js`).href, context);
  }
  return next(specifier, context);
} });
const { POST: configure } = await import("../../../app/api/zi/test-builder/route.js");
const { POST: chat } = await import("../../../app/api/zi/chat/route.js");
const req = (body) => new Request("https://prepzii.invalid/api/zi/test-builder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const config = { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", topic: "Rotational Motion", difficulty: "Medium", questionCount: 5, mode: "practice" };
test("both actual route handlers require Clerk authentication", async () => {
  globalThis.__builderRouteTest.userId = null;
  try {
    assert.equal((await configure(req({ operation: "reset" }))).status, 401);
    assert.equal((await chat(req({ messages: [{ role: "user", content: "Create a test" }] }))).status, 401);
  } finally { globalThis.__builderRouteTest.userId = "route-student"; }
});
test("chat configures without Gemini or trial deduction, even with no free AI prompts", async () => {
  const response = await chat(req({ messages: [{ role: "user", content: "Create a test on Rotational Motion" }] }));
  assert.equal(response.status, 200); assert.equal(response.headers.get("X-Zi-Prompt-Charged"), "0");
  const action = JSON.parse((await response.text()).split("__ZI_VALIDATED_ACTION__=")[1]);
  assert.equal(action.type, "ai_test_builder"); assert.equal(action.config.subject, "Physics");
  const followup = await chat(req({ messages: [{ role: "user", content: "15 medium questions" }], testBuilderToken: action.token }));
  const updated = JSON.parse((await followup.text()).split("__ZI_VALIDATED_ACTION__=")[1]);
  assert.equal(updated.config.questionCount, 15); assert.deepEqual(updated.missing, ["mode"]);
  assert.equal(globalThis.__builderRouteTest.providerCalls, 0); assert.equal(globalThis.__builderRouteTest.charged, 0);
});
test("ordinary tutor access remains blocked when AI trial is exhausted", async () => {
  const response = await chat(req({ messages: [{ role: "user", content: "Explain angular momentum" }] }));
  assert.equal(response.status, 403); assert.equal((await response.json()).error, "AI_MODE_REQUIRED");
});
test("real configuration endpoint saves reviewed values and confirms without generation", async () => {
  const saved = await configure(req({ operation: "update", patch: config }));
  assert.equal(saved.status, 200); assert.equal(saved.headers.get("Cache-Control"), "no-store");
  const { action } = await saved.json();
  const response = await configure(req({ operation: "confirm", token: action.token }));
  const confirmed = (await response.json()).action;
  assert.equal(confirmed.confirmed, true); assert.equal(confirmed.availability.generationEnabled, false);
  assert.equal(confirmed.testId, undefined); assert.equal(confirmed.questions, undefined);
});
test("route refuses another student's configuration token", async () => {
  const { action } = await (await configure(req({ operation: "update", patch: config }))).json();
  globalThis.__builderRouteTest.userId = "other-student";
  try { assert.equal((await configure(req({ operation: "confirm", token: action.token }))).status, 403); }
  finally { globalThis.__builderRouteTest.userId = "route-student"; }
});
test("route rejects forged config fields, invalid counts, and generation commands", async () => {
  for (const body of [{ operation: "update", patch: { ...config, correctAnswer: "A" } }, { operation: "update", patch: { questionCount: 100 } }, { operation: "generate", patch: config }]) {
    assert.equal((await configure(req(body))).status, 400);
  }
});
test("route returns a bounded retry hint on update rate limiting", async () => {
  globalThis.__builderRouteTest.allowed = false;
  try {
    const response = await configure(req({ operation: "reset" }));
    assert.equal(response.status, 429); assert.equal(response.headers.get("Retry-After"), "2");
  } finally { globalThis.__builderRouteTest.allowed = true; }
});
test("quota-unavailable configuration never calls Gemini even with enabled future flag", async () => {
  process.env.ZI_AI_TEST_GENERATION_ENABLED = "true";
  process.env.ZI_AI_TEST_PROVIDER_STATUS = "quota_blocked";
  try {
    const { action } = await (await configure(req({ operation: "update", patch: config }))).json();
    const { action: confirmed } = await (await configure(req({ operation: "confirm", token: action.token }))).json();
    assert.equal(confirmed.availability.state, "quota_blocked"); assert.equal(confirmed.availability.generationEnabled, false);
    assert.equal(globalThis.__builderRouteTest.providerCalls, 0); assert.equal(globalThis.__builderRouteTest.charged, 0);
  } finally { delete process.env.ZI_AI_TEST_GENERATION_ENABLED; delete process.env.ZI_AI_TEST_PROVIDER_STATUS; }
});
test.after(() => { hooks.deregister(); delete process.env.ZI_TEST_BUILDER_SECRET; delete globalThis.__builderRouteTest; });
