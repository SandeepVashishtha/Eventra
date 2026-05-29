import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import EventHero from "./EventHero";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import EventCardSection from "./EventCardSection";
import EventFiltersToolbar from "./EventFiltersToolbar";
import ActiveFilters from "./ActiveFilters";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
import { useDebounce } from "../../hooks/useDebounce";
import { prepareSafeSearchQuery } from "../../utils/inputSanitization";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import SectionErrorBoundary from "../../components/common/SectionErrorBoundary";
import EmptySearchState from "../../components/EmptySearchState";

const getRouteSearchQuery = (location) => {
  const rawSearchParam = new URLSearchParams(location.search).get("q") || "";
  try {
    return prepareSafeSearchQuery(decodeURIComponent(rawSearchParam));
  } catch {
    return "";
  }
};

const EventsPage = () => {
  useDocumentTitle("Eventra | Events");

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const cardSectionRef = useRef(null);
  const listing = useEventListing();
  const routeSearchQuery = getRouteSearchQuery(location);
  const [localSearchInput, setLocalSearchInput] = useState(routeSearchQuery);
  const debouncedQuery = useDebounce(localSearchInput, 300);

  useEffect(() => {
    listing.setSearchQuery(prepareSafeSearchQuery(debouncedQuery));
  }, [debouncedQuery, listing.setSearchQuery]);

  // On browser navigation (back/forward), hydrate all state from URL
  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || listing.eventsPerPage;
    const filter = searchParams.get("filter") || "all";
    const sort = searchParams.get("sort") || "Newest";
    const view = searchParams.get("view") || "grid";

    setLocalSearchInput(routeSearchQuery);
    listing.setSearchQuery(routeSearchQuery);
    listing.setFilterType(filter);
    listing.setSortType(sort);
    listing.setViewMode(view);
    listing.setEventsPerPage(perPage);
    listing.setSafePage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Write current state to URL, using `q` for the search param
  useEffect(() => {
    const params = {};

    if (listing.currentPage > 1) params.page = String(listing.currentPage);
    if (listing.eventsPerPage !== 6) params.perPage = String(listing.eventsPerPage);
    if (listing.searchQuery) params.q = listing.searchQuery;
    if (listing.filterType !== "all") params.filter = listing.filterType;
    if (listing.sortType !== "Newest") params.sort = listing.sortType;
    if (listing.viewMode !== "grid") params.view = listing.viewMode;

    setSearchParams(params, { replace: true });
  }, [
    listing.currentPage,
    listing.eventsPerPage,
    listing.filterType,
    listing.searchQuery,
    listing.sortType,
    listing.viewMode,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!listing.isLoading && routeSearchQuery) {
      window.setTimeout(() => {
        cardSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [listing.isLoading, routeSearchQuery]);

  const handleSearch = useCallback(
    (query = "") => {
      const safeQuery = prepareSafeSearchQuery(query);
      setLocalSearchInput(safeQuery);
      listing.setSearchQuery(safeQuery);
      return listing.filteredEvents;
    },
    [listing],
  );

  const scrollToCard = useCallback(() => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      listing.setSafePage(page);
      cardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [listing],
  );

  const handleClearFilters = useCallback(() => {
    setLocalSearchInput("");
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setSortType("Newest");
    listing.setViewMode("grid");
    listing.setAdvancedFilters({});
  }, [listing]);

  const hasActiveFilters =
    listing.filterType !== "all" ||
    listing.sortType !== "Newest" ||
    listing.searchQuery !== "" ||
    Object.keys(listing.advancedFilters || {}).length > 0;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white text-slate-900 dark:bg-slate-950 dark:text-gray-100">
      <EventHero
        searchQuery={localSearchInput}
        filteredEvents={listing.filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <main
        ref={cardSectionRef}
        className="safe-area-x mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {listing.loadError && (
          <div
            className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
            role="status"
          >
            {listing.loadError}
          </div>
        )}

        <EventFiltersToolbar
          filterType={listing.filterType}
          onFilterChange={listing.setFilterType}
          sortType={listing.sortType}
          onSortChange={listing.setSortType}
          viewMode={listing.viewMode}
          onViewModeChange={listing.setViewMode}
          advancedFilters={listing.advancedFilters}
          onAdvancedFiltersChange={listing.setAdvancedFilters}
          isAdvancedFiltersOpen={listing.isAdvancedFiltersOpen}
          onToggleAdvancedFilters={listing.setIsAdvancedFiltersOpen}
          priceStats={listing.priceStats}
          dateRangeStats={listing.dateRangeStats}
          searchQuery={localSearchInput}
          onSearchChange={setLocalSearchInput}
        />

        <ActiveFilters
          searchQuery={localSearchInput}
          setSearchQuery={(value) => {
            setLocalSearchInput(value);
            listing.setSearchQuery(value);
          }}
          filterType={listing.filterType}
          setFilterType={listing.setFilterType}
          sortType={listing.sortType}
          setSortType={listing.setSortType}
          viewMode={listing.viewMode}
          setViewMode={listing.setViewMode}
          advancedFilters={listing.advancedFilters}
          onAdvancedFiltersChange={listing.setAdvancedFilters}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="mb-5 inline-flex min-h-[40px] items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            Clear Filters
          </button>
        )}

        <SectionErrorBoundary label="Events">
          {listing.paginatedEvents.length === 0 && debouncedQuery.trim() ? (
            <EmptySearchState
              query={debouncedQuery}
              onClear={() => {
                setLocalSearchInput("");
                listing.setSearchQuery("");
              }}
            />
          ) : (
            <EventCardSection
              isLoading={listing.isLoading}
              events={listing.paginatedEvents}
              viewMode={listing.viewMode}
              filterType={listing.filterType}
              onClearFilters={handleClearFilters}
              cacheInfo={listing.cacheInfo}
            />
          )}

          <PaginationControls
            currentPage={listing.currentPage}
            eventsPerPage={listing.eventsPerPage}
            totalEvents={listing.filteredEvents.length}
            totalPages={listing.totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={listing.setEventsPerPage}
          />
        </SectionErrorBoundary>
      </main>

      <EventCTA />
      <FeedbackButton />
    </div>
  );
};

export default EventsPage;
