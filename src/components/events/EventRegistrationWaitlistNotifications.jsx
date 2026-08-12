import {
  Bell,
  CheckCircle2,
  Clock3,
  Mail,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventRegistrationWaitlistNotifications = ({
  waitlistEntry,
  onNotificationSent,
  className = "",
}) => {
  const [notifications, setNotifications] =
    useState(
      waitlistEntry?.notifications || []
    );

  const [sending, setSending] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const currentPosition =
    Number(
      waitlistEntry?.currentPosition
    ) || 0;

  const previousPosition =
    Number(
      waitlistEntry?.previousPosition
    ) || 0;

  const positionImproved =
    previousPosition > 0 &&
    currentPosition > 0 &&
    currentPosition <
      previousPosition;

  const positionsMoved =
    positionImproved
      ? previousPosition -
        currentPosition
      : 0;

  const seatAvailable =
    waitlistEntry?.seatAvailable ===
    true;

  const promoted =
    waitlistEntry?.promoted === true;

  const confirmationDeadline =
    waitlistEntry?.confirmationDeadline;

  const notificationStats =
    useMemo(() => {
      return {
        total: notifications.length,
        unread: notifications.filter(
          (item) =>
            item.read !== true
        ).length,
      };
    }, [notifications]);

  const handleSendNotification =
    async (type) => {
      setSending(true);
      setMessage("");
      setError("");

      try {
        const notification =
          createNotification(
            type,
            waitlistEntry
          );

        setNotifications(
          (current) => [
            notification,
            ...current,
          ]
        );

        await onNotificationSent?.(
          notification
        );

        setMessage(
          "Waitlist notification sent successfully."
        );
      } catch (err) {
        setError(
          err?.message ||
            "Failed to send notification."
        );
      } finally {
        setSending(false);
      }
    };

  const markAsRead = (
    notificationId
  ) => {
    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Bell size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Waitlist Updates
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Waitlist Notifications
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Stay informed when your waitlist position
              changes.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Current Position
          </p>

          <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            #{currentPosition || "—"}
          </p>
        </div>
      </div>

      {/* Event information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Ticket
            size={17}
            className="mt-0.5 shrink-0 text-indigo-500"
          />

          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {waitlistEntry?.eventName ||
                "Event"}
            </h3>

            {waitlistEntry?.eventDate && (
              <p className="mt-2 text-[7px] text-slate-400">
                {formatDate(
                  waitlistEntry.eventDate
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Position change */}
      {positionImproved && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <TrendingUp size={17} />
            </div>

            <div>
              <p className="text-[9px] font-bold text-green-700 dark:text-green-400">
                Your waitlist position improved
              </p>

              <p className="mt-1 text-[8px] text-green-700/70 dark:text-green-400/70">
                Your position changed from{" "}
                <strong>
                  #{previousPosition}
                </strong>{" "}
                to{" "}
                <strong>
                  #{currentPosition}
                </strong>
                .
              </p>

              <p className="mt-1 text-[7px] font-semibold text-green-600 dark:text-green-400">
                You moved up {positionsMoved} position
                {positionsMoved === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatusCard
          icon={<Users size={15} />}
          label="Position"
          value={
            currentPosition
              ? `#${currentPosition}`
              : "N/A"
          }
          className="text-indigo-600 dark:text-indigo-400"
        />

        <StatusCard
          icon={<Ticket size={15} />}
          label="Seat Status"
          value={
            promoted
              ? "Promoted"
              : seatAvailable
                ? "Available"
                : "Waiting"
          }
          className={
            promoted || seatAvailable
              ? "text-green-600 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400"
          }
        />

        <StatusCard
          icon={<Bell size={15} />}
          label="Notifications"
          value={
            notificationStats.unread
          }
          className="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Confirmation deadline */}
      {confirmationDeadline && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <Clock3
            size={17}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
              Confirmation Deadline
            </p>

            <p className="mt-1 text-[8px] text-amber-700/70 dark:text-amber-400/70">
              Confirm your seat before{" "}
              <strong>
                {formatDate(
                  confirmationDeadline
                )}
              </strong>
              .
            </p>
          </div>
        </div>
      )}

      {/* Organizer notification actions */}
      {waitlistEntry?.isOrganizer && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            Notification Actions
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            Send a notification to the participant about
            their current waitlist status.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton
              disabled={sending}
              onClick={() =>
                handleSendNotification(
                  "position_changed"
                )
              }
            >
              <TrendingUp size={12} />
              Position Update
            </ActionButton>

            <ActionButton
              disabled={sending}
              onClick={() =>
                handleSendNotification(
                  "seat_available"
                )
              }
            >
              <Ticket size={12} />
              Seat Available
            </ActionButton>

            <ActionButton
              disabled={sending}
              onClick={() =>
                handleSendNotification(
                  "promotion"
                )
              }
            >
              <CheckCircle2 size={12} />
              Promotion
            </ActionButton>

            <ActionButton
              disabled={sending}
              onClick={() =>
                handleSendNotification(
                  "deadline"
                )
              }
            >
              <Clock3 size={12} />
              Deadline Reminder
            </ActionButton>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Notification History
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Previous waitlist updates.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {notifications.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            notifications.map(
              (notification) => (
                <NotificationItem
                  key={
                    notification.id
                  }
                  notification={
                    notification
                  }
                  onRead={
                    markAsRead
                  }
                />
              )
            )
          )}
        </div>
      </div>

      {/* Result */}
      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />

          <p className="text-[8px] font-semibold">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}
    </section>
  );
};

const StatusCard = ({
  icon,
  label,
  value,
  className,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}
    >
      {icon}
    </div>

    <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const ActionButton = ({
  children,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </button>
);

const NotificationItem = ({
  notification,
  onRead,
}) => (
  <div
    className={`rounded-2xl border p-4 ${
      notification.read
        ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        : "border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
        <Mail size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            {notification.title}
          </p>

          {!notification.read && (
            <span className="rounded-full bg-indigo-600 px-2 py-1 text-[6px] font-bold text-white">
              New
            </span>
          )}
        </div>

        <p className="mt-2 text-[8px] leading-4 text-slate-500 dark:text-slate-400">
          {notification.message}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[7px] text-slate-400">
            {formatDate(
              notification.createdAt
            )}
          </p>

          {!notification.read && (
            <button
              type="button"
              onClick={() =>
                onRead(
                  notification.id
                )
              }
              className="text-[7px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const EmptyNotifications = () => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <Bell
      size={22}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-200">
      No waitlist notifications
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      Updates about your waitlist position will appear
      here.
    </p>
  </div>
);

const createNotification = (
  type,
  entry
) => {
  const position =
    entry?.currentPosition || 0;

  const previous =
    entry?.previousPosition || 0;

  const eventName =
    entry?.eventName ||
    "your event";

  const messages = {
    position_changed: {
      title: "Waitlist Position Updated",
      message:
        previous > position
          ? `Your waitlist position for ${eventName} changed from #${previous} to #${position}.`
          : `Your current waitlist position for ${eventName} is #${position}.`,
    },

    seat_available: {
      title: "Seat Available",
      message:
        `A seat is now available for ${eventName}. Please complete your confirmation before the deadline.`,
    },

    promotion: {
      title: "You Have Been Promoted",
      message:
        `Good news! You have been promoted from the waitlist for ${eventName}.`,
    },

    deadline: {
      title: "Confirmation Deadline Approaching",
      message:
        `Your confirmation deadline for ${eventName} is approaching. Please confirm your seat before the deadline.`,
    },
  };

  const content =
    messages[type] ||
    messages.position_changed;

  return {
    id:
      typeof crypto !==
      "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),

    type,

    title:
      content.title,

    message:
      content.message,

    createdAt:
      new Date().toISOString(),

    read: false,
  };
};

const formatDate = (
  value
) => {
  if (!value) {
    return "N/A";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export default EventRegistrationWaitlistNotifications;