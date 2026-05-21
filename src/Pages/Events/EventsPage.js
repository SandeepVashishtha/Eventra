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

const renderCardSection = (isLoading, filteredEvents, viewMode, filterType, searchQuery, onClearSearch) => {
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
      className={`grid gap-6 ${viewMode === "grid"
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
  useDocumentTitle("Eventra | Events")
  const location = useLocation();
  const routeSearchQuery = new URLSearchParams(location.search).get("search") || "";
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState(routeSearchQuery);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const cardSectionRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(mockEvents.map((event) => ({
        ...event,
        status: getEventStatus(event),
      })));
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSearchQuery(routeSearchQuery);
  }, [routeSearchQuery]);

  const handleSearch = useCallback((query = "") => {
    setSearchQuery(query);

    let results = events;
    if (query.trim()) {
      results = getRouteSearchResults(events, query, EVENT_SEARCH_KEYS, {
        threshold: 0.35,
      });
    }

    const final = results.filter((event) => {
      return (
        filterType === "all" ||
        (filterType === "upcoming" && event.status === "upcoming") ||
        (filterType === "past" && event.status === "past") ||
        event.type === filterType
      );
    });

    setFilteredEvents(final);
  }, [events, filterType]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  useEffect(() => {
    if (!isLoading && routeSearchQuery) {
      setTimeout(() => {
        cardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isLoading, routeSearchQuery]);

  const handleSortChange = (type) => {
    setSortType(type);
    let sorted = [...filteredEvents];
    if (type === "Newest") {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (type === "Upcoming" || type === "upcoming") {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    setFilteredEvents(sorted);
  };

  useEffect(() => {
    setFilteredEvents((currentEvents) => {
      const sorted = [...currentEvents];
      if (sortType === "Newest") {
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortType === "Upcoming" || sortType === "upcoming") {
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      return sorted;
    });
  }, [filterType, searchQuery, sortType]);

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearSearchAndFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setSortType("Newest");
    handleSearch("");
  };

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
        <div
          className="mb-5 sm:mb-6 flex flex-col gap-3"
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
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition ${filterType === filter.key
                    ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                    : "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                aria-pressed={filterType === filter.key}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            {/* Sort Dropdown */}
            <div className="w-full sm:w-48">
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
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${viewMode === "grid"
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
                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${viewMode === "list"
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

        {renderCardSection(
          isLoading,
          filteredEvents,
          viewMode,
          filterType,
          searchQuery,
          clearSearchAndFilters
        )}
      </div>

      <EventCTA />

      <FeedbackButton />
    </div>
  );
};

export default EventsPage;
