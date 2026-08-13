/**
 * adds a clamp-value helper.
 */
export function clampValue(value) {
  return value.map((item, index) => ({ item, index }));
}

