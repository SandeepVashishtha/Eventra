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

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    // Defensive check: safeguard against undefined/missing notification endpoints
    const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.ALL || API_ENDPOINTS?.NOTIFICATIONS?.BASE;
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
      console.warn("[NotificationContext] Fetch endpoint is undefined or improperly configured. Skipping network call.");
      return;
    }

    try {
      setLoading(true);
      const response = await apiUtils.get(endpoint, token);
      if (response.ok) {
        const data = await response.json();
        const normalizedData = Array.isArray(data) ? data : [];
        setNotifications(normalizedData);
        setUnreadCount(normalizedData.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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
      const response = await apiUtils.get(endpoint, token);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
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
      const response = await apiUtils.put(
        endpoint,
        {},
        token
      );
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  /** Mark ALL notifications as read in one shot */
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    // Use a functional wrapper block to get access to current state safely without a dependency array trigger
    let unread = [];
    
    setNotifications((prev) => {
      unread = prev.filter((n) => !n.isRead);
      if (unread.length === 0) return prev;
      
      // Return optimistically updated array
      return prev.map((n) => ({ ...n, isRead: true }));
    });

    // If there were no unread items captured, stop execution early
    setTimeout(async () => {
      if (unread.length === 0) return;

      const endpointGetter = API_ENDPOINTS?.NOTIFICATIONS?.READ;
      if (typeof endpointGetter !== "function") {
        console.warn("[NotificationContext] READ endpoint creator is not a function. Skipping bulk update.");
        return;
      }

      try {
        setUnreadCount(0);
        await Promise.allSettled(
          unread.map((n) => {
            const endpoint = endpointGetter(n.id);
            if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
              return Promise.reject("Invalid endpoint");
            }
            return apiUtils.put(endpoint, {}, token);
          })
        );
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        // Re-fetch to restore accurate state on server failure
        fetchNotifications();
      }
    }, 0);
  }, [token, fetchNotifications]);

  // ── Initial fetch + polling ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      // Reset state on logout
      setNotifications([]);
      setUnreadCount(0);
      setAchievements({
        totalEvents: 0,
        currentStreak: 0,
        badges: [],
      });
      return;
    }

    fetchNotifications();
    fetchAchievements();

    // Poll for new notifications at a fixed interval
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [token, fetchNotifications, fetchAchievements]);

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