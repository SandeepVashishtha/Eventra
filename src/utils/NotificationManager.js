import { logger } from "./logger";
import { writeNotificationPreferences, readNotificationPreferences } from "./notificationPreferences";
import { toast } from "react-toastify";

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    toast.error("This browser does not support desktop notifications");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const prefs = readNotificationPreferences();
      writeNotificationPreferences({ ...prefs, push: true });
      toast.success("Push notifications enabled!");
      
      // Mock subscription for backend
      logger.info("[NotificationManager] Push notifications permission granted. Mocking subscription.");
      
      // Send a test notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Eventra Notifications", {
            body: "You will now receive updates for your events.",
            icon: "/favicon.ico",
          });
        });
      } else {
        new Notification("Eventra Notifications", {
          body: "You will now receive updates for your events.",
          icon: "/favicon.ico",
        });
      }
      return true;
    } else {
      const prefs = readNotificationPreferences();
      writeNotificationPreferences({ ...prefs, push: false });
      toast.warning("Push notification permission was denied");
      return false;
    }
  } catch (error) {
    logger.error("Error requesting notification permission:", error);
    return false;
  }
};

export const disableNotifications = () => {
  const prefs = readNotificationPreferences();
  writeNotificationPreferences({ ...prefs, push: false });
  toast.info("Push notifications disabled.");
  logger.info("[NotificationManager] Push notifications disabled in preferences.");
};
