import EventCard from "./EventCard";
import { EventCardSkeleton } from "../../components/common/SkeletonLoaders";

const EventCardSection = ({ isLoading, events, viewMode, filterType }) => {
  if (isLoading) {
    return (
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          No events found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div
      key={filterType + viewMode}
      className={`grid gap-8 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-3"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`}
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventCardSection;
