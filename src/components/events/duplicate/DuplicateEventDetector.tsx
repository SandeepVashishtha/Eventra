import React, { useMemo, useState } from "react";

interface EventData {
  id: string | number;
  title: string;
  date: string;
  location: string;
  organizer: string;
  eventType?: string;
  description?: string;
}

interface DuplicateEventDetectorProps {
  newEvent: Omit<EventData, "id">;
  existingEvents?: EventData[];
  onContinue?: () => void;
  onReview?: (event: EventData) => void;
}

interface DuplicateMatch {
  event: EventData;
  score: number;
  matchedFields: string[];
}

const normalize = (value: string = ""): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
};

const calculateSimilarity = (
  first: string = "",
  second: string = ""
): number => {
  const a = normalize(first);
  const b = normalize(second);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 100;
  }

  if (a.includes(b) || b.includes(a)) {
    return 85;
  }

  const wordsA = new Set(a.split(" "));
  const wordsB = new Set(b.split(" "));

  const intersection = [...wordsA].filter((word) =>
    wordsB.has(word)
  );

  const union = new Set([...wordsA, ...wordsB]);

  if (union.size === 0) {
    return 0;
  }

  return Math.round(
    (intersection.length / union.size) * 100
  );
};

const compareDates = (
  first: string,
  second: string
): number => {
  if (!first || !second) {
    return 0;
  }

  const firstDate = new Date(first);
  const secondDate = new Date(second);

  if (
    Number.isNaN(firstDate.getTime()) ||
    Number.isNaN(secondDate.getTime())
  ) {
    return normalize(first) === normalize(second)
      ? 100
      : 0;
  }

  const difference = Math.abs(
    firstDate.getTime() - secondDate.getTime()
  );

  const oneDay = 24 * 60 * 60 * 1000;

  if (difference === 0) {
    return 100;
  }

  if (difference <= oneDay) {
    return 80;
  }

  if (difference <= 3 * oneDay) {
    return 50;
  }

  return 0;
};

const getMatchLevel = (
  score: number
): "high" | "medium" | "low" => {
  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "medium";
  }

  return "low";
};

const DuplicateEventDetector: React.FC<
  DuplicateEventDetectorProps
> = ({
  newEvent,
  existingEvents = [],
  onContinue,
  onReview,
}) => {
  const [showAllMatches, setShowAllMatches] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<EventData | null>(null);

  const [continueAnyway, setContinueAnyway] =
    useState(false);

  const duplicateMatches = useMemo<DuplicateMatch[]>(
    () => {
      return existingEvents
        .map((event) => {
          const titleScore = calculateSimilarity(
            newEvent.title,
            event.title
          );

          const locationScore = calculateSimilarity(
            newEvent.location,
            event.location
          );

          const organizerScore = calculateSimilarity(
            newEvent.organizer,
            event.organizer
          );

          const dateScore = compareDates(
            newEvent.date,
            event.date
          );

          const matchedFields: string[] = [];

          if (titleScore >= 60) {
            matchedFields.push("Title");
          }

          if (dateScore >= 80) {
            matchedFields.push("Date");
          }

          if (locationScore >= 60) {
            matchedFields.push("Location");
          }

          if (organizerScore >= 60) {
            matchedFields.push("Organizer");
          }

          /*
           * Title and date are given more importance
           * because they are stronger duplicate indicators.
           */
          const score = Math.round(
            titleScore * 0.4 +
              dateScore * 0.25 +
              locationScore * 0.2 +
              organizerScore * 0.15
          );

          return {
            event,
            score,
            matchedFields,
          };
        })
        .filter(
          (match) =>
            match.score >= 50 &&
            match.matchedFields.length >= 1
        )
        .sort(
          (a, b) => b.score - a.score
        );
    },
    [existingEvents, newEvent]
  );

  const hasPotentialDuplicate =
    duplicateMatches.length > 0;

  const visibleMatches = showAllMatches
    ? duplicateMatches
    : duplicateMatches.slice(0, 3);

  const formatDate = (
    value: string
  ): string => {
    if (!value) {
      return "Not specified";
    }

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

  const handleReview = (
    event: EventData
  ) => {
    setSelectedEvent(event);
    onReview?.(event);
  };

  const handleContinue = () => {
    setContinueAnyway(true);
    onContinue?.();
  };

  /*
   * If no duplicate is found, show a success message.
   */
  if (!hasPotentialDuplicate) {
    return (
      <div className="w-full rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl dark:bg-green-900">
            ✓
          </div>

          <div>
            <h3 className="text-base font-semibold text-green-800 dark:text-green-300">
              No duplicate events detected
            </h3>

            <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
              This event does not appear to match
              any existing event. You can continue
              creating it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * If the organizer has already chosen to continue,
   * display a confirmation state.
   */
  if (continueAnyway) {
    return (
      <div className="w-full rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl dark:bg-blue-900">
            ✓
          </div>

          <div>
            <h3 className="text-base font-semibold text-blue-800 dark:text-blue-300">
              You can continue
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-700 dark:text-blue-400">
              You chose to continue creating this
              event even though similar events were
              detected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl border border-yellow-200 bg-white shadow-sm dark:border-yellow-900 dark:bg-gray-900">
        {/* Warning header */}
        <div className="border-b border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-2xl dark:bg-yellow-900">
              ⚠️
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                Possible duplicate event detected
              </h2>

              <p className="mt-1 text-sm leading-6 text-yellow-800 dark:text-yellow-300">
                We found existing events that may
                be similar to the event you are
                creating. Please review them before
                continuing.
              </p>
            </div>
          </div>
        </div>

        {/* New event summary */}
        <div className="border-b border-gray-200 p-5 dark:border-gray-700">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            New Event
          </h3>

          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {newEvent.title || "Untitled Event"}
            </h4>

            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Date
                </span>

                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {formatDate(newEvent.date)}
                </p>
              </div>

              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Location
                </span>

                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {newEvent.location ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Organizer
                </span>

                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {newEvent.organizer ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Event Type
                </span>

                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {newEvent.eventType ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Matches */}
        <div className="p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Similar Events
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {duplicateMatches.length} potential
                match
                {duplicateMatches.length !== 1
                  ? "es"
                  : ""}{" "}
                found
              </p>
            </div>

            {duplicateMatches.length > 3 && (
              <button
                type="button"
                onClick={() =>
                  setShowAllMatches(
                    (previous) => !previous
                  )
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {showAllMatches
                  ? "Show Less"
                  : "View All"}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {visibleMatches.map(
              (match) => {
                const level =
                  getMatchLevel(
                    match.score
                  );

                return (
                  <div
                    key={match.event.id}
                    className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-700"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            {match.event.title ||
                              "Untitled Event"}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              level ===
                              "high"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : level ===
                                  "medium"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {match.score}%
                            match
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                          <div className="flex gap-2">
                            <span>📅</span>

                            <span className="text-gray-600 dark:text-gray-400">
                              {formatDate(
                                match.event
                                  .date
                              )}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <span>📍</span>

                            <span className="text-gray-600 dark:text-gray-400">
                              {match.event
                                .location ||
                                "Not specified"}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <span>👤</span>

                            <span className="text-gray-600 dark:text-gray-400">
                              {match.event
                                .organizer ||
                                "Not specified"}
                            </span>
                          </div>

                          {match.event
                            .eventType && (
                            <div className="flex gap-2">
                              <span>
                                🏷️
                              </span>

                              <span className="text-gray-600 dark:text-gray-400">
                                {
                                  match
                                    .event
                                    .eventType
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Matched fields */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Matched:
                          </span>

                          {match.matchedFields.map(
                            (field) => (
                              <span
                                key={
                                  field
                                }
                                className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {field}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleReview(
                            match.event
                          )
                        }
                        className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                      >
                        Review Event
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Is this event intentionally
                different?
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You can continue if the event is
                genuinely different.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setSelectedEvent(
                    duplicateMatches[0]
                      ?.event ?? null
                  )
                }
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Review Match
              </button>

              <button
                type="button"
                onClick={
                  handleContinue
                }
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Existing Event
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  Event Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEvent(
                    null
                  )
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedEvent.title}
                </h3>

                {selectedEvent
                  .description && (
                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {
                      selectedEvent.description
                    }
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {formatDate(
                      selectedEvent.date
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedEvent.location ||
                      "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Organizer
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedEvent.organizer ||
                      "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Event Type
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedEvent.eventType ||
                      "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-200 pt-5 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedEvent(
                      null
                    )
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DuplicateEventDetector;