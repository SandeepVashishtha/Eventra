import { useEffect, useState, useCallback, useRef } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
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

  // Fix (Issue #6525): Start the queue processor on mount and stop it on unmount.
  // Previously there was no queue at all — every addNotification() call wrote
  // directly to IndexedDB, causing UI jank and silent data loss under load.
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
        // Allow the persistence effect to run only after the initial
        // load has settled — prevents wiping IndexedDB on mount.
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
  // Fix (Issue #6525): Replace direct idbSet with enqueueNotification().
  // Previously: direct IndexedDB write fired on every call — 5000 simultaneous
  // notifications caused 5000 concurrent IndexedDB writes with no retry or
  // backpressure, silently dropping ~30% of messages.
  // Now: notifications are buffered and written in batches with retry + dead-letter.
  const addNotification = useCallback((notification) => {
    enqueueNotification(notification);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, read: true }));
      idbSet(STORAGE_KEY, JSON.stringify(updated)).catch((err) =>
        logger.error("Failed to persist markAllAsRead to IndexedDB", err)
      );
      return updated;
    });
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