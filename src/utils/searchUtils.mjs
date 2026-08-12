/* eslint-disable no-console */
import Fuse from "fuse.js";

/**
 * Advanced Route & Entity Search Engine
 * Features: Hybrid Fuzzy/Exact Search, In-Memory Indexing, Result Caching,
 * Highlight Extraction, Faceted Filtering, Autocomplete, and Query Analytics.
 */

// ============================================================================
// CONSTANTS & DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_FUSE_OPTIONS = Object.freeze({
  threshold: 0.35,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  ignoreLocation: true,
  useExtendedSearch: true,
  findAllMatches: false,
  includeMatches: true,
  includeScore: true,
});

export const DEFAULT_STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
  "further", "had", "has", "have", "having", "he", "her", "here", "hers",
  "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is",
  "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no",
  "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our",
  "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so",
  "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "whom", "why", "with", "you", "your", "yours"
]);

// ============================================================================
// TEXT NORMALIZATION & TOKENIZATION UTILITIES
// ============================================================================

/**
 * Normalizes input text by removing diacritics, special characters, and extra spaces.
 * @param {any} value
 * @returns {string}
 */
export const normalizeSearchText = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeSearchText).filter(Boolean).join(" ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return Object.values(value).map(normalizeSearchText).filter(Boolean).join(" ");
  }

  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Breaks string query into distinct normalized token terms.
 * @param {string} query
 * @param {boolean} [removeStopwords=false]
 * @returns {string[]}
 */
export const getSearchTokens = (query, removeStopwords = false) => {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const tokens = normalized.split(" ").filter((token) => token.length > 0);
  if (!removeStopwords) return tokens;

  return tokens.filter((token) => !DEFAULT_STOPWORDS.has(token));
};

/**
 * Extracts searchable text across configured keys for an item.
 * @param {Object} item
 * @param {Array<string|Object>} keys
 * @returns {string}
 */
export const getSearchableText = (item, keys) => {
  if (!item || !keys || !Array.isArray(keys)) return "";

  return keys
    .map((key) => {
      const keyName = typeof key === "object" ? key.name : key;
      const val = getNestedFieldValue(item, keyName);
      return normalizeSearchText(val);
    })
    .filter(Boolean)
    .join(" ");
};

/**
 * Safely accesses nested properties using dot notation (e.g. "meta.category").
 * @param {Object} obj
 * @param {string} path
 * @returns {any}
 */
export const getNestedFieldValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
};

// ============================================================================
// HIGHLIGHT MATCH EXTRACTION UTILITIES
// ============================================================================

/**
 * Generates highlighted HTML snippet or text segments from search query matches.
 * @param {string} text - Raw text to highlight
 * @param {string} query - Search query
 * @param {string} [highlightClass="search-highlight"] - CSS class for match tags
 * @returns {string} Formatted HTML string
 */
export const highlightMatches = (text, query, highlightClass = "search-highlight") => {
  if (!text || !query) return text || "";

  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return text;

  const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");

  return String(text).replace(
    regex,
    (match) => `<mark class="${highlightClass}">${match}</mark>`
  );
};

/**
 * Computes character offset boundary ranges for text match highlighting.
 * @param {string} text
 * @param {string[]} tokens
 * @returns {Array<[number, number]>} Array of [start, end] tuples
 */
export const getMatchIndices = (text, tokens) => {
  if (!text || !tokens || tokens.length === 0) return [];
  const lowerText = text.toLowerCase();
  const indices = [];

  tokens.forEach((token) => {
    let start = 0;
    while ((start = lowerText.indexOf(token, start)) !== -1) {
      indices.push([start, start + token.length]);
      start += token.length;
    }
  });

  return indices.sort((a, b) => a[0] - b[0]);
};

// ============================================================================
// FACET & FILTERING ENGINE
// ============================================================================

/**
 * Filters items by key-value constraint rules.
 * Supports exact equality, set membership, and range limits.
 * @param {Array} items
 * @param {Object} filters - e.g. { category: "workshop", level: ["Beginner", "Expert"] }
 * @returns {Array} Filtered items
 */
export const applyFilters = (items, filters = {}) => {
  if (!Array.isArray(items) || Object.keys(filters).length === 0) {
    return items || [];
  }

  return items.filter((item) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (filterValue === undefined || filterValue === null || filterValue === "") {
        return true;
      }

      const itemValue = getNestedFieldValue(item, key);

      // Handle array filter value (OR matching)
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return true;
        if (Array.isArray(itemValue)) {
          return filterValue.some((v) => itemValue.includes(v));
        }
        return filterValue.includes(itemValue);
      }

      // Handle Range Filter object ({ min, max })
      if (typeof filterValue === "object" && (filterValue.min !== undefined || filterValue.max !== undefined)) {
        const numVal = Number(itemValue);
        if (isNaN(numVal)) return false;
        if (filterValue.min !== undefined && numVal < filterValue.min) return false;
        if (filterValue.max !== undefined && numVal > filterValue.max) return false;
        return true;
      }

      // Handle direct array value in item
      if (Array.isArray(itemValue)) {
        return itemValue.includes(filterValue);
      }

      // Direct value equality
      return String(itemValue).toLowerCase() === String(filterValue).toLowerCase();
    });
  });
};

/**
 * Calculates facet term frequency counts across configured fields.
 * @param {Array} items
 * @param {string[]} facetKeys - Array of field keys to calculate counts for
 * @returns {Object} Facet counts dictionary
 */
export const generateFacets = (items, facetKeys = []) => {
  if (!Array.isArray(items) || !Array.isArray(facetKeys)) return {};

  const facets = {};

  facetKeys.forEach((key) => {
    facets[key] = {};
  });

  items.forEach((item) => {
    facetKeys.forEach((key) => {
      const val = getNestedFieldValue(item, key);

      if (val !== undefined && val !== null) {
        const values = Array.isArray(val) ? val : [val];
        values.forEach((v) => {
          const strVal = String(v).trim();
          if (strVal) {
            facets[key][strVal] = (facets[key][strVal] || 0) + 1;
          }
        });
      }
    });
  });

  return facets;
};

// ============================================================================
// SEARCH ENGINE MEMOIZATION CACHE
// ============================================================================

class SearchResultCache {
  constructor(maxSize = 100, ttlMs = 300000) { // Default 5 mins TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  generateKey(query, keys, filters, options) {
    return `${normalizeSearchText(query)}|${keys.join(",")}|${JSON.stringify(filters)}|${JSON.stringify(options)}`;
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const globalSearchCache = new SearchResultCache();

// ============================================================================
// CORE HYBRID SEARCH ENGINE
// ============================================================================

/**
 * Core search function combining exact substring matching, token intersection,
 * and Fuse.js fuzzy scoring with weight boosting.
 *
 * @param {Array} items - List of items to search
 * @param {string} query - Query string
 * @param {Array<string|Object>} keys - Item properties to index
 * @param {Object} [options={}] - Search configuration options
 * @returns {Array} Filtered and ranked search results
 */
export const getRouteSearchResults = (items, query, keys, options = {}) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const {
    filters = {},
    weights = {},
    enableCache = true,
    minQueryLength = 1,
    fuseOptions = {},
    sortByScore = true,
  } = options;

  // Apply non-text attribute filters first to reduce dataset size
  const filteredItems = applyFilters(items, filters);

  const tokens = getSearchTokens(query);
  if (tokens.length < minQueryLength) {
    return filteredItems;
  }

  // Check cache hit
  const cacheKey = globalSearchCache.generateKey(query, keys, filters, options);
  if (enableCache) {
    const cachedResults = globalSearchCache.get(cacheKey);
    if (cachedResults) return cachedResults;
  }

  const normalizedQuery = tokens.join(" ");

  // Initialize Fuse.js instance with keys and weights
  const configuredKeys = keys.map((key) => {
    if (typeof key === "object") return key;
    return {
      name: key,
      weight: weights[key] || 1,
    };
  });

  const fuse = new Fuse(filteredItems, {
    ...DEFAULT_FUSE_OPTIONS,
    ...fuseOptions,
    keys: configuredKeys,
  });

  const fuseResults = fuse.search(query);
  const fuseMatchedMap = new Map();

  fuseResults.forEach((result) => {
    fuseMatchedMap.set(result.item, {
      item: result.item,
      fuseScore: result.score || 0,
      matches: result.matches || [],
    });
  });

  const rankedResults = [];

  filteredItems.forEach((item) => {
    const fuseData = fuseMatchedMap.get(item);
    const searchableText = getSearchableText(item, keys);

    let matchType = null;
    let boostScore = 0;

    // Direct exact substring match (highest priority)
    if (searchableText.includes(normalizedQuery)) {
      matchType = "exact";
      boostScore += 100;
    } else if (tokens.every((token) => searchableText.includes(token))) {
      // All tokens present (AND match)
      matchType = "token_all";
      boostScore += 50;
    } else if (tokens.some((token) => searchableText.includes(token))) {
      // Partial tokens present (OR match)
      matchType = "token_partial";
      boostScore += 20;
    } else if (fuseData) {
      matchType = "fuzzy";
      boostScore += (1 - fuseData.fuseScore) * 30;
    }

    if (matchType) {
      const computedScore = boostScore + (fuseData ? (1 - fuseData.fuseScore) * 10 : 0);
      rankedResults.push({
        item,
        score: computedScore,
        matchType,
        highlights: options.includeHighlights
          ? highlightMatches(searchableText, query)
          : undefined,
      });
    }
  });

  // Sort by calculated rank score descending
  if (sortByScore) {
    rankedResults.sort((a, b) => b.score - a.score);
  }

  const finalResults = rankedResults.map((r) => (options.returnMetadata ? r : r.item));

  if (enableCache) {
    globalSearchCache.set(cacheKey, finalResults);
  }

  return finalResults;
};

// ============================================================================
// IN-MEMORY INDEXING CLASS
// ============================================================================

export class SearchIndex {
  /**
   * @param {Array} items Initial items
   * @param {string[]} keys Field keys to index
   * @param {Object} options Default index options
   */
  constructor(items = [], keys = [], options = {}) {
    this.items = [...items];
    this.keys = [...keys];
    this.options = options;
    this.isDirty = true;
    this.fuseInstance = null;
    this.vocabulary = new Set();
  }

  setItems(newItems) {
    this.items = [...newItems];
    this.isDirty = true;
    this.rebuildIndex();
  }

  addItem(item) {
    this.items.push(item);
    this.isDirty = true;
  }

  removeItem(predicate) {
    this.items = this.items.filter((item) => !predicate(item));
    this.isDirty = true;
  }

  rebuildIndex() {
    if (!this.isDirty) return;

    this.vocabulary.clear();
    this.items.forEach((item) => {
      const text = getSearchableText(item, this.keys);
      const tokens = getSearchTokens(text);
      tokens.forEach((t) => this.vocabulary.add(t));
    });

    this.fuseInstance = new Fuse(this.items, {
      ...DEFAULT_FUSE_OPTIONS,
      ...this.options.fuseOptions,
      keys: this.keys,
    });

    this.isDirty = false;
    globalSearchCache.clear();
  }

  search(query, searchOptions = {}) {
    if (this.isDirty) {
      this.rebuildIndex();
    }

    return getRouteSearchResults(this.items, query, this.keys, {
      ...this.options,
      ...searchOptions,
    });
  }

  /**
   * Returns prefix autocomplete word suggestions based on vocabulary.
   * @param {string} prefix
   * @param {number} [limit=5]
   * @returns {string[]}
   */
  getSuggestions(prefix, limit = 5) {
    const cleanPrefix = normalizeSearchText(prefix);
    if (!cleanPrefix) return [];

    if (this.isDirty) {
      this.rebuildIndex();
    }

    const matches = [];
    for (const word of this.vocabulary) {
      if (word.startsWith(cleanPrefix)) {
        matches.push(word);
        if (matches.length >= limit) break;
      }
    }

    return matches;
  }
}

// ============================================================================
// PAGINATION & GROUPING HELPERS
// ============================================================================

/**
 * Paginates an array of search results with page metadata.
 * @param {Array} items
 * @param {number} [page=1]
 * @param {number} [pageSize=10]
 * @returns {Object} Paginated payload
 */
export const paginateSearchResults = (items = [], page = 1, pageSize = 10) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / safePageSize);

  const startIndex = (safePage - 1) * safePageSize;
  const paginatedItems = items.slice(startIndex, startIndex + safePageSize);

  return {
    data: paginatedItems,
    pagination: {
      currentPage: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
};

/**
 * Groups search results by a specified field key (e.g. "type" or "category").
 * @param {Array} items
 * @param {string} groupByKey
 * @returns {Object} Items categorized by group
 */
export const groupSearchResults = (items = [], groupByKey) => {
  if (!Array.isArray(items) || !groupByKey) return { default: items || [] };

  return items.reduce((acc, item) => {
    const groupVal = getNestedFieldValue(item, groupByKey) || "Uncategorized";
    const groupKeyStr = String(groupVal);

    if (!acc[groupKeyStr]) {
      acc[groupKeyStr] = [];
    }
    acc[groupKeyStr].push(item);
    return acc;
  }, {});
};

// ============================================================================
// SEARCH ANALYTICS & QUERY TRACKER
// ============================================================================

class SearchAnalyticsTracker {
  constructor(maxHistory = 50) {
    this.history = [];
    this.queryCounts = new Map();
    this.maxHistory = maxHistory;
  }

  track(query, resultCount = 0) {
    const normalized = normalizeSearchText(query);
    if (!normalized) return;

    this.queryCounts.set(normalized, (this.queryCounts.get(normalized) || 0) + 1);

    this.history.unshift({
      query: normalized,
      resultCount,
      timestamp: new Date().toISOString(),
    });

    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
  }

  getRecentSearches(limit = 10) {
    return this.history.slice(0, limit);
  }

  getTopQueries(limit = 5) {
    return Array.from(this.queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  clearHistory() {
    this.history = [];
    this.queryCounts.clear();
  }
}

export const searchAnalytics = new SearchAnalyticsTracker();