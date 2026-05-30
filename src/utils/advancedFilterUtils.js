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

/**
 * Get category label from mapping
 */
export const getCategoryLabel = (categoryKey) => {
  if (!categoryKey) return categoryKey;
  const category = EVENT_CATEGORIES.find(
    (cat) =>
      cat.label.toLowerCase().replace(/\s+/g, "-") ===
      categoryKey.toLowerCase(),
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
    const eventCategory = event.category || event.type;
    return selectedCategories.some(
      (cat) =>
        eventCategory.toLowerCase().replace(/\s+/g, "-") ===
        cat.toLowerCase().replace(/\s+/g, "-"),
    );
  });
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
    selectedModes.includes(event.eventMode || "offline"),
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
    const eventDate = new Date(event.date);
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

  return events.filter((event) =>
    selectedStatuses.includes(event.status || "upcoming"),
  );
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
    .map((e) => new Date(e.date))
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
  priceRange: null,
  dateRange: null,
});
