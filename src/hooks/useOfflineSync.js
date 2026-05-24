import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiUtils } from '../config/api';
import { getQueue, setQueue, clearQueue } from '../utils/offlineQueue';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiUtils } from '../config/api';
import { getQueue, setQueue, clearQueue } from '../utils/offlineQueue';

const MAX_RETRIES = 3;

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000;

const useOfflineSync = () => {
  const { token } = useAuth();
  const isSyncing = useRef(false);

  useEffect(() => {
    const postWithBackoff = async (url, payload, authToken, attempt = 0) => {
      if (attempt > 0) {
        const delayMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      try {
        const response = await apiUtils.post(url, payload, authToken);
        return response.ok;
      } catch (error) {
        if (error.status >= 400 && error.status < 500) {
          console.warn(
            `Offline queue: server rejected item with ${error.status}, dropping.`,
            error.data || "",
          );
          return true;
        }

        throw error;
      }
    };

    const handleOnline = async () => {
      if (isSyncing.current) {
        return;
      }

      const queue = getQueue();
      if (queue.length === 0) {
        return;
      }

      isSyncing.current = true;

      try {
        toast.info(`Syncing ${queue.length} offline registration(s)...`, {
          autoClose: 2000,
        });

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
            const ok = await postWithBackoff(
              API_ENDPOINTS.EVENTS.REGISTER(item.eventId),
              item.payload,
              token,
              retries,
            );

            if (ok) {
              successCount++;
            }
          } catch (error) {
            failedQueue.push({ ...item, retries: retries + 1 });
          }
        }

        if (failedQueue.length > 0) {
          setQueue(failedQueue);
          toast.warning(
            `Synced ${successCount} registration(s). ${failedQueue.length} still queued.`,
          );
        } else {
          clearQueue();
          if (successCount > 0) {
            toast.success("All offline registrations synced!");
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
