/**
 * Cache Storage Manager with LRU Eviction & Video Exclusions (#14087)
 */

const MAX_CACHE_ENTRIES = 100;
const EXCLUDED_EXTENSIONS = [".mp4", ".webm", ".avi", ".mov"];

export function shouldCacheAsset(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    
    // Exclude large video assets from being cached to prevent QuotaExceededError
    return !EXCLUDED_EXTENSIONS.some((ext) => pathname.endsWith(ext));
  } catch {
    return true;
  }
}

export async function requestPersistentStorage() {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.persist) {
    try {
      const persisted = await navigator.storage.persist();
      return persisted;
    } catch (err) {
      console.warn("[CacheManager] Storage persist request failed:", err);
    }
  }
  return false;
}

export async function pruneLruCache(cacheName, maxEntries = MAX_CACHE_ENTRIES) {
  if (typeof caches === "undefined") return 0;

  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= maxEntries) {
      return 0;
    }

    // Sort or chunk keys to delete oldest entries (simulated simple LRU by order of keys array)
    const entriesToDelete = keys.slice(0, keys.length - maxEntries);
    let deletedCount = 0;

    for (const request of entriesToDelete) {
      const success = await cache.delete(request);
      if (success) deletedCount++;
    }

    return deletedCount;
  } catch (err) {
    console.error("[CacheManager] Error pruning cache:", err);
    return 0;
  }
}
