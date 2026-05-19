import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiUtils, API_ENDPOINTS } from '../config/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState({
    totalEvents: 0,
    currentStreak: 0,
    badges: []
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Helper to get JWT token from storage
  const getAuthToken = () => localStorage.getItem('token');

  const fetchNotifications = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await apiUtils.get(API_ENDPOINTS.NOTIFICATIONS.BASE, token);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchAchievements = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await apiUtils.get(API_ENDPOINTS.USERS.ACHIEVEMENTS, token);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await apiUtils.put(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId), {}, token);
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    // Initial fetch if user token exists
    if (getAuthToken()) {
      fetchNotifications();
      fetchAchievements();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      achievements, 
      unreadCount, 
      fetchNotifications, 
      fetchAchievements, 
      markAsRead 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);