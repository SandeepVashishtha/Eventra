import { useEffect, useState, useCallback, useRef } from "react";
import { get as idbGet } from "idb-keyval";
import { logger } from "../utils/logger";
import { safeJsonParse } from "../utils/safeJsonParse";
// Fix (Issue #6525): Import queue utilities instead of writing to IndexedDB directly.
// All writes now go through enqueueNotification() which batches them, retries on
// failure, and dead-letters anything that cannot be persisted after MAX_RETRIES.
import {
  enqueueNotification,
  startNotificationQueue,
  stopNotificationQueue,
} from "../utils/notificationQueue";

const STORAGE_KEY = "eventra_notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Track whether the initial load from IndexedDB has completed so we
  // don't immediately overwrite persisted data with an empty array on mount.
  const didLoadRef = useRef(false);

  // Start the queue processor on mount and stop it on unmount.
  useEffect(() => {
    startNotificationQueue();
    return () => stopNotificationQueue();
  }, []);

  // Load persisted notifications from IndexedDB on mount
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
        didLoadRef.current = true;
      });
  }, []);

  // Re-sync from IndexedDB whenever the queue flushes a batch
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
    return () =>
      window.removeEventListener("eventra-notifications-updated", handleUpdate);
  }, []);

  const addNotification = useCallback((notification) => {
    enqueueNotification(notification);
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

  const requestPermission = async () => {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllAsRead,
    requestPermission,
  };
};
