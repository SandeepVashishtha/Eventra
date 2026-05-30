/**
 * @fileoverview useNotifications - Notification management hook
 * @module hooks/useNotifications
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { logger } from "../utils/logger";

const STORAGE_KEY = "eventra_notifications";

/**
 * A custom React hook that manages in-app notifications with
 * IndexedDB persistence using idb-keyval.
 *
 * Loads stored notifications on mount, persists updates after the
 * initial load completes, and exposes helpers to add notifications,
 * mark all as read, and request push permission.
 *
 * @returns {{
 *   notifications: Object[],
 *   unreadCount: number,
 *   addNotification: (notification: Object) => void,
 *   markAllAsRead: () => void,
 *   requestPermission: () => Promise<boolean>
 * }}
 *
 * @example
 * const { notifications, unreadCount, addNotification, markAllAsRead } = useNotifications();
 * // Add a notification
 * addNotification({ title: 'New Event', message: 'Check it out!' });
 * // Mark all as read
 * markAllAsRead();
 */
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
    if (!didLoadRef.current) return;
    // Persist on every change — including when the list is cleared to []
    // so that markAllAsRead and future "clear all" features are durable.
    idbSet(STORAGE_KEY, JSON.stringify(notifications)).catch(console.error);
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
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
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