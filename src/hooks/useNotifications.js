import { useEffect, useState } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";

const STORAGE_KEY = "eventra_notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    idbGet(STORAGE_KEY).then(stored => {
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      idbSet(STORAGE_KEY, JSON.stringify(notifications)).catch(console.error);
    }
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