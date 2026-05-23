import { useCallback, useEffect, useMemo, useState } from "react";
import mockEvents from "./eventsMockData.json";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getRouteSearchResults } from "../../utils/searchUtils";
import { getEventStatus } from "../../utils/eventUtils";
import {
  DEFAULT_EVENTS_PER_PAGE,
  clampPage,
  filterEventsByType,
  getPaginatedEvents,
  getTotalPages,
  sortEventsByDate,
} from "./eventPaginationUtils";

const EVENT_SEARCH_KEYS = [
  "title",
  "description",
  "location",
  "tags",
  "type",
  "date",
  "status",
];

const normalizeEvents = (events) =>
  events.map((event) => ({
    ...event,
    status: getEventStatus(event),
  }));

const getSearchResults = (events, searchQuery) => {
  if (!searchQuery.trim()) {
    return events;
  }

  return getRouteSearchResults(events, searchQuery, EVENT_SEARCH_KEYS, {
    threshold: 0.35,
  });
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

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.ALL);
      const apiEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(normalizeEvents(apiEvents));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        setEvents(normalizeEvents(mockEvents));
        setLoadError("");
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
    return sortEventsByDate(filtered, sortType);
  }, [events, filterType, searchQuery, sortType]);

  const totalPages = getTotalPages(filteredEvents.length, eventsPerPage);
  const paginatedEvents = useMemo(() => {
    return getPaginatedEvents(filteredEvents, currentPage, eventsPerPage);
  }, [currentPage, eventsPerPage, filteredEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [eventsPerPage, filterType, searchQuery, sortType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const setSafePage = (page) => {
    setCurrentPage(clampPage(page, totalPages));
  };

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
    setEventsPerPage,
    setFilterType,
    setSafePage,
    setSearchQuery,
    setSortType,
    setViewMode,
  };
};

export default useEventListing;
