import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mockEvents from "./eventsMockData.json";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getEventStatus } from "../../utils/eventUtils";
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
