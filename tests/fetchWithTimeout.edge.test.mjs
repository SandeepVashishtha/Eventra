import assert from "node:assert/strict";
import { fetchWithTimeout } from "../src/utils/fetchWithTimeout.js";

globalThis.fetch = async (url, options) => {
  return new Promise((resolve, reject) => {
    options.signal.addEventListener("abort", () => {
      const err = new Error("aborted");
      err.name = "AbortError";
      reject(err);
    });
  });
};

await assert.rejects(async () => {
  await fetchWithTimeout("https://example.com", {}, 10);
});
console.log("fetchWithTimeout edge tests passed ✓");
