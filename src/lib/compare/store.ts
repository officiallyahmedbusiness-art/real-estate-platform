const STORAGE_KEY = "hrtaj:compare:v1";
const MAX_COMPARE = 4;

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

export function getCompareIds(): string[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function setCompareIds(next: string[]) {
  const unique = Array.from(new Set(next)).slice(0, MAX_COMPARE);
  cache = unique;
  writeStorage(unique);
  emit(unique);
  return unique;
}

export function toggleCompare(id: string) {
  const current = getCompareIds();
  const set = new Set(current);
  if (set.has(id)) {
    set.delete(id);
  } else {
    if (set.size >= MAX_COMPARE) {
      return Array.from(set);
    }
    set.add(id);
  }
  return setCompareIds(Array.from(set));
}

export function isCompared(id: string) {
  return getCompareIds().includes(id);
}

export function subscribeCompare(listener: (ids: string[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const COMPARE_STORAGE_KEY = STORAGE_KEY;
export const COMPARE_LIMIT = MAX_COMPARE;
