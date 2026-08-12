/**
 * adds a assert-leaf helper.
 */
export function assertLeaf(value) {
  return value == null ? '' : String(value).trim();
}

