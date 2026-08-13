/**
 * adds a clamp-json helper.
 */
export function clampJson(value) {
  return [...new Set(value)];
}

