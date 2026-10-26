// Explicitly invoked synthetic release rehearsal; no production configuration.
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,chmodSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sql,snapshot,logicalSnapshot,database,restoreDatabase,evidence,lab,releaseSettings,connectionEnv} from './pg176ReleaseLab.mjs';
if(process.env.ZI_PHASE5_RELEASE_REHEARSAL_LOCAL!=='1')throw Error('Explicit local rehearsal opt-in required');
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
mkdirSync(evidence,{recursive:true,mode:0o700});
const notes=[];const note=(label,data)=>{notes.push({label,data});writeFileSync(`${evidence}/rehearsal-status.json`,JSON.stringify(notes,null,2),{mode:0o600});console.log(label,JSON.stringify(data));};
async function command(binary,args,log){
 const out=await new Promise((resolve,reject)=>{const p=spawn(binary,args,{env:connectionEnv});let stdout='',stderr='';p.stdout.on('data',c=>stdout+=c);p.stderr.on('data',c=>stderr+=c);p.on('error',reject);p.on('close',code=>{if(log)writeFileSync(log,stdout+stderr,{flag:'wx',mode:0o600});if(code)reject(Error(`Synthetic command exit ${code}: ${stderr.slice(-1000)}`));else resolve(stdout);});});return out;
}
try{
 await sql('SELECT 1;',undefined,undefined,'postgres');
 assert.equal(await sql(`SELECT count(*) FROM pg_database WHERE datname IN ('${database}','${restoreDatabase}');`,undefined,undefined,'postgres'),'0','Refuse to overwrite an existing synthetic database');
 assert.equal(await sql("SELECT count(*) FROM pg_roles WHERE (rolname='postgres' AND NOT rolsuper AND rolbypassrls) OR (rolname='supabase_admin' AND rolsuper AND NOT rolcanlogin) OR (rolname='service_role' AND rolbypassrls) OR (rolname='authenticator' AND NOT rolinherit);",undefined,undefined,'postgres'),'4');
 await sql(`CREATE DATABASE ${database} OWNER zi_phase5_lab_admin TEMPLATE template0;`,undefined,undefined,'postgres');
 await sql(`CREATE DATABASE ${restoreDatabase} OWNER zi_phase5_lab_admin TEMPLATE template0;`,undefined,undefined,'postgres');
 note('Fresh isolated synthetic databases created',{database,restoreDatabase,server_version_num:170006});
 let foundation=read('./fixtures/security17.sql').replaceAll('zi_phase5_security17_fixture',database)
  .replace(/^CREATE ROLE .+;\n/gm,'').replace(/^GRANT anon, authenticated, service_role TO authenticator .+;\n/gm,'').replace(/^GRANT anon, authenticated, service_role, authenticator TO postgres .+;\n/gm,'');
 await sql(foundation);await sql(read('./fixtures/release17-history.sql'));
 await sql(read('../../../db/proposals/20261022_browser_table_maintenance_privileges.sql'),'postgres');
 await sql(read('../../../db/proposals/20261022_public_browser_maintenance_defaults.sql'));
 await sql(read('../../../db/migrations/20261016_zi_generated_tests.sql'),'postgres');
 await snapshot('integrity-before-install');
 const candidate=read('../../../db/releases/phase5/20261022_phase5_integrity.sql');
 // Test endpoint/policy refusal before the one-shot installation.
 await assert.rejects(sql(candidate),/PHASE5_RELEASE_ENDPOINT_OR_POLICY_GUARD_FAILED/);
 assert.equal(await sql("SELECT to_regnamespace('prepzii_rewards') IS NULL AND to_regnamespace('prepzii_integrity') IS NULL;"),'t');
 await sql(releaseSettings+candidate);
 note('One-shot release installation PASS',{sha256:createHash('sha256').update(candidate).digest('hex'),application_routines_executed_during_install:false});
 const env={PATH:process.env.PATH,ZI_FINAL_INTEGRITY17_LOCAL:'1',ZI_FINAL_INTEGRITY17_RUN:'7',ZI_PHASE5_RELEASE_RUN:process.env.ZI_PHASE5_RELEASE_RUN||'1',ZI_PHASE5_RELEASE_CONTRACT_LOCAL:'1'};
 const result=await new Promise(resolve=>{const p=spawn(process.execPath,['--import',new URL('./phase5ReleaseHooks.mjs',import.meta.url).pathname,'--test','--test-concurrency=1','--test-reporter=tap',new URL('./finalIntegrity17.test.mjs',import.meta.url).pathname,new URL('./finalIntegrityCatalog17.test.mjs',import.meta.url).pathname,new URL('./badgeParity17.test.mjs',import.meta.url).pathname],{env});let log='';p.stdout.on('data',c=>log+=c);p.stderr.on('data',c=>log+=c);p.on('close',code=>{writeFileSync(`${evidence}/release-acceptance.tap`,log,{flag:'wx',mode:0o600});resolve({code,summary:log.slice(-200)});});});
 note('Synthetic acceptance suites',result);if(result.code!==0)throw Error('Acceptance failed; database and evidence retained');
 await snapshot('before-backup');const before=await logicalSnapshot();
 const dump=`${evidence}/release-final.dump`;assert.equal(existsSync(dump),false);
 await sql('SELECT 1;');await command(`${lab}/runtime/bin/pg_dump`,['-w','-h','/tmp/prepzii-phase5-pg17','-p','55436','-U','zi_phase5_lab_admin','-d',database,'-Fc','-f',dump],`${evidence}/pg-dump.log`);chmodSync(dump,0o600);
 await sql('SELECT 1;',undefined,undefined,restoreDatabase);
 await command(`${lab}/runtime/bin/pg_restore`,['-w','-h','/tmp/prepzii-phase5-pg17','-p','55436','-U','zi_phase5_lab_admin','-d',restoreDatabase,'--exit-on-error','--single-transaction',dump],`${evidence}/pg-restore.log`);
 const after=await logicalSnapshot(restoreDatabase);assert.deepEqual(after,before);
 const catalogQuery=`SELECT jsonb_build_object(
 'relations',(SELECT jsonb_agg(jsonb_build_array(n.nspname,c.relname,pg_get_userbyid(c.relowner),COALESCE(c.relacl,acldefault('r',c.relowner))::text,c.relrowsecurity,c.relforcerowsecurity) ORDER BY n.nspname,c.relname) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname IN ('public','prepzii_rewards','prepzii_integrity')),
 'functions',(SELECT jsonb_agg(jsonb_build_array(n.nspname,p.proname,pg_get_function_identity_arguments(p.oid),pg_get_userbyid(p.proowner),p.prosecdef,p.proconfig,COALESCE(p.proacl,acldefault('f',p.proowner))::text,md5(p.prosrc)) ORDER BY n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','prepzii_rewards','prepzii_integrity')),
 'columns',(SELECT jsonb_agg(jsonb_build_array(n.nspname,c.relname,a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull,a.attacl::text,md5(pg_get_expr(d.adbin,d.adrelid))) ORDER BY n.nspname,c.relname,a.attnum) FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum WHERE c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped AND n.nspname IN ('public','prepzii_rewards','prepzii_integrity')),
 'defaults',(SELECT jsonb_agg(jsonb_build_array(pg_get_userbyid(d.defaclrole),n.nspname,d.defaclobjtype,d.defaclacl::text) ORDER BY pg_get_userbyid(d.defaclrole),n.nspname,d.defaclobjtype) FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace),
 'constraints',(SELECT jsonb_agg(jsonb_build_array(n.nspname,c.relname,k.conname,pg_get_constraintdef(k.oid),k.convalidated) ORDER BY n.nspname,c.relname,k.conname) FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','prepzii_rewards','prepzii_integrity')));`;
 const catalogBefore=JSON.parse(await sql(catalogQuery));const catalogAfter=JSON.parse(await sql(catalogQuery,undefined,undefined,restoreDatabase));assert.deepEqual(catalogAfter,catalogBefore);
 writeFileSync(`${evidence}/restored-catalog.json`,JSON.stringify(catalogAfter,null,2),{flag:'wx',mode:0o600});
 await snapshot('restored',restoreDatabase);
 for(const target of [database,restoreDatabase]){
  assert.equal(await sql("SELECT count(*) FROM user_xp x LEFT JOIN prepzii_integrity.opening_profiles b USING(user_id) WHERE COALESCE(x.xp,0)<>COALESCE((b.profile->>'xp')::integer,0)+COALESCE((SELECT sum(delta) FROM prepzii_integrity.receipts r WHERE r.user_id=x.user_id),0);",undefined,undefined,target),'0');
  assert.equal(await sql("SELECT has_table_privilege('service_role','user_xp','UPDATE');",undefined,undefined,target),'f');
  assert.equal(await sql('SELECT count(*) FROM user_xp;','anon',undefined,target),'0');
  await assert.rejects(sql("UPDATE user_xp SET xp=7 WHERE user_id='synthetic-release-history';",'service_role',undefined,target),/permission denied/);
 }
 // Replay a restored completed submission: no additional balance or receipt.
 const replay=JSON.parse(await sql("SELECT jsonb_build_object('u',user_id,'s',session_id,'p',payload) FROM prepzii_integrity.sessions WHERE state='COMMITTED' ORDER BY session_id LIMIT 1;",undefined,undefined,restoreDatabase));
 const beforeReplay=await logicalSnapshot(restoreDatabase);
 await sql(`SELECT prepzii_commit_test('${replay.u}','${replay.s}','${JSON.stringify(replay.p).replaceAll("'","''")}');`,'service_role',undefined,restoreDatabase);
 assert.deepEqual(await logicalSnapshot(restoreDatabase),beforeReplay);
 note('Backup/restore verification PASS',{tables_compared:Object.keys(before).length,restore_target:restoreDatabase,receipts_balances_progress_registry_equal:true,catalog_owners_acl_rls_columns_defaults_constraints_functions_equal:true,restored_replay_did_not_pay:true});
 note('Rehearsal complete',{production_connections:0,databases_deleted:0,retained:true});
}catch(error){note('FAIL; all databases/evidence retained',{message:error.message});process.exitCode=1;}
