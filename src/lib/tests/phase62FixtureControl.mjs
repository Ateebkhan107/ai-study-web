// Controls only named synthetic fixture faults/deadlines; never accepts a DB URL.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
const [dir, actor, action] = process.argv.slice(2);
const actions = action?.split(",") || [];
if (!/^\/private\/tmp\/prepzii-phase62-[A-Za-z0-9]+$/.test(dir) || !["journey-student-a", "journey-student-b"].includes(actor) || !actions.length || actions.some((a) => !["save-before", "submit-before", "submit-after", "expire"].includes(a))) throw Error("Invalid synthetic fixture control");
assert.equal(statSync(dir).uid, process.getuid());
const manifest = JSON.parse(readFileSync(`${dir}/fixture.json`, "utf8"));
assert.equal(manifest.origin, "http://127.0.0.1:3462");
const { sql, literal, database } = await import(pathToFileURL(`${dir}/src/lib/tests/phase61Lab.mjs`).href);
assert.equal(database, manifest.database);
await sql("CREATE TABLE IF NOT EXISTS public.zi_journey_faults(owner_id text PRIMARY KEY,kind text,mode text,remaining integer); REVOKE ALL ON public.zi_journey_faults FROM PUBLIC,anon,authenticated,service_role;");
for (const action of actions) if (action === "expire") {
  const ids = await sql(`UPDATE public.zi_generated_sessions SET deadline_at=clock_timestamp()+interval '3 seconds' WHERE owner_id=${literal(actor)} AND submitted_at IS NULL RETURNING session_id;`);
  assert.ok(ids, "No active synthetic session to expire");
} else {
  const [kind, mode] = action.split("-");
  await sql(`INSERT INTO public.zi_journey_faults VALUES(${literal(actor)},${literal(kind)},${literal(mode)},1) ON CONFLICT(owner_id) DO UPDATE SET kind=excluded.kind,mode=excluded.mode,remaining=1;`);
}
writeFileSync(`${dir}/evidence/control-${Date.now()}.json`, JSON.stringify({ actor, action, fixture: true, database }), { flag: "wx", mode: 0o600 });
console.log(`Synthetic control armed: ${actor} ${action}`);
