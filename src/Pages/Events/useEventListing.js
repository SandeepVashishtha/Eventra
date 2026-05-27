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
  if (!searchQuery.trim()) {
    return events;
  }

  return getRouteSearchResults(
    events,
    searchQuery,
    ["title", "description", "location", "tags", "type", "date", "status"],
    {
      threshold: 0.35,
    },
  );
};

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

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
      const apiEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(apiEvents.map((event) => ({ ...event, status: getEventStatus(event) })));
    } catch (error) {
      // SECURITY/RACE CONDITION FIX: Only use mock data as fallback in dev mode,
      // never overwrite real API data with mock data in production.
      // Mock data is a development-only fallback, not a concurrent operation.
      if (process.env.NODE_ENV === "development") {
        const normalizedMockEvents = mockEvents.map((event) => ({
          ...event,
          status: getEventStatus(event),
        }));
        setEvents(normalizedMockEvents);
      } else {
        setEvents([]);
        setLoadError(error?.message || "Failed to load events. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // RACE CONDITION FIX: Call fetchEvents immediately on mount, without scheduling
  // mock data concurrently. This prevents race conditions where mock data could
  // overwrite real API responses based on timing.
  //
  // Previous implementation:
  // - useEffect 1: Scheduled mock data to load after 800ms
  // - useEffect 2: Called fetchEvents() for API request
  // - Result: If API took >800ms, mock data would overwrite real results
  //
  // New implementation:
  // - Single fetchEvents() call that uses mock data only as a failure fallback
  // - No concurrent timers that could race with network requests
  // - Mock data is development-only fallback logic, not a production path
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    const searchResults = getSearchResults(events, searchQuery);
    const filtered = filterEventsByType(searchResults, filterType);
    const advancedFiltered = applyAdvancedFilters(filtered, advancedFilters);
    return sortEventsByDate(advancedFiltered, sortType);
  }, [events, filterType, searchQuery, sortType, advancedFilters]);

  const totalPages = getTotalPages(filteredEvents.length, eventsPerPage);

  const paginatedEvents = useMemo(
    () => getPaginatedEvents(filteredEvents, currentPage, eventsPerPage),
    [currentPage, eventsPerPage, filteredEvents],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [eventsPerPage, filterType, searchQuery, sortType, advancedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const setSafePage = (page) => {
    setCurrentPage(clampPage(page, totalPages));
  };

  // Get price and date statistics from all events
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

  const filteredEvents = useMemo(() => {
    const searchResults = getSearchResults(events, searchQuery);
    const filtered = filterEventsByType(searchResults, filterType);
    const advancedFiltered = applyAdvancedFilters(filtered, advancedFilters);
    return sortEventsByDate(advancedFiltered, sortType);
  }, [events, filterType, searchQuery, sortType, advancedFilters]);

  const totalPages = getTotalPages(filteredEvents.length, eventsPerPage);

  const paginatedEvents = useMemo(
    () => getPaginatedEvents(filteredEvents, currentPage, eventsPerPage),
    [currentPage, eventsPerPage, filteredEvents],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [eventsPerPage, filterType, searchQuery, sortType, advancedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const setSafePage = (page) => {
    setCurrentPage(clampPage(page, totalPages));
  };

  // Get price and date statistics from all events
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
