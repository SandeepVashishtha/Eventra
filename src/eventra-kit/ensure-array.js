/**
 * adds a ensure-array helper.
 */
export function ensureArray(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

