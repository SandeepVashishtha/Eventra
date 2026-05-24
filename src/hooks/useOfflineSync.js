import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiUtils } from '../config/api';
import { getQueue, setQueue, clearQueue } from '../utils/offlineQueue';

const QUEUE_KEY = 'eventra_offline_queue';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000;

const useOfflineSync = () => {
  const { token } = useAuth();
  const isSyncing = useRef(false);

  useEffect(() => {
    const fetchWithBackoff = async (url, payload, authToken, attempt = 0) => {
      if (attempt > 0) {
        const delayMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      try {
        await apiUtils.post(url, payload);
        return true;
      } catch (error) {
        // 4xx → bad request (don't retry); 5xx → may be transient
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          console.warn(
            `Offline queue: server rejected item with ${error.response.status} — dropping.`,
            error.response.data || ''
          );
          return true; // Treat as "handled" — bad data won't succeed on retry
        }
        throw error;
      }
    };

    const handleOnline = async () => {
      // THE GUARD: Prevent multiple concurrent sync runs
      if (isSyncing.current) {
        console.log("Sync already in progress, skipping trigger.");
        return;
      }

      const queue = getQueue();
      if (queue.length === 0) return;

      isSyncing.current = true; // Lock the sync
      
      try {
        toast.info(`Syncing ${queue.length} offline registration(s)…`, { autoClose: 2000 });

        const failedQueue = [];
        let successCount = 0;
        let droppedCount = 0;

        for (const item of queue) {
          const retries = item.retries ?? 0;

          if (retries >= MAX_RETRIES) {
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

            if (ok) successCount++;
          } catch (error) {
            failedQueue.push({ ...item, retries: retries + 1 });
          }
        }

        if (failedQueue.length > 0) {
          setQueue(failedQueue);
          toast.warning(`Synced ${successCount} registration(s). ${failedQueue.length} still queued.`);
        } else {
          clearQueue();
          if (successCount > 0) toast.success('All offline registrations synced!');
        }

        if (droppedCount > 0) {
          toast.error(`${droppedCount} registration(s) dropped after ${MAX_RETRIES} attempts.`);
        }
      } finally {
        // ALWAYS release the lock, even if an error occurs
        isSyncing.current = false;
      }
    };

    window.addEventListener('online', handleOnline);

    // Initial check: if already online, attempt sync
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [token]); 
};

export default useOfflineSync;