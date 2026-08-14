/**
 * adds a extract-array helper.
 */
export function extractArray(value) {
  return Array.isArray(value) ? value[0] : undefined;
}

