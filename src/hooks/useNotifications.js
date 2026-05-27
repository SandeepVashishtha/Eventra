import { useEffect, useState } from "react";

const STORAGE_KEY = "eventra_notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse notifications from local storage", error);
        setNotifications([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );
  }, [notifications]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return false;

    const permission =
      await Notification.requestPermission();

    return permission === "granted";
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        read: false,
        createdAt: new Date().toISOString(),
        ...notification,
      },
      ...prev,
    ]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllAsRead,
    requestPermission,
  };
};