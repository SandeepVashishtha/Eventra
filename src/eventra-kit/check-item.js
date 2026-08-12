/**
 * adds a check-item helper.
 */
export function checkItem(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

