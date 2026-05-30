import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mockEvents from "./eventsMockData.json";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getEventStatus } from "../../utils/eventUtils";
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

  const [advancedFilters, setAdvancedFilters] = useState({
    category: "",
    status: "",
    location: "",
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

    if (advancedFilters?.location) {
      params.append("location", advancedFilters.location);
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

      const normalizedEvents = apiEvents.map(normalizeEvent);
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
        let filteredMock = mockEvents;
        
        // Apply search query
        if (debouncedSearchQuery.trim()) {
          const q = debouncedSearchQuery.trim().toLowerCase();
          filteredMock = filteredMock.filter(item => 
            (item.title || "").toLowerCase().includes(q) ||
            (item.location || "").toLowerCase().includes(q) ||
            (item.description || "").toLowerCase().includes(q)
          );
        }

        // Apply advanced category filter
        if (advancedFilters?.category) {
          const cat = advancedFilters.category.toLowerCase();
          filteredMock = filteredMock.filter(item => 
            (item.type || item.category || "").toLowerCase() === cat
          );
        }

        // Apply advanced location filter
        if (advancedFilters?.location) {
          const loc = advancedFilters.location.toLowerCase();
          filteredMock = filteredMock.filter(item => 
            (item.location || "").toLowerCase().includes(loc)
          );
        }

        // Apply status (filterType) filter (upcoming/past)
        const now = new Date();
        if (filterType === "upcoming") {
          filteredMock = filteredMock.filter(item => new Date(item.date) >= now);
        } else if (filterType === "past") {
          filteredMock = filteredMock.filter(item => new Date(item.date) < now);
        } else if (filterType && filterType !== "all") {
          filteredMock = filteredMock.filter(item => 
            (item.type || item.category || "").toLowerCase() === filterType.toLowerCase()
          );
        }

        const normalizedMockEvents = filteredMock.map(normalizeEvent);
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

  // fix: filter past events from Upcoming Events section (fixes #3343)
  // Previously this returned all events with no date filtering applied.
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.date || event.startDate);
      
      // Filter by status/time (upcoming/past) or type
      if (filterType === "upcoming") {
        if (eventDate < now) return false;
      } else if (filterType === "past") {
        if (eventDate >= now) return false;
      } else if (filterType && filterType !== "all") {
        const eventCategory = (event.type || event.category || "").toLowerCase();
        if (eventCategory !== filterType.toLowerCase()) return false;
      }

      // Filter by advanced category
      if (advancedFilters?.category) {
        const cat = advancedFilters.category.toLowerCase();
        const eventCategory = (event.type || event.category || "").toLowerCase();
        if (eventCategory !== cat) return false;
      }

      // Filter by advanced location
      if (advancedFilters?.location) {
        const loc = advancedFilters.location.toLowerCase();
        const eventLoc = (event.location || "").toLowerCase();
        if (!eventLoc.includes(loc)) return false;
      }

      return true;
    });
  }, [events, filterType, advancedFilters]);

  const paginatedEvents = useMemo(() => filteredEvents, [filteredEvents]);

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