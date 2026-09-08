import fs from 'fs';
let code = fs.readFileSync('./src/app/api/zi/chat/route.js', 'utf8');

code = code.replace(
  '    providerStream = await streamZiResponse({\n      messages: finalMessages,\n      systemPrompt: buildZiSystemPrompt(\n        parsed.data.pageContext?.pageType,\n        entityContext,\n        studentContext,\n        learningMemories\n      ),\n      signal: request.signal,\n    });',
  '    providerStream = await streamZiResponse({\n      messages: finalMessages,\n      systemPrompt: buildZiSystemPrompt(\n        parsed.data.pageContext?.pageType,\n        entityContext,\n        studentContext,\n        learningMemories\n      ),\n      signal: request.signal,\n      accessContext: access,\n    });'
);

fs.writeFileSync('./src/app/api/zi/chat/route.js', code);
