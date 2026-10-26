// No public activation: an explicit, server-side pilot allowlist is mandatory.
export function generationPilotAllowed(userId, env = process.env) {
  return Boolean(userId && env.ZI_GENERATION_PILOT_ENABLED === "true" &&
    env.ZI_GENERATED_TEST_ENGINE_ENABLED === "true" &&
    (env.ZI_GENERATION_PILOT_USERS || "").split(",").map((s) => s.trim()).filter(Boolean).includes(userId));
}
