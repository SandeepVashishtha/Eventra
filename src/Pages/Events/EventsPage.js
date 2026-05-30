import { useRef, useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom"; // ✅ useLocation added here
import EventHero from "./EventHero";
import EventCard from "./EventCard";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import EventFiltersToolbar from "./EventFiltersToolbar";
import { EventCardSkeleton } from "../../components/common/SkeletonLoaders";
import SearchEmptyState from "../../components/common/SearchEmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ActiveFilters from "./ActiveFilters";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { prepareSafeSearchQuery } from "../../utils/inputSanitization";
import SectionErrorBoundary from "../../components/common/SectionErrorBoundary";

const renderCardSection = (
  isLoading,
  paginatedEvents,
  viewMode,
  searchQuery,
  onClearSearch
) => {
  if (isLoading) {
    return (
      <div>
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Loading events...
        </div>
        <div
          className="animate-pulse transition-all duration-300 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-label="Loading events"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </div>
    );
  }

  if (paginatedEvents.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
        <SearchEmptyState
          query={searchQuery}
          itemLabel="events"
          browseLabel="Browse All Events"
          browsePath="/events"
          onClear={onClearSearch}
          popularTags={["AI", "Blockchain", "Web", "DevOps", "React", "UX"]}
        />
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`}
    >
      {paginatedEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

const EventsPage = () => {
  useDocumentTitle("Eventra | Events");

  const location = useLocation(); // ✅ Now this works!
  const [searchParams, setSearchParams] = useSearchParams();

  // SECURITY: Safely decode and sanitize search query from URL params
  const rawSearchParam =
    new URLSearchParams(location.search).get("search") || "";

  let routeSearchQuery = "";

  try {
    routeSearchQuery = prepareSafeSearchQuery(
      decodeURIComponent(rawSearchParam)
    );
  } catch {
    // Malformed URI component
    routeSearchQuery = "";
  }

  const listing = useEventListing();
  const cardSectionRef = useRef();

  // Local input value updates immediately on each keystroke so the input
  // feels responsive. The debounced value is passed to the listing hook so
  // the Fuse.js search pipeline only runs after the user pauses typing.
  const [localSearchInput, setLocalSearchInput] = useState(listing.searchQuery);
  const debouncedSearchQuery = useDebouncedValue(localSearchInput, 300);

  // Sync the debounced value into the listing hook whenever it settles.
  useEffect(() => {
    listing.setSearchQuery(debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  // Initialize state from URL params
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const perPage = parseInt(searchParams.get("perPage")) || 6;
    const filter = searchParams.get("filter") || "all";
    const sort = searchParams.get("sort") || "Newest";
    const view = searchParams.get("view") || "grid";

    if (routeSearchQuery) listing.setSearchQuery(routeSearchQuery);
    if (filter !== "all") listing.setFilterType(filter);
    if (sort !== "Newest") listing.setSortType(sort);
    if (view !== "grid") listing.setViewMode(view);
    if (perPage !== 6) listing.setEventsPerPage(perPage);
    if (page !== 1) listing.setSafePage(page);
  }, [searchParams, routeSearchQuery]);

  // Sync search query when URL param changes (e.g. navigating from navbar search)
  useEffect(() => {
    const params = {};
    if (listing.currentPage > 1) params.page = listing.currentPage;
    if (listing.eventsPerPage !== 6) params.perPage = listing.eventsPerPage;
    if (listing.searchQuery) params.search = listing.searchQuery;
    if (listing.filterType !== "all") params.filter = listing.filterType;
    if (listing.sortType !== "Newest") params.sort = listing.sortType;
    if (listing.viewMode !== "grid") params.view = listing.viewMode;
    setSearchParams(params, { replace: true });
  }, [
    listing.currentPage,
    listing.eventsPerPage,
    listing.searchQuery,
    listing.filterType,
    listing.sortType,
    listing.viewMode,
    setSearchParams,
  ]);

  // Keep local state in sync when route search changes.
  useEffect(() => {
    const safeQuery = prepareSafeSearchQuery(routeSearchQuery);
    if (safeQuery !== listing.searchQuery) {
      setLocalSearchInput(safeQuery);
      listing.setSearchQuery(safeQuery);
    }
  }, [routeSearchQuery, listing.searchQuery, listing.setSearchQuery]);

  const handleSearch = (query = "") => {
    const safeQuery = prepareSafeSearchQuery(query);
    setLocalSearchInput(safeQuery);
    listing.setSearchQuery(safeQuery);
    return listing.filteredEvents;
  };

  // Scroll to card section after loading when a route search is active
  useEffect(() => {
    if (!listing.isLoading && routeSearchQuery) {
      setTimeout(() => {
        cardSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [listing.isLoading, routeSearchQuery]);

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearSearchAndFilters = () => {
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setSortType("Newest");
    setLocalSearchInput("");
  };

  const hasActiveFilters =
    listing.filterType !== "all" ||
    listing.sortType !== "Newest" ||
    listing.searchQuery !== "";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 overflow-x-hidden">
      <EventHero
        searchQuery={localSearchInput}
        setSearchQuery={setLocalSearchInput}
        filteredEvents={listing.filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        <div className="mb-5 sm:mb-6">

          <EventFiltersToolbar
            filterType={listing.filterType}
            onFilterChange={listing.setFilterType}
            sortType={listing.sortType}
            onSortChange={listing.setSortType}
            viewMode={listing.viewMode}
            onViewModeChange={listing.setViewMode}
            searchQuery={localSearchInput}
            onSearchChange={setLocalSearchInput}
            advancedFilters={listing.advancedFilters}
            onAdvancedFiltersChange={listing.setAdvancedFilters}
            isAdvancedFiltersOpen={listing.isAdvancedFiltersOpen}
            onToggleAdvancedFilters={listing.setIsAdvancedFiltersOpen}
            priceStats={listing.priceStats}
            dateRangeStats={listing.dateRangeStats}
          />
        </div>

        <ActiveFilters
          searchQuery={localSearchInput}
          setSearchQuery={(val) => {
            setLocalSearchInput(val);
            listing.setSearchQuery(val);
          }}
          filterType={listing.filterType}
          setFilterType={listing.setFilterType}
          sortType={listing.sortType}
          setSortType={listing.setSortType}
          viewMode={listing.viewMode}
          setViewMode={listing.setViewMode}
        />

        <SectionErrorBoundary label="Events">
          {renderCardSection(
            listing.isLoading,
            listing.paginatedEvents,
            listing.viewMode,
            listing.searchQuery,
            clearSearchAndFilters
          )}

          {!listing.isLoading && listing.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <PaginationControls
                currentPage={listing.currentPage}
                totalPages={listing.totalPages}
                onPageChange={listing.setSafePage}
              />
            </div>
          )}
        </SectionErrorBoundary>
      </div>

      <EventCTA />
      <FeedbackButton />
    </div>
  );
};

export default EventsPage;