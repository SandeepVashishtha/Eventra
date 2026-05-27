/**
 * Safely parses a JSON string.
 *
 * @param {string} jsonString - The JSON string to parse.
 * @param {any} fallback - The fallback value to return if parsing fails.
 * @returns {any} The parsed object or the fallback value.
 */
export const safeParseJson = (jsonString, fallback = null) => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
};
