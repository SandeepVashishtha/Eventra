import { useState, useEffect, useRef, useCallback } from "react";
import mockEvents from "./eventsMockData.json";
import EventHero from "./EventHero";
import EventCard from "./EventCard";
import { getEventStatus } from "../../utils/eventUtils";
import { Grid, List } from "lucide-react";
import { useLocation } from "react-router-dom";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import StyledDropdown from "../../components/StyledDropdown";
import { EventCardSkeleton } from "../../components/common/SkeletonLoaders";
import SearchEmptyState from "../../components/common/SearchEmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ActiveFilters from "./ActiveFilters";
import { getRouteSearchResults } from "../../utils/searchUtils";

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

// FIX: Extracted sort logic to a pure function — eliminates duplication
// between handleSortChange and the sort useEffect
const sortEvents = (events, sortType) => {
  const sorted = [...events];
  if (sortType === "Newest") {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortType === "Upcoming" || sortType === "upcoming") {
    sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  return sorted;
};

const renderCardSection = (
  isLoading,
  filteredEvents,
  viewMode,
  filterType,
  searchQuery,
  onClearSearch,
) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (filteredEvents.length === 0) {
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
      key={filterType + viewMode}
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`}
    >
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

const EventsPage = () => {
  useDocumentTitle("Eventra | Events");
  const location = useLocation();

  // FIX: Derive routeSearchQuery inline — no need to store in state and sync
  // via a separate useEffect, which caused an extra render on mount
  const routeSearchQuery =
    new URLSearchParams(location.search).get("search") || "";

  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState(routeSearchQuery);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const cardSectionRef = useRef();

  // Load events with simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(
        mockEvents.map((event) => ({
          ...event,
          status: getEventStatus(event),
        })),
      );
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Sync search query when URL param changes (e.g. navigating from navbar search)
  useEffect(() => {
    setSearchQuery(routeSearchQuery);
  }, [routeSearchQuery]);

  // FIX: Removed filterType from handleSearch — filtering is a separate concern.
  // Previously, filterType in deps caused handleSearch to recreate → the effect
  // below re-ran → double filtering on every filter button click.
  const handleSearch = useCallback(
    (query = "") => {
      setSearchQuery(query);

      let results = events;
      if (query.trim()) {
        results = getRouteSearchResults(events, query, EVENT_SEARCH_KEYS, {
          threshold: 0.35,
        });
      }
      return results;
    },
    [events],
  );

  // FIX: Single unified effect that handles search + filter + sort together.
  // Replaces the old handleSortChange function AND the separate sort useEffect
  // which were both modifying filteredEvents, causing double sorts.
  useEffect(() => {
    const searched = handleSearch(searchQuery);

    const filtered = searched.filter((event) => {
      return (
        filterType === "all" ||
        (filterType === "upcoming" && event.status === "upcoming") ||
        (filterType === "past" && event.status === "past") ||
        event.type === filterType
      );
    });

    setFilteredEvents(sortEvents(filtered, sortType));
  }, [handleSearch, searchQuery, filterType, sortType]);

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
    setSearchQuery("");
    setFilterType("all");
    setSortType("Newest");
  };

  const hasActiveFilters =
    filterType !== "all" || sortType !== "Newest" || searchQuery !== "";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 overflow-x-hidden">
      <EventHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredEvents={filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        <div className="mb-5 sm:mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
            {/* FIX: Removed unused `index` from map callback */}
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition ${
                  filterType === filter.key
                    ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                    : "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
                aria-pressed={filterType === filter.key}
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-48">
              <label htmlFor="sort-events" className="sr-only">
                Sort events
              </label>
              <StyledDropdown
                label=""
                value={sortType}
                onChange={setSortType}
                options={["Newest", "Upcoming"]}
                placeholder="Sort by Date"
              />
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  viewMode === "list"
                    ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <ActiveFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          sortType={sortType}
          setSortType={setSortType}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {renderCardSection(
          isLoading,
          filteredEvents,
          viewMode,
          filterType,
          searchQuery,
          clearSearchAndFilters,
        )}
      </div>

      <EventCTA />
      <FeedbackButton />
    </div>
  );
};

export default EventsPage;