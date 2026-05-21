import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const QUEUE_KEY = 'eventra_offline_queue';
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000; // 1s → 2s → 4s per item

/**
 * useOfflineSync
 *
 * Listens for the browser's `online` event and replays any event-registrations
 * that were queued while the user was offline.
 *
 * Improvements over the previous version:
 * - Exponential backoff per queued item (up to MAX_RETRIES attempts)
 * - Per-item retry counter persisted in the queue entry
 * - Items that exceed MAX_RETRIES are dropped with a warning toast
 * - Prevents concurrent sync runs with an `isSyncing` ref guard
 */
const useOfflineSync = () => {
  const { token } = useAuth();
  const isSyncing = useRef(false);

  useEffect(() => {
    /**
     * Attempt a single fetch with exponential back-off.
     * @param {string} url
     * @param {object} payload
     * @param {string|null} authToken
     * @param {number} attempt - 0-indexed retry attempt number
     * @returns {Promise<boolean>} true if the request succeeded
     */
    const fetchWithBackoff = async (url, payload, authToken, attempt = 0) => {
      // Wait before retrying (skip delay on the first attempt)
      if (attempt > 0) {
        const delayMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: JSON.stringify(payload),
      });

      // 2xx → success; 4xx → bad request (don't retry); 5xx → may be transient
      if (response.ok) return true;
      if (response.status >= 400 && response.status < 500) {
        console.warn(
          `Offline queue: server rejected item with ${response.status} — dropping.`,
          await response.text().catch(() => '')
        );
        return true; // Treat as "handled" — bad data won't succeed on retry
      }

      throw new Error(`Server responded with ${response.status}`);
    };

    const handleOnline = async () => {
      // Prevent concurrent sync runs (e.g. if the user rapidly toggles network)
      if (isSyncing.current) return;

      const queueStr = localStorage.getItem(QUEUE_KEY);
      if (!queueStr) return;

      let queue = [];
      try {
        queue = JSON.parse(queueStr);
      } catch {
        localStorage.removeItem(QUEUE_KEY);
        return;
      }

      if (queue.length === 0) return;

      isSyncing.current = true;
      toast.info(`Syncing ${queue.length} offline registration(s)…`, { autoClose: 2000 });

      const failedQueue = [];
      let successCount = 0;
      let droppedCount = 0;

      for (const item of queue) {
        const retries = item.retries ?? 0;

        if (retries >= MAX_RETRIES) {
          console.warn('Offline queue: max retries reached, dropping item:', item);
          droppedCount++;
          continue;
        }

        try {
          const ok = await fetchWithBackoff(
            API_ENDPOINTS.EVENTS.REGISTER(item.eventId),
            item.payload,
            token,
            retries
          );

          if (ok) {
            successCount++;
          }
        } catch (error) {
          // Still a network error — keep in queue with incremented retry counter
          failedQueue.push({ ...item, retries: retries + 1 });
        }
      }

      if (failedQueue.length > 0) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(failedQueue));
        toast.warning(
          `Synced ${successCount} registration(s). ${failedQueue.length} still queued (will retry).`
        );
      } else {
        localStorage.removeItem(QUEUE_KEY);
        if (successCount > 0) {
          toast.success('All offline registrations synced successfully!');
        }
      }

      if (droppedCount > 0) {
        toast.error(
          `${droppedCount} registration(s) could not be synced after ${MAX_RETRIES} attempts and were removed.`
        );
      }

      isSyncing.current = false;
    };

    window.addEventListener('online', handleOnline);

    // Run immediately if already online (e.g. app reloaded while offline queue exists)
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [token]);
};

export default useOfflineSync;
