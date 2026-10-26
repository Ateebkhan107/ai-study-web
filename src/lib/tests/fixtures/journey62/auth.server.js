// Test substitute only. Never imported or selected by the real application's config.
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
export const actors = ["journey-student-a", "journey-student-b"];
export function signature(actor) { return createHmac("sha256", process.env.ZI_FIXTURE_SESSION_SECRET).update(actor).digest("hex"); }
export async function auth() {
  if (process.env.ZI_JOURNEY_FIXTURE !== "1") throw Error("Synthetic fixture not enabled");
  const value = (await cookies()).get("zi_synthetic_session")?.value || "";
  const [actor, signed] = value.split(".");
  const expected = actors.includes(actor) ? signature(actor) : "";
  const valid = expected && signed?.length === expected.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signed));
  return { userId: valid ? actor : null, sessionClaims: {} };
}
export async function currentUser() { throw Error("Unexpected hosted Clerk dependency in synthetic fixture"); }
export async function clerkClient() { throw Error("Unexpected hosted Clerk dependency in synthetic fixture"); }
