/**
 * Merge a list of incoming notifications into the existing inbox.
 *
 * Deduplicates by id (the incoming item wins for a matching id) and sorts
 * the result newest-first by timestamp. Pure helper so the merge semantics
 * used by the realtime ingest path can be unit tested in isolation.
 *
 * @param {Array} existing - Currently held notifications (normalized).
 * @param {Array} incoming - Newly received notifications (normalized).
 * @returns {Array} Merged list, deduped and sorted newest-first.
 */
export const mergeNotificationLists = (existing = [], incoming = []) => {
  const merged = new Map(existing.map((n) => [n?.id, n]));
  incoming.forEach((n) => {
    if (n?.id) merged.set(n.id, n);
  });
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b?.timestamp) - new Date(a?.timestamp),
  );
};
