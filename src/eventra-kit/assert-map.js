/**
 * adds a assert-map helper.
 */
export function assertMap(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

