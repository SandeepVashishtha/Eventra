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
   * Strips trailing 4-digit year tokens (1900–2099) from a normalized query
   * string so that searches like "Hackathon 2025" still match titles that do
   * not include the year (e.g. "Hackathon").
   *
   * Only trailing years are removed — a year embedded in the middle of a query
   * ("2024 AI Summit") is left intact so it can still contribute to matching.
   *
   * @param {string} normalizedText - Already-normalized (lowercase, no accents) query
   * @returns {string} Query with any trailing year token removed
   */
  export const stripTrailingYearTokens = (normalizedText) => {
    // Match one or more trailing year tokens separated by whitespace, e.g.
    // "hackathon 2025", "conference 2024 2025" → "hackathon", "conference"
    return normalizedText.replace(/(\s+(?:19|20)\d{2})+$/, "").trim();
  };

/**
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

    // FIX (#7229): Strip trailing year tokens so "Hackathon 2025" matches
    // stored titles that do not include the year (e.g. "Hackathon").
    // The preprocessed query is used for both Fuse and token matching;
    // the raw query is no longer passed to Fuse directly.
    const preprocessedQuery = stripTrailingYearTokens(normalizedQuery);

    // If stripping left an empty string (e.g. query was just "2025"), fall
    // back to the full normalized query so we still return some results.
    const searchQuery = preprocessedQuery || normalizedQuery;

    const queryTokens = searchQuery.split(" ").filter(Boolean);

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

    const fuseResults = fuse.search(searchQuery).map((result) => ({
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