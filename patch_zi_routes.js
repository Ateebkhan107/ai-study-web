import fs from 'fs';
const routes = [
  './src/app/api/zi/transcribe/route.js',
  './src/app/api/zi/preferences/route.js',
  './src/app/api/zi/memories/route.js',
];

for (const route of routes) {
  if (!fs.existsSync(route)) continue;
  let code = fs.readFileSync(route, 'utf8');

  // Skip if already patched
  if (code.includes('getUserAccessContext')) continue;

  code = code.replace(
    'import { NextResponse } from "next/server";',
    'import { NextResponse } from "next/server";\nimport { getUserAccessContext } from "@/lib/accessControl";'
  );

  code = code.replace(
    /if \(!userId\) \{\n\s*return (NextResponse\.json\(\{\s*error:\s*"Unauthorized"\s*\}, \{ status: 401 \}|jsonError\("Unauthorized", 401\));\n\s*\}/g,
    `if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const access = await getUserAccessContext({ userId });
    if (access.plan === "FREE") {
      return NextResponse.json({ error: "ZI_PRO_REQUIRED" }, { status: 403 });
    }`
  );

  // In preferences route, jsonError might be used
  code = code.replace(
    /if \(!userId\) \{\n\s*return jsonError\("Unauthorized", 401\);\n\s*\}/g,
    `if (!userId) {
      return jsonError("Unauthorized", 401);
    }
    const access = await getUserAccessContext({ userId });
    if (access.plan === "FREE") {
      return jsonError("ZI_PRO_REQUIRED", 403);
    }`
  );

  fs.writeFileSync(route, code);
}
