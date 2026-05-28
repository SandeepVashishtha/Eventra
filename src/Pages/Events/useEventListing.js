import { useCallback, useEffect, useMemo, useState } from "react";
import mockEvents from "./eventsMockData.json";
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
  const normalizedMockEvents = useMemo(
    () =>
      mockEvents.map((event) => ({
        ...event,
        status: getEventStatus(event),
      })),
    [],
  );
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);
  const [advancedFilters, setAdvancedFilters] = useState(getDefaultFilters());
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (!isMounted) return;
      setEvents(normalizedMockEvents);
      setIsLoading(false);
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [normalizedMockEvents]);

  const filteredEvents = useMemo(() => {
    const searchResults = getSearchResults(events, searchQuery);
    const filtered = filterEventsByType(searchResults, filterType);
    const advancedFiltered = applyAdvancedFilters(filtered, advancedFilters);
    return sortEventsByDate(advancedFiltered, sortType);
  }, [events, filterType, searchQuery, sortType, advancedFilters]);

  const totalPages = useMemo(
    () => getTotalPages(filteredEvents.length, eventsPerPage),
    [eventsPerPage, filteredEvents.length],
  );
  const paginatedEvents = useMemo(() => {
    return getPaginatedEvents(filteredEvents, currentPage, eventsPerPage);
  }, [currentPage, eventsPerPage, filteredEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [eventsPerPage, filterType, searchQuery, sortType, advancedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const setSafePage = useCallback((page) => {
    setCurrentPage(clampPage(page, totalPages));
  }, [totalPages]);

  // Get price and date statistics from all events
  const priceStats = useMemo(() => getPriceStats(events), [events]);
  const dateRangeStats = useMemo(() => getDateRange(events), [events]);

  return useMemo(
    () => ({
      currentPage,
      eventsPerPage,
      filteredEvents,
      filterType,
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
    }),
    [
      advancedFilters,
      currentPage,
      dateRangeStats,
      eventsPerPage,
      filteredEvents,
      filterType,
      isAdvancedFiltersOpen,
      isLoading,
      paginatedEvents,
      priceStats,
      searchQuery,
      setSafePage,
      sortType,
      totalPages,
      viewMode,
    ],
  );
};

export default useEventListing;
