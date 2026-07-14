import { pushToNotificationQueue, syncNotificationQueue } from "../utils/notificationQueue.js";
import { useState, useCallback, useRef, useEffect } from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";
import { useAuth } from "../context/AuthContext.js";
import usePageVisibility from "./usePageVisibility.js";
import seedNotifications from "../data/mockNotifications.json";
import { safeJsonParse } from "../utils/safeJsonParse.js";
import { getNotificationMessage } from "../utils/notificationPreferences.js";
import { get as idbGet, del as idbDel } from "idb-keyval";

const POLLING_INTERVAL_MS = 60_000;
const MAX_SEEN_IDS = 500;
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
  id: n.id || n._id || `${n.timestamp || n.createdAt || Date.now()}-${getNotificationMessage(n)}`,
  timestamp: n.timestamp || n.createdAt || n.updatedAt || new Date().toISOString(),
});

const persist = (items, storageKey) => {
  if (typeof window === "undefined" || !window.localStorage || !storageKey) return;
  try { window.localStorage.setItem(storageKey, JSON.stringify(items)); } catch {}
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

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { isPageVisibleRef.current = isPageVisible; }, [isPageVisible]);
  useEffect(() => { storageKeyRef.current = getStorageKey(user?.id); }, [user?.id]);

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
      window.localStorage.setItem(userKey, JSON.stringify(merged));
      window.localStorage.removeItem(GUEST_INBOX_KEY);
    } catch {}
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
      const normalized = list.map(normalize);
      const incomingUnread = normalized.filter((n) => {
        const isNew = !seenIds.current.has(n.id);
        return isNew && !n.isRead;
      });
      normalized.forEach((n) => addSeenId(n.id));
      setNotifications(normalized);
      setUnreadCount(normalized.filter((n) => !n.isRead).length);
      persist(normalized, storageKeyRef.current);
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
          const persisted = loadPersisted(storageKeyRef.current);
          const fallback = persisted?.length ? persisted : seedNotifications.map(normalize);
          applyList(fallback, { deliverNew: false });
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
    let hasUnread = false;
    setNotifications((prev) => {
      hasUnread = prev.some((n) => !n.isRead);
      if (!hasUnread) return prev;
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      persist(updated, storageKeyRef.current);
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
        persist(updated, storageKeyRef.current);
        return updated;
      });
      if (removedWasUnread) setUnreadCount((p) => Math.max(0, p - 1));
      const fn = API_ENDPOINTS?.NOTIFICATIONS?.DELETE;
      if (!token || typeof fn !== "function") return;
      const endpoint = fn(id);
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
        setNotifications(persisted);
        setUnreadCount(persisted.filter((n) => !n.isRead).length);
        persisted.forEach((n) => {
          if (n.id) seenIds.current.add(n.id);
        });
      }
    };
    window.addEventListener("eventra-notifications-updated", handleUpdate);
    return () => window.removeEventListener("eventra-notifications-updated", handleUpdate);
  }, []);

  // Legacy IndexedDB eventra_notifications migration
  useEffect(() => {
    const migrateLegacy = async () => {
      try {
        const raw = await idbGet("eventra_notifications");
        if (raw) {
          const legacy = safeJsonParse(raw, []);
          if (Array.isArray(legacy) && legacy.length > 0) {
            const currentPersisted = loadPersisted(storageKeyRef.current) || [];
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
            persist(merged, storageKeyRef.current);
            setNotifications(merged);
            setUnreadCount(merged.filter((n) => !n.isRead).length);
            merged.forEach((n) => {
              if (n.id) seenIds.current.add(n.id);
            });
          }
          await idbDel("eventra_notifications");
        }
      } catch {
        // fail silently in environments without IndexedDB support
      }
    };

    migrateLegacy();
  }, []);

  return {
    notifications, unreadCount, loading,
    fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
    applyList, seenIds, markAsReadRef,
  };
}
