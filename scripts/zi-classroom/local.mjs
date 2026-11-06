// Isolated UI harness. Auth, storage and provider substitutions exist only in a
// temporary source copy. No application env files or credentials are loaded.
import { cpSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "prepzii-classroom-"));
const port = 3471;
const production = process.argv.includes("--production");
const runTests = process.argv.includes("--test");
const disabled = process.argv.includes("--disabled");

function write(name, content) {
  const target = join(dir, name);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

for (const name of ["src/components", "src/lib", "src/hooks", "src/utils", "src/services",
  "src/app/globals.css", "src/app/fonts", "src/app/api/zi/chat/route.js", "public", "package.json", "package-lock.json",
  "jsconfig.json", "postcss.config.mjs", "AGENTS.md"]) {
  const target = join(dir, name);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(join(root, name), target, { recursive: true });
}
symlinkSync(join(root, "node_modules"), join(dir, "node_modules"));

write("next.config.mjs", `
  import { resolve } from "node:path";
  export default {
    reactCompiler: true,
    async headers() {
      return [{ source: "/:path*", headers: [
        { key: "Content-Security-Policy", value: "connect-src 'self'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" }
      ] }];
    },
    webpack(config) {
      config.resolve.alias["@clerk/nextjs/server$"] = resolve("synthetic-clerk.server.js");
      config.resolve.alias["@clerk/nextjs$"] = resolve("src/lib/tests/fixtures/journey62/auth.client.jsx");
      return config;
    }
  };
`);
write("src/app/layout.jsx", `
  import "./globals.css";
  import fonts from "./fonts/root.module.css";
  import Link from "next/link";
  import ZiLauncher from "@/components/zi/ZiLauncher";
  import { ZiEntityContextProvider } from "@/lib/zi/ZiEntityContext";
  import { SyntheticIdentity } from "@/lib/tests/fixtures/journey62/auth.client";
  import { getClassroomFixtureOwner } from "@/lib/zi/classroom/availability.server";
  const id = "classroom-synthetic-student";
  export default function Layout({ children }) {
    return <html lang="en"><body className={Object.values(fonts).join(" ")}>
      <SyntheticIdentity userId={id}><ZiEntityContextProvider>
        <main className="min-h-[140dvh] space-y-4 p-5">
          <p>Local Zi test session · Synthetic student and mocked chat</p>
          <Link href="/dashboard">Dashboard</Link>{" · "}
          <Link href="/test/session">Protected solving route</Link>
          {children}
        </main>
        <ZiLauncher plan="AI_MODE" ziFreeUsage={{ available: false, remaining: 0, used: 0 }}
          classroomFixtureOwner={getClassroomFixtureOwner(id)} />
      </ZiEntityContextProvider></SyntheticIdentity>
    </body></html>;
  }
`);
for (const route of ["dashboard", "test/session"]) {
  write(`src/app/${route}/page.jsx`, 'export default function Page() { return <h1>Zi local fixture</h1>; }');
}

write("synthetic-clerk.server.js", `
  export const auth = async () => ({ userId: "classroom-synthetic-student" });
`);
write("src/lib/accessControl.js", `
  export const getUserAccessContext = async ({ userId }) => ({ userId, accountType: "STUDENT", plan: "AI_MODE", isAiMode: true, examTrack: "JEE" });
  export const getProfileAccessProfile = async () => ({ examTrack: "JEE" });
  export const normalizeExamTrack = () => "JEE";
  export const canUseFeature = () => ({ allowed: false });
  export const FEATURES = {};
`);
write("src/lib/zi/studentContext.server.js", `
  export const getZiStudentContext = async () => ({ profile: { exam: "JEE Main" } });
  export const formatZiStudentContext = () => "Synthetic JEE Main";
`);
write("src/lib/supabaseAdmin.js", `
  export const supabaseAdmin = {
    from(table) {
      if (!["test_sessions", "institute_test_attempts", "zi_generated_sessions", "zi_memories"].includes(table)) {
        throw Error("Unexpected Classroom fixture query");
      }
      const query = {
        select: () => query, eq: () => query, or: () => query, is: () => query,
        order: () => query, limit: () => query,
        then: (resolve) => resolve({ data: [], error: null }),
      };
      return query;
    },
  };
`);
write("src/lib/supabase.js", `
  export const supabase = { from() { throw Error("Unexpected public question query"); } };
`);
write("src/lib/zi/provider.js", `
  import { setTimeout as delay } from "node:timers/promises";
  export const getZiGenerationQuotaStatus = () => ({ blocked: false });
  export async function streamZiResponse({ beforeDispatch, signal }) {
    await beforeDispatch();
    return (async function* () {
      yield { text: "Mock Zi: Let’s start with the components. " };
      await delay(700, undefined, { signal });
      yield { text: 'The horizontal velocity stays constant. __ZI_VALIDATED_ACTION__={"type":"reset_preferences"}',
        candidates: [{ finishReason: "STOP" }] };
    })();
  }
`);
write("src/app/api/zi/preferences/route.js", `
  export function GET() {
    return Response.json({ key: "preferred_language", value: null });
  }
`);

write("network.cjs", `
  const net = require("node:net"), tls = require("node:tls");
  const loopback = new Set(["localhost", "127.0.0.1", "::1"]);
  const deny = () => { throw Error("CLASSROOM_EXTERNAL_NETWORK_DENIED"); };
  const connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    const [first, second] = Array.isArray(args[0]) ? args[0] : args;
    const host = typeof first === "object" ? first.host : second;
    if ((typeof first === "object" && first.path) || !loopback.has(host || "localhost")) deny();
    return connect.apply(this, args);
  };
  tls.connect = deny;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input, options) => {
    const url = new URL(input.url || input);
    if (url.protocol !== "http:" || !loopback.has(url.hostname)) deny();
    return originalFetch(input, { ...options, redirect: "error" });
  };
  require("node:module").syncBuiltinESMExports();
`);

const env = {
  PATH: `${dirname(process.execPath)}:/usr/bin:/bin`,
  TMPDIR: tmpdir(),
  HOME: dir,
  NEXT_TELEMETRY_DISABLED: "1",
  ZI_CLASSROOM_FIXTURES: disabled ? "0" : "1",
  ZI_CLASSROOM_SELECTION: disabled ? "0" : "1",
  NODE_OPTIONS: `--require=${join(dir, "network.cjs")}`,
};
const next = (...args) => spawn(process.execPath, [join(dir, "node_modules/next/dist/bin/next"), ...args], {
  cwd: dir,
  stdio: "inherit",
  env,
});

console.log(`Isolated fixture copy: ${dir}`);
if (production) {
  const [code] = await once(next("build", "--webpack"), "exit");
  if (code !== 0) process.exit(code ?? 1);
}
const origin = `http://127.0.0.1:${port}`;
const child = next(...(production ? ["start"] : ["dev", "--webpack"]), "--hostname", "127.0.0.1", "--port", String(port));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
if (!runTests) {
  console.log(`Open ${origin}/dashboard and launch Zi.`);
  const [code, signal] = await once(child, "exit");
  process.exitCode = code ?? (signal === "SIGINT" ? 0 : 1);
} else {
  try {
    const deadline = Date.now() + 90000;
    for (;;) {
      if (child.exitCode !== null || Date.now() >= deadline) throw Error("The local fixture server did not start");
      const response = await fetch(origin + "/dashboard", { signal: AbortSignal.timeout(60000) }).catch(() => null);
      if (response?.ok) {
        await response.body.cancel();
        break;
      }
      await response?.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    const args = [join(root, "scripts/zi-classroom/browser.mjs")];
    if (production || disabled) args.push("--disabled");
    const [code] = await once(spawn(process.execPath, args, {
      stdio: "inherit",
      env: {
        ...env,
        ZI_BROWSER_PLAYWRIGHT: process.env.ZI_BROWSER_PLAYWRIGHT,
        ZI_BROWSER_CHROMIUM: process.env.ZI_BROWSER_CHROMIUM,
        ZI_BROWSER_EVIDENCE: dir,
      },
    }), "exit");
    process.exitCode = code ?? 1;
  } finally {
    child.kill("SIGTERM");
  }
}
