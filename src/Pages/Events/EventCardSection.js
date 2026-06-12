import { memo, useMemo } from "react";
import EventCard from "./EventCard";
import SkeletonEventCard from "../../components/common/SkeletonEventCard";
import EmptyState from "../../components/common/EmptyState";
import { Search } from "lucide-react";

const EventCardSection = ({
  isLoading,
  events,
  viewMode,
  filterType,
  onClearFilters,
  cacheInfo,
}) => {
  const skeletonItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => `skeleton-${index + 1}`),
    []
  );
  const visibleEvents = useMemo(() => events, [events]);
  const gridClassName = useMemo(
    () =>
      `grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`,
    [viewMode]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonItems.map((key) => (
          <SkeletonEventCard key={key} />
        ))}
      </div>
    );
  }

  if (visibleEvents.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No events found"
        description="Try a different keyword or adjust your filters to find what you're looking for."
        actionLabel={onClearFilters ? "Clear Filters" : null}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <>
      {cacheInfo && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          Showing {cacheInfo.label} cached events. New changes will appear when your connection
          returns.
        </div>
      )}

      <div
        key={filterType + viewMode}
        className={gridClassName}
        data-list-size={visibleEvents.length}
      >
        {visibleEvents.map((event, index) => (
          <EventCard
            key={event.id || `${event.title}-${event.date}-${index}`}
            event={event}
            cacheInfo={cacheInfo}
          />
        ))}
      </div>
    </>
  );
};

export default memo(EventCardSection);
