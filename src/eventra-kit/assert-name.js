/**
 * adds a assert-name helper.
 */
export function assertName(value) {
  return [...new Set(value)];
}

