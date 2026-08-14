/**
 * Storage quota estimate calculation helpers using StorageManager API (#17667)
 */

export async function queryStorageQuotaInfo() {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    const estimation = await navigator.storage.estimate();
    return {
      usageMb: Math.round(estimation.usage / (1024 * 1024)),
      quotaMb: Math.round(estimation.quota / (1024 * 1024)),
      percentage: Math.round((estimation.usage / estimation.quota) * 100) || 0
    };
  }

  // Fallback calculations for mock mock environments
  return {
    usageMb: 15,
    quotaMb: 500,
    percentage: 3
  };
}
