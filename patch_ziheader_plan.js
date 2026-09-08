import fs from 'fs';
let code = fs.readFileSync('./src/components/zi/ZiHeader.jsx', 'utf8');

code = code.replace(
  'export default function ZiHeader({ onClose, assistantState = "idle" }) {',
  'export default function ZiHeader({ onClose, assistantState = "idle", plan }) {'
);

const planLabelLogic = `
  let labelText = "Core";
  let badgeClass = "border-brand/35 bg-brand/10 text-brand";

  if (plan === "AI_MODE") {
    labelText = "AI Mode";
    badgeClass = "border-amber-400/50 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-500 font-black shadow-[0_0_8px_rgba(251,191,36,0.25)]";
  } else if (plan === "PRO") {
    labelText = "Pro";
    badgeClass = "border-orange-400/40 bg-orange-500/10 text-orange-500 font-bold";
  }
`;

code = code.replace(
  '  const stateLabel = assistantState === "thinking" ? "thinking" : "idle";',
  '  const stateLabel = assistantState === "thinking" ? "thinking" : "idle";' + planLabelLogic
);

code = code.replace(
  '<span className="rounded-full border border-brand/35 bg-brand/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-brand">\n                Core\n              </span>',
  '<span className={`rounded-full border px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.16em] ${badgeClass}`}>\n                {labelText}\n              </span>'
);

fs.writeFileSync('./src/components/zi/ZiHeader.jsx', code);
