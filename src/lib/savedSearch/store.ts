const STORAGE_KEY = "hrtaj:savedSearches:v1";

export type SavedSearch = {
  id: string;
  name: string;
  queryString: string;
  createdAt: string;
  lastRunAt?: string;
};

let cache: SavedSearch[] | null = null;
const listeners = new Set<(items: SavedSearch[]) => void>();

function readStorage(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && typeof item.queryString === "string");
  } catch {
    return [];
  }
}

function writeStorage(items: SavedSearch[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function emit(items: SavedSearch[]) {
  listeners.forEach((listener) => listener(items));
}

export function getSavedSearches(): SavedSearch[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function setSavedSearches(next: SavedSearch[]) {
  cache = next;
  writeStorage(next);
  emit(next);
  return next;
}

export function addSavedSearch(item: SavedSearch) {
  const current = getSavedSearches();
  const next = [item, ...current].slice(0, 100);
  return setSavedSearches(next);
}

export function removeSavedSearch(id: string) {
  const next = getSavedSearches().filter((item) => item.id !== id);
  return setSavedSearches(next);
}

export function markSearchRun(id: string) {
  const next = getSavedSearches().map((item) =>
    item.id === id ? { ...item, lastRunAt: new Date().toISOString() } : item
  );
  return setSavedSearches(next);
}

export function subscribeSavedSearches(listener: (items: SavedSearch[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const SAVED_SEARCH_STORAGE_KEY = STORAGE_KEY;
