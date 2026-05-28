import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EventHero from "./EventHero";
import EventCTA from "./EventCTA";
import EventCardSection from "./EventCardSection";
import EventFiltersToolbar from "./EventFiltersToolbar";
import ActiveFilters from "./ActiveFilters";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
import { darkTheme } from "../../components/styles/theme";
import BackToTopButton from "../../components/common/BackToTopButton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const EventsPage = () => {
  const cardSectionRef = useRef();
  const listing = useEventListing();
  const [searchParams, setSearchParams] = useSearchParams();

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

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const perPage = parseInt(searchParams.get("perPage")) || 6;
    const search = searchParams.get("search") || "";
   const filter = searchParams.get("filter") || "all";
const sort = searchParams.get("sort") || "latest";
const view = searchParams.get("view") || "grid";
    listing.setSafePage(page);
    listing.setEventsPerPage(perPage);
    listing.setSearchQuery(search);
    listing.setFilterType(filter);
    listing.setSortType(sort);
listing.setViewMode(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = {};
    if (listing.currentPage > 1) params.page = listing.currentPage;
    if (listing.eventsPerPage !== 6) params.perPage = listing.eventsPerPage;
    if (listing.searchQuery) params.search = listing.searchQuery;
    if (listing.filterType !== "all") params.filter = listing.filterType;
    if (listing.sortType !== "latest") params.sort = listing.sortType;
if (listing.viewMode !== "grid") params.view = listing.viewMode;
    setSearchParams(params, { replace: true });
  }, [ listing.currentPage,
  listing.eventsPerPage,
  listing.searchQuery,
  listing.filterType,
  listing.sortType,
  listing.viewMode,
  setSearchParams]);

  const handleSearch = (query = "") => {
    setLocalSearchInput(query);
  };

  const handlePageChange = (page) => {
    listing.setSafePage(page);
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setLocalSearchInput("");
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setSortType("Newest");
    listing.setViewMode("grid");
    listing.setAdvancedFilters({});
  };

  return (
    <div
      className={`
        ${darkTheme.section}
        flex flex-col
        min-h-screen
        overflow-x-hidden
      `}
    >
      <EventHero
        searchQuery={localSearchInput}
        setSearchQuery={setLocalSearchInput}
        filteredEvents={listing.filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full"
      >
        {/* Advanced Filters and Toolbar */}
        {listing.loadError && !listing.isLoading ? (
          <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-red-100 dark:border-red-900/40 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Failed to load events
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {listing.loadError}
            </p>
            <button
              type="button"
              onClick={listing.fetchEvents}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : null}
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

        {/* Active Filters Display */}
        <ActiveFilters
          searchQuery={localSearchInput}
          setSearchQuery={(val) => { setLocalSearchInput(val); listing.setSearchQuery(val); }}
          filterType={listing.filterType}
          setFilterType={listing.setFilterType}
          sortType={listing.sortType}
          setSortType={listing.setSortType}
          viewMode={listing.viewMode}
          setViewMode={listing.setViewMode}
          advancedFilters={listing.advancedFilters}
          onAdvancedFiltersChange={listing.setAdvancedFilters}
        />

        {/* Events Display */}
        <EventCardSection
          isLoading={listing.isLoading}
          events={listing.paginatedEvents}
          viewMode={listing.viewMode}
          filterType={listing.filterType}
          onClearFilters={handleClearFilters}
        />
        {!listing.isLoading && !listing.loadError && (
          <PaginationControls
            currentPage={listing.currentPage}
            eventsPerPage={listing.eventsPerPage}
            totalEvents={listing.filteredEvents.length}
            totalPages={listing.totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={listing.setEventsPerPage}
          />
        )}
      </div>

      <EventCTA />
      <BackToTopButton />
    </div>
  );
};

export default EventsPage;
