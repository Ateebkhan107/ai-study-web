export const FEATURES = new Proxy({}, { get: (_, key) => key });
export async function getUserAccessContext({ userId }) {
  return { userId, examTrack: "JEE", proTracks: [], plan: "AI_MODE", isAiMode: true, isPro: true, ziFreeUsage: { remaining: 3, used: 0, limit: 3 } };
}
export function canUseFeature() { return true; }
export async function incrementZiFreePromptsUsage() { throw Error("Builder must not charge tutor prompts"); }
export function normalizeExamTrack() { return "JEE"; }
export async function getProfileAccessProfile() { return { exam: "JEE" }; }
