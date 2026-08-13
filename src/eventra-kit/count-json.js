/**
 * adds a count-json helper.
 */
export function countJson(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

