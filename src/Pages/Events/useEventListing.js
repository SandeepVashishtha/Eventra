import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mockEvents from "./eventsMockData.json";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getEventStatus } from "../../utils/eventUtils";
import useDebounce from "../../hooks/useDebounce";
import {
  applyAdvancedFilters,
  getDateRange,
  getDefaultFilters,
  getPriceStats,
  normalizeAdvancedFilters,
} from "../../utils/advancedFilterUtils";
import { getRouteSearchResults } from "../../utils/searchUtils.mjs";

const DEFAULT_EVENTS_PER_PAGE = 12;

const SORT_MAPPING = {
  Newest: "date,desc",
  Upcoming: "date,asc",
  Oldest: "date,asc",
  "Title A-Z": "title,asc",
  "Title Z-A": "title,desc",
  "Price Low to High": "price,asc",
  "Price High to Low": "price,desc",
};

const normalizeEvent = (event) => ({
  ...event,
  status: event.status || getEventStatus(event),
});

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

  const [advancedFilters, setAdvancedFiltersState] = useState(getDefaultFilters);

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

    if (advancedFilters?.categories?.length) {
      advancedFilters.categories.forEach((category) => {
        params.append("category", category);
      });
    }

    if (advancedFilters?.statuses?.length) {
      advancedFilters.statuses.forEach((status) => {
        params.append("status", status.toUpperCase());
      });
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

      const normalizedEvents = apiEvents.map(normalizeEvent);
      setEvents(normalizedEvents);

      setPagination({
        totalPages: responseData.totalPages || 1,
        totalElements: responseData.totalElements || 0,
        first: responseData.first ?? true,
        last: responseData.last ?? true,
      });
    } catch {
      if (process.env.NODE_ENV === "development") {
        const normalizedMockEvents = mockEvents.map(normalizeEvent);
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

  const setAdvancedFilters = useCallback((filters) => {
    setAdvancedFiltersState(normalizeAdvancedFilters(filters));
  }, []);

  const priceStats = useMemo(() => getPriceStats(events), [events]);
  const dateRangeStats = useMemo(() => getDateRange(events), [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const searchedEvents = getRouteSearchResults(
      events,
      debouncedSearchQuery,
      [
        "title",
        "description",
        "location",
        "venue",
        "category",
        "type",
        "eventMode",
        "status",
        "date",
        "startDate",
      ],
      {
        threshold: 0.35,
        includeScore: true,
      },
    );

    const basicFiltered = searchedEvents.filter((event) => {
      // Filter by Type/Status
      const eventDate = new Date(event.date || event.startDate);
      if (filterType === "upcoming") {
        return eventDate >= now;
      }
      if (filterType === "past") {
        return eventDate < now;
      }
      if (filterType === "conference") {
        return event.type?.toLowerCase() === "conference" || event.category?.toLowerCase() === "conference";
      }
      if (filterType === "workshop") {
        return event.type?.toLowerCase() === "workshop" || event.category?.toLowerCase() === "workshop";
      }

      return true; // "all"
    });

    return applyAdvancedFilters(basicFiltered, advancedFilters);
  }, [events, filterType, debouncedSearchQuery, advancedFilters]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.date || a.startDate);
      const dateB = new Date(b.date || b.startDate);

      if (sortType === "Upcoming") {
        return dateA - dateB; // Earliest first
      }
      // Default: Newest (Latest first)
      return dateB - dateA;
    });
  }, [filteredEvents, sortType]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    return sortedEvents.slice(startIndex, startIndex + eventsPerPage);
  }, [sortedEvents, currentPage, eventsPerPage]);

  // Derive pagination totals based on the filtered dataset
  const totalElements = pagination.totalPages > 1 ? pagination.totalElements : sortedEvents.length;
  const totalPages = pagination.totalPages > 1 ? pagination.totalPages : Math.ceil(sortedEvents.length / eventsPerPage) || 1;

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
    totalElements,
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
