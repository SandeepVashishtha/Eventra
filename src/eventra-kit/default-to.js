
/**
 * adds a default-value helper.
 */
export function defaultTo(value, fallback) {
  return value == null ? fallback : value;
}

