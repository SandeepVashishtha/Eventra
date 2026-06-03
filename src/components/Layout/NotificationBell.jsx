import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { NOTIFICATION_CATEGORIES } from "../../utils/notificationPreferences";
import { getRelativeTime } from "../../utils/relativeTime";

export default function NotificationBell() {
  const {
    groupedNotifications,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    preferences,
  } = useNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // 🔥 FIX: Added ref to track the dropdown container for click-outside detection
  const dropdownRef = useRef(null);

  // 🔥 FIX: Added effect to close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const visibleGroups = Object.entries(groupedNotifications || {}).filter(
    ([category]) => preferences?.categories?.[category]?.inApp !== false
  );

  return (
    // 🔥 FIX: Attached the ref to the root div
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-2 w-96 max-w-[calc(100vw-1rem)] origin-top-right overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-3 text-gray-700">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-gray-500">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-md p-2 text-gray-500 hover:bg-white hover:text-blue-600"
                title="Mark all as read"
                aria-label="Mark all notifications as read"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <Link
              to="/settings/notifications"
              className="rounded-md p-2 text-gray-500 hover:bg-white hover:text-blue-600"
              title="Notification settings"
              aria-label="Open notification settings"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* 🔥 FIX: Added optional chaining (?.) to prevent crashes if arrays are undefined */}
          {notifications?.length === 0 || visibleGroups?.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">No alerts found</div>
          ) : (
            visibleGroups?.map(([category, categoryNotifications]) => (
              <section key={category} className="border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between bg-gray-50/70 px-3 py-2">
                  <span className="text-xs font-semibold uppercase text-gray-500">
                    {NOTIFICATION_CATEGORIES[category]?.label || "System"}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    {/* 🔥 FIX: Defensive filter */}
                    {categoryNotifications?.filter((notif) => !notif.isRead).length || 0} new
                  </span>
                </div>
                {/* 🔥 FIX: Defensive map */}
                {categoryNotifications?.map((notif) => (
                  <button
                    type="button"
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`block w-full border-b border-gray-50 p-3 text-left transition-colors last:border-b-0 ${
                      !notif.isRead ? "bg-blue-50/60 hover:bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <p className={`text-sm text-gray-800 ${!notif.isRead ? "font-medium" : ""}`}>
                      {notif.title && notif.title !== notif.message ? (
                        <span className="block text-xs font-semibold text-gray-500">
                          {notif.title}
                        </span>
                      ) : null}
                      {notif.message}
                    </p>
                    <span
                      className="mt-1 block text-xs text-gray-400"
                      title={new Date(notif.timestamp).toLocaleString()}
                    >
                      {getRelativeTime(notif.timestamp) ||
                        new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}