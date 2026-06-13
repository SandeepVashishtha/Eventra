import { useRef, useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import VirtualizedEventGrid from "../../components/common/VirtualizedEventGrid";
import EventHero from "./EventHero";
import EventCard from "./EventCard";
import EventCalendarView from "./EventCalendarView";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import EventFiltersToolbar from "./EventFiltersToolbar";
import { EventCardSkeleton } from "../../components/common/SkeletonLoaders";
import SearchEmptyState from "../../components/common/SearchEmptyState";
import EmptyState from "../../components/common/EmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ActiveFilters from "./ActiveFilters";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { prepareSafeSearchQuery } from "../../utils/inputSanitization";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import ErrorMessage from "../../components/common/ErrorMessage";
import { EventTimeline } from "../../components/EventTimeline";
import { safeJsonParse } from "../../utils/safeJsonParse";
import {
  decodeAdvancedFilters,
  encodeAdvancedFilters,
  getDefaultFilters,
  hasActiveAdvancedFilters,
  normalizeAdvancedFilters,
  serializeAdvancedFilters,
} from "../../utils/advancedFilterUtils";
const FILTER_STORAGE_KEY = "eventra:event-filters:v1";

const ExploreEventsSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">
    {Array.from({ length: 6 }, (_, index) => (
      <EventCardSkeleton key={index} />
    ))}
  </div>
);

const renderCardSection = (
  isLoading,
  loadError,
  onRetry,
  paginatedEvents,
  viewMode,
  searchQuery,
  onClearSearch,
  filteredEvents,
  // hasFilters
) => {
  if (isLoading) {
    return <ExploreEventsSkeleton />;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <ErrorMessage title="Failed to load events" message={loadError} />
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (paginatedEvents.length === 0) {
    const hasSearch = searchQuery && searchQuery.trim() !== "";
    if (hasSearch) {
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
    } else {
      return (
        <EmptyState
          type="filters"
          title="No events match your filters"
          description="Try adjusting your sliders, removing location parameters, or resetting categories."
          actionLabel="Clear Filters"
          onAction={onClearSearch}
        />
      );
    }
  }
  if (viewMode === "grid" && paginatedEvents.length > 50) {
    return <VirtualizedEventGrid events={paginatedEvents} />;
  }
  if (viewMode === "calendar") {
    return <EventCalendarView events={filteredEvents} />;
  }
  return (
    <div
      className={`grid gap-6 ${viewMode === "grid"
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
  const { isLoading } = listing;
  const cardSectionRef = useRef();
  const hasHydratedFilters = useRef(false);
  const [filtersHydrated, setFiltersHydrated] = useState(false);

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

  // Initialize state from URL params, falling back to persisted filters.
  useEffect(() => {
    if (hasHydratedFilters.current) return;

    let savedFilters = {};

    try {
      savedFilters = safeJsonParse(
        window.sessionStorage.getItem(FILTER_STORAGE_KEY) || "{}"
      );
    } catch {
      savedFilters = {};
    }

    const page = parseInt(searchParams.get("page"), 10) || 1;
    const perPage =
      parseInt(searchParams.get("perPage"), 10) || savedFilters.perPage || 6;
    const filter =
      searchParams.get("filter") || savedFilters.filterType || "all";
    const category =
      searchParams.get("category") || savedFilters.categoryFilter || "all";
    const sort = searchParams.get("sort") || savedFilters.sortType || "Newest";
    const view = searchParams.get("view") || savedFilters.viewMode || "grid";
    const urlAdvancedFilters = searchParams.get("filters");
    const advancedFilters = urlAdvancedFilters
      ? decodeAdvancedFilters(urlAdvancedFilters)
      : normalizeAdvancedFilters(
        savedFilters.advancedFilters || getDefaultFilters()
      );
    const initialSearch = routeSearchQuery || savedFilters.searchQuery || "";

    if (initialSearch) {
      setLocalSearchInput(initialSearch);
      listing.setSearchQuery(initialSearch);
    }
    listing.setFilterType(filter);
    listing.setCategoryFilter(category);
    listing.setSortType(sort);
    listing.setViewMode(view);
    listing.setEventsPerPage(perPage);
    listing.setAdvancedFilters(advancedFilters);
    if (page !== 1) listing.setSafePage(page);
    hasHydratedFilters.current = true;
    setFiltersHydrated(true);
  }, [searchParams, routeSearchQuery, listing]);

  // Sync search query when URL param changes (e.g. navigating from navbar search)
  useEffect(() => {
    if (!filtersHydrated) return;

    const params = {};
    if (listing.currentPage > 1) params.page = listing.currentPage;
    if (listing.eventsPerPage !== 6) params.perPage = listing.eventsPerPage;
    if (listing.searchQuery) params.search = listing.searchQuery;
    if (listing.filterType !== "all") params.filter = listing.filterType;
    if (listing.categoryFilter !== "all") params.category = listing.categoryFilter;
    if (listing.sortType !== "Newest") params.sort = listing.sortType;
    if (listing.viewMode !== "grid") params.view = listing.viewMode;
    if (hasActiveAdvancedFilters(listing.advancedFilters)) {
      params.filters = encodeAdvancedFilters(listing.advancedFilters);
    }
    setSearchParams(params, { replace: true });

    try {
      window.sessionStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify({
          searchQuery: listing.searchQuery,
          filterType: listing.filterType,
          categoryFilter: listing.categoryFilter,
          sortType: listing.sortType,
          viewMode: listing.viewMode,
          perPage: listing.eventsPerPage,
          advancedFilters: serializeAdvancedFilters(listing.advancedFilters),
        })
      );
    } catch {
      // sessionStorage can be unavailable in private browsing or embedded views.
    }
  }, [
    listing.currentPage,
    listing.eventsPerPage,
    listing.searchQuery,
    listing.filterType,
    listing.categoryFilter,
    listing.sortType,
    listing.viewMode,
    listing.advancedFilters,
    filtersHydrated,
    setSearchParams,
  ]);

  // Keep local state in sync when an explicit route search changes.
  useEffect(() => {
    if (!rawSearchParam) return;

    const safeQuery = prepareSafeSearchQuery(routeSearchQuery);
    if (safeQuery !== listing.searchQuery) {
      setLocalSearchInput(safeQuery);
      listing.setSearchQuery(safeQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rawSearchParam,
    routeSearchQuery,
    listing.searchQuery,
    listing.setSearchQuery,
  ]);

  const handleSearch = (query = "") => {
    const safeQuery = prepareSafeSearchQuery(query);
    setLocalSearchInput(safeQuery);
    listing.setSearchQuery(safeQuery);
    return listing.filteredEvents;
  };

  // Scroll to card section after loading when a route search is active
  useEffect(() => {
    if (!isLoading && routeSearchQuery) {
      setTimeout(() => {
        cardSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [isLoading, routeSearchQuery]);

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearSearchAndFilters = () => {
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setCategoryFilter("all");
    listing.setSortType("Newest");
    listing.setAdvancedFilters(getDefaultFilters());
    setLocalSearchInput("");
  };

  const currentFilterConfig = useMemo(
    () => ({
      searchQuery: localSearchInput,
      filterType: listing.filterType,
      categoryFilter: listing.categoryFilter,
      sortType: listing.sortType,
      viewMode: listing.viewMode,
      advancedFilters: listing.advancedFilters,
    }),
    [
      localSearchInput,
      listing.filterType,
      listing.categoryFilter,
      listing.sortType,
      listing.viewMode,
      listing.advancedFilters,
    ],
  );

  const applyFilterPreset = (filters) => {
    const search = filters?.searchQuery || "";
    setLocalSearchInput(search);
    listing.setSearchQuery(search);
    listing.setFilterType(filters?.filterType || "all");
    listing.setCategoryFilter(filters?.categoryFilter || "all");
    listing.setSortType(filters?.sortType || "Newest");
    listing.setViewMode(filters?.viewMode || "grid");
    listing.setAdvancedFilters(filters?.advancedFilters || getDefaultFilters());
    listing.setSafePage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 overflow-x-hidden">
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
            categoryFilter={listing.categoryFilter}
            onCategoryChange={listing.setCategoryFilter}
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
            onResetFilters={clearSearchAndFilters}
            currentFilterConfig={currentFilterConfig}
            onApplyPreset={applyFilterPreset}
            visibleEvents={listing.paginatedEvents}
            totalElements={listing.totalElements}
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
          categoryFilter={listing.categoryFilter}
          setCategoryFilter={listing.setCategoryFilter}
          sortType={listing.sortType}
          setSortType={listing.setSortType}
          viewMode={listing.viewMode}
          setViewMode={listing.setViewMode}
          advancedFilters={listing.advancedFilters}
          onAdvancedFiltersChange={listing.setAdvancedFilters}
        />

        <ErrorBoundary level="section" label="Events">
          {renderCardSection(
            isLoading,
            listing.loadError,
            listing.fetchEvents,
            listing.paginatedEvents,
            listing.viewMode,
            listing.searchQuery,
            clearSearchAndFilters,
            listing.filteredEvents,
            hasActiveAdvancedFilters(listing.advancedFilters) ||
              listing.filterType !== "all" ||
              listing.categoryFilter !== "all"
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
        </ErrorBoundary>

        {/* Interactive Event Timeline Planner Section */}
        <div className="mt-12 sm:mt-16">
          <ErrorBoundary level="section" label="Event Timeline Planner">
            <EventTimeline />
          </ErrorBoundary>
        </div>
      </div>

      <EventCTA />
      <FeedbackButton />
    </div>
  );
};

export default EventsPage;
