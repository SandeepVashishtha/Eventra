import {
  Bell,
  Calendar,
  Check,
  Clock,
  MapPin,
  RefreshCw,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_CHANGES = [
  {
    id: 1,
    eventTitle: "AI & Machine Learning Workshop",
    eventId: "EVT-001",
    changedAt: "2026-08-11T10:30:00",
    changes: [
      {
        field: "Event Date/Time",
        oldValue: "August 15, 2026 · 10:00 AM",
        newValue: "August 16, 2026 · 11:00 AM",
      },
      {
        field: "Venue",
        oldValue: "Innovation Hall",
        newValue: "Main Auditorium",
      },
    ],
    status: "unread",
  },
  {
    id: 2,
    eventTitle: "Web Development Hackathon",
    eventId: "EVT-002",
    changedAt: "2026-08-10T15:45:00",
    changes: [
      {
        field: "Registration Deadline",
        oldValue: "August 12, 2026",
        newValue: "August 14, 2026",
      },
    ],
    status: "read",
  },
];

const FIELD_CONFIG = {
  "Event Date/Time": {
    icon: Calendar,
    label: "Event Schedule",
  },
  Venue: {
    icon: MapPin,
    label: "Venue",
  },
  "Registration Deadline": {
    icon: Clock,
    label: "Registration Deadline",
  },
  Capacity: {
    icon: Users,
    label: "Capacity",
  },
  "Event Status": {
    icon: RefreshCw,
    label: "Event Status",
  },
  Rules: {
    icon: Settings,
    label: "Important Rules",
  },
};

const EventRegistrationChangeNotifications = ({
  changes = DEFAULT_CHANGES,
  onNotificationRead,
  onDismiss,
  onViewEvent,
  onPreferenceChange,
  className = "",
}) => {
  const [notifications, setNotifications] =
    useState(changes);

  const [showRead, setShowRead] =
    useState(true);

  const [preferences, setPreferences] =
    useState({
      eventDateTime: true,
      venue: true,
      registrationDeadline: true,
      capacity: true,
      status: true,
      rules: true,
    });

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.status ===
          "unread"
      ).length,
    [notifications]
  );

  const filteredNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            showRead ||
            notification.status ===
              "unread"
        ),
      [notifications, showRead]
    );

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              status: "read",
            }
          : notification
      )
    );

    const notification =
      notifications.find(
        (item) => item.id === id
      );

    onNotificationRead?.(
      notification
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map(
        (notification) => ({
          ...notification,
          status: "read",
        })
      )
    );

    onNotificationRead?.(
      "all"
    );
  };

  const dismissNotification = (
    id
  ) => {
    setNotifications((current) =>
      current.filter(
        (notification) =>
          notification.id !== id
      )
    );

    onDismiss?.(id);
  };

  const updatePreference = (
    key
  ) => {
    setPreferences((current) => {
      const updated = {
        ...current,
        [key]: !current[key],
      };

      onPreferenceChange?.(
        updated
      );

      return updated;
    });
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Bell
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Updates
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Change Notifications
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Stay informed when important information changes for events you
              have registered for.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-[9px] font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            <Check size={12} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Important notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
        <Bell
          size={15}
          className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
        />

        <div>
          <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
            Why you're receiving these notifications
          </p>

          <p className="mt-1 text-[9px] leading-4 text-blue-600 dark:text-blue-400">
            You'll receive a notification when an organizer changes important
            information that may affect your event registration or attendance.
          </p>
        </div>
      </div>

      {/* Notification list */}
      <div className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Recent Changes
            </h3>

            <p className="mt-1 text-[9px] text-slate-400">
              Important updates from your registered events.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(event) =>
                setShowRead(
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
              Show read notifications
            </span>
          </label>
        </div>

        {filteredNotifications.length ===
        0 ? (
          <EmptyNotifications />
        ) : (
          <div className="mt-4 space-y-4">
            {filteredNotifications.map(
              (notification) => (
                <ChangeNotification
                  key={notification.id}
                  notification={
                    notification
                  }
                  onRead={() =>
                    markAsRead(
                      notification.id
                    )
                  }
                  onDismiss={() =>
                    dismissNotification(
                      notification.id
                    )
                  }
                  onViewEvent={() =>
                    onViewEvent?.(
                      notification
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Notification preferences */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <Settings
              size={16}
              className="text-slate-500"
            />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Notification Preferences
            </h3>

            <p className="mt-1 text-[9px] text-slate-400">
              Choose which event changes should notify you.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <PreferenceToggle
            label="Event date & time"
            checked={
              preferences.eventDateTime
            }
            onChange={() =>
              updatePreference(
                "eventDateTime"
              )
            }
          />

          <PreferenceToggle
            label="Venue changes"
            checked={
              preferences.venue
            }
            onChange={() =>
              updatePreference(
                "venue"
              )
            }
          />

          <PreferenceToggle
            label="Registration deadline"
            checked={
              preferences.registrationDeadline
            }
            onChange={() =>
              updatePreference(
                "registrationDeadline"
              )
            }
          />

          <PreferenceToggle
            label="Capacity changes"
            checked={
              preferences.capacity
            }
            onChange={() =>
              updatePreference(
                "capacity"
              )
            }
          />

          <PreferenceToggle
            label="Event status"
            checked={
              preferences.status
            }
            onChange={() =>
              updatePreference(
                "status"
              )
            }
          />

          <PreferenceToggle
            label="Important rules"
            checked={
              preferences.rules
            }
            onChange={() =>
              updatePreference(
                "rules"
              )
            }
          />
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------
   Change notification
----------------------------------- */

const ChangeNotification = ({
  notification,
  onRead,
  onDismiss,
  onViewEvent,
}) => {
  const isUnread =
    notification.status ===
    "unread";

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition dark:bg-slate-900 ${
        isUnread
          ? "border-indigo-200 shadow-sm dark:border-indigo-800"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {/* Notification header */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isUnread
              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }`}
        >
          <Bell size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  {notification.eventTitle}
                </h4>

                {isUnread && (
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[7px] font-bold uppercase text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    New
                  </span>
                )}
              </div>

              <p className="mt-1 text-[8px] text-slate-400">
                Event ID:{" "}
                {notification.eventId}
                {" · "}
                {formatDateTime(
                  notification.changedAt
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          What changed
        </p>

        <p className="mt-1 text-[9px] leading-4 text-slate-600 dark:text-slate-300">
          The organizer has updated important information for this event.
          Please review the changes below.
        </p>
      </div>

      {/* Changes */}
      <div className="mt-3 space-y-2">
        {notification.changes.map(
          (change, index) => (
            <ChangeItem
              key={`${change.field}-${index}`}
              change={change}
            />
          )
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onViewEvent}
          className="flex-1 rounded-xl bg-indigo-600 px-3 py-2.5 text-[9px] font-bold text-white hover:bg-indigo-700"
        >
          View Updated Event
        </button>

        {isUnread && (
          <button
            type="button"
            onClick={onRead}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-[9px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Check size={11} />
            Mark as Read
          </button>
        )}
      </div>
    </article>
  );
};

/* ----------------------------------
   Individual change
----------------------------------- */

const ChangeItem = ({
  change,
}) => {
  const config =
    FIELD_CONFIG[
      change.field
    ] || {
      icon: RefreshCw,
      label: change.field,
    };

  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Icon
          size={13}
          className="text-indigo-500"
        />

        <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
          {config.label}
        </p>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-red-400">
            Previous
          </p>

          <p className="mt-1 text-[9px] font-medium text-red-600 line-through dark:text-red-400">
            {change.oldValue}
          </p>
        </div>

        <div className="hidden text-slate-300 sm:block">
          →
        </div>

        <div className="rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-green-500">
            Updated
          </p>

          <p className="mt-1 text-[9px] font-semibold text-green-600 dark:text-green-400">
            {change.newValue}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Preference toggle
----------------------------------- */

const PreferenceToggle = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-left dark:border-slate-700"
    >
      <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-[18px]"
              : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyNotifications =
  () => {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Check size={19} />
        </div>

        <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
          You're all caught up
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-[9px] leading-4 text-slate-400">
          There are no new event registration changes to review.
        </p>
      </div>
    );
  };

/* ----------------------------------
   Date helpers
----------------------------------- */

const formatDateTime = (
  date
) => {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(new Date(date));
  } catch {
    return date;
  }
};

export default EventRegistrationChangeNotifications;