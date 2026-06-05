import Fuse from "fuse.js";

const fuseCache = new WeakMap();

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
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }

  if (!query || query.trim() === "") {
    return items;
  }

  const defaultKeys = [
    { name: "title", weight: 0.7 },
    { name: "category", weight: 0.5 },
    { name: "tags", weight: 0.4 },
    { name: "description", weight: 0.1 },
  ];

  const searchKeys = keys || defaultKeys;

  const getKeyName = (key) => (typeof key === "string" ? key : key.name);

  const getSearchableValue = (item, key) => {
    const keyName = getKeyName(key);
    if (!keyName) return "";

    return keyName.split(".").reduce((value, part) => {
      if (value === null || value === undefined) return "";
      return value[part];
    }, item);
  };

   const normalizedQuery = normalizeSearchText(query);
   const queryTokens = normalizedQuery.split(" ").filter(Boolean);

   // Get or create Fuse instance for this items array
   let fuse = fuseCache.get(items);
   if (!fuse) {
     fuse = new Fuse(items, {
       keys: searchKeys,
       threshold: 0.4,
       distance: 100,
       ignoreLocation: true,
       findAllMatches: true,
       includeScore: true,
       useExtendedSearch: true,
       ...options,
     });
     fuseCache.set(items, fuse);
   }

   const fuseResults = fuse.search(query).map((result) => ({
     ...result.item,
     _searchScore: result.score,
   }));

  const matchedIds = new Set(fuseResults.map((item) => item.id));

  const tokenResults = items
    .filter((item) => {
      if (matchedIds.has(item.id)) return false;

      const combinedText = normalizeSearchText(
        searchKeys.map((key) => getSearchableValue(item, key)).join(" ")
      );

      return queryTokens.every((token) => combinedText.includes(token));
    })
    .map((item) => ({
      ...item,
      _searchScore: 1,
    }));

  return [...fuseResults, ...tokenResults];
};