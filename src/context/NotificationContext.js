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

  const [realtimeStatus, setRealtimeStatus] = useState(SSE_STATUS.IDLE);

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

  useEffect(() => { setRealtimeStatus(sseStatus); }, [sseStatus]);

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

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        groupedNotifications,
        achievements,
        unreadCount,
        loading,
        realtimeStatus,
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
