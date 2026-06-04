import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api";
import { useAuth } from "./AuthContext";
import usePageVisibility from "../hooks/usePageVisibility";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  PUSH_SUBSCRIPTION_KEY,
  getNotificationCategory,
  getNotificationMessage,
  getNotificationTitle,
  normalizeNotificationPreferences,
  playNotificationSound,
  readNotificationPreferences,
  shouldDeliverNotification,
  urlBase64ToUint8Array,
  writeNotificationPreferences,
} from "../utils/notificationPreferences";

const NotificationContext = createContext();

const POLLING_INTERVAL_MS = 60_000;
const runtimeEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined" && process.env
      ? process.env
      : {};
const VAPID_PUBLIC_KEY =
  runtimeEnv.VITE_VAPID_PUBLIC_KEY || runtimeEnv.REACT_APP_VAPID_PUBLIC_KEY || "";

const isValidEndpoint = (endpoint) =>
  endpoint && typeof endpoint === "string" && !endpoint.includes("undefined");

const ensureServiceWorkerRegistration = async () => {
  if (!("serviceWorker" in navigator)) return null;

  const existingRegistration = await navigator.serviceWorker.getRegistration();
  if (existingRegistration) return existingRegistration;

  try {
    return await navigator.serviceWorker.register("/service-worker.js");
  } catch (error) {
    return null;
  }
};

const getExistingServiceWorkerRegistration = async () => {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.getRegistration();
};

const normalizeNotification = (notification = {}) => ({
  ...notification,
  id:
    notification.id ||
    notification._id ||
    `${notification.timestamp || notification.createdAt || Date.now()}-${getNotificationMessage(notification)}`,
  title: getNotificationTitle(notification),
  message: getNotificationMessage(notification),
  category: getNotificationCategory(notification),
  timestamp:
    notification.timestamp ||
    notification.createdAt ||
    notification.updatedAt ||
    new Date().toISOString(),
});

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const isPageVisible = usePageVisibility();
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState({
    totalEvents: 0,
    currentStreak: 0,
    badges: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(() => readNotificationPreferences());
  const [pushStatus, setPushStatus] = useState({
    supported: false,
    permission: typeof Notification !== "undefined" ? Notification.permission : "unsupported",
    subscribed: false,
    error: "",
  });

  const isMounted = useRef(true);
  const activeTokenRef = useRef(token);
  const hasCompletedInitialFetch = useRef(false);

  // Keep a ref in sync with isPageVisible so the polling interval callback
  // can read the latest visibility without requiring isPageVisible in the
  // effect dependency array.  Adding isPageVisible as a dep would re-run the
  // entire polling effect — including initData() — on every tab-restore, which
  // causes an unwanted loading spinner and a double-fetch (initData already
  // fetches, and the separate catch-up effect below also fetches).
  const isPageVisibleRef = useRef(isPageVisible);
  useEffect(() => {
    isPageVisibleRef.current = isPageVisible;
  }, [isPageVisible]);

  // ---------------------------------------------------------------------------
  // Bounded seen-notification Set
  //
  // seenNotificationIds deduplicates incoming notifications so browser push
  // alerts do not fire twice for the same ID across polling cycles. The Set
  // previously grew without bound: every polled ID was added but nothing was
  // ever removed. On long-running sessions (open tabs left running overnight)
  // the Set accumulated thousands of string IDs, increasing GC pressure.
  //
  // MAX_SEEN_IDS caps the Set. When the cap is reached the insertion helper
  // evicts the oldest entry (Sets preserve insertion order, so the first value
  // is the oldest) before adding the new one — a constant-time O(1) eviction.
  // ---------------------------------------------------------------------------
  const MAX_SEEN_IDS = 500;
  const seenNotificationIds = useRef(new Set());

  const addSeenId = (id) => {
    if (seenNotificationIds.current.has(id)) return;
    if (seenNotificationIds.current.size >= MAX_SEEN_IDS) {
      const oldest = seenNotificationIds.current.values().next().value;
      seenNotificationIds.current.delete(oldest);
    }
    seenNotificationIds.current.add(id);
  };

  const groupedNotifications = useMemo(() => {
    return notifications.reduce((groups, notification) => {
      const category = getNotificationCategory(notification);
      if (!groups[category]) groups[category] = [];
      groups[category].push(notification);
      return groups;
    }, {});
  }, [notifications]);

  useEffect(() => {
    activeTokenRef.current = token;
  }, [token]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handlePreferenceUpdate = (event) => {
      setPreferences(
        normalizeNotificationPreferences(event.detail || readNotificationPreferences())
      );
    };

    window.addEventListener("eventra-notification-preferences", handlePreferenceUpdate);
    window.addEventListener("storage", handlePreferenceUpdate);
    return () => {
      window.removeEventListener("eventra-notification-preferences", handlePreferenceUpdate);
      window.removeEventListener("storage", handlePreferenceUpdate);
    };
  }, []);

  const updatePreferences = useCallback((nextPreferences) => {
    setPreferences((current) => {
      const updated =
        typeof nextPreferences === "function" ? nextPreferences(current) : nextPreferences;
      return writeNotificationPreferences(updated);
    });
  }, []);

  const updatePushStatus = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPushStatus({
        supported: false,
        permission: "unsupported",
        subscribed: false,
        error: "Browser push notifications are not supported here.",
      });
      return null;
    }

    try {
      const registration = await getExistingServiceWorkerRegistration();
      const subscription = registration
        ? await registration.pushManager.getSubscription()
        : null;
      setPushStatus({
        supported: true,
        permission: Notification.permission,
        subscribed: Boolean(subscription),
        error: "",
      });
      return subscription;
    } catch (error) {
      setPushStatus({
        supported: true,
        permission: Notification.permission,
        subscribed: false,
        error: error.message || "Unable to read push subscription.",
      });
      return null;
    }
  }, []);

  useEffect(() => {
    updatePushStatus();
  }, [updatePushStatus]);

  const savePreferences = useCallback(
    async (nextPreferences = preferences) => {
      const normalized = writeNotificationPreferences(nextPreferences);
      setPreferences(normalized);

      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.PREFERENCES;
      if (!token || !isValidEndpoint(endpoint)) {
        return { savedRemotely: false, preferences: normalized };
      }

      try {
        await apiUtils.put(endpoint, normalized);
        return { savedRemotely: true, preferences: normalized };
      } catch (error) {
        console.error("[NotificationContext] Error saving notification preferences:", error);
        return { savedRemotely: false, preferences: normalized, error };
      }
    },
    [preferences, token]
  );

  const requestPushPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPushStatus((current) => ({ ...current, permission: "unsupported" }));
      return "unsupported";
    }

    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;

    setPushStatus((current) => ({ ...current, permission }));
    return permission;
  }, []);

  const showBrowserNotification = useCallback(
    async (notification) => {
      if (!shouldDeliverNotification(notification, preferences, "push")) return false;
      if (typeof window === "undefined" || !("Notification" in window)) return false;
      if (Notification.permission !== "granted") return false;

      try {
        const registration =
          "serviceWorker" in navigator ? await getExistingServiceWorkerRegistration() : null;
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
      } catch (error) {
        console.error("[NotificationContext] Error showing browser notification:", error);
        return false;
      }
    },
    [preferences]
  );

  const deliverNewNotifications = useCallback(
    (incomingNotifications) => {
      incomingNotifications.forEach((notification) => {
        if (shouldDeliverNotification(notification, preferences, "push")) {
          showBrowserNotification(notification);
        }
        if (shouldDeliverNotification(notification, preferences, "inApp")) {
          playNotificationSound(preferences.sound);
        }
      });
    },
    [preferences, showBrowserNotification]
  );

  const fetchNotifications = useCallback(
    async (options = { isBackground: false }) => {
      const { isBackground } = options;
      if (!token) return;
      const requestToken = token;

      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.ALL || API_ENDPOINTS?.NOTIFICATIONS?.BASE;
      if (!isValidEndpoint(endpoint)) {
        console.warn("[NotificationContext] Fetch endpoint is undefined. Skipping.");
        return;
      }

      try {
        if (!isBackground && isMounted.current && activeTokenRef.current === requestToken) {
          setLoading(true);
        }

        const response = await apiUtils.get(endpoint);

        if (!isMounted.current || activeTokenRef.current !== requestToken) return;

        const data = response.data;
        const normalizedData = (Array.isArray(data) ? data : []).map(normalizeNotification);
        const incomingUnread = normalizedData.filter((notification) => {
          const isNew = !seenNotificationIds.current.has(notification.id);
          return isNew && !notification.isRead;
        });

        normalizedData.forEach((notification) => addSeenId(notification.id));
        setNotifications(normalizedData);
        setUnreadCount(normalizedData.filter((n) => !n.isRead).length);

        if (hasCompletedInitialFetch.current && incomingUnread.length > 0) {
          deliverNewNotifications(incomingUnread);
        }
        hasCompletedInitialFetch.current = true;
      } catch (error) {
        if (isMounted.current && activeTokenRef.current === requestToken) {
          console.error("Error fetching notifications:", error);
        }
      } finally {
        if (!isBackground && isMounted.current && activeTokenRef.current === requestToken) {
          setLoading(false);
        }
      }
    },
    [token, deliverNewNotifications]
  );

  const fetchAchievements = useCallback(async () => {
    if (!token) return;
    const requestToken = token;

    const endpoint = API_ENDPOINTS?.USERS?.ACHIEVEMENTS;
    if (!isValidEndpoint(endpoint)) {
      console.warn("[NotificationContext] Achievements endpoint undefined. Skipping.");
      return;
    }

    try {
      const response = await apiUtils.get(endpoint);
      if (!isMounted.current || activeTokenRef.current !== requestToken) return;
      setAchievements(response.data);
    } catch (error) {
      if (isMounted.current && activeTokenRef.current === requestToken) {
        console.error("Error fetching achievements:", error);
      }
    }
  }, [token]);

  // Stable refs to prevent interval restart when function identities change
  const fetchNotificationsRef = useRef(fetchNotifications);
  const fetchAchievementsRef = useRef(fetchAchievements);
  useEffect(() => { fetchNotificationsRef.current = fetchNotifications; }, [fetchNotifications]);
  useEffect(() => { fetchAchievementsRef.current = fetchAchievements; }, [fetchAchievements]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token || !notificationId) return;
      const requestToken = token;

      const endpointGetter = API_ENDPOINTS?.NOTIFICATIONS?.READ;
      if (typeof endpointGetter !== "function") return;

      const endpoint = endpointGetter(notificationId);
      if (!isValidEndpoint(endpoint)) return;

      try {
        await apiUtils.put(endpoint, {});
        if (!isMounted.current || activeTokenRef.current !== requestToken) return;
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        if (isMounted.current && activeTokenRef.current === requestToken) {
          console.error("Error marking notification as read:", error);
        }
      }
    },
    [token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const requestToken = token;

    if (!isMounted.current) return;

    let hasUnread = false;
    setNotifications((prev) => {
      hasUnread = prev.some((n) => !n.isRead);
      if (!hasUnread) return prev;
      return prev.map((n) => ({ ...n, isRead: true }));
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
            const parsed = JSON.parse(existing);
            if (parsed?.keys) {
              console.info("[NotificationContext] Migrating legacy push subscription record.");
            }
          } catch {
            // Ignore invalid legacy data and continue with the safe record.
          }
        }
        window.localStorage.setItem(PUSH_SUBSCRIPTION_KEY, JSON.stringify(safeLocalRecord));
      } catch (error) {
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
      setAchievements({ totalEvents: 0, currentStreak: 0, badges: [] });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible, token]); // fetchNotifications excluded via ref

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        groupedNotifications,
        achievements,
        unreadCount,
        loading,
        preferences,
        pushStatus,
        defaultPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
        fetchNotifications,
        fetchAchievements,
        markAsRead,
        markAllAsRead,
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
