import fs from 'fs';
let code = fs.readFileSync('./src/components/zi/ZiPanel.jsx', 'utf8');

code = code.replace(
  'export default function ZiPanel({',
  'import { Lock } from "lucide-react";\nimport Link from "next/link";\n\nexport default function ZiPanel({'
);

code = code.replace(
  'onSuggestionSelect,',
  'onSuggestionSelect,\n  isLocked,'
);

const lockedUI = `
  if (isLocked) {
    return (
      <div
        className={\`fixed inset-0 z-[65] pointer-events-none transition-[visibility] \${
          isOpen ? "" : "invisible"
        }\`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          className={\`absolute inset-0 z-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none \${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }\`}
          onClick={onClose}
          aria-label="Close Zi"
          tabIndex={-1}
        />
        <div
          className={\`absolute inset-x-2 bottom-3 top-2 z-10 mx-auto flex w-auto max-w-[28rem] flex-col overflow-hidden rounded-[2rem] border border-brand/20 bg-slate-50 shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:border-brand/10 dark:bg-slate-950 sm:inset-auto sm:bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:right-6 sm:top-20 sm:w-[30rem] sm:max-w-none \${panelTransformClass}\`}
        >
          <div className="flex h-full flex-col items-center justify-center p-8 text-center pointer-events-auto">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Lock className="h-10 w-10" strokeWidth={2} />
            </div>
            <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Zi
            </h2>
            <p className="mb-8 text-[0.95rem] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
              Your personal AI study companion.
              <br />
              Available with PrepZii Pro.
            </p>
            <Link
              href="/pricing"
              onClick={onClose}
              className="inline-flex h-12 w-full max-w-[200px] items-center justify-center rounded-xl bg-brand px-6 font-display text-lg font-bold text-white shadow-lg shadow-brand/25 transition-all hover:scale-105 active:scale-95"
            >
              Explore Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }
`;

code = code.replace(
  'const panelTransformClass =',
  lockedUI + '\n  const panelTransformClass ='
);

fs.writeFileSync('./src/components/zi/ZiPanel.jsx', code);
