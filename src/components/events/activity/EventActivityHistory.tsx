import React, { useMemo, useState } from "react";

interface ActivityItem {
  id: string | number;
  eventId: string | number;
  action:
    | "Event Created"
    | "Event Updated"
    | "Registration Opened"
    | "Registration Closed"
    | "Event Published"
    | "Event Cancelled"
    | "Settings Changed";
  description?: string;
  timestamp: string;
}

interface EventActivityHistoryProps {
  eventId: string | number;
  eventName: string;
  activities?: ActivityItem[];
}

const EventActivityHistory: React.FC<
  EventActivityHistoryProps
> = ({
  eventId,
  eventName,
  activities = [],
}) => {
  const [filter, setFilter] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [showDetails, setShowDetails] =
    useState(false);

  /*
   * Only display activities belonging to this event.
   */
  const eventActivities = useMemo(() => {
    return activities
      .filter(
        (activity) =>
          String(activity.eventId) === String(eventId)
      )
      .sort(
        (first, second) =>
          new Date(second.timestamp).getTime() -
          new Date(first.timestamp).getTime()
      );
  }, [activities, eventId]);

  /*
   * Get unique activity types.
   */
  const activityTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        eventActivities.map(
          (activity) => activity.action
        )
      )
    );

    return ["All", ...types];
  }, [eventActivities]);

  /*
   * Filter activities.
   */
  const filteredActivities = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return eventActivities.filter((activity) => {
      const matchesFilter =
        filter === "All" ||
        activity.action === filter;

      const matchesSearch =
        !query ||
        activity.action
          .toLowerCase()
          .includes(query) ||
        activity.description
          ?.toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [
    eventActivities,
    filter,
    searchQuery,
  ]);

  /*
   * Format timestamp.
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /*
   * Get action icon.
   */
  const getActionIcon = (
    action: ActivityItem["action"]
  ) => {
    switch (action) {
      case "Event Created":
        return "✨";

      case "Event Updated":
        return "✏️";

      case "Registration Opened":
        return "🔓";

      case "Registration Closed":
        return "🔒";

      case "Event Published":
        return "📢";

      case "Event Cancelled":
        return "⚠️";

      case "Settings Changed":
        return "⚙️";

      default:
        return "📌";
    }
  };

  /*
   * Get action styling.
   */
  const getActionStyle = (
    action: ActivityItem["action"]
  ) => {
    switch (action) {
      case "Event Created":
        return {
          icon: "bg-purple-100 dark:bg-purple-950",
          badge:
            "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
        };

      case "Event Updated":
        return {
          icon: "bg-blue-100 dark:bg-blue-950",
          badge:
            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        };

      case "Registration Opened":
        return {
          icon: "bg-green-100 dark:bg-green-950",
          badge:
            "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        };

      case "Registration Closed":
        return {
          icon: "bg-orange-100 dark:bg-orange-950",
          badge:
            "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
        };

      case "Event Published":
        return {
          icon: "bg-indigo-100 dark:bg-indigo-950",
          badge:
            "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
        };

      case "Event Cancelled":
        return {
          icon: "bg-red-100 dark:bg-red-950",
          badge:
            "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        };

      case "Settings Changed":
        return {
          icon: "bg-gray-100 dark:bg-gray-800",
          badge:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };

      default:
        return {
          icon: "bg-gray-100 dark:bg-gray-800",
          badge:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  /*
   * Empty state.
   */
  const renderEmptyState = () => {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm dark:bg-gray-700">
          🕐
        </div>

        <h3 className="mt-5 text-lg font-semibold text-gray-800 dark:text-white">
          No activity recorded
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
          Important changes and actions for this event will
          appear here as they occur.
        </p>
      </div>
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              🕐
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Organizer Dashboard
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                Activity History
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Important activity for{" "}
                <strong>{eventName}</strong>.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 px-5 py-3 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Activities
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {eventActivities.length}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Activities
          </p>

          <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            {eventActivities.length}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Recorded event actions
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Activity Types
          </p>

          <p className="mt-3 text-3xl font-bold text-blue-700 dark:text-blue-300">
            {activityTypes.length - 1}
          </p>

          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            Different actions recorded
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900 dark:bg-green-950">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Latest Activity
          </p>

          <p className="mt-3 text-sm font-bold text-green-700 dark:text-green-300">
            {eventActivities.length > 0
              ? eventActivities[0].action
              : "No activity"}
          </p>

          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            {eventActivities.length > 0
              ? formatTimestamp(
                  eventActivities[0].timestamp
                )
              : "Waiting for activity"}
          </p>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}
      {eventActivities.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search activity..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All"
                    ? "All Activities"
                    : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* =====================================================
          ACTIVITY TIMELINE
      ====================================================== */}
      {filteredActivities.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Event Timeline
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Activities are displayed from newest to oldest.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowDetails((previous) => !previous)
              }
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {showDetails
                ? "Hide Details"
                : "Show Details"}
            </button>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-gray-200 sm:block dark:bg-gray-700" />

            <div className="space-y-6">
              {filteredActivities.map(
                (activity, index) => {
                  const style =
                    getActionStyle(activity.action);

                  return (
                    <div
                      key={activity.id}
                      className="relative flex gap-4"
                    >
                      {/* Icon */}
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${style.icon}`}
                      >
                        {getActionIcon(
                          activity.action
                        )}
                      </div>

                      {/* Activity content */}
                      <div className="min-w-0 flex-1 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {activity.action}
                              </h4>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
                              >
                                Activity #{index + 1}
                              </span>
                            </div>

                            {showDetails &&
                              activity.description && (
                                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                  {activity.description}
                                </p>
                              )}
                          </div>

                          <time
                            dateTime={
                              activity.timestamp
                            }
                            className="shrink-0 text-xs font-medium text-gray-400"
                          >
                            {formatTimestamp(
                              activity.timestamp
                            )}
                          </time>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ACTIVITY TYPES
      ====================================================== */}
      {eventActivities.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recorded Activity Types
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Important event actions tracked in the activity
              history.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activityTypes
              .filter((type) => type !== "All")
              .map((type) => {
                const count =
                  eventActivities.filter(
                    (activity) =>
                      activity.action === type
                  ).length;

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {getActionIcon(
                          type as ActivityItem["action"]
                        )}
                      </span>

                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {type}
                      </span>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-200">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =====================================================
          PRIVACY NOTICE
      ====================================================== */}
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>

          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              Privacy Protected
            </h3>

            <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
              The activity history displays event-level actions
              and timestamps only. Sensitive participant
              information, private user data, credentials, and
              other confidential information are not displayed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventActivityHistory;