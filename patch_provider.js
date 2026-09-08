import fs from 'fs';
let code = fs.readFileSync('./src/lib/zi/provider.js', 'utf8');

code = code.replace(
  'const DEFAULT_MODEL = "gemini-3.6-flash";',
  'const DEFAULT_MODEL_PRO = "gemini-3.6-flash";\nconst DEFAULT_MODEL_AI_MODE = "gemini-3.6-pro"; // Ready for premium model'
);

code = code.replace(
  'export async function streamZiResponse({\n  messages,\n  systemPrompt,\n  signal,\n}) {',
  'export async function streamZiResponse({\n  messages,\n  systemPrompt,\n  signal,\n  accessContext,\n}) {\n  const isAiMode = accessContext?.isAiMode || false;\n'
);

code = code.replace(
  'const modelName = process.env.ZI_AI_MODEL || DEFAULT_MODEL;',
  'const modelName = process.env.ZI_AI_MODEL || (isAiMode ? DEFAULT_MODEL_AI_MODE : DEFAULT_MODEL_PRO);'
);

fs.writeFileSync('./src/lib/zi/provider.js', code);
