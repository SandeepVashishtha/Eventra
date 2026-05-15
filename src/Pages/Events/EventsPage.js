import { useState, useEffect, useMemo, useRef } from "react";
import mockEvents from "./eventsMockData.json";
import EventHero from "./EventHero";
import EventCard from "./EventCard";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import FeedbackButton from "../../components/FeedbackButton";
import EventCTA from "./EventCTA";
import Fuse from "fuse.js";
import StyledDropdown from "../../components/StyledDropdown";
import { EventCardSkeleton } from "../../components/common/SkeletonLoaders";
import {
  DEFAULT_EVENTS_PER_PAGE,
  EVENTS_PER_PAGE_OPTIONS,
  clampPage,
  filterEventsByType,
  getPaginatedEvents,
  getTotalPages,
  getVisiblePaginationPages,
  sortEventsByDate,
} from "./eventPaginationUtils";

const renderCardSection = (isLoading, eventsToShow, viewMode, filterType) => {
  if (isLoading) {
    return (
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (eventsToShow.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          No events found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div
      key={filterType + viewMode}
      className={`grid gap-8 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-3"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`}
    >
      {eventsToShow.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

const PaginationControls = ({
  currentPage,
  eventsPerPage,
  totalEvents,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalEvents === 0) {
    return null;
  }

  const startEvent = (currentPage - 1) * eventsPerPage + 1;
  const endEvent = Math.min(currentPage * eventsPerPage, totalEvents);
  const { firstVisiblePage, lastVisiblePage, pages: visiblePages } =
    getVisiblePaginationPages(currentPage, totalPages);

  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startEvent}-{endEvent} of {totalEvents} events
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label
          htmlFor="events-per-page"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          Per page
          <select
            id="events-per-page"
            value={eventsPerPage}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {EVENTS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex items-center gap-2" aria-label="Event pagination">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {firstVisiblePage > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="h-10 min-w-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                1
              </button>
              {firstVisiblePage > 2 && (
                <span className="px-1 text-sm text-gray-500 dark:text-gray-400">
                  ...
                </span>
              )}
            </>
          )}

          {visiblePages.map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-10 min-w-10 rounded-lg px-3 text-sm font-medium transition ${
                page === currentPage
                  ? "bg-black text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}

          {lastVisiblePage < totalPages && (
            <>
              {lastVisiblePage < totalPages - 1 && (
                <span className="px-1 text-sm text-gray-500 dark:text-gray-400">
                  ...
                </span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="h-10 min-w-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);
  const cardSectionRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    const fuse = new Fuse(events, {
      keys: ["title", "description", "location", "tags", "type"],
      threshold: 0.35,
    });

    const searchResults = searchQuery.trim()
      ? fuse.search(searchQuery).map((res) => res.item)
      : events;

    return sortEventsByDate(filterEventsByType(searchResults, filterType), sortType);
  }, [events, filterType, searchQuery, sortType]);

  const totalPages = getTotalPages(filteredEvents.length, eventsPerPage);
  const paginatedEvents = useMemo(() => {
    return getPaginatedEvents(filteredEvents, currentPage, eventsPerPage);
  }, [currentPage, eventsPerPage, filteredEvents]);

  const handleSearch = (query = "") => {
    setSearchQuery(query);
  };

  const handleSortChange = (type) => {
    setSortType(type);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [eventsPerPage, filterType, searchQuery, sortType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    const nextPage = clampPage(page, totalPages);
    setCurrentPage(nextPage);
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <EventHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredEvents={filteredEvents}
        handleSearch={handleSearch}
        scrollToCard={scrollToCard}
      />

      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        <div
          className="mb-8 sm:mb-10 flex flex-col gap-4"
        >
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
            {[
              { key: "all", label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
              { key: "conference", label: "Conferences" },
              { key: "workshop", label: "Workshops" },
            ].map((filter, index) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition ${
                  filterType === filter.key
                    ? "bg-black text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700"
                }`}
                aria-pressed={filterType === filter.key}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <label htmlFor="sort-events" className="sr-only">
                Sort events
              </label>
              <StyledDropdown
                label=""
                value={sortType === "" ? "" : sortType}
                onChange={handleSortChange}
                options={["Newest", "Upcoming"]}
                placeholder="Sort by Date"
              />
            </div>

            <div
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm"
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-black text-white shadow-md"
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
                    ? "bg-black text-white shadow-md"
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

        {renderCardSection(isLoading, paginatedEvents, viewMode, filterType)}

        {!isLoading && (
          <PaginationControls
            currentPage={currentPage}
            eventsPerPage={eventsPerPage}
            totalEvents={filteredEvents.length}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={setEventsPerPage}
          />
        )}
      </div>

      <EventCTA />

      <FeedbackButton />
    </div>
  );
};

export default EventsPage;
