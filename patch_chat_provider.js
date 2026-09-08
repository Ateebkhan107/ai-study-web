import fs from 'fs';
let code = fs.readFileSync('./src/app/api/zi/chat/route.js', 'utf8');

code = code.replace(
  'const stream = await streamZiResponse({\n        messages,\n        systemPrompt,\n        signal: request.signal,\n      });',
  'const stream = await streamZiResponse({\n        messages,\n        systemPrompt,\n        signal: request.signal,\n        accessContext: access,\n      });'
);

fs.writeFileSync('./src/app/api/zi/chat/route.js', code);
