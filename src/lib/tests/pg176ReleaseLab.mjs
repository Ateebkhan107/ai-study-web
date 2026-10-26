// Fixed local-only release rehearsal targets. Never reads application env files.
import {spawn} from 'node:child_process';
import {statSync,writeFileSync,mkdirSync} from 'node:fs';
export const lab='/private/tmp/prepzii-pg176.ujiylN';
export const run=Number(process.env.ZI_PHASE5_RELEASE_RUN||1);
if(!Number.isInteger(run)||run<1||run>20)throw Error('Invalid synthetic release run');
export const database=`zi_phase5_release_20261022_r${run}`;
export const restoreDatabase=`zi_phase5_restore_20261022_r${run}`;
export const evidence=`${lab}/evidence/release-prep-20261022/run${run}`;
export const connectionEnv={PATH:'/usr/bin:/bin',PGPASSFILE:'/dev/null',PGSERVICEFILE:'/dev/null',PGSYSCONFDIR:`${lab}/empty-config`};
export function verifyFilesystem(){
 for(const path of [lab,`${lab}/data`,'/tmp/prepzii-phase5-pg17']){const s=statSync(path);if(s.uid!==process.getuid()||(s.mode&0o777)!==0o700)throw Error('LAB_FILESYSTEM_GUARD_FAILED');}
}
let blocked=false;
export function sql(statement,role='zi_phase5_lab_admin',application='prepzii-release-acceptance',target=database){
 if(blocked)throw Error('Lab blocked after endpoint failure');
 verifyFilesystem();
 if(!['zi_phase5_lab_admin','postgres','supabase_admin','anon','authenticated','authenticator','service_role'].includes(role)||!['postgres',database,restoreDatabase].includes(target))throw Error('Unapproved synthetic target/role');
 const guard=`DO $$ BEGIN IF current_database()<>'${target}' OR current_user<>'zi_phase5_lab_admin' OR session_user<>'zi_phase5_lab_admin'
 OR inet_server_addr() IS NOT NULL OR current_setting('port')<>'55436' OR current_setting('server_version_num')<>'170006'
 OR current_setting('listen_addresses')<>'' OR current_setting('unix_socket_directories')<>'/tmp/prepzii-phase5-pg17'
 OR current_setting('data_directory')<>'${lab}/data'
 OR (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname=current_database())<>'zi_phase5_lab_admin'
 THEN RAISE EXCEPTION 'LAB_ENDPOINT_GUARD_FAILED';END IF;END $$;`;
 return new Promise((resolve,reject)=>{
  const p=spawn(`${lab}/runtime/bin/psql`,['-X','-w','-h','/tmp/prepzii-phase5-pg17','-p','55436','-d',target,'-U','zi_phase5_lab_admin','-v','ON_ERROR_STOP=1','-Atq'],{env:{...connectionEnv,PGAPPNAME:application}});
  let out='',err='';p.stdout.on('data',c=>out+=c);p.stderr.on('data',c=>err+=c);p.on('error',e=>{blocked=true;reject(e);});
  p.on('close',code=>{if(code){if(/LAB_ENDPOINT_GUARD_FAILED|LAB_FILESYSTEM/.test(err)||(/could not connect|connection to server/.test(err)&&application!=='prepzii-kill-only-this-worker'))blocked=true;reject(Error(err));}else resolve(out.trim());});
  p.stdin.end(`\\set VERBOSITY verbose\n${guard}\nSET statement_timeout='60s';SET lock_timeout='8s';SET ROLE ${role};\n${statement}`);
 });
}
export const releaseSettings=`SET prepzii.release_database='${database}';SET prepzii.release_operator='zi_phase5_lab_admin';
 SET prepzii.release_data_directory='${lab}/data';SET prepzii.release_port='55436';SET prepzii.release_endpoint='unix-socket';
 SET prepzii.release_policy='preserve-opening-no-retro-v1';`;
export async function logicalSnapshot(target=database){
 const tables=JSON.parse(await sql("SELECT COALESCE(json_agg(n.nspname||'.'||c.relname ORDER BY 1),'[]'::json) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname IN ('public','prepzii_rewards','prepzii_integrity');",undefined,undefined,target));
 const rows={};for(const table of tables){if(!/^(public|prepzii_rewards|prepzii_integrity)\.[a-z0-9_]+$/.test(table))throw Error('Unexpected synthetic table');rows[table]=JSON.parse(await sql(`SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),'[]'::jsonb) FROM ${table} t;`,undefined,undefined,target));}return rows;
}
export async function snapshot(name,target=database){mkdirSync(evidence,{recursive:true,mode:0o700});writeFileSync(`${evidence}/${name}.json`,JSON.stringify(await logicalSnapshot(target),null,2),{flag:'wx',mode:0o600});}
