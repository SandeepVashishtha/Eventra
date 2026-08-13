import React, { useMemo, useState } from "react";

interface EventHistoryItem {
  id: string | number;
  eventName: string;
  eventDate: string;
  eventType: string;
  organizer: string;
  attendanceStatus: "Attended" | "Registered" | "Absent" | "Cancelled";
  detailsUrl?: string;
}

interface EventAttendanceHistoryProps {
  events?: EventHistoryItem[];
}

const EventAttendanceHistory: React.FC<
  EventAttendanceHistoryProps
> = ({ events = [] }) => {
  const [activeTab, setActiveTab] = useState<
    "past" | "upcoming"
  >("past");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedType, setSelectedType] =
    useState("All");

  /*
   * Determine whether an event is in the past.
   */
  const isPastEvent = (event: EventHistoryItem) => {
    const eventDate = new Date(event.eventDate);

    if (Number.isNaN(eventDate.getTime())) {
      return false;
    }

    return eventDate.getTime() < Date.now();
  };

  /*
   * Separate past and upcoming events.
   */
  const pastEvents = useMemo(() => {
    return events.filter(isPastEvent);
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events.filter((event) => !isPastEvent(event));
  }, [events]);

  /*
   * Get currently selected events.
   */
  const currentEvents =
    activeTab === "past"
      ? pastEvents
      : upcomingEvents;

  /*
   * Get event types.
   */
  const eventTypes = useMemo(() => {
    const types = Array.from(
      new Set(
        currentEvents
          .map((event) => event.eventType)
          .filter(Boolean)
      )
    );

    return ["All", ...types];
  }, [currentEvents]);

  /*
   * Filter events.
   */
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return currentEvents.filter((event) => {
      const matchesSearch =
        !query ||
        event.eventName.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query) ||
        event.eventType.toLowerCase().includes(query);

      const matchesType =
        selectedType === "All" ||
        event.eventType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [
    currentEvents,
    searchQuery,
    selectedType,
  ]);

  /*
   * Statistics.
   */
  const attendedCount = pastEvents.filter(
    (event) =>
      event.attendanceStatus === "Attended"
  ).length;

  const absentCount = pastEvents.filter(
    (event) =>
      event.attendanceStatus === "Absent"
  ).length;

  /*
   * Format date.
   */
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * Status styling.
   */
  const getStatusStyle = (
    status: EventHistoryItem["attendanceStatus"]
  ) => {
    switch (status) {
      case "Attended":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";

      case "Registered":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

      case "Absent":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";

      case "Cancelled":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  /*
   * Status icon.
   */
  const getStatusIcon = (
    status: EventHistoryItem["attendanceStatus"]
  ) => {
    switch (status) {
      case "Attended":
        return "✓";

      case "Registered":
        return "📅";

      case "Absent":
        return "✕";

      case "Cancelled":
        return "−";

      default:
        return "•";
    }
  };

  /*
   * Empty state.
   */
  const renderEmptyState = () => {
    const isPast = activeTab === "past";

    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm dark:bg-gray-700">
          {isPast ? "📜" : "📅"}
        </div>

        <h3 className="mt-5 text-lg font-semibold text-gray-800 dark:text-white">
          {isPast
            ? "No event history yet"
            : "No upcoming registrations"}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
          {isPast
            ? "Events you attend or register for will appear here after they are completed."
            : "Your upcoming registered events will appear here."}
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
              📜
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                User Dashboard
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                Event History
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review your past participation and upcoming
                event registrations.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 px-5 py-3 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total Events
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {events.length}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Past Events
          </p>

          <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            {pastEvents.length}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Completed or past events
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900 dark:bg-green-950">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Attended
          </p>

          <p className="mt-3 text-3xl font-bold text-green-700 dark:text-green-300">
            {attendedCount}
          </p>

          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            Events you participated in
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Upcoming
          </p>

          <p className="mt-3 text-3xl font-bold text-blue-700 dark:text-blue-300">
            {upcomingEvents.length}
          </p>

          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            Upcoming registrations
          </p>
        </div>
      </div>

      {/* =====================================================
          TABS
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("past");
              setSelectedType("All");
              setSearchQuery("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "past"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Past Events
            <span className="ml-2 opacity-75">
              ({pastEvents.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("upcoming");
              setSelectedType("All");
              setSearchQuery("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === "upcoming"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Upcoming
            <span className="ml-2 opacity-75">
              ({upcomingEvents.length})
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================
          SEARCH & FILTER
      ====================================================== */}
      {currentEvents.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search events or organizers..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />

            <select
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All"
                    ? "All Event Types"
                    : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* =====================================================
          EVENT LIST
      ====================================================== */}
      {filteredEvents.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Event information */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
                    🎫
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.eventName}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        📅 {formatDate(event.eventDate)}
                      </span>

                      <span>
                        🏷️ {event.eventType}
                      </span>

                      <span>
                        👤 {event.organizer}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                      event.attendanceStatus
                    )}`}
                  >
                    <span>
                      {getStatusIcon(
                        event.attendanceStatus
                      )}
                    </span>

                    {event.attendanceStatus}
                  </span>

                  {/* Event details */}
                  {event.detailsUrl ? (
                    <a
                      href={event.detailsUrl}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      View Details →
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400 dark:border-gray-700"
                    >
                      Details Unavailable
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =====================================================
          ATTENDANCE SUMMARY
      ====================================================== */}
      {pastEvents.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Attendance Summary
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overview of your participation in past events.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950">
              <p className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
                Attended
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                {attendedCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950">
              <p className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                Absent
              </p>

              <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
                {absentCount}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Attendance Rate
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {pastEvents.length > 0
                  ? Math.round(
                      (attendedCount /
                        pastEvents.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRIVACY NOTICE
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Your Event History
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              This section displays your own event registrations
              and attendance history. Existing registration
              workflows are not changed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventAttendanceHistory;