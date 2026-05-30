import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  saveAllCachedEventDetails,
  saveCachedEvents,
} from "../../utils/offlineEventCache";

const normalizeEvent = (event) => ({
  ...event,
  status: event.status || getEventStatus(event),
});

const FUSE_OPTIONS = {
  keys: ['title', 'description', 'location', 'category', 'type', 'tags'],
  threshold: 0.4,
  includeScore: true,
import useDebounce from "../../hooks/useDebounce";

const DEFAULT_EVENTS_PER_PAGE = 12;

const SORT_MAPPING = {
  Newest: "date,desc",
  Oldest: "date,asc",
  "Title A-Z": "title,asc",
  "Title Z-A": "title,desc",
  "Price Low to High": "price,asc",
  "Price High to Low": "price,desc",
};

const useEventListing = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);

  const [advancedFilters, setAdvancedFilters] = useState({
    category: "",
    status: "",
  });

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
  });

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const isInitialMount = useRef(true);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    params.append("page", currentPage - 1);
    params.append("size", eventsPerPage);

    if (debouncedSearchQuery.trim()) {
      params.append("search", debouncedSearchQuery.trim());
    }

    if (filterType && filterType !== "all") {
      params.append("status", filterType.toUpperCase());
    }

    if (advancedFilters?.category) {
      params.append("category", advancedFilters.category);
    }

    if (advancedFilters?.status) {
      params.append("status", advancedFilters.status.toUpperCase());
    }

    const sortValue = SORT_MAPPING[sortType];

    if (sortValue) {
      params.append("sort", sortValue);
    }

    return params.toString();
  }, [
    currentPage,
    eventsPerPage,
    debouncedSearchQuery,
    filterType,
    advancedFilters,
    sortType,
  ]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const query = buildQueryParams();

      const response = await apiUtils.get(
        `${API_ENDPOINTS.EVENTS.LIST}?${query}`,
      );

      const responseData = response?.data || {};

      const apiEvents = Array.isArray(responseData.content)
        ? responseData.content
        : Array.isArray(responseData)
          ? responseData
          : [];

      const nextEvents = (apiEvents.length > 0 ? apiEvents : fallbackEvents).map(normalizeEvent);
      setEvents(nextEvents);
      setCacheInfo(null);
      saveCachedEvents(nextEvents);
      // Batch-write all detail entries in a single read+write cycle.
      // Replaces nextEvents.forEach(saveCachedEventDetail) which triggered
      // N independent localStorage read+write pairs — O(n) synchronous
      // main-thread I/O that blocked the UI for each event in the list.
      saveAllCachedEventDetails(nextEvents);
        : [];

      const normalizedEvents = apiEvents.map((event) => ({
        ...event,
        status: event.status || getEventStatus(event),
      }));

      setEvents(normalizedEvents);

      setPagination({
        totalPages: responseData.totalPages || 1,
        totalElements: responseData.totalElements || 0,
        first: responseData.first ?? true,
        last: responseData.last ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch events:", error);

      if (process.env.NODE_ENV === "development") {
        const normalizedMockEvents = mockEvents.map((event) => ({
          ...event,
          status: getEventStatus(event),
        }));

        setEvents(normalizedMockEvents);

        setPagination({
          totalPages: 1,
          totalElements: normalizedMockEvents.length,
          first: true,
          last: true,
        });
      } else {
        setEvents([]);
        setPagination({
          totalPages: 1,
          totalElements: 0,
          first: true,
          last: true,
        });

        if (error?.response?.status === 403) {
  setLoadError(
    "Access to events is currently restricted. Please try again later.",
  );
} else {
  setLoadError(
    "Failed to load events. Please try again later.",
  );
}
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryParams]);

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

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchQuery, filterType, sortType, advancedFilters, eventsPerPage]);

  const setSafePage = (page) => {
    if (page < 1) {
      setCurrentPage(1);
      return;
    }

    if (page > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
      return;
    }

    setCurrentPage(page);
  };

  const filteredEvents = useMemo(() => events, [events]);

  const paginatedEvents = useMemo(() => events, [events]);

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
    totalPages: pagination.totalPages,
    totalElements: pagination.totalElements,
    viewMode,
    advancedFilters,
    isAdvancedFiltersOpen,
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
