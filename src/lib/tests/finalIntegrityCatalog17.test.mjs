import test from "node:test";
import assert from "node:assert/strict";
import {sql} from "./pg176Lab.mjs";
const enabled=process.env.ZI_FINAL_INTEGRITY17_LOCAL==="1";
const names="'test_sessions','test_attempts','test_questions','user_answers','institute_test_attempts','questions','badges','daily_goals','institute_test_questions','institute_tests','pyq_attempts','pyq_questions','user_badges','user_daily_goals','user_profiles','user_xp'";
test('final PostgreSQL 17.6 catalog and defaults',{skip:!enabled},async t=>{
 await t.test('all sixteen RLS tables retain browser read access without maintenance or protected writes',async()=>{
  assert.equal(await sql(`SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN (${names}) AND c.relrowsecurity;`),'16');
  for(const role of ['anon','authenticated']){
   assert.equal(await sql(`SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN (${names}) AND (has_table_privilege('${role}',c.oid,'TRUNCATE,MAINTAIN') OR NOT has_table_privilege('${role}',c.oid,'SELECT'));`),'0');
   assert.equal(await sql('SELECT count(*) FROM user_xp;',role),'0');
   await assert.rejects(sql("UPDATE user_xp SET xp=999999 WHERE user_id='synthetic-invalid';",role),/permission denied/);
  }
  assert.equal(await sql("SELECT rolcanlogin OR rolsuper OR rolcreatedb OR rolcreaterole FROM pg_roles WHERE rolname='prepzii_integrity_owner';"),'f');
 });
 await t.test('both creator defaults preserve application row rights and service maintenance; browser maintenance remains absent',async()=>{
  for(const creator of ['postgres','supabase_admin']){
   const result=await sql(`BEGIN;SET LOCAL ROLE ${creator};CREATE TABLE public.synthetic_integrity_default_probe(id integer);
    SELECT has_table_privilege('anon','public.synthetic_integrity_default_probe','SELECT') AND has_table_privilege('authenticated','public.synthetic_integrity_default_probe','SELECT')
     AND NOT has_table_privilege('anon','public.synthetic_integrity_default_probe','TRUNCATE,MAINTAIN') AND NOT has_table_privilege('authenticated','public.synthetic_integrity_default_probe','TRUNCATE,MAINTAIN')
     AND has_table_privilege('service_role','public.synthetic_integrity_default_probe','INSERT') AND has_table_privilege('service_role','public.synthetic_integrity_default_probe','MAINTAIN');ROLLBACK;`);
   assert.equal(result,'t');
  }
  assert.equal(await sql("SELECT to_regclass('public.synthetic_integrity_default_probe') IS NULL;"),'t');
 });
 await t.test('rollback preserves opening state, receipts and authority without reopening unsafe writers',async()=>{
  const before=await sql("SELECT jsonb_build_array((SELECT count(*) FROM user_xp),(SELECT count(*) FROM prepzii_integrity.receipts));");
  await sql("BEGIN;SET LOCAL ROLE service_role;SELECT prepzii_init_xp('synthetic-integrity-rollback-probe','Synthetic');ROLLBACK;");
  assert.equal(await sql("SELECT count(*) FROM user_xp WHERE user_id='synthetic-integrity-rollback-probe';"),'0');
  assert.equal(await sql("SELECT jsonb_build_array((SELECT count(*) FROM user_xp),(SELECT count(*) FROM prepzii_integrity.receipts));"),before);
  assert.equal(await sql("SELECT has_table_privilege('service_role','user_xp','UPDATE');"),'f');
 });
});
