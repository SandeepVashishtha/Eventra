export async function isStorageQuotaAvailable(bytesNeeded = 50000) {
  if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.estimate) {
    return true; // assume available if storage API not supported
  }
  try {
    const estimate = await navigator.storage.estimate();
    const available = estimate.quota - estimate.usage;
    return available >= bytesNeeded;
  } catch {
    return true;
  }
}
