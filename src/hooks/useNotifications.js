import { useEffect, useState, useCallback, useRef } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { logger } from "../utils/logger";
import { safeJsonParse } from "../utils/safeJsonParse";
const STORAGE_KEY = "eventra_notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    idbGet(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = safeJsonParse(stored, []);
          setNotifications(parsed);
        }
      })
      .catch((error) => {
        logger.error("Failed to fetch notifications from indexedDB", error);
        setNotifications([]);
      })
      .finally(() => {
        // Allow the persistence effect to run only after the initial
        // load has settled — prevents wiping IndexedDB on mount.
        didLoadRef.current = true;
      });
  }, []);

  // Track whether the initial load from IndexedDB has completed so we
  // don't immediately overwrite persisted data with an empty array on mount.
  const didLoadRef = useRef(false);

  useEffect(() => {
    const handleUpdate = () => {
      idbGet(STORAGE_KEY)
        .then((stored) => {
          if (stored) {
            const parsed = safeJsonParse(stored, []);
            setNotifications(parsed);
          }
        })
        .catch((error) => {
          logger.error("Failed to reload notifications from indexedDB", error);
        });
    };
    window.addEventListener("eventra-notifications-updated", handleUpdate);
    return () => window.removeEventListener("eventra-notifications-updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (!didLoadRef.current) return;
    // Persist on every change — including when the list is cleared to []
    // so that markAllAsRead and future "clear all" features are durable.
    idbSet(STORAGE_KEY, JSON.stringify(notifications)).catch((error) => {
      logger.error("Failed to persist notifications to indexedDB", error);
    });
  }, [notifications]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return false;

    const permission =
      await Notification.requestPermission();

    return permission === "granted";
  };

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        read: false,
        createdAt: new Date().toISOString(),
        ...notification,
      },
      ...prev,
    ]);
    // Dispatch event to sync other instances
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("eventra-notifications-updated"));
    }, 50);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("eventra-notifications-updated"));
    }, 50);
  }, []);

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