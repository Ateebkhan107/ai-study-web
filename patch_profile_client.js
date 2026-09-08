import fs from 'fs';
let code = fs.readFileSync('./src/components/profile/ProfilePageClient.jsx', 'utf8');

code = code.replace(
  'export default function ProfilePageClient({ initialProfile = null }) {',
  'export default function ProfilePageClient({ initialProfile = null, plan = "FREE" }) {'
);

const currentPlanJsx = `
          {/* ── CURRENT PLAN ── */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-[var(--border)]/70 dark:bg-[var(--surface)]">
            <h3 className="text-sm sm:text-lg font-black font-display text-slate-950 dark:text-white tracking-tight">Current Plan</h3>
            <div className="mt-3 sm:mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={\`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl shadow-sm \${
                  plan === "AI_MODE" 
                    ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 shadow-yellow-500/20"
                    : plan === "PRO"
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-orange-500/20"
                    : "bg-slate-100 text-slate-500 dark:bg-[var(--surface-elevated)] dark:text-slate-400 border border-slate-200 dark:border-[var(--border-subtle)]"
                }\`}>
                  <Compass className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Active Subscription
                  </p>
                  <p className="font-display text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {plan === "AI_MODE" ? "AI MODE" : plan === "PRO" ? "PRO" : "Free"}
                  </p>
                </div>
              </div>
            </div>
            
            {(!plan || plan === "FREE") && (
              <a
                href="/pro"
                className="mt-4 sm:mt-5 flex w-full items-center justify-center rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
              >
                Upgrade to Pro
              </a>
            )}
            
            {plan === "PRO" && (
              <a
                href="/pricing"
                className="mt-4 sm:mt-5 flex w-full items-center justify-center rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
              >
                Upgrade to AI Mode
              </a>
            )}
          </div>
`;

code = code.replace(
  '{/* ── ACTIONS SIDEBAR ── */}',
  currentPlanJsx + '\n\n        {/* ── ACTIONS SIDEBAR ── */}'
);

fs.writeFileSync('./src/components/profile/ProfilePageClient.jsx', code);
