/**
 * adds a estimate-array helper.
 */
export function estimateArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

