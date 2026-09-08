import fs from 'fs';
let code = fs.readFileSync('./src/app/api/zi/memories/route.js', 'utf8');

code = code.replace(
  'if (!userId) return jsonError("Unauthorized", 401);',
  'if (!userId) return jsonError("Unauthorized", 401);\n    const access = await getUserAccessContext({ userId });\n    if (access.plan === "FREE") return jsonError("ZI_PRO_REQUIRED", 403);'
);

fs.writeFileSync('./src/app/api/zi/memories/route.js', code);
