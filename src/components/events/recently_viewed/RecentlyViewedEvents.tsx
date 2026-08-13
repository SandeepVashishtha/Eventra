import React, { useEffect, useMemo, useState } from "react";

interface RecentlyViewedEvent {
  id: string;
  name: string;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
  eventType?: string;
  status?: string;
  viewedAt: string;
}

interface RecentlyViewedEventsProps {
  currentEvent?: RecentlyViewedEvent;
  initialEvents?: RecentlyViewedEvent[];
  maxEvents?: number;
  onEventSelect?: (event: RecentlyViewedEvent) => void;
  onClearHistory?: () => void;
}

const DEFAULT_MAX_EVENTS = 10;

const RecentlyViewedEvents: React.FC<
  RecentlyViewedEventsProps
> = ({
  currentEvent,
  initialEvents = [],
  maxEvents = DEFAULT_MAX_EVENTS,
  onEventSelect,
  onClearHistory,
}) => {
  const storageKey =
    "eventra-recently-viewed-events";

  const [events, setEvents] =
    useState<RecentlyViewedEvent[]>(
      initialEvents
    );

  const [showClearDialog, setShowClearDialog] =
    useState(false);

  const [showUnavailable, setShowUnavailable] =
    useState(false);

  /*
   * Load recently viewed events.
   */
  useEffect(() => {
    try {
      const savedEvents =
        localStorage.getItem(storageKey);

      if (!savedEvents) {
        return;
      }

      const parsed =
        JSON.parse(savedEvents);

      if (Array.isArray(parsed)) {
        setEvents(parsed);
      }
    } catch {
      /*
       * Ignore invalid localStorage data.
       */
    }
  }, []);

  /*
   * Add the current event to the history.
   *
   * The newest event is always placed first.
   * Existing entries for the same event are removed
   * before adding the latest view.
   */
  useEffect(() => {
    if (!currentEvent?.id) {
      return;
    }

    setEvents((previousEvents) => {
      const withoutCurrentEvent =
        previousEvents.filter(
          (event) =>
            event.id !== currentEvent.id
        );

      const updatedEvent: RecentlyViewedEvent = {
        ...currentEvent,
        viewedAt: new Date().toISOString(),
      };

      const updatedEvents = [
        updatedEvent,
        ...withoutCurrentEvent,
      ].slice(0, maxEvents);

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(updatedEvents)
        );
      } catch {
        /*
         * Ignore localStorage errors.
         */
      }

      return updatedEvents;
    });
  }, [currentEvent, maxEvents]);

  /*
   * Keep localStorage synchronized whenever
   * the event history changes.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(events)
      );
    } catch {
      /*
       * Ignore localStorage errors.
       */
    }
  }, [events]);

  /*
   * Separate unavailable events so the user can
   * optionally see them.
   */
  const availableEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.status?.toLowerCase() !==
            "unavailable" &&
          event.status?.toLowerCase() !==
            "deleted"
      ),
    [events]
  );

  const unavailableEvents = useMemo(
    () =>
      events.filter((event) => {
        const status =
          event.status?.toLowerCase();

        return (
          status === "unavailable" ||
          status === "deleted"
        );
      }),
    [events]
  );

  const formatViewedAt = (
    viewedAt: string
  ) => {
    const date =
      new Date(viewedAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const handleEventClick = (
    event: RecentlyViewedEvent
  ) => {
    onEventSelect?.(event);
  };

  const clearHistory = () => {
    setEvents([]);
    setShowClearDialog(false);

    try {
      localStorage.removeItem(
        storageKey
      );
    } catch {
      /*
       * Ignore localStorage errors.
       */

    }

    onClearHistory?.();
  };

  /*
   * Empty state.
   */
  if (events.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              🕘
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Your Activity
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Recently Viewed Events
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Events you view will appear here so you
                can quickly return to them later.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl dark:bg-gray-800">
            🕘
          </div>

          <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">
            No recently viewed events
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            Start browsing events and your recently
            viewed events will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
                🕘
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Your Activity
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  Recently Viewed Events
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Quickly return to events you viewed
                  recently.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowClearDialog(true)
              }
              className="self-start rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Clear History
            </button>
          </div>

          {/* Privacy notice */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-100/60 p-4 dark:border-blue-900 dark:bg-blue-950/40">
            <span className="text-lg">
              🔒
            </span>

            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Your viewing history is private
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-400">
                Recently viewed events are stored
                separately for your browsing session and
                are not displayed to other users.
              </p>
            </div>
          </div>
        </div>

        {/* Available events */}
        <div className="p-5 sm:p-6">
          {availableEvents.length > 0 && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Recently Viewed
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Most recently viewed events appear first.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableEvents.map(
                  (event) => (
                    <article
                      key={event.id}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-800"
                    >
                      {/* Image */}
                      <button
                        type="button"
                        onClick={() =>
                          handleEventClick(
                            event
                          )
                        }
                        className="block w-full text-left"
                      >
                        <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-4xl dark:from-blue-950 dark:to-purple-950">
                              🎫
                            </div>
                          )}

                          {event.eventType && (
                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700 shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-300">
                              {event.eventType}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h4 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
                            {event.name}
                          </h4>

                          {event.date && (
                            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>📅</span>
                              <span>
                                {event.date}
                              </span>
                              {event.time && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {event.time}
                                  </span>
                                </>
                              )}
                            </p>
                          )}

                          {event.location && (
                            <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>📍</span>
                              <span className="truncate">
                                {event.location}
                              </span>
                            </p>
                          )}

                          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                            <span className="text-[11px] text-gray-400">
                              Viewed{" "}
                              {formatViewedAt(
                                event.viewedAt
                              )}
                            </span>

                            <span className="text-xs font-semibold text-blue-600 transition group-hover:translate-x-0.5 dark:text-blue-400">
                              View Event →
                            </span>
                          </div>
                        </div>
                      </button>
                    </article>
                  )
                )}
              </div>
            </div>
          )}

          {/* Unavailable events */}
          {unavailableEvents.length > 0 && (
            <div
              className={
                availableEvents.length > 0
                  ? "mt-8"
                  : ""
              }
            >
              <button
                type="button"
                onClick={() =>
                  setShowUnavailable(
                    (previous) => !previous
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 text-left dark:border-gray-700 dark:bg-gray-800"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Unavailable Events
                  </h3>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {unavailableEvents.length} previously
                    viewed event
                    {unavailableEvents.length !== 1
                      ? "s"
                      : ""}{" "}
                    are no longer available.
                  </p>
                </div>

                <span className="text-gray-400">
                  {showUnavailable
                    ? "⌃"
                    : "⌄"}
                </span>
              </button>

              {showUnavailable && (
                <div className="mt-3 space-y-3">
                  {unavailableEvents.map(
                    (event) => (
                      <div
                        key={event.id}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-lg dark:bg-gray-700">
                            🚫
                          </div>

                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {event.name}
                            </h4>

                            <p className="mt-1 text-xs text-gray-400">
                              This event is no longer
                              available.
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <span className="text-lg">
              💡
            </span>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Your history stays up to date
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Opening an event again moves it to the top
                of your recently viewed list and removes
                duplicate entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clear history confirmation */}
      {showClearDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-history-title"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl dark:bg-red-950">
              🗑️
            </div>

            <h2
              id="clear-history-title"
              className="mt-4 text-lg font-bold text-gray-900 dark:text-white"
            >
              Clear recently viewed history?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              This will remove all events from your
              recently viewed list. This action cannot be
              undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowClearDialog(false)
                }
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Keep History
              </button>

              <button
                type="button"
                onClick={clearHistory}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentlyViewedEvents;