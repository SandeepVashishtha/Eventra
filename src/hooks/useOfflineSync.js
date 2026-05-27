import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { logger } from "../utils/logger";
import { getQueueIndexedDB, setQueue, clearQueue, filterQueueByOwnership } from '../utils/offlineQueue';
import { isTokenValid } from '../utils/tokenUtils';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000;

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
   *
   * @param {object} item        - The queued offline action that caused the conflict
   * @param {object} serverState - Current server-side state for the conflicted resource
   * @param {AbortSignal} signal - Optional signal to cancel waiting on unmount
   * @returns {Promise<{resolution: string, mergedPayload?: object}>}
   */
  const resolveConflict = (item, serverState, signal) => {
    return new Promise((resolve) => {
      const AUTO_DISMISS_MS = 60_000; // 60 s — avoid hanging the sync loop forever

      const cleanup = () => {
        window.removeEventListener("eventra-offline-conflict-resolved", handleResolution);
        clearTimeout(timerId);
      };

      const handleResolution = (e) => {
        // Ignore events intended for a different queued item
        if (e.detail.itemId !== item.id) return;
        cleanup();
        resolve(e.detail);
      };

      // Auto-discard after 60 s: keep the server version so the sync loop
      // is never permanently frozen by an unanswered modal.
      const timerId = setTimeout(() => {
        cleanup();
        logger.warn(
          `[useOfflineSync] Conflict modal for item ${item.id} timed out after ${AUTO_DISMISS_MS / 1000}s. Discarding local change.`
        );
        resolve({ resolution: "server" });
      }, AUTO_DISMISS_MS);

      // Cancel if the enclosing useEffect is cleaned up (component unmount)
      signal?.addEventListener("abort", () => {
        cleanup();
        resolve({ resolution: "server" });
      }, { once: true });

      window.addEventListener("eventra-offline-conflict-resolved", handleResolution);

      // Notify the UI to open the conflict resolution modal
      window.dispatchEvent(
        new CustomEvent("eventra-offline-conflict", {
          detail: { item, serverState },
        })
      );
    });
  };


    const postWithBackoff = async (url, payload, authToken, attempt = 0, forceOverride = false) => {
      if (attempt > 0) {
        const delayMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      if (forceOverride) headers['X-Override-Conflict'] = 'true';

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      // Handle 409 Conflict specifically
      if (response.status === 409) {
        const serverState = await response.json().catch(() => ({}));
        return { status: "conflict", serverState };
      }

      if (response.ok) return { status: "success" };

      if (response.status >= 400 && response.status < 500) {
        logger.warn(
          `Offline queue: server rejected item with ${response.status} — dropping.`,
          await response.text().catch(() => '')
        );
        return { status: "dropped" };
      }

      throw new Error(`Sync failed with status: ${response.status}`);
    };

    // AbortController used to cancel any in-progress resolveConflict() wait
    // when the useEffect is cleaned up (component unmount or token change).
    const conflictController = new AbortController();

    const executeSync = async () => {
      const queue = await getQueueIndexedDB();
      if (queue.length === 0) {
        return;
      }

      // Refuse to replay queued actions under an expired or missing token.
      // The queue was saved under a previous session; firing it now could
      // attach those actions to whichever user happens to be logged in.
      if (!token || !isTokenValid(token)) {
        toast.warning(
          "Offline actions are pending but your session has expired. Please log in again to sync them.",
          { autoClose: 6000 }
        );
        return;
      }

      // SECURITY: Validate queue ownership to prevent cross-user action replay.
      // Only replay actions that were queued by the currently logged-in user.
      // This prevents User A's queued actions from executing under User B's session.
      const currentUserId = user?.id;
      if (!currentUserId) {
        logger.error('[Security] Cannot sync queue: current user ID is missing');
        toast.error(
          "Unable to verify offline actions ownership. Please refresh the page.",
          { autoClose: 6000 }
        );
        return;
      }

      // Filter queue to only include actions owned by current user
      const validatedQueue = filterQueueByOwnership(queue, currentUserId);

      // If all actions were filtered out due to ownership mismatch,
      // clear the queue to prevent re-checks on every session
      if (validatedQueue.length === 0 && queue.length > 0) {
        logger.warn(
          '[Security] Clearing offline queue: all actions belong to different user(s). ' +
          'This prevents cross-user action replay.'
        );
        await clearQueue();
        toast.warning(
          "Offline actions from a previous session have been cleared for security.",
          { autoClose: 5000 }
        );
        return;
      }

      // If queue is now empty after validation, return early
      if (validatedQueue.length === 0) {
        return;
      }

      isSyncing.current = true;

      try {
        toast.info(`Syncing ${validatedQueue.length} cached offline action(s)...`, {
          autoClose: 2000,
        });

        const failedQueue = [];
        let successCount = 0;
        let droppedCount = 0;

        for (const item of validatedQueue) {
          const retries = item.retryCount ?? 0;

          if (retries >= MAX_RETRIES) {
            droppedCount++;
            failedQueue.push(item);
            continue;
          }

          try {
            // Determine endpoints dynamically
            const url = item.endpoint || API_ENDPOINTS.EVENTS.REGISTER(item.eventId);
            let res = await postWithBackoff(
              url,
              item.payload,
              token,
              0
            );

            // Handle Conflict loop — pass the abort signal so the waiter
            // is cancelled cleanly if the component unmounts mid-sync
            if (res.status === "conflict") {
              const resolution = await resolveConflict(item, res.serverState, conflictController.signal);

              if (resolution.resolution === "local") {
                // Retry with force flag
                res = await postWithBackoff(url, item.payload, token, 0, true);
              } else if (resolution.resolution === "merge") {
                // Post merged content
                res = await postWithBackoff(url, resolution.mergedPayload, token, 0, true);
              } else {
                // Discard local (treated as handled success so we proceed)
                res = { status: "success" };
              }
            }

            if (res.status === "success" || res.status === "dropped") {
              successCount++;
            } else {
              failedQueue.push({ ...item, retryCount: retries + 1 });
            }
          } catch (error) {
            logger.error("[useOfflineSync] Sync failed for queued item:", error);
            failedQueue.push({ ...item, retryCount: retries + 1 });
          }
        }

        if (failedQueue.length > 0) {
          await setQueue(failedQueue);
          toast.warning(
            `Synced ${successCount} registration(s). ${failedQueue.length} remaining in local draft queue.`,
          );
        } else {
          await clearQueue();
          if (successCount > 0) {
            toast.success("All offline actions successfully synchronized!");
          }
        }

        if (droppedCount > 0) {
          toast.error(
            `${droppedCount} registration(s) paused after ${MAX_RETRIES} failed attempts. Retained in local drafts.`,
          );
        }
      } finally {
        isSyncing.current = false;
      }
    };

    const executeSyncWithLocalLock = async () => {
      const LOCK_KEY = "eventra_offline_sync_local_lock";
      const LOCK_TIMEOUT_MS = 30_000;

      const now = Date.now();
      const lockVal = localStorage.getItem(LOCK_KEY);

      if (lockVal) {
        try {
          const parsed = JSON.parse(lockVal);
          if (parsed && parsed.timestamp && now - parsed.timestamp < LOCK_TIMEOUT_MS) {
            logger.log("[useOfflineSync] Local sync lock is held by another active tab. Skipping.");
            return;
          }
        } catch (e) {}
      }

      const currentTabId = Math.random().toString(36).slice(2, 9);
      const lockData = JSON.stringify({ timestamp: now, tabId: currentTabId });
      
      try {
        localStorage.setItem(LOCK_KEY, lockData);
      } catch (e) {
        // If localStorage fails (private mode etc.), run sync directly to avoid blocking
        await executeSync();
        return;
      }

      const heartbeatInterval = setInterval(() => {
        try {
          localStorage.setItem(LOCK_KEY, JSON.stringify({ timestamp: Date.now(), tabId: currentTabId }));
        } catch (e) {}
      }, 10_000);

      try {
        await executeSync();
      } finally {
        clearInterval(heartbeatInterval);
        try {
          const checkVal = localStorage.getItem(LOCK_KEY);
          if (checkVal) {
            const parsed = JSON.parse(checkVal);
            if (parsed && parsed.tabId === currentTabId) {
              localStorage.removeItem(LOCK_KEY);
            }
          }
        } catch (e) {}
      }
    };

    const handleOnline = async () => {
      if (isSyncing.current) {
        return;
      }

      // Check if navigator.locks is supported natively (modern browsers)
      if (typeof navigator?.locks?.request === "function") {
        try {
          await navigator.locks.request("eventra_offline_sync_lock", { ifAvailable: true }, async (lock) => {
            if (!lock) {
              logger.log("[useOfflineSync] Sync lock is held by another tab via Web Locks. Skipping.");
              return;
            }
            await executeSync();
          });
        } catch (err) {
          logger.warn("[useOfflineSync] Web Locks request failed, falling back to LocalStorage lock:", err);
          await executeSyncWithLocalLock();
        }
      } else {
        await executeSyncWithLocalLock();
      }
    };

    window.addEventListener("online", handleOnline);

    let idleId = null;
    let timeoutId = null;

    if (navigator.onLine) {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => {
          void handleOnline();
        });
      } else {
        timeoutId = setTimeout(() => {
          void handleOnline();
        }, 200);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      // Abort any in-progress conflict resolution waiter so its event
      // listener is removed and the sync loop exits cleanly on unmount.
      conflictController.abort();
      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [token, user]);
};

export default useOfflineSync;
