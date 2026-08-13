/**
 * adds a count-dict helper.
 */
export function countDict(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

