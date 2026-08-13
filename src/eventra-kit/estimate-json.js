/**
 * adds a estimate-json helper.
 */
export function estimateJson(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

