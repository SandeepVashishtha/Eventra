import React, { useMemo, useState } from "react";

interface OrganizerEvent {
  id: string | number;
  name: string;
  date: string;
  location?: string;
  eventType?: string;
  status?: "upcoming" | "completed" | "cancelled";
  image?: string;
}

interface OrganizerProfileData {
  id: string | number;
  name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  organization?: string;
  website?: string;
  events?: OrganizerEvent[];
}

interface OrganizerProfileProps {
  organizer: OrganizerProfileData;
  isPublic?: boolean;
  onEventClick?: (
    event: OrganizerEvent
  ) => void;
}

const OrganizerProfile: React.FC<
  OrganizerProfileProps
> = ({
  organizer,
  isPublic = true,
  onEventClick,
}) => {
  const [activeTab, setActiveTab] =
    useState<"events" | "about">("events");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [eventFilter, setEventFilter] =
    useState<"all" | "upcoming" | "completed">(
      "all"
    );

  const events = organizer.events ?? [];

  /*
   * Only public events are displayed.
   */
  const publishedEvents = useMemo(() => {
    return events.filter(
      (event) => event.status !== "cancelled"
    );
  }, [events]);

  /*
   * Filter organizer events.
   */
  const filteredEvents = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return publishedEvents.filter((event) => {
      const matchesFilter =
        eventFilter === "all" ||
        event.status === eventFilter;

      const matchesSearch =
        !query ||
        event.name
          .toLowerCase()
          .includes(query) ||
        event.location
          ?.toLowerCase()
          .includes(query) ||
        event.eventType
          ?.toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [
    publishedEvents,
    eventFilter,
    searchQuery,
  ]);

  /*
   * Organizer statistics.
   */
  const upcomingEvents = publishedEvents.filter(
    (event) => event.status === "upcoming"
  ).length;

  const completedEvents = publishedEvents.filter(
    (event) => event.status === "completed"
  ).length;

  /*
   * Format event date.
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
   * Get status styling.
   */
  const getStatusStyle = (
    status?: OrganizerEvent["status"]
  ) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";

      case "completed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  /*
   * Event card.
   */
  const renderEventCard = (
    event: OrganizerEvent
  ) => {
    return (
      <button
        key={event.id}
        type="button"
        onClick={() =>
          onEventClick?.(event)
        }
        className="group w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
      >
        {/* Event image */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
          {event.image ? (
            <img
              src={event.image}
              alt={event.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              🎫
            </div>
          )}

          {event.status && (
            <span
              className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                event.status
              )}`}
            >
              {event.status
                .charAt(0)
                .toUpperCase() +
                event.status.slice(1)}
            </span>
          )}
        </div>

        {/* Event information */}
        <div className="p-5">
          {event.eventType && (
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              {event.eventType}
            </p>
          )}

          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
            {event.name}
          </h3>

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm">
                📅
              </span>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(event.date)}
              </span>
            </div>

            {event.location && (
              <div className="flex items-start gap-2">
                <span className="text-sm">
                  📍
                </span>

                <span className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                  {event.location}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="text-xs text-gray-400">
              View event details
            </span>

            <span className="text-blue-600 transition group-hover:translate-x-1 dark:text-blue-400">
              →
            </span>
          </div>
        </div>
      </button>
    );
  };

  /*
   * Public profile.
   */
  if (!isPublic) {
    return null;
  }

  return (
    <main className="w-full space-y-6">
      {/* =====================================================
          PROFILE HEADER
      ====================================================== */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Cover */}
        <div className="h-36 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 sm:h-48" />

        <div className="px-5 pb-6 sm:px-8">
          {/* Avatar */}
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gray-100 text-4xl shadow-md dark:border-gray-900 dark:bg-gray-800">
                {organizer.avatar ? (
                  <img
                    src={organizer.avatar}
                    alt={`${organizer.name} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {organizer.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {organizer.name}
                  </h1>

                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Organizer
                  </span>
                </div>

                {organizer.username && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    @{organizer.username}
                  </p>
                )}

                {organizer.organization && (
                  <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {organizer.organization}
                  </p>
                )}
              </div>
            </div>

            {organizer.website && (
              <a
                href={organizer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Visit Website
              </a>
            )}
          </div>

          {/* Bio */}
          {organizer.bio && (
            <p className="mt-6 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
              {organizer.bio}
            </p>
          )}
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl dark:bg-blue-950">
              🎫
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Published Events
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {publishedEvents.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-xl dark:bg-green-950">
              📅
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Upcoming
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {upcomingEvents}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-purple-950">
              ✓
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {completedEvents}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TABS
      ====================================================== */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() =>
              setActiveTab("events")
            }
            className={`flex-1 px-5 py-4 text-sm font-semibold transition ${
              activeTab === "events"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Published Events
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("about")
            }
            className={`flex-1 px-5 py-4 text-sm font-semibold transition ${
              activeTab === "about"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            About Organizer
          </button>
        </div>

        {/* ===================================================
            EVENTS TAB
        ==================================================== */}
        {activeTab === "events" && (
          <div className="p-5 sm:p-6">
            {/* Search/filter */}
            {publishedEvents.length > 0 && (
              <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search published events..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                />

                <select
                  value={eventFilter}
                  onChange={(event) =>
                    setEventFilter(
                      event.target.value as
                        | "all"
                        | "upcoming"
                        | "completed"
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">
                    All Events
                  </option>

                  <option value="upcoming">
                    Upcoming Events
                  </option>

                  <option value="completed">
                    Completed Events
                  </option>
                </select>
              </div>
            )}

            {/* Events */}
            {filteredEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-gray-700">
                  🎫
                </div>

                <h3 className="mt-4 font-semibold text-gray-800 dark:text-white">
                  No published events found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                  This organizer has no events matching
                  your current search or filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map(
                  renderEventCard
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            ABOUT TAB
        ==================================================== */}
        {activeTab === "about" && (
          <div className="p-5 sm:p-6">
            <div className="max-w-3xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                About {organizer.name}
              </h2>

              <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {organizer.bio ||
                  "This organizer has not provided a public biography yet."}
              </p>

              {organizer.organization && (
                <div className="mt-6 rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Organization
                  </p>

                  <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                    {organizer.organization}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          PRIVACY NOTICE
      ====================================================== */}
      <section className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>

          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              Public Profile
            </h3>

            <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
              This profile only displays information intended
              to be publicly visible. Private organizer details
              such as personal contact information and account
              information are not displayed.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OrganizerProfile;