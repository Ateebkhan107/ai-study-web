import fs from 'fs';

let code = fs.readFileSync('./src/app/api/zi/chat/route.js', 'utf8');
code = code.replace(
  'checkZiRateLimit(userId)',
  'checkZiRateLimit(userId, access.plan)'
);
fs.writeFileSync('./src/app/api/zi/chat/route.js', code);

code = fs.readFileSync('./src/app/api/zi/transcribe/route.js', 'utf8');
code = code.replace(
  'checkZiRateLimit(userId)',
  'checkZiRateLimit(userId, access.plan)'
);
fs.writeFileSync('./src/app/api/zi/transcribe/route.js', code);
