import fs from 'fs';

for (const path of ['./src/app/api/zi/preferences/route.js', './src/app/api/zi/memories/route.js']) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(
    /if \(\!userId\) \{\n\s*return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\n\s*\}/g,
    `if (!userId) {\n      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });\n    }\n\n    const access = await getUserAccessContext({ userId });\n    if (access.plan === "FREE") {\n      return NextResponse.json({ error: "ZI_PRO_REQUIRED" }, { status: 403 });\n    }`
  );
  fs.writeFileSync(path, content);
}
