import React, { useMemo, useState } from "react";

interface Event {
  id: string | number;
  name: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  status: string;
  image?: string;
  description?: string;
}

interface RecommendedEventsProps {
  events?: Event[];
  userInterests?: string[];
  viewedEvents?: (string | number)[];
  registeredEvents?: (string | number)[];
}

const RecommendedEvents: React.FC<RecommendedEventsProps> = ({
  events = [],
  userInterests = [],
  viewedEvents = [],
  registeredEvents = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  /*
   * Check whether an event is upcoming.
   *
   * The event date is converted into a Date object.
   * Events that have already ended are removed.
   */
  const isUpcoming = (event: Event) => {
    const eventDate = new Date(event.date);

    if (Number.isNaN(eventDate.getTime())) {
      return true;
    }

    return eventDate >= new Date();
  };

  /*
   * Create a list of categories from available events.
   */
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(events.map((event) => event.category))
    );

    return ["All", ...uniqueCategories];
  }, [events]);

  /*
   * Calculate a recommendation score.
   *
   * Higher score = more relevant event.
   */
  const getRecommendationScore = (event: Event) => {
    let score = 0;

    /*
     * Matching user interests gets the highest priority.
     */
    const interestMatch = userInterests.some(
      (interest) =>
        interest.toLowerCase() === event.category.toLowerCase()
    );

    if (interestMatch) {
      score += 50;
    }

    /*
     * Previously viewed events indicate user interest.
     */
    if (viewedEvents.includes(event.id)) {
      score += 20;
    }

    /*
     * Upcoming events receive additional priority.
     */
    if (isUpcoming(event)) {
      score += 30;
    }

    /*
     * Open/active events are preferred.
     */
    const status = event.status.toLowerCase();

    if (
      status.includes("open") ||
      status.includes("active") ||
      status.includes("available")
    ) {
      score += 10;
    }

    return score;
  };

  /*
   * Generate personalized recommendations.
   */
  const recommendedEvents = useMemo(() => {
    const availableEvents = events.filter((event) => {
      /*
       * Don't recommend events that have already ended.
       */
      if (!isUpcoming(event)) {
        return false;
      }

      /*
       * Don't recommend events the user is already registered for.
       */
      if (registeredEvents.includes(event.id)) {
        return false;
      }

      /*
       * Apply category filter.
       */
      if (
        selectedCategory !== "All" &&
        event.category !== selectedCategory
      ) {
        return false;
      }

      /*
       * Apply search filter.
       */
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();

        const matchesSearch =
          event.name.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query);

        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });

    /*
     * Sort by recommendation score.
     */
    return [...availableEvents].sort(
      (eventA, eventB) =>
        getRecommendationScore(eventB) -
        getRecommendationScore(eventA)
    );
  }, [
    events,
    userInterests,
    viewedEvents,
    registeredEvents,
    selectedCategory,
    searchQuery,
  ]);

  /*
   * Get a recommendation label.
   */
  const getRecommendationLabel = (event: Event) => {
    const interestMatch = userInterests.some(
      (interest) =>
        interest.toLowerCase() === event.category.toLowerCase()
    );

    if (interestMatch) {
      return "Based on your interests";
    }

    if (viewedEvents.includes(event.id)) {
      return "Because you viewed similar events";
    }

    return "Recommended for you";
  };

  /*
   * Get status badge styling.
   */
  const getStatusClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (
      normalizedStatus.includes("open") ||
      normalizedStatus.includes("active") ||
      normalizedStatus.includes("available")
    ) {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (
      normalizedStatus.includes("closed") ||
      normalizedStatus.includes("cancel")
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  /*
   * Empty state when there are no events.
   */
  if (events.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
          ✨
        </div>

        <h2 className="mt-5 text-xl font-bold text-gray-900">
          Recommended for You
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          We don't have enough event information to create
          personalized recommendations yet.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                ✨
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recommended for You
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Events selected based on your interests and
                  activity.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
              Personalized
            </p>

            <p className="mt-1 text-sm font-semibold text-blue-700">
              {recommendedEvents.length} event
              {recommendedEvents.length !== 1 ? "s" : ""} for you
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH AND FILTER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search recommended events..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100"
              >
                ×
              </button>
            )}
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================
          NO RECOMMENDATIONS
      ====================================================== */}
      {recommendedEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
            🔎
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            No recommendations available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            We don't have enough matching events right now.
            Explore more events or update your interests to get
            better recommendations.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* =====================================================
          RECOMMENDED EVENTS
      ====================================================== */}
      {recommendedEvents.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommendedEvents.map((event) => (
            <article
              key={event.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Event image */}
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
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

                {/* Recommendation badge */}
                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                  ✨ Recommended
                </div>

                {/* Status */}
                <div
                  className={`absolute right-3 top-3 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                    event.status
                  )}`}
                >
                  {event.status}
                </div>
              </div>

              {/* Event content */}
              <div className="p-5">
                {/* Recommendation reason */}
                <p className="text-xs font-medium text-blue-600">
                  {getRecommendationLabel(event)}
                </p>

                {/* Name */}
                <h3 className="mt-2 line-clamp-2 text-lg font-bold text-gray-900">
                  {event.name}
                </h3>

                {/* Description */}
                {event.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                    {event.description}
                  </p>
                )}

                {/* Event details */}
                <div className="mt-5 space-y-3">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <span className="text-base">📅</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Date
                      </p>

                      <p className="text-sm font-medium text-gray-700">
                        {event.date}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <span className="text-base">⏰</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Time
                      </p>

                      <p className="text-sm font-medium text-gray-700">
                        {event.time}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <span className="text-base">📍</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Location
                      </p>

                      <p className="text-sm font-medium text-gray-700">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-start gap-3">
                    <span className="text-base">🏷️</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Category
                      </p>

                      <p className="text-sm font-medium text-gray-700">
                        {event.category}
                      </p>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="flex items-start gap-3">
                    <span className="text-base">👤</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Organizer
                      </p>

                      <p className="text-sm font-medium text-gray-700">
                        {event.organizer}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Open event button */}
                <button
                  type="button"
                  onClick={() => {
                    /*
                     * Eventra can connect this button to its existing
                     * event details route.
                     */
                    window.location.href = `/events/${event.id}`;
                  }}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View Event
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =====================================================
          FALLBACK
      ====================================================== */}
      {recommendedEvents.length > 0 &&
        userInterests.length === 0 &&
        viewedEvents.length === 0 &&
        registeredEvents.length === 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>

              <div>
                <h3 className="font-semibold text-blue-800">
                  Help us personalize your recommendations
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Explore events and register for categories you
                  enjoy. Your activity will help Eventra show more
                  relevant recommendations in the future.
                </p>
              </div>
            </div>
          </div>
        )}
    </section>
  );
};

export default RecommendedEvents;