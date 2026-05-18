import React, { createContext, useState, useEffect, useContext } from 'react';

// Adjust the base API import according to Eventra's actual Axios configuration file if available
// For now, we fetch using standard fetch or an explicit URL structure
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState({
    totalEvents: 0,
    currentStreak: 0,
    badges: []
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Helper to get JWT token from storage (verify if Eventra uses localStorage or cookies)
  const getAuthToken = () => localStorage.getItem('token');

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
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
    try {
      const response = await fetch(`${API_URL}/users/achievements`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
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