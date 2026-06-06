// ---------------------------------------------------------------------------
// Self-Healing Offline Queue Utility (IndexedDB backed with LocalStorage Backup)
// ---------------------------------------------------------------------------
import { safeJsonParse } from "./safeJsonParse.js";
import { logger } from "./logger.js";
import offlineSyncConfig from "../config/offlineSyncConfig.json";

const QUEUE_KEY = "eventra_offline_queue";
const DB_NAME = "eventra_offline_db";
const STORE_NAME = "actions_queue";
const BACKGROUND_SYNC_TAG = "eventra-offline-queue-sync";

const requestBackgroundSync = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration?.sync && typeof registration.sync.register === "function") {
      await registration.sync.register(BACKGROUND_SYNC_TAG);
      return true;
    }
  } catch (error) {
    logger.warn("[OfflineQueue] Background sync registration failed:", error);
  }

  return false;
};

const notifyQueueUpdated = (queuedItem) => {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("eventra-offline-queue-updated", {
      detail: { item: queuedItem },
    })
  );
};

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
      request.onsuccess = () => {
        const items = request.result || [];
        // SECURITY (Issue #6449): Validate structural integrity to prevent cache poisoning
        const validItems = items.filter(item => 
          item && 
          typeof item.id === 'string' && 
          typeof item.actionType === 'string' &&
          typeof item.payload === 'object'
        );
        resolve(validItems);
      };
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
// Maximum serialised byte length for a single queue item's payload field.
// With the 15-item slot cap, the total localStorage footprint is at most
// 15 x 50 KB = 750 KB, safely within the 5 MB browser quota.
const MAX_PAYLOAD_BYTES = 50 * 1024;

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
    conflictStrategy:
      item.conflictStrategy ||
      offlineSyncConfig.defaultConflictStrategy,
    // SECURITY: Attach user ID to validate ownership on replay
    userId: userId || null,
    sessionId:
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("session_id") || null
        : null,
  };

  // Guard against oversized payloads before they reach localStorage.
  // An uncapped payload can fill the 5 MB quota in a single write, causing
  // every subsequent localStorage.setItem call (including auth-state writes
  // in AuthContext) to throw QuotaExceededError, silently corrupting the app.
  const serialisedPayload = JSON.stringify(actionItem.payload);
  if (serialisedPayload.length > MAX_PAYLOAD_BYTES) {
    logger.warn(
      `[OfflineQueue] Payload too large (${serialisedPayload.length} bytes). Dropping item to protect localStorage quota.`
    );
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("eventra-offline-queue-full", {
          detail: { reason: "payload-too-large", eventId: item.eventId },
        })
      );
    }
    return false;
  }

  // 1. Sync mirror updates immediately (Synchronous fallback)
  const queue = getQueue();
  if (queue.length >= offlineSyncConfig.maxQueueSize) {
    logger.warn("Offline queue limit reached. Dropping item to prevent local overflow.");
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("eventra-offline-queue-full", {
          detail: { eventId: item.eventId, limit: offlineSyncConfig.maxQueueSize },
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
  const queued = localStorageSuccess || indexedDbSuccess;

  if (queued) {
    notifyQueueUpdated(actionItem);
    await requestBackgroundSync();
  }

  return queued;
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

        newQueue.forEach((item) => store.put(item));

        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target?.error || new Error('IndexedDB transaction failed'));
      };
      clearReq.onerror = () => reject(clearReq.error);
    });
  } catch (err) {
    logger.error("IndexedDB setQueue failed:", err);
  }

  notifyQueueUpdated(null);
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

  notifyQueueUpdated(null);
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

// ---------------------------------------------------------------------------
// Processing Pipeline — exponential backoff, retry, and replay
// ---------------------------------------------------------------------------

const MAX_RETRY_COUNT = 5;
const BASE_BACKOFF_MS = 1_000;
const REQUEST_TIMEOUT_MS = 10_000;

const notifyQueueProcessed = (result) => {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  window.dispatchEvent(
    new CustomEvent("eventra-offline-queue-processed", {
      detail: result,
    })
  );
};

/**
 * Retry a single queued action with exponential backoff + jitter.
 *
 * @param {object}   item      - Queued action item (must have endpoint, payload, id, retryCount)
 * @param {function} fetchFn   - Async function(url, options) => { status, data }
 * @param {object}   [options] - { signal, onConflict }
 * @returns {Promise<{status: "success"|"dropped"|"conflict"|"error", item: object}>}
 */
export const processQueueItem = async (item, fetchFn, options = {}) => {
  const { signal, onConflict } = options;

  for (let attempt = 0; attempt <= MAX_RETRY_COUNT; attempt++) {
    if (signal?.aborted) return { status: "error", item, error: new DOMException("Aborted", "AbortError") };

    if (attempt > 0) {
      const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1) + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const url = item.endpoint;
    if (!url) {
      logger.warn(`[OfflineQueue] Item ${item.id} has no endpoint — dropping.`);
      return { status: "dropped", item };
    }

    let controller;
    let timeoutId;

    const clearPendingTimeout = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    try {
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        if (controller) controller.abort();
      }, REQUEST_TIMEOUT_MS);
      const combinedSignal = signal
        ? combineAbortSignals(signal, controller.signal)
        : controller.signal;

      const response = await fetchFn(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
        signal: combinedSignal,
      });

      clearPendingTimeout();

      if (response.ok) return { status: "success", item };

      if (response.status === 409) {
        let serverState = null;
        try { serverState = await response.json(); } catch { serverState = {}; }

        if (typeof onConflict === "function") {
          const resolution = await onConflict(item, serverState);
          if (resolution === "retry") { clearPendingTimeout(); continue; }
          if (resolution === "discard") { clearPendingTimeout(); return { status: "dropped", item }; }
          clearPendingTimeout(); return { status: "success", item };
        }
        clearPendingTimeout(); return { status: "conflict", item, serverState };
      }

      if (response.status >= 400 && response.status < 500) {
        logger.warn(
          `[OfflineQueue] Server rejected item ${item.id} with ${response.status} — dropping.`
        );
        clearPendingTimeout(); return { status: "dropped", item };
      }

      // 5xx — retry with backoff
      clearPendingTimeout(); continue;
    } catch (error) {
      clearPendingTimeout();
      if (error.name === "AbortError") return { status: "error", item, error };
      logger.error(`[OfflineQueue] Network error processing item ${item.id}:`, error);
      // Retry on network errors
    }
  }

  return { status: "dropped", item };
};

/**
 * Process all items in the offline queue.
 *
 * 1. Reads queue from IndexedDB
 * 2. Validates ownership via filterQueueByOwnership
 * 3. Processes each item with retry/backoff
 * 4. Removes permanently failed items after MAX_RETRY_COUNT
 * 5. Dispatches eventra-offline-queue-processed custom event
 *
 * @param {string}   currentUserId - User ID for ownership validation
 * @param {function} fetchFn       - Async HTTP fetch function
 * @param {object}   [options]     - { signal, onConflict }
 * @returns {Promise<{processed: number, succeeded: number, dropped: number, remaining: number}>}
 */
export const processQueue = async (currentUserId, fetchFn, options = {}) => {
  const { signal } = options;

  const queue = await getQueueIndexedDB();
  if (queue.length === 0) return { processed: 0, succeeded: 0, dropped: 0, remaining: 0 };

  const validated = filterQueueByOwnership(queue, currentUserId);
  if (validated.length === 0) {
    await clearQueue();
    return { processed: 0, succeeded: 0, dropped: 0, remaining: 0 };
  }

  const succeeded = [];
  const dropped = [];
  const failed = [];

  for (const item of validated) {
    if (signal?.aborted) break;

    if (item.retryCount >= MAX_RETRY_COUNT) {
      dropped.push(item);
      continue;
    }

    const result = await processQueueItem(item, fetchFn, {
      ...options,
      onConflict: options.onConflict
        ? (queuedItem, serverState) => options.onConflict(queuedItem, serverState)
        : undefined,
    });

    if (result.status === "success") {
      succeeded.push(item);
    } else if (result.status === "dropped") {
      dropped.push(item);
    } else {
      failed.push({ ...item, retryCount: (item.retryCount || 0) + 1 });
    }
  }

  if (failed.length > 0) {
    await setQueue(failed);
  } else {
    await clearQueue();
  }

  const remaining = failed.length;

  notifyQueueProcessed({ succeeded: succeeded.length, dropped: dropped.length, remaining });

  return {
    processed: validated.length,
    succeeded: succeeded.length,
    dropped: dropped.length,
    remaining,
  };
};

/**
 * Internal: combine two AbortSignals into one so either can abort.
 */
const combineAbortSignals = (...signals) => {
  const controller = new AbortController();
  const onAbort = () => controller.abort();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  return controller.signal;
};
