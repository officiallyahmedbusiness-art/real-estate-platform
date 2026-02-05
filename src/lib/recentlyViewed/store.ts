const STORAGE_KEY = "hrtaj:recentlyViewed:v1";
const MAX_ITEMS = 10;

let cache: string[] | null = null;
const listeners = new Set<(ids: string[]) => void>();

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function emit(ids: string[]) {
  listeners.forEach((listener) => listener(ids));
}

export function getRecentlyViewed(): string[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function addRecentlyViewed(id: string) {
  const current = getRecentlyViewed();
  const next = [id, ...current.filter((item) => item !== id)].slice(0, MAX_ITEMS);
  cache = next;
  writeStorage(next);
  emit(next);
  return next;
}

export function subscribeRecentlyViewed(listener: (ids: string[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const RECENTLY_VIEWED_STORAGE_KEY = STORAGE_KEY;
