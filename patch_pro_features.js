import fs from 'fs';
let code = fs.readFileSync('./src/app/(dashboard)/pro/page.js', 'utf8');

const aiModeFeatures = `
const AI_MODE_FEATURES = [
  { text: "Everything included in Pro", hot: false },
  { text: "Full Zi AI companion", hot: true },
  { text: "Higher AI usage limits", hot: true },
  { text: "Voice interaction", hot: true },
  { text: "Visual explanations", hot: true },
  { text: "Personalized study memory", hot: true },
  { text: "Personalized study plans", hot: true },
];
`;

code = code.replace(
  'const PLANS = [',
  aiModeFeatures + '\nconst PLANS = ['
);

code = code.replace(
  '{PRO_FEATURES.map((f) => (',
  '{(selectedPlan === "ai_mode" ? AI_MODE_FEATURES : PRO_FEATURES).map((f) => ('
);

// We should also change the title: {selectedTrack} PRO
code = code.replace(
  '{selectedTrack} PRO',
  '{selectedTrack} {selectedPlan === "ai_mode" ? "AI MODE" : "PRO"}'
);

// And the card styling... the default PRO card is amber. Maybe AI mode can be slightly different, but the user said "Use the same matte/gold PrepZii design language". Amber is already the gold/matte PrepZii design language used in Pro. So we can just leave it as amber, or adjust it slightly. Amber is fine.

fs.writeFileSync('./src/app/(dashboard)/pro/page.js', code);
