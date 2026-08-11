import { logError, persistErrors } from "./errorLogger.js";

export const ERROR_CATEGORIES = {
  ROUTE: "route",
  API: "api",
  ASSET: "asset",
  NETWORK: "network",
  RUNTIME: "runtime",
  UNKNOWN: "unknown",
};

const ASSET_PATTERN = /chunk|loading css chunk|failed to fetch dynamically imported module|importing a module script|stylesheet|script error|image/i;
const ROUTE_PATTERN = /route|router|navigation|not found|404/i;
const NETWORK_PATTERN = /network|offline|failed to fetch|load failed|timeout|econnaborted/i;

const CATEGORY_COPY = {
  [ERROR_CATEGORIES.ROUTE]: {
    title: "We could not open this page",
    message: "The page did not load cleanly. You can go back, return home, or refresh to try this route again.",
    suggestion: "If you followed an old link, start from Home and navigate to the page again.",
  },
  [ERROR_CATEGORIES.API]: {
    title: "We could not reach Eventra data",
    message: "A request to Eventra failed. Your work is still safe, and recoverable requests will retry automatically.",
    suggestion: "Check your connection, then retry. If you were editing, keep this tab open until the request succeeds.",
  },
  [ERROR_CATEGORIES.ASSET]: {
    title: "A page file did not load",
    message: "One of the files needed for this screen may be stale or incomplete.",
    suggestion: "Retry once. If it keeps failing, refresh with cache cleanup to download a fresh copy.",
  },
  [ERROR_CATEGORIES.NETWORK]: {
    title: "You appear to be offline",
    message: "Eventra cannot confirm the latest data right now. Cached pages and offline actions may still work.",
    suggestion: "Reconnect to the internet, then retry or refresh this page.",
  },
  [ERROR_CATEGORIES.RUNTIME]: {
    title: "Something went wrong",
    message: "Eventra caught an unexpected problem before it could break the rest of the app.",
    suggestion: "Retry the section. If it happens again, refresh the page and share the error reference with support.",
  },
  [ERROR_CATEGORIES.UNKNOWN]: {
    title: "Something needs a reset",
    message: "Eventra hit an unexpected issue and preserved the technical details for debugging.",
    suggestion: "Try again first. If that does not work, refresh the page.",
  },
};

export function categorizeError(error, metadata = {}) {
  if (metadata.category) return metadata.category;

  const status = error?.status || error?.response?.status || metadata.status;
  const message = String(error?.message || error || "").toLowerCase();
  const source = String(metadata.source || metadata.url || error?.config?.url || "").toLowerCase();

  if (metadata.type === "route" || ROUTE_PATTERN.test(source)) return ERROR_CATEGORIES.ROUTE;
  if (metadata.type === "asset" || ASSET_PATTERN.test(message) || ASSET_PATTERN.test(source)) return ERROR_CATEGORIES.ASSET;
  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
  if (error?.isNetworkError || error?.isTimeout || isOffline || NETWORK_PATTERN.test(message)) {
    return ERROR_CATEGORIES.NETWORK;
  }
  if (metadata.type === "api" || error?.name === "ApiError" || status >= 400 || error?.config) {
    return ERROR_CATEGORIES.API;
  }
  if (error instanceof Error) return ERROR_CATEGORIES.RUNTIME;
  return ERROR_CATEGORIES.UNKNOWN;
}

export function getErrorRecoveryCopy(category) {
  return CATEGORY_COPY[category] || CATEGORY_COPY[ERROR_CATEGORIES.UNKNOWN];
}

export function isRecoverableError(category, error = {}) {
  if ([ERROR_CATEGORIES.ROUTE, ERROR_CATEGORIES.ASSET, ERROR_CATEGORIES.NETWORK].includes(category)) {
    return true;
  }
  if (category === ERROR_CATEGORIES.API) {
    const status = error?.status || error?.response?.status;
    return !status || status === 408 || status === 429 || status >= 500;
  }
  return category === ERROR_CATEGORIES.RUNTIME || category === ERROR_CATEGORIES.UNKNOWN;
}

export function logCategorizedError(error, errorInfo = null, metadata = {}) {
  const category = categorizeError(error, metadata);
  const entry = {
    category,
    recoverable: isRecoverableError(category, error),
    route: typeof window !== "undefined" && window.location ? window.location.pathname : "",
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    ...metadata,
  };

  logError(error instanceof Error ? error : new Error(String(error || "Unknown error")), errorInfo, entry);
  persistErrors("categorized_error_log", {
    ...entry,
    message: error?.message || String(error || "Unknown error"),
    status: error?.status || error?.response?.status || null,
    timestamp: new Date().toISOString(),
  }, 20);

  return entry;
}

export async function invalidateCorruptedAssetCache() {
  if (typeof caches === "undefined") return false;
  const keys = await caches.keys();
  const assetKeys = keys.filter((key) => /asset|vite|workbox|precache|eventra/i.test(key));
  await Promise.all(assetKeys.map((key) => caches.delete(key)));
  return assetKeys.length > 0;
}
