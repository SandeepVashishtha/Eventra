import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import EventHero from "./EventHero";
import EventCard from "./EventCard";

import { useSearchParams } from "react-router-dom";
import {
  Grid,
  List,
  Loader2,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import StyledDropdown from "../../components/StyledDropdown";
import { EventCardSkeleton } from "../../components/common/SkeletonLoaders";
import SearchEmptyState from "../../components/common/SearchEmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ActiveFilters from "./ActiveFilters";
import PaginationControls from "./PaginationControls";
import useEventListing from "./useEventListing";
import { darkTheme } from "../../components/styles/theme";
import BackToTopButton from "../../components/common/BackToTopButton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { prepareSafeSearchQuery } from "../../utils/inputSanitization";
import { getRouteSearchResults } from "../../utils/searchUtils";
import SectionErrorBoundary from "../../components/common/SectionErrorBoundary";



const EVENT_SEARCH_KEYS = [
  "title",
  "description",
  "location",
  "tags",
  "type",
  "date",
  "status",
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "conference", label: "Conferences" },
  { key: "workshop", label: "Workshops" },
];

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

  const location = useLocation();
  const [searchParams] = useSearchParams();

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
    const safeQuery = prepareSafeSearchQuery(routeSearchQuery);
    if (safeQuery !== listing.searchQuery) {
      listing.setSearchQuery(safeQuery);
    }
  }, [routeSearchQuery, listing.searchQuery, listing.setSearchQuery]);

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

  const handleClearFilters = () => {
    setLocalSearchInput("");
  const clearSearchAndFilters = () => {
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setSortType("Newest");
  };

  const hasActiveFilters =
    listing.filterType !== "all" || listing.sortType !== "Newest" || listing.searchQuery !== "";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 overflow-x-hidden">
      <EventHero
        searchQuery={localSearchInput}
        setSearchQuery={setLocalSearchInput}
        filteredEvents={listing.filteredEvents}
        handleSearch={(query) => {
          // SECURITY: Sanitize search query from user input before use
          const safeQuery = prepareSafeSearchQuery(query);
          listing.setSearchQuery(safeQuery);
          return listing.filteredEvents;
        }}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
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
              >
                Clear Filters
              </button>
            )}
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
          setSearchQuery={(val) => { setLocalSearchInput(val); listing.setSearchQuery(val); }}
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
