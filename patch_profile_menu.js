import fs from 'fs';
let code = fs.readFileSync('./src/components/ProfileMenu.jsx', 'utf8');

code = code.replace(
  'export default function ProfileMenu() {',
  'export default function ProfileMenu({ plan }) {'
);

const badgeJsx = `
  const renderBadge = () => {
    if (!plan || plan === "FREE") return null;

    const isAiMode = plan === "AI_MODE";
    return (
      <span
        className={\`absolute -bottom-1 -right-4 md:-right-6 z-10 flex h-4 items-center justify-center whitespace-nowrap rounded-full px-1.5 text-[8px] sm:text-[9px] font-black tracking-wider shadow-sm backdrop-blur-md \${
          isAiMode
            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-yellow-500/30"
            : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/20"
        }\`}
      >
        {isAiMode ? "AI MODE" : "PRO"}
      </span>
    );
  };
`;

code = code.replace(
  '  return (',
  badgeJsx + '\n  return (\n    <div className="relative inline-flex items-center">'
);

code = code.replace(
  '    </div>\n  );\n}',
  '    </div>\n      {renderBadge()}\n    </div>\n  );\n}'
);

fs.writeFileSync('./src/components/ProfileMenu.jsx', code);
