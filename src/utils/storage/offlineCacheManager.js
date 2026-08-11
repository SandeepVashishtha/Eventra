/**
 * Offline Media & Event Pack Cache Manager (#13926)
 * Manages CacheStorage & LocalStorage for offline event schedules, venue maps, and speaker slides.
 */

const OFFLINE_PACKS_KEY = "eventra_offline_packs";
const CACHE_NAME = "eventra-offline-media-v1";

export function getDownloadedOfflinePacks() {
  try {
    const raw = localStorage.getItem(OFFLINE_PACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isEventDownloadedOffline(eventId) {
  const packs = getDownloadedOfflinePacks();
  return packs.some((p) => p.eventId === eventId);
}

export async function downloadEventPackForOffline(eventData, onProgress = () => {}) {
  if (!eventData || !eventData.id) return false;

  onProgress(25);
  // Cache JSON payload into LocalStorage
  const packs = getDownloadedOfflinePacks();
  const existingIdx = packs.findIndex((p) => p.eventId === eventData.id);

  const packEntry = {
    eventId: eventData.id,
    title: eventData.title || "Event Pack",
    downloadedAt: new Date().toISOString(),
    sizeMB: 3.5,
    eventData,
  };

  if (existingIdx >= 0) {
    packs[existingIdx] = packEntry;
  } else {
    packs.push(packEntry);
  }

  onProgress(60);

  // Pre-cache media assets into CacheStorage if available
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(CACHE_NAME);
      if (eventData.bannerImage) {
        await cache.add(eventData.bannerImage).catch(() => {});
      }
    } catch (e) {
      console.warn("[OfflineCacheManager] CacheStorage add error:", e);
    }
  }

  localStorage.setItem(OFFLINE_PACKS_KEY, JSON.stringify(packs));
  onProgress(100);
  return true;
}

export function deleteOfflinePack(eventId) {
  const packs = getDownloadedOfflinePacks().filter((p) => p.eventId !== eventId);
  localStorage.setItem(OFFLINE_PACKS_KEY, JSON.stringify(packs));
}

export function clearAllOfflinePacks() {
  localStorage.removeItem(OFFLINE_PACKS_KEY);
}
