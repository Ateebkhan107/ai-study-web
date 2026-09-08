import fs from 'fs';
let code = fs.readFileSync('./src/app/(dashboard)/layout.js', 'utf8');

if (!code.includes('getUserAccessContext')) {
  code = code.replace(
    'import { getActiveInstituteMemberships } from "@/lib/accessControl";',
    'import { getActiveInstituteMemberships, getUserAccessContext } from "@/lib/accessControl";'
  );

  code = code.replace(
    '  const [memberships] = await Promise.all([',
    '  const [memberships, accessContext] = await Promise.all([\n'
  );
  code = code.replace(
    '    getActiveInstituteMemberships(userId, email),',
    '    getActiveInstituteMemberships(userId, email),\n    getUserAccessContext({ userId, email }),'
  );
  code = code.replace(
    '<ZiLauncher />',
    '<ZiLauncher isFreeUser={accessContext.plan === "FREE"} />'
  );
  fs.writeFileSync('./src/app/(dashboard)/layout.js', code);
}
