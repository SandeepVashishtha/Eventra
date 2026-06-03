## Target
**File:** `src/utils/offlineQueue.js` (lines 436-443)
**Category:** Performance | **Level:** Intermediate

## The Vulnerability
The `setQueue()` function clears the store and then iterates over `newQueue` with `forEach`, calling `store.put(item)` for each item with individual `onsuccess` callbacks. This creates N+1 serialized IndexedDB operations (1 clear + N puts) where a batch approach could do it in 2 operations (clear + one transaction).

```js
newQueue.forEach((item) => {
  const putReq = store.put(item);
  putReq.onsuccess = () => {
    completed++;
    if (completed === newQueue.length) resolve();
  };
  putReq.onerror = () => reject(putReq.error);
});
```

## The Impact
When the offline queue grows (up to 15 items), `setQueue` fires 16 sequential IndexedDB round-trips instead of 2. IndexedDB transactions are already atomic — all operations within a transaction commit together — so the per-item callback pattern buys nothing except latency. On slow mobile storage (common for PWAs), this makes queue processing noticeably slower, increasing time-to-interactive after coming back online.

## Suggested Fix
Replace the `forEach` + per-item `onsuccess` pattern with resolving on the transaction's `complete` event after calling `store.put()` for all items synchronously within the transaction.
