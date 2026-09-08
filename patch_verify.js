import fs from 'fs';
let code = fs.readFileSync('./src/app/api/payment/verify/route.js', 'utf8');

code = code.replace(
  'const PLAN_DURATION = { monthly: 30, quarterly: 90, yearly: 365 };',
  'const PLAN_DURATION = { monthly: 30, quarterly: 90, yearly: 365, ai_mode: 30 };'
);
code = code.replace(
  'const PLAN_AMOUNT = { monthly: 49, quarterly: 129, yearly: 399 };',
  'const PLAN_AMOUNT = { monthly: 49, quarterly: 129, yearly: 399, ai_mode: 2000 };'
);
code = code.replace(
  'const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3 };',
  'const PLAN_RANK = { monthly: 1, quarterly: 2, yearly: 3, ai_mode: 4 };'
);

code = code.replace(
  /eq\("exam_track", orderTrack\)\n\s*\.maybeSingle\(\);/,
  'eq("exam_track", orderTrack)\n      .eq("plan", plan)\n      .maybeSingle();'
);

code = code.replace(
  /onConflict: "clerk_user_id,exam_track"/,
  'onConflict: "clerk_user_id,exam_track,plan"'
);

fs.writeFileSync('./src/app/api/payment/verify/route.js', code);
