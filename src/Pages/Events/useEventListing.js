import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mockEvents from "./eventsMockData.json";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getEventStatus } from "../../utils/eventUtils";
import useDebounce from "../../hooks/useDebounce";
import { useStableFilters } from "../../hooks/useStableFilters";
import {
  applyAdvancedFilters,
  getDateRange,
  // getDefaultFilters,
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);

  const [advancedFilters, setAdvancedFiltersState] = useStableFilters({});

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
  });

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const isInitialMount = useRef(true);
  const latestRequestRef = useRef(0);

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

    if (advancedFilters?.skillLevels?.length) {
      advancedFilters.skillLevels.forEach((level) => {
        params.append("skillLevel", level.toLowerCase());
      });
    }

    if (advancedFilters?.tags?.length) {
      advancedFilters.tags.forEach((tag) => {
        params.append("tag", tag);
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
    const requestId = ++latestRequestRef.current;
    setIsLoading(true);
    setLoadError("");

    try {
      const query = buildQueryParams();

      const response = await apiUtils.get(
        `${API_ENDPOINTS.EVENTS.LIST}?${query}`,
      );

      // Discard stale responses from earlier requests
      if (requestId !== latestRequestRef.current) return;

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
  }, [setAdvancedFiltersState, normalizeAdvancedFilters]);

  const priceStats = useMemo(() => getPriceStats(events), [events]);
  const dateRangeStats = useMemo(() => getDateRange(events), [events]);

  const filteredEvents = useMemo(() => {
    // 1. Fuzzy search first (or all events if no query)
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

    // 2. Status timing filter
    filtered = filtered.filter((event) => {
      const status = getEventStatus(event);
      if (filterType === "live" && status !== "live") return false;
      if (filterType === "upcoming" && status !== "upcoming") return false;
      if (filterType === "past" && status !== "past" && status !== "ended") return false;
      return true;
    });

    // 3. Category filter
    const target = categoryFilter && categoryFilter !== "all"
      ? categoryFilter.toLowerCase()
      : null;

    if (target) {
      filtered = filtered.filter((event) => {
        const cat = event.category?.toLowerCase() || "";
        const type = event.type?.toLowerCase() || "";

        if (target === "hackathon" || target === "hackathons") {
          return type === "hackathon" || cat.includes("hackathon");
        } else if (["tech talks", "tech-talks", "conference"].includes(target)) {
          return (
            type === "conference" || type === "summit" ||
            cat.includes("tech") || cat.includes("conference") || cat.includes("summit")
          );
        } else if (["cultural", "networking", "cultural & networking"].includes(target)) {
          return cat.includes("networking") || cat.includes("cultural") || cat.includes("community");
        } else {
          const norm = (s) => s.replace(/[^a-z0-9]+/g, "");
          const nTarget = norm(target), nCat = norm(cat), nType = norm(type);
          return (
            nCat.includes(nTarget) || nType.includes(nTarget) ||
            nTarget.includes(nCat) || nTarget.includes(nType)
          );
        }
      });
    }

    // 4. Advanced filters
    return applyAdvancedFilters(filtered, advancedFilters);
  }, [events, filterType, categoryFilter, debouncedSearchQuery, advancedFilters]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (sortType === "Title A-Z") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortType === "Title Z-A") {
        return (b.title || "").localeCompare(a.title || "");
      }
      if (sortType === "Price Low to High") {
        const priceA = a.price === "Free" || !a.price ? 0 : parseFloat(a.price);
        const priceB = b.price === "Free" || !b.price ? 0 : parseFloat(b.price);
        return priceA - priceB;
      }
      if (sortType === "Price High to Low") {
        const priceA = a.price === "Free" || !a.price ? 0 : parseFloat(a.price);
        const priceB = b.price === "Free" || !b.price ? 0 : parseFloat(b.price);
        return priceB - priceA;
      }

      const dateA = new Date(a.date || a.startDate);
      const dateB = new Date(b.date || b.startDate);

      if (sortType === "Upcoming" || sortType === "Oldest") {
        return dateA - dateB;
      }
      // Default / Newest
      return dateB - dateA;
    });
  }, [filteredEvents, sortType]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    return sortedEvents.slice(startIndex, startIndex + eventsPerPage);
  }, [sortedEvents, currentPage, eventsPerPage]);

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
