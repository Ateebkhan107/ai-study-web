import fs from 'fs';
let code = fs.readFileSync('./src/app/(dashboard)/profile/page.js', 'utf8');

if (!code.includes('getUserAccessContext')) {
  code = code.replace(
    'import { getProfilePageData } from "@/services/profile.server";',
    'import { getProfilePageData } from "@/services/profile.server";\nimport { getUserAccessContext } from "@/lib/accessControl";'
  );

  code = code.replace(
    'const profile = userId ? await getProfilePageData(userId, sessionClaims) : null;',
    'const profile = userId ? await getProfilePageData(userId, sessionClaims) : null;\n  const accessContext = userId ? await getUserAccessContext({ userId }) : {};'
  );

  code = code.replace(
    '<ProfilePageClient initialProfile={profile} />',
    '<ProfilePageClient initialProfile={profile} plan={accessContext.plan} />'
  );

  fs.writeFileSync('./src/app/(dashboard)/profile/page.js', code);
}
