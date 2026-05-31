/**
 * Advanced filtering utilities for event management
 * Provides modular and scalable filtering functions
 */

// Event categories mapping
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

// Event modes
export const EVENT_MODES = [
  { id: "online", label: "Online", icon: "Globe" },
  { id: "offline", label: "Offline", icon: "MapPin" },
  { id: "hybrid", label: "Hybrid", icon: "Cpu" },
];

// Event status options
export const EVENT_STATUS_OPTIONS = [
  { id: "upcoming", label: "Upcoming", color: "blue" },
  { id: "live", label: "Ongoing", color: "green" },
  { id: "past", label: "Past", color: "gray" },
];

// Price range presets
export const PRICE_RANGES = [
  { min: 0, max: 0, label: "Free" },
  { min: 1, max: 250, label: "Under $250" },
  { min: 250, max: 500, label: "$250 - $500" },
  { min: 500, max: 1000, label: "$500 - $1000" },
  { min: 1000, max: Infinity, label: "$1000+" },
];

export const FILTER_PRESETS = [
  {
    id: "free-online",
    label: "Free Online",
    filters: {
      modes: ["online"],
      priceRange: { min: 0, max: 0 },
    },
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
    filters: {
      modes: ["online"],
      statuses: ["live"],
    },
  },
];

const normalizeFilterValue = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Get category label from mapping
 */
export const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return categoryKey;
  const category = EVENT_CATEGORIES.find(
    (cat) =>
      cat.id === categoryKey ||
      normalizeFilterValue(cat.label) === normalizeFilterValue(categoryKey),
  );
  return category?.label || categoryKey;
};

/**
 * Filter events by category
 * @param {Array} events - Array of events to filter
 * @param {Array} selectedCategories - Selected category keys
 * @returns {Array} Filtered events
 */
export const filterByCategory = (events, selectedCategories) => {
  if (!selectedCategories || selectedCategories.length === 0) {
    return events;
  }

  return events.filter((event) => {
    const eventCategory = normalizeFilterValue(event.category || event.type);
    return selectedCategories.some((cat) => {
      const mappedCategory = EVENT_CATEGORIES.find(
        (category) =>
          category.id === cat ||
          normalizeFilterValue(category.label) === normalizeFilterValue(cat),
      );

      return (
        eventCategory === normalizeFilterValue(cat) ||
        eventCategory === normalizeFilterValue(mappedCategory?.id) ||
        eventCategory === normalizeFilterValue(mappedCategory?.label)
      );
    });
  });
};

export const filterByLocation = (events, locationQuery) => {
  const query = String(locationQuery || "").trim().toLowerCase();
  if (!query) {
    return events;
  }

  return events.filter((event) =>
    String(event.location || event.venue || event.city || "")
      .toLowerCase()
      .includes(query),
  );
};

/**
 * Filter events by event mode (online/offline/hybrid)
 * @param {Array} events - Array of events to filter
 * @param {Array} selectedModes - Selected mode IDs
 * @returns {Array} Filtered events
 */
export const filterByMode = (events, selectedModes) => {
  if (!selectedModes || selectedModes.length === 0) {
    return events;
  }

  return events.filter((event) =>
    selectedModes.includes(
      normalizeFilterValue(event.eventMode || event.mode || "offline"),
    ),
  );
};

/**
 * Filter events by price range
 * @param {Array} events - Array of events to filter
 * @param {Object} priceRange - { min: number, max: number }
 * @returns {Array} Filtered events
 */
export const filterByPrice = (events, priceRange) => {
  if (!priceRange) {
    return events;
  }

  const { min = 0, max = Infinity } = priceRange;

  return events.filter((event) => {
    const price = event.price || 0;
    return price >= min && price <= max;
  });
};

/**
 * Filter events by date range
 * @param {Array} events - Array of events to filter
 * @param {Object} dateRange - { startDate: Date, endDate: Date }
 * @returns {Array} Filtered events
 */
export const filterByDateRange = (events, dateRange) => {
  if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) {
    return events;
  }

  const startDate = dateRange.startDate
    ? new Date(dateRange.startDate)
    : new Date("1900-01-01");
  const endDate = dateRange.endDate
    ? new Date(dateRange.endDate)
    : new Date("2099-12-31");

  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const eventDate = new Date(event.date || event.startDate);
    return eventDate >= startDate && eventDate <= endDate;
  });
};

/**
 * Filter events by status (upcoming, ongoing, past)
 * @param {Array} events - Array of events to filter
 * @param {Array} selectedStatuses - Selected status IDs
 * @returns {Array} Filtered events
 */
export const filterByStatus = (events, selectedStatuses) => {
  if (!selectedStatuses || selectedStatuses.length === 0) {
    return events;
  }

  return events.filter((event) => {
    const status = normalizeFilterValue(event.status || "upcoming");
    return selectedStatuses.some(
      (selectedStatus) => normalizeFilterValue(selectedStatus) === status,
    );
  });
};

/**
 * Apply all filters to events
 * @param {Array} events - Array of events to filter
 * @param {Object} filters - Filter configuration object
 * @returns {Array} Filtered events
 */
export const applyAdvancedFilters = (events, filters = {}) => {
  let filtered = events;

  if (filters.categories && filters.categories.length > 0) {
    filtered = filterByCategory(filtered, filters.categories);
  }

  if (filters.modes && filters.modes.length > 0) {
    filtered = filterByMode(filtered, filters.modes);
  }

  if (filters.location) {
    filtered = filterByLocation(filtered, filters.location);
  }

  if (filters.priceRange) {
    filtered = filterByPrice(filtered, filters.priceRange);
  }

  if (filters.dateRange) {
    filtered = filterByDateRange(filtered, filters.dateRange);
  }

  if (filters.statuses && filters.statuses.length > 0) {
    filtered = filterByStatus(filtered, filters.statuses);
  }

  return filtered;
};

/**
 * Get unique categories from events
 * @param {Array} events - Array of events
 * @returns {Array} Unique categories
 */
export const getUniqueCategories = (events) => {
  const categories = new Set();
  events.forEach((event) => {
    if (event.category) {
      categories.add(event.category);
    }
  });
  return Array.from(categories).sort();
};

/**
 * Get price range statistics from events
 * @param {Array} events - Array of events
 * @returns {Object} { min: number, max: number, average: number }
 */
export const getPriceStats = (events) => {
  if (events.length === 0) {
    return { min: 0, max: 0, average: 0 };
  }

  const prices = events
    .map((e) => e.price || 0)
    .filter((p) => typeof p === "number");

  if (prices.length === 0) {
    return { min: 0, max: 0, average: 0 };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return { min, max, average };
};

/**
 * Get date range from events
 * @param {Array} events - Array of events
 * @returns {Object} { earliest: Date, latest: Date }
 */
export const getDateRange = (events) => {
  if (events.length === 0) {
    return { earliest: new Date(), latest: new Date() };
  }

  const dates = events
    .map((e) => new Date(e.date || e.startDate))
    .filter((d) => !Number.isNaN(d.getTime()));

  if (dates.length === 0) {
    return { earliest: new Date(), latest: new Date() };
  }

  return {
    earliest: new Date(Math.min(...dates)),
    latest: new Date(Math.max(...dates)),
  };
};

/**
 * Check if any filters are active
 * @param {Object} filters - Filter configuration
 * @returns {boolean} True if any filter is active
 */
export const hasActiveFilters = (filters = {}) => {
  return (
    (filters.categories && filters.categories.length > 0) ||
    (filters.modes && filters.modes.length > 0) ||
    (filters.statuses && filters.statuses.length > 0) ||
    (filters.location && filters.location.trim() !== "") ||
    (filters.priceRange &&
      (filters.priceRange.min > 0 || filters.priceRange.max < Infinity)) ||
    (filters.dateRange &&
      (filters.dateRange.startDate || filters.dateRange.endDate))
  );
};

/**
 * Reset all filters to default state
 * @returns {Object} Default filter state
 */
export const getDefaultFilters = () => ({
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
  categories: Array.isArray(filters.categories) ? filters.categories : [],
  modes: Array.isArray(filters.modes) ? filters.modes : [],
  statuses: Array.isArray(filters.statuses) ? filters.statuses : [],
  location: typeof filters.location === "string" ? filters.location : "",
  priceRange: filters.priceRange
    ? {
        min: Number(filters.priceRange.min) || 0,
        max:
          filters.priceRange.max === Infinity
            ? Infinity
            : Number(filters.priceRange.max) || 0,
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

  if (normalized.categories.length) payload.categories = normalized.categories;
  if (normalized.modes.length) payload.modes = normalized.modes;
  if (normalized.statuses.length) payload.statuses = normalized.statuses;
  if (normalized.location.trim()) payload.location = normalized.location.trim();
  if (normalized.priceRange) payload.priceRange = normalized.priceRange;
  if (
    normalized.dateRange &&
    (normalized.dateRange.startDate || normalized.dateRange.endDate)
  ) {
    payload.dateRange = normalized.dateRange;
  }

  return payload;
};

export const encodeAdvancedFilters = (filters = {}) => {
  const payload = serializeAdvancedFilters(filters);
  return Object.keys(payload).length
    ? encodeURIComponent(JSON.stringify(payload))
    : "";
};

export const decodeAdvancedFilters = (value) => {
  if (!value) {
    return getDefaultFilters();
  }

  try {
    return normalizeAdvancedFilters(JSON.parse(decodeURIComponent(value)));
  } catch {
    return getDefaultFilters();
  }
};
