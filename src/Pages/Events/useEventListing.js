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
import { logger } from "../../utils/logger";

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
  const [categoryFilter, setCategoryFilter] = useState("all");
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
    } catch (error) {
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
    const query = debouncedSearchQuery.trim() ? debouncedSearchQuery.toLowerCase().trim() : "";
    const target = categoryFilter && categoryFilter !== "all" ? categoryFilter.toLowerCase() : null;

    // Single-pass filter: apply search, status, and category in one traversal,
    // then pass the result through advanced filters. Eliminates 3 intermediate arrays.
    const preFiltered = events.filter((event) => {
      // 1. Search Bar
      if (query) {
        const titleMatch = event.title?.toLowerCase().includes(query) ?? false;
        const descMatch = event.description?.toLowerCase().includes(query) ?? false;
        if (!titleMatch && !descMatch) return false;
      }
    // 1. Search (typo-tolerant fuzzy search with ranking from PR #5461)
    let filtered = debouncedSearchQuery.trim()
      ? getRouteSearchResults(
          events,
          debouncedSearchQuery,
          [
            { name: "title", weight: 0.8 },
            { name: "category", weight: 0.5 },
            { name: "tags", weight: 0.4 },
            { name: "location.name", weight: 0.3 },
            { name: "location.city", weight: 0.3 },
            { name: "description", weight: 0.1 },
          ]
        )
      : [...events];

      // 2. Status Timing Filter
      const status = getEventStatus(event);
      if (filterType === "live" && status !== "live") return false;
      if (filterType === "upcoming" && status !== "upcoming") return false;
      if (filterType === "past" && status !== "past" && status !== "ended") return false;

      // 3. Category Filter
      if (target) {
        const cat = event.category?.toLowerCase() || "";
        const type = event.type?.toLowerCase() || "";

        if (target === "hackathon" || target === "hackathons") {
          if (type !== "hackathon" && !cat.includes("hackathon")) return false;
        } else if (target === "tech talks" || target === "tech-talks" || target === "conference") {
          const isMatch = type === "conference" || type === "summit" ||
            cat.includes("tech") || cat.includes("conference") || cat.includes("summit");
          if (!isMatch) return false;
        } else if (target === "cultural" || target === "networking" || target === "cultural & networking") {
          const isMatch = cat.includes("networking") || cat.includes("cultural") || cat.includes("community");
          if (!isMatch) return false;
        } else {
          const normalizedTarget = target.replace(/[^a-z0-9]+/g, "");
          const normalizedCat = cat.replace(/[^a-z0-9]+/g, "");
          const normalizedType = type.replace(/[^a-z0-9]+/g, "");
          const isMatch = normalizedCat.includes(normalizedTarget) ||
            normalizedType.includes(normalizedTarget) ||
            normalizedTarget.includes(normalizedCat) ||
            normalizedTarget.includes(normalizedType);
          if (!isMatch) return false;
        }
      }

      return true;
    });

    // 4. Advanced Filters fallback
    return applyAdvancedFilters(preFiltered, advancedFilters);
  }, [events, filterType, categoryFilter, debouncedSearchQuery, advancedFilters]);

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
    categoryFilter,
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
    setCategoryFilter,
    setSafePage,
    setSearchQuery,
    setSortType,
    setViewMode,
    setAdvancedFilters,
    setIsAdvancedFiltersOpen,
  };
};

export default useEventListing;
