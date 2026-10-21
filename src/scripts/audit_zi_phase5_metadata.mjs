// Read-only production evidence. GET only; no SQL execution or row payloads saved.
import { writeFile } from "node:fs/promises";
const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase metadata credentials are not configured.");
async function get(path, extra = {}) {
  const response = await fetch(`${base}/rest/v1/${path}`, { method: "GET", signal: AbortSignal.timeout(20000),
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...extra } });
  return { response, body: await response.json().catch(() => null) };
}
const { response, body: schema } = await get("", { Accept: "application/openapi+json" });
if (!response.ok) throw new Error(`Metadata unavailable: HTTP ${response.status}`);
const tables = ["test_sessions", "test_questions", "test_attempts", "user_answers", "questions", "pyq_questions", "institute_test_attempts", "zi_generated_tests", "zi_generated_questions", "zi_generated_sessions"];
const [catalog, attempts, practice, completed] = await Promise.all([
  get("pg_constraint?select=oid&limit=0", { "Accept-Profile": "pg_catalog" }),
  get("test_attempts?select=session_id&session_id=not.is.null&order=id&limit=1000", { Prefer: "count=exact" }),
  get("test_sessions?select=id&duration_minutes=eq.0&limit=1", { Prefer: "count=exact" }),
  get("test_sessions?select=id&status=eq.completed&limit=1", { Prefer: "count=exact" }),
]);
function count(result) {
  const value = result.response.headers.get("content-range")?.split("/")[1];
  return value && value !== "*" && Number.isFinite(Number(value)) ? Number(value) : null;
}
const groups = new Map();
if (attempts.response.ok && Array.isArray(attempts.body)) for (const row of attempts.body) groups.set(row.session_id, (groups.get(row.session_id) || 0) + 1);
const duplicates = [...groups.values()].filter((n) => n > 1);
const sampled = attempts.response.ok && Array.isArray(attempts.body) ? attempts.body.length : 0;
const total = count(attempts);
const evidence = {
  inspectedAt: new Date().toISOString(), access: "PostgREST GET only; no admin SQL connection available",
  tableDefinitions: Object.fromEntries(tables.map((table) => [table, schema.definitions?.[table] || null])),
  advertisedRPCPaths: Object.keys(schema.paths || {}).filter((path) => path.startsWith("/rpc/")),
  catalogAccess: { status: catalog.response.status, code: catalog.body?.code || null, message: catalog.body?.message || null },
  duplicateAttempts: { status: attempts.response.status, rowsInspected: sampled, totalNonNullSessionRows: total,
    completeSnapshot: total !== null && total === sampled && attempts.response.ok,
    duplicateSessionGroupsObserved: duplicates.length, excessAttemptsObserved: duplicates.reduce((sum, n) => sum + n - 1, 0),
    limitation: "Only session IDs read, max 1000. No identities/answers/scores saved. A complete snapshot is not an ongoing uniqueness guarantee." },
  observedLegacyValues: { zeroDurationSessions: count(practice), completedSessions: count(completed),
    limitation: "Existing records do not establish current CHECK/trigger compatibility." },
  inaccessible: ["pg_constraint/check definitions and FK actions", "pg_trigger", "pg_policies and table/schema ACLs", "pg_default_acl", "pg_proc ownership/ACL/search_path", "pg_roles/pg_auth_members and inherited privileges", "public-schema CREATE privileges", "pg_index uniqueness definitions"],
};
await writeFile(new URL("../../docs/zi-phase5-production-metadata.json", import.meta.url), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify({ inspectedAt: evidence.inspectedAt, catalogAccess: evidence.catalogAccess, duplicateAttempts: evidence.duplicateAttempts, observedLegacyValues: evidence.observedLegacyValues }));
