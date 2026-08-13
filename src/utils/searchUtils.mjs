/* eslint-disable no-console */
import Fuse from "fuse.js";

/**
 * Enterprise Hybrid Client-Side Search, Fuzzy Matching & Ranking Engine
 *
 * Combines Fuse.js fuzzy matching with exact substring matching, multi-token AND evaluation,
 * deep nested property resolution, query stopword stripping, relevance scoring, and string highlighting.
 */

// ============================================================================
// 1. Constants & Configuration Defaults
// ============================================================================

const COMMON_STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "were", "will", "with", "or", "this", "but", "they",
]);

const DEFAULT_FUSE_OPTIONS = {
  threshold: 0.35,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  ignoreLocation: true,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
};

// Internal cache for Fuse instances to prevent expensive re-indexing on every keystroke
const fuseCache = new WeakMap();

// ============================================================================
// 2. Normalization, Tokenization & Property Resolution
// ============================================================================

/**
 * Normalizes input text by lowercasing, stripping diacritics/accents, and removing special characters.
 * Handles nested arrays recursively.
 *
 * @param {unknown} value - Text, array, or object value to normalize.
 * @returns {string} Clean normalized string.
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
 * Safely extracts a nested property value using dot-notation path (e.g. "user.profile.name").
 *
 * @param {Object} obj - Source object.
 * @param {string} path - Dot-notation path string.
 * @returns {unknown} Resolved property value.
 */
export const getNestedProperty = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

/**
 * Extracts searchable text across multiple object keys (supports dot notation).
 *
 * @param {Object} item - Data item.
 * @param {Array<string>} keys - Array of property keys or dot paths.
 * @returns {string} Concatenated normalized string.
 */
export const getSearchableText = (item, keys) => {
  return keys
    .map((key) => normalizeSearchText(getNestedProperty(item, key) ?? item[key]))
    .filter(Boolean)
    .join(" ");
};

/**
 * Converts a raw search query into normalized search tokens.
 *
 * @param {string} query - Raw query string.
 * @param {boolean} [stripStopwords=false] - Whether to remove common stopwords.
 * @returns {Array<string>} Array of token strings.
 */
export const getSearchTokens = (query, stripStopwords = false) => {
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
  if (!stripStopwords) return tokens;
  return tokens.filter((token) => !COMMON_STOPWORDS.has(token));
};

// ============================================================================
// 3. Relevance Scoring & Indexing
// ============================================================================

/**
 * Calculates a custom relevance score for an item based on match exactness.
 * Lower score indicates higher relevance (0 = exact match).
 *
 * @param {string} searchableText - Item's normalized text representation.
 * @param {string} normalizedQuery - Normalized full query string.
 * @param {Array<string>} tokens - Query token array.
 * @param {number} [fuseScore=1.0] - Base score from Fuse.js (0 = perfect, 1 = worst).
 * @returns {number} Boosted relevance score.
 */
function calculateRelevanceScore(searchableText, normalizedQuery, tokens, fuseScore = 1.0) {
  let score = fuseScore;

  // Exact full match bonus
  if (searchableText === normalizedQuery) {
    score -= 0.6;
  }
  // Starts-with prefix match bonus
  else if (searchableText.startsWith(normalizedQuery)) {
    score -= 0.4;
  }
  // Contains full query substring bonus
  else if (searchableText.includes(normalizedQuery)) {
    score -= 0.25;
  }

  // Token coverage bonus
  const tokenMatches = tokens.filter((t) => searchableText.includes(t)).length;
  if (tokens.length > 0) {
    const coverageRatio = tokenMatches / tokens.length;
    score -= coverageRatio * 0.15;
  }

  return Math.max(0, score);
}

/**
 * Retrieves or creates a memoized Fuse instance for an item dataset.
 *
 * @param {Array<Object>} items - Target dataset.
 * @param {Array<string>} keys - Search keys.
 * @param {Object} options - Fuse configuration options.
 * @returns {Fuse} Cached or new Fuse instance.
 */
function getMemoizedFuseInstance(items, keys, options) {
  let itemCache = fuseCache.get(items);
  if (!itemCache) {
    itemCache = new Map();
    fuseCache.set(items, itemCache);
  }

  const cacheKey = JSON.stringify({ keys, options });
  if (itemCache.has(cacheKey)) {
    return itemCache.get(cacheKey);
  }

  const fuseInstance = new Fuse(items, { ...DEFAULT_FUSE_OPTIONS, keys, ...options });
  itemCache.set(cacheKey, fuseInstance);
  return fuseInstance;
}

// ============================================================================
// 4. Primary Search APIs
// ============================================================================

/**
 * Performs a hybrid search over an array of objects combining Fuse.js fuzzy
 * matching, exact substring matching, multi-token AND matching, and scoring.
 *
 * @param {Array<Object>} items - Array of items to search through.
 * @param {string} query - Raw user search input.
 * @param {Array<string>} keys - Array of object property paths to search.
 * @param {Object} [options={}] - Search & Fuse.js options.
 * @param {boolean} [options.stripStopwords=false] - Remove stopwords from query tokens.
 * @param {number} [options.limit] - Max number of results to return.
 * @returns {Array<Object>} Ranked array of matching items.
 */
export const getRouteSearchResults = (items, query, keys, options = {}) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (!query || typeof query !== "string") return items;

  const { stripStopwords = false, limit, ...fuseOptions } = options;
  const tokens = getSearchTokens(query, stripStopwords);

  const normalizedQuery = tokens.join(" ");
  const fuse = getMemoizedFuseInstance(items, keys, fuseOptions);
  const fuseResults = fuse.search(query);

  const matchedMap = new Map();

  // 1. Process Fuse.js fuzzy matches
  fuseResults.forEach((result) => {
    const item = result.item;
    const searchableText = getSearchableText(item, keys);
    const score = calculateRelevanceScore(searchableText, normalizedQuery, tokens, result.score ?? 0.5);
    matchedMap.set(item, { item, score, matches: result.matches });
  });

  // 2. Process exact / token matches for items missed by Fuse threshold
  items.forEach((item) => {
    if (matchedMap.has(item)) return;

    const searchableText = getSearchableText(item, keys);
    const containsFullQuery = searchableText.includes(normalizedQuery);
    const matchesAllTokens = tokens.every((token) => searchableText.includes(token));

    if (containsFullQuery || matchesAllTokens) {
      const score = calculateRelevanceScore(searchableText, normalizedQuery, tokens, 0.4);
      matchedMap.set(item, { item, score, matches: [] });
    }
  });

  // 3. Sort by relevance score ascending (0 = best)
  const rankedResults = Array.from(matchedMap.values())
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.item);

  return typeof limit === "number" && limit > 0 ? rankedResults.slice(0, limit) : rankedResults;
};

/**
 * Advanced search execution returning match metadata, highlight ranges, and relevance scores.
 *
 * @param {Array<Object>} items - Array of items.
 * @param {string} query - Raw search query.
 * @param {Array<string>} keys - Target keys.
 * @param {Object} [options={}] - Search options.
 * @returns {Array<{item: Object, score: number, matches: Array<Object>}>} Detailed search output.
 */
export const searchWithDetails = (items, query, keys, options = {}) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (!query || typeof query !== "string") return items.map((item) => ({ item, score: 0, matches: [] }));

  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return items.map((item) => ({ item, score: 0, matches: [] }));

  const normalizedQuery = tokens.join(" ");
  const fuse = getMemoizedFuseInstance(items, keys, options);
  const fuseResults = fuse.search(query);

  const resultMap = new Map();

  fuseResults.forEach((res) => {
    const searchableText = getSearchableText(res.item, keys);
    const score = calculateRelevanceScore(searchableText, normalizedQuery, tokens, res.score ?? 0.5);
    resultMap.set(res.item, { item: res.item, score, matches: res.matches || [] });
  });

  items.forEach((item) => {
    if (resultMap.has(item)) return;

    const searchableText = getSearchableText(item, keys);
    if (tokens.every((t) => searchableText.includes(t))) {
      const score = calculateRelevanceScore(searchableText, normalizedQuery, tokens, 0.4);
      resultMap.set(item, { item, score, matches: [] });
    }
  });

  return Array.from(resultMap.values()).sort((a, b) => a.score - b.score);
};

// ============================================================================
// 5. Highlighting & Filtering Utilities
// ============================================================================

/**
 * Wraps matching query terms in a target text string with HTML tags for UI display.
 *
 * @param {string} text - Raw display text.
 * @param {string} query - Active search query.
 * @param {string} [tag="mark"] - HTML tag wrapper.
 * @returns {string} Highlighted HTML string.
 */
export const highlightMatches = (text, query, tag = "mark") => {
  if (!text || typeof text !== "string") return "";
  if (!query || typeof query !== "string") return text;

  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return text;

  const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.replace(pattern, `<${tag}>$1</${tag}>`);
};

export default getRouteSearchResults;
