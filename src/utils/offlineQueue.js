// ---------------------------------------------------------------------------
// Self-Healing Offline Queue Utility (IndexedDB backed with LocalStorage Backup)
// ---------------------------------------------------------------------------
import { safeJsonParse } from "./safeJsonParse.js";
import { logger } from "./logger.js";

const QUEUE_KEY = "eventra_offline_queue";
const DB_NAME = "eventra_offline_db";
const STORE_NAME = "actions_queue";

/**
 * DB_VERSION controls the IndexedDB schema version.
 *
 * CRITICAL — Issue #2744: Silent Data Loss on Schema Upgrades
 * ────────────────────────────────────────────────────────────
 * The previous implementation set DB_VERSION = 1 and the onupgradeneeded
 * handler would silently delete and recreate the object store whenever the
 * version was bumped during a schema change. Any items in the store at the
 * time of the upgrade were wiped without warning or recovery attempt.
 *
 * The new implementation:
 *  1. Detects whether the store already exists before touching it.
 *  2. On upgrade, reads all items out of the OLD store first.
 *  3. Deletes the old store (required by IndexedDB API when changing keyPath).
 *  4. Creates the new store with the updated schema.
 *  5. Re-inserts all rescued items into the new store.
 *  6. Reconciles with the localStorage mirror so neither source loses data.
 *  7. Dispatches a custom DOM event so the UI can show a warning toast.
 */
const DB_VERSION = 2;

// ---------------------------------------------------------------------------
// Internal: rescue items from localStorage mirror before schema wipe
// ---------------------------------------------------------------------------
const _rescueFromLocalStorage = () => {
  try {
          const raw = localStorage.getItem(QUEUE_KEY);
          return safeJsonParse(raw, []);
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// Internal: notify the UI that a schema upgrade occurred
// ---------------------------------------------------------------------------
const _dispatchUpgradeEvent = (rescuedCount) => {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(
      new CustomEvent("eventra-offline-queue-upgraded", {
        detail: {
          rescuedItems: rescuedCount,
          message:
            rescuedCount > 0
              ? `IndexedDB schema upgraded. ${rescuedCount} queued action(s) were safely migrated.`
              : "IndexedDB schema upgraded. No queued actions were affected.",
        },
      })
    );
  }
};

// ---------------------------------------------------------------------------
// Open Promise-based IndexedDB connection — with safe schema migration
// ---------------------------------------------------------------------------
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    /**
     * onupgradeneeded fires when:
     *  a) The database is opened for the first time (old version = 0).
     *  b) DB_VERSION is higher than the stored version (schema upgrade).
     *
     * FIX #2744: We now rescue existing items before any destructive
     * operation and re-insert them after the new schema is in place.
     */
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const oldVersion = e.oldVersion; // 0 on first open
      const transaction = e.target.transaction;

      // ── First-time setup (no existing data to rescue) ─────────────────────
      if (oldVersion === 0) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
        return;
      }

      // ── Schema upgrade path (oldVersion >= 1) ──────────────────────────────
      // Step 1: Rescue whatever is currently in the store BEFORE touching it.
      //         We also merge with the localStorage mirror to maximise recovery.
      let rescuedItems = [];
      const lsMirror = _rescueFromLocalStorage();

      if (db.objectStoreNames.contains(STORE_NAME)) {
        // Read all existing records synchronously inside the upgrade transaction
        const oldStore = transaction.objectStore(STORE_NAME);
        const getAllReq = oldStore.getAll();

        getAllReq.onsuccess = () => {
          const dbItems = getAllReq.result || [];

          // Merge DB items with localStorage mirror — deduplicate by item id
          const seen = new Set();
          rescuedItems = [...dbItems, ...lsMirror].filter((item) => {
            if (!item || !item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });

          // Step 2: Delete old store so we can recreate with updated schema
          db.deleteObjectStore(STORE_NAME);

          // Step 3: Create new store with updated schema
          db.createObjectStore(STORE_NAME, { keyPath: "id" });

          // Step 4: Re-insert rescued items into the new store
          // We must use the same upgrade transaction — it stays open until
          // the upgrade completes, so we can reuse it here.
          const newStore = transaction.objectStore(STORE_NAME);
          rescuedItems.forEach((item) => {
            newStore.put(item);
          });

          // Step 5: Update localStorage mirror to reflect rescued items
          try {
            if (rescuedItems.length > 0) {
              localStorage.setItem(QUEUE_KEY, JSON.stringify(rescuedItems));
            } else {
              localStorage.removeItem(QUEUE_KEY);
            }
          } catch {
            // localStorage might be full — non-fatal
          }

          // Step 6: Notify UI
          _dispatchUpgradeEvent(rescuedItems.length);
        };

        getAllReq.onerror = () => {
          // Couldn't read old store — fall back to localStorage mirror only
          db.deleteObjectStore(STORE_NAME);
          const newStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });

          lsMirror.forEach((item) => {
            newStore.put(item);
          });

          try {
            if (lsMirror.length > 0) {
              localStorage.setItem(QUEUE_KEY, JSON.stringify(lsMirror));
            }
          } catch {
            // non-fatal
          }

          _dispatchUpgradeEvent(lsMirror.length);
        };
      } else {
        // Store didn't exist yet — just create it
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);

    /**
     * onblocked fires when another tab still holds a connection to an older
     * version. We dispatch a custom event so the UI can prompt the user to
     * close other tabs.
     */
    request.onblocked = () => {
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(
          new CustomEvent("eventra-offline-db-blocked", {
            detail: {
              message:
                "Database upgrade is blocked by another open tab. Please close other Eventra tabs and refresh.",
            },
          })
        );
      }
    };
  });
};

/**
 * Read the current offline queue from localStorage (Synchronous fallback).
 */
export const getQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return safeJsonParse(raw, []);
  } catch (error) {
    logger.error("[OfflineQueue] Failed to parse offline queue:", error);
    return [];
  }
};

/**
 * Read the current offline queue from IndexedDB (Asynchronous core).
 */
export const getQueueIndexedDB = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    logger.warn("IndexedDB getQueue failed, falling back to localStorage:", err);
    return getQueue();
  }
};

/**
 * generateQueueId
 *
 * Generates a collision-free ID for a new offline queue item.
 *
 * Why the previous implementation was unreliable
 * ───────────────────────────────────────────────
 * The previous expression was:
 *
 *   Date.now() + Math.random().toString(36).substring(2, 7)
 *
 * This had two problems:
 *
 *  1. String coercion ambiguity: the result of Date.now() (a number) was
 *     concatenated with a string via implicit coercion. The expression worked
 *     by accident but is fragile and non-obvious.
 *
 *  2. Collision risk under rapid submissions: Date.now() returns the same
 *     millisecond timestamp for two events queued in the same tick (e.g. a
 *     double-tap or a rapid programmatic batch). With only 5 random characters
 *     from a 36-character alphabet (36^5 ≈ 60 million), collision probability
 *     is non-trivial under load. A collision causes the second IndexedDB put()
 *     to silently overwrite the first item (keyPath: 'id'), losing one action.
 *
 * Fix
 * ───
 * Use crypto.randomUUID() which produces a RFC 4122 v4 UUID — 122 bits of
 * random data, guaranteed unique by the Web Crypto API. Falls back to a
 * manually composed UUID-like string with 9 random characters (vs the previous
 * 5) for environments where crypto.randomUUID is unavailable (older browsers).
 *
 * @returns {string} A collision-resistant unique ID string
 */
const generateQueueId = () => {
  if (typeof crypto !== "undefined") {
    // Modern environments
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    // Older environments (e.g., IE11/older Safari) that support crypto but lack randomUUID
    if (typeof crypto.getRandomValues === "function") {
      const array = new Uint32Array(4);
      crypto.getRandomValues(array);
      return `${Date.now()}-${array.join("-")}`;
    }
  }
  // Ultimate fallback if no crypto object is available at all
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Append a single item to both localStorage mirror and IndexedDB.
 *
 * SECURITY: Each queued action is tagged with the current user ID to prevent
 * cross-user action replay. If a user logs out and another user logs in,
 * the queued actions are validated for ownership before replay.
 */
export const pushToQueue = async (item, userId = null) => {
  // Add metadata tracking with security context
  const actionItem = {
    id: item.id || generateQueueId(),
    timestamp: item.timestamp || new Date().toISOString(),
    retryCount: item.retryCount || 0,
    actionType: item.actionType || "REGISTER_EVENT",
    eventId: item.eventId || null,
    payload: item.payload || {},
    endpoint: item.endpoint || null,
    // SECURITY: Attach user ID to validate ownership on replay
    userId: userId || null,
    sessionId: typeof sessionStorage !== "undefined" ? sessionStorage.getItem("session_id") || null : null,
  };

  // 1. Sync mirror updates immediately (Synchronous fallback)
  const queue = getQueue();
  if (queue.length >= 15) {
    logger.warn("Offline queue limit reached. Dropping item to prevent local overflow.");
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("eventra-offline-queue-full", {
          detail: { eventId: item.eventId, limit: 15 },
        })
      );
    }
    return false;
  }
  queue.push(actionItem);

  let localStorageSuccess = false;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    localStorageSuccess = true;
  } catch (error) {
    logger.error("Error writing localStorage backup:", error);
  }

  // 2. Async IndexedDB background write
  let indexedDbSuccess = false;
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(actionItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    indexedDbSuccess = true;
  } catch (err) {
    logger.error("IndexedDB push failed:", err);
  }

  // Return true if either storage successfully queued the item to prevent data loss
  return localStorageSuccess || indexedDbSuccess;
};

/**
 * Overwrite the queue in both storages (Used after resolving conflicts or updates).
 */
export const setQueue = async (newQueue) => {
  // 1. Sync mirror updates immediately
  try {
    if (newQueue.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    }
  } catch (error) {
    logger.error("Error setting localStorage backup:", error);
  }

  // 2. Sync IndexedDB in background
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        if (newQueue.length === 0) {
          resolve();
          return;
        }

        let completed = 0;
        newQueue.forEach((item) => {
          const putReq = store.put(item);
          putReq.onsuccess = () => {
            completed++;
            if (completed === newQueue.length) resolve();
          };
          putReq.onerror = () => reject(putReq.error);
        });
      };
      clearReq.onerror = () => reject(clearReq.error);
    });
  } catch (err) {
    logger.error("IndexedDB setQueue failed:", err);
  }
};

/**
 * Clear all offline actions from database and localStorage.
 */
export const clearQueue = async () => {
  // 1. Sync mirror
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    logger.error("Error clearing localStorage backup:", error);
  }

  // 2. Sync IndexedDB
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    logger.error("IndexedDB clear failed:", err);
  }
};

/**
 * SECURITY: Filter queued actions to only include items owned by the current user.
 *
 * This prevents a critical cross-user action replay vulnerability:
 * If User A queues actions offline, logs out, and User B logs in, the queued
 * actions should NOT replay under User B's session.
 *
 * This function validates each queued action's userId against the current user.
 * Orphaned actions (no userId) are dropped to be safe.
 *
 * @param {Array} queue - Current offline queue
 * @param {string} currentUserId - User ID of currently logged-in user
 * @returns {Array} Filtered queue containing only actions owned by currentUserId
 */
export const filterQueueByOwnership = (queue, currentUserId) => {
  if (!currentUserId) {
    logger.warn("[Security] No user ID provided — dropping entire queue as a safety precaution");
    return [];
  }

  const validatedQueue = queue.filter((item) => {
    // SECURITY: Only allow items with matching userId
    if (item.userId !== currentUserId) {
      logger.warn(
        `[Security] Dropping queued action ${item.id}: ` +
          `owned by user ${item.userId} but current user is ${currentUserId}. ` +
          `This prevents cross-user action replay.`
      );
      return false;
    }
    return true;
  });

  return validatedQueue;
};

/**
 * Reconciles the local offline queue item with the server state.
 * Identifies field-level discrepancies, version differences, or stale updates.
 *
 * Enhanced in issue #3261:
 *  - Now returns a `severity` field indicating how serious the conflict is:
 *      "version-only"  — only version numbers differ (no field-level changes)
 *      "minor"         — 1–2 fields differ
 *      "major"         — 3+ fields differ
 *  - Now returns an `overlapScore` (0–1) indicating the fraction of shared
 *    keys that are identical (useful for deciding whether to auto-resolve).
 *
 * @param {object} localItem   - The offline queue item containing local payload.
 * @param {object} serverState - The remote state returned by the server.
 * @returns {object} Reconciliation report with conflict details and field differences.
 */
export const reconcileState = (localItem, serverState) => {
  if (!localItem)   return { hasConflict: false, conflicts: [], severity: "none", overlapScore: 1 };
  if (!serverState) return { hasConflict: false, conflicts: [], severity: "none", overlapScore: 1 };

  const EXCLUDED_KEYS = new Set([
    "id", "userId", "eventId", "timestamp", "version",
    "clientTimestamp", "serverTimestamp", "forceOverride",
  ]);

  const localPayload  = localItem.payload  || {};
  const serverPayload = serverState.payload || serverState || {};

  const allKeys = Array.from(
    new Set([...Object.keys(localPayload), ...Object.keys(serverPayload)])
  ).filter((key) => !EXCLUDED_KEYS.has(key));

  const conflicts = [];
  let matchCount  = 0;

  for (const key of allKeys) {
    const localVal  = localPayload[key];
    const serverVal = serverPayload[key];

    const localStr  = localVal  !== undefined ? JSON.stringify(localVal)  : null;
    const serverStr = serverVal !== undefined ? JSON.stringify(serverVal) : null;

    if (localStr !== serverStr) {
      conflicts.push({
        key,
        localValue:  localVal,
        serverValue: serverVal,
      });
    } else {
      matchCount++;
    }
  }

  const localVersion  = localItem.version  || localPayload.version  || 1;
  const serverVersion = serverPayload.version || serverState.version || 1;

  const hasVersionDrift = serverVersion > localVersion;
  const hasConflict     = conflicts.length > 0 || hasVersionDrift;

  // Overlap score: fraction of compared keys that are identical
  const overlapScore = allKeys.length > 0 ? matchCount / allKeys.length : 1;

  // Severity classification
  let severity = "none";
  if (hasConflict) {
    if (conflicts.length === 0 && hasVersionDrift) {
      severity = "version-only";
    } else if (conflicts.length <= 2) {
      severity = "minor";
    } else {
      severity = "major";
    }
  }

  return {
    hasConflict,
    conflicts,
    severity,
    overlapScore,
    localTimestamp:  localItem.timestamp         || null,
    serverTimestamp: serverPayload.updatedAt     || serverPayload.timestamp || null,
    localVersion,
    serverVersion,
  };
};

// ---------------------------------------------------------------------------
// Stale Item Pruning
// ---------------------------------------------------------------------------

/**
 * Maximum age (in milliseconds) before a queued item is considered stale
 * and eligible for automatic removal.
 * Default: 7 days.
 */
const MAX_QUEUE_ITEM_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

/**
 * pruneStaleItems
 *
 * Removes items from the queue whose `timestamp` is older than
 * `maxAgeMs` (default 7 days). Stale items are very unlikely to still
 * be relevant — the server state will have moved on significantly and
 * replaying them could cause data corruption.
 *
 * @param {object[]} queue      - The current offline queue array
 * @param {number}   [maxAgeMs] - Optional custom maximum age in milliseconds
 * @returns {{ pruned: object[], remaining: object[], prunedCount: number }}
 */
export const pruneStaleItems = (queue, maxAgeMs = MAX_QUEUE_ITEM_AGE_MS) => {
  const now     = Date.now();
  const pruned  = [];
  const remaining = [];

  for (const item of queue) {
    const itemTs = item.timestamp ? new Date(item.timestamp).getTime() : now;
    if (now - itemTs > maxAgeMs) {
      pruned.push(item);
      logger.warn(
        `[OfflineQueue] Pruning stale item ${item.id} (age: ${Math.round((now - itemTs) / 86_400_000)}d)`
      );
    } else {
      remaining.push(item);
    }
  }

  if (pruned.length > 0) {
    try {
      window?.dispatchEvent(
        new CustomEvent("eventra-offline-queue-pruned", {
          detail: { prunedCount: pruned.length, prunedItems: pruned },
        })
      );
    } catch {
      // Non-fatal — best effort notification
    }
  }

  return { pruned, remaining, prunedCount: pruned.length };
};

// ---------------------------------------------------------------------------
// Queue Metrics / Analytics
// ---------------------------------------------------------------------------

/**
 * getQueueMetrics
 *
 * Returns a snapshot of queue health statistics. Useful for diagnostic UI
 * components (e.g., an offline queue status panel or developer tools).
 *
 * @param {object[]} queue - The current offline queue array
 * @returns {{
 *   totalItems: number,
 *   pendingItems: number,
 *   retriedItems: number,
 *   maxRetriesReached: number,
 *   oldestItemAgeMs: number | null,
 *   newestItemAgeMs: number | null,
 *   uniqueEventIds: number,
 *   uniqueOwners: number,
 *   hasOrphanedItems: boolean,
 * }}
 */
export const getQueueMetrics = (queue) => {
  if (!Array.isArray(queue) || queue.length === 0) {
    return {
      totalItems:         0,
      pendingItems:       0,
      retriedItems:       0,
      maxRetriesReached:  0,
      oldestItemAgeMs:    null,
      newestItemAgeMs:    null,
      uniqueEventIds:     0,
      uniqueOwners:       0,
      hasOrphanedItems:   false,
    };
  }

  const now       = Date.now();
  let oldest      = now;
  let newest      = 0;
  let pending     = 0;
  let retried     = 0;
  let maxRetries  = 0;

  const eventIds = new Set();
  const owners   = new Set();
  let orphaned   = false;

  for (const item of queue) {
    const ts = item.timestamp ? new Date(item.timestamp).getTime() : now;
    if (ts < oldest) oldest = ts;
    if (ts > newest) newest = ts;

    const retryCount = item.retryCount ?? 0;
    if (retryCount === 0) pending++;
    else retried++;
    if (retryCount >= 3) maxRetries++;  // MAX_RETRIES = 3

    if (item.eventId) eventIds.add(item.eventId);
    if (item.userId)  owners.add(item.userId);
    else              orphaned = true;
  }

  return {
    totalItems:        queue.length,
    pendingItems:      pending,
    retriedItems:      retried,
    maxRetriesReached: maxRetries,
    oldestItemAgeMs:   now - oldest,
    newestItemAgeMs:   now - newest,
    uniqueEventIds:    eventIds.size,
    uniqueOwners:      owners.size,
    hasOrphanedItems:  orphaned,
  };
};

// ---------------------------------------------------------------------------
// Conflict Resolution History (localStorage-backed, session-scoped)
// ---------------------------------------------------------------------------

const CONFLICT_HISTORY_KEY = "eventra_conflict_resolution_history";
const MAX_HISTORY_ENTRIES  = 50;

/**
 * persistConflictResolution
 *
 * Records a conflict resolution event to localStorage so that:
 *  - The UI can show a "N conflicts resolved this session" counter.
 *  - Developers can inspect the full resolution history for debugging.
 *  - A future audit-log feature can surface the data.
 *
 * Entries are capped at MAX_HISTORY_ENTRIES to prevent unbounded growth.
 *
 * @param {string} itemId       - The offline queue item id
 * @param {string} strategy     - Resolution strategy used ('local'|'server'|'merge')
 * @param {object} [mergedPayload] - The final payload that was submitted (for 'merge')
 * @returns {boolean} true if successfully persisted
 */
export const persistConflictResolution = (itemId, strategy, mergedPayload = null) => {
  try {
    const raw     = localStorage.getItem(CONFLICT_HISTORY_KEY);
    const history = safeJsonParse(raw, []);

    const entry = {
      itemId,
      strategy,
      mergedPayload,
      resolvedAt: new Date().toISOString(),
    };

    // Prepend so most recent is first, then cap at MAX_HISTORY_ENTRIES
    const updated = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(CONFLICT_HISTORY_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    logger.warn("[OfflineQueue] Failed to persist conflict resolution to localStorage:", err);
    return false;
  }
};

/**
 * getConflictHistory
 *
 * Retrieves the persisted conflict resolution history from localStorage.
 *
 * @returns {Array<{itemId: string, strategy: string, mergedPayload: object|null, resolvedAt: string}>}
 */
export const getConflictHistory = () => {
  try {
    const raw = localStorage.getItem(CONFLICT_HISTORY_KEY);
    return safeJsonParse(raw, []);
  } catch {
    return [];
  }
};

/**
 * clearConflictHistory
 *
 * Removes the conflict resolution history from localStorage.
 */
export const clearConflictHistory = () => {
  try {
    localStorage.removeItem(CONFLICT_HISTORY_KEY);
  } catch {
    // Non-fatal
  }
};

// ---------------------------------------------------------------------------
// Batch Reconciliation
// ---------------------------------------------------------------------------

/**
 * batchReconcile
 *
 * Runs reconcileState() against every item in the queue that has a known
 * server-side counterpart (looked up via the provided `serverStateFetcher`).
 *
 * This is useful for a "pre-flight check" before syncing: you can identify
 * which items are likely to generate 409 conflicts and warn the user
 * proactively, rather than failing mid-sync.
 *
 * @param {object[]} queue               - The offline queue array
 * @param {(item: object) => Promise<object|null>} serverStateFetcher
 *   An async function that accepts a queue item and returns the current server
 *   state for that item, or null if the resource doesn't exist yet.
 * @returns {Promise<Array<{item: object, serverState: object, report: object}>>}
 *   Array of entries where hasConflict is true.
 */
export const batchReconcile = async (queue, serverStateFetcher) => {
  if (!Array.isArray(queue) || queue.length === 0) return [];
  if (typeof serverStateFetcher !== "function") {
    throw new TypeError("[batchReconcile] serverStateFetcher must be a function");
  }

  const conflictEntries = [];

  for (const item of queue) {
    let serverState = null;
    try {
      serverState = await serverStateFetcher(item);
    } catch (err) {
      logger.warn(`[batchReconcile] Failed to fetch server state for item ${item.id}:`, err);
      continue;
    }

    if (!serverState) continue; // No server counterpart yet — not a conflict

    const report = reconcileState(item, serverState);
    if (report.hasConflict) {
      conflictEntries.push({ item, serverState, report });
    }
  }

  logger.log(
    `[batchReconcile] Checked ${queue.length} items. ` +
    `${conflictEntries.length} pre-flight conflict(s) detected.`
  );

  return conflictEntries;
};

// ---------------------------------------------------------------------------
// Queue Snapshot Export (for diagnostics / bug reports)
// ---------------------------------------------------------------------------

/**
 * exportQueueSnapshot
 *
 * Serialises the current queue and metadata into a JSON string suitable for
 * attaching to a bug report or support ticket. Sensitive fields (tokens,
 * passwords) are redacted before export.
 *
 * @param {object[]} queue - The current offline queue array
 * @returns {string}  JSON string of the redacted snapshot
 */
export const exportQueueSnapshot = (queue) => {
  const REDACT_KEYS = new Set(["password", "token", "accessToken", "refreshToken", "secret"]);

  const redact = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        REDACT_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : redact(v),
      ])
    );
  };

  const snapshot = {
    exportedAt:  new Date().toISOString(),
    itemCount:   queue.length,
    metrics:     getQueueMetrics(queue),
    items:       queue.map((item) => ({
      ...redact(item),
      payload: redact(item.payload),
    })),
  };

  return JSON.stringify(snapshot, null, 2);
};


