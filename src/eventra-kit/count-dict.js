/**
 * adds a count-dict helper.
 */
export function countDict(value) {
  return value == null ? 0 : Object.keys(value).length;
}

