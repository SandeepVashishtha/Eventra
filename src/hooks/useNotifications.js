import { useEffect, useState } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { logger } from "../utils/logger";

const STORAGE_KEY = "eventra_notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    idbGet(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          try {
            setNotifications(JSON.parse(stored));
          } catch (error) {
            logger.error("Failed to parse notifications from local storage", error);
            setNotifications([]);
          }
        }
      })
      .catch((error) => {
        logger.error("Failed to fetch notifications from indexedDB", error);
        setNotifications([]);
      });
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