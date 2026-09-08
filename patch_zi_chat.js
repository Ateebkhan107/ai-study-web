import fs from 'fs';
let code = fs.readFileSync('./src/app/api/zi/chat/route.js', 'utf8');

code = code.replace(
  'import { checkZiRateLimit } from "@/lib/zi/rateLimit";',
  'import { getUserAccessContext, canUseFeature } from "@/lib/accessControl";\nimport { checkZiRateLimit } from "@/lib/zi/rateLimit";'
);

code = code.replace(
  /if \(!userId\) \{\n\s*return jsonError\("Unauthorized", 401\);\n\s*\}/,
  `if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const access = await getUserAccessContext({ userId });
  if (access.plan === "FREE") {
    return jsonError("ZI_PRO_REQUIRED", 403);
  }`
);

fs.writeFileSync('./src/app/api/zi/chat/route.js', code);
