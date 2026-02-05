const STORAGE_KEY = "hrtaj:favorites:v1";
const MAX_FAVORITES = 200;

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
    // ignore storage errors
  }
}

function emit(ids: string[]) {
  listeners.forEach((listener) => listener(ids));
}

export function getFavorites(): string[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function setFavorites(next: string[]) {
  const unique = Array.from(new Set(next)).slice(0, MAX_FAVORITES);
  cache = unique;
  writeStorage(unique);
  emit(unique);
  return unique;
}

export function toggleFavorite(id: string) {
  const current = getFavorites();
  const set = new Set(current);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  return setFavorites(Array.from(set));
}

export function isFavorite(id: string) {
  return getFavorites().includes(id);
}

export function subscribeFavorites(listener: (ids: string[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const FAVORITES_STORAGE_KEY = STORAGE_KEY;
