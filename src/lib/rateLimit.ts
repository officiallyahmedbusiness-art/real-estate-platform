import "server-only";

type RateLimitState = {
  count: number;
  resetAt: number;
};

type Store = Map<string, RateLimitState>;

function getStore(): Store {
  const globalAny = globalThis as typeof globalThis & {
    __hrtajRateLimitStore?: Store;
  };
  if (!globalAny.__hrtajRateLimitStore) {
    globalAny.__hrtajRateLimitStore = new Map();
  }
  return globalAny.__hrtajRateLimitStore;
}

export function checkRateLimit(key: string, limit = 5, windowMs = 60_000) {
  const store = getStore();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    const next = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { allowed: true, remaining: limit - 1, retryAfterMs: windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  store.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, retryAfterMs: existing.resetAt - now };
}
