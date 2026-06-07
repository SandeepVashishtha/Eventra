/**
 * @fileoverview useOfflineSync - Offline queue sync hook with cross-tab locking
 * @module hooks/useOfflineSync
 */
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

import { logger } from "../utils/logger";
import { getQueueIndexedDB, setQueue, clearQueue, filterQueueByOwnership, validateQueueSession } from '../utils/offlineQueue';
// isTokenValid import removed; authentication is now checked via isAuthenticated()
// from AuthContext, which handles both token-based and cookie-managed sessions.
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { safeJsonParse } from "../utils/safeJsonParse";

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000;

/**
 * A custom React hook that syncs queued offline actions to the server
 * when the network connection is restored.
 *
 * Handles exponential backoff retries, conflict resolution via UI modal,
 * cross-tab locking using Web Locks API with localStorage fallback, and
 * security validation to prevent cross-user action replay.
 *
 * Automatically triggers sync on: network reconnect, background sync
 * events, queue updates, and session restore events.
 *
 * @returns {void}
 *
 * @example
 * // Mount once at app root level
 * useOfflineSync();
 */

const useOfflineSync = () => {
  const { token, user, isAuthenticated, loading } = useAuth();
  const isSyncing = useRef(false);
  const isLockPending = useRef(false); // 🔥 FIX: Protects against asynchronous race conditions during Web Lock acquisition
  const conflictControllerRef = useRef(new AbortController());
  const heartbeatIntervalRef = useRef(null);
  const syncLockAborted = useRef(false);

  // Use a mutable ref to hold auth parameters to prevent stale closures
  // inside listeners without re-creating event listeners on every auth update.
  const authRef = useRef({ token, user, isAuthenticated, loading });
  useEffect(() => {
    authRef.current = { token, user, isAuthenticated, loading };
  }, [token, user, isAuthenticated, loading]);

  // Clean up controller on full unmount
  useEffect(() => {
    return () => {
      conflictControllerRef.current.abort();
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    syncLockAborted.current = false;
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
   * 1. If the user never saw or dismissed the modal (tab close, navigation,
   * render failure), the sync loop would hang indefinitely because the
   * Promise never resolved.
   *
   * 2. isSyncing.current would remain true forever, silently blocking all
   * future sync attempts for the rest of the session.
   *
   * 3. The window event listener was never removed on early exit (component
   * unmount, abort), creating a memory leak and potentially handling
   * conflict events intended for a different item.
   *
   * Fix
   * ───
   * - Added a 60-second auto-dismiss timeout. If the user does not respond
   * in time, the conflict is resolved in favour of the server version so
   * the sync loop can continue.
   * - Added AbortSignal support so the conflict waiter is cancelled cleanly
   * when the enclosing useEffect is torn down (component unmount).
   * - The window event listener is always removed before the Promise
   * resolves, in all code paths (user response, timeout, abort).
   *
   * @param {object} item        - The queued offline action that caused the conflict
   * @param {object} serverState - Current server-side state for the conflicted resource
   * @param {AbortSignal} signal - Optional signal to cancel waiting on unmount
   * @returns {Promise<{resolution: string, mergedPayload?: object}>}
   */
  const resolveConflict = (item, serverState, signal) => {
    return new Promise((resolve) => {
      // Immediately resolve if the signal is already aborted. 
      // addEventListener won't fire retroactively on an aborted signal, causing a 60s hang.
      if (signal?.aborted) {
        return resolve({ resolution: "server" });
      }

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

    const postWithBackoff = async (url, payload, authToken, attempt = 0, forceOverride = false, signal = null, idempotencyKey = null) => {
      if (attempt > 0) {
        const baseDelayMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        const jitterMs = Math.random() * 500;
        const delayMs = baseDelayMs + jitterMs;

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      if (forceOverride) headers['X-Override-Conflict'] = 'true';
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

      const { response, data } = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal // 🔥 FIX: Passed signal so network request aborts if component unmounts mid-sync
        },
        10000
      );

      // Handle 409 Conflict specifically
      if (response.status === 409) {
        const serverState = data || {};
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
    // We use the stable ref to prevent it from being prematurely aborted during re-renders
    if (conflictControllerRef.current.signal.aborted) {
      conflictControllerRef.current = new AbortController();
    }
    const conflictController = conflictControllerRef.current;

    const executeSync = async () => {
      const { token: currentToken, user: currentUser, isAuthenticated: currentIsAuthenticated, loading: currentLoading } = authRef.current;
      const queue = await getQueueIndexedDB();
      if (queue.length === 0) {
        return;
      }

      // Wait for AuthContext to finish initial session validation before
      // attempting to sync. During loading, token and user are still null even
      // for valid cookie-managed sessions, so any check here would be premature.
      if (currentLoading) {
        return;
      }

      // Use the same authentication check as the rest of the application.
      // isAuthenticated() correctly handles both token-based and cookie-managed
      // sessions, avoiding the false "session expired" failure that occurred
      // when useOfflineSync called isTokenValid("cookie-managed") directly.
      if (!currentIsAuthenticated()) {
        toast.warning(
          "Offline actions are pending but your session has expired. Please log in again to sync them.",
          { autoClose: 6000 }
        );
        return;
      }

      // SECURITY: Validate queue ownership to prevent cross-user action replay.
      const currentUserId = currentUser?.id;
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

      // If all actions were filtered out due to ownership mismatch, clear the queue
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

      // SECURITY (Issue #5727): Re-validate session IDs — actions queued under a
      // previous session must not replay under a new session even if the userId
      // matches (e.g. same user, different device/tab login cycle).
      const currentSession =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("session_id") || null
          : null;
      const sessionValidatedQueue = validateQueueSession(validatedQueue, currentSession);

      if (sessionValidatedQueue.length === 0 && validatedQueue.length > 0) {
        logger.warn(
          "[Security] Clearing offline queue: all actions have stale session IDs. " +
            "This prevents stale-session cross-user action replay."
        );
        await clearQueue();
        toast.warning(
          "Offline actions from a previous login session have been cleared for security.",
          { autoClose: 5000 }
        );
        return;
      }

      if (sessionValidatedQueue.length === 0) {
        return;
      }

      // Cookie-managed sessions authenticate via the HttpOnly session cookie
      // sent automatically by the browser. Do not forward the "cookie-managed"
      // sentinel string as a Bearer token value; pass null instead so the
      // Authorization header is omitted and the session cookie is used.
      const authToken = currentToken === "cookie-managed" ? null : currentToken;

      isSyncing.current = true;

      try {
        toast.info(`Syncing ${sessionValidatedQueue.length} cached offline action(s)...`, {
          autoClose: 2000,
        });

        const failedQueue = [];
        let successCount = 0;
        let droppedCount = 0;

        for (const item of sessionValidatedQueue) {
          // Halt the zombie loop immediately if the session changed or component unmounted.
          // This prevents making requests with stale tokens and protects IndexedDB from being falsely overwritten below.
          if (conflictController.signal.aborted) {
            logger.warn("[useOfflineSync] Sync aborted due to session change. Halting queue processing.");
            return; 
          }

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
              authToken,
              0,
              false,
              conflictController.signal, 
              item.id // Pass idempotency key
            );

            // Handle Conflict loop — pass the abort signal so the waiter
            // is cancelled cleanly if the component unmounts mid-sync
            if (res.status === "conflict") {
              const resolution = await resolveConflict(item, res.serverState, conflictController.signal);

              if (resolution.resolution === "local") {
                // Retry with force flag
                res = await postWithBackoff(url, item.payload, authToken, 0, true, conflictController.signal, item.id);
              } else if (resolution.resolution === "merge") {
                // Post merged content
                res = await postWithBackoff(url, resolution.mergedPayload, authToken, 0, true, conflictController.signal, item.id);
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
          const parsed = safeJsonParse(lockVal, {});
          if (parsed && parsed.timestamp && now - parsed.timestamp < LOCK_TIMEOUT_MS) {
            logger.log("[useOfflineSync] Local sync lock is held by another active tab. Skipping.");
            return;
          }
        } catch {}
      }

      const currentTabId = Math.random().toString(36).slice(2, 9);
      const lockData = JSON.stringify({ timestamp: now, tabId: currentTabId });
      
      try {
        localStorage.setItem(LOCK_KEY, lockData);
      } catch {
        // If localStorage fails (private mode etc.), run sync directly to avoid blocking
        await executeSync();
        return;
      }

      const heartbeatInterval = setInterval(() => {
        if (syncLockAborted.current) { clearInterval(heartbeatInterval); return; }
        try {
          localStorage.setItem(LOCK_KEY, JSON.stringify({ timestamp: Date.now(), tabId: currentTabId }));
        } catch {}
      }, 10_000);
      heartbeatIntervalRef.current = heartbeatInterval;

      try {
        await executeSync();
      } finally {
        clearInterval(heartbeatInterval);
        try {
          const checkVal = localStorage.getItem(LOCK_KEY);
          if (checkVal) {
            const parsed = safeJsonParse(checkVal, {});
            if (parsed && parsed.tabId === currentTabId) {
              localStorage.removeItem(LOCK_KEY);
            }
          }
        } catch {}
      }
    };

    const handleOnline = async () => {
      // 🔥 FIX: Check both sync state and pending lock state to prevent multiple queuing
      if (isSyncing.current || isLockPending.current) {
        return;
      }
      isLockPending.current = true;

      try {
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
      } finally {
        isLockPending.current = false;
      }
    };

    // 🔥 FIX: Safely define the missing functions introduced by the master branch to prevent ReferenceErrors
    const handleSyncRequested = () => void handleOnline();
    const handleServiceWorkerMessage = (event) => {
      if (event?.data?.type === 'SYNC_REQUESTED') {
        void handleOnline();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("eventra-background-sync", handleSyncRequested);
    window.addEventListener("eventra-offline-queue-updated", handleSyncRequested);
    window.addEventListener("eventra-session-restored", handleSyncRequested);
    navigator.serviceWorker?.addEventListener?.("message", handleServiceWorkerMessage);

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
      window.removeEventListener("eventra-background-sync", handleSyncRequested);
      window.removeEventListener("eventra-offline-queue-updated", handleSyncRequested);
      window.removeEventListener("eventra-session-restored", handleSyncRequested);
      navigator.serviceWorker?.removeEventListener?.("message", handleServiceWorkerMessage);
      
      // Abort any in-progress conflict resolution waiter so its event
      // listener is removed and the sync loop exits cleanly on unmount.
      conflictController.abort();
      
      // Signal the sync lock heartbeat to stop — it runs outside React's
      // lifecycle and won't be caught by the normal finally block on unmount.
      syncLockAborted.current = true;
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);
};

export default useOfflineSync;