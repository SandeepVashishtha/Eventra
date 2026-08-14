/**
 * adds a convert-array helper.
 */
export function convertArray(value) {
  return Array.isArray(value) ? value.slice() : [value];
}

