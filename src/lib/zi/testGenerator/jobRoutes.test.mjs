import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
const root = fileURLToPath(new URL("../../../", import.meta.url));
globalThis.__jobRoute = { userId: "synthetic-route", calls: [] };
const code = (text) => ({ url: `data:text/javascript,${encodeURIComponent(text)}`, shortCircuit: true });
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === "@clerk/nextjs/server") return code('export const auth=async()=>({userId:globalThis.__jobRoute.userId});');
  if (specifier === "@/lib/accessControl") return code('export const getUserAccessContext=async({userId})=>({userId,examTrack:"JEE"});');
  if (specifier === "@/lib/supabaseAdmin") return code('export const supabaseAdmin={rpc:async(name,args)=>{globalThis.__jobRoute.calls.push(args);return {error:{code:"P0002"}}}};');
  if (specifier.startsWith("@/")) {
    const filename = path.join(root, specifier.slice(2));
    if (existsSync(`${filename}.js`)) return next(pathToFileURL(`${filename}.js`).href, context);
  }
  return next(specifier, context);
} });
const { POST, GET } = await import("../../../app/api/zi/generation-jobs/route.js");
const { GET: read } = await import("../../../app/api/zi/generation-jobs/[id]/route.js");
const { POST: execute, maxDuration } = await import("../../../app/api/zi/generation-jobs/[id]/execute/route.js");
const { hasSameRequestOrigin } = await import("./jobHttp.server.js");
const req = (body, origin) => new Request("https://prepzii.invalid/api/zi/generation-jobs", body === undefined ? {} : {
  method: "POST", headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body),
});
const params = { params: Promise.resolve({ id: "12345678-1234-4234-8234-123456789012" }) };
const keys = ["ZI_GENERATION_PILOT_ENABLED", "ZI_GENERATION_PILOT_USERS", "ZI_GENERATED_TEST_ENGINE_ENABLED", "ZI_GENERATION_PROVIDER_APPROVED"];
const previous = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
function enable() { process.env.ZI_GENERATION_PILOT_ENABLED = "true"; process.env.ZI_GENERATION_PILOT_USERS = "synthetic-route"; process.env.ZI_GENERATED_TEST_ENGINE_ENABLED = "true"; delete process.env.ZI_GENERATION_PROVIDER_APPROVED; }
test("all actual job handlers require Clerk identity", async () => {
  enable(); globalThis.__jobRoute.userId = null;
  try {
    for (const action of [() => POST(req({ token: "x" })), () => GET(req()), () => read(req(), params), () => execute(req({}), params)]) assert.equal((await action()).status, 401);
    assert.equal(globalThis.__jobRoute.calls.length, 0);
  } finally { globalThis.__jobRoute.userId = "synthetic-route"; }
});
test("public access stays disabled even with older generation flag enabled", async () => {
  enable(); delete process.env.ZI_GENERATION_PILOT_ENABLED;
  assert.equal((await POST(req({ token: "x" }))).status, 403);
  assert.equal(globalThis.__jobRoute.calls.length, 0);
});
test("unknown job is private 404; no raw database fields returned", async () => {
  enable(); const response = await read(req(), params);
  assert.equal(response.status, 404); assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(globalThis.__jobRoute.calls.at(-1).p_owner, "synthetic-route");
  assert.doesNotMatch(await response.text(), /configuration|execution_token/);
});
test("reserve rejects forged fields and cross-origin mutations before SQL", async () => {
  enable(); const before = globalThis.__jobRoute.calls.length;
  assert.equal((await POST(req({ token: "x", questions: [] }))).status, 400);
  assert.equal((await POST(req({ token: "x" }, "https://attacker.invalid"))).status, 403);
  assert.equal((await POST(req({ token: "x".repeat(6000) }))).status, 400);
  assert.equal(globalThis.__jobRoute.calls.length, before);
});
test("execute needs separate provider approval and uses separate 300-second handler", async () => {
  enable(); const before = globalThis.__jobRoute.calls.length;
  assert.equal((await execute(req({}), params)).status, 403);
  assert.equal(globalThis.__jobRoute.calls.length, before);
  assert.equal(maxDuration, 300);
});
test("same-origin check supports Next's local adapter without accepting a foreign or forwarded origin", () => {
  const request = (origin, host = "127.0.0.1:3462") => new Request("http://localhost:3462/api/zi/generation-jobs", {
    method: "POST", headers: { host, origin, "x-forwarded-host": "attacker.invalid" },
  });
  assert.equal(hasSameRequestOrigin(request("http://127.0.0.1:3462")), true);
  assert.equal(hasSameRequestOrigin(request("http://attacker.invalid")), false);
  assert.equal(hasSameRequestOrigin(request("https://127.0.0.1:3462")), false);
  assert.equal(hasSameRequestOrigin(request("null")), false);
});
test.after(() => {
  hooks.deregister(); delete globalThis.__jobRoute;
  for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
});
