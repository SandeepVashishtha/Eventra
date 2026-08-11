import { useEffect, useState } from "react";
import {
  Clock3,
  Trash2,
} from "lucide-react";
import RecentlyViewedEventCard from "./RecentlyViewedEventCard";
import {
  getRecentlyViewedEvents,
  removeRecentlyViewedEvent,
  clearRecentlyViewedEvents,
} from "../../utils/recentlyViewedEventsUtils";

const RecentlyViewedEvents = ({
  onViewEvent,
}) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getRecentlyViewedEvents());
  }, []);

  const handleRemove = (eventId) => {
    const updatedEvents =
      removeRecentlyViewedEvent(eventId);

    setEvents(updatedEvents);
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      "Clear all recently viewed events?"
    );

    if (!confirmed) return;

    const updatedEvents =
      clearRecentlyViewedEvents();

    setEvents(updatedEvents);
  };

  const handleView = (event) => {
    onViewEvent?.(event);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Clock3
              size={23}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Recently Viewed Events
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Quickly find events you viewed recently.
            </p>
          </div>
        </div>

        {events.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 size={17} />
            Clear History
          </button>
        )}
      </div>

      {/* Event count */}
      {events.length > 0 && (
        <div className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          {events.length} recently viewed event
          {events.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Empty state */}
      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
          <Clock3
            size={45}
            className="mx-auto mb-4 text-slate-400"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Recently Viewed Events
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Events you view will appear here so you can
            easily find them again.
          </p>
        </div>
      ) : (
        /* Event grid */
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <RecentlyViewedEventCard
              key={event.id}
              event={event}
              onView={handleView}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentlyViewedEvents;