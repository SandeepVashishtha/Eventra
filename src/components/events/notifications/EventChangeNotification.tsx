import React, { useMemo, useState } from "react";

type ChangeType =
  | "date"
  | "venue"
  | "deadline"
  | "status"
  | "announcement";

type NotificationStatus = "unread" | "read";

interface EventChange {
  id: string | number;
  eventId: string | number;
  eventName: string;
  type: ChangeType;
  title: string;
  message: string;
  previousValue?: string;
  currentValue?: string;
  createdAt: string;
  status?: NotificationStatus;
  organizerName?: string;
}

interface EventChangeNotificationProps {
  changes?: EventChange[];
  eventName?: string;
  onMarkAsRead?: (change: EventChange) => void;
  onMarkAllAsRead?: () => void;
  onViewEvent?: (change: EventChange) => void;
}

const EventChangeNotification: React.FC<
  EventChangeNotificationProps
> = ({
  changes = [],
  eventName,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewEvent,
}) => {
  const [notifications, setNotifications] =
    useState<EventChange[]>(changes);

  const [activeFilter, setActiveFilter] =
    useState<"all" | "unread">("all");

  const [selectedChange, setSelectedChange] =
    useState<EventChange | null>(null);

  const [showAll, setShowAll] = useState(false);

  const [showPreviousValue, setShowPreviousValue] =
    useState(false);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.status !== "read"
      ).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (eventName) {
      result = result.filter(
        (notification) =>
          notification.eventName === eventName
      );
    }

    if (activeFilter === "unread") {
      result = result.filter(
        (notification) =>
          notification.status !== "read"
      );
    }

    return result.sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
    );
  }, [
    notifications,
    activeFilter,
    eventName,
  ]);

  const visibleNotifications = showAll
    ? filteredNotifications
    : filteredNotifications.slice(0, 5);

  const getChangeIcon = (
    type: ChangeType
  ) => {
    switch (type) {
      case "date":
        return "📅";

      case "venue":
        return "📍";

      case "deadline":
        return "⏰";

      case "status":
        return "🔄";

      case "announcement":
        return "📢";

      default:
        return "ℹ️";
    }
  };

  const getChangeLabel = (
    type: ChangeType
  ) => {
    switch (type) {
      case "date":
        return "Date & Time";

      case "venue":
        return "Venue";

      case "deadline":
        return "Registration Deadline";

      case "status":
        return "Event Status";

      case "announcement":
        return "Announcement";

      default:
        return "Event Update";
    }
  };

  const getChangeStyle = (
    type: ChangeType
  ) => {
    switch (type) {
      case "date":
        return {
          background:
            "bg-blue-100 dark:bg-blue-950",
          text:
            "text-blue-700 dark:text-blue-300",
        };

      case "venue":
        return {
          background:
            "bg-purple-100 dark:bg-purple-950",
          text:
            "text-purple-700 dark:text-purple-300",
        };

      case "deadline":
        return {
          background:
            "bg-orange-100 dark:bg-orange-950",
          text:
            "text-orange-700 dark:text-orange-300",
        };

      case "status":
        return {
          background:
            "bg-green-100 dark:bg-green-950",
          text:
            "text-green-700 dark:text-green-300",
        };

      case "announcement":
        return {
          background:
            "bg-yellow-100 dark:bg-yellow-950",
          text:
            "text-yellow-700 dark:text-yellow-300",
        };

      default:
        return {
          background:
            "bg-gray-100 dark:bg-gray-800",
          text:
            "text-gray-700 dark:text-gray-300",
        };
    }
  };

  const formatDate = (
    value: string
  ) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const markAsRead = (
    change: EventChange
  ) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === change.id
          ? {
              ...notification,
              status: "read",
            }
          : notification
      )
    );

    onMarkAsRead?.(change);
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        status: "read",
      }))
    );

    onMarkAllAsRead?.();
  };

  const handleOpenNotification = (
    change: EventChange
  ) => {
    if (change.status !== "read") {
      markAsRead(change);
    }

    setSelectedChange(change);
    setShowPreviousValue(false);
  };

  const handleViewEvent = (
    change: EventChange
  ) => {
    if (change.status !== "read") {
      markAsRead(change);
    }

    onViewEvent?.(change);
  };

  /*
   * Empty state
   */
  if (notifications.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-gray-800">
            🔔
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
            No event updates
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            You will see important changes to your
            registered events here.
          </p>
        </div>
      </div>
    );
  }

  /*
   * No unread notifications
   */
  if (
    activeFilter === "unread" &&
    filteredNotifications.length === 0
  ) {
    return (
      <div className="w-full rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-950">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-900">
          ✓
        </div>

        <h2 className="mt-4 text-lg font-bold text-green-800 dark:text-green-300">
          You're all caught up
        </h2>

        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          There are no unread event updates.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 p-5 dark:border-gray-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
                🔔

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Event Updates
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Important changes to your registered
                  events.
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveFilter("all")
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All Updates
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveFilter("unread")
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeFilter === "unread"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {visibleNotifications.map(
            (change) => {
              const style =
                getChangeStyle(
                  change.type
                );

              const isUnread =
                change.status !==
                "read";

              return (
                <article
                  key={change.id}
                  className={`p-5 transition ${
                    isUnread
                      ? "bg-blue-50/40 dark:bg-blue-950/20"
                      : "bg-white dark:bg-gray-900"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${style.background}`}
                    >
                      {getChangeIcon(
                        change.type
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.background} ${style.text}`}
                            >
                              {getChangeLabel(
                                change.type
                              )}
                            </span>

                            {isUnread && (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                New
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                            {change.title}
                          </h3>
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {formatDate(
                            change.createdAt
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {change.message}
                      </p>

                      {/* Changed information */}
                      {(change.previousValue ||
                        change.currentValue) && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Updated Information
                            </p>

                            {change.previousValue && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPreviousValue(
                                    (previous) =>
                                      !previous
                                  )
                                }
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                {showPreviousValue
                                  ? "Hide previous"
                                  : "Show previous"}
                              </button>
                            )}
                          </div>

                          {showPreviousValue &&
                            change.previousValue && (
                              <div className="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-950">
                                <p className="text-[11px] font-semibold uppercase text-red-500">
                                  Previous
                                </p>

                                <p className="mt-1 text-sm text-red-700 line-through dark:text-red-300">
                                  {
                                    change.previousValue
                                  }
                                </p>
                              </div>
                            )}

                          {change.currentValue && (
                            <div className="mt-3 rounded-lg bg-green-50 p-3 dark:bg-green-950">
                              <p className="text-[11px] font-semibold uppercase text-green-600">
                                Current
                              </p>

                              <p className="mt-1 text-sm font-semibold text-green-700 dark:text-green-300">
                                {
                                  change.currentValue
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Event name */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>🎟️</span>

                        <span>
                          {change.eventName}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenNotification(
                              change
                            )
                          }
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          View Update
                        </button>

                        {onViewEvent && (
                          <button
                            type="button"
                            onClick={() =>
                              handleViewEvent(
                                change
                              )
                            }
                            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            View Event
                          </button>
                        )}

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                change
                              )
                            }
                            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>

        {/* Show more */}
        {filteredNotifications.length >
          5 && (
          <div className="border-t border-gray-200 p-4 text-center dark:border-gray-700">
            <button
              type="button"
              onClick={() =>
                setShowAll(
                  (previous) => !previous
                )
              }
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {showAll
                ? "Show fewer updates"
                : `View all ${filteredNotifications.length} updates`}
            </button>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-200 p-5 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                    getChangeStyle(
                      selectedChange.type
                    ).background
                  }`}
                >
                  {getChangeIcon(
                    selectedChange.type
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {getChangeLabel(
                      selectedChange.type
                    )}
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {selectedChange.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedChange(null)
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Event
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedChange.eventName}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Update
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {selectedChange.message}
                </p>
              </div>

              {selectedChange.previousValue && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                    Previous Information
                  </p>

                  <p className="mt-2 text-sm text-red-700 line-through dark:text-red-300">
                    {
                      selectedChange.previousValue
                    }
                  </p>
                </div>
              )}

              {selectedChange.currentValue && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
                    Current Information
                  </p>

                  <p className="mt-2 text-sm font-semibold text-green-700 dark:text-green-300">
                    {
                      selectedChange.currentValue
                    }
                  </p>
                </div>
              )}

              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Updated
                </p>

                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(
                    selectedChange.createdAt
                  )}
                </p>
              </div>

              {selectedChange.organizerName && (
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Organizer
                  </p>

                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {selectedChange.organizerName}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 p-5 dark:border-gray-700">
              <button
                type="button"
                onClick={() =>
                  setSelectedChange(null)
                }
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close
              </button>

              {onViewEvent && (
                <button
                  type="button"
                  onClick={() => {
                    handleViewEvent(
                      selectedChange
                    );
                    setSelectedChange(null);
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View Event
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventChangeNotification;