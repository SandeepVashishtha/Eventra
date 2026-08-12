// ---------------------------------------------------------------------------
// Self-Healing Offline Queue Utility (IndexedDB backed with LocalStorage Backup)
// Enterprise Offline Synchronization Engine & Resilient Storage Architecture
// ---------------------------------------------------------------------------
import { safeJsonParse } from "./safeJsonParse.js";
import { logger } from "./logger.js";

const QUEUE_KEY = "eventra_offline_queue";
const DB_NAME = "eventra_offline_db";
const STORE_NAME = "actions_queue";
const METRICS_STORE_NAME = "sync_metrics";
const BACKUP_STORE_NAME = "migration_backups";
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
 */
const DB_VERSION = 3;

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
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const oldVersion = e.oldVersion;
      const transaction = e.target.transaction;

      // Ensure supporting stores exist regardless of migration path
      if (!db.objectStoreNames.contains(METRICS_STORE_NAME)) {
        db.createObjectStore(METRICS_STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(BACKUP_STORE_NAME)) {
        db.createObjectStore(BACKUP_STORE_NAME, { keyPath: "backupId" });
      }

      if (oldVersion === 0) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const mainStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          mainStore.createIndex("by_timestamp", "timestamp", { unique: false });
          mainStore.createIndex("by_userId", "userId", { unique: false });
          mainStore.createIndex("by_priority", "priority", { unique: false });
        }
        return;
      }

      // Schema upgrade path (oldVersion >= 1)
      let rescuedItems = [];
      const lsMirror = _rescueFromLocalStorage();

      if (db.objectStoreNames.contains(STORE_NAME)) {
        const oldStore = transaction.objectStore(STORE_NAME);
        const getAllReq = oldStore.getAll();

        getAllReq.onsuccess = () => {
          const dbItems = getAllReq.result || [];
          const seen = new Set();
          rescuedItems = [...dbItems, ...lsMirror].filter((item) => {
            if (!item || !item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });

          db.deleteObjectStore(STORE_NAME);
          const newStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          newStore.createIndex("by_timestamp", "timestamp", { unique: false });
          newStore.createIndex("by_userId", "userId", { unique: false });
          newStore.createIndex("by_priority", "priority", { unique: false });

          rescuedItems.forEach((item) => {
            newStore.put(item);
          });

          try {
            if (rescuedItems.length > 0) {
              localStorage.setItem(QUEUE_KEY, JSON.stringify(rescuedItems));
            } else {
              localStorage.removeItem(QUEUE_KEY);
            }
          } catch {
            // localStorage might be full — non-fatal
          }

          _dispatchUpgradeEvent(rescuedItems.length);
        };

        getAllReq.onerror = () => {
          db.deleteObjectStore(STORE_NAME);
          const newStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          newStore.createIndex("by_timestamp", "timestamp", { unique: false });
          newStore.createIndex("by_userId", "userId", { unique: false });
          newStore.createIndex("by_priority", "priority", { unique: false });

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
        const newStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        newStore.createIndex("by_timestamp", "timestamp", { unique: false });
        newStore.createIndex("by_userId", "userId", { unique: false });
        newStore.createIndex("by_priority", "priority", { unique: false });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);

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
 * generateQueueId - Generates a collision-free ID for a new offline queue item.
 */
const generateQueueId = () => {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      const array = new Uint32Array(4);
      crypto.getRandomValues(array);
      return `${Date.now()}-${array.join("-")}`;
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const MAX_PAYLOAD_BYTES = 50 * 1024;

export const pushToQueue = async (item, userId = null) => {
  const actionItem = {
    id: item.id || generateQueueId(),
    timestamp: item.timestamp || new Date().toISOString(),
    retryCount: item.retryCount || 0,
    priority: item.priority || "MEDIUM", // 'HIGH' | 'MEDIUM' | 'LOW'
    actionType: item.actionType || "REGISTER_EVENT",
    eventId: item.eventId || null,
    payload: item.payload || {},
    endpoint: item.endpoint || null,
    userId: userId || null,
    sessionId:
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("session_id") || null
        : null,
  };

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

  const queued = localStorageSuccess || indexedDbSuccess;

  if (queued) {
    notifyQueueUpdated(actionItem);
    await requestBackgroundSync();
  }

  return queued;
};

export const setQueue = async (newQueue) => {
  try {
    if (newQueue.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    }
  } catch (error) {
    logger.error("Error setting localStorage backup:", error);
  }

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

  notifyQueueUpdated(null);
};

export const clearQueue = async () => {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    logger.error("Error clearing localStorage backup:", error);
  }

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

export const filterQueueByOwnership = (queue, currentUserId) => {
  if (!currentUserId) {
    logger.warn("[Security] No user ID provided — dropping entire queue as a safety precaution");
    return [];
  }

  return queue.filter((item) => {
    if (item.userId !== currentUserId) {
      logger.warn(
        `[Security] Dropping queued action ${item.id}: owned by user ${item.userId} but current user is ${currentUserId}.`
      );
      return false;
    }
    return true;
  });
};

// ============================================================================
// 1. OFFLINE STORAGE METRICS & DIAGNOSTICS ENGINE
// ============================================================================

export class OfflineStorageMetrics {
  /**
   * Estimates browser storage usage and quota availability via navigator.storage.
   * @returns {Promise<{quota: number, usage: number, percentageUsed: number, availableBytes: number}>}
   */
  static async getStorageEstimate() {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        const percentageUsed = quota > 0 ? (usage / quota) * 100 : 0;
        const availableBytes = Math.max(0, quota - usage);

        return {
          quota,
          usage,
          percentageUsed: parseFloat(percentageUsed.toFixed(2)),
          availableBytes,
        };
      } catch (error) {
        logger.error("[Metrics] Failed to fetch navigator storage estimate:", error);
      }
    }
    return { quota: 0, usage: 0, percentageUsed: 0, availableBytes: 0 };
  }

  /**
   * Calculates size breakdown and storage metrics for queued actions.
   * @returns {Promise<Object>} Detailed queue size analytics
   */
  static async calculateQueueMetrics() {
    const items = await getQueueIndexedDB();
    let totalSizeBytes = 0;
    const priorityBreakdown = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const actionTypeCounts = {};

    items.forEach((item) => {
      const str = JSON.stringify(item);
      const itemBytes = new Blob([str]).size;
      totalSizeBytes += itemBytes;

      const prio = item.priority || "MEDIUM";
      priorityBreakdown[prio] = (priorityBreakdown[prio] || 0) + 1;

      const act = item.actionType || "UNKNOWN";
      actionTypeCounts[act] = (actionTypeCounts[act] || 0) + 1;
    });

    const storageEstimate = await this.getStorageEstimate();

    return {
      itemCount: items.length,
      totalSizeBytes,
      averageItemSizeBytes: items.length > 0 ? Math.round(totalSizeBytes / items.length) : 0,
      priorityBreakdown,
      actionTypeCounts,
      storageEstimate,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Persists a historical snapshot of queue metrics to IndexedDB.
   */
  static async recordMetricsSnapshot() {
    const metrics = await this.calculateQueueMetrics();
    const snapshotRecord = {
      id: `snapshot_${Date.now()}`,
      ...metrics,
    };

    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(METRICS_STORE_NAME, "readwrite");
        const store = tx.objectStore(METRICS_STORE_NAME);
        const req = store.put(snapshotRecord);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      logger.warn("[Metrics] Failed to save metrics snapshot to IndexedDB:", err);
    }

    return snapshotRecord;
  }
}

// ============================================================================
// 2. CRYPTOGRAPHIC PAYLOAD ENCRYPTION MANAGER (Web Crypto API)
// ============================================================================

export class QueueEncryptionManager {
  constructor(secretKey = "eventra_default_offline_secret_key") {
    this.secretKey = secretKey;
    this.cryptoKey = null;
  }

  /**
   * Derives a CryptoKey using PBKDF2 and AES-GCM.
   * @private
   */
  async _getDerivedKey() {
    if (this.cryptoKey) return this.cryptoKey;

    if (typeof crypto === "undefined" || !crypto.subtle) {
      throw new Error("WebCrypto API is not supported in this environment");
    }

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(this.secretKey),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    this.cryptoKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("eventra_queue_salt_2026"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return this.cryptoKey;
  }

  /**
   * Encrypts plain payload object using AES-GCM.
   * @param {Object} payload 
   * @returns {Promise<{ciphertext: string, iv: string}>}
   */
  async encryptPayload(payload) {
    try {
      const key = await this._getDerivedKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const encodedData = enc.encode(JSON.stringify(payload));

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
      );

      return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
        iv: btoa(String.fromCharCode(...iv)),
      };
    } catch (err) {
      logger.error("[Encryption] Encryption failed:", err);
      throw err;
    }
  }

  /**
   * Decrypts ciphertext back into payload object.
   * @param {string} ciphertext Base64 ciphertext
   * @param {string} ivBase64 Base64 initialization vector
   * @returns {Promise<Object>} Decrypted payload object
   */
  async decryptPayload(ciphertext, ivBase64) {
    try {
      const key = await this._getDerivedKey();
      const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
      const encryptedBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encryptedBytes
      );

      const dec = new TextDecoder();
      const decodedString = dec.decode(decryptedBuffer);
      return JSON.parse(decodedString);
    } catch (err) {
      logger.error("[Encryption] Decryption failed:", err);
      throw err;
    }
  }
}

// ============================================================================
// 3. OFFLINE CONFLICT RESOLUTION ENGINE
// ============================================================================

export class OfflineConflictResolver {
  /**
   * Strategies for conflict resolution.
   */
  static STRATEGIES = {
    SERVER_WINS: "SERVER_WINS",
    CLIENT_WINS: "CLIENT_WINS",
    LAST_WRITE_WINS: "LAST_WRITE_WINS",
    DEEP_MERGE: "DEEP_MERGE",
    CUSTOM: "CUSTOM",
  };

  /**
   * Resolves conflict between client-queued item state and server response.
   * @param {Object} clientItem 
   * @param {Object} serverState 
   * @param {string} [strategy=STRATEGIES.LAST_WRITE_WINS] 
   * @param {Function} [customMerger] 
   * @returns {Object} Resolved merged object
   */
  static resolve(
    clientItem,
    serverState,
    strategy = OfflineConflictResolver.STRATEGIES.LAST_WRITE_WINS,
    customMerger = null
  ) {
    if (!serverState) return clientItem;
    if (!clientItem) return serverState;

    switch (strategy) {
      case this.STRATEGIES.SERVER_WINS:
        logger.info(`[ConflictResolver] Resolved ${clientItem.id} using SERVER_WINS`);
        return { ...serverState };

      case this.STRATEGIES.CLIENT_WINS:
        logger.info(`[ConflictResolver] Resolved ${clientItem.id} using CLIENT_WINS`);
        return { ...clientItem.payload };

      case this.STRATEGIES.LAST_WRITE_WINS: {
        const clientTimestamp = new Date(clientItem.timestamp).getTime();
        const serverTimestamp = new Date(serverState.updatedAt || serverState.timestamp || 0).getTime();

        if (clientTimestamp >= serverTimestamp) {
          logger.info(`[ConflictResolver] LWW resolved ${clientItem.id} in favor of CLIENT`);
          return { ...serverState, ...clientItem.payload };
        } else {
          logger.info(`[ConflictResolver] LWW resolved ${clientItem.id} in favor of SERVER`);
          return { ...serverState };
        }
      }

      case this.STRATEGIES.DEEP_MERGE:
        logger.info(`[ConflictResolver] Resolved ${clientItem.id} using DEEP_MERGE`);
        return this._deepMergeObjects(serverState, clientItem.payload);

      case this.STRATEGIES.CUSTOM:
        if (typeof customMerger === "function") {
          return customMerger(clientItem, serverState);
        }
        logger.warn("[ConflictResolver] Custom merger strategy specified without a function. Falling back to LWW.");
        return this.resolve(clientItem, serverState, this.STRATEGIES.LAST_WRITE_WINS);

      default:
        return { ...clientItem.payload };
    }
  }

  /**
   * Utility for recursive deep merging.
   * @private
   */
  static _deepMergeObjects(target, source) {
    const output = { ...target };
    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this._isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = this._deepMergeObjects(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  static _isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }
}

// ============================================================================
// 4. EXPONENTIAL BACKOFF & JITTER RETRY POLICY
// ============================================================================

export class ExponentialBackoffRetryPolicy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 5;
    this.initialDelayMs = options.initialDelayMs || 1000;
    this.maxDelayMs = options.maxDelayMs || 30000;
    this.factor = options.factor || 2;
    this.jitter = options.jitter !== undefined ? options.jitter : true;
    this.retryableStatusCodes = new Set(options.retryableStatusCodes || [408, 429, 500, 502, 503, 504]);
  }

  /**
   * Determines if a request error is eligible for retry.
   * @param {Error|Object} error 
   * @param {number} currentRetryCount 
   * @returns {boolean}
   */
  shouldRetry(error, currentRetryCount) {
    if (currentRetryCount >= this.maxRetries) {
      return false;
    }

    // Network disconnection / offline status is always eligible for retry
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return true;
    }

    if (error && error.status) {
      return this.retryableStatusCodes.has(error.status);
    }

    return true;
  }

  /**
   * Calculates backoff delay in ms with optional randomized jitter.
   * @param {number} retryCount 
   * @returns {number} Delay in milliseconds
   */
  getDelay(retryCount) {
    let delay = this.initialDelayMs * Math.pow(this.factor, retryCount);
    delay = Math.min(delay, this.maxDelayMs);

    if (this.jitter) {
      // Full jitter calculation
      delay = Math.floor(Math.random() * delay);
    }

    return delay;
  }

  /**
   * Delays execution asynchronously.
   * @param {number} retryCount 
   * @returns {Promise<void>}
   */
  async wait(retryCount) {
    const delay = this.getDelay(retryCount);
    logger.info(`[RetryPolicy] Waiting ${delay}ms before attempt ${retryCount + 1}`);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// ============================================================================
// 5. BATCH QUEUE WORKER & SYNC DISPATCHER ENGINE
// ============================================================================

export class OfflineBatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 5;
    this.concurrentRequests = options.concurrentRequests || 2;
    this.retryPolicy = options.retryPolicy || new ExponentialBackoffRetryPolicy();
    this.isProcessing = false;
    this.listeners = new Set();
  }

  /**
   * Register listener for batch progress updates.
   * @param {Function} callback 
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Broadcast state changes to subscribers.
   * @private
   */
  _notifySubscribers(event) {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        logger.error("[BatchProcessor] Subscriber error:", err);
      }
    });
  }

  /**
   * Sort items by priority (HIGH -> MEDIUM -> LOW) and timestamp.
   * @param {Array} items 
   * @returns {Array} Sorted items
   */
  sortQueueByPriority(items) {
    const priorityMap = { HIGH: 1, MEDIUM: 2, LOW: 3 };

    return [...items].sort((a, b) => {
      const prioA = priorityMap[a.priority || "MEDIUM"] || 2;
      const prioB = priorityMap[b.priority || "MEDIUM"] || 2;

      if (prioA !== prioB) return prioA - prioB;

      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }

  /**
   * Executes sync processing loop for all queued items.
   * @param {Function} executorAsync Async function handling HTTP call (item) => Promise<res>
   * @param {string} [currentUserId=null]
   * @returns {Promise<{processed: number, succeeded: number, failed: number}>}
   */
  async processQueue(executorAsync, currentUserId = null) {
    if (this.isProcessing) {
      logger.warn("[BatchProcessor] Queue processing already in progress. Skipping.");
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      logger.info("[BatchProcessor] Device is offline. Deferring queue processing.");
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isProcessing = true;
    this._notifySubscribers({ type: "SYNC_START" });

    let rawQueue = await getQueueIndexedDB();
    if (currentUserId) {
      rawQueue = filterQueueByOwnership(rawQueue, currentUserId);
    }

    if (rawQueue.length === 0) {
      this.isProcessing = false;
      this._notifySubscribers({ type: "SYNC_COMPLETE", succeeded: 0, failed: 0 });
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const sortedQueue = this.sortQueueByPriority(rawQueue);
    let succeededCount = 0;
    let failedCount = 0;
    const remainingQueue = [];

    for (let i = 0; i < sortedQueue.length; i += this.batchSize) {
      const batch = sortedQueue.slice(i, i + this.batchSize);

      for (const item of batch) {
        try {
          this._notifySubscribers({ type: "ITEM_PROCESSING", item });
          await executorAsync(item);

          succeededCount++;
          this._notifySubscribers({ type: "ITEM_SUCCESS", item });
        } catch (error) {
          logger.error(`[BatchProcessor] Failed to sync item ${item.id}:`, error);

          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = error.message || String(error);

          if (this.retryPolicy.shouldRetry(error, item.retryCount)) {
            remainingQueue.push(item);
            this._notifySubscribers({ type: "ITEM_RETRY_QUEUED", item, error });
          } else {
            failedCount++;
            this._notifySubscribers({ type: "ITEM_PERMANENT_FAILURE", item, error });
          }
        }
      }
    }

    // Persist updated state back to IndexedDB and LocalStorage
    await setQueue(remainingQueue);

    this.isProcessing = false;
    const summary = { processed: sortedQueue.length, succeeded: succeededCount, failed: failedCount };
    this._notifySubscribers({ type: "SYNC_COMPLETE", ...summary });

    return summary;
  }
}

// ============================================================================
// 6. SYNC TELEMETRY LOGGER & AUDIT TRAIL
// ============================================================================

export class SyncTelemetryLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 200;
  }

  /**
   * Log telemetry event.
   * @param {string} type 
   * @param {Object} data 
   */
  logEvent(type, data = {}) {
    const entry = {
      id: generateQueueId(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    logger.info(`[Telemetry] [${type}]`, data);
    return entry;
  }

  /**
   * Retrieve filtered log entries.
   * @param {string} [typeFilter] 
   * @returns {Array}
   */
  getLogs(typeFilter = null) {
    if (!typeFilter) return this.logs;
    return this.logs.filter((log) => log.type === typeFilter);
  }

  /**
   * Export diagnostic crash log report.
   * @returns {string} JSON stringified dump
   */
  exportDiagnosticDump() {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "SSR",
        logs: this.logs,
      },
      null,
      2
    );
  }

  /**
   * Clear all telemetry history.
   */
  clear() {
    this.logs = [];
  }
}

export const globalSyncTelemetry = new SyncTelemetryLogger();

// ============================================================================
// 7. INDEXEDDB MULTI-VERSION SCHEMA MIGRATION ENGINE
// ============================================================================

export class IndexedDBSchemaMigrationEngine {
  constructor() {
    this.migrations = new Map();
  }

  /**
   * Registers a migration runner for a specific version bump.
   * @param {number} targetVersion 
   * @param {Function} migrationFn (db, transaction) => void
   */
  registerMigration(targetVersion, migrationFn) {
    this.migrations.set(targetVersion, migrationFn);
  }

  /**
   * Creates a safety backup snapshot in IndexedDB prior to schema migration.
   * @param {IDBDatabase} db 
   * @param {IDBTransaction} transaction 
   */
  async createSnapshot(db, transaction) {
    if (!db.objectStoreNames.contains(STORE_NAME)) return;

    try {
      const store = transaction.objectStore(STORE_NAME);
      const items = await new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (items.length > 0 && db.objectStoreNames.contains(BACKUP_STORE_NAME)) {
        const backupStore = transaction.objectStore(BACKUP_STORE_NAME);
        backupStore.put({
          backupId: `backup_v${db.version}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          items,
        });
        logger.info(`[MigrationEngine] Created backup snapshot of ${items.length} items`);
      }
    } catch (err) {
      logger.error("[MigrationEngine] Failed to create database snapshot:", err);
    }
  }

  /**
   * Executes registered migration steps sequentially.
   * @param {IDBDatabase} db 
   * @param {IDBTransaction} transaction 
   * @param {number} oldVersion 
   * @param {number} newVersion 
   */
  executeMigrations(db, transaction, oldVersion, newVersion) {
    for (let v = oldVersion + 1; v <= newVersion; v++) {
      if (this.migrations.has(v)) {
        logger.info(`[MigrationEngine] Running migration script for schema version ${v}`);
        try {
          const runner = this.migrations.get(v);
          runner(db, transaction);
        } catch (err) {
          logger.error(`[MigrationEngine] Migration failed for version ${v}:`, err);
          throw err;
        }
      }
    }
  }
}

// ============================================================================
// 8. REACTIVE OFFLINE QUEUE STATE STORE & UI BINDING
// ============================================================================

export class OfflineQueueStateStore {
  constructor() {
    this.state = {
      queueLength: 0,
      isSyncing: false,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      lastSyncTimestamp: null,
      failedItemCount: 0,
    };
    this.listeners = new Set();
    this._initListeners();
  }

  _initListeners() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => this.updateState({ isOnline: true }));
    window.addEventListener("offline", () => this.updateState({ isOnline: false }));

    window.addEventListener("eventra-offline-queue-updated", async () => {
      const q = await getQueueIndexedDB();
      this.updateState({ queueLength: q.length });
    });
  }

  /**
   * Update internal state store and notify listeners.
   * @param {Object} newState Partial state updates
   */
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((fn) => {
      try {
        fn(this.state);
      } catch (err) {
        logger.error("[StateStore] Listener error:", err);
      }
    });
  }

  /**
   * Subscribe to reactive state updates.
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  /**
   * Fetch current state snapshot.
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }
}

export const globalQueueStateStore = new OfflineQueueStateStore();

// ============================================================================
// 9. REAL-TIME NETWORK STATUS & HEARTBEAT MONITOR
// ============================================================================

export class NetworkStatusMonitor {
  constructor(options = {}) {
    this.pingUrl = options.pingUrl || "/api/healthcheck";
    this.pingIntervalMs = options.pingIntervalMs || 15000;
    this.timeoutMs = options.timeoutMs || 5000;
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    this.intervalId = null;
    this.listeners = new Set();
  }

  /**
   * Start polling active ping connection.
   */
  startMonitoring() {
    if (this.intervalId) return;

    if (typeof window !== "undefined") {
      window.addEventListener("online", this._handleBrowserOnline);
      window.addEventListener("offline", this._handleBrowserOffline);
    }

    this.intervalId = setInterval(() => this.checkConnection(), this.pingIntervalMs);
    this.checkConnection();
  }

  /**
   * Stop monitoring loop.
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("online", this._handleBrowserOnline);
      window.removeEventListener("offline", this._handleBrowserOffline);
    }
  }

  _handleBrowserOnline = () => {
    this.checkConnection();
  };

  _handleBrowserOffline = () => {
    this._setOnlineStatus(false);
  };

  /**
   * Performs real HTTP fetch ping to confirm actual connectivity (resolves lie-fi).
   * @returns {Promise<boolean>}
   */
  async checkConnection() {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this._setOnlineStatus(false);
      return false;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(this.pingUrl, {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timer);
      const reachable = res.ok;
      this._setOnlineStatus(reachable);
      return reachable;
    } catch {
      this._setOnlineStatus(false);
      return false;
    }
  }

  _setOnlineStatus(status) {
    if (this.isOnline !== status) {
      this.isOnline = status;
      logger.info(`[NetworkMonitor] Connectivity state changed: ${status ? "ONLINE" : "OFFLINE"}`);
      this.listeners.forEach((fn) => fn(status));
    }
  }

  /**
   * Subscribe to connection changes.
   * @param {Function} callback 
   * @returns {Function}
   */
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.isOnline);
    return () => this.listeners.delete(callback);
  }
}

export const globalNetworkMonitor = new NetworkStatusMonitor();

// ============================================================================
// 10. PRE-CONFIGURED DEFAULT ENGINE SINGLETON
// ============================================================================

export const offlineSyncEngine = {
  metrics: OfflineStorageMetrics,
  encryption: new QueueEncryptionManager(),
  conflictResolver: OfflineConflictResolver,
  retryPolicy: new ExponentialBackoffRetryPolicy(),
  batchProcessor: new OfflineBatchProcessor(),
  telemetry: globalSyncTelemetry,
  stateStore: globalQueueStateStore,
  networkMonitor: globalNetworkMonitor,

  /**
   * Initializes offline queue processing runtime.
   * @param {Function} syncExecutorAsync Function handling network requests
   * @param {string} [currentUserId=null] 
   */
  initialize(syncExecutorAsync, currentUserId = null) {
    this.networkMonitor.startMonitoring();

    this.networkMonitor.subscribe(async (isOnline) => {
      if (isOnline) {
        logger.info("[OfflineEngine] Online connection detected. Triggering queue sync.");
        this.stateStore.updateState({ isSyncing: true });
        const result = await this.batchProcessor.processQueue(syncExecutorAsync, currentUserId);
        this.stateStore.updateState({
          isSyncing: false,
          lastSyncTimestamp: new Date().toISOString(),
          failedItemCount: result.failed,
        });
      }
    });

    logger.info("[OfflineEngine] Initialization complete.");
  },
};

export default offlineSyncEngine;