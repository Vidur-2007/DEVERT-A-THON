// Server in-memory LRU, max 100 entries, keyed by sha256 of normalised text (+lang for
// translate/explain). See SPEC.md Section 7.5. Resets on redeploy/restart -- that's fine,
// it exists to dodge duplicate LLM calls within one server lifetime, not to persist.

const MAX_ENTRIES = 100;

// Map preserves insertion order; re-inserting a key on read/write moves it to the end,
// which is exactly the recency order an LRU needs.
const store = new Map<string, unknown>();

export function cacheGet<T>(key: string): T | undefined {
  if (!store.has(key)) return undefined;
  const value = store.get(key) as T;
  store.delete(key);
  store.set(key, value);
  return value;
}

export function cacheSet<T>(key: string, value: T): void {
  store.delete(key);
  store.set(key, value);
  if (store.size > MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
}
