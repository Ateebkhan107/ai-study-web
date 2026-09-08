import fs from 'fs';
let code = fs.readFileSync('./src/app/(dashboard)/layout.js', 'utf8');

code = code.replace(
  '<ZiLauncher isFreeUser={accessContext.plan === "FREE"} />',
  '<ZiLauncher plan={accessContext.plan} />'
);

fs.writeFileSync('./src/app/(dashboard)/layout.js', code);
