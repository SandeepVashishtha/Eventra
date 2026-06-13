import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, ExternalLink, Settings } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import EmptyState from "../common/EmptyState";
import NotificationItem from "./NotificationItem";

const PREVIEW_LIMIT = 6;

const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    notifications,
    groupedNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    preferences,
  } = useNotification();

  const visibleGroups = useMemo(
    () =>
      Object.entries(groupedNotifications || {}).filter(
        ([category]) => preferences?.categories?.[category]?.inApp !== false
      ),
    [groupedNotifications, preferences]
  );

  const previewNotifications = useMemo(() => {
    const unread = notifications.filter((n) => !n.isRead);
    const read = notifications.filter((n) => n.isRead);
    return [...unread, ...read].slice(0, PREVIEW_LIMIT);
  }, [notifications]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="absolute right-0 z-[300] mt-2 w-[min(100vw-1rem,24rem)] origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
        aria-label="Notification panel"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unreadCount} unread
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white hover:text-indigo-600 dark:hover:bg-gray-700"
                title="Mark all as read"
                aria-label="Mark all notifications as read"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}
            <Link
              to="/settings/notifications"
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white hover:text-indigo-600 dark:hover:bg-gray-700"
              title="Notification settings"
              aria-label="Open notification settings"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          {loading && notifications.length === 0 ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              compact
              icon={Bell}
              title="No notifications yet"
              description="We'll notify you about registrations, invites, and updates."
            />
          ) : (
            <div className="space-y-1">
              {previewNotifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                  compact
                />
              ))}

              {visibleGroups.length > 0 && notifications.length > PREVIEW_LIMIT && (
                <p className="px-2 py-1 text-center text-xs text-gray-400">
                  Showing {previewNotifications.length} of {notifications.length}
                </p>
              )}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-2 dark:border-gray-800 dark:bg-gray-800/30">
            <Link
              to="/notifications"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            >
              View all notifications
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown;
