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

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalizedEvents = mockEvents.map((event) => ({
        ...event,
        status: getEventStatus(event),
      }));

      setEvents(normalizedEvents);

      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
      const apiEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(apiEvents.map((event) => ({ ...event, status: getEventStatus(event) })));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        setEvents(mockEvents.map((event) => ({ ...event, status: getEventStatus(event) })));
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
