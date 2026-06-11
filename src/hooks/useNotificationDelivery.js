import { useCallback, useRef } from "react";
import toast from 'react-hot-toast';
import {
  getNotificationCategory,
  getNotificationMessage,
  getNotificationTitle,
  playNotificationSound,
  shouldDeliverNotification,
} from "../utils/notificationPreferences";

const getRegistration = async () => {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.getRegistration();
};

export function useNotificationDelivery(preferences) {
  const markAsReadRef = useRef(null);

  const showBrowserNotification = useCallback(
    async (notification) => {
      if (!shouldDeliverNotification(notification, preferences, "push")) return false;
      if (typeof window === "undefined" || !("Notification" in window)) return false;
      if (Notification.permission !== "granted") return false;
      try {
        const registration = await getRegistration();
        const title = getNotificationTitle(notification);
        const options = {
          body: getNotificationMessage(notification),
          icon: "/favicon.png",
          badge: "/favicon.png",
          tag: notification.id || getNotificationCategory(notification),
          data: { url: "/settings/notifications", notificationId: notification.id },
        };
        if (registration?.showNotification) {
          await registration.showNotification(title, options);
        } else {
          new Notification(title, options);
        }
        return true;
      } catch {
        return false;
      }
    },
    [preferences],
  );

  const showToastNotification = useCallback(
    (notification) => {
      if (!shouldDeliverNotification(notification, preferences, "inApp")) return;
      toast(`${getNotificationTitle(notification)} — ${getNotificationMessage(notification)}`, {
        toastId: `notif-${notification.id}`,
        autoClose: 5000,
        onClick: () => markAsReadRef.current?.(notification.id),
      });
    },
    [preferences],
  );

  const deliverNew = useCallback(
    (notifications) => {
      for (const n of notifications) {
        if (shouldDeliverNotification(n, preferences, "push")) showBrowserNotification(n);
        if (shouldDeliverNotification(n, preferences, "inApp")) {
          playNotificationSound(preferences.sound);
          showToastNotification(n);
        }
      }
    },
    [preferences, showBrowserNotification, showToastNotification],
  );

  return { showBrowserNotification, showToastNotification, deliverNew, markAsReadRef };
}
