// ---------------------------------------------------------------------------
// Notification Queue Utility
// Fix for Issue #6525: Event Notification Queue Processing Delays
//
// Problem: addNotification() fired every notification immediately with no
// batching, no retry logic, and no persistence. Under high load (e.g. 5000
// simultaneous event reminders) this caused:
//   - UI thread jank from rapid successive state updates
//   - Silent message loss when IndexedDB writes failed
//   - No recovery path for failed notifications
//
// Fix: This module wraps notification dispatch in a batched, retryable queue
// backed by IndexedDB. Key features:
//   1. Batching    — notifications are grouped and flushed every FLUSH_INTERVAL_MS
//                    instead of firing individually, preventing UI overload.
//   2. Retry       — failed IndexedDB writes are retried up to MAX_RETRIES times
//                    with exponential backoff.
//   3. Dead-letter — notifications that exhaust all retries are moved to a
//                    dead-letter store in IndexedDB for later inspection/replay.
//   4. Concurrency — a processing lock prevents overlapping flush cycles.
// ---------------------------------------------------------------------------

import { get as idbGet, set as idbSet } from "idb-keyval";
import { logger } from "./logger.js";
import { safeJsonParse } from "../utils/safeJsonParse";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How often (ms) the queue is flushed to IndexedDB and dispatched to the UI */
const FLUSH_INTERVAL_MS = 300;

/** Maximum number of notifications buffered before a forced early flush */
const MAX_BATCH_SIZE = 50;

/** Maximum delivery attempts before a notification is dead-lettered */
const MAX_RETRIES = 3;

/** Base delay (ms) for exponential backoff: attempt 1 → 500ms, 2 → 1000ms, 3 → 2000ms */
const BACKOFF_BASE_MS = 500;

/** IndexedDB keys */
const STORAGE_KEY = "eventra_notifications";
const DEAD_LETTER_KEY = "eventra_notifications_dead_letter";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** In-memory buffer accumulating notifications between flush cycles */
let pendingBatch = [];

/** Whether a flush cycle is currently running — prevents overlapping flushes */
let isFlushing = false;

/** Reference to the active setInterval timer */
let flushTimerId = null;

// ---------------------------------------------------------------------------
// Dead-letter store
// ---------------------------------------------------------------------------

/**
 * Moves a notification that has exhausted all retries to the dead-letter store.
 * Dead-lettered notifications are preserved in IndexedDB for debugging or
 * manual replay — they are never silently discarded.
 *
 * @param {Object} notification - The notification object that failed permanently
 * @param {Error}  lastError    - The last error that caused the failure
 */
const deadLetter = async (notification, lastError) => {
  try {
    const existing = await idbGet(DEAD_LETTER_KEY);
    const deadLettered = existing ? safeJsonParse(existing, {}) : [];
    deadLettered.push({
      ...notification,
      deadLetteredAt: new Date().toISOString(),
      reason: lastError?.message || "Max retries exceeded",
    });
    await idbSet(DEAD_LETTER_KEY, JSON.stringify(deadLettered));
    logger.warn(
      `[NotificationQueue] Notification dead-lettered after ${MAX_RETRIES} retries:`,
      notification.id,
      lastError
    );
  } catch (err) {
    // If even the dead-letter write fails, log it — we've done everything possible.
    logger.error("[NotificationQueue] Failed to write to dead-letter store:", err);
  }
};

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------

/**
 * Attempts to persist the full notifications array to IndexedDB, retrying
 * with exponential backoff on failure. If all attempts are exhausted, the
 * batch is dead-lettered.
 *
 * @param {Object[]} notifications - Current full notifications array to persist
 * @param {Object[]} batch         - The batch being written (for dead-lettering)
 * @param {number}   attempt       - Current attempt index (0-based)
 */
const persistWithRetry = async (notifications, batch, attempt = 0) => {
  try {
    await idbSet(STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    if (attempt < MAX_RETRIES - 1) {
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt);
      logger.warn(
        `[NotificationQueue] IndexedDB write failed (attempt ${attempt + 1}/${MAX_RETRIES}). ` +
          `Retrying in ${delay}ms...`,
        err
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return persistWithRetry(notifications, batch, attempt + 1);
    }

    // All retries exhausted — dead-letter every notification in the failed batch
    logger.error(
      `[NotificationQueue] Persistence failed after ${MAX_RETRIES} attempts. Dead-lettering batch.`,
      err
    );
    for (const notification of batch) {
      await deadLetter(notification, err);
    }
  }
};

// ---------------------------------------------------------------------------
// Flush cycle
// ---------------------------------------------------------------------------

/**
 * Flushes the pending batch:
 *  1. Drains pendingBatch into a local snapshot (keeps the buffer clear for
 *     new incoming notifications during the async write).
 *  2. Merges the batch with the existing persisted notifications.
 *  3. Persists to IndexedDB with retry/dead-letter fallback.
 *  4. Dispatches a DOM event so all subscribed UI components re-render.
 */
const flushBatch = async () => {
  // Nothing to flush or already in progress
  if (pendingBatch.length === 0 || isFlushing) return;

  isFlushing = true;

  // Drain the buffer atomically — new items arriving during the async write
  // will accumulate in pendingBatch and be picked up in the next flush cycle.
  const batch = pendingBatch.splice(0, pendingBatch.length);

  try {
    // Read current persisted state
    const stored = await idbGet(STORAGE_KEY);
    const existing = stored ? safeJsonParse(stored, {}) : [];

    // Merge: prepend new batch (newest-first ordering)
    const merged = [...batch, ...existing];

    // Persist with retry + dead-letter fallback
    await persistWithRetry(merged, batch);

    // Notify all UI subscribers to re-fetch from IndexedDB
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("eventra-notifications-updated"));
    }

    logger.info(`[NotificationQueue] Flushed batch of ${batch.length} notification(s).`);
  } catch (err) {
    logger.error("[NotificationQueue] Unexpected error during flush:", err);
    // Put the batch back into pendingBatch so it isn't permanently dropped
    pendingBatch.unshift(...batch);
  } finally {
    isFlushing = false;
  }
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Starts the background flush timer. Safe to call multiple times — only one
 * timer will be active at a time. Call once on app initialisation.
 */
export const startNotificationQueue = () => {
  if (flushTimerId !== null) return;
  flushTimerId = setInterval(flushBatch, FLUSH_INTERVAL_MS);
  logger.info(
    `[NotificationQueue] Started. Flush interval: ${FLUSH_INTERVAL_MS}ms, ` +
      `Max batch: ${MAX_BATCH_SIZE}, Max retries: ${MAX_RETRIES}.`
  );
};

/**
 * Stops the flush timer. Call on app teardown or in tests.
 */
export const stopNotificationQueue = () => {
  if (flushTimerId !== null) {
    clearInterval(flushTimerId);
    flushTimerId = null;
  }
};

/**
 * Enqueues a notification for batched delivery.
 *
 * Replaces direct calls to idbSet inside addNotification(). The notification
 * is buffered in memory and written to IndexedDB in the next flush cycle
 * (at most FLUSH_INTERVAL_MS ms away), preventing rapid successive writes
 * under high load.
 *
 * If the buffer reaches MAX_BATCH_SIZE before the next timer tick, a flush
 * is triggered immediately to prevent unbounded memory growth.
 *
 * @param {Object} notification - Notification object to enqueue
 */
export const enqueueNotification = (notification) => {
  const item = {
    id: Date.now() + Math.random(), // avoid collisions in rapid-fire scenarios
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };

  pendingBatch.push(item);

  // Force an early flush if the batch is getting large
  if (pendingBatch.length >= MAX_BATCH_SIZE) {
    logger.warn(
      `[NotificationQueue] Batch size reached ${MAX_BATCH_SIZE}. Triggering early flush.`
    );
    flushBatch();
  }
};

/**
 * Returns all notifications from the dead-letter store.
 * Useful for a debug panel or admin "failed notifications" view.
 *
 * @returns {Promise<Object[]>}
 */
export const getDeadLetteredNotifications = async () => {
  try {
    const stored = await idbGet(DEAD_LETTER_KEY);
    return stored ? safeJsonParse(stored, {}) : [];
  } catch (err) {
    logger.error("[NotificationQueue] Failed to read dead-letter store:", err);
    return [];
  }
};

/**
 * Clears the dead-letter store. Call after manual replay or admin review.
 *
 * @returns {Promise<void>}
 */
export const clearDeadLetterStore = async () => {
  try {
    await idbSet(DEAD_LETTER_KEY, JSON.stringify([]));
    logger.info("[NotificationQueue] Dead-letter store cleared.");
  } catch (err) {
    logger.error("[NotificationQueue] Failed to clear dead-letter store:", err);
  }
};
