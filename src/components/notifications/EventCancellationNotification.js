import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

const EventCancellationNotification = ({
  notification,
  onDismiss,
  onMarkAsRead,
}) => {
  if (!notification) {
    return null;
  }

  const {
    type = "cancelled",
    eventName = "Event",
    reason = "",
    newDateTime = null,
    createdAt = null,
    read = false,
  } = notification;

  const isRescheduled =
    type === "rescheduled";

  const title = isRescheduled
    ? "Event Rescheduled"
    : "Event Cancelled";

  const formattedDate =
    formatDateTime(newDateTime);

  const notificationTime =
    formatDateTime(createdAt);

  const handleNotificationClick = () => {
    if (!read) {
      onMarkAsRead?.(notification);
    }
  };

  return (
    <article
      role="alert"
      onClick={
        handleNotificationClick
      }
      className={`relative rounded-2xl border p-5 shadow-sm transition ${
        read
          ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          : "border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/10"
      }`}
    >
      {/* Unread indicator */}
      {!read && (
        <span
          aria-label="Unread notification"
          className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-indigo-600"
        />
      )}

      <div className="flex items-start gap-4">
        {/* Notification icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isRescheduled
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          }`}
        >
          {isRescheduled ? (
            <Calendar
              size={21}
              className="text-amber-600 dark:text-amber-400"
            />
          ) : (
            <AlertTriangle
              size={21}
              className="text-red-600 dark:text-red-400"
            />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-white">
              {title}
            </h3>

            {!read && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                New
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            {eventName}
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {isRescheduled
              ? "This event has been rescheduled."
              : "This event has been cancelled. Please review the details below."}
          </p>

          {/* Cancellation reason */}
          {reason && (
            <div className="mt-4 rounded-xl bg-white p-3 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reason
              </p>

              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {reason}
              </p>
            </div>
          )}

          {/* New date/time */}
          {isRescheduled &&
            formattedDate && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <Clock size={16} />

                <span>
                  New date and time:{" "}
                  <strong>
                    {formattedDate}
                  </strong>
                </span>
              </div>
            )}

          {/* Notification timestamp */}
          {notificationTime && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Bell size={13} />

              <time dateTime={createdAt}>
                {notificationTime}
              </time>
            </div>
          )}

          {/* Status */}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CheckCircle size={14} />

            <span>
              {isRescheduled
                ? "Please use the updated schedule."
                : "Please check your dashboard for further updates."}
            </span>
          </div>
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss(notification);
            }}
            aria-label="Dismiss notification"
            className="absolute right-3 top-8 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </article>
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default EventCancellationNotification;