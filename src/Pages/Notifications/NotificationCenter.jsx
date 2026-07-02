import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Filter, Search, Wifi, WifiOff } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { NOTIFICATION_CATEGORIES } from "../../utils/notificationPreferences";
import NotificationItem from "../../components/notifications/NotificationItem";
import EmptyState from "../../components/common/EmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
  ...Object.entries(NOTIFICATION_CATEGORIES).map(([id, meta]) => ({
    id,
    label: meta.label,
  })),
];

const NotificationCenter = () => {
  useDocumentTitle("Notifications | Eventra");

  const {
    notifications,
    unreadCount,
    loading,
    realtimeStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotification();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !query ||
        notification.title?.toLowerCase().includes(query) ||
        notification.message?.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "unread" && !notification.isRead) ||
        (activeFilter === "read" && notification.isRead) ||
        notification.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchQuery, activeFilter]);

  const groupedByDate = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    filteredNotifications.forEach((notification) => {
      const date = new Date(notification.timestamp);
      if (date >= todayStart) {
        groups.Today.push(notification);
      } else if (date >= yesterdayStart) {
        groups.Yesterday.push(notification);
      } else {
        groups.Earlier.push(notification);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [filteredNotifications]);

  const isConnected = realtimeStatus === "connected";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              <Bell className="h-7 w-7 text-indigo-600" aria-hidden="true" />
              Notification Center
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {unreadCount} unread · {notifications.length} total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isConnected
                  ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {isConnected ? (
                <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isConnected ? "Live" : "Polling"}
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-200 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}

            <button
              type="button"
              onClick={() => fetchNotifications()}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-200 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            aria-label="Search notifications"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveFilter(option.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter === option.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description={
            searchQuery || activeFilter !== "all"
              ? "Try adjusting your search or filters."
              : "You're all caught up! New updates will appear here."
          }
        />
      ) : (
        <div className="space-y-8">
          {groupedByDate.map(([label, items]) => (
            <section key={label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </h2>
              <AnimatePresence mode="popLayout">
                <div className="space-y-2">
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
