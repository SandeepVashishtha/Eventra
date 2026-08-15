import { apiUtils, API_ENDPOINTS } from "../config/api";

/**
 * Normalises a raw HackathonResponse from the backend into the shape
 * expected by HackathonPage / HackathonCard.
 *
 * Backend fields  →  UI fields
 *  startDate/endDate  → status ("live" | "upcoming" | "completed")
 *  prizePool (string) → prize  (kept as-is; filter util parses digits)
 */
const normalizeHackathon = (h) => {
  const now = Date.now();
  const start = h.startDate ? new Date(h.startDate).getTime() : null;
  const end = h.endDate ? new Date(h.endDate).getTime() : null;

  let status = "upcoming";
  if (start && end) {
    if (now >= start && now <= end) status = "live";
    else if (now > end) status = "completed";
  }

  return {
    ...h,
    // computed
    status,
    // alias: filter util reads hackathon.prize
    prize: h.prize ?? h.prizePool ?? null,
    // alias: card reads hackathon.date as a fallback
    date: h.startDate ?? h.date ?? null,
    // techStack not in API yet — default to empty
    techStack: h.techStack ?? [],
  };
};

// ============================================================================
// 1. CONFIGURATION & CACHE STATE MANAGEMENT
// ============================================================================

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 Minutes Cache
const memoryCache = new Map();

class CircuitBreaker {
  constructor(threshold = 3, cooldownMs = 30000) {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
  }

  isOpen() {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.reset();
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

const circuitBreaker = new CircuitBreaker();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generates a unique cache key based on query parameters
const generateCacheKey = (params = {}) => {
  const sortedKeys = Object.keys(params).sort();
  const serializedParams = sortedKeys
    .map((k) => `${k}=${Array.isArray(params[k]) ? params[k].join(",") : params[k]}`)
    .join("&");
  return `hackathons_cache_${serializedParams || "default"}`;
};

// ============================================================================
// 2. DATA SCHEMA NORMALIZATION
// ============================================================================

/**
 * Normalizes hackathon objects from API or mock json into a consistent schema
 */
export const normalizeHackathon = (item = {}, index = 0) => {
  const now = new Date().getTime();
  const startDate = item.startDate ? new Date(item.startDate).getTime() : now - 86400000;
  const endDate = item.endDate ? new Date(item.endDate).getTime() : now + 86400000 * 7;

  // Calculate dynamic status based on start and end dates
  let calculatedStatus = item.status || "upcoming";
  if (now >= startDate && now <= endDate) {
    calculatedStatus = "ongoing";
  } else if (now > endDate) {
    calculatedStatus = "ended";
  } else if (now < startDate) {
    calculatedStatus = "upcoming";
  }

  return {
    id: item.id || item._id || `hackathon_${index}_${Date.now()}`,
    slug: item.slug || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `hackathon-${index}`),
    title: item.title || "Untitled Hackathon",
    organizer: item.organizer || item.hostedBy || "Community Host",
    tagline: item.tagline || item.shortDescription || "Join this hackathon to build and showcase your projects.",
    description: item.description || "No detailed description available.",
    bannerImage: item.bannerImage || item.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    logoImage: item.logoImage || item.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80",
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    status: calculatedStatus,
    mode: (item.mode || item.locationType || "online").toLowerCase(), // 'online', 'in-person', 'hybrid'
    location: item.location || (item.mode === "online" ? "Global / Remote" : "TBD"),
    prizePool: typeof item.prizePool === "number" ? item.prizePool : parseFloat(item.prizePool || 0),
    currency: item.currency || "USD",
    tags: Array.isArray(item.tags) ? item.tags : Array.isArray(item.categories) ? item.categories : ["General"],
    featured: Boolean(item.featured),
    registrationUrl: item.registrationUrl || item.link || "#",
    participantsCount: item.participantsCount || item.attendees || 0,
  };
};

// ============================================================================
// 3. OFFLINE MOCK QUERY ENGINE (FILTER, SEARCH, PAGINATE)
// ============================================================================

/**
 * Runs full filter, search, sort, and pagination over mock data locally
 */
const queryLocalMockData = (params = {}) => {
  const {
    search = "",
    status = "all",
    mode = "all",
    tag = "all",
    sortBy = "newest",
    page = 1,
    limit = 10,
  } = params;

  // 1. Normalize initial mock array
  let dataset = (Array.isArray(mockHackathons) ? mockHackathons : []).map(normalizeHackathon);

  // 2. Text Search Filter
  if (search.trim()) {
    const query = search.toLowerCase().trim();
    dataset = dataset.filter(
      (h) =>
        h.title.toLowerCase().includes(query) ||
        h.tagline.toLowerCase().includes(query) ||
        h.organizer.toLowerCase().includes(query) ||
        h.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // 3. Status Filter (ongoing, upcoming, ended)
  if (status !== "all") {
    dataset = dataset.filter((h) => h.status.toLowerCase() === status.toLowerCase());
  }

  // 4. Mode Filter (online, in-person, hybrid)
  if (mode !== "all") {
    dataset = dataset.filter((h) => h.mode.toLowerCase() === mode.toLowerCase());
  }

  // 5. Tag / Category Filter
  if (tag !== "all") {
    dataset = dataset.filter((h) =>
      h.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  // 6. Sorting Logic
  dataset.sort((a, b) => {
    switch (sortBy) {
      case "prizePool":
        return b.prizePool - a.prizePool;
      case "deadline":
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case "oldest":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "newest":
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  // 7. Pagination Calculation
  const total = dataset.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = dataset.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    pagination: {
      total,
      page: currentPage,
      limit,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
    source: "mock_local_engine",
  };
};

// ============================================================================
// 4. MAIN PUBLIC APIS
// ============================================================================

/**
 * Fetches hackathons with support for parameters, caching, circuit breaking,
 * and offline mock query fallbacks.
 *
 * @param {Object} [params] - Query options (search, status, mode, tag, sortBy, page, limit)
 * @param {Object} [options] - Optional settings (e.g. { bypassCache: true, signal: AbortSignal })
 * @returns {Promise<Object|Array>} Returns response object containing normalized hackathons data & pagination metadata
 */
export const fetchHackathons = async (params = {}, options = {}) => {
  const cacheKey = generateCacheKey(params);

  // 1. Check Memory Cache
  if (!options.bypassCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // 2. Check Circuit Breaker
  if (circuitBreaker.isOpen()) {
    console.warn("[hackathonService] Circuit breaker active. Routing to local mock query engine.");
    return queryLocalMockData(params);
  }

  // 3. Execution with Exponential Retries
  let retries = 2;
  let delay = 500;

  while (retries >= 0) {
    try {
      const response = await apiUtils.get(API_ENDPOINTS.HACKATHONS.LIST, {
        params,
        signal: options.signal,
      });

      // Support both direct array/object return or response.data structure from axios
      const rawData = response?.data !== undefined ? response.data : response;

      let rawList = [];
      let paginationMeta = null;

      if (Array.isArray(rawData)) {
        rawList = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        rawList = rawData.data;
        paginationMeta = rawData.pagination || rawData.meta;
      }

      if (rawList.length > 0) {
        const normalizedData = rawList.map(normalizeHackathon);

        const resultPayload = {
          data: normalizedData,
          pagination: paginationMeta || {
            total: normalizedData.length,
            page: params.page || 1,
            limit: params.limit || normalizedData.length,
            totalPages: 1,
          },
          source: "live_api",
        };

        // Record Success & Cache
        circuitBreaker.recordSuccess();
        memoryCache.set(cacheKey, { data: resultPayload, timestamp: Date.now() });

        return resultPayload;
      }

      // Empty response from API, trigger fallback
      throw new Error("Empty API payload received");

    } catch (error) {
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
        throw error; // Cancelled by component unmount
      }

      retries--;
      if (retries < 0) {
        console.warn("[hackathonService] Failed to fetch hackathons from API, falling back to mock data engine", error);
        circuitBreaker.recordFailure();
        break;
      }
      await wait(delay);
      delay *= 2; // Exponential backoff
    }
  }

  // 4. Return Processed Local Mock Query Result
  return queryLocalMockData(params);
};

/**
 * Fetches a single hackathon by ID or Slug with fallback support
 *
 * @param {string|number} identifier - Hackathon ID or Slug
 * @param {Object} [options]
 * @returns {Promise<Object>} Normalized Hackathon object
 */
export const fetchHackathonById = async (identifier, options = {}) => {
  if (!identifier) throw new Error("Hackathon ID or Slug is required");

  try {
    const endpoint = API_ENDPOINTS.HACKATHONS.BY_ID 
      ? API_ENDPOINTS.HACKATHONS.BY_ID(identifier)
      : `${API_ENDPOINTS.HACKATHONS.LIST}/${identifier}`;

    const response = await apiUtils.get(endpoint, { signal: options.signal });
    const rawData = response?.data !== undefined ? response.data : response;

    if (rawData) {
      return normalizeHackathon(rawData);
    }
  } catch (error) {
    console.warn(`[hackathonService] Failed to fetch hackathon ${identifier}, falling back to mock data search`);
  }

  // Fallback: Search mock dataset locally
  const mockItem = (Array.isArray(mockHackathons) ? mockHackathons : []).find(
    (h) => String(h.id) === String(identifier) || String(h.slug) === String(identifier)
  );

  if (mockItem) {
    return normalizeHackathon(mockItem);
  }

  // Generic fallback if not found anywhere
  return normalizeHackathon({
    id: identifier,
    title: "Hackathon Event",
    description: "Event details are currently unavailable offline.",
  });
};

/**
 * Clears the hackathon memory cache
 */
export const clearHackathonCache = () => {
  memoryCache.clear();
};
