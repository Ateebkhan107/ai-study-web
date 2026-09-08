import fs from 'fs';
let code = fs.readFileSync('./src/components/zi/ZiPanel.jsx', 'utf8');

code = code.replace(
  'isLocked,',
  'isLocked,\n  plan,'
);

code = code.replace(
  '<ZiHeader',
  '<ZiHeader plan={plan}'
);

fs.writeFileSync('./src/components/zi/ZiPanel.jsx', code);
