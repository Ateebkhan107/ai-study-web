import fs from 'fs';
let code = fs.readFileSync('./src/app/api/payment/create-order/route.js', 'utf8');

code = code.replace(
  '  yearly: {\n    amount: 399,\n    duration: 365,\n  },\n};',
  '  yearly: {\n    amount: 399,\n    duration: 365,\n  },\n  ai_mode: {\n    amount: 2000,\n    duration: 30,\n  },\n};'
);

code = code.replace(
  'const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3 };',
  'const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3, ai_mode: 4 };'
);

code = code.replace(
  /eq\("exam_track", normalizedTrack\)\n\s*\.maybeSingle\(\);/,
  'eq("exam_track", normalizedTrack)\n      .eq("plan", plan)\n      .maybeSingle();'
);

fs.writeFileSync('./src/app/api/payment/create-order/route.js', code);
