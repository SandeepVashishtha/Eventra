import Fuse from "fuse.js";

/**
 * Normalizes text for searching: lowercase, remove accents, and strip special chars.
 */
export const normalizeSearchText = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeSearchText).join(" ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

/**
 * Performs a fuzzy search using Fuse.js with weighted keys.
 * 
 * @param {Array} items - List of objects to search through
 * @param {string} query - Search query
 * @param {Array|Object} keys - Keys to search in, optionally with weights
 * @param {Object} options - Fuse.js options
 */
export const getRouteSearchResults = (items, query, keys, options = {}) => {
  if (!query || query.trim() === "") {
    return items;
  }

  const defaultKeys = [
    { name: "title", weight: 0.7 },
    { name: "category", weight: 0.5 },
    { name: "tags", weight: 0.4 },
    { name: "description", weight: 0.1 },
  ];

  const fuse = new Fuse(items, {
    keys: keys || defaultKeys,
    threshold: 0.4,
    distance: 100,
    ignoreLocation: true,
    findAllMatches: true,
    includeScore: true,
    useExtendedSearch: true,
    ...options,
  });

  const results = fuse.search(query);
  
  // Return just the items, sorted by Fuse.js score (lower is better)
  return results.map(result => ({
    ...result.item,
    _searchScore: result.score,
  }));
};
