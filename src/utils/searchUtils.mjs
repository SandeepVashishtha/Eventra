import Fuse from "fuse.js";

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

const getSearchableText = (item, keys) =>
  keys.map((key) => normalizeSearchText(item[key])).filter(Boolean).join(" ");

const getSearchTokens = (query) =>
  normalizeSearchText(query).split(" ").filter(Boolean);

export const getRouteSearchResults = (items, query, keys, options = {}) => {
  const tokens = getSearchTokens(query);

  if (tokens.length === 0) {
    return items;
  }

  const normalizedQuery = tokens.join(" ");
  const fuse = new Fuse(items, {
    keys,
    threshold: 0.4,
    ignoreLocation: true,
    ...options,
  });
  const fuseMatches = new Set(fuse.search(query).map((result) => result.item));

  return items.filter((item) => {
    if (fuseMatches.has(item)) {
      return true;
    }

    const searchableText = getSearchableText(item, keys);

    if (searchableText.includes(normalizedQuery)) {
      return true;
    }

    return tokens.every((token) => searchableText.includes(token));
  });
};
