import { normalizeEventFilterConfig } from "./eventFilterPresets.js";

export const FILTER_SUGGESTIONS_STORAGE_KEY = "eventra:filter-suggestions:v1";

const MAX_HISTORY_ITEMS = 30;
const RECENCY_WINDOW_MS = 1000 * 60 * 60 * 24 * 21;

const CATEGORY_LABELS = {
  "web-development": "Web Development",
  "ai-ml": "AI/ML",
  "devops-cloud": "DevOps & Cloud",
  "web3-blockchain": "Web3 & Blockchain",
  mobile: "Mobile Dev",
  "design-ux": "Design & UX",
  hackathons: "Hackathons",
  "tech talks": "Tech Talks",
  cultural: "Cultural & Networking",
};

const CATEGORY_ALIASES = {
  "ai and machine learning": "ai-ml",
  "ai machine learning": "ai-ml",
  artificialintelligence: "ai-ml",
  "web development": "web-development",
  frontend: "web-development",
  backend: "web-development",
  react: "web-development",
  "devops cloud": "devops-cloud",
  cloud: "devops-cloud",
  web3: "web3-blockchain",
  blockchain: "web3-blockchain",
  design: "design-ux",
  ux: "design-ux",
  networking: "cultural",
  cultural: "cultural",
  hackathon: "hackathons",
  hackathons: "hackathons",
};

const TYPE_LABELS = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
  free: "Free Events",
  upcoming: "Upcoming",
  live: "Live Now",
};

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

export const normalizeSuggestionText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const toSlug = (value) => normalizeSuggestionText(value).replace(/\s+/g, "-");

const getNowMs = (now = Date.now()) =>
  now instanceof Date ? now.getTime() : Number(now) || Date.now();

const createEmptyHistory = () => ({
  filters: [],
  searches: [],
  categories: [],
  locations: [],
  eventTypes: [],
  combinations: [],
  interactions: [],
});

const sortHistoryItems = (items) =>
  [...items].sort((a, b) => {
    const scoreDelta = (b.count || 0) - (a.count || 0);
    if (scoreDelta !== 0) return scoreDelta;
    return (b.lastUsed || 0) - (a.lastUsed || 0);
  });

const upsertHistoryItem = (items, key, patch = {}, now = Date.now(), increment = 1) => {
  if (!key) return items;

  const nowMs = getNowMs(now);
  const existing = items.find((item) => item.key === key);
  if (existing) {
    existing.count = (existing.count || 0) + increment;
    existing.lastUsed = nowMs;
    Object.assign(existing, patch);
    return sortHistoryItems(items).slice(0, MAX_HISTORY_ITEMS);
  }

  return sortHistoryItems([
    ...items,
    {
      key,
      count: increment,
      firstUsed: nowMs,
      lastUsed: nowMs,
      ...patch,
    },
  ]).slice(0, MAX_HISTORY_ITEMS);
};

export const normalizeSuggestionHistory = (history = {}) => {
  const empty = createEmptyHistory();

  if (!history || typeof history !== "object" || Array.isArray(history)) {
    return empty;
  }

  return Object.keys(empty).reduce((normalized, key) => {
    normalized[key] = Array.isArray(history[key])
      ? history[key]
          .filter((item) => item && typeof item === "object" && item.key)
          .map((item) => ({
            ...item,
            key: String(item.key),
            count: Math.max(Number(item.count) || 0, 0),
            lastUsed: Number(item.lastUsed) || 0,
            firstUsed: Number(item.firstUsed) || Number(item.lastUsed) || 0,
          }))
          .slice(0, MAX_HISTORY_ITEMS)
      : [];
    return normalized;
  }, {});
};

export const readSuggestionHistory = (
  storage = globalThis.localStorage,
  key = FILTER_SUGGESTIONS_STORAGE_KEY
) => {
  if (!storage?.getItem) return createEmptyHistory();

  try {
    const raw = storage.getItem(key);
    if (!raw) return createEmptyHistory();
    return normalizeSuggestionHistory(JSON.parse(raw));
  } catch {
    storage.removeItem?.(key);
    return createEmptyHistory();
  }
};

export const writeSuggestionHistory = (
  history,
  storage = globalThis.localStorage,
  key = FILTER_SUGGESTIONS_STORAGE_KEY
) => {
  const normalized = normalizeSuggestionHistory(history);
  storage?.setItem?.(key, JSON.stringify(normalized));
  return normalized;
};

const getCategoryKey = (category) => {
  const normalized = normalizeSuggestionText(category);
  const compact = normalized.replace(/\s+/g, "");
  return CATEGORY_ALIASES[normalized] || CATEGORY_ALIASES[compact] || toSlug(category);
};

const getLocationLabel = (event) => {
  const location = event?.location;
  if (typeof location === "string") return location;
  if (location && typeof location === "object") {
    return location.city || location.name || location.venue || location.country || "";
  }
  return event?.venue || event?.city || event?.eventMode || event?.mode || "";
};

const getEventMode = (event) => toSlug(event?.eventMode || event?.mode || "");

export const recordFilterActivity = (history = {}, filters = {}, now = Date.now()) => {
  const next = normalizeSuggestionHistory(history);
  const normalizedFilters = normalizeEventFilterConfig(filters);
  const advanced = normalizedFilters.advancedFilters || {};

  if (normalizedFilters.searchQuery.trim()) {
    const search = normalizedFilters.searchQuery.trim();
    next.searches = upsertHistoryItem(
      next.searches,
      normalizeSuggestionText(search),
      { label: search, filters: { ...normalizedFilters, searchQuery: search } },
      now
    );
  }

  if (normalizedFilters.categoryFilter !== "all") {
    const categoryKey = normalizedFilters.categoryFilter;
    next.categories = upsertHistoryItem(
      next.categories,
      categoryKey,
      {
        label: CATEGORY_LABELS[categoryKey] || categoryKey,
        filters: { ...normalizeEventFilterConfig(), categoryFilter: categoryKey },
      },
      now
    );
  }

  (advanced.categories || []).forEach((category) => {
    const categoryKey = getCategoryKey(category);
    next.categories = upsertHistoryItem(
      next.categories,
      categoryKey,
      {
        label: CATEGORY_LABELS[categoryKey] || category,
        filters: { ...normalizeEventFilterConfig(), categoryFilter: categoryKey },
      },
      now
    );
  });

  if (advanced.location) {
    next.locations = upsertHistoryItem(
      next.locations,
      normalizeSuggestionText(advanced.location),
      {
        label: advanced.location,
        filters: {
          ...normalizeEventFilterConfig(),
          advancedFilters: { location: advanced.location },
        },
      },
      now
    );
  }

  (advanced.modes || []).forEach((mode) => {
    const modeKey = toSlug(mode);
    next.eventTypes = upsertHistoryItem(
      next.eventTypes,
      modeKey,
      {
        label: TYPE_LABELS[modeKey] || mode,
        filters: {
          ...normalizeEventFilterConfig(),
          advancedFilters: { modes: [modeKey] },
        },
      },
      now
    );
  });

  if (advanced.priceRange?.min === 0 && advanced.priceRange?.max === 0) {
    next.eventTypes = upsertHistoryItem(
      next.eventTypes,
      "free",
      {
        label: "Free Events",
        filters: {
          ...normalizeEventFilterConfig(),
          advancedFilters: { priceRange: { min: 0, max: 0 } },
        },
      },
      now
    );
  }

  if (normalizedFilters.filterType !== "all") {
    const statusKey = normalizedFilters.filterType;
    next.eventTypes = upsertHistoryItem(
      next.eventTypes,
      statusKey,
      {
        label: TYPE_LABELS[statusKey] || statusKey,
        filters: { ...normalizeEventFilterConfig(), filterType: statusKey },
      },
      now
    );
  }

  const combinationKey = JSON.stringify(normalizedFilters);
  const hasMeaningfulCombination =
    normalizedFilters.searchQuery ||
    normalizedFilters.categoryFilter !== "all" ||
    normalizedFilters.filterType !== "all" ||
    advanced.location ||
    (advanced.categories || []).length ||
    (advanced.modes || []).length ||
    advanced.priceRange;

  if (hasMeaningfulCombination) {
    next.combinations = upsertHistoryItem(
      next.combinations,
      combinationKey,
      {
        label: buildCombinationLabel(normalizedFilters),
        filters: normalizedFilters,
      },
      now
    );
  }

  return next;
};

export const recordEventInteraction = (
  history = {},
  event = {},
  action = "view",
  now = Date.now()
) => {
  const next = normalizeSuggestionHistory(history);
  const weight =
    action === "registration" ? 4 : action === "bookmark" ? 3 : action === "click" ? 2 : 1;
  const categoryKey = getCategoryKey(event?.category || event?.type);
  const location = getLocationLabel(event);
  const mode = getEventMode(event);

  if (categoryKey && categoryKey !== "all") {
    next.categories = upsertHistoryItem(
      next.categories,
      categoryKey,
      {
        label: CATEGORY_LABELS[categoryKey] || event?.category || event?.type,
        filters: { ...normalizeEventFilterConfig(), categoryFilter: categoryKey },
      },
      now,
      weight
    );
  }

  if (location) {
    next.locations = upsertHistoryItem(
      next.locations,
      normalizeSuggestionText(location),
      {
        label: location,
        filters: {
          ...normalizeEventFilterConfig(),
          advancedFilters: { location },
        },
      },
      now,
      weight
    );
  }

  if (mode) {
    next.eventTypes = upsertHistoryItem(
      next.eventTypes,
      mode,
      {
        label: TYPE_LABELS[mode] || mode,
        filters: {
          ...normalizeEventFilterConfig(),
          advancedFilters: { modes: [mode] },
        },
      },
      now,
      weight
    );
  }

  next.interactions = upsertHistoryItem(
    next.interactions,
    `${action}:${event?.id || event?.title || categoryKey || location}`,
    { action, label: event?.title || event?.name || categoryKey || location },
    now,
    weight
  );

  return next;
};

export const recordVisibleEventSignals = (
  history = {},
  events = [],
  now = Date.now(),
  limit = 12
) => {
  return (Array.isArray(events) ? events.slice(0, limit) : []).reduce(
    (next, event) => recordEventInteraction(next, event, "view", now),
    normalizeSuggestionHistory(history)
  );
};

const getRecencyScore = (lastUsed, now = Date.now()) => {
  if (!lastUsed) return 0;
  const age = Math.max(getNowMs(now) - lastUsed, 0);
  return clamp(1 - age / RECENCY_WINDOW_MS, 0, 1);
};

const scoreHistoryItem = (item, now = Date.now(), base = 10) =>
  Math.round(
    base + Math.log2((item.count || 0) + 1) * 10 + getRecencyScore(item.lastUsed, now) * 18
  );

const buildSuggestion = (item, kind, now = Date.now(), base = 10) => ({
  id: `${kind}:${item.key}`,
  kind,
  label: item.label || item.key,
  filters: normalizeEventFilterConfig(item.filters),
  score: scoreHistoryItem(item, now, base),
  reason: item.count > 1 ? `Used ${item.count} times recently` : "Based on your recent activity",
});

const addUniqueSuggestion = (suggestions, suggestion) => {
  const key = JSON.stringify(suggestion.filters);
  if (suggestions.some((item) => item._key === key)) return suggestions;
  suggestions.push({ ...suggestion, _key: key });
  return suggestions;
};

const getPopularFromEvents = (events, getter, kind, toFilters, limit = 4) => {
  const counts = new Map();
  (Array.isArray(events) ? events : []).forEach((event) => {
    const raw = getter(event);
    const key = kind === "category" ? getCategoryKey(raw) : normalizeSuggestionText(raw);
    if (!key) return;
    const current = counts.get(key) || { key, label: raw, count: 0 };
    current.count += 1;
    counts.set(key, current);
  });

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => ({
      id: `fallback:${kind}:${item.key}`,
      kind,
      label:
        kind === "category"
          ? CATEGORY_LABELS[item.key] || item.label || item.key
          : item.label || item.key,
      filters: normalizeEventFilterConfig(toFilters(item)),
      score: 20 + item.count,
      reason: "Popular across upcoming events",
    }));
};

export const getFallbackSuggestions = (events = []) => {
  const suggestions = [];

  getPopularFromEvents(
    events,
    (event) => event?.category || event?.type,
    "category",
    (item) => ({ categoryFilter: item.key })
  ).forEach((suggestion) => addUniqueSuggestion(suggestions, suggestion));

  getPopularFromEvents(
    events,
    getLocationLabel,
    "location",
    (item) => ({ advancedFilters: { location: item.label } }),
    3
  ).forEach((suggestion) => addUniqueSuggestion(suggestions, suggestion));

  ["upcoming", "online", "free"].forEach((key) => {
    const filters =
      key === "upcoming"
        ? { filterType: "upcoming" }
        : key === "online"
          ? { advancedFilters: { modes: ["online"] } }
          : { advancedFilters: { priceRange: { min: 0, max: 0 } } };
    addUniqueSuggestion(suggestions, {
      id: `fallback:type:${key}`,
      kind: key === "upcoming" ? "dateRange" : "eventType",
      label: TYPE_LABELS[key],
      filters: normalizeEventFilterConfig(filters),
      score: 18,
      reason: "Popular starter filter",
    });
  });

  return suggestions.map((suggestion) => {
    const cleanSuggestion = { ...suggestion };
    delete cleanSuggestion._key;
    return cleanSuggestion;
  });
};

export const buildCombinationLabel = (filters = {}) => {
  const normalized = normalizeEventFilterConfig(filters);
  const advanced = normalized.advancedFilters || {};
  const labels = [];

  if (normalized.categoryFilter !== "all") {
    labels.push(CATEGORY_LABELS[normalized.categoryFilter] || normalized.categoryFilter);
  }
  if (normalized.filterType !== "all")
    labels.push(TYPE_LABELS[normalized.filterType] || normalized.filterType);
  if (advanced.location) labels.push(advanced.location);
  if ((advanced.modes || []).length)
    labels.push(advanced.modes.map((mode) => TYPE_LABELS[mode] || mode).join(" + "));
  if (advanced.priceRange?.min === 0 && advanced.priceRange?.max === 0) labels.push("Free");
  if (normalized.searchQuery) labels.push(`Search: ${normalized.searchQuery}`);

  return labels.length ? labels.join(" • ") : "Saved filter pattern";
};

export const generateFilterSuggestions = ({
  history = {},
  events = [],
  presets = [],
  now = Date.now(),
  limit = 10,
} = {}) => {
  const normalizedHistory = normalizeSuggestionHistory(history);
  const suggestions = [];

  normalizedHistory.categories
    .map((item) => buildSuggestion(item, "category", now, 18))
    .forEach((suggestion) => addUniqueSuggestion(suggestions, suggestion));

  normalizedHistory.locations
    .map((item) => buildSuggestion(item, "location", now, 16))
    .forEach((suggestion) => addUniqueSuggestion(suggestions, suggestion));

  normalizedHistory.eventTypes
    .map((item) =>
      buildSuggestion(item, item.key === "upcoming" ? "dateRange" : "eventType", now, 14)
    )
    .forEach((suggestion) => addUniqueSuggestion(suggestions, suggestion));

  normalizedHistory.combinations
    .map((item) => buildSuggestion(item, "combination", now, 20))
    .forEach((suggestion) => addUniqueSuggestion(suggestions, suggestion));

  presets.forEach((preset) => {
    addUniqueSuggestion(suggestions, {
      id: `preset:${preset.id}`,
      kind: "preset",
      label: preset.name,
      filters: normalizeEventFilterConfig(preset.filters),
      score: 24,
      reason: "Saved filter preset",
    });
  });

  if (suggestions.length < limit) {
    getFallbackSuggestions(events).forEach((suggestion) =>
      addUniqueSuggestion(suggestions, suggestion)
    );
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((suggestion) => {
      const cleanSuggestion = { ...suggestion };
      delete cleanSuggestion._key;
      return cleanSuggestion;
    });
};
