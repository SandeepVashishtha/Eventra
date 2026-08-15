/**
 * adds a extract-order helper.
 */
export function extractOrder(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

