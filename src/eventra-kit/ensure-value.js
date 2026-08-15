/**
 * adds a ensure-value helper.
 */
export function ensureValue(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

