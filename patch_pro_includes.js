import fs from 'fs';
let code = fs.readFileSync('./src/app/(dashboard)/pro/page.js', 'utf8');

code = code.replace(
  'Pro includes',
  '{selectedPlan === "ai_mode" ? "AI Mode includes" : "Pro includes"}'
);

fs.writeFileSync('./src/app/(dashboard)/pro/page.js', code);
