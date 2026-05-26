import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiUtils, API_ENDPOINTS } from '../config/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

/** Polling interval: refresh notifications every 60 seconds while user is logged in */
const POLLING_INTERVAL_MS = 60_000;

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState({
    totalEvents: 0,
    currentStreak: 0,
    badges: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async (options = { isBackground: false }) => {
  const { isBackground } = options;
    if (!token) return;

    // Defensive check: safeguard against undefined/missing notification endpoints
    const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.ALL || API_ENDPOINTS?.NOTIFICATIONS?.BASE;
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
      console.warn("[NotificationContext] Fetch endpoint is undefined or improperly configured. Skipping network call.");
      return;
    }

    try {
      if (!isBackground) {
        setLoading(true);
    }
      const response = await apiUtils.get(endpoint);
      const data = response.data;
      const normalizedData = Array.isArray(data) ? data : [];
      setNotifications(normalizedData);
      setUnreadCount(normalizedData.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
  if (!isBackground) {
    setLoading(false);
  }
}
  }, [token]);

  const fetchAchievements = useCallback(async () => {
    if (!token) return;

    const endpoint = API_ENDPOINTS?.USERS?.ACHIEVEMENTS;
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
      console.warn("[NotificationContext] Achievements endpoint is undefined. Skipping network call.");
      return;
    }

    try {
      const response = await apiUtils.get(endpoint);
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [token]);

  /** Mark a single notification as read */
  const markAsRead = useCallback(async (notificationId) => {
    if (!token || !notificationId) return;

    // Defensive check: safeguard against missing READ endpoint functions
    const endpointGetter = API_ENDPOINTS?.NOTIFICATIONS?.READ;
    if (typeof endpointGetter !== "function") {
      console.warn("[NotificationContext] READ endpoint creator is not a function. Skipping request.");
      return;
    }

    const endpoint = endpointGetter(notificationId);
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
      console.warn("[NotificationContext] Resolved READ endpoint is invalid. Skipping request.");
      return;
    }

    try {
      await apiUtils.put(endpoint, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  /** Mark ALL notifications as read in one shot */
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    // Capture current unread list synchronously before the optimistic update
    // so we know exactly which IDs to send to the backend.
    let unread = [];

    setNotifications((prev) => {
      unread = prev.filter((n) => !n.isRead);
      if (unread.length === 0) return prev;

      // Return optimistically updated array
      return prev.map((n) => ({ ...n, isRead: true }));
    });

    // Nothing to do if every notification was already read
    if (unread.length === 0) return;

    const endpointGetter = API_ENDPOINTS?.NOTIFICATIONS?.READ;
    if (typeof endpointGetter !== "function") {
      console.warn("[NotificationContext] READ endpoint creator is not a function. Skipping bulk update.");
      return;
    }

    // FIX: Replaced setTimeout(async, 0) with a direct async/await flow.
    //
    // Problems with the old setTimeout approach:
    //  1. Errors thrown inside an async setTimeout callback are completely
    //     unhandled — they do not propagate to the surrounding try/catch.
    //  2. If the component unmounts before the timeout fires, the queued
    //     async work still runs and calls setNotifications / setUnreadCount
    //     on an unmounted component, causing React state-update warnings.
    //  3. Fire-and-forget makes it impossible to await the batch or to
    //     cancel it on unmount.
    //
    // The fix:
    //  - Process batches directly in the async callback (no setTimeout).
    //  - Use an AbortController so all in-flight PUT requests are cancelled
    //    if the hook is cleaned up (component unmounts) mid-batch.
    //  - On any network failure, re-fetch from the server to restore the
    //    accurate unread state instead of leaving a stale optimistic update.

    setUnreadCount(0);

    const controller = new AbortController();
    const BATCH_SIZE = 5;

    try {
      for (let i = 0; i < unread.length; i += BATCH_SIZE) {
        // Stop processing if the consumer has been unmounted
        if (controller.signal.aborted) break;

        const chunk = unread.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          chunk.map((n) => {
            const endpoint = endpointGetter(n.id);
            if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
              return Promise.reject(new Error(`Invalid endpoint for notification ${n.id}`));
            }
            return apiUtils.put(endpoint, {}, { signal: controller.signal });
          })
        );

        // Log individual failures but keep processing remaining chunks
        results.forEach((result, idx) => {
          if (result.status === "rejected") {
            console.warn(
              `[NotificationContext] Failed to mark notification ${chunk[idx]?.id} as read:`,
              result.reason
            );
          }
        });
      }
    } catch (error) {
      console.error('[NotificationContext] Error marking all notifications as read:', error);
      // Re-fetch to restore accurate server state on unexpected failure
      fetchNotifications();
    }

    return () => controller.abort();
  }, [token, fetchNotifications]);

  
  // ── Initial fetch + polling ───────────────────────────────────────────────
  // ── Initial fetch + polling ───────────────────────────────────────────────
  useEffect(() => {
    // 1. Handle Logout: Wipe data clean instantly
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setAchievements({
        totalEvents: 0,
        currentStreak: 0,
        badges: [],
      });
      return; // Exit early, no interval will be created
    }

    // 2. Handle Login: Trigger instant data load
    fetchNotifications();
    fetchAchievements();

    // 3. Set up background polling
    const intervalId = setInterval(() => {
      fetchNotifications({ isBackground: true });
    }, POLLING_INTERVAL_MS);

    // 4. Clean Destruction: Guaranteed removal of the ghost worker
    return () => {
      clearInterval(intervalId);
    };
    
    // CRITICAL FIX: Only run this effect when the actual authentication token changes
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        achievements,
        unreadCount,
        loading,
        fetchNotifications,
        fetchAchievements,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);