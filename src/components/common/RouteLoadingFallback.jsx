import { EventCardSkeleton } from "./SkeletonLoaders";

const RouteLoadingFallback = () => (
  <div
    className="mx-auto flex min-h-[50vh] max-w-4xl items-center justify-center px-4 py-12"
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <EventCardSkeleton />
  </div>
);

export default RouteLoadingFallback;
