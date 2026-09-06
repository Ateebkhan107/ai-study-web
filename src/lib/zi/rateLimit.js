import "server-only";

const ZI_RATE_LIMIT = {
  count: 20,
  windowMs: 60 * 1000,
};

const store = globalThis.__prepziiZiRateLimitStore || new Map();
globalThis.__prepziiZiRateLimitStore = store;

export function checkZiRateLimit(userId) {
  if (!userId) {
    return { allowed: false, remaining: 0, resetMs: ZI_RATE_LIMIT.windowMs };
  }

  const now = Date.now();
  const windowStart = now - ZI_RATE_LIMIT.windowMs;
  const previousHits = store.get(userId) || [];
  const activeHits = previousHits.filter((timestamp) => timestamp > windowStart);
  const allowed = activeHits.length < ZI_RATE_LIMIT.count;

  if (allowed) {
    activeHits.push(now);
    store.set(userId, activeHits);
  } else {
    store.set(userId, activeHits);
  }

  const oldestHit = activeHits[0] || now;
  return {
    allowed,
    remaining: Math.max(0, ZI_RATE_LIMIT.count - activeHits.length),
    resetMs: Math.max(0, oldestHit + ZI_RATE_LIMIT.windowMs - now),
  };
}

export { ZI_RATE_LIMIT };
