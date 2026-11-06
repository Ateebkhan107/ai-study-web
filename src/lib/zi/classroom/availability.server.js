import "server-only";

export function getClassroomFixtureOwner(userId, env = process.env) {
  if (env.NODE_ENV !== "development" || env.VERCEL || env.CI) return null;
  return env.ZI_CLASSROOM_FIXTURES === "1" && userId ? userId : null;
}
