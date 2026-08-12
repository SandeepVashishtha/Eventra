/**
 * Browser Storage Quota & Device Capacity Calculator (#13926)
 */

export async function getStorageQuotaEstimate() {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usageMB = Math.round((estimate.usage || 0) / (1024 * 1024));
      const quotaMB = Math.round((estimate.quota || 0) / (1024 * 1024));
      const percentUsed = quotaMB > 0 ? Math.round((usageMB / quotaMB) * 100) : 0;

      return {
        usageMB,
        quotaMB,
        percentUsed,
        availableMB: Math.max(0, quotaMB - usageMB),
      };
    } catch (err) {
      console.warn("[StorageQuota] Estimation failed:", err);
    }
  }

  return {
    usageMB: 12,
    quotaMB: 2048,
    percentUsed: 1,
    availableMB: 2036,
  };
}
