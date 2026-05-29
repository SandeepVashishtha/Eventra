import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setSortType("Newest");
    listing.setViewMode("grid");
    listing.setAdvancedFilters({});
  }, [listing]);

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