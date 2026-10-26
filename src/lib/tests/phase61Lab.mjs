// Fixed Unix-socket-only synthetic target. Never imports application env files.
import { spawn } from "node:child_process";
import { statSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
export const lab = "/private/tmp/prepzii-pg176.ujiylN";
export const database = `zi_phase61_jobs_${Date.now()}`;
export const evidence = `${lab}/evidence/phase61/${database}`;
let blocked = false;
export const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
export const json = (value) => `${literal(JSON.stringify(value))}::jsonb`;
export function sql(statement, role = "zi_phase5_lab_admin", target = database) {
  if (blocked) throw Error("Lab blocked after failed verification");
  if (![database, "postgres"].includes(target) || !["zi_phase5_lab_admin", "postgres", "service_role", "anon", "authenticated"].includes(role)) throw Error("Unapproved synthetic target");
  for (const path of [lab, `${lab}/data`, "/tmp/prepzii-phase5-pg17"]) {
    const s = statSync(path);
    if (s.uid !== process.getuid() || (s.mode & 0o777) !== 0o700) { blocked = true; throw Error("LAB_FILESYSTEM_GUARD_FAILED"); }
  }
  const guard = `DO $$ BEGIN IF current_database()<>${literal(target)} OR current_user<>'zi_phase5_lab_admin' OR session_user<>'zi_phase5_lab_admin'
   OR inet_server_addr() IS NOT NULL OR current_setting('port')<>'55436' OR current_setting('server_version_num')<>'170006'
   OR current_setting('listen_addresses')<>'' OR current_setting('unix_socket_directories')<>'/tmp/prepzii-phase5-pg17'
   OR current_setting('data_directory')<>'${lab}/data'
   OR (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname=current_database())<>'zi_phase5_lab_admin'
   THEN RAISE EXCEPTION 'LAB_ENDPOINT_GUARD_FAILED'; END IF; END $$;`;
  return new Promise((resolve, reject) => {
    const p = spawn(`${lab}/runtime/bin/psql`, ["-X", "-w", "-h", "/tmp/prepzii-phase5-pg17", "-p", "55436", "-U", "zi_phase5_lab_admin", "-d", target, "-v", "ON_ERROR_STOP=1", "-Atq"], {
      env: { PATH: "/usr/bin:/bin", PGPASSFILE: "/dev/null", PGSERVICEFILE: "/dev/null", PGSYSCONFDIR: `${lab}/empty-config`, PGAPPNAME: "prepzii-phase61-synthetic" },
    });
    let out = "", err = "";
    p.stdout.on("data", (c) => out += c); p.stderr.on("data", (c) => err += c);
    p.on("error", (e) => { blocked = true; reject(e); });
    p.on("close", (code) => {
      if (code) {
        if (/LAB_ENDPOINT_GUARD_FAILED|connection to server|could not connect/.test(err)) blocked = true;
        reject(Error(err));
      } else resolve(out.trim());
    });
    p.stdin.end(`\\set VERBOSITY verbose\n${guard}\nSET statement_timeout='30s'; SET lock_timeout='8s'; SET ROLE ${role};\n${statement}`);
  });
}
export async function install() {
  await sql("SELECT 1;", undefined, "postgres");
  await sql(`CREATE DATABASE ${database} OWNER zi_phase5_lab_admin TEMPLATE template0;`, undefined, "postgres");
  mkdirSync(evidence, { recursive: true, mode: 0o700 });
  let foundation = readFileSync(new URL("./fixtures/security17.sql", import.meta.url), "utf8").replaceAll("zi_phase5_security17_fixture", database)
    .replace(/^CREATE ROLE .+;\n/gm, "").replace(/^GRANT anon, authenticated, service_role TO authenticator .+;\n/gm, "")
    .replace(/^GRANT anon, authenticated, service_role, authenticator TO postgres .+;\n/gm, "");
  await sql(foundation);
  const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  await sql(source("./fixtures/release17-history.sql"));
  // Authority is scoped to this fresh synthetic DB; no global role alteration.
  await sql(`GRANT CREATE ON DATABASE ${database} TO postgres;`);
  await sql(source("../../../db/proposals/20261022_browser_table_maintenance_privileges.sql"), "postgres");
  await sql(source("../../../db/proposals/20261022_public_browser_maintenance_defaults.sql"));
  await sql(source("../../../db/migrations/20261016_zi_generated_tests.sql"), "postgres");
  await sql(`SET prepzii.release_database='${database}'; SET prepzii.release_operator='zi_phase5_lab_admin';
    SET prepzii.release_data_directory='${lab}/data'; SET prepzii.release_port='55436';
    SET prepzii.release_endpoint='unix-socket'; SET prepzii.release_policy='preserve-opening-no-retro-v1';\n` + source("../../../db/releases/phase5/20261022_phase5_integrity.sql"));
  const routines = `SELECT jsonb_agg(jsonb_build_array(n.nspname,p.proname,p.proowner,p.proacl::text,md5(p.prosrc)) ORDER BY n.nspname,p.proname,p.oid)
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','prepzii_rewards','prepzii_integrity') AND p.proname<>'zi_generation_job';`;
  const before = await sql(routines);
  await sql(source("../../../db/migrations/20261022_zi_generation_jobs.sql"), "postgres");
  assert.equal(await sql(routines), before, "Job migration must preserve Phase 5 routine bodies/owners/ACLs");
  saveEvidence("phase5-routine-preservation", { unchanged: true });
  writeFileSync(`${evidence}/endpoint.json`, JSON.stringify({ database, server_version_num: 170006, socket: "/tmp/prepzii-phase5-pg17", port: 55436, operator: "zi_phase5_lab_admin", lab }), { flag: "wx", mode: 0o600 });
}
export const client = { async rpc(name, args) {
  const names = {
    zi_generation_job: ["p_op", "p_owner", "p_id", "p_data"],
    zi_store_generated_test: ["p_owner", "p_key", "p_config", "p_mode", "p_duration", "p_version", "p_questions"],
  };
  if (!names[name]) throw Error("Unapproved fixture RPC");
  const values = names[name].map((key) => args[key] === null ? "NULL" : typeof args[key] === "object" ? json(args[key]) : literal(args[key]));
  try {
    const raw = await sql(`SELECT public.${name}(${values.join(",")});`, "service_role");
    return { data: name === "zi_generation_job" ? JSON.parse(raw) : raw, error: null };
  } catch (error) { return { data: null, error: { code: error.message.match(/ERROR:\s+([A-Z0-9]{5}):/)?.[1] || "XX000" } }; }
} };
export function saveEvidence(name, value) { writeFileSync(`${evidence}/${name}.json`, JSON.stringify(value, null, 2), { flag: "wx", mode: 0o600 }); }
