import { createContext, useContext, useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import useRealTimeConnection, { SSE_STATUS } from "../hooks/useRealTimeConnection";
import { getNotificationCategory, getNotificationMessage, getNotificationTitle } from "../utils/notificationPreferences";
import { useNotificationPreferences } from "../hooks/useNotificationPreferences";
import { usePushSubscription } from "../hooks/usePushSubscription";
import { useNotificationDelivery } from "../hooks/useNotificationDelivery";
import { useNotificationPoller } from "../hooks/useNotificationPoller";
import { useAchievements } from "../hooks/useAchievements";

const NotificationContext = createContext();

const normalizeNotification = (n = {}) => ({
  ...n,
  id: n.id || n._id || `${n.timestamp || n.createdAt || Date.now()}-${getNotificationMessage(n)}`,
  title: getNotificationTitle(n),
  message: getNotificationMessage(n),
  category: getNotificationCategory(n),
  timestamp: n.timestamp || n.createdAt || n.updatedAt || new Date().toISOString(),
});

// 🟢 This helper function handles your assigned interval cleanup task
const useBackgroundInterval = (realtimeStatus, fetchNotifications) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (realtimeStatus === "IDLE") {
        fetchNotifications?.();
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [realtimeStatus, fetchNotifications]);
};

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const hasCompletedInitialFetch = useRef(false);

  const { preferences, defaultPreferences, updatePreferences, savePreferences } =
    useNotificationPreferences();
  const { pushStatus, requestPushPermission, subscribeToPush, unsubscribeFromPush } =
    usePushSubscription(updatePreferences);
  const { showBrowserNotification, deliverNew, markAsReadRef } =
    useNotificationDelivery(preferences);
  const {
    notifications, unreadCount, loading,
    fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
    applyList, seenIds,
  } = useNotificationPoller(deliverNew, hasCompletedInitialFetch);
  const { achievements, fetchAchievements } = useAchievements();

  const ingestRealtime = useCallback(
    (payload) => {
      if (!payload || typeof payload !== "object") return;
      const n = normalizeNotification(payload);
      const isNewUnread = !n.isRead && !seenIds.current.has(n.id);
      applyList([n], { deliverNew: false });
      if (isNewUnread) {
        deliverNew([n]);
      }
    },
    [applyList, deliverNew, seenIds],
  );

  const handleRealtimeMessage = useCallback(
    (data) => {
      if (Array.isArray(data)) { data.forEach(ingestRealtime); return; }
      ingestRealtime(data?.notification || data);
    },
    [ingestRealtime],
  );

  const { status: sseStatus } = useRealTimeConnection("/stream/notifications", {
    onMessage: handleRealtimeMessage,
    enabled: Boolean(token),
  });

  // 🟢 FIXED: Removed the old 'realtimeStatus' state variable & its redundant useEffect entirely.
  // 🟢 Added your required background interval function call here instead.
  useBackgroundInterval(sseStatus, fetchNotifications);

  useEffect(() => {
    if (!markAsReadRef) return;
    markAsReadRef.current = markAsRead;
  }, [markAsRead, markAsReadRef]);

  const groupedNotifications = useMemo(
    () => notifications.reduce((groups, n) => {
      const cat = getNotificationCategory(n);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(n);
      return groups;
    }, {}),
    [notifications],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const requestToken = token;

    if (!isMounted.current) return;

    let hasUnread = false;
    setNotifications((prev) => {
      hasUnread = prev.some((n) => !n.isRead);
      if (!hasUnread) return prev;
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      persistNotifications(updated);
      return updated;
    });

    if (!hasUnread) return;

    const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.READ_ALL;
    if (!isValidEndpoint(endpoint)) return;

    setUnreadCount(0);

    try {
      await apiUtils.put(endpoint, {});
    } catch (error) {
      if (isMounted.current && activeTokenRef.current === requestToken) {
        console.error("[NotificationContext] Error marking all as read:", error);
        fetchNotifications();
      }
    }
  }, [token, fetchNotifications]);

  const subscribeToPush = useCallback(async () => {
    const permission = await requestPushPermission();
    if (permission !== "granted") {
      updatePreferences((current) => ({ ...current, push: false }));
      return { subscribed: false, reason: permission };
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus((current) => ({
        ...current,
        supported: false,
        error: "This browser does not support Web Push subscriptions.",
      }));
      return { subscribed: false, reason: "unsupported" };
    }

    if (!VAPID_PUBLIC_KEY) {
      updatePreferences((current) => ({ ...current, push: true }));
      setPushStatus((current) => ({
        ...current,
        supported: true,
        permission,
        subscribed: false,
        error: "Browser notifications are enabled. Add a VAPID key for server push delivery.",
      }));
      return { subscribed: false, reason: "missing-vapid-key" };
    }

    try {
      const registration = await ensureServiceWorkerRegistration();
      if (!registration) {
        throw new Error("Service worker registration is unavailable.");
      }
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      // Store only non-sensitive subscription metadata locally.
      //
      // The full Web Push subscription object includes keys.p256dh and keys.auth —
      // a 128-bit symmetric secret used to encrypt push payloads. Storing it in
      // plaintext localStorage exposes it to any XSS payload or malicious browser
      // extension that can read localStorage, allowing arbitrary push notifications
      // to be sent to the user's device without the server's VAPID private key.
      //
      // Store only { endpoint, subscribed, subscribedAt } for local status checks.
      // The full subscription (including keys) is sent to the backend over HTTPS
      // where it is stored securely server-side and never re-read by the client.
      const safeLocalRecord = {
        endpoint: subscription?.endpoint ?? "",
        subscribed: true,
        subscribedAt: new Date().toISOString(),
      };

      // Migrate any legacy push subscription object that included sensitive keys.
      // If no legacy object exists, this still writes the safe status record.
      try {
        const existing = window.localStorage.getItem(PUSH_SUBSCRIPTION_KEY);
        if (existing) {
          try {
            const parsed = safeJsonParse(existing, {});
            if (parsed?.keys) {
              logger.info("[NotificationContext] Migrating legacy push subscription record.");
            }
          } catch {
            // Ignore invalid legacy data and continue with the safe record.
          }
        }
        window.localStorage.setItem(PUSH_SUBSCRIPTION_KEY, JSON.stringify(safeLocalRecord));
      } catch {
        // Non-fatal — the subscription is still active; local status just won't persist.
      }

      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.PUSH_SUBSCRIBE;
      if (token && isValidEndpoint(endpoint)) {
        await apiUtils.post(endpoint, subscription);
      }

      updatePreferences((current) => ({ ...current, push: true }));
      await updatePushStatus();
      return { subscribed: true, subscription };
    } catch (error) {
      setPushStatus((current) => ({
        ...current,
        error: error.message || "Push subscription failed.",
      }));
      return { subscribed: false, error };
    }
  }, [requestPushPermission, token, updatePreferences, updatePushStatus]);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      const subscription = await updatePushStatus();
      if (subscription) {
        await subscription.unsubscribe();
      }

      window.localStorage.removeItem(PUSH_SUBSCRIPTION_KEY);
      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.PUSH_UNSUBSCRIBE;
      if (token && isValidEndpoint(endpoint)) {
        await apiUtils.post(endpoint, {});
      }

      updatePreferences((current) => ({ ...current, push: false }));
      await updatePushStatus();
      return { unsubscribed: true };
    } catch (error) {
      setPushStatus((current) => ({
        ...current,
        error: error.message || "Push unsubscribe failed.",
      }));
      return { unsubscribed: false, error };
    }
  }, [token, updatePreferences, updatePushStatus]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setAchievements({ totalEvents: 0, gssocEvents: 0, currentStreak: 0, badges: [] });
      seenNotificationIds.current = new Set();
      hasCompletedInitialFetch.current = false;
      return;
    }

    const requestToken = token;
    const initData = async () => {
      if (!isMounted.current) return;
      if (isMounted.current && activeTokenRef.current === requestToken) {
        setLoading(true);
      }
      await Promise.allSettled([
        fetchNotifications({ isBackground: true }),
        fetchAchievements(),
      ]);
      if (!isMounted.current || activeTokenRef.current !== requestToken) return;
      setLoading(false);
    };

    initData();

    // Visibility-aware polling: skip the network call when the tab is hidden.
    // isPageVisibleRef.current is always current (kept in sync by a dedicated
    // useEffect above) so the callback never reads a stale value, and
    // isPageVisible does NOT need to be in this effect's dependency array.
    // Excluding it prevents the effect from re-running on every tab-restore,
    // which would call initData() again (loading flash) and duplicate the
    // catch-up fetch that the visibility useEffect below already handles.
    const intervalId = setInterval(() => {
      if (isMounted.current && activeTokenRef.current === requestToken && isPageVisibleRef.current) {
        fetchNotificationsRef.current({ isBackground: true });
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // fetchNotifications/fetchAchievements excluded via ref to avoid interval restart on every render

  // Catch-up fetch: when the tab becomes visible after being hidden, immediately
  // fetch notifications so the user sees fresh data without waiting up to
  // POLLING_INTERVAL_MS for the next scheduled tick.
  useEffect(() => {
    if (!isPageVisible || !token) return;
    if (!hasCompletedInitialFetch.current) return;
    fetchNotificationsRef.current({ isBackground: true });
   
  }, [isPageVisible, token]); // fetchNotifications excluded via ref
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        groupedNotifications,
        achievements,
        unreadCount,
        loading,
        realtimeStatus: sseStatus, // Passing sseStatus directly simplifies the logic!
        preferences,
        pushStatus,
        defaultPreferences,
        fetchNotifications,
        fetchAchievements,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        savePreferences,
        requestPushPermission,
        subscribeToPush,
        unsubscribeFromPush,
        showBrowserNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
