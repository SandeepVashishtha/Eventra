import { useEffect, useMemo, useState } from "react";
import mockEvents from "./eventsMockData.json";
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
    }
  );
};

const useEventListing = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);

  useEffect(() => {
  const timer = setTimeout(() => {

    const normalizedEvents = mockEvents.map((event) => ({
      ...event,
      status: getEventStatus(event),
    }));

    setEvents(normalizedEvents);

    setIsLoading(false);

  }, 800);

  return () => clearTimeout(timer);
}, []);

  const filteredEvents = useMemo(() => {
    const searchResults = getSearchResults(events, searchQuery);
    const filtered = filterEventsByType(searchResults, filterType);
    return sortEventsByDate(filtered, sortType);
  }, [events, filterType, searchQuery, sortType]);

  const totalPages = getTotalPages(filteredEvents.length, eventsPerPage);

  const paginatedEvents = useMemo(
    () => getPaginatedEvents(filteredEvents, currentPage, eventsPerPage),
    [currentPage, eventsPerPage, filteredEvents],
  );

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
    filteredEvents,
    filterType,
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