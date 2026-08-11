 
import { lazy } from "react";

export function lazyWithRetry(importFn, retries = 2, delay = 1000) {
  const retryImport = async () => {
    let attempt = 0;

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
