/**
 * adds a create-array helper.
 */
export function createArray(value) {
  return Array.isArray(value) ? [...value] : value == null ? [] : [value];
}

