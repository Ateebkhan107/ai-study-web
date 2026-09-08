import fs from 'fs';
let code = fs.readFileSync('./src/components/profile/ProfilePageClient.jsx', 'utf8');

// Find the CURRENT PLAN block
const currentPlanRegex = /\{\/\* ── CURRENT PLAN ── \*\/\}([\s\S]*?)<\/div>\s*\{\/\* ── ACTIONS SIDEBAR ── \*\/\}/;
const match = code.match(currentPlanRegex);

if (match) {
  const currentPlanCode = match[0].replace(/\s*\{\/\* ── ACTIONS SIDEBAR ── \*\/\}/, '');
  
  // Remove the old block from where it is
  code = code.replace(currentPlanCode, '');
  
  // Insert it inside the aside
  code = code.replace(
    '<aside className="space-y-4 sm:space-y-5 animate-slideUp" style={{ animationDelay: "200ms" }}>',
    '<aside className="space-y-4 sm:space-y-5 animate-slideUp" style={{ animationDelay: "200ms" }}>\n          ' + currentPlanCode + '\n'
  );
  
  fs.writeFileSync('./src/components/profile/ProfilePageClient.jsx', code);
  console.log("Successfully moved CURRENT PLAN inside ACTIONS SIDEBAR.");
} else {
  console.log("Regex match failed.");
}
