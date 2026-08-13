/**
 * Utilities for managing recent event searches.
 *
 * Features:
 * - Save recent search queries
 * - Retrieve search history
 * - Reuse previous searches
 * - Delete individual searches
 * - Clear search history
 * - Remove duplicate queries
 * - Limit history size
 * - Optional localStorage persistence
 */

export const DEFAULT_MAX_RECENT_SEARCHES = 10;

export const DEFAULT_STORAGE_KEY =
  "eventra:recent-event-searches";

/**
 * Normalize a search query.
 */
export const normalizeSearchQuery = (
  query
) => {
  if (
    query === null ||
    query === undefined
  ) {
    return "";
  }

  return String(query)
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Check whether a query is valid.
 */
export const isValidSearchQuery = (
  query
) => {
  return (
    normalizeSearchQuery(query)
      .length > 0
  );
};

/**
 * Create a unique ID for a search entry.
 */
export const generateSearchId = () => {
  return `search-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

/**
 * Create a recent search object.
 */
export const createRecentSearch = (
  query,
  metadata = {}
) => {
  const normalizedQuery =
    normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return null;
  }

  const now =
    new Date().toISOString();

  return {
    id: generateSearchId(),
    query: normalizedQuery,
    searchedAt: now,
    ...metadata,
  };
};

/**
 * Compare two queries case-insensitively.
 */
export const searchQueriesMatch = (
  firstQuery,
  secondQuery
) => {
  const first =
    normalizeSearchQuery(
      firstQuery
    ).toLowerCase();

  const second =
    normalizeSearchQuery(
      secondQuery
    ).toLowerCase();

  return (
    Boolean(first) &&
    Boolean(second) &&
    first === second
  );
};

/**
 * Remove duplicate search entries.
 *
 * The newest occurrence is preserved.
 */
export const removeDuplicateSearches = (
  searches = []
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (
    let index = searches.length - 1;
    index >= 0;
    index -= 1
  ) {
    const search =
      searches[index];

    const query =
      normalizeSearchQuery(
        search?.query
      );

    if (!query) {
      continue;
    }

    const key =
      query.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.unshift({
      ...search,
      query,
    });
  }

  return result;
};

/**
 * Limit the number of stored searches.
 */
export const limitRecentSearches = (
  searches = [],
  maxSearches = DEFAULT_MAX_RECENT_SEARCHES
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  const limit = Math.max(
    0,
    Number(maxSearches) ||
      DEFAULT_MAX_RECENT_SEARCHES
  );

  return searches.slice(
    -limit
  );
};

/**
 * Sort searches from newest to oldest.
 */
export const sortRecentSearches = (
  searches = []
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  return [...searches].sort(
    (first, second) => {
      const firstTime =
        new Date(
          first?.searchedAt ||
            first?.createdAt ||
            0
        ).getTime();

      const secondTime =
        new Date(
          second?.searchedAt ||
            second?.createdAt ||
            0
        ).getTime();

      return secondTime - firstTime;
    }
  );
};

/**
 * Normalize a complete search history.
 */
export const normalizeRecentSearches = (
  searches = [],
  maxSearches = DEFAULT_MAX_RECENT_SEARCHES
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  const normalized =
    searches
      .map((search) => {
        if (
          typeof search ===
          "string"
        ) {
          return createRecentSearch(
            search
          );
        }

        if (
          !search ||
          typeof search !==
            "object"
        ) {
          return null;
        }

        const query =
          normalizeSearchQuery(
            search.query
          );

        if (!query) {
          return null;
        }

        return {
          ...search,
          id:
            search.id ||
            generateSearchId(),
          query,
          searchedAt:
            search.searchedAt ||
            search.createdAt ||
            new Date().toISOString(),
        };
      })
      .filter(Boolean);

  const unique =
    removeDuplicateSearches(
      normalized
    );

  return limitRecentSearches(
    sortRecentSearches(
      unique
    ),
    maxSearches
  );
};

/**
 * Add a query to recent searches.
 *
 * If the query already exists, it is moved
 * to the top rather than duplicated.
 */
export const addRecentSearch = (
  searches = [],
  query,
  options = {}
) => {
  const {
    maxSearches =
      DEFAULT_MAX_RECENT_SEARCHES,
    metadata = {},
  } = options;

  const normalizedQuery =
    normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return normalizeRecentSearches(
      searches,
      maxSearches
    );
  }

  const existing =
    Array.isArray(searches)
      ? searches.find((search) =>
          searchQueriesMatch(
            search?.query,
            normalizedQuery
          )
        )
      : null;

  const newSearch =
    createRecentSearch(
      normalizedQuery,
      {
        ...metadata,
        ...(existing || {}),
        id:
          existing?.id ||
          generateSearchId(),
        searchedAt:
          new Date().toISOString(),
      }
    );

  const remaining =
    Array.isArray(searches)
      ? searches.filter(
          (search) =>
            !searchQueriesMatch(
              search?.query,
              normalizedQuery
            )
        )
      : [];

  return limitRecentSearches(
    [newSearch, ...remaining],
    maxSearches
  );
};

/**
 * Find a recent search by ID.
 */
export const findRecentSearch = (
  searches = [],
  searchId
) => {
  if (!Array.isArray(searches)) {
    return null;
  }

  return (
    searches.find(
      (search) =>
        String(search?.id) ===
        String(searchId)
    ) || null
  );
};

/**
 * Find a recent search by query.
 */
export const findRecentSearchByQuery = (
  searches = [],
  query
) => {
  if (!Array.isArray(searches)) {
    return null;
  }

  return (
    searches.find((search) =>
      searchQueriesMatch(
        search?.query,
        query
      )
    ) || null
  );
};

/**
 * Delete one search by ID.
 */
export const deleteRecentSearch = (
  searches = [],
  searchId
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  return searches.filter(
    (search) =>
      String(search?.id) !==
      String(searchId)
  );
};

/**
 * Delete a search by query.
 */
export const deleteRecentSearchByQuery = (
  searches = [],
  query
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  return searches.filter(
    (search) =>
      !searchQueriesMatch(
        search?.query,
        query
      )
  );
};

/**
 * Clear all search history.
 */
export const clearRecentSearches = () => {
  return [];
};

/**
 * Check whether search history exists.
 */
export const hasRecentSearches = (
  searches = []
) => {
  return (
    Array.isArray(searches) &&
    searches.length > 0
  );
};

/**
 * Get the number of recent searches.
 */
export const getRecentSearchCount = (
  searches = []
) => {
  return Array.isArray(searches)
    ? searches.length
    : 0;
};

/**
 * Get only the query strings.
 */
export const getRecentSearchQueries = (
  searches = []
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  return searches
    .map((search) =>
      normalizeSearchQuery(
        search?.query
      )
    )
    .filter(Boolean);
};

/**
 * Get recent searches matching a
 * partial query.
 */
export const filterRecentSearches = (
  searches = [],
  query
) => {
  if (!Array.isArray(searches)) {
    return [];
  }

  const normalizedQuery =
    normalizeSearchQuery(
      query
    ).toLowerCase();

  if (!normalizedQuery) {
    return searches;
  }

  return searches.filter(
    (search) =>
      normalizeSearchQuery(
        search?.query
      )
        .toLowerCase()
        .includes(normalizedQuery)
  );
};

/**
 * Get the most recent searches.
 */
export const getRecentSearches = (
  searches = [],
  limit = DEFAULT_MAX_RECENT_SEARCHES
) => {
  return limitRecentSearches(
    sortRecentSearches(
      normalizeRecentSearches(
        searches,
        Number.MAX_SAFE_INTEGER
      )
    ),
    limit
  );
};

/**
 * Create a storage key for a user.
 */
export const getUserSearchStorageKey = (
  userId,
  baseKey = DEFAULT_STORAGE_KEY
) => {
  if (
    userId === null ||
    userId === undefined ||
    String(userId).trim() === ""
  ) {
    return baseKey;
  }

  return `${baseKey}:${String(
    userId
  ).trim()}`;
};

/**
 * Save recent searches to localStorage.
 */
export const saveRecentSearchesToStorage = (
  searches = [],
  options = {}
) => {
  if (
    typeof window ===
      "undefined" ||
    !window.localStorage
  ) {
    return false;
  }

  const {
    storageKey =
      DEFAULT_STORAGE_KEY,
    maxSearches =
      DEFAULT_MAX_RECENT_SEARCHES,
  } = options;

  try {
    const normalized =
      normalizeRecentSearches(
        searches,
        maxSearches
      );

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(
        normalized
      )
    );

    return true;
  } catch {
    return false;
  }
};

/**
 * Load recent searches from localStorage.
 */
export const loadRecentSearchesFromStorage = (
  options = {}
) => {
  if (
    typeof window ===
      "undefined" ||
    !window.localStorage
  ) {
    return [];
  }

  const {
    storageKey =
      DEFAULT_STORAGE_KEY,
    maxSearches =
      DEFAULT_MAX_RECENT_SEARCHES,
  } = options;

  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return normalizeRecentSearches(
      parsed,
      maxSearches
    );
  } catch {
    return [];
  }
};

/**
 * Remove recent search history from
 * localStorage.
 */
export const clearRecentSearchesFromStorage = (
  options = {}
) => {
  if (
    typeof window ===
      "undefined" ||
    !window.localStorage
  ) {
    return false;
  }

  const {
    storageKey =
      DEFAULT_STORAGE_KEY,
  } = options;

  try {
    window.localStorage.removeItem(
      storageKey
    );

    return true;
  } catch {
    return false;
  }
};

/**
 * Save a single query directly to
 * localStorage.
 */
export const saveRecentSearch = (
  query,
  options = {}
) => {
  const {
    storageKey =
      DEFAULT_STORAGE_KEY,
    maxSearches =
      DEFAULT_MAX_RECENT_SEARCHES,
    metadata = {},
  } = options;

  const existing =
    loadRecentSearchesFromStorage({
      storageKey,
      maxSearches,
    });

  const updated =
    addRecentSearch(
      existing,
      query,
      {
        maxSearches,
        metadata,
      }
    );

  const saved =
    saveRecentSearchesToStorage(
      updated,
      {
        storageKey,
        maxSearches,
      }
    );

  return {
    saved,
    searches: updated,
  };
};

/**
 * Delete one search directly from
 * localStorage.
 */
export const deleteRecentSearchFromStorage = (
  searchId,
  options = {}
) => {
  const {
    storageKey =
      DEFAULT_STORAGE_KEY,
    maxSearches =
      DEFAULT_MAX_RECENT_SEARCHES,
  } = options;

  const searches =
    loadRecentSearchesFromStorage({
      storageKey,
      maxSearches,
    });

  const updated =
    deleteRecentSearch(
      searches,
      searchId
    );

  const saved =
    saveRecentSearchesToStorage(
      updated,
      {
        storageKey,
        maxSearches,
      }
    );

  return {
    saved,
    searches: updated,
  };
};

/**
 * Delete a query directly from
 * localStorage.
 */
export const deleteRecentSearchQueryFromStorage = (
  query,
  options = {}
) => {
  const {
    storageKey =
      DEFAULT_STORAGE_KEY,
    maxSearches =
      DEFAULT_MAX_RECENT_SEARCHES,
  } = options;

  const searches =
    loadRecentSearchesFromStorage({
      storageKey,
      maxSearches,
    });

  const updated =
    deleteRecentSearchByQuery(
      searches,
      query
    );

  const saved =
    saveRecentSearchesToStorage(
      updated,
      {
        storageKey,
        maxSearches,
      }
    );

  return {
    saved,
    searches: updated,
  };
};

/**
 * Clear recent searches directly from
 * localStorage.
 */
export const clearRecentSearchHistory = (
  options = {}
) => {
  const {
    storageKey =
      DEFAULT_STORAGE_KEY,
  } = options;

  const cleared =
    clearRecentSearchesFromStorage({
      storageKey,
    });

  return {
    cleared,
    searches: [],
  };
};

/**
 * Build a search URL from a previous query.
 */
export const buildSearchUrl = (
  query,
  options = {}
) => {
  const {
    searchPath = "/events/search",
    parameter = "q",
    additionalParams = {},
  } = options;

  const normalizedQuery =
    normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return searchPath;
  }

  const params =
    new URLSearchParams();

  params.set(
    parameter,
    normalizedQuery
  );

  const safeAdditionalParams = additionalParams && typeof additionalParams === "object" ? additionalParams : {};

  Object.entries(
    safeAdditionalParams
  ).forEach(
    ([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        params.set(
          key,
          String(value)
        );
      }
    }
  );

  return `${searchPath}?${params.toString()}`;
};

/**
 * Reuse a previous search by returning
 * its query and optional navigation URL.
 */
export const reuseRecentSearch = (
  search,
  options = {}
) => {
  if (!search) {
    return null;
  }

  const query =
    normalizeSearchQuery(
      typeof search === "string"
        ? search
        : search.query
    );

  if (!query) {
    return null;
  }

  return {
    query,
    url: buildSearchUrl(
      query,
      options
    ),
    search:
      typeof search === "object"
        ? search
        : null,
  };
};

/**
 * Get a display-friendly relative time.
 */
export const getSearchTimeLabel = (
  searchedAt,
  now = new Date()
) => {
  if (!searchedAt) {
    return "";
  }

  const searchDate =
    new Date(searchedAt);

  if (
    Number.isNaN(
      searchDate.getTime()
    )
  ) {
    return "";
  }

  const currentDate =
    now instanceof Date
      ? now
      : new Date(now);

  const difference =
    Math.max(
      0,
      currentDate.getTime() -
        searchDate.getTime()
    );

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
    }
  ).format(searchDate);
};

/**
 * Get search history statistics.
 */
export const getSearchHistoryStats = (
  searches = []
) => {
  const normalized =
    normalizeRecentSearches(
      searches,
      Number.MAX_SAFE_INTEGER
    );

  const queries =
    getRecentSearchQueries(
      normalized
    );

  return {
    total:
      normalized.length,
    unique:
      new Set(
        queries.map((query) =>
          query.toLowerCase()
        )
      ).size,
    latest:
      normalized[0] || null,
    oldest:
      normalized[
        normalized.length - 1
      ] || null,
  };
};