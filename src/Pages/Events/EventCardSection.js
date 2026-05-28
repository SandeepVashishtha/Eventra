import { memo, useMemo } from "react";
import EventCard from "./EventCard";
import SkeletonEventCard from "../../components/common/SkeletonEventCard";

const EventCardSection = ({ isLoading, events, viewMode, filterType, onClearFilters }) => {
  const skeletonItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => `skeleton-${index + 1}`),
    [],
  );
  const visibleEvents = useMemo(() => events, [events]);
  const gridClassName = useMemo(
    () =>
      `grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`,
    [viewMode],
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {skeletonItems.map((key) => (
          <SkeletonEventCard key={key} />
        ))}
      </div>
    );
  }

  if (visibleEvents.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
        <div className="flex justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          No events found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Try a different keyword or adjust your filters to find what you're
          looking for.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
           aria-label="button">
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      key={filterType + viewMode}
      className={gridClassName}
      data-list-size={visibleEvents.length}
    >
      {visibleEvents.map((event, index) => (
        <EventCard key={event.id || `${event.title}-${event.date}-${index}`} event={event} />
      ))}
    </div>
  );
};

export default memo(EventCardSection);
