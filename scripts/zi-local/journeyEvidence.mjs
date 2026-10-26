// Read-only evidence from a verified synthetic workspace; never accepts a URL.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { assertLaunch, origin } from './policy.mjs';
const [dir, phase] = process.argv.slice(2);
assertLaunch(process.env,dir);
if (!dir || !['before','after'].includes(phase)) throw Error('Expected verified local workspace and before/after');
const manifest=JSON.parse(readFileSync(`${dir}/local-manifest.json`,'utf8'));
assert.equal(manifest.origin,origin);assert.equal(manifest.lab,'/private/tmp/prepzii-pg176.ujiylN');
const { sql,database }=await import(pathToFileURL(`${dir}/src/lib/tests/phase61Lab.mjs`));assert.equal(database,manifest.database);
const hash = s => createHash('sha256').update(s).digest('hex');
const rows=JSON.parse(await sql(`SELECT jsonb_build_object(
  'jobs',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'state',state,'accepted',accepted,'requests',jsonb_array_length(requests),'test_id',test_id) ORDER BY created_at) FROM zi_generation.jobs),'[]'::jsonb),
  'sessions',coalesce((SELECT jsonb_agg(jsonb_build_object('id',session_id,'test_id',test_id,'started_at',started_at,'deadline_at',deadline_at,'revision',revision,'submitted_at',submitted_at,'result',result,'saved_answer_count',(SELECT count(*) FROM jsonb_object_keys(answers)))) FROM public.zi_generated_sessions),'[]'::jsonb),
  'questions',(SELECT count(*) FROM public.zi_generated_questions),
  'receipt_count',(SELECT count(*) FROM prepzii_integrity.receipts),
  'service_xp_update',has_table_privilege('service_role','public.user_xp','UPDATE'));`));
rows.xp_hash=hash(await sql('SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY user_id),\'[]\'::jsonb) FROM public.user_xp x;'));
rows.version=await sql("SELECT current_setting('server_version_num');");
const filename=`${dir}/evidence/chat503-${phase}.json`;
if (phase==='after') {
  const before=JSON.parse(readFileSync(`${dir}/evidence/chat503-before.json`,'utf8'));
  assert.equal(rows.xp_hash,before.xp_hash);assert.equal(rows.receipt_count,before.receipt_count);assert.equal(rows.service_xp_update,false);
}
writeFileSync(filename,JSON.stringify(rows,null,2),{mode:0o600,flag:'wx'});
console.log(JSON.stringify({phase,version:rows.version,jobs:rows.jobs.map(j=>({state:j.state,accepted:j.accepted,mockRequests:j.requests})),sessions:rows.sessions.length,questions:rows.questions,xpPreserved:phase==='after',evidence:filename}));
