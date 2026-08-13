/**
 * adds a detect-value helper.
 */
export function detectValue(value) {
  return value.map((item, index) => ({ item, index }));
}

