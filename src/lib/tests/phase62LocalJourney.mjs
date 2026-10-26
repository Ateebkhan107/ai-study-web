// Local test launcher, never an application entry point. No .env files are read.
import { mkdtempSync, cpSync, symlinkSync, writeFileSync, readFileSync, mkdirSync, createWriteStream, statSync } from "node:fs";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { install, sql, json, database, lab } from "./phase61Lab.mjs";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const serve = process.argv.indexOf("--serve");
let dir, manifest;
if (serve >= 0) {
  dir = process.argv[serve + 1];
  if (!/^\/private\/tmp\/prepzii-phase62-[A-Za-z0-9]+$/.test(dir)) throw Error("Not an isolated journey directory");
  if (statSync(dir).uid !== process.getuid() || (statSync(dir).mode & 0o777) !== 0o700) throw Error("Unsafe fixture directory");
  manifest = JSON.parse(readFileSync(`${dir}/fixture.json`, "utf8"));
} else {
  await install(); // Every SQL batch has exact PostgreSQL 17.6 endpoint/owner guards.
  dir = mkdtempSync("/private/tmp/prepzii-phase62-");
  mkdirSync(`${dir}/evidence`, { mode: 0o700 });
  for (const name of ["src/components", "src/lib", "src/hooks", "src/utils", "src/services", "public", "package.json", "package-lock.json", "postcss.config.mjs", "jsconfig.json"]) {
    cpSync(`${root}/${name}`, `${dir}/${name}`, { recursive: true });
  }
  symlinkSync(`${root}/node_modules`, `${dir}/node_modules`);
  function copy(from, to) { mkdirSync(`${dir}/${to.substring(0, to.lastIndexOf("/"))}`, { recursive: true }); cpSync(`${root}/${from}`, `${dir}/${to}`, { recursive: true }); }
  for (const path of ["zi", "test/session", "test/result", "test/review"]) copy(`src/app/(dashboard)/${path}`, `src/app/${path}`);
  for (const path of ["zi/chat", "zi/test-builder", "zi/generation-jobs", "test-session", "test-attempts"]) copy(`src/app/api/${path}`, `src/app/api/${path}`);
  copy("src/app/globals.css", "src/app/globals.css"); copy("src/app/fonts", "src/app/fonts");
  // Test substitutions live ONLY in this new temporary copy. Real auth/config untouched.
  copy("src/lib/tests/fixtures/journey62/provider.js", "src/lib/zi/provider.js");
  copy("src/lib/tests/fixtures/journey62/supabase.js", "src/lib/supabaseAdmin.js");
  copy("src/lib/tests/fixtures/journey62/access.js", "src/lib/accessControl.js");
  const helper = readFileSync(`${root}/src/lib/tests/phase61Lab.mjs`, "utf8").replace('`zi_phase61_jobs_${Date.now()}`', JSON.stringify(database));
  writeFileSync(`${dir}/src/lib/tests/phase61Lab.mjs`, helper);
  writeFileSync(`${dir}/next.config.mjs`, `import path from 'node:path';const here=process.cwd();export default {reactCompiler:true,webpack(config){config.resolve.alias['@clerk/nextjs/server$']=path.join(here,'src/lib/tests/fixtures/journey62/auth.server.js');config.resolve.alias['@clerk/nextjs$']=path.join(here,'src/lib/tests/fixtures/journey62/auth.client.jsx');return config;}};`);
  writeFileSync(`${dir}/src/app/layout.jsx`, `import './globals.css';import fonts from './fonts/root.module.css';import {auth} from '@clerk/nextjs/server';import {SyntheticIdentity} from '@/lib/tests/fixtures/journey62/auth.client';import {ZiEntityContextProvider} from '@/lib/zi/ZiEntityContext';export default async function Layout({children}){const {userId}=await auth();return <html lang="en"><body className={Object.values(fonts).join(' ')}><div style={{padding:8,background:'#fff0bd',fontSize:12}} role="note">SYNTHETIC LOCAL TEST — mocked Clerk and Gemini; no real students or paid calls. {userId||'Signed out'}<form action="/fixture-local/login" method="POST" style={{display:'inline',marginLeft:12}}><button name="actor" value="journey-student-a">Student A</button>{' · '}<button name="actor" value="journey-student-b">Student B</button>{' · '}<button name="actor" value="out">Sign out</button></form></div><SyntheticIdentity userId={userId}><ZiEntityContextProvider>{children}</ZiEntityContextProvider></SyntheticIdentity></body></html>}`);
  mkdirSync(`${dir}/src/app/fixture-local/login`, { recursive: true });
  mkdirSync(`${dir}/src/app/fixture-local/health`, { recursive: true });
  writeFileSync(`${dir}/src/app/fixture-local/login/route.js`, `import {NextResponse} from 'next/server';import {actors,signature} from '@/lib/tests/fixtures/journey62/auth.server';export async function POST(request){if(request.headers.get('host')!=='127.0.0.1:3462')return new Response('Local only',{status:403});const actor=(await request.formData()).get('actor');const response=NextResponse.redirect(new URL('/zi','http://127.0.0.1:3462'),303);response.cookies.set('zi_synthetic_session',actors.includes(actor)?actor+'.'+signature(actor):'',{httpOnly:true,sameSite:'strict',path:'/',maxAge:actors.includes(actor)?3600:0});return response;}`);
  writeFileSync(`${dir}/src/app/fixture-local/health/route.js`, `export function GET(){return Response.json({fixture:'phase62-synthetic',database:${JSON.stringify(database)},version:170006});}`);
  // Node network deny: the local Next server and browser assets can use loopback;
  // external HTTP, TLS and non-loopback sockets fail before sending any traffic.
  writeFileSync(`${dir}/deny-network.cjs`, `const net=require('node:net'),tls=require('node:tls');const original=net.Socket.prototype.connect;net.Socket.prototype.connect=function(...args){const a=args[0];let host=typeof a==='object'?a.host:typeof args[1]==='string'?args[1]:'localhost';if(typeof a==='object'&&a.path&&a.path.startsWith('/private/tmp/'))return original.apply(this,args);if(!['127.0.0.1','localhost','::1'].includes(host||'localhost'))throw Error('FIXTURE_EXTERNAL_NETWORK_DENIED');return original.apply(this,args)};tls.connect=()=>{throw Error('FIXTURE_TLS_DISABLED')};const fetch=globalThis.fetch;globalThis.fetch=(input,...args)=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(!['127.0.0.1','localhost','::1'].includes(u.hostname))throw Error('FIXTURE_EXTERNAL_FETCH_DENIED');return fetch(input,...args)};require('node:module').syncBuiltinESMExports();`);
  const references = Array.from({ length: 12 }, (_, i) => ({ id: `34567890-1234-4234-8234-${String(i + 1).padStart(12, "0")}`,
    exam: "JEE", exam_type: "JEE Main", subject: "Physics", chapter: "Rotational Motion", topic: "Rotational dynamics", year: 2020 + i % 5,
    exam_id: "34567890-1234-4234-8234-000000000100", question_type: "MCQ", difficulty: "Medium", status: "PUBLISHED",
    question: `Synthetic reference ${i}: a calibrated laboratory apparatus displays an optical alignment signal during a controlled rotation observation. What does the recorded indicator represent?`,
    option_a: "The specified alignment state", option_b: "An unrelated biological property", option_c: "An arbitrary currency conversion", option_d: "An undefined signal without a detector", correct_option: "A", correct_options: ["A"],
    explanation: "The synthetic sensor is defined to display the stated alignment condition. This record exists only to exercise source retrieval and does not represent an official examination question.",
    paper: { id: "34567890-1234-4234-8234-000000000100", exam: "JEE", exam_type: "JEE Main", year: 2024, status: "PUBLISHED", is_published: true } }));
  await sql(`CREATE TABLE public.zi_journey_references(payload jsonb NOT NULL);REVOKE ALL ON public.zi_journey_references FROM PUBLIC,anon,authenticated,service_role;GRANT SELECT ON public.zi_journey_references TO service_role;INSERT INTO public.zi_journey_references VALUES ${references.map((r) => `(${json(r)})`).join(",")};`);
  await sql(`CREATE TABLE public.zi_journey_faults(owner_id text PRIMARY KEY,kind text,mode text,remaining integer); REVOKE ALL ON public.zi_journey_faults FROM PUBLIC,anon,authenticated,service_role;`);
  manifest = { dir, database, lab, origin: "http://127.0.0.1:3462", secret: randomBytes(32).toString("hex"), createdAt: new Date().toISOString() };
  writeFileSync(`${dir}/fixture.json`, JSON.stringify(manifest), { mode: 0o600, flag: "wx" });
}
// No inherited application credentials, .env loading, public flags or network targets.
const env = { PATH: "/Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin", HOME: dir, TMPDIR: "/private/tmp", NEXT_TELEMETRY_DISABLED: "1",
  NODE_OPTIONS: `--require=${dir}/deny-network.cjs`, ZI_JOURNEY_FIXTURE: "1", ZI_FIXTURE_SESSION_SECRET: manifest.secret,
  ZI_TEST_BUILDER_SECRET: manifest.secret, ZI_GENERATION_PILOT_ENABLED: "true", ZI_GENERATION_PILOT_USERS: "journey-student-a,journey-student-b",
  ZI_GENERATED_TEST_ENGINE_ENABLED: "true", ZI_GENERATION_PROVIDER_APPROVED: "true", PREPZII_INTEGRITY_CONTRACT_ENABLED: "true",
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic", SUPABASE_SERVICE_ROLE_KEY: "synthetic",
};
const log = createWriteStream(`${dir}/evidence/server.log`, { flags: "a", mode: 0o600 });
const child = spawn(process.execPath, [`${dir}/node_modules/next/dist/bin/next`, "dev", "--webpack", "--hostname", "127.0.0.1", "--port", "3462"], { cwd: dir, env });
child.stdout.pipe(log); child.stderr.pipe(log);
child.on("exit", (code) => { console.log(`Fixture server exited: ${code}`); process.exitCode = code || 0; });
writeFileSync(`${dir}/server.pid`, String(child.pid), { mode: 0o600 });
console.log(`Fixture directory: ${dir}\nSynthetic DB: ${manifest.database}\nBrowser: ${manifest.origin}/zi\nServer PID: ${child.pid}\nNo production credentials or AI transport. Leave this process running for manual testing.`);
process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGTERM"));
