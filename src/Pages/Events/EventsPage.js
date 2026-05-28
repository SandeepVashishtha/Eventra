import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import EventHero from "./EventHero";
import { useCallback, useRef } from "react";
import { useRef, useEffect, useState } from "react";
import { useSearchParams, useLocation  } from "react-router-dom";
import EventHero from "./EventHero";
import EventCard from "./EventCard";

import { Grid, List } from "lucide-react";

import { getEventStatus } from "../../utils/eventUtils";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import EventCardSection from "./EventCardSection";
import EventFiltersToolbar from "./EventFiltersToolbar";
import ActiveFilters from "./ActiveFilters";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { prepareSafeSearchQuery } from "../../utils/inputSanitization";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import SectionErrorBoundary from "../../components/common/SectionErrorBoundary";

const getRouteSearchQuery = (location) => {
  const rawSearchParam = new URLSearchParams(location.search).get("search") || "";

  try {
    return prepareSafeSearchQuery(decodeURIComponent(rawSearchParam));
  } catch {
    return "";
  }
};

const EventsPage = () => {
  useDocumentTitle("Eventra | Events");

  const location = useLocation(); // ✅ Now this works!
  const [searchParams, setSearchParams] = useSearchParams();
  const cardSectionRef = useRef(null);
  const listing = useEventListing();
  const routeSearchQuery = getRouteSearchQuery(location);

  const [localSearchInput, setLocalSearchInput] = useState(routeSearchQuery);


  const handlePageChange = useCallback((page) => {
    setSafePage(page);
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [setSafePage]);
  const cardSectionRef = useRef();

  // Local input value updates immediately on each keystroke so the input
  // feels responsive. The debounced value is passed to the listing hook so
  // the Fuse.js search pipeline only runs after the user pauses typing.
  const [localSearchInput, setLocalSearchInput] = useState(listing.searchQuery);
  const debouncedSearchQuery = useDebouncedValue(localSearchInput, 300);

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

  useEffect(() => {
    const safeQuery = prepareSafeSearchQuery(debouncedSearchQuery);
    listing.setSearchQuery(safeQuery);
  }, [debouncedSearchQuery, listing]);

  useEffect(() => {
    const params = {};

    if (listing.currentPage > 1) params.page = String(listing.currentPage);
    if (listing.eventsPerPage !== 6) params.perPage = String(listing.eventsPerPage);
    if (listing.searchQuery) params.search = listing.searchQuery;
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

  // Keep local state in sync when route search changes.
  useEffect(() => {
    const safeQuery = prepareSafeSearchQuery(routeSearchQuery);
    if (safeQuery !== listing.searchQuery) {
      setLocalSearchInput(safeQuery);
      listing.setSearchQuery(safeQuery);
    }
  }, [routeSearchQuery, listing.searchQuery, listing.setSearchQuery]);

  const handleSearch = useCallback((query = "") => {
    const safeQuery = prepareSafeSearchQuery(query);
    setLocalSearchInput(safeQuery);
    listing.setSearchQuery(safeQuery);
    return listing.filteredEvents;
  }, [listing]);

  // Scroll to card section after loading when a route search is active
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
  const clearSearchAndFilters = () => {
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setSortType("Newest");
    listing.setViewMode("grid");
    listing.setAdvancedFilters({});
  }, [listing]);
    setLocalSearchInput("");
  };

  const hasActiveFilters =
    listing.filterType !== "all" ||
    listing.sortType !== "Newest" ||
    listing.searchQuery !== "";

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
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
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
          setSearchQuery={setLocalSearchInput}
        <div className="mb-5 sm:mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => listing.setFilterType(filter.key)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition ${
                  listing.filterType === filter.key
                    ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                    : "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
                aria-pressed={listing.filterType === filter.key}
              >
                {filter.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearSearchAndFilters}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50 font-semibold"
               aria-label="button">
                Clear Filters
              </button>
            )}
          </div>

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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-48">
              <label htmlFor="sort-events" className="sr-only">
                Sort events
              </label>
              <StyledDropdown
                label=""
                value={listing.sortType}
                onChange={listing.setSortType}
                options={["Newest", "Upcoming", "Popular"]}
                placeholder="Sort by Date"
              />
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => listing.setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  listing.viewMode === "grid"
                    ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="Grid view"
                aria-pressed={listing.viewMode === "grid"}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => listing.setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  listing.viewMode === "list"
                    ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="List view"
                aria-pressed={listing.viewMode === "list"}
              >
                <List size={16} />
              </button>
            </div>
          </div>
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
          advancedFilters={listing.advancedFilters}
          onAdvancedFiltersChange={listing.setAdvancedFilters}
        />

        <SectionErrorBoundary label="Events">
          <EventCardSection
            isLoading={listing.isLoading}
            events={listing.paginatedEvents}
            viewMode={listing.viewMode}
            filterType={listing.filterType}
            onClearFilters={handleClearFilters}
          />

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