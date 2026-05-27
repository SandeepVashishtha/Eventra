import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { getQueueIndexedDB, setQueue, clearQueue } from '../utils/offlineQueue';
import { isTokenValid } from '../utils/tokenUtils';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000;

const useOfflineSync = () => {
  const { token } = useAuth();
  const isSyncing = useRef(false);

  useEffect(() => {
    // Helper to resolve conflict events sequentially
    const resolveConflict = (item, serverState) => {
      return new Promise((resolve) => {
        const handleResolution = (e) => {
          if (e.detail.itemId === item.id) {
            window.removeEventListener("eventra-offline-conflict-resolved", handleResolution);
            resolve(e.detail);
          }
        };
        window.addEventListener("eventra-offline-conflict-resolved", handleResolution);
        
        // Dispatch event for conflict modal UI
        window.dispatchEvent(
          new CustomEvent("eventra-offline-conflict", {
            detail: { item, serverState }
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
        console.warn(
          `Offline queue: server rejected item with ${response.status} — dropping.`,
          await response.text().catch(() => '')
        );
        return { status: "dropped" };
      }

      throw new Error(`Sync failed with status: ${response.status}`);
    };

    const handleOnline = async () => {
      if (isSyncing.current) {
        return;
      }

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

      isSyncing.current = true;

      try {
        toast.info(`Syncing ${queue.length} cached offline action(s)...`, {
          autoClose: 2000,
        });

        const failedQueue = [];
        let successCount = 0;
        let droppedCount = 0;

        for (const item of queue) {
          const retries = item.retryCount ?? 0;

          if (retries >= MAX_RETRIES) {
            droppedCount++;
            continue;
          }

          try {
            // Determine endpoints dynamically
            const url = item.endpoint || API_ENDPOINTS.EVENTS.REGISTER(item.eventId);
            let res = await postWithBackoff(
              url,
              item.payload,
              token,
              retries
            );

            // Handle Conflict loop
            if (res.status === "conflict") {
              const resolution = await resolveConflict(item, res.serverState);
              
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
            `${droppedCount} registration(s) dropped after ${MAX_RETRIES} attempts.`,
          );
        }
      } finally {
        isSyncing.current = false;
      }
    };

    window.addEventListener("online", handleOnline);

    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [token]);
};

export default useOfflineSync;
