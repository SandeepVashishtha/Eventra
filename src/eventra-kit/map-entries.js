
/**
 * adds an entry map helper.
 */
export function mapEntries(obj, fn) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => fn(key, value)));
}

