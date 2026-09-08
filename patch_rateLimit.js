import fs from 'fs';
let code = fs.readFileSync('./src/lib/zi/rateLimit.js', 'utf8');

code = code.replace(
  'const ZI_RATE_LIMIT = {\n  count: 20,\n  windowMs: 60 * 1000,\n};',
  'const ZI_RATE_LIMIT = {\n  FREE: { count: 0, windowMs: 60 * 1000 },\n  PRO: { count: 50, windowMs: 60 * 1000 },\n  AI_MODE: { count: 200, windowMs: 60 * 1000 },\n};'
);

code = code.replace(
  'export function checkZiRateLimit(userId) {',
  'export function checkZiRateLimit(userId, plan = "FREE") {'
);

code = code.replace(
  'return { allowed: false, remaining: 0, resetMs: ZI_RATE_LIMIT.windowMs };',
  'return { allowed: false, remaining: 0, resetMs: 60 * 1000 };'
);

code = code.replace(
  'const windowStart = now - ZI_RATE_LIMIT.windowMs;',
  'const limit = ZI_RATE_LIMIT[plan] || ZI_RATE_LIMIT.FREE;\n  const windowStart = now - limit.windowMs;'
);

code = code.replace(
  'const allowed = activeHits.length < ZI_RATE_LIMIT.count;',
  'const allowed = activeHits.length < limit.count;'
);

code = code.replace(
  'return {\n    allowed,\n    remaining: Math.max(0, ZI_RATE_LIMIT.count - activeHits.length),\n    resetMs: Math.max(0, oldestHit + ZI_RATE_LIMIT.windowMs - now),\n  };',
  'return {\n    allowed,\n    remaining: Math.max(0, limit.count - activeHits.length),\n    resetMs: Math.max(0, oldestHit + limit.windowMs - now),\n  };'
);

fs.writeFileSync('./src/lib/zi/rateLimit.js', code);
