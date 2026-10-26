// Synthetic lab only. No caller-selected connection target or credential files.
import { spawn } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
export const lab = "/private/tmp/prepzii-pg176.ujiylN";
export const evidence = `${lab}/evidence/phase5-20261022`;
export const database = "zi_phase5_security17_fixture";
export const read = p => readFileSync(new URL(p, import.meta.url), "utf8");
const foundation = read("./fixtures/security17.sql");
export const guard = `DO $$ BEGIN IF current_database()<>'${database}'
 OR current_user<>'zi_phase5_lab_admin' OR session_user<>'zi_phase5_lab_admin'
 OR inet_server_addr() IS NOT NULL OR current_setting('port')<>'55436'
 OR current_setting('server_version_num')<>'170006' OR current_setting('listen_addresses')<>''
 OR current_setting('unix_socket_directories')<>'/tmp/prepzii-phase5-pg17'
 OR current_setting('data_directory')<>'${lab}/data'
 OR (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname=current_database())<>'zi_phase5_lab_admin'
 THEN RAISE EXCEPTION 'LAB_ENDPOINT_GUARD_FAILED'; END IF; END $$;`;
let blocked = false;
export function sql(statement, role="zi_phase5_lab_admin", application="prepzii-phase5-acceptance") {
 if(blocked) throw Error("Lab blocked after failed endpoint verification");
 if(!["zi_phase5_lab_admin","postgres","supabase_admin","service_role","anon","authenticated","authenticator"].includes(role)) throw Error("Unknown fixture role");
 return new Promise((resolve,reject)=>{
  const p=spawn(`${lab}/runtime/bin/psql`,["-X","-w","-h","/tmp/prepzii-phase5-pg17","-p","55436","-d",database,"-U","zi_phase5_lab_admin","-v","ON_ERROR_STOP=1","-Atq"],{
   env:{PATH:"/usr/bin:/bin",PGPASSFILE:"/dev/null",PGSERVICEFILE:"/dev/null",PGSYSCONFDIR:`${lab}/empty-config`,PGAPPNAME:application},
  });
  let out="",err="";p.stdout.on("data",c=>out+=c);p.stderr.on("data",c=>err+=c);
  p.on("error",e=>{blocked=true;reject(e);});
  p.on("close",code=>{
   if(code){if(/LAB_ENDPOINT_GUARD_FAILED/.test(err) || (/connection to server|could not connect/.test(err) && application!=="prepzii-kill-only-this-worker"))blocked=true;reject(Error(err));}
   else resolve(out.trim());
  });
  p.stdin.end(`\\set VERBOSITY verbose\n${guard}\nSET statement_timeout='30s'; SET lock_timeout='8s';\nSET ROLE ${role};\n${statement}`);
 });
}
export async function foundationOnce(reuse=false) {
 await sql("SELECT 1;");
 const hash=createHash("sha256").update(foundation).digest("hex");
 if(reuse) {
  const actual=await sql("SELECT source_sha FROM public.zi_fixture_manifest WHERE name='security17';");
  if(actual!==hash) throw Error("Foundation evidence mismatch; no fixture reset permitted");
 } else {
  await sql(foundation);
  await sql(`CREATE TABLE public.zi_fixture_manifest(name text PRIMARY KEY,source_sha text NOT NULL);
   INSERT INTO public.zi_fixture_manifest VALUES('security17','${hash}');`);
 }
}
export async function snapshot(name) {
 const tables=JSON.parse(await sql("SELECT json_agg(n.nspname||'.'||c.relname ORDER BY 1) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname IN ('public','prepzii_rewards','prepzii_integrity');"));
 const rows={};
 for(const table of tables||[]) {
  if(!/^(public|prepzii_rewards|prepzii_integrity)\.[a-z0-9_]+$/.test(table))throw Error("Unexpected snapshot table");
  rows[table]=JSON.parse(await sql(`SELECT COALESCE(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM ${table} t;`));
 }
 mkdirSync(evidence,{recursive:true,mode:0o700});
 writeFileSync(`${evidence}/${name}.json`,JSON.stringify(rows,null,2),{mode:0o600,flag:"wx"});
}
