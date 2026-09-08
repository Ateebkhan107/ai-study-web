import "server-only";

const ZI_RATE_LIMIT = {
  FREE: { count: 0, windowMs: 60 * 1000 },
  PRO: { count: 50, windowMs: 60 * 1000 },
  AI_MODE: { count: 200, windowMs: 60 * 1000 },
};

const store = globalThis.__prepziiZiRateLimitStore || new Map();
globalThis.__prepziiZiRateLimitStore = store;

export function checkZiRateLimit(userId, plan = "FREE") {
  if (!userId) {
    return { allowed: false, remaining: 0, resetMs: 60 * 1000 };
  }

  const now = Date.now();
  const limit = ZI_RATE_LIMIT[plan] || ZI_RATE_LIMIT.FREE;
  const windowStart = now - limit.windowMs;
  const previousHits = store.get(userId) || [];
  const activeHits = previousHits.filter((timestamp) => timestamp > windowStart);
  const allowed = activeHits.length < limit.count;

  if (allowed) {
    activeHits.push(now);
    store.set(userId, activeHits);
  } else {
    store.set(userId, activeHits);
  }

  const oldestHit = activeHits[0] || now;
  return {
    allowed,
    remaining: Math.max(0, limit.count - activeHits.length),
    resetMs: Math.max(0, oldestHit + limit.windowMs - now),
  };
}

export { ZI_RATE_LIMIT };
