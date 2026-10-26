// Offline checks only; no env files, credentials, dependency install or DB calls.
import { mkdtempSync, cpSync, symlinkSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const build = mkdtempSync("/private/tmp/prepzii-phase61-build-");
const evidence = `${build}/evidence`; mkdirSync(evidence, { mode: 0o700 });
for (const name of ["src", "public", "package.json", "package-lock.json", "next.config.mjs", "postcss.config.mjs", "jsconfig.json"]) cpSync(`${root}/${name}`, `${build}/${name}`, { recursive: true });
symlinkSync(`${root}/node_modules`, `${build}/node_modules`);
const denyFile = `${build}/deny-network.cjs`;
writeFileSync(denyFile, `const net=require('node:net'),tls=require('node:tls'),dns=require('node:dns');const deny=()=>{throw Error('SYNTHETIC_CHECK_NETWORK_DISABLED')};net.Socket.prototype.connect=deny;net.connect=deny;net.createConnection=deny;tls.connect=deny;dns.lookup=deny;dns.resolve=deny;dns.resolve4=deny;dns.resolve6=deny;globalThis.fetch=async()=>deny();require('node:module').syncBuiltinESMExports();`);
const env = { PATH: "/Users/ateebmazhar/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin", HOME: build, TMPDIR: "/private/tmp", NEXT_TELEMETRY_DISABLED: "1", NODE_OPTIONS: `--require=${denyFile}`,
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic-only", SUPABASE_SERVICE_ROLE_KEY: "synthetic-service-only",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_test_${Buffer.from("synthetic.clerk.accounts.dev$").toString("base64")}`, CLERK_SECRET_KEY: "sk_test_synthetic_only", NEXT_PUBLIC_APP_URL: "https://synthetic.invalid" };
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]); }
async function run(name, args, cwd) {
  const result = await new Promise((resolve) => {
    const p = spawn(process.execPath, args, { cwd, env }); let out = "";
    p.stdout.on("data", (c) => out += c); p.stderr.on("data", (c) => out += c);
    p.on("close", (code) => resolve({ code, out }));
  });
  writeFileSync(`${evidence}/${name}.log`, result.out, { flag: "wx", mode: 0o600 });
  console.log(`${name}: ${result.code === 0 ? "PASS" : "FAIL"}\n${result.out.slice(-500)}`);
  return result.code;
}
const server = files(`${root}/src/lib`).filter((p) => p.endsWith(".test.mjs") && !/17\.test\.mjs$|database\.test\.mjs$/.test(p));
const serverCode = await run("server", ["--conditions=react-server", "--test", ...server], root);
const uiCode = await run("ui", ["--test", `${root}/src/components/zi/tests/testBuilder.test.mjs`, `${root}/src/components/test/tests/engine.test.mjs`], root);
const buildCode = await run("build", [`${build}/node_modules/next/dist/bin/next`, "build", "--webpack"], build);
writeFileSync(`${evidence}/metadata.json`, JSON.stringify({ build, serverCode, uiCode, buildCode, network: "denied", synthetic_environment: true, env_files_copied: false, public_generation: false }), { flag: "wx", mode: 0o600 });
console.log(`Evidence: ${evidence}`);
process.exitCode = serverCode || uiCode || buildCode;
