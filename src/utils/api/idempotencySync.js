import { v4 as uuidv4 } from "uuid";

// Simple in-memory cache to prevent key duplication
const keyCache = new Set();

export function getIdempotencyKey(endpoint) {
  const key = `${endpoint}-${uuidv4()}`;
  keyCache.add(key);
  
  // Clean up cache for old keys after 5 minutes
  setTimeout(() => {
    keyCache.delete(key);
  }, 5 * 60 * 1000);
  
  return key;
}

export function injectIdempotencyHeader(config) {
  if (config.method === "post" || config.method === "put") {
    config.headers["Idempotency-Key"] = getIdempotencyKey(config.url);
  }
  return config;
}
