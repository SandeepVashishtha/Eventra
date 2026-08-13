import {
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eventra-registration-approval-notifications";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notification-001",
    registrationId: "REG-1001",
    eventId: "event-001",
    eventTitle: "AI & ML Hackathon",
    status: "Approved",
    reason: "",
    message:
      "Your registration has been approved by the organizer.",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 20
    ).toISOString(),
    read: false,
  },
  {
    id: "notification-002",
    registrationId: "REG-1002",
    eventId: "event-002",
    eventTitle: "Web Development Workshop",
    status: "Pending",
    reason: "",
    message:
      "Your registration is waiting for organizer review.",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 60
    ).toISOString(),
    read: false,
  },
  {
    id: "notification-003",
    registrationId: "REG-1003",
    eventId: "event-003",
    eventTitle: "Data Science Meetup",
    status: "Rejected",
    reason:
      "The event has reached its participant capacity.",
    message:
      "Your registration was not approved by the organizer.",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 60 * 3
    ).toISOString(),
    read: true,
  },
];

const EventRegistrationApprovalNotifications = ({
  initialNotifications = DEFAULT_NOTIFICATIONS,
  onStatusChange,
  onMarkRead,
  onClearNotification,
  className = "",
}) => {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  const [filter, setFilter] =
    useState("All");

  const [showUnreadOnly, setShowUnreadOnly] =
    useState(false);

  const [expandedId, setExpandedId] =
    useState(null);

  const [showNotificationPanel, setShowNotificationPanel] =
    useState(false);

  /*
   * Restore notifications from localStorage.
   */
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setNotifications(parsed);
      }
    } catch (error) {
      console.error(
        "Unable to restore registration notifications:",
        error
      );
    }
  }, []);

  /*
   * Persist notifications.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error(
        "Unable to save registration notifications:",
        error
      );
    }
  }, [notifications]);

  const counts = useMemo(() => {
    return {
      all: notifications.length,
      pending: notifications.filter(
        (item) => item.status === "Pending"
      ).length,
      approved: notifications.filter(
        (item) => item.status === "Approved"
      ).length,
      rejected: notifications.filter(
        (item) => item.status === "Rejected"
      ).length,
      unread: notifications.filter(
        (item) => !item.read
      ).length,
    };
  }, [notifications]);

  const filteredNotifications =
    useMemo(() => {
      return notifications.filter(
        (notification) => {
          const matchesStatus =
            filter === "All" ||
            notification.status === filter;

          const matchesUnread =
            !showUnreadOnly ||
            !notification.read;

          return (
            matchesStatus &&
            matchesUnread
          );
        }
      );
    }, [
      notifications,
      filter,
      showUnreadOnly,
    ]);

  /*
   * Update registration status.
   */
  const updateRegistrationStatus = async ({
    notificationId,
    status,
    reason = "",
  }) => {
    setNotifications((current) =>
      current.map((notification) => {
        if (
          notification.id !==
          notificationId
        ) {
          return notification;
        }

        const updatedNotification = {
          ...notification,
          status,
          reason,
          read: false,
          createdAt:
            new Date().toISOString(),
          message:
            getStatusMessage(status),
        };

        return updatedNotification;
      })
    );

    const updated =
      notifications.find(
        (item) =>
          item.id === notificationId
      );

    if (updated) {
      await onStatusChange?.({
        ...updated,
        status,
        reason,
      });
    }
  };

  /*
   * Mark notification as read.
   */
  const markAsRead = async (
    notificationId
  ) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id ===
        notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );

    await onMarkRead?.(notificationId);
  };

  /*
   * Mark every notification as read.
   */
  const markAllAsRead = async () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    await onMarkRead?.("all");
  };

  /*
   * Remove notification.
   */
  const clearNotification = async (
    notificationId
  ) => {
    setNotifications((current) =>
      current.filter(
        (notification) =>
          notification.id !==
          notificationId
      )
    );

    await onClearNotification?.(
      notificationId
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Bell
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />

            {counts.unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                {counts.unread}
              </span>
            )}
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Updates
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Approval Notifications
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Stay informed when organizers review and update your event
              registration.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowNotificationPanel(
              (current) => !current
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[9px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell size={13} />
          Notifications
          {counts.unread > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] text-white">
              {counts.unread}
            </span>
          )}
        </button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<Clock3 size={15} />}
          label="Pending"
          value={counts.pending}
        />

        <SummaryCard
          icon={<CheckCircle2 size={15} />}
          label="Approved"
          value={counts.approved}
        />

        <SummaryCard
          icon={<XCircle size={15} />}
          label="Rejected"
          value={counts.rejected}
        />

        <SummaryCard
          icon={<Bell size={15} />}
          label="Unread"
          value={counts.unread}
        />
      </div>

      {/* Notification popup */}
      {showNotificationPanel && (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900/30 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                Notification Center
              </p>

              <p className="mt-1 text-[8px] text-slate-400">
                {counts.unread} unread notification
                {counts.unread !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            {counts.unread > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[8px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {notifications
              .filter(
                (notification) =>
                  !notification.read
              )
              .slice(0, 3)
              .map((notification) => (
                <MiniNotification
                  key={notification.id}
                  notification={
                    notification
                  }
                  onClick={() => {
                    markAsRead(
                      notification.id
                    );

                    setExpandedId(
                      notification.id
                    );
                  }}
                />
              ))}

            {counts.unread === 0 && (
              <p className="py-3 text-center text-[8px] text-slate-400">
                You're all caught up.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            "All",
            "Pending",
            "Approved",
            "Rejected",
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                setFilter(status)
              }
              className={`rounded-full border px-3 py-1.5 text-[8px] font-bold transition ${
                filter === status
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setShowUnreadOnly(
              (current) => !current
            )
          }
          className={`rounded-xl border px-3 py-2 text-[8px] font-bold ${
            showUnreadOnly
              ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          }`}
        >
          {showUnreadOnly
            ? "Showing Unread"
            : "Show Unread Only"}
        </button>
      </div>

      {/* Notification list */}
      <div className="mt-5 space-y-3">
        {filteredNotifications.map(
          (notification) => (
            <RegistrationNotification
              key={notification.id}
              notification={notification}
              expanded={
                expandedId ===
                notification.id
              }
              onToggle={() => {
                setExpandedId(
                  expandedId ===
                    notification.id
                    ? null
                    : notification.id
                );

                if (!notification.read) {
                  markAsRead(
                    notification.id
                  );
                }
              }}
              onMarkRead={() =>
                markAsRead(
                  notification.id
                )
              }
              onClear={() =>
                clearNotification(
                  notification.id
                )
              }
            />
          )
        )}
      </div>

      {filteredNotifications.length ===
        0 && (
        <EmptyState
          showUnreadOnly={
            showUnreadOnly
          }
          filter={filter}
        />
      )}

      {/* Demo organizer controls */}
      <OrganizerStatusDemo
        notifications={notifications}
        onUpdate={
          updateRegistrationStatus
        }
      />
    </section>
  );
};

/* ----------------------------------
   Summary card
----------------------------------- */

const SummaryCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {icon}
        </div>

        <span className="text-lg font-bold text-slate-800 dark:text-white">
          {value}
        </span>
      </div>

      <p className="mt-3 text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
};

/* ----------------------------------
   Registration notification
----------------------------------- */

const RegistrationNotification = ({
  notification,
  expanded,
  onToggle,
  onMarkRead,
  onClear,
}) => {
  return (
    <article
      className={`rounded-2xl border bg-white transition dark:bg-slate-900 ${
        notification.read
          ? "border-slate-200 dark:border-slate-700"
          : "border-indigo-200 ring-1 ring-indigo-50 dark:border-indigo-900/40 dark:ring-indigo-900/10"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <StatusIcon
          status={notification.status}
        />

        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              {notification.eventTitle}
            </h3>

            <StatusBadge
              status={notification.status}
            />

            {!notification.read && (
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-[7px] font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                New
              </span>
            )}
          </div>

          <p className="mt-1 text-[9px] leading-4 text-slate-500 dark:text-slate-400">
            {notification.message}
          </p>

          <p className="mt-2 text-[7px] text-slate-400">
            {formatDateTime(
              notification.createdAt
            )}
          </p>
        </button>

        <button
          type="button"
          onClick={onClear}
          aria-label="Clear notification"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          <X size={13} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Registration ID"
              value={
                notification.registrationId
              }
            />

            <InfoItem
              label="Status"
              value={notification.status}
            />
          </div>

          {notification.status ===
            "Rejected" &&
            notification.reason && (
              <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                <p className="text-[8px] font-bold text-red-600 dark:text-red-400">
                  Organizer's Reason
                </p>

                <p className="mt-1 text-[8px] leading-4 text-red-500 dark:text-red-300">
                  {notification.reason}
                </p>
              </div>
            )}

          {notification.status ===
            "Approved" && (
            <div className="mt-3 rounded-xl border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
              <p className="text-[8px] font-bold text-green-600 dark:text-green-400">
                Registration Approved
              </p>

              <p className="mt-1 text-[8px] leading-4 text-green-500 dark:text-green-300">
                Your registration has been approved. You can now participate
                in the event.
              </p>
            </div>
          )}

          {notification.status ===
            "Pending" && (
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="text-[8px] font-bold text-amber-600 dark:text-amber-400">
                Registration Under Review
              </p>

              <p className="mt-1 text-[8px] leading-4 text-amber-500 dark:text-amber-300">
                The organizer has not completed the registration review yet.
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {!notification.read && (
              <button
                type="button"
                onClick={onMarkRead}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[8px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Check size={11} />
                Mark as Read
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

/* ----------------------------------
   Status icon
----------------------------------- */

const StatusIcon = ({
  status,
}) => {
  const styles = {
    Pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Approved:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Rejected:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles[status]}`}
    >
      {status === "Pending" && (
        <Clock3 size={15} />
      )}

      {status === "Approved" && (
        <CheckCircle2 size={15} />
      )}

      {status === "Rejected" && (
        <XCircle size={15} />
      )}
    </div>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const styles = {
    Pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Approved:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Rejected:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[7px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

/* ----------------------------------
   Mini notification
----------------------------------- */

const MiniNotification = ({
  notification,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
    >
      <StatusIcon
        status={notification.status}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] font-bold text-slate-700 dark:text-slate-200">
          {notification.eventTitle}
        </p>

        <p className="mt-0.5 truncate text-[7px] text-slate-400">
          {notification.message}
        </p>
      </div>
    </button>
  );
};

/* ----------------------------------
   Info item
----------------------------------- */

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[9px] font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  showUnreadOnly,
  filter,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <Bell
        size={22}
        className="mx-auto text-slate-300 dark:text-slate-600"
      />

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No registration notifications
      </h3>

      <p className="mt-1 text-[8px] text-slate-400">
        {showUnreadOnly
          ? "There are no unread registration updates."
          : filter === "All"
          ? "You don't have any registration updates yet."
          : `There are no ${filter.toLowerCase()} registration notifications.`}
      </p>
    </div>
  );
};

/* ----------------------------------
   Organizer demo controls
----------------------------------- */

const OrganizerStatusDemo = ({
  notifications,
  onUpdate,
}) => {
  const [selectedId, setSelectedId] =
    useState(
      notifications[0]?.id || ""
    );

  const [reason, setReason] =
    useState("");

  const selected = notifications.find(
    (item) => item.id === selectedId
  );

  return (
    <details className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <summary className="cursor-pointer text-[9px] font-bold text-slate-500 dark:text-slate-400">
        Organizer Status Testing
      </summary>

      <div className="mt-4">
        <p className="text-[8px] leading-4 text-slate-400">
          This section demonstrates how an organizer or backend can update a
          participant's registration status. In production, replace these
          handlers with your API calls.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            value={selectedId}
            onChange={(event) =>
              setSelectedId(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[9px] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {notifications.map(
              (notification) => (
                <option
                  key={notification.id}
                  value={notification.id}
                >
                  {notification.eventTitle} —{" "}
                  {notification.registrationId}
                </option>
              )
            )}
          </select>

          <input
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Rejection reason (optional)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[9px] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!selected}
            onClick={() =>
              onUpdate({
                notificationId:
                  selectedId,
                status: "Pending",
              })
            }
            className="rounded-lg bg-amber-500 px-3 py-2 text-[8px] font-bold text-white disabled:opacity-40"
          >
            Set Pending
          </button>

          <button
            type="button"
            disabled={!selected}
            onClick={() =>
              onUpdate({
                notificationId:
                  selectedId,
                status: "Approved",
              })
            }
            className="rounded-lg bg-green-600 px-3 py-2 text-[8px] font-bold text-white disabled:opacity-40"
          >
            Approve
          </button>

          <button
            type="button"
            disabled={!selected}
            onClick={() =>
              onUpdate({
                notificationId:
                  selectedId,
                status: "Rejected",
                reason,
              })
            }
            className="rounded-lg bg-red-600 px-3 py-2 text-[8px] font-bold text-white disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      </div>
    </details>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const getStatusMessage = (
  status
) => {
  switch (status) {
    case "Approved":
      return "Your registration has been approved by the organizer.";

    case "Rejected":
      return "Your registration was not approved by the organizer.";

    case "Pending":
    default:
      return "Your registration is waiting for organizer review.";
  }
};

const formatDateTime = (value) => {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(value));
  } catch {
    return "";
  }
};

export default EventRegistrationApprovalNotifications;