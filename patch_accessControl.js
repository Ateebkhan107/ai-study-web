import fs from 'fs';
let code = fs.readFileSync('./src/lib/accessControl.js', 'utf8');

const newFunc = `
export async function getActiveSubscriptionsForUser(userId, examTrack) {
  if (!userId) return [];
  const normalizedTrack = examTrack ? normalizeExamTrack(examTrack) : null;
  let query = supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("status", "active");

  if (normalizedTrack) {
    query = query.eq("exam_track", normalizedTrack);
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === "42703" && normalizedTrack) {
      return [];
    }
    throw error;
  }
  return data || [];
}
`;

code = code.replace(
  'export async function getSubscriptionForUser(userId, examTrack) {',
  newFunc + '\nexport async function getSubscriptionForUser(userId, examTrack) {'
);

const userAccessContextRegex = /const subscription = await getSubscriptionForUser\(userId, activeExamTrack\);\n\s*const isPro = isSubscriptionActive\(subscription\);/;

const newAccessContext = `const subscriptions = await getActiveSubscriptionsForUser(userId, activeExamTrack);
  const activeSubs = subscriptions.filter(s => isSubscriptionActive(s));
  const aiModeSub = activeSubs.find(s => s.plan === "ai_mode");
  const isPro = activeSubs.length > 0;
  const isAiMode = !!aiModeSub;
  const subscription = activeSubs[0] || null;`; // keep \`subscription\` around for compatibility with any code inside getUserAccessContext

code = code.replace(userAccessContextRegex, newAccessContext);

const planRegex = /plan: isPro \? "PRO" : "FREE",/;
const newPlan = `plan: isAiMode ? "AI_MODE" : isPro ? "PRO" : "FREE",\n    isAiMode,`;

code = code.replace(planRegex, newPlan);

code = code.replace(
  '  [FEATURES.AI_EXPLANATION]: { plan: "PRO", label: "AI Explanation" },',
  '  [FEATURES.AI_EXPLANATION]: { plan: "PRO", label: "AI Explanation" },\n  ZI_ACCESS: { plan: "PRO", label: "Zi AI Companion" },\n  ZI_PREMIUM: { plan: "AI_MODE", label: "Premium AI Usage" },'
);
// Also need to add ZI_ACCESS to FEATURES object!
code = code.replace(
  '  AI_EXPLANATION: "AI_EXPLANATION",',
  '  AI_EXPLANATION: "AI_EXPLANATION",\n  ZI_ACCESS: "ZI_ACCESS",\n  ZI_PREMIUM: "ZI_PREMIUM",'
);

// We need to support AI_MODE in canUseFeature
const proRequiredRegex = /if \(rule\.plan === "PRO"\) \{\n\s*return access\?\.isPro\n\s*\? \{ allowed: true \}\n\s*: \{ allowed: false, reason: "PRO_REQUIRED", upgradeUrl: "\/pro" \};\n\s*\}/;

const aiModeCheck = `if (rule.plan === "PRO") {
    return access?.isPro
      ? { allowed: true }
      : { allowed: false, reason: "PRO_REQUIRED", upgradeUrl: "/pro" };
  }
  if (rule.plan === "AI_MODE") {
    return access?.isAiMode
      ? { allowed: true }
      : { allowed: false, reason: "AI_MODE_REQUIRED", upgradeUrl: "/pro" };
  }`;

code = code.replace(proRequiredRegex, aiModeCheck);

fs.writeFileSync('./src/lib/accessControl.js', code);
