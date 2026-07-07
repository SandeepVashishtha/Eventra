import { lazy } from "react";

const isChunkLoadFailure = (error) => {
  const message = String(error?.message || error || "");
  return (
    error?.name === "ChunkLoadError" ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  );
};

/**
 * Wrap React.lazy with retry logic and a hard reload when a stale deployment
 * chunk cannot be fetched after retries.
 */
export function lazyWithRetry(importFn, retries = 2, delay = 1000) {
  const retryImport = async () => {
    let attempt = 0;

    while (attempt <= retries) {
      try {
        return await importFn();
      } catch (err) {
        if (isChunkLoadFailure(err) && typeof window !== "undefined") {
          const reloadKey = "eventra:chunk-reload";
          if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, "1");
            window.location.reload();
            return new Promise(() => {});
          }
          sessionStorage.removeItem(reloadKey);
        }

        attempt++;
        if (attempt > retries) {
          console.warn(
            `[lazyWithRetry] Failed to load chunk after ${retries + 1} attempts:`,
            err?.message || err,
          );
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  };

  return lazy(retryImport);
}
