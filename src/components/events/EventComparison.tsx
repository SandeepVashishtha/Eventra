import React, { useMemo, useState } from "react";

interface Event {
  id: string | number;
  name: string;
  date: string;
  time: string;
  location: string;
  eventType: string;
  registrationDeadline: string;
  status: string;
  organizer: string;
}

interface EventComparisonProps {
  events?: Event[];
  maxEvents?: number;
}

interface ComparisonRowProps {
  label: string;
  events: Event[];
  getValue: (event: Event) => string;
}

const DEFAULT_MAX_EVENTS = 4;

const EventComparison: React.FC<EventComparisonProps> = ({
  events = [],
  maxEvents = DEFAULT_MAX_EVENTS,
}) => {
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  /*
   * Filter events according to search query.
   */
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = events;

    if (showOnlySelected) {
      result = result.filter((event) =>
        selectedEvents.some((selected) => selected.id === event.id)
      );
    }

    if (!query) {
      return result;
    }

    return result.filter((event) => {
      return (
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.eventType.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query)
      );
    });
  }, [events, searchQuery, showOnlySelected, selectedEvents]);

  /*
   * Check whether an event is already selected.
   */
  const isEventSelected = (eventId: string | number) => {
    return selectedEvents.some((event) => event.id === eventId);
  };

  /*
   * Select or deselect an event.
   */
  const toggleEvent = (event: Event) => {
    const alreadySelected = isEventSelected(event.id);

    if (alreadySelected) {
      setSelectedEvents((previousEvents) =>
        previousEvents.filter((selected) => selected.id !== event.id)
      );

      return;
    }

    /*
     * Prevent selecting more events than the allowed limit.
     */
    if (selectedEvents.length >= maxEvents) {
      return;
    }

    setSelectedEvents((previousEvents) => [
      ...previousEvents,
      event,
    ]);
  };

  /*
   * Remove a single event from comparison.
   */
  const removeEvent = (eventId: string | number) => {
    setSelectedEvents((previousEvents) =>
      previousEvents.filter((event) => event.id !== eventId)
    );
  };

  /*
   * Remove all selected events.
   */
  const clearComparison = () => {
    setSelectedEvents([]);
  };

  /*
   * Get a readable status class.
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

    if (
      normalizedStatus.includes("upcoming") ||
      normalizedStatus.includes("pending")
    ) {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  /*
   * Get the number of selected events.
   */
  const selectedCount = selectedEvents.length;

  /*
   * Comparison requires at least two events.
   */
  const canCompare = selectedCount >= 2;

  return (
    <section className="w-full space-y-6">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                ⚖️
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Compare Events
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Compare event details side by side before making
                  your decision.
                </p>
              </div>
            </div>
          </div>

          {/* Selected counter and clear button */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              {selectedCount} / {maxEvents} selected
            </div>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={clearComparison}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          SEARCH AND FILTER
      ========================================================== */}
      {events.length > 0 && (
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
                placeholder="Search events by name, location, type..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Selected filter */}
            <button
              type="button"
              onClick={() =>
                setShowOnlySelected((previousValue) => !previousValue)
              }
              className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                showOnlySelected
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {showOnlySelected
                ? "Showing Selected"
                : "Show Selected Only"}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          INFORMATION MESSAGE
      ========================================================== */}
      {selectedCount === 1 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-sm text-blue-700">
            <strong>1 event selected.</strong> Select at least one
            more event to start comparing.
          </p>
        </div>
      )}

      {selectedCount >= maxEvents && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <p className="text-sm text-yellow-700">
            You can compare up to {maxEvents} events at a time.
          </p>
        </div>
      )}

      {/* =========================================================
          EVENT SELECTION
      ========================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Select Events
            </h2>

            <p className="text-sm text-gray-500">
              Choose the events you want to compare.
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* No events */}
        {events.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-2xl">
              📅
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              No events available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              There are currently no events available for comparison.
            </p>
          </div>
        )}

        {/* Search has no results */}
        {events.length > 0 && filteredEvents.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-2xl">
              🔍
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              No matching events
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setShowOnlySelected(false);
              }}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Event cards */}
        {filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const selected = isEventSelected(event.id);

              const disabled =
                !selected && selectedCount >= maxEvents;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggleEvent(event)}
                  disabled={disabled}
                  className={`group relative rounded-xl border p-5 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : disabled
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                      : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  {/* Selected check */}
                  <div
                    className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </div>

                  {/* Event name */}
                  <h3 className="pr-10 text-base font-semibold text-gray-900">
                    {event.name}
                  </h3>

                  {/* Date */}
                  <div className="mt-4 flex items-start gap-3">
                    <span className="text-base">📅</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Date
                      </p>

                      <p className="text-sm text-gray-700">
                        {event.date}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-3 flex items-start gap-3">
                    <span className="text-base">📍</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Location
                      </p>

                      <p className="text-sm text-gray-700">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="mt-3 flex items-start gap-3">
                    <span className="text-base">🏷️</span>

                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Type
                      </p>

                      <p className="text-sm text-gray-700">
                        {event.eventType}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          EMPTY COMPARISON STATE
      ========================================================== */}
      {selectedCount === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center sm:p-14">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
            ⚖️
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            No events selected
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Select at least two events from the list above to
            compare their details side by side.
          </p>
        </div>
      )}

      {/* =========================================================
          NOT ENOUGH EVENTS FOR COMPARISON
      ========================================================== */}
      {selectedCount === 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl">
            ➕
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            Select another event
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You need at least two events to compare them.
          </p>
        </div>
      )}

      {/* =========================================================
          COMPARISON TABLE
      ========================================================== */}
      {canCompare && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Comparison header */}
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Event Comparison
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Compare {selectedCount} selected events side by
                side.
              </p>
            </div>

            <button
              type="button"
              onClick={clearComparison}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Reset Comparison
            </button>
          </div>

          {/* Horizontal scroll for mobile */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse">
              <thead>
                <tr>
                  {/* Details column */}
                  <th className="sticky left-0 z-10 w-48 border-b border-r border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-700">
                    Event Details
                  </th>

                  {/* Event columns */}
                  {selectedEvents.map((event) => (
                    <th
                      key={event.id}
                      className="min-w-[250px] border-b border-gray-200 p-5 text-left align-top"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {event.name}
                          </h3>

                          <span
                            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeEvent(event.id)}
                          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${event.name} from comparison`}
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Date */}
                <ComparisonRow
                  label="Date"
                  icon="📅"
                  events={selectedEvents}
                  getValue={(event) => event.date}
                />

                {/* Time */}
                <ComparisonRow
                  label="Time"
                  icon="⏰"
                  events={selectedEvents}
                  getValue={(event) => event.time}
                />

                {/* Location */}
                <ComparisonRow
                  label="Location"
                  icon="📍"
                  events={selectedEvents}
                  getValue={(event) => event.location}
                />

                {/* Event Type */}
                <ComparisonRow
                  label="Event Type"
                  icon="🏷️"
                  events={selectedEvents}
                  getValue={(event) => event.eventType}
                />

                {/* Registration Deadline */}
                <ComparisonRow
                  label="Registration Deadline"
                  icon="📝"
                  events={selectedEvents}
                  getValue={(event) =>
                    event.registrationDeadline
                  }
                />

                {/* Status */}
                <ComparisonRow
                  label="Event Status"
                  icon="🟢"
                  events={selectedEvents}
                  getValue={(event) => event.status}
                  renderValue={(event) => (
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                        event.status
                      )}`}
                    >
                      {event.status || "Not available"}
                    </span>
                  )}
                />

                {/* Organizer */}
                <ComparisonRow
                  label="Organizer"
                  icon="👤"
                  events={selectedEvents}
                  getValue={(event) => event.organizer}
                />
              </tbody>
            </table>
          </div>

          {/* Bottom note */}
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-center text-xs text-gray-500">
              You can remove an event from the comparison at any
              time using the Remove button.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          SELECTED EVENTS SUMMARY
      ========================================================== */}
      {selectedCount > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Selected Events
              </h3>

              <p className="text-sm text-gray-500">
                {selectedCount} of {maxEvents} comparison slots
                used
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2"
              >
                <span className="max-w-[180px] truncate text-sm font-medium text-blue-700">
                  {event.name}
                </span>

                <button
                  type="button"
                  onClick={() => removeEvent(event.id)}
                  className="rounded-full p-1 text-blue-500 hover:bg-blue-100 hover:text-blue-700"
                  aria-label={`Remove ${event.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

/* =============================================================
   COMPARISON ROW COMPONENT
============================================================= */

const ComparisonRow: React.FC<
  ComparisonRowProps & {
    icon?: string;
    renderValue?: (event: Event) => React.ReactNode;
  }
> = ({
  label,
  icon,
  events,
  getValue,
  renderValue,
}) => {
  return (
    <tr className="group">
      {/* Row label */}
      <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 p-4 align-top">
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}

          <span className="text-sm font-semibold text-gray-700">
            {label}
          </span>
        </div>
      </td>

      {/* Event values */}
      {events.map((event) => (
        <td
          key={event.id}
          className="border-b border-gray-200 p-5 align-top text-sm text-gray-600 transition group-hover:bg-gray-50"
        >
          {renderValue
            ? renderValue(event)
            : getValue(event) || (
                <span className="italic text-gray-400">
                  Not available
                </span>
              )}
        </td>
      ))}
    </tr>
  );
};

export default EventComparison;