import fs from 'fs';
let code = fs.readFileSync('./src/components/pricing/PricingCard.jsx', 'utf8');

code = code.replace(
  'examTrack = "JEE",',
  'examTrack = "JEE",\n  isAiMode = false,'
);

code = code.replace(
  'popular\n          ? "border-blue-600 bg-blue-50"\n          : "border-gray-200 bg-[var(--card)]"',
  'isAiMode\n          ? "border-[#c49a45] bg-[#fffcf3] dark:bg-[#1a1712]"\n          : popular\n          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"\n          : "border-gray-200 bg-[var(--card)]"'
);

code = code.replace(
  '{popular && (',
  '{isAiMode && (\n        <span className="absolute right-6 top-6 rounded-full bg-[#c49a45] px-3 py-1 text-xs font-semibold text-white shadow-sm">\n          Premium\n        </span>\n      )}\n      {popular && !isAiMode && ('
);

code = code.replace(
  '{examTrack} Pro',
  '{isAiMode ? `${examTrack} AI Mode` : `${examTrack} Pro`}'
);

code = code.replace(
  'Upgrade or renew ${examTrack} Pro',
  'Upgrade or renew ${isAiMode ? examTrack + " AI Mode" : examTrack + " Pro"}'
);

fs.writeFileSync('./src/components/pricing/PricingCard.jsx', code);
