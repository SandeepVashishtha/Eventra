import { useCallback, useEffect, useMemo, useState } from "react";
import mockEvents from "./eventsMockData.json";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getRouteSearchResults } from "../../utils/searchUtils";
import { getEventStatus } from "../../utils/eventUtils";
import {
  applyAdvancedFilters,
  getDefaultFilters,
  getPriceStats,
  getDateRange,
} from "../../utils/advancedFilterUtils";
import {
  DEFAULT_EVENTS_PER_PAGE,
  clampPage,
  filterEventsByType,
  getPaginatedEvents,
  getTotalPages,
  sortEventsByDate,
} from "./eventPaginationUtils";

const getSearchResults = (events, searchQuery) => {
  if (!searchQuery.trim()) return events;
  return getRouteSearchResults(
    events,
    searchQuery,
    ["title", "description", "location", "tags", "type", "date", "status"],
    { threshold: 0.35 },
  );
};

/**
 * Normalizes a raw event object by computing its derived status field.
 * Keeps the original status if already present and valid.
 *
 * @param {object} event
 * @returns {object}
 */
const normalizeEvent = (event) => ({
  ...event,
  status: event.status || getEventStatus(event),
});

const useEventListing = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);
  const [advancedFilters, setAdvancedFilters] = useState(getDefaultFilters());
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  /**
   * Fetches events from the backend API.
   * In development, falls back to mock data when the API is unreachable.
   * This is the single source of truth for the events state — there is no
   * concurrent mock-data timer that could race with the API response.
   */
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.ALL);
      const apiEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(apiEvents.map(normalizeEvent));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // Development fallback: use mock data when the API is not running locally.
        // This path never executes in production — the else branch runs there.
        setEvents(mockEvents.map(normalizeEvent));
      } else {
        setEvents([]);
        setLoadError(error?.message || "Failed to load events. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /**
   * filteredEvents — all events after search, type filter, advanced filters,
   * and sort are applied. This is the full filtered set; it drives the total
   * page count and is sliced by paginatedEvents below.
   *
   * Every dependency that affects the output is listed so the memo is never
   * stale: events, filterType, searchQuery, sortType, advancedFilters.
   */
  const filteredEvents = useMemo(() => {
    const searchResults = getSearchResults(events, searchQuery);
    const filtered = filterEventsByType(searchResults, filterType);
    const advancedFiltered = applyAdvancedFilters(filtered, advancedFilters);
    return sortEventsByDate(advancedFiltered, sortType);
  }, [events, filterType, searchQuery, sortType, advancedFilters]);

  const totalPages = getTotalPages(filteredEvents.length, eventsPerPage);

  /**
   * paginatedEvents — the slice of filteredEvents for the current page.
   * This is what the event grid renders. It is kept separate from
   * filteredEvents so consumer components can access both the current page
   * and the total count (filteredEvents.length) independently.
   */
  const paginatedEvents = useMemo(
    () => getPaginatedEvents(filteredEvents, currentPage, eventsPerPage),
    [currentPage, eventsPerPage, filteredEvents],
  );

  // Reset to page 1 whenever any filter or sort criterion changes so the user
  // never sees an empty page caused by stale pagination.
  useEffect(() => {
    setCurrentPage(1);
  }, [eventsPerPage, filterType, searchQuery, sortType, advancedFilters]);

  // Clamp currentPage when the total page count shrinks (e.g. after applying
  // a filter that produces fewer results than the current page can show).
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const setSafePage = (page) => {
    setCurrentPage(clampPage(page, totalPages));
  };

  const priceStats = useMemo(() => getPriceStats(events), [events]);
  const dateRangeStats = useMemo(() => getDateRange(events), [events]);

  return {
    currentPage,
    eventsPerPage,
    fetchEvents,
    filteredEvents,
    filterType,
    loadError,
    isLoading,
    paginatedEvents,
    searchQuery,
    sortType,
    totalPages,
    viewMode,
    advancedFilters,
    isAdvancedFiltersOpen,
    priceStats,
    dateRangeStats,
    setEventsPerPage,
    setFilterType,
    setSafePage,
    setSearchQuery,
    setSortType,
    setViewMode,
    setAdvancedFilters,
    setIsAdvancedFiltersOpen,
  };
};

export default useEventListing;
