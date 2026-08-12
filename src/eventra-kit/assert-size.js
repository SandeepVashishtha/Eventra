/**
 * adds a assert-size helper.
 */
export function assertSize(value) {
  return value == null || String(value).trim() === '';
}

