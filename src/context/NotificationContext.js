import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiUtils, API_ENDPOINTS } from '../config/api';

const NotificationContext = createContext();

/** Polling interval: refresh notifications every 60 seconds while user is logged in */
const POLLING_INTERVAL_MS = 60_000;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState({
    totalEvents: 0,
    currentStreak: 0,
    badges: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /** Get JWT from storage — single source of truth */
  const getAuthToken = () => localStorage.getItem('token');

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      const response = await apiUtils.get(API_ENDPOINTS.NOTIFICATIONS.BASE, token);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await apiUtils.get(API_ENDPOINTS.USERS.ACHIEVEMENTS, token);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, []);

  /** Mark a single notification as read */
  const markAsRead = useCallback(async (notificationId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await apiUtils.put(
        API_ENDPOINTS.NOTIFICATIONS.READ(notificationId),
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
  }, []);

  /** Mark ALL notifications as read in one shot */
  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    if (!token || notifications.length === 0) return;

    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    try {
      // Optimistic UI update first
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await Promise.allSettled(
        unread.map((n) =>
          apiUtils.put(API_ENDPOINTS.NOTIFICATIONS.READ(n.id), {}, token)
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Re-fetch to restore accurate state
      fetchNotifications();
    }
  }, [notifications, fetchNotifications]);

  // ── Initial fetch + polling ───────────────────────────────────────────────
  useEffect(() => {
    if (!getAuthToken()) return;

    fetchNotifications();
    fetchAchievements();

    // Poll for new notifications at a fixed interval
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchNotifications, fetchAchievements]);

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