import { useState, useCallback, useRef, useEffect } from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import usePageVisibility from "./usePageVisibility";
import seedNotifications from "../data/mockNotifications.json";
import { safeJsonParse } from "../utils/safeJsonParse";
import { getNotificationMessage } from "../utils/notificationPreferences";

const POLLING_INTERVAL_MS = 60_000;
const MAX_SEEN_IDS = 500;
const STORAGE_KEY = "eventra_notification_inbox";

const normalize = (n = {}) => ({
  ...n,
  id: n.id || n._id || `${n.timestamp || n.createdAt || Date.now()}-${getNotificationMessage(n)}`,
  timestamp: n.timestamp || n.createdAt || n.updatedAt || new Date().toISOString(),
});

const persist = (items) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const loadPersisted = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed.map(normalize) : null;
  } catch {
    return null;
  }
};

export function useNotificationPoller(deliverNew, hasCompletedInitialFetchRef) {
  const { token } = useAuth();
  const isPageVisible = usePageVisibility();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const seenIds = useRef(new Set());
  const isMounted = useRef(true);
  const tokenRef = useRef(token);
  const isPageVisibleRef = useRef(isPageVisible);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  useEffect(() => {
    isPageVisibleRef.current = isPageVisible;
  }, [isPageVisible]);

  const addSeenId = (id) => {
    if (seenIds.current.has(id)) return;
    if (seenIds.current.size >= MAX_SEEN_IDS) {
      const oldest = seenIds.current.values().next().value;
      seenIds.current.delete(oldest);
    }
    seenIds.current.add(id);
  };

  const applyList = useCallback(
    (list, { deliverNew: shouldDeliver = false } = {}) => {
      const normalized = list.map(normalize);
      const incomingUnread = normalized.filter((n) => {
        const isNew = !seenIds.current.has(n.id);
        return isNew && !n.isRead;
      });
      normalized.forEach((n) => addSeenId(n.id));
      setNotifications(normalized);
      setUnreadCount(normalized.filter((n) => !n.isRead).length);
      persist(normalized);
      if (shouldDeliver && hasCompletedInitialFetchRef.current && incomingUnread.length > 0) {
        deliverNew(incomingUnread);
      }
      hasCompletedInitialFetchRef.current = true;
    },
    [deliverNew, hasCompletedInitialFetchRef]
  );

  const fetchNotifications = useCallback(
    async (options = {}) => {
      if (!token) return;
      const t = token;
      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.ALL || API_ENDPOINTS?.NOTIFICATIONS?.BASE;
      if (!endpoint) return;
      try {
        if (!options.isBackground && isMounted.current && tokenRef.current === t) setLoading(true);
        const res = await apiUtils.get(endpoint);
        if (!isMounted.current || tokenRef.current !== t) return;
        const data = res.data;
        applyList(Array.isArray(data) ? data : data?.content || [], { deliverNew: true });
      } catch (err) {
        if (isMounted.current && tokenRef.current === t) {
          const persisted = loadPersisted();
          const fallback = persisted?.length ? persisted : seedNotifications.map(normalize);
          applyList(fallback, { deliverNew: false });
        }
      } finally {
        if (!options.isBackground && isMounted.current && tokenRef.current === t) setLoading(false);
      }
    },
    [token, applyList]
  );

  const refetchRef = useRef(fetchNotifications);
  useEffect(() => {
    refetchRef.current = fetchNotifications;
  }, [fetchNotifications]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      seenIds.current = new Set();
      hasCompletedInitialFetchRef.current = false;
      return;
    }
    const t = token;
    if (isMounted.current && tokenRef.current === t) setLoading(true);
    fetchNotifications({ isBackground: true }).then(() => {
      if (isMounted.current && tokenRef.current === t) setLoading(false);
    });
    const interval = setInterval(() => {
      if (isMounted.current && tokenRef.current === t && isPageVisibleRef.current) {
        refetchRef.current({ isBackground: true });
      }
    }, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, fetchNotifications, hasCompletedInitialFetchRef]);

  useEffect(() => {
    if (!isPageVisible || !token) return;
    if (!hasCompletedInitialFetchRef.current) return;
    refetchRef.current({ isBackground: true });
  }, [isPageVisible, token, hasCompletedInitialFetchRef]);

  const markAsRead = useCallback(
    async (id) => {
      if (!token || !id) return;
      const t = token;
      const fn = API_ENDPOINTS?.NOTIFICATIONS?.READ;
      if (typeof fn !== "function") return;
      const endpoint = fn(id);
      if (!endpoint) return;
      try {
        await apiUtils.put(endpoint, {});
        if (!isMounted.current || tokenRef.current !== t) return;
        setNotifications((prev) => {
          const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
          persist(updated);
          return updated;
        });
        setUnreadCount((p) => Math.max(0, p - 1));
      } catch (err) {
        if (isMounted.current && tokenRef.current === t)
          console.error("[useNotificationPoller] markAsRead:", err);
      }
    },
    [token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const t = token;
    let hasUnread = false;
    setNotifications((prev) => {
      hasUnread = prev.some((n) => !n.isRead);
      if (!hasUnread) return prev;
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      persist(updated);
      return updated;
    });
    if (!hasUnread) return;
    const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.READ_ALL;
    if (!endpoint) return;
    setUnreadCount(0);
    try {
      await apiUtils.put(endpoint, {});
    } catch (err) {
      if (isMounted.current && tokenRef.current === t) {
        console.error("[useNotificationPoller] markAllAsRead:", err);
        refetchRef.current({ isBackground: true });
      }
    }
  }, [token]);

  const deleteNotification = useCallback(
    async (id) => {
      if (!id) return;
      const t = token;
      let removedWasUnread = false;
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        removedWasUnread = target ? !target.isRead : false;
        const updated = prev.filter((n) => n.id !== id);
        persist(updated);
        return updated;
      });
      if (removedWasUnread) setUnreadCount((p) => Math.max(0, p - 1));
      const fn = API_ENDPOINTS?.NOTIFICATIONS?.DELETE;
      if (!token || typeof fn !== "function") return;
      const endpoint = fn(id);
      if (!endpoint) return;
      try {
        await apiUtils.delete(endpoint);
      } catch (err) {
        if (isMounted.current && tokenRef.current === t) {
          console.error("[useNotificationPoller] delete:", err);
          refetchRef.current({ isBackground: true });
        }
      }
    },
    [token]
  );

  const markAsReadRef = useRef(markAsRead);
  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    applyList,
    seenIds,
    markAsReadRef,
  };
}
