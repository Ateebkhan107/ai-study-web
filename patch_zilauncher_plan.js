import fs from 'fs';
let code = fs.readFileSync('./src/components/zi/ZiLauncher.jsx', 'utf8');

code = code.replace(
  'export default function ZiLauncher({ isFreeUser }) {',
  'export default function ZiLauncher({ plan }) {'
);

code = code.replace(
  'isLocked={isFreeUser}',
  'isLocked={!plan || plan === "FREE"}\n        plan={plan}'
);

fs.writeFileSync('./src/components/zi/ZiLauncher.jsx', code);
