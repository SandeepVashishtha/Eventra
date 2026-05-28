/**
 * useOfflineSync
 *
 * Core hook responsible for replaying queued offline actions when the network
 * is restored. Key responsibilities:
 *
 *  1. Watch for "online" events (and check immediately if already online).
 *  2. Validate the current auth token before any replay.
 *  3. Enforce cross-user replay protection via ownership tags on each item.
 *  4. Retry failed requests with exponential back-off + jitter (up to MAX_RETRIES).
 *  5. Detect HTTP 409 Conflict responses and pause to let the user reconcile.
 *  6. Integrate reconcileState() so the conflict modal receives a full field-diff
 *     report alongside the raw item and server state.
 *  7. Prevent concurrent sync runs across browser tabs via Web Locks → localStorage
 *     fallback.
 *  8. Abort all in-flight conflict waiters cleanly on unmount.
 *  9. Dispatch "eventra-offline-sync-status" DOM events so any component can
 *     subscribe to sync progress metrics without polling.
 *
 * @module useOfflineSync
 */

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import {
  getQueueIndexedDB,
  setQueue,
  clearQueue,
  filterQueueByOwnership,
  reconcileState,
} from '../utils/offlineQueue';
import { isTokenValid } from '../utils/tokenUtils';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES       = 3;
const BASE_BACKOFF_MS   = 1_000;
const CONFLICT_TIMEOUT_MS = 60_000; // 60 s before auto-dismissing to server version
const LOCAL_LOCK_KEY    = 'eventra_offline_sync_local_lock';
const LOCAL_LOCK_TIMEOUT_MS = 30_000;
const HEARTBEAT_INTERVAL_MS = 10_000;

// ─── Sync Status Event Helper ─────────────────────────────────────────────────

/**
 * Emit a custom DOM event with current sync progress so any component can
 * subscribe without coupling to this hook directly.
 *
 * @param {'idle'|'syncing'|'done'|'error'} phase
 * @param {object} [detail] - Additional payload merged into the event detail
 */
const dispatchSyncStatus = (phase, detail = {}) => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('eventra-offline-sync-status', {
        detail: { phase, timestamp: Date.now(), ...detail },
      })
    );
  } catch {
    // Non-fatal — status events are best-effort
  }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useOfflineSync = () => {
  const { token, user } = useAuth();
  const isSyncing = useRef(false);

  useEffect(() => {
    /**
     * resolveConflict
     *
     * Dispatches a conflict event to the UI (which renders a modal) and
     * waits for the user to choose how to handle it.
     *
     * Problems with the original implementation
     * ─────────────────────────────────────────
     * The original code created a bare Promise that only resolved when the
     * user clicked a button in the conflict modal. This meant:
     *
     *  1. If the user never saw or dismissed the modal (tab close, navigation,
     *     render failure), the sync loop would hang indefinitely because the
     *     Promise never resolved.
     *
     *  2. isSyncing.current would remain true forever, silently blocking all
     *     future sync attempts for the rest of the session.
     *
     *  3. The window event listener was never removed on early exit (component
     *     unmount, abort), creating a memory leak and potentially handling
     *     conflict events intended for a different item.
     *
     * Fix
     * ───
     *  - Added a 60-second auto-dismiss timeout. If the user does not respond
     *    in time, the conflict is resolved in favour of the server version so
     *    the sync loop can continue.
     *  - Added AbortSignal support so the conflict waiter is cancelled cleanly
     *    when the enclosing useEffect is torn down (component unmount).
     *  - The window event listener is always removed before the Promise
     *    resolves, in all code paths (user response, timeout, abort).
     *  - reconcileState() is now called here to compute and attach a field-level
     *    diff report to the event detail, giving the modal richer context.
     *
     * @param {object} item        - The queued offline action that caused the conflict
     * @param {object} serverState - Current server-side state for the conflicted resource
     * @param {AbortSignal} signal - Optional signal to cancel waiting on unmount
     * @returns {Promise<{resolution: string, mergedPayload?: object}>}
     */
    const resolveConflict = (item, serverState, signal) => {
      return new Promise((resolve) => {
        // Compute field-level diff so the UI can show exactly what changed
        let reconciliationReport = { hasConflict: true, conflicts: [] };
        try {
          reconciliationReport = reconcileState(item, serverState);
        } catch (err) {
          logger.warn('[useOfflineSync] reconcileState threw while computing diff:', err);
        }

        const cleanup = () => {
          window.removeEventListener('eventra-offline-conflict-resolved', handleResolution);
          clearTimeout(timerId);
        };

        const handleResolution = (e) => {
          // Ignore events intended for a different queued item
          if (e.detail.itemId !== item.id) return;
          cleanup();
          resolve(e.detail);
        };

        // Auto-discard after CONFLICT_TIMEOUT_MS: keep the server version so
        // the sync loop is never permanently frozen by an unanswered modal.
        const timerId = setTimeout(() => {
          cleanup();
          logger.warn(
            `[useOfflineSync] Conflict modal for item ${item.id} timed out ` +
            `after ${CONFLICT_TIMEOUT_MS / 1000}s. Discarding local change.`
          );
          resolve({ resolution: 'server' });
        }, CONFLICT_TIMEOUT_MS);

        // Cancel if the enclosing useEffect is cleaned up (component unmount)
        signal?.addEventListener('abort', () => {
          cleanup();
          resolve({ resolution: 'server' });
        }, { once: true });

        window.addEventListener('eventra-offline-conflict-resolved', handleResolution);

        // Notify the UI to open the conflict resolution modal.
        // Include the reconciliation report so the modal can display a diff
        // summary without recomputing it independently.
        window.dispatchEvent(
          new CustomEvent('eventra-offline-conflict', {
            detail: {
              item,
              serverState,
              reconciliationReport,
              timeoutMs: CONFLICT_TIMEOUT_MS,
            },
          })
        );
      });
    };

    // ── Fetch with exponential back-off + jitter ──────────────────────────────
    const postWithBackoff = async (url, payload, authToken, attempt = 0, forceOverride = false) => {
      if (attempt > 0) {
        const baseDelayMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        const jitterMs    = Math.random() * 500;
        const delayMs     = baseDelayMs + jitterMs;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const headers = { 'Content-Type': 'application/json' };
      if (authToken)    headers['Authorization']     = `Bearer ${authToken}`;
      if (forceOverride) headers['X-Override-Conflict'] = 'true';

      const { response, data } = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        },
        10_000
      );

      // Handle 409 Conflict specifically
      if (response.status === 409) {
        const serverState = data || {};
        return { status: 'conflict', serverState };
      }

      if (response.ok) return { status: 'success' };

      if (response.status >= 400 && response.status < 500) {
        logger.warn(
          `Offline queue: server rejected item with ${response.status} — dropping.`,
          await response.text().catch(() => '')
        );
        return { status: 'dropped' };
      }

      throw new Error(`Sync failed with status: ${response.status}`);
    };

    // AbortController used to cancel any in-progress resolveConflict() wait
    // when the useEffect is cleaned up (component unmount or token change).
    const conflictController = new AbortController();

    // ── Core sync loop ────────────────────────────────────────────────────────
    const executeSync = async () => {
      const queue = await getQueueIndexedDB();
      if (queue.length === 0) return;

      // Refuse to replay queued actions under an expired or missing token.
      if (!token || !isTokenValid(token)) {
        toast.warning(
          'Offline actions are pending but your session has expired. Please log in again to sync them.',
          { autoClose: 6000 }
        );
        return;
      }

      // SECURITY: Validate queue ownership to prevent cross-user action replay.
      const currentUserId = user?.id;
      if (!currentUserId) {
        logger.error('[Security] Cannot sync queue: current user ID is missing');
        toast.error(
          'Unable to verify offline actions ownership. Please refresh the page.',
          { autoClose: 6000 }
        );
        return;
      }

      // Filter queue to only include actions owned by current user
      const validatedQueue = filterQueueByOwnership(queue, currentUserId);

      // If all actions were filtered out due to ownership mismatch, clear queue
      if (validatedQueue.length === 0 && queue.length > 0) {
        logger.warn(
          '[Security] Clearing offline queue: all actions belong to different user(s). ' +
          'This prevents cross-user action replay.'
        );
        await clearQueue();
        toast.warning(
          'Offline actions from a previous session have been cleared for security.',
          { autoClose: 5000 }
        );
        return;
      }

      if (validatedQueue.length === 0) return;

      isSyncing.current = true;
      dispatchSyncStatus('syncing', { total: validatedQueue.length, pending: validatedQueue.length });

      try {
        toast.info(`Syncing ${validatedQueue.length} cached offline action(s)...`, {
          autoClose: 2000,
        });

        const failedQueue = [];
        let successCount  = 0;
        let droppedCount  = 0;
        let conflictCount = 0;

        for (const item of validatedQueue) {
          const retries = item.retryCount ?? 0;

          if (retries >= MAX_RETRIES) {
            droppedCount++;
            failedQueue.push(item);
            continue;
          }

          try {
            const url = item.endpoint || API_ENDPOINTS.EVENTS.REGISTER(item.eventId);
            let res;

            if (item.forceOverride) {
              res = await postWithBackoff(url, item.payload, token, 0, true);
            } else {
              res = await postWithBackoff(url, item.payload, token, 0);
            }

            // ── Handle 409 Conflict ─────────────────────────────────────────
            if (res.status === 'conflict') {
              conflictCount++;
              dispatchSyncStatus('conflict', {
                itemId:        item.id,
                conflictCount,
                total:         validatedQueue.length,
              });

              const resolution = await resolveConflict(
                item,
                res.serverState,
                conflictController.signal
              );

              if (resolution.resolution === 'local') {
                // Overwrite server with local payload
                item.forceOverride = true;
                res = await postWithBackoff(url, item.payload, token, 0, true);
              } else if (resolution.resolution === 'merge') {
                // Apply field-merged payload and force-push
                item.payload       = resolution.mergedPayload;
                item.forceOverride = true;
                res = await postWithBackoff(url, item.payload, token, 0, true);
              } else {
                // Discard local — treat as handled success so we proceed
                res = { status: 'success' };
              }
            }

            if (res.status === 'success' || res.status === 'dropped') {
              successCount++;
            } else {
              failedQueue.push({ ...item, retryCount: retries + 1 });
            }
          } catch (error) {
            logger.error('[useOfflineSync] Sync failed for queued item:', error);
            failedQueue.push({ ...item, retryCount: retries + 1 });
          }

          // Emit per-item progress
          dispatchSyncStatus('syncing', {
            total:    validatedQueue.length,
            pending:  validatedQueue.length - successCount - failedQueue.length,
            done:     successCount,
            failed:   failedQueue.length,
          });
        }

        // ── Persist final queue state ────────────────────────────────────────
        if (failedQueue.length > 0) {
          await setQueue(failedQueue);
          toast.warning(
            `Synced ${successCount} registration(s). ${failedQueue.length} remaining in local draft queue.`
          );
        } else {
          await clearQueue();
          if (successCount > 0) {
            toast.success('All offline actions successfully synchronized!');
          }
        }

        if (droppedCount > 0) {
          toast.error(
            `${droppedCount} registration(s) paused after ${MAX_RETRIES} failed attempts. ` +
            'Retained in local drafts.'
          );
        }

        dispatchSyncStatus('done', {
          successCount,
          failedCount:   failedQueue.length,
          droppedCount,
          conflictCount,
        });
      } finally {
        isSyncing.current = false;
      }
    };

    // ── LocalStorage-based lock (fallback for browsers without Web Locks) ─────
    const executeSyncWithLocalLock = async () => {
      const now     = Date.now();
      const lockVal = localStorage.getItem(LOCAL_LOCK_KEY);

      if (lockVal) {
        try {
          const parsed = JSON.parse(lockVal);
          if (parsed?.timestamp && now - parsed.timestamp < LOCAL_LOCK_TIMEOUT_MS) {
            logger.log('[useOfflineSync] Local sync lock is held by another active tab. Skipping.');
            return;
          }
        } catch {
          // Malformed lock value — proceed to acquire
        }
      }

      const currentTabId = Math.random().toString(36).slice(2, 9);
      const lockData     = JSON.stringify({ timestamp: now, tabId: currentTabId });

      try {
        localStorage.setItem(LOCAL_LOCK_KEY, lockData);
      } catch {
        // Private browsing or storage full — run sync directly
        await executeSync();
        return;
      }

      const heartbeatInterval = setInterval(() => {
        try {
          localStorage.setItem(
            LOCAL_LOCK_KEY,
            JSON.stringify({ timestamp: Date.now(), tabId: currentTabId })
          );
        } catch {
          // Non-fatal heartbeat failure
        }
      }, HEARTBEAT_INTERVAL_MS);

      try {
        await executeSync();
      } finally {
        clearInterval(heartbeatInterval);
        try {
          const checkVal = localStorage.getItem(LOCAL_LOCK_KEY);
          if (checkVal) {
            const parsed = JSON.parse(checkVal);
            if (parsed?.tabId === currentTabId) {
              localStorage.removeItem(LOCAL_LOCK_KEY);
            }
          }
        } catch {
          // Non-fatal cleanup failure
        }
      }
    };

    // ── Online event handler ──────────────────────────────────────────────────
    const handleOnline = async () => {
      if (isSyncing.current) return;

      // Prefer native Web Locks API (modern browsers) for cross-tab coordination
      if (typeof navigator?.locks?.request === 'function') {
        try {
          await navigator.locks.request(
            'eventra_offline_sync_lock',
            { ifAvailable: true },
            async (lock) => {
              if (!lock) {
                logger.log('[useOfflineSync] Sync lock is held by another tab via Web Locks. Skipping.');
                return;
              }
              await executeSync();
            }
          );
        } catch (err) {
          logger.warn('[useOfflineSync] Web Locks request failed, falling back to localStorage lock:', err);
          await executeSyncWithLocalLock();
        }
      } else {
        await executeSyncWithLocalLock();
      }
    };

    window.addEventListener('online', handleOnline);

    let idleId    = null;
    let timeoutId = null;

    if (navigator.onLine) {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(() => { void handleOnline(); });
      } else {
        timeoutId = setTimeout(() => { void handleOnline(); }, 200);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      // Abort any in-progress conflict resolution waiter so its event
      // listener is removed and the sync loop exits cleanly on unmount.
      conflictController.abort();
      if (idleId    !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [token, user]);
};

export default useOfflineSync;
