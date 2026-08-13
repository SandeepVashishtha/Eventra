import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_ENDPOINTS, apiUtils } from "config/api";
import { getApiErrorStatus } from "config/api/errors.js";
import { normalizeEvent } from "utils/eventUtils";
import { getEventStatus } from "utils/eventUtils";
import useDebounce from "hooks/useDebounce";
import { useStableFilters } from "hooks/useStableFilters";
import useRecommendations from "hooks/useRecommendations";
import {
  applyAdvancedFilters,
  getDateRange,
  // getDefaultFilters,
  getPriceStats,
  normalizeAdvancedFilters,
} from "utils/advancedFilterUtils";
import { getRouteSearchResults } from "utils/searchUtils.mjs";
import { getBookmarkedEvents } from "utils/bookmarkUtils";
import { sanitizeFilterQuery } from "utils/querySanitizer";

const DEFAULT_EVENTS_PER_PAGE = 20;

const MAX_SEARCH_LENGTH = 100;
const MAX_TAG_LENGTH = 50;

const SORT_MAPPING = {
  Newest: "date,desc",
  Upcoming: "date,asc",
  Oldest: "date,asc",
  "Title A-Z": "title,asc",
  "Title Z-A": "title,desc",
  "Price Low to High": "price,asc",
  "Price High to Low": "price,desc",
};

const normalizeEventItem = (event) => normalizeEvent(event);

const useEventListing = () => {
  const [events, setEvents] = useState([]);
  const [highlightedEventIds, setHighlightedEventIds] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [sortType, setSortType] = useState("Newest");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(DEFAULT_EVENTS_PER_PAGE);

  const [advancedFilters, setAdvancedFiltersState] = useStableFilters({});

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
    serverPaginated: false,
  });
  const [serverPaged, setServerPaged] = useState(false);

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const isInitialMount = useRef(true);
  const latestRequestRef = useRef(0);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    params.append("page", currentPage - 1);
    params.append("size", eventsPerPage);

    // Sanitize every user-supplied filter before it reaches the backend query
    // string. sanitizeFilterQuery strips $, &, <, > (src/utils/querySanitizer.js)
    // and length caps reject oversized values, closing the injection/DoS surface.
    const safeFilters = sanitizeFilterQuery(advancedFilters);
    const safeSearch = sanitizeFilterQuery({ search: debouncedSearchQuery }).search || "";

    if (safeSearch.trim()) {
      params.append("search", safeSearch.trim().slice(0, MAX_SEARCH_LENGTH));
    }

    if (filterType && filterType !== "all" && filterType !== "bookmarked") {
      params.append("status", filterType.toUpperCase());
    }

    if (categoryFilter && categoryFilter !== "all") {
      params.append("category", categoryFilter);
    }

    if (safeFilters?.categories?.length) {
      safeFilters.categories.forEach((category) => {
        if (category) params.append("category", category);
      });
    }

    if (safeFilters?.statuses?.length) {
      safeFilters.statuses.forEach((status) => {
        params.append("status", status.toUpperCase());
      });
    }

    if (safeFilters?.skillLevels?.length) {
      safeFilters.skillLevels.forEach((level) => {
        params.append("skillLevel", level.toLowerCase());
      });
    }

    if (safeFilters?.tags?.length) {
      safeFilters.tags.forEach((tag) => {
        if (tag) params.append("tag", tag.slice(0, MAX_TAG_LENGTH));
      });
    }

    // Whitelist-guard the sort: only known SORT_MAPPING keys are honored,
    // any other value falls back to the safe default instead of being echoed.
    const sortValue = SORT_MAPPING[sortType] ?? SORT_MAPPING.Newest;
    params.append("sort", sortValue);

    return params.toString();
  }, [currentPage, eventsPerPage, debouncedSearchQuery, filterType, categoryFilter, advancedFilters, sortType]);

  const fetchEvents = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    setIsLoading(true);
    setLoadError("");

    try {
      const query = buildQueryParams();

      const response = await apiUtils.get(`${API_ENDPOINTS.EVENTS.LIST}?${query}`);

      // Discard stale responses from earlier requests
      if (requestId !== latestRequestRef.current) return;

      // Guard against a null/undefined response so an unexpected or empty API
      // reply degrades gracefully instead of silently rendering an empty list.
      if (!response || typeof response !== "object") {
        setEvents([]);
        setServerPaged(false);
        setLoadError("Failed to load events. Please try again later.");
        return;
      }

      const responseData = response.data || {};

      const rawEvents = Array.isArray(responseData.content)
        ? responseData.content
        : Array.isArray(responseData)
          ? responseData
          : [];

      // Guard against a malformed API payload where `content` (or the whole
      // response body) is present but not an array — otherwise the `.map()`
      // below would throw and crash the listing on a bad response.
      const apiEvents = Array.isArray(rawEvents) ? rawEvents : [];

      const normalizedEvents = apiEvents.map(normalizeEventItem);
      setEvents(normalizedEvents);
      setServerPaged(isPaged);
      setLastUpdated(new Date());

      setPagination({
        totalPages: responseData.totalPages || 1,
        totalElements: responseData.totalElements || 0,
        first: responseData.first ?? true,
        last: responseData.last ?? true,
        serverPaginated: Array.isArray(responseData.content),
      });
    } catch (error) {
      setEvents([]);
      setServerPaged(false);
      setPagination({
        totalPages: 1,
        totalElements: 0,
        first: true,
        last: true,
        serverPaginated: false,
      });

      if (getApiErrorStatus(error) === 403) {
        setLoadError("Access to events is currently restricted. Please try again later.");
      } else {
        setLoadError("Failed to load events. Please try again later.");
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
  }, [searchQuery, filterType, categoryFilter, sortType, advancedFilters, eventsPerPage]);

  const setSafePage = useCallback(
    (page) => {
      if (page < 1) {
        setCurrentPage(1);
        return;
      }
      if (page > pagination.totalPages) {
        setCurrentPage(pagination.totalPages);
        return;
      }
      setCurrentPage(page);
    },
    [pagination.totalPages]
  );

  const setAdvancedFilters = useCallback(
    (filters) => {
      setAdvancedFiltersState(normalizeAdvancedFilters(filters));
    },
    [setAdvancedFiltersState]
  );

  const priceStats = useMemo(() => getPriceStats(events), [events]);
  const dateRangeStats = useMemo(() => getDateRange(events), [events]);

  const filteredEvents = useMemo(() => {
    // Bookmarked tab sources its events entirely from local storage: the
    // backend has no BOOKMARKED status, and saved events may live on server
    // pages that were never fetched. Render all saved events directly so the
    // tab is not limited to the single server page (see buildQueryParams).
    const baseEvents =
      filterType === "bookmarked"
        ? getBookmarkedEvents().map(normalizeEventItem)
        : events;

    // 1. Fuzzy search first (or all events if no query)
    let filtered = debouncedSearchQuery.trim()
      ? getRouteSearchResults(baseEvents, debouncedSearchQuery, [
          { name: "title", weight: 0.8 },
          { name: "category", weight: 0.5 },
          { name: "tags", weight: 0.4 },
          { name: "location.name", weight: 0.3 },
          { name: "location.city", weight: 0.3 },
          { name: "description", weight: 0.1 },
        ])
      : [...baseEvents];

    // 2. Status timing filter
    filtered = filtered.filter((event) => {
      const status = getEventStatus(event);

      if (filterType === "live" && status !== "live") return false;

      if (filterType === "upcoming" && status !== "upcoming") return false;

      if (filterType === "past" && status !== "past" && status !== "ended") return false;

      return true;
    });

    // 3. Category filter (client-side only when the API did not page/filter for us)
    const target =
      !serverPaged && categoryFilter && categoryFilter !== "all"
        ? categoryFilter.toLowerCase()
        : null;

    if (target) {
      filtered = filtered.filter((event) => {
        const cat = event.category?.toLowerCase() || "";
        const type = event.type?.toLowerCase() || "";
        const categories = event.categories || [];

        // Normalize for fuzzy matching (strip non-alphanumerics)
        const norm = (s) => s.replace(/[^a-z0-9]+/g, "");
        const nTarget = norm(target);
        const nCat = norm(cat);
        const nType = norm(type);
        
        // Check if any category in categories array matches
        const nCategories = categories.map(c => norm(c.toLowerCase()));

        // Exact category match takes priority (backend enum values)
        if (nCat === nTarget || nCategories.includes(nTarget)) return true;

        // Legacy / fuzzy fallback for older event data
        if (target === "hackathon" || target === "hackathons") {
          return type === "hackathon" || cat.includes("hackathon");
        } else if (["tech talks", "tech-talks", "conference"].includes(target)) {
          return (
            type === "conference" ||
            type === "summit" ||
            cat.includes("tech") ||
            cat.includes("conference") ||
            cat.includes("summit")
          );
        } else if (["cultural", "networking", "cultural & networking"].includes(target)) {
          return (
            cat.includes("networking") || cat.includes("cultural") || cat.includes("community")
          );
        }

        return (
          nCat.includes(nTarget) ||
          nType.includes(nTarget) ||
          nTarget.includes(nCat) ||
          nTarget.includes(nType)
        );
      });
    }

    // 4. Advanced filters
    return applyAdvancedFilters(filtered, advancedFilters);
  }, [events, filterType, categoryFilter, debouncedSearchQuery, advancedFilters, serverPaged]);

  // FIX (#7437): Enrich all events with AI recommendation scores so the
  // "Best Match" sort can rank events by personalised relevance.
  // useRecommendations is memoised internally and only re-runs when `events`
  // or the stored user profile changes — no extra network requests.
  const scoredEvents = useRecommendations(events);

  // Build a lookup map: eventId → { score, reasons } for downstream consumers
  // (e.g. EventCard badge rendering) without re-sorting the whole list twice.
  const matchScoreMap = useMemo(() => {
    const map = new Map();
    scoredEvents.forEach((e) => {
      map.set(String(e.id), {
        score: e.recommendationScore ?? 0,
        reasons: e.recommendationReasons ?? [],
      });
    });
    return map;
  }, [scoredEvents]);

  const sortedEvents = useMemo(() => {
    // Best Match must only re-order the already-filtered set (#12461).
    // filteredEvents does not carry recommendation scores (useRecommendations
    // returns a separate array), so enrich it from matchScoreMap first —
    // otherwise the sort would compare all-zero scores and lose the ranking.
    const base =
      sortType === "Best Match"
        ? filteredEvents.map((event) => ({
            ...event,
            recommendationScore: matchScoreMap.get(String(event.id))?.score ?? 0,
            recommendationReasons: matchScoreMap.get(String(event.id))?.reasons ?? [],
          }))
        : filteredEvents;

    return [...base].sort((a, b) => {
      // Best Match: sort by AI recommendation score descending
      if (sortType === "Best Match") {
        return (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0);
      }

      const dateA = new Date(a.date || a.startDate);
      const dateB = new Date(b.date || b.startDate);

      if (sortType === "Upcoming" || sortType === "Oldest") {
        return dateA - dateB;
      }
      // Default / Newest
      return dateB - dateA;
    });
  }, [filteredEvents, matchScoreMap, sortType]);

  const isBookmarkedTab = filterType === "bookmarked";

  const paginatedEvents = useMemo(() => {
    // Bookmarked events come from local storage, so paginate them
    // client-side regardless of how the (regular) server page was returned.
    if (isBookmarkedTab) {
      const startIndex = (currentPage - 1) * eventsPerPage;
      return sortedEvents.slice(startIndex, startIndex + eventsPerPage);
    }
    // Server already returned one page — do not re-slice client-side.
    if (serverPaged || pagination.serverPaginated) {
      return sortedEvents;
    }
    const startIndex = (currentPage - 1) * eventsPerPage;
    return sortedEvents.slice(startIndex, startIndex + eventsPerPage);
  }, [sortedEvents, currentPage, eventsPerPage, serverPaged, pagination.serverPaginated, isBookmarkedTab]);

  const totalElements = isBookmarkedTab || !serverPaged
    ? sortedEvents.length
    : pagination.totalElements;
  const totalPages = isBookmarkedTab || !serverPaged
    ? Math.ceil(sortedEvents.length / eventsPerPage) || 1
    : pagination.totalPages || 1;

  return {
    currentPage,
    eventsPerPage,
    fetchEvents,
    filteredEvents,
    highlightedEventIds,
    filterType,
    categoryFilter,
    loadError,
    isLoading,
    matchScoreMap, // eventId → { score, reasons } for badge rendering
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
    lastUpdated,
    setEventsPerPage,
    setFilterType,
    setCategoryFilter,
    setSafePage,
    setSearchQuery,
    setSortType,
    setViewMode,
    setAdvancedFilters,
    setIsAdvancedFiltersOpen,
    setHighlightedEventIds,
  };
};

export default useEventListing;
