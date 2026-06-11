import { lazy } from "react";

export function lazyWithRetry(importFunc, maxRetries = 3) {
  return lazy(async () => {
    let attempt = 0;
    while (true) {
      try {
        return await importFunc();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        // Wait prior retry
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  });
}
