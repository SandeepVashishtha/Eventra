/**
 * useOfflineSync — drains the IndexedDB-backed offline action queue whenever
 * connectivity returns, the service worker fires a background sync, or the
 * user presses "Sync Now" in the OfflineManager.
 *
 * Replay is delegated to processQueue(userId, fetchFn) in utils/offlineQueue.js,
 * which handles retries/backoff, conflict resolution, sync budget, ownership
 * and session validation, and persists the resulting queue state.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { processQueue } from "../utils/offlineQueue.js";
import { logger } from "../utils/logger.js";

// Message types the service worker may post to request an offline queue sync.
// EVENTRA_BACKGROUND_SYNC is posted by public/service-worker.js when the
// browser fires the "sync" event for the eventra-offline-queue-sync tag.
// SYNC_REQUESTED is retained for backward compatibility with older SW builds.
// Guarded by tests/backgroundSyncMessageContract.test.mjs.
const SYNC_MESSAGE_TYPES = new Set(["SYNC_REQUESTED", "EVENTRA_BACKGROUND_SYNC"]);

export default function useOfflineSync() {
  const auth = useAuth();
  const { token, user, isAuthenticated, loading } = auth;
  const [syncStatus, setSyncStatus] = useState("IDLE");
  const isSyncing = useRef(false);

  // Keep the latest auth snapshot in a ref so the event listeners never
  // operate on stale closure values (token/user can change on login/logout).
  const authRef = useRef({ token, user, isAuthenticated, loading });
  useEffect(() => {
    authRef.current = { token, user, isAuthenticated, loading };
  }, [token, user, isAuthenticated, loading]);

  const syncNow = useCallback(async () => {
    if (isSyncing.current) return;

    const {
      token: currentToken,
      user: currentUser,
      isAuthenticated: currentIsAuthenticated,
      loading: currentLoading,
    } = authRef.current;

    // Wait for AuthContext to finish initial session validation and only
    // replay under a verified authenticated session. processQueue itself
    // rejects (and blocks) when no current user ID is supplied, which
    // prevents cross-user action replay.
    if (currentLoading || !currentIsAuthenticated() || !currentUser?.id) {
      return;
    }

    isSyncing.current = true;
    setSyncStatus("SYNCING");

    try {
      // Cookie-managed sessions authenticate via the HttpOnly session cookie;
      // do not forward the "cookie-managed" sentinel as a Bearer token.
      const authToken = currentToken === "cookie-managed" ? null : currentToken;
      const fetchFn = (url, options) => {
        const headers = { ...(options?.headers || {}) };
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
        return fetch(url, { ...options, headers, credentials: "include" });
      };

      const result = await processQueue(currentUser.id, fetchFn, {
        onConflict: () => "discard",
      });

      const { dropped = 0, remaining = 0 } = result || {};
      setSyncStatus(remaining > 0 || dropped > 0 ? "PARTIAL" : "SUCCESS");
      return result;
    } catch (error) {
      logger.error("[useOfflineSync] Sync run failed:", error);
      setSyncStatus("FAILED");
    } finally {
      isSyncing.current = false;
      // Emit the unified completion event so the OfflineManager spinner is
      // reset even when processQueue short-circuits (empty queue, no valid
      // items for the current user, etc.).
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new CustomEvent("eventra-offline-queue-processed", { detail: {} }));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      void syncNow();
    };
    const handleSyncRequested = () => {
      void syncNow();
    };
    const handleServiceWorkerMessage = (event) => {
      if (SYNC_MESSAGE_TYPES.has(event?.data?.type)) {
        void syncNow();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("message", handleServiceWorkerMessage);
    window.addEventListener("eventra-background-sync", handleSyncRequested);
    window.addEventListener("eventra-offline-queue-updated", handleSyncRequested);
    window.addEventListener("eventra-session-restored", handleSyncRequested);
    navigator.serviceWorker?.addEventListener?.("message", handleServiceWorkerMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("message", handleServiceWorkerMessage);
      window.removeEventListener("eventra-background-sync", handleSyncRequested);
      window.removeEventListener("eventra-offline-queue-updated", handleSyncRequested);
      window.removeEventListener("eventra-session-restored", handleSyncRequested);
      navigator.serviceWorker?.removeEventListener?.("message", handleServiceWorkerMessage);
    };
  }, [syncNow]);

  return { syncStatus };
}
