import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bell, Calendar, Megaphone, Shield, UserPlus, Trophy, Trash2 } from "lucide-react";
import { NOTIFICATION_CATEGORIES } from "../../utils/notificationPreferences";
import { getRelativeTime } from "../../utils/relativeTime";

const CATEGORY_ICONS = {
  registrations: Calendar,
  events: Calendar,
  reminders: Bell,
  announcements: Megaphone,
  social: UserPlus,
  system: Shield,
  hackathon: Trophy,
};

const NotificationItem = ({
  notification,
  onMarkRead,
  onDelete,
  compact = false,
  showActions = true,
}) => {
  const category = notification.category || "system";
  const Icon = CATEGORY_ICONS[category] || Bell;
  const isUnread = !notification.isRead;
  const categoryLabel = NOTIFICATION_CATEGORIES[category]?.label || "Notification";

  const content = (
    <>
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isUnread ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`text-sm text-gray-900 dark:text-gray-100 ${
                isUnread ? "font-semibold" : "font-medium"
              }`}
            >
              {notification.title}
            </p>
            {!compact && (
              <p className="mt-0.5 text-xs font-medium tracking-wide text-indigo-600/80 uppercase dark:text-indigo-400/80">
                {categoryLabel}
              </p>
            )}
          </div>
          {isUnread && (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500"
              aria-label="Unread"
            />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {notification.message}
        </p>

        <p
          className="mt-1.5 text-xs text-gray-400 dark:text-gray-500"
          title={new Date(notification.timestamp).toLocaleString()}
        >
          {getRelativeTime(notification.timestamp) ||
            new Date(notification.timestamp).toLocaleDateString()}
        </p>
      </div>
    </>
  );

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  const wrapperClass = `group flex w-full gap-3 rounded-lg border p-3 text-left transition-colors ${
    isUnread
      ? "border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/40 dark:bg-indigo-950/30"
      : "border-transparent bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800/50"
  }`;

  const actions = showActions && (
    <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
      {isUnread && onMarkRead && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="rounded p-1 text-xs text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
          aria-label="Mark as read"
        >
          Read
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
          aria-label="Delete notification"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  const inner = (
    <div className="flex w-full items-start gap-2">
      <div className="flex min-w-0 flex-1 gap-3" onClick={handleClick} role="presentation">
        {content}
      </div>
      {actions}
    </div>
  );

  if (notification.link) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -8 }}
        className={wrapperClass}
      >
        <Link to={notification.link} className="block w-full" onClick={handleClick}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={wrapperClass}
      onClick={handleClick}
    >
      {inner}
    </motion.button>
  );
};

export default memo(NotificationItem);
