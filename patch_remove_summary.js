import fs from 'fs';
let code = fs.readFileSync('./src/components/profile/ProfilePageClient.jsx', 'utf8');

const regex = /<div className="rounded-xl sm:rounded-2xl border border-slate-200\/80 bg-\[var\(--card\)\] p-4 sm:p-6 shadow-sm dark:border-\[var\(--border\)\]\/70 dark:bg-\[var\(--surface\)\] relative overflow-hidden">[\s\S]*?Student Summary[\s\S]*?<\/div>/;

if (regex.test(code)) {
  code = code.replace(regex, '');
  fs.writeFileSync('./src/components/profile/ProfilePageClient.jsx', code);
  console.log("Successfully removed Student Summary.");
} else {
  console.log("Could not find Student Summary block.");
}
