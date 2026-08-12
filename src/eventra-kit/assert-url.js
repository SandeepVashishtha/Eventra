/**
 * adds a assert-url helper.
 */
export function assertUrl(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

