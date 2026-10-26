import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { actors, assertLaunch, clerkConfiguration, origin } from './policy.mjs';
import { localClient } from './client.mjs';

test('requires explicit real Clerk-shaped identities, never invents an authenticated user', () => {
  assert.throws(() => actors('')); assert.throws(() => actors('journey-student-a')); assert.throws(() => actors('user_validid,arbitrary'));
  assert.deepEqual(actors('user_validid,user_validid,user_otherid'), ['user_validid','user_otherid']);
});
test('rejects production, hosted and CI launches before reading secrets or SQL', () => {
  for (const env of [{NODE_ENV:'production'}, {VERCEL:'1'}, {VERCEL_ENV:'preview'}, {CI:'true'}, {NETLIFY:'true'}, {RENDER:'true'}, {FLY_APP_NAME:'app'}]) assert.throws(() => assertLaunch(env));
  assert.doesNotThrow(() => assertLaunch({}));
  assert.throws(() => assertLaunch({}, '/tmp/not-approved')); assert.equal(origin, 'http://localhost:3463');
});
test('extracts only test Clerk configuration, ignoring production database/provider secrets', () => {
  const pk = `pk_test_${Buffer.from('synthetic.clerk.accounts.dev$').toString('base64')}`;
  const result = clerkConfiguration(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${pk}"\nCLERK_SECRET_KEY=sk_test_fixture\nGEMINI_API_KEY=never\nSUPABASE_SERVICE_ROLE_KEY=never\n`);
  assert.deepEqual(Object.keys(result.values).sort(), ['CLERK_SECRET_KEY','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY']);
  assert.equal(result.frontend, 'synthetic.clerk.accounts.dev');
  assert.throws(() => clerkConfiguration(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${pk}\nCLERK_SECRET_KEY=sk_live_not_allowed`));
  assert.throws(() => clerkConfiguration(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_${Buffer.from('example.com$').toString('base64')}\nCLERK_SECRET_KEY=sk_test_fixture`));
});
test('network preload rejects Gemini, hosted database, arbitrary fetch, TLS and sockets without sending', () => {
  const code = `const assert=require('node:assert/strict'),tls=require('node:tls'),net=require('node:net');for(const u of ['https://generativelanguage.googleapis.com/v1beta/models','https://example.supabase.co/rest/v1','https://example.com','http://api.clerk.com/v1/users','https://api.clerk.com:444/v1/users'])assert.throws(()=>fetch(u));assert.throws(()=>tls.connect({host:'example.supabase.co',port:443}));assert.throws(()=>net.connect({host:'1.1.1.1',port:443}));assert.throws(()=>net.connect({path:'/tmp/unsafe.sock'}));`;
  const p = spawnSync(process.execPath, ['--require',new URL('./network.cjs',import.meta.url).pathname,'-e',code], {env:{PATH:'/usr/bin:/bin', ZI_LOCAL_CLERK_FRONTEND:'synthetic.clerk.accounts.dev'},encoding:'utf8'});
  assert.equal(p.status,0,p.stderr);
});
test('SQL adapter only permits reviewed local tables, filters and exact RPC signatures', async () => {
  const statements=[];
  const client=localClient({sql:async(s,role)=>{statements.push([s,role]);return '[]'},literal:v=>`'${String(v).replaceAll("'","''")}'`,json:v=>`'${JSON.stringify(v)}'::jsonb`});
  assert.throws(()=>client.from('user_xp')); assert.throws(()=>client.from('user_profiles;DROP TABLE user_xp'));
  assert.throws(()=>client.from('user_profiles').eq('clerk_user_id;DROP', 'user_a'));
  assert.equal(client.from('user_profiles').update,undefined);
  await assert.rejects(()=>client.rpc('increment_xp',{uid:'other',amount:100}));
  await assert.rejects(()=>client.rpc('zi_generation_job',{p_op:'read',untrusted:'x'}));
  const result=await client.from('user_profiles').select('*').eq('clerk_user_id',"user_'unsafe").maybeSingle();
  assert.equal(result.data,null);assert.match(statements[0][0],/user_''unsafe/);assert.equal(statements[0][1],'service_role');
});
test('ordinary application has no local mock activation or authentication substitution', () => {
  const launcher=readFileSync(new URL('./dev.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(launcher,/copy\('.*auth\.(server|client)/);
  assert.doesNotMatch(readFileSync(new URL('../../next.config.mjs',import.meta.url),'utf8'),/zi-local|ZI_LOCAL_MOCK/);
  assert.doesNotMatch(readFileSync(new URL('../../src/lib/supabaseAdmin.js',import.meta.url),'utf8'),/zi-local|ZI_LOCAL_MOCK/);
  assert.match(launcher,/phase!==PHASE_DEVELOPMENT_SERVER/);
  assert.match(launcher,/'--hostname', 'localhost'/);
  assert.match(launcher,/No Clerk aliases, invented cookies, fake users/);
});
