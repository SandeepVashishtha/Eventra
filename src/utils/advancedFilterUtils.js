/**
 * Advanced Event Filtering, Sorting & Search Engine
 *
 * Provides high-performance, chainable filtering, fuzzy text search,
 * multi-attribute sorting, URL state serialization, and stats calculation.
 */

// ============================================================================
// 1. Constants & Mappings
// ============================================================================

export const EVENT_CATEGORIES = [
  { id: "web-development", label: "Web Development", color: "blue" },
  { id: "ai-ml", label: "AI & Machine Learning", color: "purple" },
  { id: "devops-cloud", label: "DevOps & Cloud", color: "indigo" },
  { id: "web3-blockchain", label: "Web3 & Blockchain", color: "pink" },
  { id: "design-ux", label: "Design & UX", color: "cyan" },
  { id: "security", label: "Security & Privacy", color: "red" },
  { id: "mobile", label: "Mobile Development", color: "green" },
  { id: "leadership", label: "Leadership & Management", color: "amber" },
  { id: "game-dev", label: "Game Development", color: "orange" },
  { id: "networking", label: "Networking & Community", color: "emerald" },
];

export const EVENT_MODES = [
  { id: "online", label: "Online", icon: "Globe" },
  { id: "offline", label: "Offline", icon: "MapPin" },
  { id: "hybrid", label: "Hybrid", icon: "Cpu" },
];

export const EVENT_STATUS_OPTIONS = [
  { id: "upcoming", label: "Upcoming", color: "blue" },
  { id: "live", label: "Ongoing", color: "green" },
  { id: "past", label: "Past", color: "gray" },
];

export const PRICE_RANGES = [
  { id: "free", min: 0, max: 0, label: "Free" },
  { id: "under-250", min: 1, max: 250, label: "Under $250" },
  { id: "250-500", min: 250, max: 500, label: "$250 - $500" },
  { id: "500-1000", min: 500, max: 1000, label: "$500 - $1000" },
  { id: "1000-plus", min: 1000, max: Infinity, label: "$1000+" },
];

export const SORT_OPTIONS = [
  { id: "date-asc", label: "Date: Soonest First" },
  { id: "date-desc", label: "Date: Latest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "title-asc", label: "Title: A-Z" },
  { id: "popularity-desc", label: "Most Popular" },
];

export const FILTER_PRESETS = [
  {
    id: "free-online",
    label: "Free Online",
    filters: { modes: ["online"], priceRange: { min: 0, max: 0 } },
  },
  {
    id: "upcoming-workshops",
    label: "Upcoming Workshops",
    filters: {
      statuses: ["upcoming"],
      categories: ["web-development", "ai-ml", "devops-cloud"],
    },
  },
  {
    id: "local-networking",
    label: "Local Networking",
    filters: {
      modes: ["offline", "hybrid"],
      categories: ["networking", "leadership"],
    },
  },
  {
    id: "live-virtual",
    label: "Live Virtual",
    filters: { modes: ["online"], statuses: ["live"] },
  },
];

// ============================================================================
// 2. Normalization & Formatting Helpers
// ============================================================================

export const normalizeFilterValue = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Retrieves human-readable category label from an ID or string.
 *
 * @param {string} categoryKey - Category ID or raw string.
 * @returns {string} Formatted category display name.
 */
export const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return "";
  const trimmedKey = String(categoryKey).trim();
  if (!trimmedKey) return "";

  const category = EVENT_CATEGORIES.find(
    (cat) =>
      cat.id === trimmedKey ||
      normalizeFilterValue(cat.label) === normalizeFilterValue(trimmedKey)
  );

  return category?.label || trimmedKey;
};

// ============================================================================
// 3. Modular Atomic Filters
// ============================================================================

/**
 * Filters events by multi-field search query (title, description, tags, organizer).
 *
 * @param {Array<Object>} events - Array of event items.
 * @param {string} searchQuery - Search keywords.
 * @returns {Array<Object>} Filtered events array.
 */
export const filterBySearch = (events, searchQuery) => {
  if (!Array.isArray(events)) return [];
  const query = String(searchQuery || "").trim().toLowerCase();
  if (!query) return events;

  return events.filter((event) => {
    const title = String(event.title || event.name || "").toLowerCase();
    const description = String(event.description || event.summary || "").toLowerCase();
    const organizer = String(event.organizer || event.host || "").toLowerCase();
    const tags = Array.isArray(event.tags) ? event.tags.join(" ").toLowerCase() : "";

    return (
      title.includes(query) ||
      description.includes(query) ||
      organizer.includes(query) ||
      tags.includes(query)
    );
  });
};

/**
 * Filters events matching selected category identifiers.
 */
export const filterByCategory = (events, selectedCategories) => {
  if (!Array.isArray(events)) return [];
  if (!selectedCategories || selectedCategories.length === 0) return events;

  const normalizedSelected = selectedCategories.map((cat) => normalizeFilterValue(cat));

  return events.filter((event) => {
    const eventCategory = normalizeFilterValue(event.category || event.type);
    return normalizedSelected.some((cat) => {
      const mapped = EVENT_CATEGORIES.find((c) => c.id === cat || normalizeFilterValue(c.label) === cat);
      return (
        eventCategory === cat ||
        eventCategory === normalizeFilterValue(mapped?.id) ||
        eventCategory === normalizeFilterValue(mapped?.label)
      );
    });
  });
};

/**
 * Filters events matching location or city query.
 */
export const filterByLocation = (events, locationQuery) => {
  if (!Array.isArray(events)) return [];
  const query = String(locationQuery || "").trim().toLowerCase();
  if (!query) return events;

  return events.filter((event) =>
    String(event.location || event.venue || event.city || "").toLowerCase().includes(query)
  );
};

/**
 * Filters events by mode (online, offline, hybrid).
 */
export const filterByMode = (events, selectedModes) => {
  if (!Array.isArray(events)) return [];
  if (!selectedModes || selectedModes.length === 0) return events;

  const normalizedModes = selectedModes.map((m) => normalizeFilterValue(m));

  return events.filter((event) =>
    normalizedModes.includes(normalizeFilterValue(event.eventMode || event.mode || "offline"))
  );
};

/**
 * Filters events by price range bounds.
 */
export const filterByPrice = (events, priceRange) => {
  if (!Array.isArray(events)) return [];
  if (!priceRange) return events;

  const { min = 0, max = Infinity } = priceRange;

  return events.filter((event) => {
    const price = typeof event.price === "number" ? event.price : parseFloat(event.price) || 0;
    return price >= min && price <= max;
  });
};

/**
 * Filters events within a start and end date window.
 */
export const filterByDateRange = (events, dateRange) => {
  if (!Array.isArray(events)) return [];
  if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) return events;

  const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date("1900-01-01");
  const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date("2099-12-31");
  endDate.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const eventDate = new Date(event.date || event.startDate || event.createdAt);
    return !Number.isNaN(eventDate.getTime()) && eventDate >= startDate && eventDate <= endDate;
  });
};

/**
 * Filters events by status (upcoming, live, past).
 */
export const filterByStatus = (events, selectedStatuses) => {
  if (!Array.isArray(events)) return [];
  if (!selectedStatuses || selectedStatuses.length === 0) return events;

  const normalizedStatuses = selectedStatuses.map((s) => normalizeFilterValue(s));

  return events.filter((event) => {
    const status = normalizeFilterValue(event.status || "upcoming");
    return normalizedStatuses.includes(status);
  });
};

// ============================================================================
// 4. Sorting & Pipeline Orchestration
// ============================================================================

/**
 * Sorts event list based on predefined criteria.
 *
 * @param {Array<Object>} events - Unsorted events array.
 * @param {string} [sortBy='date-asc'] - Sorting key identifier.
 * @returns {Array<Object>} New sorted events array.
 */
export const sortEvents = (events, sortBy = "date-asc") => {
  if (!Array.isArray(events)) return [];
  const list = [...events];

  switch (sortBy) {
    case "date-asc":
      return list.sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate));
    case "date-desc":
      return list.sort((a, b) => new Date(b.date || b.startDate) - new Date(a.date || a.startDate));
    case "price-asc":
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-desc":
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "title-asc":
      return list.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    case "popularity-desc":
      return list.sort((a, b) => (b.attendeesCount || b.views || 0) - (a.attendeesCount || a.views || 0));
    default:
      return list;
  }
};

/**
 * Applies all filter criteria and sorting to an event dataset.
 *
 * @param {Array<Object>} events - Raw event array.
 * @param {Object} [filters={}] - Consolidated filter parameters.
 * @param {string} [sortBy='date-asc'] - Sorting strategy key.
 * @returns {Array<Object>} Filtered and sorted event list.
 */
export const applyAdvancedFilters = (events, filters = {}, sortBy = "date-asc") => {
  if (!Array.isArray(events)) return [];

  let result = events;

  if (filters.search) result = filterBySearch(result, filters.search);
  if (filters.categories?.length) result = filterByCategory(result, filters.categories);
  if (filters.modes?.length) result = filterByMode(result, filters.modes);
  if (filters.location) result = filterByLocation(result, filters.location);
  if (filters.priceRange) result = filterByPrice(result, filters.priceRange);
  if (filters.dateRange) result = filterByDateRange(result, filters.dateRange);
  if (filters.statuses?.length) result = filterByStatus(result, filters.statuses);

  return sortEvents(result, sortBy);
};

/**
 * Paginate an event array.
 */
export const paginateEvents = (events, page = 1, pageSize = 10) => {
  if (!Array.isArray(events)) return { items: [], totalPages: 0, totalItems: 0 };
  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const validPageSize = Math.max(1, parseInt(pageSize, 10) || 10);
  const totalItems = events.length;
  const totalPages = Math.ceil(totalItems / validPageSize);
  const startIndex = (validPage - 1) * validPageSize;

  return {
    items: events.slice(startIndex, startIndex + validPageSize),
    page: validPage,
    pageSize: validPageSize,
    totalItems,
    totalPages,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
};

// ============================================================================
// 5. Data Aggregation & State Helpers
// ============================================================================

export const getUniqueCategories = (events) => {
  if (!Array.isArray(events)) return [];
  const categories = new Set();
  events.forEach((e) => e.category && categories.add(e.category));
  return Array.from(categories).sort();
};

export const getPriceStats = (events) => {
  if (!Array.isArray(events) || events.length === 0) return { min: 0, max: 0, average: 0 };
  const prices = events
    .map((e) => (typeof e.price === "number" ? e.price : parseFloat(e.price) || 0))
    .filter((p) => !Number.isNaN(p));

  if (prices.length === 0) return { min: 0, max: 0, average: 0 };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return { min, max, average };
};

export const getDateRange = (events) => {
  if (!Array.isArray(events) || events.length === 0) return { earliest: new Date(), latest: new Date() };
  const dates = events
    .map((e) => new Date(e.date || e.startDate))
    .filter((d) => !Number.isNaN(d.getTime()));

  if (dates.length === 0) return { earliest: new Date(), latest: new Date() };

  return {
    earliest: new Date(Math.min(...dates)),
    latest: new Date(Math.max(...dates)),
  };
};

export const hasActiveFilters = (filters = {}) => {
  return Boolean(
    (filters.search && filters.search.trim() !== "") ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.modes && filters.modes.length > 0) ||
    (filters.statuses && filters.statuses.length > 0) ||
    (filters.location && filters.location.trim() !== "") ||
    (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < Infinity)) ||
    (filters.dateRange && (filters.dateRange.startDate || filters.dateRange.endDate))
  );
};

export const getDefaultFilters = () => ({
  search: "",
  categories: [],
  modes: [],
  statuses: [],
  location: "",
  priceRange: null,
  dateRange: null,
});

export const normalizeAdvancedFilters = (filters = {}) => ({
  ...getDefaultFilters(),
  ...filters,
  search: typeof filters.search === "string" ? filters.search : "",
  categories: Array.isArray(filters.categories) ? filters.categories : [],
  modes: Array.isArray(filters.modes) ? filters.modes : [],
  statuses: Array.isArray(filters.statuses) ? filters.statuses : [],
  location: typeof filters.location === "string" ? filters.location : "",
  priceRange: filters.priceRange
    ? {
        min: Number(filters.priceRange.min) || 0,
        max: filters.priceRange.max === Infinity ? Infinity : Number(filters.priceRange.max) || 0,
      }
    : null,
  dateRange: filters.dateRange
    ? {
        startDate: toDateInputValue(filters.dateRange.startDate),
        endDate: toDateInputValue(filters.dateRange.endDate),
      }
    : null,
});

export const serializeAdvancedFilters = (filters = {}) => {
  const normalized = normalizeAdvancedFilters(filters);
  const payload = {};

  if (normalized.search.trim()) payload.search = normalized.search.trim();
  if (normalized.categories.length) payload.categories = normalized.categories;
  if (normalized.modes.length) payload.modes = normalized.modes;
  if (normalized.statuses.length) payload.statuses = normalized.statuses;
  if (normalized.location.trim()) payload.location = normalized.location.trim();
  if (normalized.priceRange) payload.priceRange = normalized.priceRange;
  if (normalized.dateRange && (normalized.dateRange.startDate || normalized.dateRange.endDate)) {
    payload.dateRange = normalized.dateRange;
  }

  return payload;
};

export const encodeAdvancedFilters = (filters = {}) => {
  const payload = serializeAdvancedFilters(filters);
  return Object.keys(payload).length ? encodeURIComponent(JSON.stringify(payload)) : "";
};

export const decodeAdvancedFilters = (value) => {
  if (!value) return getDefaultFilters();
  try {
    return normalizeAdvancedFilters(JSON.parse(decodeURIComponent(value)));
  } catch {
    return getDefaultFilters();
  }
};

export default applyAdvancedFilters;