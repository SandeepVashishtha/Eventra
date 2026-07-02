export function safeJsonParse(str, fallback = null, validator = null) {
  if (typeof str !== "string") return fallback;
  try {
    const parsed = JSON.parse(str);
    if (validator && typeof validator === "function") {
      return validator(parsed) ? parsed : fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse JSON from localStorage with error logging and cleanup
 * @param {string} key - localStorage key to parse
 * @param {*} fallback - Value to return on parse failure
 * @returns {*} Parsed value or fallback
 */
export function safeJsonParseFromStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error) {
    console.error(`[safeJsonParseFromStorage] Failed to parse localStorage key "${key}":`, error);
    console.error('[safeJsonParseFromStorage] Removing corrupted entry and returning fallback');
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.error('[safeJsonParseFromStorage] Failed to remove corrupted entry:', removeError);
    }
    return fallback;
  }
}
