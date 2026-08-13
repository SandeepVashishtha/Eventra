/**
 * adds a create-object helper.
 */
export function createObject(value, fallback = 0) {
  return value == null ? fallback : value;
}

