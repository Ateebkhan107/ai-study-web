// Approved read-only investigation: GET only. Raw student/attempt IDs and scores
// remain in memory; output contains pseudonymous session fingerprints and counts.
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";

const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Missing server metadata credentials");
let requests = 0;
async function get(table, params = {}, headers = {}) {
  requests++;
  const response = await fetch(`${base}/rest/v1/${table}?${new URLSearchParams(params)}`, {
    method: "GET", signal: AbortSignal.timeout(20000),
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...headers },
  });
  const body = await response.json().catch(() => null);
  const rawCount = response.headers.get("content-range")?.split("/")[1];
  const total = rawCount && /^\d+$/.test(rawCount) ? Number(rawCount) : null;
  return { status: response.status, code: !response.ok ? body?.code : null, ok: response.ok, body, total };
}
function requireRows(result) {
  if (!result.ok || !Array.isArray(result.body)) throw new Error(`Read-only investigation failed: HTTP ${result.status}; code ${result.code || "unknown"}`);
  return result.body;
}
const metadata = await get("", {}, { Accept: "application/openapi+json" });
if (!metadata.ok) throw new Error(`Metadata HTTP ${metadata.status}`);
const definitions = metadata.body.definitions || {};
const fields = ["id", "session_id", "test_id", "user_id", "score", "total_marks", "correct_answers", "wrong_answers", "attempted", "total_questions", "time_taken_seconds", "created_at", "started_at", "submitted_at", "status"];
if (fields.some((field) => !definitions.test_attempts?.properties?.[field])) throw new Error("Attempt schema incompatible; stop rather than assume fields");
const attemptRead = await get("test_attempts", { select: fields.join(","), session_id: "not.is.null", order: "id", limit: "1000" }, { Prefer: "count=exact" });
const attempts = requireRows(attemptRead);
const bySession = new Map();
for (const row of attempts) bySession.set(row.session_id, [...(bySession.get(row.session_id) || []), row]);
const duplicates = [...bySession].filter(([, rows]) => rows.length > 1);
const duplicateIds = duplicates.flatMap(([, rows]) => rows.map((r) => r.id));
// Only bounded duplicate-related records are queried, never entire answer tables.
async function related(table, column, ids, select = column, order = "id") {
  const rows = []; let expected = 0; let complete = true;
  for (let start = 0; start < ids.length; start += 100) {
    const chunk = ids.slice(start, start + 100);
    if (chunk.some((id) => !/^[0-9a-f-]{36}$/i.test(id))) throw new Error("Unexpected identifier format");
    let chunkRead = 0; let chunkTotal = null;
    while (rows.length < 5000) {
      const result = await get(table, { select, [column]: `in.(${chunk.join(",")})`, order, limit: "1000", offset: String(chunkRead) }, { Prefer: "count=exact" });
      if (!result.ok) return { rows, complete: false, status: result.status, code: result.code };
      const page = requireRows(result); rows.push(...page); chunkRead += page.length; chunkTotal = result.total;
      if (!page.length || (chunkTotal !== null && chunkRead >= chunkTotal)) break;
    }
    expected += chunkTotal ?? chunkRead;
    if (chunkTotal === null || chunkRead !== chunkTotal) complete = false;
    if (rows.length >= 5000 && start + 100 < ids.length) { complete = false; break; }
  }
  return { rows, complete, expected, status: 200 };
}
const referenceSpecs = [];
for (const [table, definition] of Object.entries(definitions)) {
  if (!/^[a-z_][a-z0-9_]*$/.test(table)) continue;
  for (const [column, property] of Object.entries(definition.properties || {})) {
    if (/^[a-z_][a-z0-9_]*$/.test(column) && property.description?.includes("<fk table='test_attempts' column='id'/>")) referenceSpecs.push({ table, column });
  }
}
const references = await Promise.all(referenceSpecs.map(async (spec) => ({ ...spec, ...await related(spec.table, spec.column, duplicateIds) })));
const sessionRead = await related("test_sessions", "id", duplicates.map(([id]) => id), "id,user_id,status,duration_minutes", "id");
const sessions = new Map(sessionRead.rows.map((row) => [row.id, row]));
const catalog = await get("pg_constraint", { select: "oid", limit: "0" }, { "Accept-Profile": "pg_catalog" });
const fingerprint = (id) => createHash("md5").update(id).digest("hex").slice(0, 12);
const unique = (rows, key) => new Set(rows.map((row) => JSON.stringify(row[key] ?? null))).size;
const groups = duplicates.map(([id, raw]) => {
  const rows = [...raw].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id.localeCompare(b.id));
  const times = rows.map((r) => Date.parse(r.created_at));
  const gaps = times.slice(1).map((time, i) => (time - times[i]) / 1000).filter(Number.isFinite);
  const ids = new Set(rows.map((r) => r.id));
  const deps = references.map((ref) => {
    const matches = ref.rows.filter((r) => ids.has(r[ref.column]));
    return { table: ref.table, column: ref.column, rows: matches.length,
      attemptsReferenced: new Set(matches.map((r) => r[ref.column])).size, complete: ref.complete };
  });
  const answers = references.find((ref) => ref.table === "user_answers" && ref.column === "attempt_id");
  const answerCounts = rows.map((r) => answers?.rows.filter((a) => a.attempt_id === r.id).length ?? null);
  return {
    sessionFingerprint: fingerprint(id), attempts: rows.length,
    distinctStudents: unique(rows, "user_id"), missingStudentIds: rows.filter((r) => !r.user_id).length,
    baseSessionFound: sessions.has(id),
    allMatchBaseOwner: sessions.has(id) ? rows.every((r) => r.user_id === sessions.get(id).user_id) : null,
    identicalScores: unique(rows, "score") === 1, distinctScores: unique(rows, "score"),
    missingScores: rows.filter((r) => r.score === null).length,
    identicalScoreCounts: new Set(rows.map((r) => JSON.stringify([r.score, r.total_marks, r.correct_answers, r.wrong_answers, r.attempted, r.total_questions]))).size === 1,
    minGapSeconds: gaps.length ? Math.min(...gaps) : null, maxGapSeconds: gaps.length ? Math.max(...gaps) : null,
    spanSeconds: times.every(Number.isFinite) ? (times.at(-1) - times[0]) / 1000 : null,
    anyGapWithinFiveSeconds: gaps.some((n) => n <= 5), anyGapOverFiveMinutes: gaps.some((n) => n > 300),
    distinctStoredStarts: unique(rows, "started_at"), statuses: [...new Set(rows.map((r) => r.status))].sort(),
    submittedTimestampCount: rows.filter((r) => r.submitted_at).length,
    bankTestAssociationCount: rows.filter((r) => r.test_id).length,
    answerRowsPerAttempt: answerCounts, references: deps,
    // This is a formula-based exposure estimate, NOT observed XP or a cleanup decision.
    theoreticalAdditionalCorrectXP: rows.slice(1).reduce((n, r) => n + Math.max(0, Number(r.correct_answers) || 0) * 15, 0),
  };
}).sort((a, b) => a.sessionFingerprint.localeCompare(b.sessionFingerprint));
const rewardTables = Object.entries(definitions).filter(([name]) => /xp|reward|goal|badge|streak|ledger|event|log/.test(name)).map(([table, def]) => ({ table,
  attemptLinkColumns: Object.keys(def.properties || {}).filter((key) => /attempt_id|session_id/.test(key)) }));
const evidence = {
  inspectedAt: new Date().toISOString(), access: "GET only; raw IDs and scores not persisted", requestCount: requests,
  attempts: { rowsInspected: attempts.length, exactVisibleCount: attemptRead.total, completeSnapshot: attemptRead.total === attempts.length },
  summary: { duplicateGroups: groups.length, attemptsInDuplicateGroups: duplicateIds.length,
    excessAttempts: duplicateIds.length - groups.length,
    groupsWithDifferentStudents: groups.filter((g) => g.distinctStudents > 1).length,
    groupsWithDifferentScores: groups.filter((g) => !g.identicalScores).length,
    groupsWithCloseGaps: groups.filter((g) => g.anyGapWithinFiveSeconds).length,
    groupsWithGapsOverFiveMinutes: groups.filter((g) => g.anyGapOverFiveMinutes).length,
    groupsMissingBaseSession: groups.filter((g) => !g.baseSessionFound).length,
    groupsWithOwnerMismatch: groups.filter((g) => g.allMatchBaseOwner === false).length,
    theoreticalAdditionalCorrectXP: groups.reduce((n, g) => n + g.theoreticalAdditionalCorrectXP, 0) },
  groups,
  referenceCoverage: references.map(({ table, column, complete, status, code, rows }) => ({ table, column, complete, status, code: code || null, rows: rows.length })),
  sessionCoverage: { complete: sessionRead.complete, status: sessionRead.status }, rewardTables,
  rewardAttribution: "Cannot prove historical XP/streak/goal/badge effects from current aggregate balances. No reward RPCs invoked. Hidden tables, triggers, old code and external writers remain unverified.",
  catalogAccess: { status: catalog.status, code: catalog.code },
  limitations: ["Multiple GETs are not one PostgreSQL snapshot; records can change between reads.", "At most 1000 attempts and 5000 rows per related table; completeness is reported.", "References are only those advertised by OpenAPI; unknown catalog FKs/triggers and logical/JSON references remain unverified.", "Close timing suggests retries/races but does not identify the historical originating request.", "Different timestamps or scores do not by themselves establish an intentional retake.", "Session fingerprints are pseudonymous correlation labels, not anonymization guarantees; keep this operational report private."],
};
await writeFile(new URL("../../docs/zi-phase52-duplicate-evidence.json", import.meta.url), JSON.stringify(evidence, null, 2) + "\n");
console.log(JSON.stringify({ inspectedAt: evidence.inspectedAt, attempts: evidence.attempts, summary: evidence.summary, referenceCoverage: evidence.referenceCoverage, catalogAccess: evidence.catalogAccess, requestCount: requests }));
