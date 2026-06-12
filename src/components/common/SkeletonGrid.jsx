import { memo, useMemo } from "react";
import SkeletonEventCard from "./SkeletonEventCard";

/**
 * SkeletonGrid
 *
 * A reusable responsive skeleton grid that shows animated placeholder cards
 * while content is loading. Matches the exact layout of the event card grid.
 *
 * @param {number}  count    - Number of skeleton cards to show (default: 6)
 * @param {string}  viewMode - "grid" or "list" (default: "grid")
 * @param {React.ComponentType} CardSkeleton - Skeleton card component to render
 */
const SkeletonGrid = ({ count = 6, viewMode = "grid", CardSkeleton = SkeletonEventCard }) => {
  const skeletonItems = useMemo(
    () => Array.from({ length: count }, (_, i) => `skeleton-${i + 1}`),
    [count]
  );

  const gridClassName =
    viewMode === "grid"
      ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-6 grid-cols-1 max-w-4xl mx-auto";

  return (
    <div className={gridClassName} aria-busy="true" aria-label="Loading events...">
      {skeletonItems.map((key) => (
        <CardSkeleton key={key} />
      ))}
    </div>
  );
};

export default memo(SkeletonGrid);
