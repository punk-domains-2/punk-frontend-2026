const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export function cacheGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T, ttl = DEFAULT_TTL): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { value, expiry: Date.now() + ttl };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable
  }
}

export function cacheRemove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function buildCacheKey(...parts: (string | number)[]): string {
  return parts.join("-");
}

export function getUserDomainsKey(address: string): string {
  return `punk-domains-${address.toLowerCase()}`;
}

export function getPreferredDomainKey(address: string, chainId: number): string {
  return `punk-preferred-${address.toLowerCase()}-${chainId}`;
}
