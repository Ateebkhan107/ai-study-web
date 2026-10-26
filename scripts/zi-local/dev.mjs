// Explicit local launcher. Never imported by application routes or Next config.
import { mkdtempSync, cpSync, symlinkSync, writeFileSync, readFileSync, mkdirSync, createWriteStream, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { lookup } from 'node:dns/promises';
import { assertLaunch, actors, clerkConfiguration, origin } from './policy.mjs';

assertLaunch(process.env);
if ((await lookup('localhost', { all: true })).some(x => !['127.0.0.1', '::1'].includes(x.address))) throw Error('localhost does not resolve exclusively to loopback');
const root = fileURLToPath(new URL('../../', import.meta.url));
const prepareOnly = process.argv.includes('--prepare-only');
const signedOutCheck = process.argv.includes('--signed-out-check');
if (signedOutCheck && (!process.argv.includes('--resume') || process.env.ZI_LOCAL_CLERK_USERS)) throw Error('Signed-out check requires an empty-allowlist prepared workspace');
const ids = signedOutCheck || prepareOnly && !process.env.ZI_LOCAL_CLERK_USERS ? [] : actors(process.env.ZI_LOCAL_CLERK_USERS);
// Read ONLY these two Clerk test credentials. Never load the application's env.
const { values: clerk, frontend } = clerkConfiguration(readFileSync(`${root}/.env.local`, 'utf8'));
const { install, sql, json, literal, database, lab } = await import('../../src/lib/tests/phase61Lab.mjs');
const supplied = process.argv.indexOf('--resume');
let dir, manifest;
if (supplied >= 0) {
  dir = process.argv[supplied + 1]; assertLaunch(process.env, dir);
  manifest = JSON.parse(readFileSync(`${dir}/local-manifest.json`, 'utf8'));
  if (manifest.origin !== origin || JSON.stringify(manifest.actors) !== JSON.stringify(ids)) throw Error('Local identity/origin changed; stop for review');
  const pinned = await import(`file://${dir}/src/lib/tests/phase61Lab.mjs`);
  if (pinned.database !== manifest.database) throw Error('Local database manifest mismatch');
  await pinned.sql('SELECT 1;'); // Endpoint/operator/version/owner checks precede every SQL batch.
} else {
  await install(); // New synthetic database only; guarded fixed Unix socket, exact 17.6.
  dir = mkdtempSync('/private/tmp/prepzii-zi-local-'); assertLaunch(process.env, dir);
  mkdirSync(`${dir}/evidence`, { mode: 0o700 });
  for (const name of ['src/components', 'src/lib', 'src/hooks', 'src/utils', 'src/services', 'public', 'package.json', 'package-lock.json', 'postcss.config.mjs', 'jsconfig.json']) cpSync(`${root}/${name}`, `${dir}/${name}`, { recursive: true });
  symlinkSync(`${root}/node_modules`, `${dir}/node_modules`);
  function copy(from, to) {
    mkdirSync(`${dir}/${to.substring(0, to.lastIndexOf('/'))}`, { recursive: true });
    cpSync(`${root}/${from}`, `${dir}/${to}`, { recursive: true });
  }
  function replaceOnce(path, before, after) {
    const text = readFileSync(`${dir}/${path}`, 'utf8');
    if (text.split(before).length !== 2) throw Error(`Source changed; review isolated substitution: ${path}`);
    writeFileSync(`${dir}/${path}`, text.replace(before, after));
  }
  for (const path of ['zi', 'test/session', 'test/result', 'test/review']) copy(`src/app/(dashboard)/${path}`, `src/app/${path}`);
  for (const path of ['zi/chat', 'zi/test-builder', 'zi/generation-jobs', 'test-session', 'test-attempts']) copy(`src/app/api/${path}`, `src/app/api/${path}`);
  copy('scripts/zi-local/chat.template.js', 'src/app/api/zi/chat/route.js');
  copy('src/app/globals.css', 'src/app/globals.css'); copy('src/app/fonts', 'src/app/fonts');
  copy('scripts/zi-local/client.mjs', 'src/lib/localClient.mjs');
  copy('scripts/zi-local/network.cjs', 'deny-network.cjs');
  copy('scripts/zi-local/policy.mjs', 'src/lib/localPolicy.mjs');
  // No Clerk aliases, invented cookies, fake users, entitlement stubs or login endpoints.
  writeFileSync(`${dir}/src/lib/localGuard.server.js`, `import 'server-only';import {assertLaunch} from './localPolicy.mjs';export function assertLocal(){assertLaunch(process.env,process.cwd());if(process.env.NODE_ENV!=='development'||process.env.ZI_LOCAL_MOCK_RUNTIME!=='1'||process.env.ZI_LOCAL_ORIGIN!==${JSON.stringify(origin)}||process.env.GEMINI_API_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY!=='synthetic-local-only')throw Error('Local mock isolation unavailable');} `);
  const helper = readFileSync(`${root}/src/lib/tests/phase61Lab.mjs`, 'utf8').replace('`zi_phase61_jobs_${Date.now()}`', JSON.stringify(database));
  writeFileSync(`${dir}/src/lib/tests/phase61Lab.mjs`, helper);
  writeFileSync(`${dir}/src/lib/supabaseAdmin.js`, `import 'server-only';import {assertLocal} from './localGuard.server';import {localClient} from './localClient.mjs';import {sql,literal,json} from './tests/phase61Lab.mjs';assertLocal();export const supabaseAdmin=localClient({sql:async(...args)=>{assertLocal();return sql(...args)},literal,json});`);
  copy('src/lib/tests/fixtures/journey62/provider.js', 'src/lib/zi/localMockProvider.server.js');
  // Fix fixture-relative imports because this copy lives beside provider.js.
  replaceOnce('src/lib/zi/localMockProvider.server.js', 'from "@/lib/tests/fixtures/generated.mjs"', 'from "@/lib/tests/fixtures/generated.mjs"');
  writeFileSync(`${dir}/src/lib/zi/provider.js`, `import {assertLocal} from '../localGuard.server';import * as mock from './localMockProvider.server';export function getZiGenerationQuotaStatus(){assertLocal();return mock.getZiGenerationQuotaStatus()}export async function completeZiQuestionTask(r){assertLocal();return mock.completeZiQuestionTask(r)}export const completeZiPatternAnalysis=completeZiQuestionTask;export function streamZiResponse(){assertLocal();throw Error('Only deterministic test-builder requests are supported by local mock mode')}`);
  replaceOnce('src/lib/zi/testGenerator/jobs.server.js', 'const { configuration, draftKey } = confirmedGenerationDraft({ userId, access, token }, draftOptions);', `const { configuration, draftKey } = confirmedGenerationDraft({ userId, access, token }, draftOptions);const c=configuration.generationConfig;if(c.exam!=='JEE Main'||c.subject!=='Physics'||c.chapter!=='Rotational Motion'||c.difficulty!=='Medium'||![5,10].includes(c.questionCount))throw new GenerationJobError('Local mock supports JEE Main Physics, Rotational Motion, Medium, 5 or 10 questions. Update the configuration.',400);`);
  replaceOnce('src/components/zi/ZiTestBuilder.jsx', 'Private pilot only. Provider execution requires separate server approval; public generation remains disabled.', 'LOCAL MOCK: deterministic synthetic questions; no Gemini calls. Supports JEE Main Physics, Rotational Motion, Medium, 5 or 10 questions.');
  // Guard before Clerk middleware: no non-loopback Host/origin, forwarding or unapproved identities.
  copy('scripts/zi-local/proxy.template.js', 'src/proxy.js');
  mkdirSync(`${dir}/src/app/sign-in/[[...sign-in]]`, { recursive: true });
  writeFileSync(`${dir}/src/app/sign-in/[[...sign-in]]/page.jsx`, `import {SignIn} from '@clerk/nextjs';export default function Page(){return <main style={{padding:40}}><SignIn forceRedirectUrl="/zi"/></main>}`);
  writeFileSync(`${dir}/src/app/layout.jsx`, `import './globals.css';import fonts from './fonts/root.module.css';import {ClerkProvider,UserButton} from '@clerk/nextjs';import {ZiEntityContextProvider} from '@/lib/zi/ZiEntityContext';export const metadata={robots:{index:false,follow:false}};export default function Layout({children}){return <ClerkProvider><html lang="en"><body className={Object.values(fonts).join(' ')}><div role="note" style={{padding:12,background:'#fff0bd'}}>LOCAL MOCK — real Clerk login; synthetic local database; no Gemini or hosted Supabase. <a href="/zi">Zi</a> · <UserButton/></div><ZiEntityContextProvider>{children}</ZiEntityContextProvider></body></html></ClerkProvider>}`);
  // Throw before build/start; root next.config and ordinary application are untouched.
  writeFileSync(`${dir}/next.config.mjs`, `import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';import {assertLaunch} from './src/lib/localPolicy.mjs';export default function(phase){assertLaunch(process.env,process.cwd());if(phase!==PHASE_DEVELOPMENT_SERVER||process.env.ZI_LOCAL_MOCK_RUNTIME!=='1')throw Error('Local mock cannot be built or deployed');return {reactCompiler:true,poweredByHeader:false,async headers(){return [{source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Content-Security-Policy',value:${JSON.stringify(`connect-src 'self' https://${frontend} https://api.clerk.com; form-action 'self' https://${frontend}; frame-ancestors 'none'`)}}]}]}}}`);
  // Prepare local-only access data. Identity is still verified by real Clerk.
  await sql(`ALTER TABLE public.user_profiles ADD COLUMN account_type text DEFAULT 'STUDENT';
    CREATE TABLE public.subscriptions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),clerk_user_id text,exam_track text,status text,expires_at timestamptz,plan text);
    CREATE TABLE public.institute_members(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text,status text);
    CREATE TABLE public.zi_preferences(clerk_user_id text,preference_key text,preference_value text);
    CREATE TABLE public.zi_journey_references(payload jsonb NOT NULL);
    REVOKE ALL ON public.subscriptions,public.institute_members,public.zi_preferences,public.zi_journey_references FROM PUBLIC,anon,authenticated,service_role;
    ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;ALTER TABLE public.institute_members ENABLE ROW LEVEL SECURITY;ALTER TABLE public.zi_preferences ENABLE ROW LEVEL SECURITY;
    GRANT SELECT ON public.subscriptions,public.institute_members,public.zi_preferences,public.zi_journey_references TO service_role;
    ${ids.map(id => `INSERT INTO public.user_profiles(clerk_user_id,exam,account_type) VALUES(${literal(id)},'JEE','STUDENT');INSERT INTO public.subscriptions(clerk_user_id,exam_track,status,expires_at,plan) VALUES(${literal(id)},'JEE','active',now()+interval '1 year','ai_mode');`).join('\n')}`);
  const references = Array.from({ length: 12 }, (_, i) => ({ id: `34567890-1234-4234-8234-${String(i + 1).padStart(12, '0')}`, exam: 'JEE', exam_type: 'JEE Main', subject: 'Physics', chapter: 'Rotational Motion', topic: 'Rotational dynamics', year: 2020+i%5, exam_id: '34567890-1234-4234-8234-000000000100', question_type: 'MCQ', difficulty: 'Medium', status: 'PUBLISHED', question: `Synthetic reference ${i}: a calibrated laboratory apparatus displays an optical alignment signal during a controlled rotation observation. What does the recorded indicator represent?`, option_a: 'The specified alignment state', option_b: 'An unrelated biological property', option_c: 'An arbitrary currency conversion', option_d: 'An undefined signal without a detector', correct_option: 'A', correct_options: ['A'], explanation: 'The synthetic sensor is defined to display the stated alignment condition. This record exists only to exercise source retrieval and does not represent an official examination question.', paper: { id: '34567890-1234-4234-8234-000000000100', exam: 'JEE', exam_type: 'JEE Main', year: 2024, status: 'PUBLISHED', is_published: true } }));
  await sql(`INSERT INTO public.zi_journey_references VALUES ${references.map(r => `(${json(r)})`).join(',')};`);
  manifest = { origin, database, lab, actors: ids, secret: randomBytes(32).toString('hex'), createdAt: new Date().toISOString(), sourceHashes: Object.fromEntries(['db/releases/phase5/20261022_phase5_integrity.sql', 'db/migrations/20261022_zi_generation_jobs.sql'].map(p => [p,createHash('sha256').update(readFileSync(`${root}/${p}`)).digest('hex')])) };
  writeFileSync(`${dir}/local-manifest.json`, JSON.stringify(manifest), { mode: 0o600, flag: 'wx' });
}
assertLaunch(process.env, dir);
if (['.env','.env.local','.env.development','.env.development.local'].some(p => existsSync(`${dir}/${p}`))) throw Error('Environment file found inside isolated workspace');
if (prepareOnly) {
  console.log(`Prepared without starting or authenticating anyone: ${dir}\nSynthetic database: ${manifest.database}\nNo user is enabled when the allowlist is empty. Retain this evidence; start a fresh workspace with your real Clerk test-account ID.`);
  process.exit(0);
}
// No inherited app credentials, database URLs, provider keys, NODE_OPTIONS or flags.
const env = { PATH: `${process.execPath.substring(0,process.execPath.lastIndexOf('/'))}:/usr/bin:/bin`, HOME: dir, TMPDIR: '/private/tmp', NEXT_TELEMETRY_DISABLED: '1',
  ...clerk, NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in', NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: '/zi', NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: '/zi',
  ZI_LOCAL_CLERK_FRONTEND: frontend, ZI_LOCAL_MOCK_RUNTIME: '1', ZI_LOCAL_ORIGIN: origin, NODE_OPTIONS: `--require=${dir}/deny-network.cjs`,
  ZI_TEST_BUILDER_SECRET: manifest.secret, ZI_GENERATION_PILOT_ENABLED: 'true', ZI_GENERATION_PILOT_USERS: ids.join(','), ZI_GENERATED_TEST_ENGINE_ENABLED: 'true',
  ZI_GENERATION_PROVIDER_APPROVED: 'true', PREPZII_INTEGRITY_CONTRACT_ENABLED: 'true', NEXT_PUBLIC_APP_URL: origin,
  NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-local-only', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-local-only' };
// Provider approval here reaches ONLY the substituted deterministic module. No live adapter/key exists in this workspace.
const log = createWriteStream(`${dir}/evidence/server.log`, { flags: 'a', mode: 0o600 });
const child = spawn(process.execPath, [`${dir}/node_modules/next/dist/bin/next`, 'dev', '--webpack', '--hostname', 'localhost', '--port', '3463'], { cwd: dir, env });
child.stdout.pipe(log); child.stderr.pipe(log);
writeFileSync(`${dir}/server.pid`, String(child.pid), { mode: 0o600 });
console.log(`Local Clerk mock app: ${origin}/zi\nWorkspace: ${dir}\nSynthetic database: ${manifest.database}\nPrivate log: ${dir}/evidence/server.log\nKeep this terminal running. Ctrl-C stops only this dev server; no database/evidence is deleted.`);
child.on('exit', code => { process.exitCode = code || 0; });
process.on('SIGTERM', () => child.kill('SIGTERM'));process.on('SIGINT', () => child.kill('SIGTERM'));
