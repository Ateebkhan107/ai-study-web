import fs from 'fs';
let code = fs.readFileSync('./src/components/zi/ZiLauncher.jsx', 'utf8');

code = code.replace(
  'export default function ZiLauncher() {',
  'export default function ZiLauncher({ isFreeUser }) {'
);

const panelGating = `      <ZiPanel
        isOpen={isOpen}
        messages={messages}
        input={input}
        isThinking={isThinking}
        isGenerating={isGenerating}
        pageType={pageContext.pageType}
        entityType={pageContext.entity?.type}
        onClose={() => setIsOpen(false)}
        onInputChange={setInput}
        onSend={() => sendMessage(input)}
        onStop={stopGeneration}
        onSuggestionSelect={sendMessage}
        isLocked={isFreeUser}
      />`;

code = code.replace(
  /<ZiPanel[\s\S]*?\/>/,
  panelGating
);

fs.writeFileSync('./src/components/zi/ZiLauncher.jsx', code);
