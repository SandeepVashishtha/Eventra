import { pushToNotificationQueue, syncNotificationQueue } from "../utils/notificationQueue.js";
import { useState, useCallback, useRef, useEffect } from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";
import { useAuth } from "../context/AuthContext.js";
import usePageVisibility from "./usePageVisibility.js";
import { safeJsonParse } from "../utils/safeJsonParse.js";
import { getNotificationDedupeKey } from "../utils/notificationPreferences.js";
import { get as idbGet, del as idbDel } from "idb-keyval";
import { showUndoToast } from "../utils/toast.js";

const POLLING_INTERVAL_MS = 60_000;
const MAX_SEEN_IDS = 10000; // Increased to prevent eviction loops
const NOTIFICATION_INBOX_PREFIX = "eventra_notification_inbox";
const GUEST_INBOX_KEY = `${NOTIFICATION_INBOX_PREFIX}_guest`;

// The raw `user` blob in localStorage is written by syncSecureStorage — it's
// an AES-GCM ciphertext envelope, not a plain profile JSON — so the previous
// implementation that tried `JSON.parse(localStorage.getItem('user')).id`
// threw silently in every browser with WebCrypto and every logged-in user
// ended up sharing `eventra_notification_inbox_guest`. Take the id from the
// AuthContext-provided user object instead (see #10387).
const getStorageKey = (userId) => {
  if (typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITE_TEST_MODE === "true")) {
    return NOTIFICATION_INBOX_PREFIX;
  }
  if (!userId) return GUEST_INBOX_KEY;
  return `${NOTIFICATION_INBOX_PREFIX}_${userId}`;
};

const normalize = (n = {}) => ({
  ...n,
  id: getNotificationDedupeKey(n) || `${n.timestamp || n.createdAt || Date.now()}-${Math.random().toString(36).slice(2)}`,
  timestamp: n.timestamp || n.createdAt || n.updatedAt || new Date().toISOString(),
  isRead: Boolean(n.isRead ?? n.read),
});

const persist = (items, storageKey) => {
  if (typeof window === "undefined" || !window.localStorage || !storageKey) return;
  try { window.localStorage.setItem(storageKey, JSON.stringify(items)); } catch (e) { console.warn("[useNotificationPoller] Failed to persist notifications", e); }
};

const loadPersisted = (storageKey) => {
  if (typeof window === "undefined" || !window.localStorage || !storageKey) return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed.map(normalize) : null;
  } catch { return null; }
};

export function useNotificationPoller(deliverNew, hasCompletedInitialFetchRef) {
  const { token, user } = useAuth();
  const isPageVisible = usePageVisibility();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const seenIds = useRef(new Set());
  const isMounted = useRef(true);
  const tokenRef = useRef(token);
  const isPageVisibleRef = useRef(isPageVisible);
  const storageKeyRef = useRef(getStorageKey(user?.id));
  const notificationsRef = useRef(notifications);

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { isPageVisibleRef.current = isPageVisible; }, [isPageVisible]);
  useEffect(() => { storageKeyRef.current = getStorageKey(user?.id); }, [user?.id]);
  useEffect(() => { notificationsRef.current = notifications; }, [notifications]);

  // One-shot migration: when a user first logs in, adopt any inbox that was
  // still sitting under the guest key (because the old code path routed every
  // authenticated user into it). Merge, not replace, so we don't clobber
  // whatever the user already has under their scoped key on subsequent logins.
  useEffect(() => {
    if (!user?.id || typeof window === "undefined" || !window.localStorage) return;
    const userKey = getStorageKey(user.id);
    if (userKey === GUEST_INBOX_KEY) return;
    try {
      const guestRaw = window.localStorage.getItem(GUEST_INBOX_KEY);
      if (!guestRaw) return;
      const guestParsed = safeJsonParse(guestRaw, []);
      if (!Array.isArray(guestParsed) || guestParsed.length === 0) {
        window.localStorage.removeItem(GUEST_INBOX_KEY);
        return;
      }
      const existingRaw = window.localStorage.getItem(userKey);
      const existingParsed = existingRaw ? safeJsonParse(existingRaw, []) : [];
      const existing = Array.isArray(existingParsed) ? existingParsed : [];
      const seen = new Set(existing.map((n) => n?.id).filter(Boolean));
      const merged = [...existing];
      guestParsed.forEach((n) => {
        if (!n) return;
        const normalized = normalize(n);
        if (!seen.has(normalized.id)) merged.push(normalized);
      });
      merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      window.localStorage.setItem(userKey, JSON.stringify(merged));
      window.localStorage.removeItem(GUEST_INBOX_KEY);
      if (isMounted.current) {
        setNotifications(merged);
        notificationsRef.current = merged;
        setUnreadCount(merged.filter((n) => !n.isRead).length);
        merged.forEach((n) => {
          if (n.id) addSeenId(n.id);
        });
      }
    } catch (e) { console.warn("[useNotificationPoller] Failed to persist notifications", e); }
  }, [user?.id]);

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
      // Dedupe the batch by canonical id, then merge against the latest known
      // list (notificationsRef keeps the freshest state between renders). The
      // same logical notification arriving over SSE and the poller therefore
      // converges on a single entry, and unreadCount is recomputed from that
      // deduped set so it can never be counted twice (issue #14612).
      const byId = new Map();
      const deduped = [];
      for (const raw of list) {
        const n = normalize(raw);
        if (byId.has(n.id)) continue;
        byId.set(n.id, n);
        deduped.push(n);
      }
      const incomingUnread = deduped.filter((n) => {
        const isNew = !seenIds.current.has(n.id);
        return isNew && !n.isRead;
      });
      deduped.forEach((n) => addSeenId(n.id));
      const prev = notificationsRef.current || [];
      const persisted = loadPersisted(storageKeyRef.current) || [];
      const existingMap = new Map();
      persisted.forEach((p) => { if (p?.id) existingMap.set(p.id, p); });
      prev.forEach((p) => { if (p?.id) existingMap.set(p.id, p); });
      const existingList = Array.from(existingMap.values());
      const merged = deduped.concat(existingList.filter((p) => !byId.has(p.id)));
      const sorted = merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      notificationsRef.current = sorted;
      setNotifications(sorted);
      persist(sorted, storageKeyRef.current);
      setUnreadCount(Math.max(0, sorted.filter((n) => !n.isRead).length));
      if (shouldDeliver && hasCompletedInitialFetchRef.current && incomingUnread.length > 0) {
        deliverNew(incomingUnread);
      }
      hasCompletedInitialFetchRef.current = true;
    },
    [deliverNew, hasCompletedInitialFetchRef],
  );

  const fetchNotifications = useCallback(
    async (options = {}) => {
      if (!token) return;
      const t = token;
      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.ALL || API_ENDPOINTS?.NOTIFICATIONS?.BASE;
      if (!endpoint) return;
      try {
        if (!options.isBackground && isMounted.current && tokenRef.current === t) setLoading(true);
        await syncNotificationQueue(apiUtils);
        const res = await apiUtils.get(endpoint);
        if (!isMounted.current || tokenRef.current !== t) return;
        const data = res.data;
        applyList(Array.isArray(data) ? data : data?.content || [], { deliverNew: true });
      } catch {
        if (isMounted.current && tokenRef.current === t) {
          const persisted = loadPersisted(storageKeyRef.current) || [];
          applyList(persisted, { deliverNew: false });
        }
      } finally {
        if (!options.isBackground && isMounted.current && tokenRef.current === t) setLoading(false);
      }
    },
    [token, applyList],
  );

  const refetchRef = useRef(fetchNotifications);
  useEffect(() => { refetchRef.current = fetchNotifications; }, [fetchNotifications]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      notificationsRef.current = [];
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
    }, [token, fetchNotifications, hasCompletedInitialFetchRef]);

  useEffect(() => {
    if (!isPageVisible || !token) return;
    const t = token;
    const interval = setInterval(() => {
      if (isMounted.current && tokenRef.current === t) {
        refetchRef.current({ isBackground: true });
      }
    }, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPageVisible, token]);

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
          notificationsRef.current = updated;
          persist(updated, storageKeyRef.current);
          return updated;
        });
        setUnreadCount((p) => Math.max(0, p - 1));
      } catch (err) {
        if (isMounted.current && tokenRef.current === t) console.error("[useNotificationPoller] markAsRead:", err);
        pushToNotificationQueue("read", { endpoint });
      }
    },
    [token],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const t = token;
    // Read unread state from the ref OUTSIDE the state updater. Reading it
    // inside setNotifications would be deferred by React until the render
    // phase, so the check below would always see false and the action would
    // become a no-op (#11774).
    const hasUnread = notificationsRef.current.some((n) => !n.isRead);
    if (!hasUnread) return;
    const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.READ_ALL;
    if (!endpoint) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      notificationsRef.current = updated;
      persist(updated, storageKeyRef.current);
      return updated;
    });
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
      const target = notificationsRef.current.find((n) => n.id === id);
      const removedWasUnread = target ? !target.isRead : false;
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        notificationsRef.current = updated;
        persist(updated, storageKeyRef.current);
        return updated;
      });
      if (removedWasUnread) setUnreadCount((p) => Math.max(0, p - 1));
      const fn = API_ENDPOINTS?.NOTIFICATIONS?.DELETE;
      const endpoint = token && typeof fn === "function" ? fn(id) : null;

      const restoreNotification = () => {
        if (!isMounted.current) return;
        if (!target) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === id)) return prev;
          const updated = [...prev, target].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          persist(updated, storageKeyRef.current);
          notificationsRef.current = updated;
          return updated;
        });
        if (removedWasUnread) setUnreadCount((p) => p + 1);
      };

      showUndoToast({
        message: "Notification deleted.",
        toastId: `delete-notification-${id}`,
        onUndo: restoreNotification,
        onCommit: async () => {
          if (!endpoint) return;
          try { await apiUtils.delete(endpoint); }
          catch (err) {
            pushToNotificationQueue("delete", { endpoint });
            if (isMounted.current && tokenRef.current === t) {
              console.error("[useNotificationPoller] delete:", err);
              refetchRef.current({ isBackground: true });
            }
          }
        },
      });
    },
    [token],
  );

  const markAsReadRef = useRef(markAsRead);
  useEffect(() => { markAsReadRef.current = markAsRead; }, [markAsRead]);

  // Same-tab sync listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = () => {
      const persisted = loadPersisted(storageKeyRef.current);
      if (persisted) {
        const incomingUnread = persisted.filter(
          (n) => n.id && !seenIds.current.has(n.id) && !n.isRead
        );
        setNotifications(persisted);
        notificationsRef.current = persisted;
        setUnreadCount(persisted.filter((n) => !n.isRead).length);
        persisted.forEach((n) => {
          if (n.id) addSeenId(n.id);
        });
        if (hasCompletedInitialFetchRef.current && incomingUnread.length > 0) {
          deliverNew(incomingUnread);
        }
        hasCompletedInitialFetchRef.current = true;
      }
    };
    window.addEventListener("eventra-notifications-updated", handleUpdate);
    return () => window.removeEventListener("eventra-notifications-updated", handleUpdate);
  }, [deliverNew, hasCompletedInitialFetchRef]);

  // Legacy IndexedDB eventra_notifications migration
  useEffect(() => {
    const migrateLegacy = async () => {
      try {
        const raw = await idbGet("eventra_notifications");
        if (raw) {
          const legacy = safeJsonParse(raw, []);
          if (Array.isArray(legacy) && legacy.length > 0) {
            const targetKey = getStorageKey(user?.id);
            const currentPersisted = loadPersisted(targetKey) || [];
            const merged = [...currentPersisted];

            legacy.forEach((ln) => {
              if (!ln) return;
              const id = ln.id ? String(ln.id) : `legacy-${Date.now()}-${Math.random()}`;
              const isRead = ln.isRead ?? ln.read ?? false;
              const title = ln.title ?? "";
              const message = ln.message ?? "";
              const category = ln.category ?? "system";
              const timestamp = ln.createdAt || ln.timestamp || new Date().toISOString();

              const exists = merged.some(
                (cn) =>
                  String(cn.id) === id ||
                  (cn.title === title && cn.message === message)
              );

              if (!exists) {
                merged.push({
                  id,
                  isRead,
                  title,
                  message,
                  category,
                  timestamp,
                });
              }
            });

            // Sort newest first
            merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            persist(merged, targetKey);
            if (isMounted.current) {
              setNotifications(merged);
              notificationsRef.current = merged;
              setUnreadCount(merged.filter((n) => !n.isRead).length);
              merged.forEach((n) => {
                if (n.id) addSeenId(n.id);
              });
            }
          }
          await idbDel("eventra_notifications");
        }
      } catch (e) {
        console.warn('[useNotificationPoller] Legacy IndexedDB migration failed', e);
      }
    };

    migrateLegacy();
  }, [user?.id]);

  return {
    notifications, unreadCount, loading,
    fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
    applyList, seenIds, markAsReadRef,
  };
}
