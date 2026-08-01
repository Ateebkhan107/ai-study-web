const responseCache = new Map();
const inflightRequests = new Map();

export async function fetchJsonCached(url, options = {}) {
  const {
    ttlMs = 0,
    key = url,
    fetchOptions,
  } = options;

  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  if (inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }

  const request = fetch(url, fetchOptions)
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      if (ttlMs > 0) {
        responseCache.set(key, {
          data,
          expiresAt: Date.now() + ttlMs,
        });
      }

      return data;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, request);
  return request;
}

export function invalidateFetchCache(match) {
  if (!match) {
    responseCache.clear();
    inflightRequests.clear();
    return;
  }

  const predicate =
    typeof match === "function"
      ? match
      : (key) => String(key).includes(String(match));

  [...responseCache.keys()].forEach((key) => {
    if (predicate(key)) responseCache.delete(key);
  });

  [...inflightRequests.keys()].forEach((key) => {
    if (predicate(key)) inflightRequests.delete(key);
  });
}
