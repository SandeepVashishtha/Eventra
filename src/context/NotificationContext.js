import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { apiUtils, API_ENDPOINTS } from '../config/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

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

  // 🔥 FIX: Track mounted state to prevent ghost updates
  const isMounted = useRef(true);
  const activeTokenRef = useRef(token);

  useEffect(() => {
    activeTokenRef.current = token;
  }, [token]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async (options = { isBackground: false }) => {
    const { isBackground } = options;
    if (!token) return;
    const requestToken = token;

    const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.ALL || API_ENDPOINTS?.NOTIFICATIONS?.BASE;
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
      console.warn("[NotificationContext] Fetch endpoint is undefined. Skipping.");
      return;
    }

    try {
      if (!isBackground && isMounted.current && activeTokenRef.current === requestToken) {
        setLoading(true);
      }

      const response = await apiUtils.get(endpoint);

      // 🔥 FIX: Guard all state updates after await
      if (!isMounted.current || activeTokenRef.current !== requestToken) return;

      const data = response.data;
      const normalizedData = Array.isArray(data) ? data : [];
      setNotifications(normalizedData);
      setUnreadCount(normalizedData.filter((n) => !n.isRead).length);
    } catch (error) {
      if (isMounted.current && activeTokenRef.current === requestToken) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      if (!isBackground && isMounted.current && activeTokenRef.current === requestToken) {
        setLoading(false);
      }
    }
  }, [token]);

  const fetchAchievements = useCallback(async () => {
    if (!token) return;
    const requestToken = token;

    const endpoint = API_ENDPOINTS?.USERS?.ACHIEVEMENTS;
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) {
      console.warn("[NotificationContext] Achievements endpoint undefined. Skipping.");
      return;
    }

    try {
      const response = await apiUtils.get(endpoint);
      // 🔥 FIX: Guard after await
      if (!isMounted.current || activeTokenRef.current !== requestToken) return;
      setAchievements(response.data);
    } catch (error) {
      if (isMounted.current && activeTokenRef.current === requestToken) {
        console.error('Error fetching achievements:', error);
      }
    }
  }, [token]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!token || !notificationId) return;
    const requestToken = token;

    const endpointGetter = API_ENDPOINTS?.NOTIFICATIONS?.READ;
    if (typeof endpointGetter !== "function") return;

    const endpoint = endpointGetter(notificationId);
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) return;

    try {
      await apiUtils.put(endpoint, {});
      if (!isMounted.current || activeTokenRef.current !== requestToken) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      if (isMounted.current && activeTokenRef.current === requestToken) {
        console.error('Error marking notification as read:', error);
      }
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const requestToken = token;

    if (!isMounted.current) return;

    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.READ_ALL;
    if (!endpoint || typeof endpoint !== "string" || endpoint.includes("undefined")) return;

    setUnreadCount(0);

    try {
      await apiUtils.put(endpoint, {});
    } catch (error) {
      if (isMounted.current && activeTokenRef.current === requestToken) {
        console.error('[NotificationContext] Error marking all as read:', error);
        fetchNotifications();
      }
    }
  }, [token, fetchNotifications, notifications]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setAchievements({ totalEvents: 0, currentStreak: 0, badges: [] });
      return;
    }

    const requestToken = token;
    const initData = async () => {
      if (!isMounted.current) return;
      if (isMounted.current && activeTokenRef.current === requestToken) {
        setLoading(true);
      }
      await Promise.allSettled([
        fetchNotifications({ isBackground: true }),
        fetchAchievements()
      ]);
      // 🔥 FIX: Check mounted before final state update
      if (!isMounted.current || activeTokenRef.current !== requestToken) return;
      setLoading(false);
    };

    initData();

    const intervalId = setInterval(() => {
      if (isMounted.current && activeTokenRef.current === requestToken) {
        fetchNotifications({ isBackground: true });
      }
    }, POLLING_INTERVAL_MS);

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
// FEATURE INTEGRATION: Configured timed background push reminders to fire alert notifications 15 minutes before bookmarked sessions begin.
