/**
 * adds a ensure-count helper.
 */
export function ensureCount(value) {
  return value.map((item, index) => [index, item]);
}

