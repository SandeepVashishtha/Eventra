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

const normalizeEvent = (event) => ({
  ...event,
  status: event.status || getEventStatus(event),
});

const eventMatchesSearch = (event, query) => {
  const safeQuery = query.trim().toLowerCase();

  if (!safeQuery) {
    return true;
  }

  const searchableText = [
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
    .toLowerCase();

  return searchableText.includes(safeQuery);
};

const useEventListing = () => {
  const fallbackEvents = useMemo(() => mockEvents.map(normalizeEvent), []);
  const [events, setEvents] = useState(fallbackEvents);
import useDebounce from "../../hooks/useDebounce";
import { getPriceStats, getDateRange } from "../../utils/advancedFilterUtils";
import { DEFAULT_EVENTS_PER_PAGE, clampPage } from "./eventPaginationUtils";

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
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);
  const [advancedFilters, setAdvancedFilters] = useState({});
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
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
      const responseData = response?.data;
      const apiEvents = Array.isArray(responseData?.content)
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

      setEvents(apiEvents.length > 0 ? apiEvents.map(normalizeEvent) : fallbackEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents(fallbackEvents);

      if (process.env.NODE_ENV !== "development") {
        setLoadError("Failed to load events. Please try again later.");
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
  }, [fallbackEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const priceStats = useMemo(() => getPriceStats(events), [events]);
  const dateRangeStats = useMemo(() => getDateRange(events), [events]);

  const filteredEvents = useMemo(() => {
    const searchedEvents = events.filter((event) =>
      eventMatchesSearch(event, searchQuery),
    );
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
      advancedFilters,
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
      setSafePage,
      sortType,
      totalPages,
      viewMode,
    ],
  );
  const setSafePage = useCallback((page) => {
    if (page < 1) {
      setCurrentPage(1);
      return;
    }
    if (page > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
      return;
    }
    setCurrentPage(page);
  }, [pagination.totalPages]);

  const filteredEvents = useMemo(() => events, [events]);
  const paginatedEvents = useMemo(() => events, [events]);

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
    totalPages: pagination.totalPages,
    totalElements: pagination.totalElements,
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
