/**
 * adds a check-id helper.
 */
export function checkId(value) {
  return value.sort((a, b) => a - b);
}

