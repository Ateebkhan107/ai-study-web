import fs from 'fs';
let code = fs.readFileSync('./src/app/pricing/page.jsx', 'utf8');

code = code.replace(
  'plan="ai_mode"\n            examTrack={examTrack}\n            popular={true}',
  'plan="ai_mode"\n            examTrack={examTrack}\n            isAiMode={true}'
);

fs.writeFileSync('./src/app/pricing/page.jsx', code);
