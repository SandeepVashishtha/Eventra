/* eslint-disable no-console */
import { lazy } from "react";

const RELOAD_KEY = "eventra_chunk_reload_attempts";

/**
 * Checks if an error is caused by a missing chunk / new deployment mismatch.
 */
function isChunkLoadError(error) {
  if (!error) return false;
  const msg = typeof error === "string" ? error : error.message || "";
  return (
    /Loading chunk \d+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    error?.name === "ChunkLoadError"
  );
}

/**
 * Triggers a controlled page reload to fetch new app bundles upon deployment updates.
 */
function handleStaleChunkReload() {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return false;
  }

  const reloaded = sessionStorage.getItem(RELOAD_KEY);
  if (!reloaded) {
    sessionStorage.setItem(RELOAD_KEY, "true");
    window.location.reload();
    return true;
  }
  sessionStorage.removeItem(RELOAD_KEY);
  return false;
}

/**
 * Enhanced React.lazy wrapper featuring exponential backoff retries,
 * preloading support (.preload()), stale deployment recovery, and telemetry hooks.
 *
 * Maintains 100% backward compatibility with signature `lazyWithRetry(importFn, retries, delay)`
 * while offering an options object for advanced settings.
 *
 * @param {Function} importFn - Dynamic import function, e.g., () => import('./MyComponent')
 * @param {Object|number} [optionsOrRetries=2] - Configuration object or retry count
 * @param {number} [legacyDelay=1000] - Delay in ms (used if 2nd argument is a number)
 */
export function lazyWithRetry(importFn, optionsOrRetries = 2, legacyDelay = 1000) {
  // Normalize arguments for full backward compatibility
  const options =
    typeof optionsOrRetries === "number"
      ? { retries: optionsOrRetries, delay: legacyDelay }
      : optionsOrRetries || {};

  const {
    retries = 2,
    delay = 1000,
    exponential = true,
    autoReloadOnStale = true,
    onRetry,
    onError,
  } = options;

  let promiseFactory = null;

  const retryImport = async () => {
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const module = await importFn();
        // Clear reload lock flag upon successful module fetch
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem(RELOAD_KEY);
        }
        return module;
      } catch (err) {
        attempt++;

        // Handle Stale Chunk / Deployment 404 Mismatches
        if (autoReloadOnStale && isChunkLoadError(err)) {
          const isReloading = handleStaleChunkReload();
          if (isReloading) {
            // Keep promise pending while page hard reloads
            return new Promise(() => {});
          }
        }

        if (onRetry && typeof onRetry === "function") {
          onRetry(err, attempt);
        }

        if (attempt > retries) {
          console.warn(
            `[lazyWithRetry] Failed to load chunk after ${retries + 1} attempts:`,
            err?.message || err
          );
          if (onError && typeof onError === "function") {
            onError(err);
          }
          throw err;
        }

        // Calculate backoff delay with random jitter to prevent server stampedes
        const backoffMultiplier = exponential ? Math.pow(2, attempt - 1) : attempt;
        const jitter = Math.random() * 200;
        const calculatedDelay = delay * backoffMultiplier + jitter;

        await new Promise((resolve) => setTimeout(resolve, calculatedDelay));
      }
    }
  };

  const getOrMakePromise = () => {
    if (!promiseFactory) {
      promiseFactory = retryImport();
    }
    return promiseFactory;
  };

  const LazyComponent = lazy(getOrMakePromise);

  // Attach .preload() static method to the lazy component
  LazyComponent.preload = () => {
    getOrMakePromise().catch(() => {
      // Reset cached promise so subsequent render/preload attempts can retry
      promiseFactory = null;
    });
  };

  return LazyComponent;
}

/**
 * Preloads a lazy component when the browser main thread is idle.
 *
 * @param {Object} LazyComponent - Component created via lazyWithRetry
 * @param {number} [timeout=2000] - Max time to wait before forcing load
 */
export function preloadOnIdle(LazyComponent, timeout = 2000) {
  if (typeof window === "undefined" || !LazyComponent?.preload) return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => LazyComponent.preload(), { timeout });
  } else {
    setTimeout(() => LazyComponent.preload(), 1000);
  }
}