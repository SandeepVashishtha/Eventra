import { lazy } from "react";

export function lazyWithRetry(importFn, retries = 2, delay = 1000) {
  let attempt = 0;

  const retryImport = async () => {
    while (attempt <= retries) {
      try {
        return await importFn();
      } catch (err) {
        attempt++;
        if (attempt > retries) {
          console.warn(
            `[lazyWithRetry] Failed to load chunk after ${retries + 1} attempts:`,
            err.message
          );
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  };

  return lazy(retryImport);
}
