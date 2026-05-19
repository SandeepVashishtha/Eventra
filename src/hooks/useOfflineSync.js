import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const QUEUE_KEY = 'eventra_offline_queue';

const useOfflineSync = () => {
  const { token } = useAuth();

  useEffect(() => {
    const handleOnline = async () => {
      const queueStr = localStorage.getItem(QUEUE_KEY);
      if (!queueStr) return;

      let queue = [];
      try {
        queue = JSON.parse(queueStr);
      } catch (e) {
        localStorage.removeItem(QUEUE_KEY);
        return;
      }

      if (queue.length === 0) return;

      // Notify user sync is starting
      toast.info(`Syncing ${queue.length} offline registration(s)...`, { autoClose: 2000 });

      const failedQueue = [];
      let successCount = 0;

      for (const item of queue) {
        try {
          const response = await fetch(API_ENDPOINTS.EVENTS.REGISTER(item.eventId), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(item.payload),
          });

          if (response.ok) {
            successCount++;
          } else {
            // If the server rejected it (e.g. 400 Bad Request), we still drop it from the queue
            // to avoid infinite retry loops on invalid data.
            console.error('Registration rejected by server:', await response.text());
          }
        } catch (error) {
          // Network error again, keep in queue
          failedQueue.push(item);
        }
      }

      if (failedQueue.length > 0) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(failedQueue));
        if (successCount > 0) {
          toast.warning(`Synced ${successCount} registration(s). ${failedQueue.length} remain queued.`);
        }
      } else {
        localStorage.removeItem(QUEUE_KEY);
        if (successCount > 0) {
          toast.success('Offline registrations synced successfully!');
        }
      }
    };

    window.addEventListener('online', handleOnline);

    // Also run once on mount in case they came online before the app loaded
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [token]);
};

export default useOfflineSync;
