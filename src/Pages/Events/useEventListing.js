import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStableFilters } from "../../hooks/useStableFilters";
import mockEvents from "./eventsMockData.json";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getEventStatus } from "../../utils/eventUtils";
import { applyAdvancedFilters, getDateRange, getPriceStats } from "../../utils/advancedFilterUtils";
import {
  DEFAULT_EVENTS_PER_PAGE,
  clampPage,
  filterEventsByType,
  getPaginatedEvents,
  getTotalPages,
  sortEventsByDate,
} from "./eventPaginationUtils.mjs";
import {
  getCacheAgeLabel,
  getCachedEvents,
  saveCachedEventDetail,
  saveCachedEvents,
} from "../../utils/offlineEventCache";

const normalizeEvent = (event) => ({
  ...event,
  status: event.status || getEventStatus(event),
});

const eventMatchesSearch = (event, query) => {
  const safeQuery = query.trim().toLowerCase();

  if (!safeQuery) {
    return true;
  }

  return [
    event.title,
    event.description,
    event.category,
    event.type,
    event.location,
    event.date,
    ...(event.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(safeQuery);
};

const useEventListing = () => {
  const fallbackEvents = useMemo(() => mockEvents.map(normalizeEvent), []);
  const [events, setEvents] = useState(fallbackEvents);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cacheInfo, setCacheInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);
  // useStableFilters wraps useState with deep-equality comparison so setting
  // filters to a semantically identical object does not trigger recomputation
  // of the filteredEvents memo (and everything downstream of it).
  const [advancedFilters, setAdvancedFilters] = useStableFilters({});
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const isInitialMount = useRef(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
      const responseData = response?.data;
      const apiEvents = Array.isArray(responseData?.content)
        ? responseData.content
        : Array.isArray(responseData)
          ? responseData
          : [];

      const nextEvents = (apiEvents.length > 0 ? apiEvents : fallbackEvents).map(normalizeEvent);
      setEvents(nextEvents);
      setCacheInfo(null);
      saveCachedEvents(nextEvents);
      nextEvents.forEach(saveCachedEventDetail);
    } catch (error) {
      const cached = getCachedEvents();
      if (cached?.events?.length) {
        setEvents(cached.events.map(normalizeEvent));
        setCacheInfo({
          cachedAt: cached.cachedAt,
          label: getCacheAgeLabel(cached.cachedAt),
        });
        setLoadError(`You're offline. Showing ${getCacheAgeLabel(cached.cachedAt)} event data.`);
      } else {
        setEvents(fallbackEvents);
        setCacheInfo({
          cachedAt: null,
          label: "bundled fallback",
        });
        setLoadError("You're offline. Showing bundled event data until the network returns.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fallbackEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const priceStats = useMemo(() => getPriceStats(events), [events]);
  const dateRangeStats = useMemo(() => getDateRange(events), [events]);

  const filteredEvents = useMemo(() => {
    const searchedEvents = events.filter((event) => eventMatchesSearch(event, searchQuery));
    const typedEvents = filterEventsByType(searchedEvents, filterType);
    const advancedFilteredEvents = applyAdvancedFilters(typedEvents, advancedFilters);

    return sortEventsByDate(advancedFilteredEvents, sortType);
  }, [advancedFilters, events, filterType, searchQuery, sortType]);

  const totalPages = useMemo(
    () => getTotalPages(filteredEvents.length, eventsPerPage),
    [eventsPerPage, filteredEvents.length],
  );

  const paginatedEvents = useMemo(
    () => getPaginatedEvents(filteredEvents, currentPage, eventsPerPage),
    [currentPage, eventsPerPage, filteredEvents],
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setCurrentPage(1);
  }, [advancedFilters, eventsPerPage, filterType, searchQuery, sortType]);

  useEffect(() => {
    setCurrentPage((page) => clampPage(page, totalPages));
  }, [totalPages]);

  const setSafePage = useCallback(
    (page) => {
      setCurrentPage(clampPage(Number(page) || 1, totalPages));
    },
    [totalPages],
  );

  return useMemo(
    () => ({
      advancedFilters,
      cacheInfo,
      currentPage,
      dateRangeStats,
      eventsPerPage,
      fetchEvents,
      filteredEvents,
      filterType,
      isAdvancedFiltersOpen,
      isLoading,
      loadError,
      paginatedEvents,
      priceStats,
      searchQuery,
      sortType,
      totalElements: filteredEvents.length,
      totalPages,
      viewMode,
      setAdvancedFilters,
      setEventsPerPage,
      setFilterType,
      setIsAdvancedFiltersOpen,
      setSafePage,
      setSearchQuery,
      setSortType,
      setViewMode,
    }),
    [
      advancedFilters,
      cacheInfo,
      currentPage,
      dateRangeStats,
      eventsPerPage,
      fetchEvents,
      filteredEvents,
      filterType,
      isAdvancedFiltersOpen,
      isLoading,
      loadError,
      paginatedEvents,
      priceStats,
      searchQuery,
      setAdvancedFilters,
      setSafePage,
      sortType,
      totalPages,
      viewMode,
    ],
  );
};

export default useEventListing;
